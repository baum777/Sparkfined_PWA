import 'fake-indexeddb/auto'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

import { detectBreakout } from '../strategies/breakout'
import { detectVolumeSpike } from '../strategies/volumeSpike'
import { scanForSignals } from '../../signalOrchestrator'
import { SignalDatabase, type SignalRule } from '../../signalDb'
import type { OHLCPoint, OHLCSeries } from '../../types/ohlc'

const buildSeries = (points: OHLCPoint[]): OHLCSeries => ({
  symbol: 'BTC/USDT',
  timeframe: '1h',
  providerId: 'moralis',
  points,
})

const createRule = (override: Partial<SignalRule>): SignalRule => ({
  id: 'rule-1',
  name: 'Test Rule',
  symbol: 'BTC/USDT',
  timeframe: '1h',
  enabled: true,
  strategy: 'breakout',
  params: { lookbackPeriods: 3 },
  createdAt: new Date(0).toISOString(),
  ...override,
})

describe('signal strategies', () => {
  it('returns null when no breakout is present', () => {
    const now = Date.now()
    const series = buildSeries([
      { timestamp: now - 300000, open: 100, high: 110, low: 95, close: 105 },
      { timestamp: now - 200000, open: 105, high: 112, low: 100, close: 108 },
      { timestamp: now - 100000, open: 108, high: 115, low: 107, close: 110 },
      { timestamp: now, open: 109, high: 114, low: 108, close: 112 },
    ])

    const signal = detectBreakout(series, createRule({}))

    expect(signal).toBeNull()
  })

  it('detects bullish breakout when close exceeds lookback high', () => {
    const now = Date.now()
    const series = buildSeries([
      { timestamp: now - 300000, open: 100, high: 110, low: 95, close: 105 },
      { timestamp: now - 200000, open: 105, high: 112, low: 100, close: 108 },
      { timestamp: now - 100000, open: 108, high: 115, low: 107, close: 110 },
      { timestamp: now, open: 111, high: 118, low: 110, close: 120 },
    ])

    const signal = detectBreakout(series, createRule({ params: { lookbackPeriods: 3, breakoutMultiplier: 1 } }))

    expect(signal).not.toBeNull()
    expect(signal?.type).toBe('breakout')
    expect(signal?.ruleId).toBe('rule-1')
    expect(signal?.meta?.direction).toBe('bullish')
    expect(signal?.triggeredAt).toBe(new Date(now).toISOString())
  })

  it('returns null when no volume spike is present', () => {
    const now = Date.now()
    const series = buildSeries([
      { timestamp: now - 300000, open: 100, high: 110, low: 95, close: 105, volume: 50 },
      { timestamp: now - 200000, open: 105, high: 112, low: 100, close: 108, volume: 52 },
      { timestamp: now - 100000, open: 108, high: 115, low: 107, close: 110, volume: 55 },
      { timestamp: now, open: 111, high: 118, low: 110, close: 112, volume: 60 },
    ])

    const signal = detectVolumeSpike(
      series,
      createRule({ id: 'rule-2', strategy: 'volumeSpike', params: { lookbackPeriods: 3, spikeMultiplier: 3 } })
    )

    expect(signal).toBeNull()
  })

  it('detects clear volume spike against the lookback average', () => {
    const now = Date.now()
    const series = buildSeries([
      { timestamp: now - 300000, open: 100, high: 110, low: 95, close: 105, volume: 10 },
      { timestamp: now - 200000, open: 105, high: 112, low: 100, close: 108, volume: 12 },
      { timestamp: now - 100000, open: 108, high: 115, low: 107, close: 110, volume: 11 },
      { timestamp: now, open: 111, high: 118, low: 110, close: 112, volume: 40 },
    ])

    const signal = detectVolumeSpike(
      series,
      createRule({ id: 'rule-3', strategy: 'volumeSpike', params: { lookbackPeriods: 3, spikeMultiplier: 2 } })
    )

    expect(signal).not.toBeNull()
    expect(signal?.type).toBe('volumeSpike')
    expect(signal?.ruleId).toBe('rule-3')
    expect(signal?.meta?.averageVolume).toBeCloseTo((10 + 12 + 11) / 3)
  })
})

describe('scanForSignals orchestrator', () => {
  let db: SignalDatabase

  beforeEach(() => {
    db = new SignalDatabase(`signal-scan-${Date.now()}`)
  })

  afterEach(async () => {
    await db.delete()
  })

  it('persists detected signals for supported strategies', async () => {
    const now = Date.now()
    const breakoutSeries = buildSeries([
      { timestamp: now - 300000, open: 100, high: 110, low: 95, close: 105 },
      { timestamp: now - 200000, open: 105, high: 112, low: 100, close: 108 },
      { timestamp: now - 100000, open: 108, high: 115, low: 107, close: 110 },
      { timestamp: now, open: 111, high: 118, low: 110, close: 120 },
    ])

    const spikeSeries = buildSeries([
      { timestamp: now - 300000, open: 100, high: 110, low: 95, close: 105, volume: 10 },
      { timestamp: now - 200000, open: 105, high: 112, low: 100, close: 108, volume: 12 },
      { timestamp: now - 100000, open: 108, high: 115, low: 107, close: 110, volume: 11 },
      { timestamp: now, open: 111, high: 118, low: 110, close: 112, volume: 40 },
    ])

    const rules: SignalRule[] = [
      createRule({ id: 'breakout-rule' }),
      createRule({ id: 'volume-rule', strategy: 'volumeSpike', params: { lookbackPeriods: 3, spikeMultiplier: 2 } }),
    ]

    const fetchOHLC = vi.fn(async (rule: SignalRule) => (rule.strategy === 'volumeSpike' ? spikeSeries : breakoutSeries))

    const signals = await scanForSignals(rules, fetchOHLC, db)

    expect(fetchOHLC).toHaveBeenCalledTimes(2)
    expect(signals).toHaveLength(2)

    const storedSignals = await db.signals.toArray()
    expect(storedSignals).toHaveLength(2)
    const storedRuleIds = storedSignals.map((s) => s.ruleId).sort()
    expect(storedRuleIds).toEqual(['breakout-rule', 'volume-rule'].sort())
  })

  it('skips failed fetches but continues processing other rules', async () => {
    const now = Date.now()
    const breakoutSeries = buildSeries([
      { timestamp: now - 300000, open: 100, high: 110, low: 95, close: 105 },
      { timestamp: now - 200000, open: 105, high: 112, low: 100, close: 108 },
      { timestamp: now - 100000, open: 108, high: 115, low: 107, close: 110 },
      { timestamp: now, open: 111, high: 118, low: 110, close: 120 },
    ])

    const rules: SignalRule[] = [
      createRule({ id: 'ok-rule' }),
      createRule({ id: 'failing-rule', name: 'Bad rule' }),
    ]

    const fetchOHLC = vi.fn(async (rule: SignalRule) => {
      if (rule.id === 'failing-rule') {
        throw new Error('fetch failed')
      }
      return breakoutSeries
    })

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const signals = await scanForSignals(rules, fetchOHLC, db)

    expect(signals).toHaveLength(1)
    expect(fetchOHLC).toHaveBeenCalledTimes(2)

    const storedSignals = await db.signals.toArray()
    expect(storedSignals).toHaveLength(1)

    consoleSpy.mockRestore()
  })
})

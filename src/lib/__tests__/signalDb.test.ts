import 'fake-indexeddb/auto'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

import {
  SignalDatabase,
  createRule,
  getActiveRules,
  createSignal,
  getSignalsForSymbol,
  markSignalTriggered,
  type Signal,
  type SignalRule,
} from '../signalDb'

const createTestDb = () => new SignalDatabase(`signal-db-test-${Date.now()}-${Math.random()}`)

const baseRule: Omit<SignalRule, 'id' | 'createdAt'> = {
  name: 'Breakout BTC',
  symbol: 'BTC/USDT',
  timeframe: '1h',
  enabled: true,
  strategy: 'breakout',
  params: { lookbackPeriods: 5 },
}

const baseSignal: Omit<Signal, 'id' | 'triggeredAt'> = {
  symbol: 'BTC/USDT',
  ruleId: 'rule-1',
  type: 'breakout',
  meta: { close: 50000 },
}

describe('signalDb', () => {
  let db: SignalDatabase

  beforeEach(() => {
    db = createTestDb()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('creates rules and returns only enabled rules', async () => {
    const disabledRule = await createRule({ ...baseRule, enabled: false, name: 'Muted', symbol: 'ETH/USDT' }, db)
    const activeRule = await createRule(baseRule, db)

    const rules = await getActiveRules(db)

    expect(rules).toHaveLength(1)
    const [rule] = rules
    expect(rule?.id).toBe(activeRule.id)
    expect(rule?.enabled).toBe(true)
    expect(rules.find((candidate) => candidate.id === disabledRule.id)).toBeUndefined()
  })

  it('creates signals and returns them for a symbol with optional limit', async () => {
    const first = await createSignal(baseSignal, db)
    const second = await createSignal({ ...baseSignal, meta: { close: 50500 } }, db)
    const third = await createSignal({ ...baseSignal, meta: { close: 51000 } }, db)

    const allSignals = await getSignalsForSymbol(baseSignal.symbol, undefined, db)
    expect(allSignals).toHaveLength(3)
    const [latest,, earliest] = allSignals
    expect(latest?.id).toBe(third.id)
    expect(earliest?.id).toBe(first.id)

    const limitedSignals = await getSignalsForSymbol(baseSignal.symbol, { limit: 2 }, db)
    expect(limitedSignals).toHaveLength(2)
    expect(limitedSignals.map((s) => s.id)).toEqual([third.id, second.id])
  })

  it('updates trigger timestamp when marking a signal as triggered', async () => {
    const signal = await createSignal(baseSignal, db)
    const newTimestamp = new Date(Date.now() + 1000).toISOString()

    await markSignalTriggered(signal.id, newTimestamp, db)

    const [updated] = await getSignalsForSymbol(baseSignal.symbol, { limit: 1 }, db)
    expect(updated?.triggeredAt).toBe(newTimestamp)
    expect(updated?.resolvedAt).toBeUndefined()
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'

import { fetchOHLCFromDexScreener } from '@/lib/adapters/dexscreenerOHLCAdapter'
import { fetchOHLCFromMoralis } from '@/lib/adapters/moralisOHLCAdapter'
import { OHLCProviderError } from '@/lib/types/ohlc'
import { timeframeToInterval } from '@/lib/utils/ohlcTimeframe'
import { moralisFetch } from '@/lib/moralisProxy'

vi.mock('@/lib/moralisProxy', () => ({
  moralisFetch: vi.fn(),
}))

describe('timeframeToInterval', () => {
  it('maps supported timeframes to provider intervals', () => {
    expect(timeframeToInterval('1m')).toBe(1)
    expect(timeframeToInterval('5m')).toBe(5)
    expect(timeframeToInterval('1h')).toBe(60)
    expect(timeframeToInterval('1d')).toBe('1d')
    expect(timeframeToInterval('30s')).toBe('30s')
  })
})

describe('moralisOHLCAdapter', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('normalizes successful responses into OHLCProviderResult', async () => {
    const mockRows = [
      { time: 1_700_000_000, open: 1, high: 2, low: 0.5, close: 1.5, volume: 10 },
      { timestamp: 1_700_000_060_000, o: 1.5, h: 2.5, l: 1.25, c: 2, v: 8 },
    ]

    vi.mocked(moralisFetch).mockResolvedValue({ data: { items: mockRows } })

    const result = await fetchOHLCFromMoralis({ symbol: 'SOL', timeframe: '1m', limit: 50 })

    expect(result.providerId).toBe('moralis')
    expect(result.series.points).toHaveLength(2)
    expect(result.series.points[0]).toMatchObject({
      timestamp: 1_700_000_000_000,
      open: 1,
      high: 2,
      low: 0.5,
      close: 1.5,
      volume: 10,
    })
    expect(result.series.timeframe).toBe('1m')
    expect(result.series.metadata?.limit).toBe(50)
  })

  it('wraps upstream failures in OHLCProviderError', async () => {
    vi.mocked(moralisFetch).mockRejectedValue(new Error('rate limited'))

    await expect(fetchOHLCFromMoralis({ symbol: 'SOL', timeframe: '1m' })).rejects.toBeInstanceOf(OHLCProviderError)
  })
})

describe('dexscreenerOHLCAdapter', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.clearAllMocks()
  })

  it('normalizes successful responses into OHLCProviderResult', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        candles: [{ timestamp: 1_700_000_000, open: 1.1, high: 2.1, low: 1, close: 1.9, volume: 5 }],
      }),
    })

    vi.stubGlobal('fetch', fetchSpy)

    const result = await fetchOHLCFromDexScreener({ symbol: 'SOL', timeframe: '1m', limit: 25 })

    expect(fetchSpy).toHaveBeenCalled()
    expect(result.providerId).toBe('dexscreener')
    expect(result.series.points[0]).toMatchObject({
      timestamp: 1_700_000_000_000,
      open: 1.1,
      high: 2.1,
      low: 1,
      close: 1.9,
      volume: 5,
    })
    expect(result.series.metadata?.limit).toBe(25)
  })

  it('wraps fetch failures in OHLCProviderError', async () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error('network down'))
    vi.stubGlobal('fetch', fetchSpy)

    await expect(fetchOHLCFromDexScreener({ symbol: 'SOL', timeframe: '5m' })).rejects.toBeInstanceOf(OHLCProviderError)
  })

  it('treats empty payloads as provider errors', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({ candles: [] }) })
    vi.stubGlobal('fetch', fetchSpy)

    await expect(fetchOHLCFromDexScreener({ symbol: 'SOL', timeframe: '15m' })).rejects.toBeInstanceOf(OHLCProviderError)
  })
})

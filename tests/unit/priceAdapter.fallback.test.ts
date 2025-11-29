import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchTokenCandles, resetAdapterState } from '@/lib/priceAdapter'

describe('fetchTokenCandles', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    resetAdapterState()
    vi.unstubAllGlobals()
    if (originalFetch) {
      globalThis.fetch = originalFetch
    }
  })

  it('returns DexPaprika candles when the primary provider succeeds', async () => {
    const timestamp = new Date().toISOString()
    const dpCandles = [
      { timestamp, open: '1', high: '2', low: '0.5', close: '1.5', volume: '100' },
    ]

    const fetchMock = vi.mocked(globalThis.fetch as unknown as typeof fetch)
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify(dpCandles), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )

    const candles = await fetchTokenCandles('solana', 'So11111111111111111111111111111111111111112', { limit: 10 })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining('/networks/solana/tokens/So11111111111111111111111111111111111111112/ohlcv'),
      expect.objectContaining({ method: 'GET' })
    )
    expect(candles).toBeDefined()
    expect(Array.isArray(candles)).toBe(true)
    expect(candles.length).toBeGreaterThan(0)
    expect(candles).toHaveLength(1)

    const primaryCandle = candles[0]
    if (!primaryCandle) {
      throw new Error('Expected at least one candle from DexPaprika response')
    }
    expect(primaryCandle.open).toBeCloseTo(1)
    expect(primaryCandle.high).toBeCloseTo(2)
  })

  it('falls back to the Moralis proxy when DexPaprika fails', async () => {
    const timestamp = new Date().toISOString()
    const moralisCandles = [
      { time: timestamp, open: '1', high: '2', low: '0.5', close: '1.2', volume: '42' },
    ]

    const fetchMock = vi.mocked(globalThis.fetch as unknown as typeof fetch)
    fetchMock
      .mockResolvedValueOnce(
        new Response('server error', {
          status: 500,
          headers: { 'content-type': 'application/json' },
        })
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(moralisCandles), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      )

    const candles = await fetchTokenCandles('solana', 'So11111111111111111111111111111111111111112')

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(fetchMock.mock.calls[1]?.[0]).toContain('/api/moralis/token')
    expect(candles).toBeDefined()
    expect(Array.isArray(candles)).toBe(true)
    expect(candles.length).toBeGreaterThan(0)
    expect(candles).toHaveLength(1)

    const fallbackCandle = candles[0]
    if (!fallbackCandle) {
      throw new Error('Expected at least one candle from Moralis response')
    }
    expect(fallbackCandle.close).toBeCloseTo(1.2)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchFromProviderChain,
  getMarketSnapshot,
  getTokenSnapshot,
  providerHealthTracker,
  resetMarketOrchestratorState,
} from '../marketOrchestrator'
import type { MarketSnapshot } from '@/types/market'
import { Telemetry } from '@/lib/TelemetryService'

vi.mock('../../adapters/dexpaprikaAdapter', () => ({
  getDexPaprikaSnapshot: vi.fn(),
}))

vi.mock('../../adapters/moralisAdapter', () => ({
  getMoralisSnapshot: vi.fn(),
}))

vi.mock('../../adapters/dexscreenerAdapter', () => ({
  getDexscreenerToken: vi.fn(),
}))

import { getDexPaprikaSnapshot } from '../../adapters/dexpaprikaAdapter'
import { getMoralisSnapshot } from '../../adapters/moralisAdapter'
import { getDexscreenerToken } from '../../adapters/dexscreenerAdapter'

const MOCK_SNAPSHOT: MarketSnapshot = {
  token: {
    address: 'test123',
    symbol: 'TEST',
    name: 'Test Token',
    chain: 'solana',
  },
  price: {
    current: 1.0,
    high24h: 1.1,
    low24h: 0.9,
    change24h: 5.0,
  },
  volume: {
    volume24h: 100000,
  },
  liquidity: {
    total: 500000,
  },
  metadata: {
    provider: 'dexpaprika',
    timestamp: Date.now(),
    cached: false,
    confidence: 0.9,
  },
}

describe('marketOrchestrator', () => {
  beforeEach(() => {
    resetMarketOrchestratorState()
    Telemetry.clear()
    vi.clearAllMocks()
  })

  it('fetches from provider chain on cache miss', async () => {
    vi.mocked(getMoralisSnapshot).mockResolvedValue({
      success: true,
      data: MOCK_SNAPSHOT,
      metadata: { provider: 'moralis', cached: false, latency: 100, retries: 0 },
    })

    const snapshot = await fetchFromProviderChain({ address: 'test123', chain: 'solana' })

    expect(snapshot.provider).toBe('moralis')
    expect(getMoralisSnapshot).toHaveBeenCalledTimes(1)
  })

  it('returns cached value when fresh and avoids extra provider calls', async () => {
    vi.mocked(getMoralisSnapshot).mockResolvedValue({
      success: true,
      data: MOCK_SNAPSHOT,
      metadata: { provider: 'moralis', cached: false, latency: 50, retries: 0 },
    })

    const first = await getTokenSnapshot({ address: 'test123', chain: 'solana' })
    const second = await getTokenSnapshot({ address: 'test123', chain: 'solana' })

    expect(first.provider).toBe('moralis')
    expect(second.cached).toBe(true)
    expect(getMoralisSnapshot).toHaveBeenCalledTimes(1)
  })

  it('forces refresh when requested', async () => {
    vi.mocked(getMoralisSnapshot)
      .mockResolvedValueOnce({
        success: true,
        data: { ...MOCK_SNAPSHOT, price: { ...MOCK_SNAPSHOT.price, current: 1 } },
        metadata: { provider: 'moralis', cached: false, latency: 20, retries: 0 },
      })
      .mockResolvedValueOnce({
        success: true,
        data: { ...MOCK_SNAPSHOT, price: { ...MOCK_SNAPSHOT.price, current: 2 } },
        metadata: { provider: 'moralis', cached: false, latency: 30, retries: 0 },
      })

    const first = await getTokenSnapshot({ address: 'test123', chain: 'solana' })
    const refreshed = await getTokenSnapshot({ address: 'test123', chain: 'solana' }, {
      forceRefresh: true,
    })

    expect(first.price).toBe(1)
    expect(refreshed.price).toBe(2)
    expect(getMoralisSnapshot).toHaveBeenCalledTimes(2)
  })

  it('falls back to next provider when primary fails', async () => {
    vi.mocked(getMoralisSnapshot).mockRejectedValue(new Error('moralis down'))
    vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
      success: true,
      data: { ...MOCK_SNAPSHOT, metadata: { ...MOCK_SNAPSHOT.metadata, provider: 'dexpaprika' } },
      metadata: { provider: 'dexpaprika', cached: false, latency: 40, retries: 0 },
    })

    const snapshot = await getTokenSnapshot({ address: 'test123', chain: 'solana' }, {
      forceRefresh: true,
    })

    expect(snapshot.provider).toBe('dexpaprika')
    expect(providerHealthTracker.getHealth('moralis').failureCount).toBe(1)
  })

  it('prioritizes providers with better health and latency', async () => {
    providerHealthTracker.recordSuccess('dexscreener', 80)
    providerHealthTracker.recordFailure('moralis', new Error('bad'))
    providerHealthTracker.recordFailure('dexpaprika', new Error('bad'))

    vi.mocked(getDexscreenerToken).mockResolvedValue({
      address: 'test123',
      symbol: 'TEST',
      chain: 'solana',
      price: 2,
      high24: 0,
      low24: 0,
      vol24: 500,
      liquidity: 1000,
      marketCap: 2000,
      priceChange24h: 3,
      timestamp: Date.now(),
    })

    const snapshot = await fetchFromProviderChain({ address: 'test123', chain: 'solana' })

    expect(snapshot.provider).toBe('dexscreener')
    expect(getMoralisSnapshot).not.toHaveBeenCalled()
  })

  it('logs telemetry for provider usage', async () => {
    vi.mocked(getMoralisSnapshot).mockResolvedValue({
      success: true,
      data: MOCK_SNAPSHOT,
      metadata: { provider: 'moralis', cached: false, latency: 20, retries: 0 },
    })

    await getTokenSnapshot({ address: 'test123', chain: 'solana' })
    const events = Telemetry.dump().events.filter((event) => event.name === 'market.provider.used')

    expect(events.length).toBeGreaterThan(0)
    expect(events[0]?.metadata?.providerId).toBe('moralis')
    expect(events[0]?.metadata?.state).toBe('miss')
  })

  it('returns cached snapshot when calling getMarketSnapshot alias', async () => {
    vi.mocked(getMoralisSnapshot).mockResolvedValue({
      success: true,
      data: MOCK_SNAPSHOT,
      metadata: { provider: 'moralis', cached: false, latency: 10, retries: 0 },
    })

    await getMarketSnapshot('test123', 'solana')
    const cached = await getMarketSnapshot('test123', 'solana')

    expect(cached.cached).toBe(true)
    expect(getMoralisSnapshot).toHaveBeenCalledTimes(1)
  })
})

/**
 * DexPaprika Adapter Unit Tests
 *
 * Tests:
 * - Normalization of raw API responses to MarketSnapshot
 * - Timeout handling
 * - Rate limit / 429 retry logic
 * - Cache behavior (hit/miss/TTL)
 * - Confidence scoring
 *
 * @module lib/adapters/__tests__/dexpaprikaAdapter.test
 */

 

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DexPaprikaTokenResponse } from '../../../types/market'
import {
  getDexPaprikaSnapshot,
  clearDexPaprikaCache,
  getDexPaprikaCacheStats,
} from '../dexpaprikaAdapter'

// ============================================================================
// FIXTURES
// ============================================================================

const MOCK_DEXPAPRIKA_RESPONSE: DexPaprikaTokenResponse = {
  contract_address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  symbol: 'USDC',
  name: 'USD Coin',
  chain: 'solana',
  decimals: 6,
  price_usd: 1.0,
  price_change_24h: 0.05,
  high_24h: 1.002,
  low_24h: 0.998,
  volume_24h: 15000000,
  volume_change_24h: 3.5,
  liquidity_usd: 50000000,
  market_cap: 25000000000,
  fdv: 25000000000,
  holders: 1500000,
  pairs: [
    {
      dex_name: 'Raydium',
      pair_address: '58oQChx4yWmvKdwLLZzBi4ChoCc2fqCUWBkwMihLYQo2',
      base_token: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
      quote_token: 'So11111111111111111111111111111111111111112',
      liquidity_usd: 25000000,
      volume_24h: 8000000,
      price_usd: 1.0,
    },
  ],
  last_updated: new Date().toISOString(),
}

// ============================================================================
// TESTS
// ============================================================================

describe('DexPaprika Adapter', () => {
  beforeEach(() => {
    // Clear cache before each test
    clearDexPaprikaCache()
    // Reset fetch mock
    vi.restoreAllMocks()
  })

  describe('Normalization', () => {
    it('should normalize DexPaprika response to MarketSnapshot schema', async () => {
      // Mock fetch
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DEXPAPRIKA_RESPONSE,
      }) as any

      const result = await getDexPaprikaSnapshot(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'solana'
      )

      expect(result.success).toBe(true)
      expect(result.data).toBeDefined()

      const snapshot = result.data!

      // Token identity
      expect(snapshot.token.address).toBe('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
      expect(snapshot.token.symbol).toBe('USDC')
      expect(snapshot.token.name).toBe('USD Coin')
      expect(snapshot.token.chain).toBe('solana')
      expect(snapshot.token.decimals).toBe(6)

      // Price data
      expect(snapshot.price.current).toBe(1.0)
      expect(snapshot.price.high24h).toBe(1.002)
      expect(snapshot.price.low24h).toBe(0.998)
      expect(snapshot.price.change24h).toBe(0.05)

      // Volume
      expect(snapshot.volume.volume24h).toBe(15000000)
      expect(snapshot.volume.volumeChange24h).toBe(3.5)

      // Liquidity
      expect(snapshot.liquidity.total).toBe(50000000)

      // Market data
      expect(snapshot.marketCap).toBe(25000000000)
      expect(snapshot.fdv).toBe(25000000000)
      expect(snapshot.holders).toBe(1500000)

      // Pairs
      expect(snapshot.pairs).toHaveLength(1)
      expect(snapshot.pairs?.[0]?.dex).toBe('Raydium')
      expect(snapshot.pairs?.[0]?.liquidity).toBe(25000000)

      // Metadata
      expect(snapshot.metadata.provider).toBe('dexpaprika')
      expect(snapshot.metadata.cached).toBe(false)
      expect(snapshot.metadata.confidence).toBeGreaterThan(0.5)
    })

    it('should handle minimal response data', async () => {
      const minimalResponse: DexPaprikaTokenResponse = {
        contract_address: 'test123',
        symbol: 'TEST',
        name: 'Test Token',
        chain: 'solana',
        decimals: 9,
        price_usd: 0.001,
        price_change_24h: 0,
        high_24h: 0.001,
        low_24h: 0.001,
        volume_24h: 0,
        liquidity_usd: 0,
        last_updated: new Date().toISOString(),
      }

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => minimalResponse,
      }) as any

      const result = await getDexPaprikaSnapshot('test123', 'solana')

      expect(result.success).toBe(true)
      expect(result.data?.token.symbol).toBe('TEST')
      expect(result.data?.metadata.confidence).toBeLessThan(0.8) // Low confidence for minimal data
    })
  })

  describe('Cache Behavior', () => {
    it('should cache successful responses', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DEXPAPRIKA_RESPONSE,
      })
      globalThis.fetch = mockFetch as any

      // First call - should hit API
      const result1 = await getDexPaprikaSnapshot(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'solana'
      )
      expect(result1.success).toBe(true)
      expect(result1.metadata.cached).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Second call - should hit cache
      const result2 = await getDexPaprikaSnapshot(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'solana'
      )
      expect(result2.success).toBe(true)
      expect(result2.metadata.cached).toBe(true)
      expect(mockFetch).toHaveBeenCalledTimes(1) // No additional fetch

      // Verify cache stats
      const stats = getDexPaprikaCacheStats()
      expect(stats.size).toBe(1)
    })

    it('should bypass cache with forceRefresh', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DEXPAPRIKA_RESPONSE,
      })
      globalThis.fetch = mockFetch as any

      // First call
      await getDexPaprikaSnapshot('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', 'solana')

      // Force refresh
      const result = await getDexPaprikaSnapshot(
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
        'solana',
        true
      )

      expect(result.metadata.cached).toBe(false)
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })

    it('should handle cache eviction (LRU)', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DEXPAPRIKA_RESPONSE,
      }) as any

      // Fill cache with 100+ entries (exceeds maxSize)
      for (let i = 0; i < 105; i++) {
        await getDexPaprikaSnapshot(`address${i}`, 'solana')
      }

      const stats = getDexPaprikaCacheStats()
      expect(stats.size).toBeLessThanOrEqual(stats.maxSize)
    })
  })

  describe('Error Handling', () => {
    it(
      'should handle timeout',
      async () => {
        // Mock slow response
        globalThis.fetch = vi.fn().mockImplementation(
          () =>
            new Promise((resolve) => {
              setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 10000) // 10s delay
            })
        ) as any

        const result = await getDexPaprikaSnapshot('test', 'solana')

        expect(result.success).toBe(false)
        // Timeout is caught as NETWORK_ERROR after retries
        expect(result.error?.code).toMatch(/TIMEOUT|NETWORK_ERROR/)
      },
      10000
    ) // 10s test timeout

    it('should handle 429 rate limit with retry', async () => {
      let callCount = 0
      globalThis.fetch = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call fails with 429
          return Promise.resolve({
            ok: false,
            status: 429,
            statusText: 'Too Many Requests',
          })
        } else {
          // Retry succeeds
          return Promise.resolve({
            ok: true,
            json: async () => MOCK_DEXPAPRIKA_RESPONSE,
          })
        }
      }) as any

      const result = await getDexPaprikaSnapshot('test', 'solana')

      expect(result.success).toBe(true)
      expect(callCount).toBeGreaterThan(1) // Retry happened
    })

    it(
      'should handle 404 not found',
      async () => {
        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: false,
          status: 404,
          statusText: 'Not Found',
        }) as any

        const result = await getDexPaprikaSnapshot('invalid_address', 'solana')

        expect(result.success).toBe(false)
        expect(result.error?.code).toBe('NETWORK_ERROR')
      },
      10000
    )

    it(
      'should handle network error',
      async () => {
        globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network failure')) as any

        const result = await getDexPaprikaSnapshot('test', 'solana')

        expect(result.success).toBe(false)
        expect(result.error?.message).toContain('Network failure')
      },
      10000
    )
  })

  describe('Confidence Scoring', () => {
    it('should give high confidence for complete data', async () => {
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => MOCK_DEXPAPRIKA_RESPONSE,
      }) as any

      const result = await getDexPaprikaSnapshot('test', 'solana')

      expect(result.data?.metadata.confidence).toBeGreaterThan(0.8)
    })

    it('should give low confidence for incomplete data', async () => {
      const incompleteResponse: DexPaprikaTokenResponse = {
        contract_address: 'test',
        symbol: 'TEST',
        name: 'Test',
        chain: 'solana',
        decimals: 9,
        price_usd: 0,
        price_change_24h: 0,
        high_24h: 0,
        low_24h: 0,
        volume_24h: 0,
        liquidity_usd: 0,
        last_updated: new Date().toISOString(),
      }

      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => incompleteResponse,
      }) as any

      const result = await getDexPaprikaSnapshot('test', 'solana')

      expect(result.data?.metadata.confidence).toBeLessThan(0.6)
    })
  })

  describe('Chain Normalization', () => {
    it('should normalize various chain identifiers', async () => {
      const responses = [
        { chain: 'sol', expected: 'solana' },
        { chain: 'solana', expected: 'solana' },
        { chain: 'eth', expected: 'ethereum' },
        { chain: 'ethereum', expected: 'ethereum' },
        { chain: 'bsc', expected: 'bsc' },
        { chain: 'unknown', expected: 'solana' }, // Default
      ]

      for (const { chain, expected } of responses) {
        const response = { ...MOCK_DEXPAPRIKA_RESPONSE, chain }
        globalThis.fetch = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => response,
        }) as any

        // Clear cache before each iteration
        clearDexPaprikaCache()

        const result = await getDexPaprikaSnapshot('test_' + chain, 'solana')
        expect(result.data?.token.chain).toBe(expected)
      }
    })
  })
})

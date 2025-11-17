/**
 * Market Orchestrator Unit Tests
 *
 * Tests:
 * - Feature-flag routing (primary selection)
 * - Fallback chain execution
 * - Timeout handling
 * - Telemetry logging
 * - Provider switch detection
 *
 * @module lib/data/__tests__/marketOrchestrator.test
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  getMarketSnapshot,
  getOrchestratorConfig,
  getOrchestratorTelemetry,
  clearOrchestratorTelemetry,
} from '../marketOrchestrator'
import type { MarketSnapshot } from '../../../types/market'

// ============================================================================
// MOCKS
// ============================================================================

// Mock all adapters
vi.mock('../../adapters/dexpaprikaAdapter', () => ({
  getDexPaprikaSnapshot: vi.fn(),
}))

vi.mock('../../adapters/moralisAdapter', () => ({
  getMoralisSnapshot: vi.fn(),
}))

vi.mock('../../adapters/dexscreenerAdapter', () => ({
  getDexscreenerToken: vi.fn(),
}))

vi.mock('../../adapters/pumpfunAdapter', () => ({
  getPumpfunData: vi.fn(),
}))

import { getDexPaprikaSnapshot } from '../../adapters/dexpaprikaAdapter'
import { getMoralisSnapshot } from '../../adapters/moralisAdapter'
import { getDexscreenerToken } from '../../adapters/dexscreenerAdapter'
import { getPumpfunData } from '../../adapters/pumpfunAdapter'

// ============================================================================
// FIXTURES
// ============================================================================

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

// ============================================================================
// TESTS
// ============================================================================

describe('Market Orchestrator', () => {
  beforeEach(() => {
    clearOrchestratorTelemetry()
    vi.clearAllMocks()
  })

  describe('Configuration', () => {
    it('should load config from environment', () => {
      const config = getOrchestratorConfig()

      expect(config.primary).toBeDefined()
      expect(config.fallbacks).toBeInstanceOf(Array)
      expect(config.timeout).toBeGreaterThan(0)
    })
  })

  describe('Primary Provider Success', () => {
    it('should use primary provider (DexPaprika) when successful', async () => {
      // Mock successful DexPaprika response
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: true,
        data: MOCK_SNAPSHOT,
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 100,
          retries: 0,
        },
      })

      const result = await getMarketSnapshot('test123', 'solana')

      expect(result.snapshot).toBeDefined()
      expect(result.provider).toBe('dexpaprika')
      expect(result.fallbackUsed).toBe(false)
      expect(result.attempts).toBe(1)
      expect(getDexPaprikaSnapshot).toHaveBeenCalledTimes(1)
    })

    it('should not call fallback providers when primary succeeds', async () => {
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: true,
        data: MOCK_SNAPSHOT,
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 100,
          retries: 0,
        },
      })

      await getMarketSnapshot('test123', 'solana')

      expect(getMoralisSnapshot).not.toHaveBeenCalled()
      expect(getDexscreenerToken).not.toHaveBeenCalled()
      expect(getPumpfunData).not.toHaveBeenCalled()
    })
  })

  describe('Fallback Chain', () => {
    it('should fall back to next provider when primary fails', async () => {
      // Primary fails
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timeout',
          provider: 'dexpaprika',
          timestamp: Date.now(),
        },
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 5000,
          retries: 0,
        },
      })

      // Fallback succeeds (Dexscreener)
      vi.mocked(getDexscreenerToken).mockResolvedValue({
        address: 'test123',
        symbol: 'TEST',
        name: 'Test Token',
        chain: 'solana',
        price: 1.0,
        high24: 1.1,
        low24: 0.9,
        vol24: 100000,
        liquidity: 500000,
        marketCap: 1000000,
        priceChange24h: 5.0,
        timestamp: Date.now(),
      })

      const result = await getMarketSnapshot('test123', 'solana')

      expect(result.snapshot).toBeDefined()
      expect(result.provider).toBe('dexscreener')
      expect(result.fallbackUsed).toBe(true)
      expect(result.attempts).toBeGreaterThan(1)
    })

    it('should try all providers in fallback chain', async () => {
      // All providers fail except last
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error',
          provider: 'dexpaprika',
          timestamp: Date.now(),
        },
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 1000,
          retries: 0,
        },
      })

      vi.mocked(getDexscreenerToken).mockRejectedValue(new Error('Failed'))

      // Pump.fun succeeds
      vi.mocked(getPumpfunData).mockResolvedValue({
        name: 'Test Token',
        symbol: 'TEST',
        liquidity: 500000,
        launchDate: new Date().toISOString(),
        bondingCurve: 0.5,
        creatorAddress: 'creator123',
        socialLinks: {
          website: 'https://test.com',
          twitter: 'https://twitter.com/test',
        },
      })

      const result = await getMarketSnapshot('test123', 'solana')

      expect(result.snapshot).toBeDefined()
      expect(result.provider).toBe('pumpfun')
      expect(result.fallbackUsed).toBe(true)
    })

    it('should return null when all providers fail', async () => {
      // All providers fail
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Network error',
          provider: 'dexpaprika',
          timestamp: Date.now(),
        },
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 1000,
          retries: 0,
        },
      })

      vi.mocked(getDexscreenerToken).mockRejectedValue(new Error('Failed'))
      vi.mocked(getPumpfunData).mockRejectedValue(new Error('Failed'))

      const result = await getMarketSnapshot('test123', 'solana')

      expect(result.snapshot).toBeNull()
      expect(result.attempts).toBeGreaterThan(1)
    })
  })

  describe('Telemetry', () => {
    it('should log provider success events', async () => {
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: true,
        data: MOCK_SNAPSHOT,
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 100,
          retries: 0,
        },
      })

      await getMarketSnapshot('test123', 'solana')

      const events = getOrchestratorTelemetry()
      const successEvents = events.filter((e) => e.type === 'provider_success')

      expect(successEvents.length).toBeGreaterThan(0)
      expect(successEvents[0]?.provider).toBe('dexpaprika')
    })

    it('should log provider failure events', async () => {
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Timeout',
          provider: 'dexpaprika',
          timestamp: Date.now(),
        },
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 5000,
          retries: 0,
        },
      })

      vi.mocked(getDexscreenerToken).mockResolvedValue({
        address: 'test123',
        symbol: 'TEST',
        name: 'Test Token',
        chain: 'solana',
        price: 1.0,
        high24: 1.1,
        low24: 0.9,
        vol24: 100000,
        liquidity: 500000,
        marketCap: 1000000,
        priceChange24h: 5.0,
        timestamp: Date.now(),
      })

      await getMarketSnapshot('test123', 'solana')

      const events = getOrchestratorTelemetry()
      const failureEvents = events.filter((e) => e.type === 'provider_failure')

      expect(failureEvents.length).toBeGreaterThan(0)
      expect(failureEvents[0]?.provider).toBe('dexpaprika')
    })

    it('should log provider switch events when fallback is used', async () => {
      vi.mocked(getDexPaprikaSnapshot).mockResolvedValue({
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed',
          provider: 'dexpaprika',
          timestamp: Date.now(),
        },
        metadata: {
          provider: 'dexpaprika',
          cached: false,
          latency: 1000,
          retries: 0,
        },
      })

      vi.mocked(getDexscreenerToken).mockResolvedValue({
        address: 'test123',
        symbol: 'TEST',
        name: 'Test Token',
        chain: 'solana',
        price: 1.0,
        high24: 1.1,
        low24: 0.9,
        vol24: 100000,
        liquidity: 500000,
        marketCap: 1000000,
        priceChange24h: 5.0,
        timestamp: Date.now(),
      })

      await getMarketSnapshot('test123', 'solana')

      const events = getOrchestratorTelemetry()
      const switchEvents = events.filter((e) => e.type === 'provider_switch')

      expect(switchEvents.length).toBeGreaterThan(0)
      expect(switchEvents[0]?.provider).toBe('dexscreener')
    })
  })

  describe('Performance', () => {
    it('should track total latency across all attempts', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2025-01-01T00:00:00.000Z'))

      try {
        vi.mocked(getDexPaprikaSnapshot).mockImplementation(
          () =>
            new Promise((resolve) =>
              setTimeout(
                () =>
                  resolve({
                    success: true,
                    data: MOCK_SNAPSHOT,
                    metadata: {
                      provider: 'dexpaprika',
                      cached: false,
                      latency: 100,
                      retries: 0,
                    },
                  }),
                100
              )
            )
        )

        const resultPromise = getMarketSnapshot('test123', 'solana')

        await vi.advanceTimersByTimeAsync(100)
        const result = await resultPromise

        expect(result.totalLatency).toBeGreaterThan(0)
        expect(result.totalLatency).toBe(100)
      } finally {
        vi.clearAllTimers()
        vi.useRealTimers()
      }
    })
  })
})

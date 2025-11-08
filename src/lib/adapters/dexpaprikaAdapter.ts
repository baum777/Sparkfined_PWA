/**
 * DexPaprika Adapter - Beta Primary Provider
 *
 * Fetches Solana token/pool data from DexPaprika API
 * Normalizes responses to MarketSnapshot schema
 *
 * Features:
 * - Schema-first normalization
 * - Timeout & retry logic
 * - In-memory LRU cache (5-15 min TTL)
 * - Telemetry/logging
 *
 * @module lib/adapters/dexpaprikaAdapter
 */

import type {
  MarketSnapshot,
  DexPaprikaTokenResponse,
  AdapterConfig,
  AdapterResponse,
  ChainId,
} from '../../types/market'
import { ENV } from '@/config/env'

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: AdapterConfig = {
  baseUrl: ENV.DEXPAPRIKA_BASE_URL || 'https://api.dexpaprika.com',
  timeout: 5000, // 5s timeout
  retries: 2,
  cacheTtl: 15 * 60 * 1000, // 15 min cache TTL
}

// ============================================================================
// IN-MEMORY CACHE (LRU)
// ============================================================================

interface CacheEntry {
  data: MarketSnapshot
  timestamp: number
}

class LRUCache {
  private cache = new Map<string, CacheEntry>()
  private maxSize = 100 // Max 100 entries
  private ttl: number

  constructor(ttl: number) {
    this.ttl = ttl
  }

  get(key: string): MarketSnapshot | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const isExpired = Date.now() - entry.timestamp > this.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    // Move to end (LRU update)
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry.data
  }

  set(key: string, data: MarketSnapshot): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) this.cache.delete(firstKey)
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

const cache = new LRUCache(DEFAULT_CONFIG.cacheTtl)

// ============================================================================
// API CLIENT
// ============================================================================

/**
 * Fetch token data from DexPaprika API with timeout & retry
 */
async function fetchWithRetry(
  url: string,
  config: AdapterConfig,
  attempt = 1
): Promise<DexPaprikaTokenResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (config.apiKey) {
      headers['X-API-Key'] = config.apiKey
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 429 && attempt <= config.retries) {
        // Rate limit - exponential backoff
        const delay = Math.pow(2, attempt) * 1000
        await new Promise((resolve) => setTimeout(resolve, delay))
        return fetchWithRetry(url, config, attempt + 1)
      }

      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)

    // Retry on network error
    if (attempt <= config.retries && error instanceof Error) {
      const delay = Math.pow(2, attempt) * 1000
      await new Promise((resolve) => setTimeout(resolve, delay))
      return fetchWithRetry(url, config, attempt + 1)
    }

    throw error
  }
}

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalize DexPaprika response to MarketSnapshot schema
 */
function normalizeDexPaprikaResponse(
  raw: DexPaprikaTokenResponse,
  latency: number,
  cached: boolean
): MarketSnapshot {
  return {
    token: {
      address: raw.contract_address,
      symbol: raw.symbol,
      name: raw.name,
      chain: normalizeChain(raw.chain),
      decimals: raw.decimals,
    },

    price: {
      current: raw.price_usd,
      high24h: raw.high_24h,
      low24h: raw.low_24h,
      change24h: raw.price_change_24h,
      change24hUsd: raw.price_usd * (raw.price_change_24h / 100),
    },

    volume: {
      volume24h: raw.volume_24h,
      volumeChange24h: raw.volume_change_24h,
    },

    liquidity: {
      total: raw.liquidity_usd,
    },

    marketCap: raw.market_cap,
    fdv: raw.fdv,
    holders: raw.holders,

    pairs: raw.pairs?.map((pair) => ({
      dex: pair.dex_name,
      pairAddress: pair.pair_address,
      baseToken: pair.base_token,
      quoteToken: pair.quote_token,
      liquidity: pair.liquidity_usd,
      volume24h: pair.volume_24h,
      priceUsd: pair.price_usd,
    })),

    metadata: {
      provider: 'dexpaprika',
      timestamp: new Date(raw.last_updated).getTime(),
      cached,
      confidence: calculateConfidence(raw),
      latency,
    },
  }
}

/**
 * Normalize chain identifier
 */
function normalizeChain(chain: string): ChainId {
  const normalized = chain.toLowerCase()
  if (normalized === 'sol' || normalized === 'solana') return 'solana'
  if (normalized === 'eth' || normalized === 'ethereum') return 'ethereum'
  if (normalized === 'bsc' || normalized === 'binance') return 'bsc'
  if (normalized === 'arb' || normalized === 'arbitrum') return 'arbitrum'
  if (normalized === 'base') return 'base'
  if (normalized === 'matic' || normalized === 'polygon') return 'polygon'
  return 'solana' // Default to Solana
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidence(data: DexPaprikaTokenResponse): number {
  let score = 0.5 // Base score

  // Price data present
  if (data.price_usd > 0) score += 0.1
  if (data.high_24h > 0 && data.low_24h > 0) score += 0.1

  // Volume data
  if (data.volume_24h > 0) score += 0.1

  // Liquidity data
  if (data.liquidity_usd > 0) score += 0.1

  // Market data
  if (data.market_cap) score += 0.05
  if (data.holders) score += 0.05

  // Trading pairs
  if (data.pairs && data.pairs.length > 0) score += 0.1

  return Math.min(score, 1.0)
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get market snapshot for a token (with caching)
 *
 * @param address - Token contract address
 * @param chain - Blockchain (default: 'solana')
 * @param forceRefresh - Bypass cache
 * @returns MarketSnapshot or error
 */
export async function getDexPaprikaSnapshot(
  address: string,
  chain: ChainId = 'solana',
  forceRefresh = false
): Promise<AdapterResponse<MarketSnapshot>> {
  const startTime = Date.now()
  const cacheKey = `${chain}:${address.toLowerCase()}`

  // Check cache first
  if (!forceRefresh) {
    const cached = cache.get(cacheKey)
    if (cached) {
      return {
        success: true,
        data: cached,
        metadata: {
          provider: 'dexpaprika',
          cached: true,
          latency: Date.now() - startTime,
          retries: 0,
        },
      }
    }
  }

  try {
    // Fetch from API
    const url = `${DEFAULT_CONFIG.baseUrl}/v1/tokens/${chain}/${address}`
    const raw = await fetchWithRetry(url, DEFAULT_CONFIG)

    const latency = Date.now() - startTime
    const snapshot = normalizeDexPaprikaResponse(raw, latency, false)

    // Cache result
    cache.set(cacheKey, snapshot)

    return {
      success: true,
      data: snapshot,
      metadata: {
        provider: 'dexpaprika',
        cached: false,
        latency,
        retries: 0, // TODO: Track actual retries
      },
    }
  } catch (error) {
    const latency = Date.now() - startTime

    return {
      success: false,
      error: {
        code: error instanceof Error && error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        provider: 'dexpaprika',
        timestamp: Date.now(),
      },
      metadata: {
        provider: 'dexpaprika',
        cached: false,
        latency,
        retries: 0,
      },
    }
  }
}

/**
 * Get multiple token snapshots (batch request)
 *
 * @param addresses - Array of token addresses
 * @param chain - Blockchain
 * @returns Array of adapter responses
 */
export async function getDexPaprikaSnapshotBatch(
  addresses: string[],
  chain: ChainId = 'solana'
): Promise<Array<AdapterResponse<MarketSnapshot>>> {
  return Promise.all(addresses.map((addr) => getDexPaprikaSnapshot(addr, chain)))
}

/**
 * Clear adapter cache
 */
export function clearDexPaprikaCache(): void {
  cache.clear()
}

/**
 * Get cache stats (for debugging/telemetry)
 */
export function getDexPaprikaCacheStats() {
  return {
    size: cache['cache'].size,
    maxSize: cache['maxSize'],
    ttl: cache['ttl'],
  }
}

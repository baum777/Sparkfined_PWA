/**
 * Moralis Adapter - Alpha Augment Provider
 *
 * Fetches multi-chain token/pool data from Moralis Web3 Data API
 * Normalizes responses to MarketSnapshot schema
 *
 * Features:
 * - Multi-chain support (Solana, EVM chains)
 * - Price, liquidity, pair data
 * - Timeout & retry logic
 * - In-memory LRU cache (5-15 min TTL)
 *
 * @module lib/adapters/moralisAdapter
 */

import type {
  MarketSnapshot,
  MoralisPriceResponse,
  AdapterConfig,
  AdapterResponse,
  ChainId,
} from '../../types/market'

// ============================================================================
// CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: AdapterConfig = {
  baseUrl: import.meta.env.VITE_MORALIS_BASE || 'https://deep-index.moralis.io/api/v2.2',
  apiKey: import.meta.env.VITE_MORALIS_API_KEY || '',
  timeout: 6000, // 6s timeout (Moralis can be slower)
  retries: 2,
  cacheTtl: 10 * 60 * 1000, // 10 min cache TTL
}

// Moralis chain identifiers mapping
const CHAIN_MAP: Record<ChainId, string> = {
  solana: 'mainnet', // Moralis uses 'mainnet' for Solana
  ethereum: '0x1',
  bsc: '0x38',
  polygon: '0x89',
  arbitrum: '0xa4b1',
  base: '0x2105',
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
  private maxSize = 100
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

    // Move to end (LRU)
    this.cache.delete(key)
    this.cache.set(key, entry)
    return entry.data
  }

  set(key: string, data: MarketSnapshot): void {
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
 * Fetch token price from Moralis API with timeout & retry
 */
async function fetchMoralisPrice(
  address: string,
  chain: ChainId,
  config: AdapterConfig,
  attempt = 1
): Promise<MoralisPriceResponse> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout)

  try {
    const moralisChain = CHAIN_MAP[chain]
    const url =
      chain === 'solana'
        ? `${config.baseUrl}/solana/mainnet/token/${address}/price`
        : `${config.baseUrl}/erc20/${address}/price?chain=${moralisChain}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      accept: 'application/json',
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
        return fetchMoralisPrice(address, chain, config, attempt + 1)
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
      return fetchMoralisPrice(address, chain, config, attempt + 1)
    }

    throw error
  }
}

/**
 * Fetch pair/liquidity data from Moralis (EVM only)
 */
 
async function fetchMoralisPair(
  pairAddress: string,
  chain: ChainId,
  config: AdapterConfig
): Promise<any> {
  if (chain === 'solana') {
    // Moralis Solana API doesn't have pair endpoint yet
    return null
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), config.timeout)

  try {
    const moralisChain = CHAIN_MAP[chain]
    const url = `${config.baseUrl}/erc20/${pairAddress}/reserves?chain=${moralisChain}`

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      accept: 'application/json',
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
      return null // Pair data is optional
    }

    return response.json()
  } catch {
    clearTimeout(timeoutId)
    return null
  }
}

// ============================================================================
// NORMALIZATION
// ============================================================================

/**
 * Normalize Moralis response to MarketSnapshot schema
 */
function normalizeMoralisResponse(
  raw: MoralisPriceResponse,
  address: string,
  chain: ChainId,
   
  pairData: any,
  latency: number,
  cached: boolean
): MarketSnapshot {
  const price = parseFloat(raw.usdPrice?.toString() || '0')
  const change24h = parseFloat(raw['24hrPercentChange'] || '0')
  const liquidity = parseFloat(raw.pairTotalLiquidityUsd || '0')

  return {
    token: {
      address: address,
      symbol: raw.tokenSymbol || 'UNKNOWN',
      name: raw.tokenName || 'Unknown Token',
      chain: chain,
      decimals: parseInt(raw.tokenDecimals) || undefined,
    },

    price: {
      current: price,
      high24h: price * (1 + change24h / 200), // Estimate high (price + half change)
      low24h: price * (1 - change24h / 200), // Estimate low (price - half change)
      change24h: change24h,
      change24hUsd: price * (change24h / 100),
    },

    volume: {
      volume24h: 0, // Moralis doesn't provide volume in price endpoint
    },

    liquidity: {
      total: liquidity,
      reserves: pairData?.reserve0
        ? {
            token0: parseFloat(pairData.reserve0),
            token1: parseFloat(pairData.reserve1),
          }
        : undefined,
    },

    pairs: raw.pairAddress
      ? [
          {
            dex: raw.exchangeName || 'Unknown DEX',
            pairAddress: raw.pairAddress,
            baseToken: raw.tokenAddress,
            quoteToken: 'USD', // Moralis returns USD pairs
            liquidity: liquidity,
            volume24h: 0,
            priceUsd: price,
          },
        ]
      : undefined,

    metadata: {
      provider: 'moralis',
      timestamp: Date.now(),
      cached,
      confidence: calculateConfidence(raw, pairData),
      latency,
    },
  }
}

/**
 * Calculate confidence score based on data completeness
 */
function calculateConfidence(
  data: MoralisPriceResponse,
   
  pairData: any
): number {
  let score = 0.5 // Base score

  // Price data
  if (data.usdPrice && data.usdPrice > 0) score += 0.2

  // 24h change available
  if (data['24hrPercentChange']) score += 0.1

  // Token metadata
  if (data.tokenSymbol && data.tokenName) score += 0.1

  // Pair/liquidity data
  if (data.pairAddress) score += 0.05
  if (data.pairTotalLiquidityUsd) score += 0.05

  // Reserve data
  if (pairData?.reserve0) score += 0.1

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
export async function getMoralisSnapshot(
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
          provider: 'moralis',
          cached: true,
          latency: Date.now() - startTime,
          retries: 0,
        },
      }
    }
  }

  // Validate API key
  if (!DEFAULT_CONFIG.apiKey) {
    return {
      success: false,
      error: {
        code: 'INVALID_ADDRESS',
        message: 'Moralis API key not configured (VITE_MORALIS_API_KEY)',
        provider: 'moralis',
        timestamp: Date.now(),
      },
      metadata: {
        provider: 'moralis',
        cached: false,
        latency: Date.now() - startTime,
        retries: 0,
      },
    }
  }

  try {
    // Fetch price data
    const priceData = await fetchMoralisPrice(address, chain, DEFAULT_CONFIG)

    // Optionally fetch pair data (EVM only)
    let pairData = null
    if (chain !== 'solana' && priceData.pairAddress) {
      pairData = await fetchMoralisPair(priceData.pairAddress, chain, DEFAULT_CONFIG)
    }

    const latency = Date.now() - startTime
    const snapshot = normalizeMoralisResponse(priceData, address, chain, pairData, latency, false)

    // Cache result
    cache.set(cacheKey, snapshot)

    return {
      success: true,
      data: snapshot,
      metadata: {
        provider: 'moralis',
        cached: false,
        latency,
        retries: 0,
      },
    }
  } catch (error) {
    const latency = Date.now() - startTime

    return {
      success: false,
      error: {
        code: error instanceof Error && error.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error',
        provider: 'moralis',
        timestamp: Date.now(),
      },
      metadata: {
        provider: 'moralis',
        cached: false,
        latency,
        retries: 0,
      },
    }
  }
}

/**
 * Get multiple token snapshots (batch)
 */
export async function getMoralisSnapshotBatch(
  addresses: string[],
  chain: ChainId = 'solana'
): Promise<Array<AdapterResponse<MarketSnapshot>>> {
  return Promise.all(addresses.map((addr) => getMoralisSnapshot(addr, chain)))
}

/**
 * Clear adapter cache
 */
export function clearMoralisCache(): void {
  cache.clear()
}

/**
 * Get cache stats
 */
export function getMoralisCacheStats() {
  return {
    size: cache['cache'].size,
    maxSize: cache['maxSize'],
    ttl: cache['ttl'],
  }
}

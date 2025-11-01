/**
 * Dexscreener API Adapter
 *
 * Fetches token data from Dexscreener API
 * Normalizes response to DexscreenerTokenData format
 *
 * DoD: Offline fallback, Mock ok for Beta
 */

import type { DexscreenerTokenData } from '@/types/analysis'

const DEX_API_BASE = import.meta.env.DEX_API_BASE || 'https://api.dexscreener.com'
const DEX_API_TIMEOUT = Number(import.meta.env.DEX_API_TIMEOUT || 5000)

/**
 * Fetch token data from Dexscreener API
 * @param ca - Contract Address
 * @returns Normalized token data
 */
export async function getDexscreenerToken(ca: string): Promise<DexscreenerTokenData> {
  // const startTime = performance.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), DEX_API_TIMEOUT)

    const response = await fetch(`${DEX_API_BASE}/latest/dex/tokens/${ca}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Dexscreener API error: ${response.status}`)
    }

    const data = await response.json()
    // const processingTime = performance.now() - startTime

    // Normalize response
    const pair = data.pairs?.[0]

    if (!pair) {
      throw new Error('No trading pair found for this token')
    }

    return {
      price: parseFloat(pair.priceUsd || '0'),
      high24: parseFloat(pair.priceChange?.h24High || pair.priceUsd || '0'),
      low24: parseFloat(pair.priceChange?.h24Low || pair.priceUsd || '0'),
      vol24: parseFloat(pair.volume?.h24 || '0'),
      liquidity: parseFloat(pair.liquidity?.usd || '0'),
      marketCap: parseFloat(pair.fdv || '0'),
      priceChange24h: parseFloat(pair.priceChange?.h24 || '0'),
      symbol: pair.baseToken?.symbol || '',
      name: pair.baseToken?.name || '',
      address: pair.baseToken?.address || ca,
      chain: pair.chainId || 'solana',
      timestamp: Date.now(),
    }
  } catch (error) {
    // Offline fallback or error
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Dexscreener API timeout, using fallback')
      } else {
        console.error('Dexscreener fetch failed:', error.message)
      }
    }

    // Return mock data for offline/error scenarios
    return getMockDexscreenerData(ca)
  }
}

/**
 * Mock Dexscreener data for offline mode or errors
 */
function getMockDexscreenerData(ca: string): DexscreenerTokenData {
  return {
    price: 0.000042,
    high24: 0.000048,
    low24: 0.000038,
    vol24: 125000,
    liquidity: 50000,
    marketCap: 420000,
    priceChange24h: 8.5,
    symbol: 'MOCK',
    name: 'Mock Token',
    address: ca,
    chain: 'solana',
    timestamp: Date.now(),
  }
}

/**
 * Batch fetch multiple tokens (future enhancement)
 */
export async function getDexscreenerTokens(
  addresses: string[]
): Promise<Record<string, DexscreenerTokenData>> {
  const results: Record<string, DexscreenerTokenData> = {}

  // Fetch in parallel
  await Promise.all(
    addresses.map(async (ca) => {
      try {
        results[ca] = await getDexscreenerToken(ca)
      } catch (error) {
        console.error(`Failed to fetch ${ca}:`, error)
      }
    })
  )

  return results
}

/**
 * Cache wrapper for Dexscreener data (24h TTL)
 */
const cache = new Map<string, { data: DexscreenerTokenData; expires: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

export async function getDexscreenerTokenCached(ca: string): Promise<DexscreenerTokenData> {
  const now = Date.now()
  const cached = cache.get(ca)

  if (cached && cached.expires > now) {
    return cached.data
  }

  const data = await getDexscreenerToken(ca)
  cache.set(ca, { data, expires: now + CACHE_TTL })

  return data
}

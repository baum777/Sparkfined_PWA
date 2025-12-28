/**
 * Pump.fun API Adapter
 *
 * Beta: Returns mock data
 * Alpha: Will integrate live Pump.fun API
 *
 * Fetches token metadata from Pump.fun for newly launched tokens
 */

import type { PumpfunTokenData } from '@/types/analysis'

const PUMPFUN_API_BASE = import.meta.env.PUMPFUN_API_BASE || 'https://api.pump.fun'
const PUMPFUN_API_TIMEOUT = Number(import.meta.env.PUMPFUN_API_TIMEOUT || 5000)
const IS_BETA = true // Set to false in Alpha phase

/**
 * Fetch token data from Pump.fun API
 * @param ca - Contract Address
 * @returns Token metadata from Pump.fun
 */
export async function getPumpfunData(ca: string): Promise<PumpfunTokenData> {
  // Beta: Always return mock data
  if (IS_BETA) {
    return getMockPumpfunData(ca)
  }

  // Alpha: Real API integration
  // const startTime = performance.now()

  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), PUMPFUN_API_TIMEOUT)

    const response = await fetch(`${PUMPFUN_API_BASE}/token/${ca}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Pump.fun API error: ${response.status}`)
    }

    const data = await response.json()
    // const processingTime = performance.now() - startTime

    return {
      name: data.name || 'Unknown Token',
      symbol: data.symbol || 'UNK',
      liquidity: parseFloat(data.liquidity || '0'),
      launchDate: data.createdAt || new Date().toISOString(),
      bondingCurve: parseFloat(data.bondingCurveProgress || '0'),
      creatorAddress: data.creator || '',
      socialLinks: {
        twitter: data.twitter || undefined,
        telegram: data.telegram || undefined,
        website: data.website || undefined,
      },
    }
  } catch (error) {
    // Fallback to mock on error
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn('Pump.fun API timeout, using fallback')
      } else {
        console.error('Pump.fun fetch failed:', error.message)
      }
    }

    return getMockPumpfunData(ca)
  }
}

/**
 * Mock Pump.fun data for Beta phase or errors
 */
function getMockPumpfunData(ca: string): PumpfunTokenData {
  // Generate semi-realistic mock data based on CA hash
  const hash = ca.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const liquidityRange = [50000, 100000, 250000, 500000, 1000000]
  const liquidity = liquidityRange[hash % liquidityRange.length]

  const mockDate = new Date()
  mockDate.setDate(mockDate.getDate() - (hash % 30)) // 0-30 days ago

  return {
    name: `MockToken ${ca.slice(0, 4)}`,
    symbol: `MOCK${ca.slice(0, 3).toUpperCase()}`,
    liquidity: liquidity ?? 100000,
    launchDate: mockDate.toISOString(),
    bondingCurve: (hash % 100) / 100, // 0-1
    creatorAddress: `creator_${ca.slice(-8)}`,
    socialLinks: {
      twitter: hash % 2 === 0 ? `https://twitter.com/mock_${ca.slice(0, 4)}` : undefined,
      telegram: hash % 3 === 0 ? `https://t.me/mock_${ca.slice(0, 4)}` : undefined,
      website: hash % 4 === 0 ? `https://mock-${ca.slice(0, 4)}.com` : undefined,
    },
  }
}

/**
 * Check if token is from Pump.fun (heuristic)
 * Returns confidence score 0-1
 */
export function isPumpfunToken(tokenData: {
  liquidity?: number
  launchDate?: string
  age?: number
}): number {
  let confidence = 0

  // Low liquidity suggests Pump.fun launch
  if (tokenData.liquidity && tokenData.liquidity < 100000) {
    confidence += 0.4
  }

  // Recent launch (< 7 days)
  if (tokenData.launchDate) {
    const ageMs = Date.now() - new Date(tokenData.launchDate).getTime()
    const ageDays = ageMs / (1000 * 60 * 60 * 24)
    if (ageDays < 7) {
      confidence += 0.3
    }
  }

  // Additional heuristics can be added here
  confidence += 0.3 // Base confidence for being on Solana

  return Math.min(confidence, 1)
}

/**
 * Get enriched token data by combining Pump.fun with other sources
 */
export async function getEnrichedPumpfunData(ca: string): Promise<
  PumpfunTokenData & {
    isPumpfun: boolean
    confidence: number
  }
> {
  const pumpfunData = await getPumpfunData(ca)
  const confidence = isPumpfunToken(pumpfunData)

  return {
    ...pumpfunData,
    isPumpfun: confidence > 0.5,
    confidence,
  }
}

/**
 * BLOCK 3: Token-Age Detection & Timeframe Logic
 * 
 * Determines optimal chart timeframe based on token age
 * Uses pump.fun API (primary) + Moralis fallback + heuristic
 * 
 * Rules:
 * - Just bonded (pf): 30s - 1min
 * - < 1 day: 5min - 15min
 * - > 1 day: 1h
 */

import { getPumpfunData } from './adapters/pumpfunAdapter'
import type { Timeframe } from '@/types/journal'
import { moralisFetch } from './moralisProxy'

// ============================================================================
// CONFIGURATION
// ============================================================================

// Age thresholds (in milliseconds)
const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

// ============================================================================
// TOKEN AGE DETECTION
// ============================================================================

export interface TokenAgeResult {
  ageMs: number
  ageDays: number
  ageHours: number
  source: 'pumpfun' | 'moralis' | 'heuristic'
  launchDate?: string
  confidence: number // 0-1
}

/**
 * Get token age from multiple sources
 * Priority: 1) Pump.fun 2) Moralis first-tx 3) Heuristic (MCap-based)
 */
export async function getTokenAge(address: string): Promise<TokenAgeResult> {
  // Try Pump.fun first (most accurate for new tokens)
  try {
    const pfData = await getPumpfunData(address)
    
    if (pfData.launchDate) {
      const launchTime = new Date(pfData.launchDate).getTime()
      const ageMs = Date.now() - launchTime
      
      return {
        ageMs,
        ageDays: ageMs / ONE_DAY_MS,
        ageHours: ageMs / ONE_HOUR_MS,
        source: 'pumpfun',
        launchDate: pfData.launchDate,
        confidence: 0.9, // High confidence from pump.fun
      }
    }
  } catch (error) {
    console.warn('[TokenAge] Pump.fun fetch failed:', error)
  }

  // Fallback: Moralis first transaction timestamp
  try {
    const firstTxTime = await getMoralisFirstTransaction(address)
    
    if (firstTxTime) {
      const ageMs = Date.now() - firstTxTime
      
      return {
        ageMs,
        ageDays: ageMs / ONE_DAY_MS,
        ageHours: ageMs / ONE_HOUR_MS,
        source: 'moralis',
        launchDate: new Date(firstTxTime).toISOString(),
        confidence: 0.7, // Medium confidence (first tx != actual launch)
      }
    }
  } catch (error) {
    console.warn('[TokenAge] Moralis fetch failed:', error)
  }

  // Last resort: Heuristic based on MCap (not recommended but better than nothing)
  console.warn('[TokenAge] Using heuristic (low accuracy)')
  
  return {
    ageMs: ONE_DAY_MS, // Assume 1 day old
    ageDays: 1,
    ageHours: 24,
    source: 'heuristic',
    confidence: 0.3, // Low confidence
  }
}

/**
 * Get first transaction timestamp from Moralis
 */
async function getMoralisFirstTransaction(address: string): Promise<number | null> {
  try {
    // Get wallet history for token (oldest first, limit 1)
    const path = `/erc20/${address}/transactions?chain=mainnet&order=asc&limit=1`
    const data = await moralisFetch<{ result?: Array<{ block_timestamp: string }> }>(path, {
      signal: AbortSignal.timeout(5000),
    })

    if (data.result && data.result.length > 0) {
      const firstTx = data.result[0]
      return new Date(firstTx.block_timestamp).getTime()
    }

    return null
  } catch (error) {
    console.error('[TokenAge] Moralis fetch error:', error)
    return null
  }
}

// ============================================================================
// TIMEFRAME RECOMMENDATION
// ============================================================================

/**
 * Get recommended timeframe based on token age
 */
export function getRecommendedTimeframe(ageMs: number): Timeframe {
  const ageDays = ageMs / ONE_DAY_MS
  const ageHours = ageMs / ONE_HOUR_MS

  // Just bonded (< 1 hour): 30s - 1min
  if (ageHours < 1) {
    return '1m'
  }

  // Very new (< 6 hours): 1min - 5min
  if (ageHours < 6) {
    return '5m'
  }

  // New (< 1 day): 15min
  if (ageDays < 1) {
    return '15m'
  }

  // Established (< 7 days): 1h
  if (ageDays < 7) {
    return '1h'
  }

  // Mature (> 7 days): 4h
  return '4h'
}

/**
 * Get timeframe with token age detection (convenience function)
 */
export async function getOptimalTimeframe(address: string): Promise<{
  timeframe: Timeframe
  tokenAge: TokenAgeResult
}> {
  const tokenAge = await getTokenAge(address)
  const timeframe = getRecommendedTimeframe(tokenAge.ageMs)

  return { timeframe, tokenAge }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Format age for display
 */
export function formatTokenAge(ageMs: number): string {
  const seconds = Math.floor(ageMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }
  return `${seconds}s`
}

/**
 * Check if token is "new" (< 24h)
 */
export function isNewToken(ageMs: number): boolean {
  return ageMs < ONE_DAY_MS
}

/**
 * Check if token is from pump.fun (likely)
 */
export function isPumpfunToken(tokenAge: TokenAgeResult): boolean {
  return tokenAge.source === 'pumpfun' || (
    tokenAge.ageDays < 7 && tokenAge.confidence > 0.5
  )
}

/**
 * Market Regime Detector
 * 
 * Classifies market conditions into regimes for context-aware signal generation
 * - Trend: up/down/side
 * - Volatility: low/mid/high
 * - Liquidity: low/mid/high
 * 
 * @module lib/regimeDetector
 */

import type { MarketRegime } from '@/types/signal'
import type { MarketSnapshot } from '@/types/market'

// ============================================================================
// REGIME DETECTION
// ============================================================================

/**
 * Detect market regime from snapshot
 * Combines price action, volatility, and liquidity metrics
 */
export function detectRegime(snapshot: MarketSnapshot): MarketRegime {
  const trend = detectTrend(snapshot)
  const vol = detectVolatility(snapshot)
  const liquidity = detectLiquidity(snapshot)
  
  // Optional: Detect session (for time-aware strategies)
  const session = detectSession()
  
  return {
    trend,
    vol,
    liquidity,
    session,
  }
}

/**
 * Detect trend direction
 * Uses price change and momentum indicators
 */
function detectTrend(snapshot: MarketSnapshot): MarketRegime['trend'] {
  const { change24h } = snapshot.price
  
  // Trend thresholds
  const STRONG_UP = 10    // +10% = strong uptrend
  const WEAK_UP = 2       // +2% = mild uptrend
  const WEAK_DOWN = -2    // -2% = mild downtrend
  const STRONG_DOWN = -10 // -10% = strong downtrend
  
  if (change24h >= WEAK_UP) {
    return 'up'
  } else if (change24h <= WEAK_DOWN) {
    return 'down'
  } else {
    return 'side'
  }
}

/**
 * Detect volatility level
 * Uses ATR (approximated from high/low) relative to price
 */
function detectVolatility(snapshot: MarketSnapshot): MarketRegime['vol'] {
  const { current, high24h, low24h } = snapshot.price
  
  // Calculate ATR% (Average True Range as % of price)
  const atr = high24h - low24h
  const atrPercent = (atr / current) * 100
  
  // Volatility thresholds
  const LOW_VOL = 5      // < 5% daily range = low vol
  const MID_VOL = 15     // 5-15% = mid vol
  // > 15% = high vol
  
  if (atrPercent < LOW_VOL) {
    return 'low'
  } else if (atrPercent < MID_VOL) {
    return 'mid'
  } else {
    return 'high'
  }
}

/**
 * Detect liquidity level
 * Based on pool liquidity and volume
 */
function detectLiquidity(snapshot: MarketSnapshot): MarketRegime['liquidity'] {
  const { total: totalLiquidity } = snapshot.liquidity
  const { volume24h } = snapshot.volume
  
  // Liquidity thresholds (USD)
  const LOW_LIQ = 50_000
  const MID_LIQ = 500_000
  
  // Volume/Liquidity ratio (turnover)
  const turnover = volume24h / totalLiquidity
  
  // Combined liquidity score
  if (totalLiquidity < LOW_LIQ || turnover < 0.1) {
    return 'low'
  } else if (totalLiquidity < MID_LIQ || turnover < 0.5) {
    return 'mid'
  } else {
    return 'high'
  }
}

/**
 * Detect trading session
 * Based on current UTC time
 */
function detectSession(): MarketRegime['session'] {
  const now = new Date()
  const hour = now.getUTCHours()
  
  // Trading sessions (UTC)
  // Asia: 00:00 - 08:00
  // London: 08:00 - 16:00
  // NYC: 13:00 - 21:00
  // Overlap (London/NYC): 13:00 - 16:00
  
  if (hour >= 0 && hour < 8) {
    return 'asia'
  } else if (hour >= 13 && hour < 16) {
    return 'overlap'
  } else if (hour >= 8 && hour < 21) {
    if (hour >= 13) {
      return 'nyc'
    } else {
      return 'london'
    }
  } else {
    return 'offhours'
  }
}

// ============================================================================
// REGIME UTILITIES
// ============================================================================

/**
 * Check if regime is favorable for trading
 * Filters out unfavorable conditions
 */
export function isFavorableRegime(regime: MarketRegime): boolean {
  // Avoid sideways + low volatility (choppy, no edge)
  if (regime.trend === 'side' && regime.vol === 'low') {
    return false
  }
  
  // Avoid high volatility + low liquidity (rug risk)
  if (regime.vol === 'high' && regime.liquidity === 'low') {
    return false
  }
  
  return true
}

/**
 * Get regime description for humans
 */
export function describeRegime(regime: MarketRegime): string {
  const parts: string[] = []
  
  // Trend
  if (regime.trend === 'up') {
    parts.push('Uptrending')
  } else if (regime.trend === 'down') {
    parts.push('Downtrending')
  } else {
    parts.push('Range-bound')
  }
  
  // Volatility
  parts.push(`${regime.vol} volatility`)
  
  // Liquidity
  parts.push(`${regime.liquidity} liquidity`)
  
  // Session
  if (regime.session) {
    const sessionNames = {
      asia: 'Asian session',
      london: 'London session',
      nyc: 'NYC session',
      overlap: 'London/NYC overlap',
      offhours: 'off-hours',
    }
    parts.push(`(${sessionNames[regime.session]})`)
  }
  
  return parts.join(', ')
}

/**
 * Calculate regime confidence score
 * Higher = more clear/actionable regime
 */
export function calculateRegimeConfidence(regime: MarketRegime, snapshot: MarketSnapshot): number {
  let confidence = 0.5 // Base
  
  // Boost for clear trend
  if (regime.trend !== 'side') {
    const trendStrength = Math.abs(snapshot.price.change24h)
    confidence += Math.min(0.2, trendStrength / 50) // Max +0.2 for strong trend
  }
  
  // Boost for healthy liquidity
  if (regime.liquidity === 'high') {
    confidence += 0.15
  } else if (regime.liquidity === 'mid') {
    confidence += 0.05
  }
  
  // Penalize extreme volatility
  if (regime.vol === 'high') {
    confidence -= 0.1
  }
  
  // Boost for active sessions
  if (regime.session === 'overlap' || regime.session === 'nyc' || regime.session === 'london') {
    confidence += 0.1
  }
  
  return Math.max(0.1, Math.min(1.0, confidence))
}

/**
 * Risk Check Utilities
 * 
 * Pre-trade validation checks to prevent bad trades
 * - Rug risk detection
 * - Liquidity sufficiency
 * - Spread/slippage checks
 * - News/event checks
 * 
 * @module lib/riskChecks
 */

import type { RiskCheck, Signal } from '@/types/signal'
import type { MarketSnapshot } from '@/types/market'

// ============================================================================
// RUG RISK DETECTION
// ============================================================================

/**
 * Check for rug pull risk indicators
 */
export function checkRugRisk(snapshot: MarketSnapshot): {
  passed: boolean
  score: number // 0-1, higher = safer
  flags: string[]
} {
  const flags: string[] = []
  let score = 1.0
  
  // Check 1: Liquidity too low
  if (snapshot.liquidity.total < 10_000) {
    flags.push('Very low liquidity (<$10k)')
    score -= 0.4
  } else if (snapshot.liquidity.total < 50_000) {
    flags.push('Low liquidity (<$50k)')
    score -= 0.2
  }
  
  // Check 2: Holder concentration (if available)
  if (snapshot.holders && snapshot.holders < 100) {
    flags.push('Very few holders (<100)')
    score -= 0.3
  }
  
  // Check 3: Price volatility extreme
  const atrPercent = ((snapshot.price.high24h - snapshot.price.low24h) / snapshot.price.current) * 100
  if (atrPercent > 50) {
    flags.push('Extreme volatility (>50% daily range)')
    score -= 0.2
  }
  
  // Check 4: Volume/Liquidity ratio suspicious
  const turnover = snapshot.volume.volume24h / snapshot.liquidity.total
  if (turnover > 10) {
    flags.push('Suspicious volume/liquidity ratio (>10x)')
    score -= 0.3
  }
  
  // Check 5: Provider confidence low
  if (snapshot.metadata.confidence < 0.5) {
    flags.push('Low provider confidence')
    score -= 0.2
  }
  
  const passed = score >= 0.5 && flags.length < 3
  
  return {
    passed,
    score: Math.max(0, Math.min(1, score)),
    flags,
  }
}

// ============================================================================
// LIQUIDITY CHECKS
// ============================================================================

/**
 * Check if liquidity is sufficient for position size
 */
export function checkLiquidity(
  snapshot: MarketSnapshot,
  positionSizeUsd: number
): {
  passed: boolean
  maxSafeSize: number
  slippageEstimate: number
  warnings: string[]
} {
  const warnings: string[] = []
  const liquidity = snapshot.liquidity.total
  
  // Rule: Position size should be < 2% of liquidity to avoid slippage
  const maxSafeSize = liquidity * 0.02
  
  // Estimate slippage (simplified model)
  const positionPct = (positionSizeUsd / liquidity) * 100
  const slippageEstimate = Math.pow(positionPct, 1.5) * 0.5 // Non-linear slippage
  
  // Checks
  if (positionSizeUsd > maxSafeSize) {
    warnings.push(`Position too large: ${positionSizeUsd.toFixed(0)} > max ${maxSafeSize.toFixed(0)}`)
  }
  
  if (slippageEstimate > 1.0) {
    warnings.push(`High slippage expected: ~${slippageEstimate.toFixed(2)}%`)
  }
  
  if (liquidity < 50_000) {
    warnings.push('Low absolute liquidity (<$50k)')
  }
  
  const passed = warnings.length === 0
  
  return {
    passed,
    maxSafeSize,
    slippageEstimate,
    warnings,
  }
}

// ============================================================================
// SPREAD CHECKS
// ============================================================================

/**
 * Check bid-ask spread (approximated from high/low)
 */
export function checkSpread(snapshot: MarketSnapshot): {
  passed: boolean
  spreadPercent: number
  warnings: string[]
} {
  const warnings: string[] = []
  
  // Approximate spread from 24h high/low range
  const range = snapshot.price.high24h - snapshot.price.low24h
  const spreadPercent = (range / snapshot.price.current) * 100
  
  // Thresholds
  const MAX_SPREAD = 3.0 // 3% max acceptable spread
  
  if (spreadPercent > MAX_SPREAD) {
    warnings.push(`Wide spread: ${spreadPercent.toFixed(2)}% (max ${MAX_SPREAD}%)`)
  }
  
  if (spreadPercent > 10) {
    warnings.push('CRITICAL: Spread >10% - high manipulation risk')
  }
  
  return {
    passed: spreadPercent <= MAX_SPREAD,
    spreadPercent,
    warnings,
  }
}

// ============================================================================
// NEWS/EVENT CHECKS
// ============================================================================

/**
 * Check for recent news/events that could invalidate setup
 * (Placeholder - needs integration with news API)
 */
export function checkNews(
  tokenSymbol: string,
  tokenAddress: string
): {
  passed: boolean
  events: Array<{
    type: 'positive' | 'negative' | 'neutral'
    headline: string
    timestamp: number
  }>
  warnings: string[]
} {
  // TODO: Integrate with news API (CoinGecko, CryptoCompare, etc.)
  // For now, return pass-through
  
  return {
    passed: true,
    events: [],
    warnings: [],
  }
}

// ============================================================================
// COMPREHENSIVE RISK CHECK
// ============================================================================

/**
 * Perform all risk checks and aggregate results
 */
export function performComprehensiveRiskCheck(
  signal: Signal,
  snapshot: MarketSnapshot,
  positionSizeUsd: number
): RiskCheck {
  const warnings: string[] = []
  const blockers: string[] = []
  
  // 1. Rug risk
  const rugRisk = checkRugRisk(snapshot)
  if (!rugRisk.passed) {
    blockers.push(`Rug risk detected: ${rugRisk.flags.join(', ')}`)
  }
  if (rugRisk.score < 0.7) {
    warnings.push(`Moderate rug risk (score: ${(rugRisk.score * 100).toFixed(0)}%)`)
  }
  
  // 2. Liquidity
  const liquidityCheck = checkLiquidity(snapshot, positionSizeUsd)
  if (!liquidityCheck.passed) {
    warnings.push(...liquidityCheck.warnings)
  }
  if (liquidityCheck.slippageEstimate > 2.0) {
    blockers.push(`Excessive slippage expected: ${liquidityCheck.slippageEstimate.toFixed(2)}%`)
  }
  
  // 3. Spread
  const spreadCheck = checkSpread(snapshot)
  if (!spreadCheck.passed) {
    warnings.push(...spreadCheck.warnings)
  }
  if (spreadCheck.spreadPercent > 10) {
    blockers.push('Critical: Spread >10%')
  }
  
  // 4. News
  const newsCheck = checkNews(signal.market.symbol, snapshot.token.address)
  warnings.push(...newsCheck.warnings)
  
  // 5. Check signal risk flags
  const hasHighRiskFlags = signal.features.risk_flags.some((flag) => 
    flag === 'rug_suspect' || flag === 'illiquid'
  )
  if (hasHighRiskFlags) {
    blockers.push(`Signal has high-risk flags: ${signal.features.risk_flags.join(', ')}`)
  }
  
  return {
    passed: blockers.length === 0,
    checks: {
      spread_ok: spreadCheck.passed,
      slippage_ok: liquidityCheck.slippageEstimate <= 1.0,
      liquidity_ok: liquidityCheck.passed,
      rug_risk_ok: rugRisk.passed,
      news_clear: newsCheck.passed,
    },
    warnings,
    blockers,
  }
}

// ============================================================================
// POSITION SIZING UTILITIES
// ============================================================================

/**
 * Calculate safe position size based on risk checks
 */
export function calculateSafePositionSize(
  accountEquity: number,
  riskPercentage: number,
  stopLossPercent: number,
  snapshot: MarketSnapshot
): {
  recommendedSize: number
  maxSize: number
  notes: string[]
} {
  const notes: string[] = []
  
  // Base position size (Kelly-style)
  const riskAmount = accountEquity * (riskPercentage / 100)
  const baseSize = riskAmount / (stopLossPercent / 100)
  
  // Liquidity constraint
  const liquidityCheck = checkLiquidity(snapshot, baseSize)
  const maxSize = liquidityCheck.maxSafeSize
  
  // Adjust for liquidity
  let recommendedSize = Math.min(baseSize, maxSize)
  
  // Further reduce for high volatility
  const atrPercent = ((snapshot.price.high24h - snapshot.price.low24h) / snapshot.price.current) * 100
  if (atrPercent > 20) {
    recommendedSize *= 0.75 // Reduce by 25%
    notes.push('Position reduced by 25% due to high volatility')
  }
  
  // Further reduce for low liquidity
  if (snapshot.liquidity.total < 100_000) {
    recommendedSize *= 0.5 // Cut in half
    notes.push('Position halved due to low liquidity')
  }
  
  if (recommendedSize < baseSize) {
    notes.push(`Position adjusted from $${baseSize.toFixed(2)} to $${recommendedSize.toFixed(2)}`)
  }
  
  return {
    recommendedSize,
    maxSize,
    notes,
  }
}

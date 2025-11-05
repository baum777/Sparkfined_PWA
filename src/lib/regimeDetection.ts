/**
 * Market Regime Detection
 * 
 * Analyzes OHLC data to classify market regime:
 * - Trend direction (up/down/side)
 * - Volatility level (low/mid/high)
 * - Liquidity assessment
 * 
 * Used by Signal Orchestrator for context-aware signal generation
 * 
 * @module lib/regimeDetection
 */

import type { MarketRegime } from '@/types/signal'
import type { MarketSnapshot } from '@/types/market'

// OHLC Candle
interface OHLCCandle {
  t: number
  o: number
  h: number
  l: number
  c: number
  v?: number
}

// ============================================================================
// REGIME DETECTION (Main Entry Point)
// ============================================================================

/**
 * Detect market regime from OHLC data + market snapshot
 * 
 * @param ohlc - Array of OHLC candles (minimum 50 candles recommended)
 * @param snapshot - Current market snapshot
 * @returns MarketRegime classification
 */
export function detectMarketRegime(
  ohlc: OHLCCandle[],
  snapshot?: MarketSnapshot
): MarketRegime {
  if (ohlc.length < 20) {
    // Not enough data - return neutral regime
    return {
      trend: 'side',
      vol: 'mid',
      liquidity: 'mid',
    }
  }

  // 1. Trend Detection
  const trend = detectTrend(ohlc)

  // 2. Volatility Classification
  const vol = classifyVolatility(ohlc)

  // 3. Liquidity Assessment
  const liquidity = assessLiquidity(snapshot, ohlc)

  // 4. Optional: Session detection (for crypto, detect US hours vs Asia hours)
  const session = detectSession()

  // 5. Optional: Market phase (accumulation, markup, distribution, markdown)
  const phase = detectPhase(ohlc, trend)

  return {
    trend,
    vol,
    liquidity,
    session,
    phase,
  }
}

// ============================================================================
// TREND DETECTION
// ============================================================================

/**
 * Detect trend direction using multiple indicators:
 * - EMA crossovers (fast vs slow)
 * - Price structure (higher highs/lows vs lower highs/lows)
 * - ADX strength (optional)
 */
function detectTrend(ohlc: OHLCCandle[]): MarketRegime['trend'] {
  const closes = ohlc.map((c) => c.c)

  // Calculate EMAs
  const emaFast = calculateEMA(closes, 9)
  const emaSlow = calculateEMA(closes, 21)

  // Current EMA values
  const currentFast = emaFast[emaFast.length - 1]
  const currentSlow = emaSlow[emaSlow.length - 1]

  // EMA crossover signal
  const emaAbove = currentFast > currentSlow
  const emaBelow = currentFast < currentSlow

  // Price structure: Higher highs/lows vs lower highs/lows
  const priceStructure = analyzePriceStructure(ohlc.slice(-20)) // Last 20 candles

  // Combine signals
  if (emaAbove && priceStructure === 'uptrend') return 'up'
  if (emaBelow && priceStructure === 'downtrend') return 'down'

  // Check for strong trending via slope
  const emaSlope = (currentSlow - emaSlow[emaSlow.length - 10]) / emaSlow[emaSlow.length - 10]
  if (Math.abs(emaSlope) > 0.05) {
    return emaSlope > 0 ? 'up' : 'down'
  }

  return 'side' // Range-bound / sideways
}

/**
 * Analyze price structure for trend confirmation
 */
function analyzePriceStructure(recentOhlc: OHLCCandle[]): 'uptrend' | 'downtrend' | 'sideways' {
  if (recentOhlc.length < 10) return 'sideways'

  const highs = recentOhlc.map((c) => c.h)
  const lows = recentOhlc.map((c) => c.l)

  // Find swing highs and lows
  const swingHighs: number[] = []
  const swingLows: number[] = []

  for (let i = 2; i < highs.length - 2; i++) {
    // Swing high: higher than 2 candles before and after
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] && highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      swingHighs.push(highs[i])
    }
    // Swing low: lower than 2 candles before and after
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] && lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      swingLows.push(lows[i])
    }
  }

  // Check for higher highs and higher lows (uptrend)
  const higherHighs = swingHighs.length >= 2 && swingHighs[swingHighs.length - 1] > swingHighs[0]
  const higherLows = swingLows.length >= 2 && swingLows[swingLows.length - 1] > swingLows[0]

  // Check for lower highs and lower lows (downtrend)
  const lowerHighs = swingHighs.length >= 2 && swingHighs[swingHighs.length - 1] < swingHighs[0]
  const lowerLows = swingLows.length >= 2 && swingLows[swingLows.length - 1] < swingLows[0]

  if (higherHighs && higherLows) return 'uptrend'
  if (lowerHighs && lowerLows) return 'downtrend'
  return 'sideways'
}

// ============================================================================
// VOLATILITY CLASSIFICATION
// ============================================================================

/**
 * Classify volatility as low/mid/high using ATR
 */
function classifyVolatility(ohlc: OHLCCandle[]): MarketRegime['vol'] {
  if (ohlc.length < 14) return 'mid'

  const atr = calculateATR(ohlc, 14)
  const currentPrice = ohlc[ohlc.length - 1].c

  // ATR as percentage of price
  const atrPercent = (atr / currentPrice) * 100

  // Classify (thresholds tuned for crypto)
  if (atrPercent < 2) return 'low'
  if (atrPercent < 5) return 'mid'
  return 'high'
}

/**
 * Calculate Average True Range (ATR)
 */
function calculateATR(ohlc: OHLCCandle[], period: number): number {
  if (ohlc.length < period + 1) return 0

  const trueRanges: number[] = []

  for (let i = 1; i < ohlc.length; i++) {
    const high = ohlc[i].h
    const low = ohlc[i].l
    const prevClose = ohlc[i - 1].c

    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    )
    trueRanges.push(tr)
  }

  // Average of last `period` true ranges
  const recentTR = trueRanges.slice(-period)
  return recentTR.reduce((sum, tr) => sum + tr, 0) / recentTR.length
}

// ============================================================================
// LIQUIDITY ASSESSMENT
// ============================================================================

/**
 * Assess liquidity level from market snapshot + volume data
 */
function assessLiquidity(
  snapshot?: MarketSnapshot,
  ohlc?: OHLCCandle[]
): MarketRegime['liquidity'] {
  if (!snapshot) return 'mid'

  const liquidityUsd = snapshot.liquidity.total

  // Volume analysis (optional)
  let volumeScore = 0.5
  if (ohlc && ohlc.length > 0) {
    const recentVolumes = ohlc.slice(-10).map((c) => c.v || 0)
    const avgVolume = recentVolumes.reduce((sum, v) => sum + v, 0) / recentVolumes.length
    const currentVolume = ohlc[ohlc.length - 1].v || 0

    if (currentVolume > avgVolume * 1.5) volumeScore = 0.8 // Above average volume
    if (currentVolume < avgVolume * 0.5) volumeScore = 0.3 // Below average volume
  }

  // Combined liquidity score
  if (liquidityUsd > 500000 && volumeScore > 0.6) return 'high'
  if (liquidityUsd > 100000 || volumeScore > 0.4) return 'mid'
  return 'low'
}

// ============================================================================
// SESSION DETECTION (Time-of-Day Analysis)
// ============================================================================

/**
 * Detect trading session based on UTC time
 * Crypto trades 24/7, but liquidity varies by session
 */
function detectSession(): MarketRegime['session'] {
  const now = new Date()
  const utcHour = now.getUTCHours()

  // Asia session: 00:00 - 08:00 UTC
  if (utcHour >= 0 && utcHour < 8) return 'asia'

  // London session: 08:00 - 16:00 UTC
  if (utcHour >= 8 && utcHour < 16) return 'london'

  // NYC session: 13:00 - 21:00 UTC (overlap with London 13:00-16:00)
  if (utcHour >= 13 && utcHour < 16) return 'overlap' // London + NYC
  if (utcHour >= 16 && utcHour < 21) return 'nyc'

  // Off-hours: 21:00 - 24:00 UTC
  return 'offhours'
}

// ============================================================================
// MARKET PHASE DETECTION (Wyckoff-style)
// ============================================================================

/**
 * Detect market phase using volume and price action
 */
function detectPhase(
  ohlc: OHLCCandle[],
  trend: MarketRegime['trend']
): MarketRegime['phase'] {
  if (ohlc.length < 20) return undefined

  const recentOhlc = ohlc.slice(-20)
  const volumes = recentOhlc.map((c) => c.v || 0)
  const closes = recentOhlc.map((c) => c.c)

  // Calculate average volume
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length

  // Recent volume vs average
  const recentVolume = volumes.slice(-5).reduce((sum, v) => sum + v, 0) / 5
  const volumeRatio = recentVolume / avgVolume

  // Price momentum
  const priceChange = (closes[closes.length - 1] - closes[0]) / closes[0]

  // Phase classification
  if (trend === 'side' && volumeRatio < 0.8) return 'accumulation' // Low volume, sideways
  if (trend === 'up' && priceChange > 0.1) return 'markup' // Strong uptrend
  if (trend === 'side' && volumeRatio > 1.2) return 'distribution' // High volume, sideways
  if (trend === 'down' && priceChange < -0.1) return 'markdown' // Strong downtrend

  return undefined
}

// ============================================================================
// TECHNICAL INDICATORS (EMA, SMA, etc.)
// ============================================================================

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): number[] {
  if (data.length < period) return []

  const multiplier = 2 / (period + 1)
  const ema: number[] = []

  // Start with SMA for first value
  const smaSum = data.slice(0, period).reduce((sum, val) => sum + val, 0)
  ema.push(smaSum / period)

  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    const currentEma = (data[i] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]
    ema.push(currentEma)
  }

  return ema
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): number[] {
  if (data.length < period) return []

  const sma: number[] = []

  for (let i = period - 1; i < data.length; i++) {
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0)
    sma.push(sum / period)
  }

  return sma
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(closes: number[], period: number = 14): number {
  if (closes.length < period + 1) return 50 // Neutral if not enough data

  const changes: number[] = []
  for (let i = 1; i < closes.length; i++) {
    changes.push(closes[i] - closes[i - 1])
  }

  const recentChanges = changes.slice(-period)
  const gains = recentChanges.filter((c) => c > 0)
  const losses = recentChanges.filter((c) => c < 0).map((c) => Math.abs(c))

  const avgGain = gains.length > 0 ? gains.reduce((sum, g) => sum + g, 0) / period : 0
  const avgLoss = losses.length > 0 ? losses.reduce((sum, l) => sum + l, 0) / period : 0

  if (avgLoss === 0) return 100 // All gains, overbought
  const rs = avgGain / avgLoss
  const rsi = 100 - 100 / (1 + rs)

  return rsi
}

// ============================================================================
// REGIME HELPERS
// ============================================================================

/**
 * Check if regime is favorable for trading
 */
export function isTradableRegime(regime: MarketRegime): boolean {
  // Avoid high volatility + low liquidity (dangerous combo)
  if (regime.vol === 'high' && regime.liquidity === 'low') return false

  // Avoid extremely low liquidity
  if (regime.liquidity === 'low') return false

  return true
}

/**
 * Get regime description for humans
 */
export function describeRegime(regime: MarketRegime): string {
  const parts: string[] = []

  // Trend
  if (regime.trend === 'up') parts.push('Uptrend')
  else if (regime.trend === 'down') parts.push('Downtrend')
  else parts.push('Range-bound')

  // Volatility
  parts.push(`${regime.vol} volatility`)

  // Liquidity
  parts.push(`${regime.liquidity} liquidity`)

  // Session (if available)
  if (regime.session) {
    parts.push(`${regime.session} session`)
  }

  // Phase (if available)
  if (regime.phase) {
    parts.push(`${regime.phase} phase`)
  }

  return parts.join(', ')
}

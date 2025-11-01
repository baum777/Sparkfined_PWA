/**
 * Heuristic Fallback Engine
 *
 * Local calculation of:
 * - Support/Resistance levels (±5%)
 * - Volatility %
 * - Bias (bullish/bearish/neutral)
 * - Entry Zone (±2%)
 * - Stop Loss (-5%)
 * - Take Profit (+10%, +20%)
 *
 * DoD: Calculation < 300ms
 */

import type {
  HeuristicAnalysis,
  OCRResult,
  AITeaserAnalysis,
} from '@/types/analysis'

export interface HeuristicInput {
  price: number
  high24?: number
  low24?: number
  vol24?: number
  ocrData?: OCRResult
}

/**
 * Calculate heuristic analysis from market data
 * Target: < 300ms processing time
 */
export function calculateHeuristic(input: HeuristicInput): HeuristicAnalysis {
  // const startTime = performance.now()
  const { price, high24, low24, ocrData } = input

  // Calculate 24h range
  const high = high24 || price * 1.05
  const low = low24 || price * 0.95
  const range = high - low
  const rangePercent = (range / price) * 100

  // Support and Resistance levels (±5% from current price)
  const supportLevel = price * 0.95
  const resistanceLevel = price * 1.05

  // Key levels at round numbers
  const keyLevels = calculateKeyLevels(price)
  const roundNumbers = calculateRoundNumbers(price)

  // Volatility calculation
  const volatility24h = rangePercent

  // Determine range size
  const rangeSize: 'Low' | 'Medium' | 'High' =
    volatility24h < 5 ? 'Low' : volatility24h < 15 ? 'Medium' : 'High'

  // Bias determination
  const bias = calculateBias(price, high, low, ocrData)

  // Entry zone (±2% from current price)
  const entryZone = {
    min: price * 0.98,
    max: price * 1.02,
  }

  // Stop loss (-5% for long, +5% for short)
  const stopLoss = bias === 'Bullish' ? price * 0.95 : price * 1.05

  // Take profit levels
  const takeProfit1 = bias === 'Bullish' ? price * 1.1 : price * 0.9
  const takeProfit2 = bias === 'Bullish' ? price * 1.2 : price * 0.8

  // Re-entry level (at support for bullish, at resistance for bearish)
  const reentryLevel = bias === 'Bullish' ? supportLevel : resistanceLevel

  // RSI signals from OCR
  const rsiOverbought = ocrData?.indicators.rsi ? ocrData.indicators.rsi > 70 : undefined
  const rsiOversold = ocrData?.indicators.rsi ? ocrData.indicators.rsi < 30 : undefined

  // Bollinger Band status from OCR
  const bollingerBandStatus = ocrData?.indicators.bollinger

  // Confidence calculation
  const confidence = calculateConfidence({
    hasOCR: !!ocrData,
    hasHighLow: !!(high24 && low24),
    volatility: volatility24h,
    rsiSignal: rsiOverbought || rsiOversold,
  })

  // const processingTime = performance.now() - startTime

  return {
    supportLevel,
    resistanceLevel,
    rangeSize,
    volatility24h,
    bias,
    keyLevels,
    roundNumbers,
    entryZone,
    reentryLevel,
    stopLoss,
    takeProfit1,
    takeProfit2,
    rsiOverbought,
    rsiOversold,
    bollingerBandStatus,
    confidence,
    timestamp: Date.now(),
    source: 'heuristic',
  }
}

/**
 * Calculate bias based on price position and OCR indicators
 */
function calculateBias(
  price: number,
  high: number,
  low: number,
  ocrData?: OCRResult
): 'Bullish' | 'Bearish' | 'Neutral' {
  const range = high - low
  const position = (price - low) / range // 0-1, where 0 is at low, 1 is at high

  // OCR indicator signals
  let biasScore = 0

  // Price position in range
  if (position > 0.7) {
    biasScore += 1 // Near high = resistance area
  } else if (position < 0.3) {
    biasScore -= 1 // Near low = support area
  }

  // RSI signals
  if (ocrData?.indicators.rsi) {
    const rsi = ocrData.indicators.rsi
    if (rsi < 30) {
      biasScore -= 1 // Oversold = bullish signal
    } else if (rsi > 70) {
      biasScore += 1 // Overbought = bearish signal
    }
  }

  // Bollinger Band signals
  if (ocrData?.indicators.bollinger === 'lower') {
    biasScore -= 1 // At lower band = bullish
  } else if (ocrData?.indicators.bollinger === 'upper') {
    biasScore += 1 // At upper band = bearish
  }

  // Determine bias
  if (biasScore <= -1) return 'Bullish'
  if (biasScore >= 1) return 'Bearish'
  return 'Neutral'
}

/**
 * Calculate key price levels (psychological levels)
 */
function calculateKeyLevels(price: number): number[] {
  const levels: number[] = []
  // const magnitude = Math.pow(10, Math.floor(Math.log10(price)))

  // Key levels at ±10%, ±20%, ±30% intervals
  for (let i = 1; i <= 3; i++) {
    levels.push(price * (1 + i * 0.1)) // Resistance
    levels.push(price * (1 - i * 0.1)) // Support
  }

  return levels.sort((a, b) => a - b)
}

/**
 * Calculate round number levels
 */
function calculateRoundNumbers(price: number): number[] {
  const magnitude = Math.pow(10, Math.floor(Math.log10(price)))
  const roundLevel = magnitude / 10

  const levels: number[] = []

  // Find nearest round numbers above and below
  for (let i = -3; i <= 3; i++) {
    const level = Math.round(price / roundLevel) * roundLevel + i * roundLevel
    if (level > 0) {
      levels.push(level)
    }
  }

  return levels.sort((a, b) => a - b)
}

/**
 * Calculate confidence score (0-1)
 */
function calculateConfidence(factors: {
  hasOCR: boolean
  hasHighLow: boolean
  volatility: number
  rsiSignal: boolean | undefined
}): number {
  let confidence = 0.5 // Base confidence

  if (factors.hasOCR) confidence += 0.2
  if (factors.hasHighLow) confidence += 0.15
  if (factors.volatility > 5 && factors.volatility < 30) confidence += 0.1 // Good volatility range
  if (factors.rsiSignal) confidence += 0.05

  return Math.min(confidence, 1)
}

/**
 * Convert heuristic analysis to AI Teaser format
 * Used when AI provider is 'none' or unavailable
 */
export function heuristicToTeaser(heuristic: HeuristicAnalysis): AITeaserAnalysis {
  const startTime = performance.now()

  // Generate S/R levels
  const sr_levels = [
    { label: 'S1', price: heuristic.supportLevel, type: 'support' as const },
    { label: 'R1', price: heuristic.resistanceLevel, type: 'resistance' as const },
  ]

  // Add key levels as S/R
  heuristic.keyLevels.slice(0, 4).forEach((level, idx) => {
    const isSupport = level < heuristic.supportLevel
    sr_levels.push({
      label: isSupport ? `S${idx + 2}` : `R${idx + 2}`,
      price: level,
      type: isSupport ? 'support' : 'resistance',
    })
  })

  // Generate indicators list
  const indicators: string[] = []

  if (heuristic.rsiOverbought) indicators.push('RSI: Overbought (>70)')
  if (heuristic.rsiOversold) indicators.push('RSI: Oversold (<30)')
  if (heuristic.bollingerBandStatus) {
    indicators.push(`Bollinger: ${heuristic.bollingerBandStatus}`)
  }
  indicators.push(`Volatility: ${heuristic.volatility24h.toFixed(2)}%`)
  indicators.push(`Range: ${heuristic.rangeSize}`)

  // Generate teaser text
  const teaserText = generateTeaserText(heuristic)

  const processingTime = performance.now() - startTime

  return {
    sr_levels,
    stop_loss: heuristic.stopLoss || 0,
    tp: [heuristic.takeProfit1 || 0, heuristic.takeProfit2 || 0],
    indicators,
    teaser_text: teaserText,
    confidence: heuristic.confidence,
    processingTime,
    provider: 'heuristic',
  }
}

/**
 * Generate human-readable teaser text from heuristic analysis
 */
function generateTeaserText(heuristic: HeuristicAnalysis): string {
  const { bias, volatility24h, rsiOverbought, rsiOversold } = heuristic

  let text = ''

  // Bias statement
  if (bias === 'Bullish') {
    text += 'Bullish setup detected. '
    if (rsiOversold) {
      text += 'RSI shows oversold conditions, potential bounce opportunity. '
    }
    text += `Entry zone around ${heuristic.entryZone?.min.toFixed(6)} - ${heuristic.entryZone?.max.toFixed(6)}. `
  } else if (bias === 'Bearish') {
    text += 'Bearish pressure detected. '
    if (rsiOverbought) {
      text += 'RSI shows overbought conditions, potential reversal ahead. '
    }
    text += 'Consider waiting for better entry or short opportunities. '
  } else {
    text += 'Neutral range-bound market. '
    text += 'Look for breakout confirmation before entering. '
  }

  // Volatility context
  if (volatility24h > 20) {
    text += 'High volatility - use wider stop loss. '
  } else if (volatility24h < 5) {
    text += 'Low volatility - tight range, breakout possible. '
  }

  // Support/Resistance guidance
  text += `Watch support at ${heuristic.supportLevel.toFixed(6)} and resistance at ${heuristic.resistanceLevel.toFixed(6)}.`

  return text
}

/**
 * Batch heuristic analysis (future enhancement)
 */
export function calculateHeuristicBatch(inputs: HeuristicInput[]): HeuristicAnalysis[] {
  return inputs.map(calculateHeuristic)
}

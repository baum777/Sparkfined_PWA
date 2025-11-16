/**
 * Analysis Types - Chart & Token Analysis Data Models
 *
 * Defines types for technical analysis results, including both
 * current heuristic-based analysis and future orderflow/wallet metrics
 */

import type { OrderflowDirection, OrderflowStrength } from '@/lib/data/orderflow'
import type { WalletAccumulation } from '@/lib/data/walletFlow'

/**
 * OCR Result Types
 */
export interface OCRResult {
  text: string
  confidence: number
  labels: string[]
  indicators: {
    rsi?: number
    bollinger?: 'upper' | 'middle' | 'lower'
    ema?: number[]
    sma?: number[]
    macd?: {
      value: number
      signal: number
      histogram: number
    }
    volume?: string
    price?: number
  }
  processingTime: number
}

/**
 * Dexscreener API Response Types
 */
export interface DexscreenerTokenData {
  price: number
  high24: number
  low24: number
  vol24: number
  liquidity?: number
  marketCap?: number
  priceChange24h?: number
  symbol?: string
  name?: string
  address?: string
  chain?: string
  timestamp: number
}

/**
 * Pump.fun API Response Types (Beta: Mock, Alpha: Live)
 */
export interface PumpfunTokenData {
  name: string
  symbol: string
  liquidity: number
  launchDate: string
  bondingCurve?: number
  creatorAddress?: string
  socialLinks?: {
    twitter?: string
    telegram?: string
    website?: string
  }
}

/**
 * AI Teaser Analysis Response
 */
export interface AITeaserAnalysis {
  sr_levels: Array<{
    label: string
    price: number
    type: 'support' | 'resistance'
  }>
  stop_loss: number
  tp: number[]
  indicators: string[]
  teaser_text: string
  confidence: number
  processingTime: number
  provider: 'openai' | 'grok' | 'anthropic' | 'heuristic'
}

/**
 * Core heuristic analysis (current implementation)
 */
export interface HeuristicAnalysis {
  supportLevel: number
  resistanceLevel: number
  rangeSize: 'Low' | 'Medium' | 'High'
  volatility24h: number
  bias: 'Bullish' | 'Bearish' | 'Neutral'
  keyLevels: number[]
  roundNumbers: number[]
  
  // Entry/Exit suggestions
  entryZone?: { min: number; max: number }
  reentryLevel?: number
  stopLoss?: number
  takeProfit1?: number
  takeProfit2?: number
  
  // Technical indicators (if detected from chart)
  rsiOverbought?: boolean
  rsiOversold?: boolean
  bollingerBandStatus?: 'upper' | 'lower' | 'middle' | 'neutral'
  macdSignal?: 'bullish' | 'bearish' | 'neutral'
  macdCrossover?: 'bullish_crossover' | 'bearish_crossover' | 'none'
  
  // Metadata
  confidence: number // 0-1 score
  timestamp: number
  source: 'heuristic' | 'ai' | 'hybrid'
}

/**
 * Optional flow metrics (Alpha+ feature - currently placeholders)
 * These fields are OPTIONAL and only populated if providers are enabled
 */
export interface FlowMetrics {
  // Orderflow data
  volumeDelta24h?: number
  orderflow?: OrderflowDirection
  orderflowStrength?: OrderflowStrength
  buyPressure?: number  // 0-1 ratio
  sellPressure?: number // 0-1 ratio
  
  // Wallet accumulation
  walletAccum?: WalletAccumulation
  walletConfidence?: number // 0-1 score
  whaleActivity?: {
    buying: number
    selling: number
    netFlow: number
  }
  
  // Smart money hints
  smartMoneyFollowing?: number
  smartMoneyAgainst?: number
  
  // Metadata
  flowDataTimestamp?: number
  flowDataSources?: string[] // ['birdeye', 'nansen', etc.]
}

/**
 * Complete analysis result combining heuristics + optional flow data
 */
export interface AnalysisResult {
  // Required core analysis
  heuristics: HeuristicAnalysis
  
  // Optional enhanced metrics (Alpha+)
  flow?: FlowMetrics
  
  // Token metadata (from Dexscreener or similar)
  token?: {
    symbol: string
    name: string
    address: string
    chain: 'solana' | 'ethereum' | 'bsc' | 'arbitrum' | 'base' | 'other'
    price: number
    priceChange24h?: number
    volume24h?: number
    liquidity?: number
    marketCap?: number
  }
  
  // Analysis metadata
  analyzedAt: number
  processingTime: number
  imageDataUrl?: string // Original or processed chart image
  
  // AI/LLM commentary (future)
  aiCommentary?: string
  aiProvider?: 'none' | 'openai' | 'grok' | 'anthropic'
}

/**
 * Analysis request/input
 */
export interface AnalysisRequest {
  type: 'image' | 'ca'
  imageFile?: File
  imageDataUrl?: string
  contractAddress?: string
  
  // Options
  includeFlowMetrics?: boolean  // Enable orderflow/wallet analysis
  includeAiCommentary?: boolean // Enable LLM commentary
  
  // Metadata
  sessionId: string
  timestamp: number
}

/**
 * Type guard to check if flow metrics are available
 */
export function hasFlowMetrics(analysis: AnalysisResult): analysis is AnalysisResult & { flow: FlowMetrics } {
  return analysis.flow !== undefined && 
    (analysis.flow.orderflow !== undefined || analysis.flow.walletAccum !== undefined)
}

/**
 * Type guard to check if token metadata is available
 */
export function hasTokenMetadata(analysis: AnalysisResult): analysis is AnalysisResult & { token: NonNullable<AnalysisResult['token']> } {
  return analysis.token !== undefined
}

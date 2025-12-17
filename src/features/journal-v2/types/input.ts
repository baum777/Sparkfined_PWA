import type { QuoteCurrency } from '@/types/currency'
import type { TradeSide } from '@/types/trade'

export type EmotionLabel =
  | 'fear'
  | 'greed'
  | 'anxiety'
  | 'calm'
  | 'excitement'
  | 'overconfidence'

export type MarketContext =
  | 'breakout'
  | 'mean-reversion'
  | 'chop'
  | 'high-vol'
  | 'low-vol'
  | 'trend-up'
  | 'trend-down'

export interface TradeContext {
  eventId?: number
  txHash: string
  walletId: number | null
  timestamp: number
  side: TradeSide
  amount?: number | null
  price?: number | null
  baseSymbol?: string | null
  quoteSymbol?: string | null
  quoteCurrency: QuoteCurrency
}

export interface JournalRawInput {
  emotionalState: EmotionLabel
  /**
   * Continuous emotional position (0–100).
   * UI shows semantic zones (Unsicher → Neutral → Optimistisch), no numeric scale.
   */
  emotionalScore: number // 0–100
  conviction: number // 0–10
  patternQuality: number // 0–10
  marketContext: MarketContext
  reasoning: string
  expectation: string
  selfReflection: string
  createdAt: number
  tradeContext?: TradeContext
}

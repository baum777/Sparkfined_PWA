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

export interface JournalRawInput {
  emotionalState: EmotionLabel
  emotionIntensity: number // 0–10
  conviction: number // 0–10
  patternQuality: number // 0–10
  marketContext: MarketContext
  reasoning: string
  expectation: string
  selfReflection: string
  createdAt: number
}

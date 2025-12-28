export type CognitiveBias =
  | 'confirmation'
  | 'loss-aversion'
  | 'overconfidence'
  | 'recency'
  | 'anchoring'
  | 'gambler'
  | 'survivorship'

export interface JournalDerived {
  emotionalVolatility: number
  riskAlignment: number
  cognitiveBiasFlags: CognitiveBias[]
  decisionQuality: number
}

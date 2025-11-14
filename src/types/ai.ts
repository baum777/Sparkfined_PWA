/**
 * Sparkfined TA-PWA — Beta v0.1 AI & heuristic types.
 * Reference: sparkfined_logic_bundle/types/ai_types.ts (read-only).
 */

export interface MarketMeta {
  symbol: string
  ticker: string
  timeframe: string
  exchange?: string
  source?: string
  asOf: string
}

export interface OhlcCandle {
  t: number
  o: number
  h: number
  l: number
  c: number
  v?: number
}

export interface RangeStructure {
  window_hours: number
  low: number
  high: number
  mid: number
}

export type LevelType =
  | 'support'
  | 'resistance'
  | 'round_number'
  | 'liquidity_cluster'
  | 'manual_tag'

export interface KeyLevel {
  price: number
  type: LevelType[]
  label?: string
  strength?: 'weak' | 'medium' | 'strong'
}

export type PriceZoneLabel =
  | 'support'
  | 'reentry'
  | 'target_tp1'
  | 'target_tp2'
  | 'stop_loss'

export interface PriceZone {
  label: PriceZoneLabel
  from: number
  to: number
  source_level: number
  offset_type: 'percent' | 'points'
  offset_value: number
  is_default: boolean
}

export type BiasLabel = 'bullish' | 'neutral' | 'bearish'

export interface BiasReading {
  bias: BiasLabel
  reason: string
  above_midrange: boolean
  higher_lows: boolean
  lower_highs: boolean
}

export interface FlowVolumeSnapshot {
  vol_24h_usd?: number
  vol_24h_delta_pct?: number
  source?: string
}

export interface MacroTag {
  label: string
  category?: 'macro_level' | 'narrative' | 'event'
}

export type IndicatorKind = 'rsi' | 'bollinger_bands'

export type IndicatorStatusLevel = 'low' | 'mid' | 'high' | 'extreme'

export interface IndicatorStatus {
  kind: IndicatorKind
  status: IndicatorStatusLevel | string
  source: 'ocr_panel' | 'derived' | 'manual'
}

export interface MarketSnapshotPayload {
  meta: MarketMeta
  candles: OhlcCandle[]
  indicators?: Record<string, unknown>

  liquidity_usd?: number
  market_cap_usd?: number
  volume_24h_usd?: number

  range_structure?: RangeStructure
  key_levels?: KeyLevel[]
  zones?: PriceZone[]
  bias?: BiasReading
  flow_volume?: FlowVolumeSnapshot
  macro_tags?: MacroTag[]
  indicator_status?: IndicatorStatus[]

  heuristics_source?: 'local_engine' | 'ocr_screenshot' | 'mixed'
}

export interface MarketSnapshotCard {
  bullets: string[]
  raw?: unknown
}

export interface DeepSignalCard {
  bullets: string[]
  text: string
  raw?: unknown
}

export type AnalysisLayerId =
  | 'L1_STRUCTURE'
  | 'L2_FLOW'
  | 'L3_TACTICAL'
  | 'L4_MACRO'
  | 'L5_INDICATORS'

export interface EditableField<T> {
  auto_value: T
  user_value?: T
  is_overridden: boolean
}

export interface AdvancedInsightSections {
  market_structure: {
    range: EditableField<RangeStructure>
    key_levels: EditableField<KeyLevel[]>
    zones: EditableField<PriceZone[]>
    bias: EditableField<BiasReading>
  }
  flow_volume: {
    flow: EditableField<FlowVolumeSnapshot>
  }
  playbook: {
    entries: EditableField<string[]>
  }
  macro?: {
    tags: EditableField<MacroTag[]>
  }
}

export interface AdvancedInsightCard {
  sections: AdvancedInsightSections
  source_payload: MarketSnapshotPayload
  active_layers?: AnalysisLayerId[]
}

export type AccessTier = 'free' | 'basic' | 'advanced_locked'

export interface FeatureAccessMeta {
  feature: 'advanced_deep_dive' | 'basic_snapshot' | 'journal_condense' | 'social_analysis'
  tier: AccessTier
  token_lock_id?: string
  is_unlocked: boolean
  reason?: string
}

export interface AnalyzeMarketResult {
  snapshot: MarketSnapshotCard | null
  deep_signal: DeepSignalCard | null
  sanity_flags?: string[]

  advanced?: AdvancedInsightCard | null
  access?: FeatureAccessMeta
}

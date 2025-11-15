// Sparkfined TA-PWA – AI & Analysis Types
// Consolidated from ai/types.ts and logic bundle ai_types.ts
// Beta v0.9: Core types for AI orchestration, market analysis, social sentiment

//
// === Core AI Provider & Orchestration ===
//

export type Provider = "openai" | "grok";

export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  maxDelayMs?: number;
  jitter?: number;
}

export interface TelemetryEvent {
  timestamp: string;
  provider: Provider;
  model: string;
  latencyMs: number;
  success: boolean;
  costUsd?: number | null;
  payloadSize?: number;
  additional?: Record<string, unknown>;
}

export type FetchLike = typeof fetch;

//
// === Social Analysis (Grok / xAI) ===
//

export type SentimentLabel = 'bullish' | 'bearish' | 'neutral' | 'mixed';

export interface SocialPostAuthor {
  id: string;                        // hashed user id
  handle?: string;                   // @name
  age_days?: number;                 // account age in days
  followers?: number;                // follower count
  following?: number;                // following count
  verified?: boolean;                // platform verified?
  is_bot_flag?: boolean;             // pre-flagged as bot
  created_at?: string;               // ISO timestamp
}

export type SocialSourceType = 'web' | 'api' | 'webhook' | 'scraper' | 'user' | 'unknown';

export interface SocialPost {
  id: string;
  text: string;                      // redacted text
  author: SocialPostAuthor;          // Changed from optional to required for consistency
  created_at: string;                // ISO timestamp
  post_frequency_per_day?: number;
  repeated?: boolean;
  source_type?: SocialSourceType;
  source: string;                    // Source identifier (from orchestrator types)
  url?: string;
  tags?: string[];                   // topics, tickers
  engagement?: {                     // From orchestrator types
    likes?: number;
    replies?: number;
    shares?: number;
  };
}

export type SocialAnalysisMode = 'newest' | 'oldest' | 'top' | 'mixed';

export interface SocialAnalysisRequestPayload {
  query?: string;                    // topic / ticker
  posts?: SocialPost[];              // optional pre-fetched posts
  mode?: SocialAnalysisMode;         // default: 'newest'
  limit?: number;                    // default: 10
}

export interface SocialPostAssessment {
  id: string;
  text_snippet: string;
  sentiment: SentimentLabel | number; // Allow both string label and numeric (-1 to 1)
  bot_score?: number;                // 0..1
  botScore?: number;                 // Alias for consistency with orchestrator
  isLikelyBot?: boolean;             // Derived flag
  weight?: number;                   // contribution to aggregate sentiment
  reason_flags?: string[];           // Flags explaining assessment
}

export interface SocialAggregate {
  label: string;                     // e.g. 'retail', 'whales'
  sentiment: SentimentLabel;
  share: number;                     // 0..1
}

export interface SocialAnalysis {
  provider: Provider;
  model: string;
  mode: SocialAnalysisMode;
  thesis: string;                    // 1–3 sentence narrative
  bullets: string[];                 // Key points from analysis
  sentiment: SentimentLabel | number; // Overall sentiment
  confidence: number;                // 0..1
  aggregates: {                      // From orchestrator (extended)
    positive: number;
    neutral: number;
    negative: number;
  };
  posts: SocialPostAssessment[];
  narrative_lore?: string;           // Extended narrative context
  source_trace: Record<string, unknown>;
  social_review_required: boolean;   // Flag for human review
  raw?: unknown;                     // raw Grok response (debug)
}

//
// === Market Snapshot & OHLC Data ===
//

export interface OhlcCandle {
  t: number;                         // timestamp (ms)
  o: number;
  h: number;
  l: number;
  c: number;
  v?: number;
}

// Legacy alias for backwards compatibility
export interface CandleSample {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface IndicatorMap {
  [indicatorName: string]: number | number[] | Record<string, number>;
}

export interface IndicatorSet {
  rsi?: number;
  sma50?: number;
  sma200?: number;
  atr?: number;
  macdHistogram?: number;
  volume24h?: number;
  [key: string]: unknown;
}

export interface OnchainContext {
  address?: string;
  txCount24h?: number;
  [key: string]: unknown;
}

export interface MarketMeta {
  symbol: string;                    // 'SOL/USDT'
  ticker: string;                    // 'SOL'
  timeframe: string;                 // '1m', '5m', '1h', '1d', ...
  exchange?: string;                 // 'Raydium', 'Jupiter', ...
  source: string;                    // 'DexScreener', 'DexPaprika', ...
  timestamp: string;                 // ISO timestamp
  asOf?: string;                     // Alias for timestamp
}

//
// === Layered Analysis Model (L1-L5) ===
// Note: L4-L5 are future roadmap, included for completeness
//

// L1 – Structure context

export interface RangeStructure {
  window_hours: number;              // e.g. 24
  low: number;                       // range low
  high: number;                      // range high
  mid: number;                       // (low + high) / 2
}

export type LevelType =
  | 'support'
  | 'resistance'
  | 'round_number'
  | 'liquidity_cluster'
  | 'manual_tag';

export interface KeyLevel {
  price: number;
  type: LevelType[];
  label?: string;                    // '45k', 'ATH Cluster', ...
  strength?: 'weak' | 'medium' | 'strong';
}

// L2 – Flow & volume

export interface FlowVolumeSnapshot {
  vol_24h_usd?: number;              // DexScreener if available
  vol_24h_delta_pct?: number;        // delta vs previous 24h
  source?: string;
}

// L3 – Tactical zones

export type PriceZoneLabel =
  | 'support'
  | 'reentry'
  | 'target_tp1'
  | 'target_tp2'
  | 'stop_loss';

export interface PriceZone {
  label: PriceZoneLabel;
  from: number;
  to: number;
  source_level: number;              // base S/R price used to derive zone
  offset_type: 'percent' | 'points';
  offset_value: number;              // e.g. 0.02 (2%) or 50 ($50)
  is_default: boolean;               // true = auto suggestion
}

export type BiasLabel = 'bullish' | 'neutral' | 'bearish';

export interface BiasReading {
  bias: BiasLabel;
  reason: string;                    // text explanation
  above_midrange: boolean;
  higher_lows: boolean;
  lower_highs: boolean;
}

// L4 – Macro lens (Future)

export interface MacroTag {
  label: string;                     // '42k', '45k', '68k'
  category?: 'macro_level' | 'narrative' | 'event';
}

// L5 – Indicator status (Future)

export type IndicatorKind = 'rsi' | 'bollinger_bands';
export type IndicatorStatusLevel = 'low' | 'mid' | 'high' | 'extreme';

export interface IndicatorStatus {
  kind: IndicatorKind;
  status: IndicatorStatusLevel | string;   // e.g. "RSI≈70 (hoch)", "BB-Expand"
  source: 'ocr_panel' | 'derived' | 'manual';
}

//
// === Market Analysis Payloads & Results ===
//

export interface MarketPayload {
  ticker: string;
  price: number;
  timeframe: string;
  candleSamples?: CandleSample[];
  onchain?: OnchainContext;
  indicators: IndicatorSet;
  meta: MarketMeta;
  includeSocial?: boolean;
  socialMode?: SocialAnalysisMode;
  socialQuery?: string;
  socialSources?: string[];
  socialFilters?: Record<string, unknown>;
  socialDedupeWindowMinutes?: number;
}

export interface MarketSnapshotPayload {
  meta: MarketMeta;
  candles: OhlcCandle[];
  indicators?: IndicatorMap;

  liquidity_usd?: number;
  market_cap_usd?: number;
  volume_24h_usd?: number;

  // Heuristic pre-analysis
  range_structure?: RangeStructure;
  key_levels?: KeyLevel[];
  zones?: PriceZone[];
  bias?: BiasReading;
  flow_volume?: FlowVolumeSnapshot;
  macro_tags?: MacroTag[];
  indicator_status?: IndicatorStatus[];

  heuristics_source?: 'local_engine' | 'ocr_screenshot' | 'mixed';
}

export interface BulletAnalysis {
  provider: Provider;
  model: string;
  bullets: string[];
  source_trace: Record<string, unknown>;
  rawText?: string;
  costUsd?: number | null;
}

export interface MarketSnapshotCard {
  bullets: string[];
  raw?: unknown;
}

export interface DeepSignalPayload {
  ticker: string;
  indicators: IndicatorMap;
  meta?: Partial<MarketMeta>;        // at least .source / .timeframe if available
  context?: string;                  // optional extra user instructions
}

export interface DeepSignalResult {
  bullets: string[];
  text: string;                      // full OpenAI answer
}

export interface DeepSignalCard extends DeepSignalResult {}

//
// === Advanced Insight & Token Gating ===
//

export type AnalysisLayerId = 'L1_STRUCTURE' | 'L2_FLOW' | 'L3_TACTICAL' | 'L4_MACRO' | 'L5_INDICATORS';

export interface EditableField<T> {
  auto_value: T;                     // system suggestion
  user_value?: T;                    // user override
  is_overridden: boolean;
}

export interface AdvancedInsightSections {
  market_structure: {
    range: EditableField<RangeStructure>;
    key_levels: EditableField<KeyLevel[]>;
    zones: EditableField<PriceZone[]>;
    bias: EditableField<BiasReading>;
  };
  flow_volume: {
    flow: EditableField<FlowVolumeSnapshot>;
  };
  playbook: {
    entries: EditableField<string[]>; // concrete "if X then Y" steps
  };
  macro: {
    tags: EditableField<MacroTag[]>;
  };
}

export interface AdvancedInsightCard {
  sections: AdvancedInsightSections;
  source_payload: MarketSnapshotPayload;
  active_layers?: AnalysisLayerId[];
}

export type AccessTier = 'free' | 'basic' | 'advanced_locked';

export interface FeatureAccessMeta {
  feature: 'advanced_deep_dive' | 'basic_snapshot' | 'journal_condense' | 'social_analysis';
  tier: AccessTier;
  token_lock_id?: string;            // on-chain lock account id
  is_unlocked: boolean;
  reason?: string;                   // for locked state messages
}

export interface AnalyzeMarketResult {
  snapshot: MarketSnapshotCard | null;
  deep_signal: DeepSignalCard | null;
  sanity_flags?: string[];

  advanced?: AdvancedInsightCard | null;
  access?: FeatureAccessMeta;        // token-lock & gating meta
}

//
// === Orchestrator Result (Final Output) ===
//

export interface OrchestratorResult {
  marketAnalysis: BulletAnalysis;
  socialAnalysis?: SocialAnalysis;
  meta: {
    usedProviders: Provider[];
    timestamp: string;
    samplingRate: number;
    costUsdEstimate: number;
    warnings: string[];
  };
}

//
// === Bot Score & Sanity Checks ===
//

export interface BotScorePostPayload {
  author?: {
    age_days?: number;
    followers?: number;
    verified?: boolean;
  };
  post_frequency_per_day?: number;
  repeated?: boolean;
  source_type?: SocialSourceType;
  text?: string;
}

export type BotScore = number;       // 0..1

export type SanityCheckInputBullets = string[];
export type SanityCheckInputPayload =
  | MarketSnapshotPayload
  | DeepSignalPayload
  | MarketPayload;
export type SanityCheckOutputBullets = string[];

//
// === Sampling & A/B Testing (Future) ===
//

export interface SamplingContext {
  rate: number;                      // 0.01, 0.05, 0.1
  event: string;                     // originating event name
  user_id?: string;
  ab_bucket?: string;
}

//
// === Journal & Trade Logging (Future - Q1 2025) ===
// Note: These are structural placeholders for post-Beta integration
//

export interface TradeEntry {
  id: string;
  symbol: string;
  side: 'long' | 'short' | 'neutral';
  bias: BiasLabel;
  entry_zone: string;
  sl: string;
  tp_levels: string[];
  key_levels: string[];
  notes_playbook: string;
  emotion_tags?: string[];           // ['FOMO', 'revenge', ...]
  is_quick_log?: boolean;
  created_at: string;                // ISO
}

export interface WalletTransactionLog {
  tx_id: string;
  wallet: string;
  token: string;
  amount: number;
  price?: number;
  side: 'buy' | 'sell';
  ts: string;                        // ISO
  linked_entry_id?: string;
  auto_generated: boolean;
}

export interface LearningMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;                     // '%', 'trades', etc.
}

export interface PersonalizedTip {
  tip_id: string;
  tip_text: string;
  reason: string;
  derived_from_entry_ids: string[];
  seen?: boolean;
  dismissed?: boolean;
}

export interface Badge {
  id: string;
  label: string;
  earned_at: string;                 // ISO
}

export interface GamificationState {
  reflection_streak_days: number;
  skill_streak_days: number;
  badges: Badge[];
}

//
// === Screenshot & OCR (Future) ===
//

export interface ScreenshotMeta {
  screenshot_id: string;
  file_size_bytes: number;
  source: 'upload' | 'snip';
  crop_bounds?: { x: number; y: number; width: number; height: number };
  created_at: string;                // ISO
}

export interface OcrResult {
  screenshot_id: string;
  ocr_token_symbol?: string;
  ocr_price?: number;
  ocr_time?: string;                 // ISO
  validated_against_ca: boolean;
}

export interface CaResolveResult {
  ca_from_clipboard: string;
  status: 'pending' | 'ok' | 'error';
  token_meta?: {
    name?: string;
    symbol?: string;
    decimals?: number;
    network?: string;
  };
  error_message?: string;
}

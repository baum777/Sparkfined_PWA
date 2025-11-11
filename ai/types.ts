export type Provider = "openai" | "grok";

export interface CandleSample {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface OnchainContext {
  address?: string;
  txCount24h?: number;
  [key: string]: unknown;
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

export interface MarketMeta {
  source: string;
  timestamp: string;
  [key: string]: unknown;
}

export interface MarketPayload {
  ticker: string;
  price: number;
  timeframe: string;
  candleSamples?: CandleSample[];
  onchain?: OnchainContext;
  indicators: IndicatorSet;
  meta: MarketMeta;
  includeSocial?: boolean;
  socialMode?: "newest" | "oldest";
  socialQuery?: string;
  socialSources?: string[];
  socialFilters?: Record<string, unknown>;
  socialDedupeWindowMinutes?: number;
}

export interface BulletAnalysis {
  provider: Provider;
  model: string;
  bullets: string[];
  source_trace: Record<string, unknown>;
  rawText?: string;
  costUsd?: number | null;
}

export interface SocialPost {
  id: string;
  text: string;
  created_at: string;
  source: string;
  source_type?: "api" | "webhook" | "scraper" | "user";
  engagement?: {
    likes?: number;
    replies?: number;
    shares?: number;
  };
  author: {
    id: string;
    created_at?: string;
    followers?: number;
    following?: number;
    verified?: boolean;
    is_bot_flag?: boolean;
  };
}

export interface SocialPostAssessment {
  id: string;
  text_snippet: string;
  sentiment: number;
  botScore: number;
  isLikelyBot: boolean;
  reason_flags: string[];
}

export interface SocialAnalysis {
  provider: Provider;
  model: string;
  mode: "newest" | "oldest";
  thesis: string;
  bullets: string[];
  sentiment: number;
  confidence: number;
  aggregates: {
    positive: number;
    neutral: number;
    negative: number;
  };
  posts: SocialPostAssessment[];
  narrative_lore?: string;
  source_trace: Record<string, unknown>;
  social_review_required: boolean;
}

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

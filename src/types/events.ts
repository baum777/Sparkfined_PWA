import type { SentimentLabel } from '@/types/ai';

// --- Core enums & helper types ------------------------------------------------

export type TrendSentimentLabel = SentimentLabel | 'warning' | 'opportunity';

export type TrendHypeLevel = 'cooldown' | 'steady' | 'acceleration' | 'mania';

export type TrendCallToAction =
  | 'watch'
  | 'scalp'
  | 'swing'
  | 'take-profit'
  | 'avoid'
  | 'monitor'
  | 'unknown';

export type TrendSearchTopic = 'entry' | 'exit' | 'risk' | 'meme' | 'rotation' | 'unknown';

export interface GrokTweetTokenMarketSnapshot {
  price_usd?: number;
  price_change_24h_pct?: number;
  volume_24h_usd?: number;
  liquidity_usd?: number;
  market_cap_usd?: number;
  fdv_usd?: number;
}

// --- Grok payloads ------------------------------------------------------------

export interface GrokTweetTokenRef {
  token_symbol?: string;
  symbol?: string; // fallback for legacy payloads
  cashtag?: string;
  name?: string;
  chain?: string;
  contract_address?: string;
  dex_pair?: string;
  slug?: string;
  score?: number;
  market?: GrokTweetTokenMarketSnapshot;
}

export interface GrokTweetMetrics {
  likes?: number;
  reposts?: number;
  replies?: number;
  quotes?: number;
  bookmarks?: number;
  views?: number;
  engagement_rate?: number;
}

export interface GrokTweetSentiment {
  score?: number;
  label?: TrendSentimentLabel;
  confidence?: number;
  keywords?: string[];
  journal_context_tags?: string[];
  emotion_tags?: string[];
}

export interface GrokTweetAnalytics {
  trending_score?: number;
  alert_relevance?: number;
  hype_level?: TrendHypeLevel;
  journal_context_tags?: string[];
  replay_flag?: boolean;
  narrative?: string;
}

export type GrokAuthorType =
  | 'retail'
  | 'influencer'
  | 'project'
  | 'whale'
  | 'bot'
  | 'news'
  | 'unknown';

export interface GrokTweetAuthor {
  id?: string;
  handle?: string;
  display_name?: string;
  avatar_url?: string;
  followers?: number;
  following?: number;
  verified?: boolean;
  type?: GrokAuthorType;
  influence_score?: number;
}

export interface GrokTweetPayload {
  id: string;
  url?: string;
  text?: string;
  full_text?: string;
  language?: string | null;
  created_at: string;
  imported_at?: string;
  platform?: 'twitter' | 'x' | string;
  author?: GrokTweetAuthor;
  tokens?: GrokTweetTokenRef[];
  attachments?: {
    has_media?: boolean;
    has_links?: boolean;
  };
  metrics?: GrokTweetMetrics;
  sentiment?: GrokTweetSentiment;
  analytics?: GrokTweetAnalytics;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

export interface SolanaMemeTrendSource {
  platform: string;
  tweetId: string;
  tweetUrl?: string;
  importedAt: string;
}

export interface SolanaMemeTrendAuthor {
  handle: string;
  displayName?: string;
  followers?: number;
  verified?: boolean;
  authorType: GrokAuthorType;
  influenceScore?: number;
}

export interface SolanaMemeTrendTweet {
  createdAt: string;
  fullText: string;
  language?: string | null;
  cashtags: string[];
  hashtags: string[];
  hasMedia: boolean;
  hasLinks: boolean;
  metrics: GrokTweetMetrics;
}

export interface SolanaMemeTrendToken {
  symbol: string;
  cashtag?: string;
  chain: 'solana';
  contractAddress?: string;
  slug?: string;
  dexPair?: string;
}

export interface SolanaMemeTrendMarketSnapshot {
  priceUsd?: number;
  priceChange24hPct?: number;
  volume24hUsd?: number;
  liquidityUsd?: number;
  marketCapUsd?: number;
  fdvUsd?: number;
}

export interface SolanaMemeTrendSentiment {
  score?: number;
  label?: TrendSentimentLabel;
  confidence?: number;
  keywords?: string[];
  hypeLevel?: TrendHypeLevel;
}

export interface SolanaMemeTrendTrading {
  hypeLevel?: TrendHypeLevel;
  callToAction?: TrendCallToAction;
  volatilityRisk?: number;
}

export interface SolanaMemeTrendSparkfined {
  trendingScore?: number;
  alertRelevance?: number;
  journalContextTags: string[];
  emotionTags: string[];
  replayFlag: boolean;
  narrative?: string;
  callToAction?: TrendCallToAction;
}

export interface SolanaMemeTrendSearchDocument {
  id: string;
  symbol: string;
  cashtag: string;
  tweetId: string;
  authorHandle: string;
  authorType: string;
  language: string;
  createdAt: string;
  receivedAt: string;
  fullText: string;
  tokensJoined: string;
  sentimentLabel: TrendSentimentLabel | 'unknown';
  hypeLevel: TrendHypeLevel | 'unknown';
  callToAction: TrendCallToAction;
  searchTopic: TrendSearchTopic;
  trendingScore: number;
  alertRelevance: number;
  mediaPresent: boolean;
  linksPresent: boolean;
}

export interface SolanaMemeTrendDerived {
  normalizedSymbol: string;
  primaryCashtag: string;
  lastUpdated: string;
  searchTopic?: TrendSearchTopic;
  authorCategory?: GrokAuthorType;
  twitterScore?: number;
  volatilityHint?: 'calm' | 'building' | 'spiky';
  searchDocument?: SolanaMemeTrendSearchDocument;
}

export interface SolanaMemeTrendEvent {
  id: string;
  source: SolanaMemeTrendSource;
  author: SolanaMemeTrendAuthor;
  tweet: SolanaMemeTrendTweet;
  token: SolanaMemeTrendToken;
  market?: SolanaMemeTrendMarketSnapshot;
  sentiment?: SolanaMemeTrendSentiment;
  trading?: SolanaMemeTrendTrading;
  sparkfined: SolanaMemeTrendSparkfined;
  derived: SolanaMemeTrendDerived;
  receivedAt: string;
}

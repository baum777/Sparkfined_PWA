import type { SentimentLabel } from '@/types/ai';

export type TrendSentimentLabel = SentimentLabel | 'warning' | 'opportunity';
export type TrendHypeLevel = 'cooldown' | 'steady' | 'acceleration' | 'mania';
export type TrendCallToAction = 'watch' | 'scalp' | 'swing' | 'take-profit' | 'avoid';

export interface GrokTweetTokenMarketSnapshot {
  price_usd?: number;
  price_change_24h_pct?: number;
  volume_24h_usd?: number;
  liquidity_usd?: number;
  market_cap_usd?: number;
  fdv_usd?: number;
}

export interface GrokTweetTokenRef {
  symbol?: string;
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
}

export interface SolanaMemeTrendDerived {
  normalizedSymbol: string;
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

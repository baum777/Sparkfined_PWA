// Global type definitions

export interface AppConfig {
  apiBaseUrl: string
  apiKey: string
  enableAnalytics: boolean
  enableDebug: boolean
  
  // Feature flags
  enableCaLookup?: boolean
  enableChartAnalysis?: boolean
  enableMetrics?: boolean
  enableOfflineMode?: boolean
  
  // Provider configuration
  analysisAiProvider?: 'none' | 'openai' | 'grok' | 'anthropic'
  orderflowProvider?: 'none' | 'birdeye' | 'bubblemaps' | 'custom'
  walletflowProvider?: 'none' | 'nansen' | 'arkham' | 'custom'
}

export type Theme = 'light' | 'dark'

export interface User {
  id: string
  email: string
  name: string
}

// Re-export analysis types for convenience
export type { AnalysisResult, AnalysisRequest, HeuristicAnalysis, FlowMetrics } from './analysis'

// Re-export AI types for convenience
export type {
  Provider,
  SentimentLabel,
  SocialPost,
  SocialAnalysis,
  BulletAnalysis,
  OrchestratorResult,
  MarketPayload,
  MarketSnapshotPayload,
  AnalyzeMarketResult,
  BotScore,
} from './ai'

// Event pipeline types
export type {
  SolanaMemeTrendEvent,
  SolanaMemeTrendSparkfined,
  SolanaMemeTrendTrading,
  SolanaMemeTrendSentiment,
  SolanaMemeTrendMarketSnapshot,
  SolanaMemeTrendToken,
  SolanaMemeTrendTweet,
  SolanaMemeTrendAuthor,
  SolanaMemeTrendSearchDocument,
  GrokTweetPayload,
  GrokTweetTokenRef,
  TrendSentimentLabel,
  TrendHypeLevel,
  TrendCallToAction,
  TrendSearchTopic,
  TrendTradingTimeframe,
} from './events'

// Journal Insights types (Loop J3-A)
export type {
  JournalInsight,
  JournalInsightCategory,
  JournalInsightSeverity,
  JournalInsightResult,
} from './journalInsights'

// Social insight aggregations (Loop J4-A)
export type { SocialInsightMetric, SocialStatsSnapshot } from './journalSocial'

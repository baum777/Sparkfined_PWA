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

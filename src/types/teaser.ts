/**
 * Alpha Issue 7: AI Teaser Adapter
 * Types and schema for AI-powered analysis teaser
 */

// Zod schema will be added during Issue 7 implementation
// For now, we define the TypeScript interface

export interface SRLevel {
  label: string; // e.g., "S1", "R2", "Pivot"
  price: number;
}

export interface TeaserResult {
  sr_levels: SRLevel[];
  stop_loss: number;
  tp: number[]; // Take profit levels
  indicators: string[]; // e.g., ["RSI:70", "MACD:bullish"]
  teaser_text: string; // Short analysis summary
  confidence?: number;
  timestamp?: number;
}

/**
 * AI Provider types
 */
export type AIProvider = 'none' | 'openai' | 'grok' | 'anthropic';

/**
 * AI Teaser request
 */
export interface TeaserRequest {
  provider: AIProvider;
  chartData?: string; // Base64 encoded image or URL
  tokenData?: {
    symbol: string;
    price: number;
    high24: number;
    low24: number;
  };
  timeout?: number; // Default 2000ms
}

/**
 * AI Teaser response with metadata
 */
export interface TeaserResponse {
  result: TeaserResult;
  meta: {
    provider: AIProvider;
    latencyMs: number;
    fallback: boolean;
    cached: boolean;
  };
}

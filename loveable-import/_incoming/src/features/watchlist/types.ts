export type TrendDirection = 'bullish' | 'bearish' | 'neutral';

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  trend?: TrendDirection;
  relevance?: number; // 0-100 percentage
  addedAt: Date;
}

/**
 * useAdvancedInsight Hook
 * Fetch real Advanced Insight data from backend
 * 
 * Beta v0.9: Replaces mock data with real API calls
 */

import { useState, useCallback } from 'react';
import type {
  AnalyzeMarketResult,
  AdvancedInsightCard,
  FeatureAccessMeta,
  OhlcCandle,
} from '@/types/ai';
import { useAdvancedInsightStore } from '@/features/analysis/advancedInsightStore';

export interface UseAdvancedInsightOptions {
  /** Auto-ingest into store on success */
  autoIngest?: boolean;
  
  /** Check access gating */
  checkAccess?: boolean;
}

export interface AdvancedInsightRequest {
  address: string;
  timeframe: string;
  price?: number;
  volume24hUsd?: number;
  marketCapUsd?: number;
  liquidityUsd?: number;
  candles?: OhlcCandle[];
}

export interface UseAdvancedInsightResult {
  /** Loading state */
  loading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Latest result */
  result: AnalyzeMarketResult | null;
  
  /** Fetch Advanced Insight data */
  fetch: (request: AdvancedInsightRequest) => Promise<AnalyzeMarketResult | null>;
  
  /** Clear current result */
  clear: () => void;
}

/**
 * Hook for fetching Advanced Insight data from backend
 * 
 * Usage:
 * ```tsx
 * const { loading, error, result, fetch } = useAdvancedInsight({ autoIngest: true });
 * 
 * const handleAnalyze = async () => {
 *   await fetch({
 *     address: 'SOL',
 *     timeframe: '15m',
 *     volume24hUsd: 1000000,
 *   });
 * };
 * ```
 */
export function useAdvancedInsight(
  options: UseAdvancedInsightOptions = {}
): UseAdvancedInsightResult {
  const { autoIngest = true, checkAccess = true } = options;
  const advancedInsightStore = useAdvancedInsightStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeMarketResult | null>(null);

  const fetch = useCallback(
    async (request: AdvancedInsightRequest): Promise<AnalyzeMarketResult | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await window.fetch('/api/ai?action=analyze-market', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...request,
            checkAccess,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data: AnalyzeMarketResult = await response.json();
        
        setResult(data);

        // Auto-ingest into store if enabled
        if (autoIngest && data.advanced) {
          advancedInsightStore.ingest(data.advanced, data.access);
        }

        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to fetch Advanced Insight data';
        setError(errorMessage);
        console.error('[useAdvancedInsight] Error:', err);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [autoIngest, checkAccess, advancedInsightStore]
  );

  const clear = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return {
    loading,
    error,
    result,
    fetch,
    clear,
  };
}

/**
 * Hook for manual Advanced Insight ingestion (without fetching)
 * Useful when you already have the data and just want to ingest
 */
export function useAdvancedInsightIngest() {
  const advancedInsightStore = useAdvancedInsightStore();

  const ingest = useCallback(
    (data: AdvancedInsightCard, access?: FeatureAccessMeta) => {
      advancedInsightStore.ingest(data, access);
    },
    [advancedInsightStore]
  );

  return { ingest };
}

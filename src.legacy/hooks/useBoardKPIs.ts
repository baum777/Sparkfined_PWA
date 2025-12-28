/**
 * useBoardKPIs Hook
 * 
 * Fetches and manages Board KPI data:
 * - Loading/Error/Success states
 * - Auto-refresh every 30s (configurable)
 * - Manual refresh support
 * - Cache-first strategy (stale-while-revalidate)
 * 
 * Usage:
 * const { data, loading, error, refresh } = useBoardKPIs({ autoRefresh: true });
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface KPI {
  id: string;
  label: string;
  value: string | number;
  type: 'numeric' | 'count' | 'status' | 'timestamp';
  direction?: 'up' | 'down' | 'neutral';
  trend?: string;
  icon?: 'alert' | 'chart' | 'journal' | 'sync' | 'time';
  timestamp?: number;
}

interface KPIResponse {
  ok: boolean;
  data: KPI[];
  timestamp: number;
}

interface UseBoardKPIsOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds (default: 30000)
  enabled?: boolean; // Allow hook to be disabled
}

interface UseBoardKPIsReturn {
  data: KPI[] | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

export default function useBoardKPIs({
  autoRefresh = true,
  refreshInterval = 30000,
  enabled = true,
}: UseBoardKPIsOptions = {}): UseBoardKPIsReturn {
  const [data, setData] = useState<KPI[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchKPIs = useCallback(async () => {
    if (!enabled) return;
    
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/board/kpis', {
        signal: abortControllerRef.current.signal,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: KPIResponse = await response.json();
      
      if (!result.ok) {
        throw new Error('Failed to fetch KPIs');
      }
      
      setData(result.data);
      setLastUpdated(result.timestamp);
      setError(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }
      console.error('[useBoardKPIs] Error:', err);
      setError(err.message || 'Failed to load KPIs');
    } finally {
      setLoading(false);
    }
  }, [enabled]);
  
  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchKPIs();
    }
  }, [enabled, fetchKPIs]);
  
  // Auto-refresh
  useEffect(() => {
    if (!enabled || !autoRefresh) return;
    
    intervalRef.current = setInterval(() => {
      fetchKPIs();
    }, refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, autoRefresh, refreshInterval, fetchKPIs]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
  
  return {
    data,
    loading,
    error,
    refresh: fetchKPIs,
    lastUpdated,
  };
}

/**
 * Usage Examples:
 * 
 * // Auto-refresh every 30s
 * const { data, loading, error } = useBoardKPIs();
 * 
 * // Custom refresh interval (10s)
 * const { data, loading, error } = useBoardKPIs({ refreshInterval: 10000 });
 * 
 * // Manual refresh only
 * const { data, loading, error, refresh } = useBoardKPIs({ autoRefresh: false });
 * 
 * // Conditional fetching
 * const { data } = useBoardKPIs({ enabled: isLoggedIn });
 */

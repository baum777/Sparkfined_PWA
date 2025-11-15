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

export interface BoardKPISummary {
  totalPnL?: number;
  pnlChange?: number;
  winRate?: number;
  winRateChange?: number;
  activeAlerts?: number;
  journalCount?: number;
  journalChange?: number;
}

interface UseBoardKPIsReturn {
  data: KPI[] | null;
  summary: BoardKPISummary | null;
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
  const [summary, setSummary] = useState<BoardKPISummary | null>(null);
  
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
        setSummary(buildSummary(result.data));
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
      summary,
    loading,
    error,
    refresh: fetchKPIs,
    lastUpdated,
  };
}

function buildSummary(kpis: KPI[]): BoardKPISummary {
  if (!kpis.length) {
    return {};
  }

  const byId = new Map(kpis.map((kpi) => [kpi.id, kpi]));

  const pnl = byId.get('pnl-today');
  const winRate = byId.get('win-rate');
  const alerts = byId.get('active-alerts');
  const journal = byId.get('journal-entries');

  return {
    totalPnL: toNumber(pnl?.value),
    pnlChange: toNumber(pnl?.trend),
    winRate: toNumber(winRate?.value),
    winRateChange: toNumber(winRate?.trend),
    activeAlerts: toNumber(alerts?.value),
    journalCount: toNumber(journal?.value),
    journalChange: toNumber(journal?.trend),
  };
}

function toNumber(input: string | number | undefined): number | undefined {
  if (typeof input === 'number') {
    return input;
  }

  if (typeof input === 'string') {
    const cleaned = input.replace(/[^\d.-]/g, '');
    if (!cleaned) return undefined;
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
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

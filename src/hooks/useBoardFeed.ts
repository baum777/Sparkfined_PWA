/**
 * useBoardFeed Hook
 * 
 * Fetches and manages Board Feed data:
 * - Loading/Error/Success states
 * - Pagination support (limit, offset)
 * - Filter by type (all, alerts, journal, etc.)
 * - Auto-refresh every 10s (configurable)
 * - Manual refresh support
 * - Load more support
 * 
 * Usage:
 * const { data, loading, error, loadMore, refresh } = useBoardFeed({ type: 'all', limit: 20 });
 */

import { useState, useEffect, useCallback, useRef } from 'react';

interface FeedEvent {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
  metadata?: {
    symbol?: string;
    timeframe?: string;
    pnl?: number;
    alertId?: string;
  };
}

interface FeedResponse {
  ok: boolean;
  data: FeedEvent[];
  total: number;
  limit: number;
  offset: number;
  timestamp: number;
}

interface UseBoardFeedOptions {
  type?: 'all' | 'alerts' | 'journal' | 'analysis' | 'export' | 'error';
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // milliseconds (default: 10000)
  enabled?: boolean;
}

interface UseBoardFeedReturn {
  data: FeedEvent[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  lastUpdated: number | null;
}

export default function useBoardFeed({
  type = 'all',
  limit = 20,
  autoRefresh = true,
  refreshInterval = 10000,
  enabled = true,
}: UseBoardFeedOptions = {}): UseBoardFeedReturn {
  const [data, setData] = useState<FeedEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [offset, setOffset] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const fetchFeed = useCallback(
    async (newOffset = 0, append = false) => {
      if (!enabled) return;
      
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      try {
        setLoading(true);
        setError(null);
        
        const params = new URLSearchParams({
          type,
          limit: limit.toString(),
          offset: newOffset.toString(),
        });
        
        const response = await fetch(`/api/board/feed?${params}`, {
          signal: abortControllerRef.current.signal,
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result: FeedResponse = await response.json();
        
        if (!result.ok) {
          throw new Error('Failed to fetch feed');
        }
        
        setData((prev) => (append ? [...prev, ...result.data] : result.data));
        setHasMore(newOffset + result.data.length < result.total);
        setOffset(newOffset);
        setLastUpdated(result.timestamp);
        setError(null);
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // Request was cancelled, ignore
          return;
        }
        console.error('[useBoardFeed] Error:', err);
        setError(err.message || 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    },
    [enabled, type, limit]
  );
  
  // Initial fetch
  useEffect(() => {
    if (enabled) {
      fetchFeed(0, false);
    }
  }, [enabled, type, limit]); // Re-fetch when type or limit changes
  
  // Auto-refresh (reset to first page)
  useEffect(() => {
    if (!enabled || !autoRefresh) return;
    
    intervalRef.current = setInterval(() => {
      fetchFeed(0, false);
    }, refreshInterval);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, autoRefresh, refreshInterval, fetchFeed]);
  
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
  
  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await fetchFeed(offset + limit, true);
  }, [hasMore, loading, offset, limit, fetchFeed]);
  
  const refresh = useCallback(async () => {
    await fetchFeed(0, false);
  }, [fetchFeed]);
  
  return {
    data,
    loading,
    error,
    hasMore,
    loadMore,
    refresh,
    lastUpdated,
  };
}

/**
 * Usage Examples:
 * 
 * // All events, auto-refresh every 10s
 * const { data, loading, error, loadMore, hasMore } = useBoardFeed();
 * 
 * // Only alerts
 * const { data } = useBoardFeed({ type: 'alerts' });
 * 
 * // Custom limit, manual refresh
 * const { data, refresh } = useBoardFeed({ limit: 50, autoRefresh: false });
 * 
 * // Conditional fetching
 * const { data } = useBoardFeed({ enabled: isLoggedIn });
 * 
 * // Load more pagination
 * <button onClick={loadMore} disabled={!hasMore}>Load More</button>
 */

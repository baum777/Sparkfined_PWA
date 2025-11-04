/**
 * Offline Sync Utilities
 * 
 * Handles background synchronization between:
 * - API responses → IndexedDB cache
 * - Stale cache → Fresh API data
 * - Offline queue → Server (when online)
 * 
 * Features:
 * - Auto-cache API responses to IndexedDB
 * - Serve cached data when offline
 * - Background sync when reconnected
 * - Stale-while-revalidate pattern
 */

import { 
  cacheKPIs, 
  getCachedKPIs, 
  cacheFeedEvents, 
  getCachedFeedEvents,
  clearOldFeedCache,
  type KPICache,
  type FeedEventCache,
} from './db-board';

// ===== KPI Sync =====

/**
 * Sync KPI data to IndexedDB cache
 * Called after successful API fetch
 */
export async function syncKPIsToCache(kpis: any[]): Promise<void> {
  try {
    const kpiCache: KPICache[] = kpis.map((kpi) => ({
      id: kpi.id,
      label: kpi.label,
      value: kpi.value,
      type: kpi.type,
      direction: kpi.direction,
      trend: kpi.trend,
      icon: kpi.icon,
      timestamp: kpi.timestamp,
      cachedAt: Date.now(),
    }));
    
    await cacheKPIs(kpiCache);
    console.log('[OfflineSync] KPIs cached to IndexedDB:', kpiCache.length);
  } catch (error) {
    console.error('[OfflineSync] Failed to cache KPIs:', error);
  }
}

/**
 * Load KPIs from cache (fallback for offline)
 */
export async function loadKPIsFromCache(): Promise<KPICache[]> {
  try {
    const cached = await getCachedKPIs();
    console.log('[OfflineSync] Loaded KPIs from cache:', cached.length);
    return cached;
  } catch (error) {
    console.error('[OfflineSync] Failed to load KPIs from cache:', error);
    return [];
  }
}

// ===== Feed Sync =====

/**
 * Sync feed events to IndexedDB cache
 * Called after successful API fetch
 */
export async function syncFeedToCache(events: any[]): Promise<void> {
  try {
    const feedCache: FeedEventCache[] = events.map((event) => ({
      id: event.id,
      type: event.type,
      text: event.text,
      timestamp: event.timestamp,
      unread: event.unread,
      cachedAt: Date.now(),
      metadata: event.metadata,
    }));
    
    await cacheFeedEvents(feedCache);
    console.log('[OfflineSync] Feed events cached to IndexedDB:', feedCache.length);
    
    // Clear old cache entries (older than 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const deletedCount = await clearOldFeedCache(sevenDaysAgo);
    if (deletedCount > 0) {
      console.log('[OfflineSync] Cleared old feed cache:', deletedCount, 'entries');
    }
  } catch (error) {
    console.error('[OfflineSync] Failed to cache feed:', error);
  }
}

/**
 * Load feed events from cache (fallback for offline)
 */
export async function loadFeedFromCache(limit = 20): Promise<FeedEventCache[]> {
  try {
    const cached = await getCachedFeedEvents(limit);
    console.log('[OfflineSync] Loaded feed from cache:', cached.length);
    return cached;
  } catch (error) {
    console.error('[OfflineSync] Failed to load feed from cache:', error);
    return [];
  }
}

// ===== Online/Offline Status =====

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Add online/offline event listeners
 */
export function setupOnlineListeners(
  onOnline: () => void,
  onOffline: () => void
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }
  
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  // Cleanup function
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}

// ===== Stale-While-Revalidate Pattern =====

/**
 * Fetch with stale-while-revalidate pattern
 * 1. Return cached data immediately (if available)
 * 2. Fetch fresh data in background
 * 3. Update cache with fresh data
 * 4. Notify callback with fresh data
 */
export async function fetchWithSWR<T>(
  fetchFn: () => Promise<T>,
  getCacheFn: () => Promise<T | null>,
  setCacheFn: (data: T) => Promise<void>,
  onUpdate?: (data: T) => void
): Promise<T> {
  // 1. Try to get cached data first
  const cached = await getCacheFn();
  
  // 2. If offline, return cached data (or throw if no cache)
  if (!isOnline()) {
    if (cached) {
      console.log('[OfflineSync] Offline - returning cached data');
      return cached;
    } else {
      throw new Error('Offline and no cached data available');
    }
  }
  
  // 3. If online, fetch fresh data in background
  const fetchPromise = fetchFn()
    .then(async (freshData) => {
      // Update cache with fresh data
      await setCacheFn(freshData);
      
      // Notify callback if provided
      if (onUpdate) {
        onUpdate(freshData);
      }
      
      return freshData;
    })
    .catch((error) => {
      console.error('[OfflineSync] Fetch failed:', error);
      // If fetch fails and we have cache, return cache
      if (cached) {
        console.log('[OfflineSync] Fetch failed - returning cached data');
        return cached;
      }
      throw error;
    });
  
  // 4. Return cached data immediately, or wait for fresh data if no cache
  if (cached) {
    // Stale-while-revalidate: return cache, update in background
    console.log('[OfflineSync] Returning cached data, revalidating in background');
    return cached;
  } else {
    // No cache: wait for fresh data
    console.log('[OfflineSync] No cache - waiting for fresh data');
    return await fetchPromise;
  }
}

/**
 * Usage Examples:
 * 
 * // In useBoardKPIs hook:
 * const data = await fetchWithSWR(
 *   () => fetch('/api/board/kpis').then(r => r.json()),
 *   loadKPIsFromCache,
 *   syncKPIsToCache,
 *   (freshData) => setData(freshData)
 * );
 * 
 * // In useBoardFeed hook:
 * const data = await fetchWithSWR(
 *   () => fetch('/api/board/feed').then(r => r.json()),
 *   loadFeedFromCache,
 *   syncFeedToCache,
 *   (freshData) => setData(freshData)
 * );
 */

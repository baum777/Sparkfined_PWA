/**
 * Watchlist Hook with Offline-First Support
 * Uses Dexie for local storage + WebSocket for real-time updates
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { db, type WatchlistItem } from '@/lib/database'
import { useWebSocket } from '@/hooks/useWebSocket'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

interface EnrichedWatchlistItem extends WatchlistItem {
  currentPrice?: number
  change24h?: number
  isOnline: boolean
}

interface UseWatchlistResult {
  watchlist: EnrichedWatchlistItem[]
  loading: boolean
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt'>) => Promise<void>
  removeFromWatchlist: (id: number) => Promise<void>
  updateSortOrder: (items: Array<{ id: number; sortOrder: number }>) => Promise<void>
  syncStatus: 'synced' | 'offline' | 'syncing'
}

/**
 * Hook for watchlist management
 */
export function useWatchlist(): UseWatchlistResult {
  // Load watchlist from IndexedDB (Offline-First)
  const watchlist = useLiveQuery(
    () => db.watchlist.orderBy('sortOrder').toArray(),
    []
  )

  // Get real-time prices via WebSocket
  const symbols = watchlist?.map((item) => item.symbol) || []
  const { prices, connected } = useWebSocket(symbols)

  // Enrich watchlist with real-time data
  const enrichedWatchlist: EnrichedWatchlistItem[] = (watchlist || []).map((item) => {
    const priceData = prices[item.symbol]
    
    return {
      ...item,
      currentPrice: priceData?.price || item.lastPrice,
      change24h: priceData?.change24h || item.lastChange24h,
      isOnline: !!priceData,
    }
  })

  // Add to watchlist
  const addToWatchlist = async (
    item: Omit<WatchlistItem, 'id' | 'addedAt'>
  ): Promise<void> => {
    try {
      const maxOrder = await db.watchlist
        .orderBy('sortOrder')
        .last()
        .then((last) => last?.sortOrder || 0)

      await db.watchlist.add({
        ...item,
        addedAt: Date.now(),
        sortOrder: maxOrder + 1,
      })

      trackEvent(TelemetryEvents.WATCHLIST_ADD, {
        symbol: item.symbol,
        chain: item.chain,
      })
    } catch (error) {
      console.error('[Watchlist] Failed to add item:', error)
      throw error
    }
  }

  // Remove from watchlist
  const removeFromWatchlist = async (id: number): Promise<void> => {
    try {
      const item = await db.watchlist.get(id)
      await db.watchlist.delete(id)

      trackEvent(TelemetryEvents.WATCHLIST_REMOVE, {
        symbol: item?.symbol,
      })
    } catch (error) {
      console.error('[Watchlist] Failed to remove item:', error)
      throw error
    }
  }

  // Update sort order (for drag & drop)
  const updateSortOrder = async (
    items: Array<{ id: number; sortOrder: number }>
  ): Promise<void> => {
    try {
      await db.transaction('rw', db.watchlist, async () => {
        for (const item of items) {
          await db.watchlist.update(item.id, { sortOrder: item.sortOrder })
        }
      })

      trackEvent(TelemetryEvents.WATCHLIST_SORT, {
        itemCount: items.length,
      })
    } catch (error) {
      console.error('[Watchlist] Failed to update sort order:', error)
      throw error
    }
  }

  const syncStatus = navigator.onLine
    ? connected
      ? 'synced'
      : 'syncing'
    : 'offline'

  return {
    watchlist: enrichedWatchlist,
    loading: watchlist === undefined,
    addToWatchlist,
    removeFromWatchlist,
    updateSortOrder,
    syncStatus,
  }
}

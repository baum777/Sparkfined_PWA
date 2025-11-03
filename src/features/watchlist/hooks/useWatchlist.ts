/**
 * Watchlist Hook with Offline Support
 * Sparkfined PWA Trading Platform
 */

import { useLiveQuery } from 'dexie-react-hooks'
import { db, WatchlistItem } from '@/services/storage/database'
import { useWebSocket } from '@/hooks/useWebSocket'
import { useState } from 'react'

interface EnrichedWatchlistItem extends WatchlistItem {
  currentPrice?: number
  currentChange24h?: number
  isOnline: boolean
}

interface UseWatchlistReturn {
  watchlist: EnrichedWatchlistItem[] | undefined
  isLoading: boolean
  addToWatchlist: (item: Omit<WatchlistItem, 'id' | 'addedAt' | 'order'>) => Promise<void>
  removeFromWatchlist: (id: number) => Promise<void>
  updateOrder: (id: number, newOrder: number) => Promise<void>
  syncStatus: 'synced' | 'offline' | 'syncing'
}

export function useWatchlist(): UseWatchlistReturn {
  const [isLoading, setIsLoading] = useState(false)

  // Offline-First: Data from IndexedDB
  const watchlist = useLiveQuery(
    () => db.watchlist.orderBy('order').toArray()
  )

  // Real-Time Updates via WebSocket
  const symbols = watchlist?.map(item => item.symbol) || []
  const { prices, isConnected } = useWebSocket(symbols)

  // Merge Offline + Real-Time Data
  const enrichedWatchlist = watchlist?.map(item => ({
    ...item,
    currentPrice: prices[item.symbol]?.price || item.lastPrice,
    currentChange24h: prices[item.symbol]?.change24h || item.lastChange24h,
    isOnline: !!prices[item.symbol]
  }))

  const addToWatchlist = async (item: Omit<WatchlistItem, 'id' | 'addedAt' | 'order'>) => {
    setIsLoading(true)
    try {
      const maxOrder = await db.watchlist.orderBy('order').last()
      const newOrder = (maxOrder?.order || 0) + 1

      await db.watchlist.add({
        ...item,
        addedAt: Date.now(),
        order: newOrder
      })
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const removeFromWatchlist = async (id: number) => {
    setIsLoading(true)
    try {
      await db.watchlist.delete(id)
    } catch (error) {
      console.error('Failed to remove from watchlist:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const updateOrder = async (id: number, newOrder: number) => {
    try {
      await db.watchlist.update(id, { order: newOrder })
    } catch (error) {
      console.error('Failed to update order:', error)
      throw error
    }
  }

  const syncStatus = navigator.onLine 
    ? (isConnected ? 'synced' : 'syncing')
    : 'offline'

  return {
    watchlist: enrichedWatchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    updateOrder,
    syncStatus
  }
}

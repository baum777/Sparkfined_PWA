// Watchlist hook with offline-first support via IndexedDB
import { useLiveQuery } from 'dexie-react-hooks'
import { db, WatchlistItem } from '@/services/storage/database'
import { useWebSocket } from '@/hooks/useWebSocket'

interface PriceUpdate {
  symbol: string
  price: number
  change24h: number
}

export function useWatchlist() {
  // Offline-First: Daten aus IndexedDB
  const watchlist = useLiveQuery(() => db.watchlist.toArray())

  // Real-Time Updates via WebSocket (optional - only if online)
  const symbols = watchlist?.map(item => item.symbol) || []
  const { prices } = useWebSocket(symbols)

  // Merge Offline + Real-Time Data
  const enrichedWatchlist = watchlist?.map(item => {
    const priceUpdate = prices[item.symbol] as PriceUpdate | undefined
    return {
      ...item,
      currentPrice: priceUpdate?.price || item.lastPrice,
      change24h: priceUpdate?.change24h || item.lastChange24h || 0,
      isOnline: !!priceUpdate,
      priceUpdatedAt: priceUpdate ? Date.now() : item.addedAt,
    }
  })

  const addToWatchlist = async (symbol: string, name?: string) => {
    const existing = await db.watchlist.where('symbol').equals(symbol).first()
    if (existing) return // Already exists

    await db.watchlist.add({
      symbol,
      name,
      addedAt: Date.now(),
    })
  }

  const removeFromWatchlist = async (symbol: string) => {
    const item = await db.watchlist.where('symbol').equals(symbol).first()
    if (item?.id) {
      await db.watchlist.delete(item.id)
    }
  }

  const updateWatchlistItem = async (id: number, updates: Partial<WatchlistItem>) => {
    await db.watchlist.update(id, updates)
  }

  return {
    watchlist: enrichedWatchlist || [],
    addToWatchlist,
    removeFromWatchlist,
    updateWatchlistItem,
    syncStatus: navigator.onLine ? 'synced' : 'offline',
    isLoading: watchlist === undefined,
  }
}

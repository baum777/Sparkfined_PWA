/**
 * Watchlist Core Component
 * Main watchlist interface with real-time updates
 * Sparkfined PWA Trading Platform
 */

import { motion, AnimatePresence } from 'framer-motion'
import { useWatchlist } from '../hooks/useWatchlist'
import { WatchlistItem } from './WatchlistItem'
import { trackInteraction } from '@/services/telemetry/telemetryService'
import { useState } from 'react'

interface WatchlistCoreProps {
  onSymbolClick?: (symbol: string) => void
}

export function WatchlistCore({ onSymbolClick }: WatchlistCoreProps) {
  const { watchlist, isLoading, removeFromWatchlist, syncStatus } = useWatchlist()
  const [sortBy, setSortBy] = useState<'order' | 'change'>('order')

  const handleRemove = async (id: number, symbol: string) => {
    try {
      await removeFromWatchlist(id)
      trackInteraction('remove_from_watchlist', 'watchlist', { symbol })
    } catch (error) {
      console.error('Failed to remove from watchlist:', error)
    }
  }

  const handleSymbolClick = (symbol: string) => {
    trackInteraction('symbol_click', 'watchlist', { symbol })
    onSymbolClick?.(symbol)
  }

  const sortedWatchlist = watchlist?.slice().sort((a, b) => {
    if (sortBy === 'change') {
      return (b.currentChange24h || b.lastChange24h) - (a.currentChange24h || a.lastChange24h)
    }
    return a.order - b.order
  })

  if (isLoading && !watchlist) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-gray-400 text-sm">Loading watchlist...</p>
        </div>
      </div>
    )
  }

  if (!watchlist || watchlist.length === 0) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-64 bg-slate-900/30 rounded-lg border border-slate-800/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <svg
          className="w-16 h-16 text-gray-600 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-300 mb-2">Your watchlist is empty</h3>
        <p className="text-gray-500 text-sm">Add symbols to start tracking</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-bold text-white">Watchlist</h2>
          <span className="px-2 py-1 bg-slate-800 rounded-full text-xs text-gray-400">
            {watchlist.length} {watchlist.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {/* Sync Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500'
                  : syncStatus === 'syncing'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-xs text-gray-400">
              {syncStatus === 'synced' ? 'Live' : syncStatus === 'syncing' ? 'Syncing' : 'Offline'}
            </span>
          </div>

          {/* Sort Controls */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'order' | 'change')}
            className="bg-slate-800 text-gray-300 text-xs rounded-md px-2 py-1 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="order">Default Order</option>
            <option value="change">% Change</option>
          </select>
        </div>
      </div>

      {/* Watchlist Items */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedWatchlist?.map((item) => (
            <WatchlistItem
              key={item.id}
              item={item}
              onRemove={() => handleRemove(item.id!, item.symbol)}
              onClick={() => handleSymbolClick(item.symbol)}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

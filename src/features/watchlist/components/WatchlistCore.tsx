/**
 * WatchlistCore Component
 * Main watchlist view with offline support
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlusIcon } from '@heroicons/react/24/outline'
import { useWatchlist } from '../hooks/useWatchlist'
import { WatchlistItemComponent } from './WatchlistItem'
import type { WatchlistItem } from '@/lib/database'

interface WatchlistCoreProps {
  onItemClick?: (item: WatchlistItem) => void
}

export function WatchlistCore({ onItemClick }: WatchlistCoreProps) {
  const {
    watchlist,
    loading,
    addToWatchlist,
    removeFromWatchlist,
    syncStatus,
  } = useWatchlist()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newSymbol, setNewSymbol] = useState('')
  const [newName, setNewName] = useState('')
  const [newChain, setNewChain] = useState('')

  const handleAdd = async () => {
    if (!newSymbol.trim()) return

    try {
      await addToWatchlist({
        symbol: newSymbol.trim().toUpperCase(),
        name: newName.trim() || undefined,
        chain: newChain.trim() || undefined,
        tags: [],
      })

      // Reset form
      setNewSymbol('')
      setNewName('')
      setNewChain('')
      setShowAddForm(false)
    } catch (error) {
      console.error('Failed to add to watchlist:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2" />
          <p className="text-slate-400 text-sm">Loading watchlist...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Watchlist</h2>
          <div className="flex items-center gap-2 mt-1">
            <div
              className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced'
                  ? 'bg-emerald-500'
                  : syncStatus === 'syncing'
                  ? 'bg-yellow-500 animate-pulse'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-sm text-slate-400">
              {syncStatus === 'synced'
                ? 'Synced'
                : syncStatus === 'syncing'
                ? 'Syncing...'
                : 'Offline'}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Symbol
        </button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-slate-800 rounded-lg p-4 space-y-3"
          >
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Symbol *
              </label>
              <input
                type="text"
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value)}
                placeholder="e.g., BTCUSDT"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Name (Optional)
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Bitcoin"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Chain (Optional)
              </label>
              <input
                type="text"
                value={newChain}
                onChange={(e) => setNewChain(e.target.value)}
                placeholder="e.g., Solana"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Watchlist Items */}
      {watchlist.length === 0 ? (
        <div className="text-center p-8 bg-slate-800 rounded-lg">
          <p className="text-slate-400">
            No items in your watchlist yet. Add your first symbol to get started!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {watchlist.map((item) => (
              <WatchlistItemComponent
                key={item.id}
                item={item}
                onRemove={removeFromWatchlist}
                onClick={onItemClick}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

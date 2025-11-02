// Core Watchlist component with offline support
import { useState } from 'react'
import { useWatchlist } from '../hooks/useWatchlist'
import { motion, AnimatePresence } from 'framer-motion'
import { XMarkIcon, PlusIcon } from '@heroicons/react/24/outline'

export function WatchlistCore() {
  const { watchlist, addToWatchlist, removeFromWatchlist, syncStatus, isLoading } = useWatchlist()
  const [newSymbol, setNewSymbol] = useState('')

  const handleAdd = async () => {
    if (!newSymbol.trim()) return
    await addToWatchlist(newSymbol.trim().toUpperCase())
    setNewSymbol('')
  }

  if (isLoading) {
    return <div className="p-4 text-gray-400">Loading watchlist...</div>
  }

  return (
    <div className="flex flex-col h-full bg-[#0A0E27] text-[#D9D9D9]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h2 className="text-xl font-semibold">Watchlist</h2>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded ${
            syncStatus === 'synced' 
              ? 'bg-green-500/20 text-green-400' 
              : 'bg-gray-500/20 text-gray-400'
          }`}>
            {syncStatus === 'synced' ? '● Online' : '○ Offline'}
          </span>
        </div>
      </div>

      {/* Add Symbol */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={newSymbol}
            onChange={(e) => setNewSymbol(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add symbol (e.g., BTC)"
            className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Watchlist Items */}
      <div className="flex-1 overflow-y-auto p-4">
        <AnimatePresence>
          {watchlist.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No symbols in watchlist</p>
              <p className="text-sm mt-2">Add symbols to track prices</p>
            </div>
          ) : (
            watchlist.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center justify-between p-3 mb-2 bg-gray-900/50 rounded-lg hover:bg-gray-900 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.symbol}</span>
                    {item.name && (
                      <span className="text-xs text-gray-500">{item.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    {item.currentPrice !== undefined ? (
                      <>
                        <span className="text-lg font-mono">
                          ${item.currentPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 6,
                          })}
                        </span>
                        <span
                          className={`text-sm ${
                            item.change24h >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {item.change24h >= 0 ? '+' : ''}
                          {item.change24h.toFixed(2)}%
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">No price data</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromWatchlist(item.symbol)}
                  className="ml-4 p-1 text-gray-400 hover:text-red-400 transition-colors"
                  aria-label={`Remove ${item.symbol}`}
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

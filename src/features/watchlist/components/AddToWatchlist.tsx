/**
 * Add to Watchlist Component
 * Form to add new symbols to watchlist
 * Sparkfined PWA Trading Platform
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useWatchlist } from '../hooks/useWatchlist'
import { trackInteraction } from '@/services/telemetry/telemetryService'

interface AddToWatchlistProps {
  onClose?: () => void
}

export function AddToWatchlist({ onClose }: AddToWatchlistProps) {
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { addToWatchlist } = useWatchlist()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!symbol.trim()) {
      setError('Symbol is required')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await addToWatchlist({
        symbol: symbol.toUpperCase().trim(),
        name: name.trim() || symbol.toUpperCase().trim(),
        lastPrice: 0,
        lastChange24h: 0
      })

      trackInteraction('add_to_watchlist', 'watchlist_form', { symbol })

      // Reset form
      setSymbol('')
      setName('')
      onClose?.()
    } catch (err) {
      setError('Failed to add symbol to watchlist')
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Add to Watchlist</h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="symbol" className="block text-sm font-medium text-gray-300 mb-2">
            Symbol *
          </label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="e.g., BTCUSDT"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
            Name (optional)
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Bitcoin"
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3"
          >
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        <div className="flex space-x-3">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Adding...
              </span>
            ) : (
              'Add to Watchlist'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  )
}

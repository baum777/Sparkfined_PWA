/**
 * Watchlist Item Component
 * Individual symbol in the watchlist with real-time price updates
 * Sparkfined PWA Trading Platform
 */

import { motion } from 'framer-motion'
import { formatCurrency, formatPercentage, getValueColor } from '@/utils'

interface WatchlistItemData {
  id?: number
  symbol: string
  name: string
  lastPrice: number
  lastChange24h: number
  currentPrice?: number
  currentChange24h?: number
  isOnline: boolean
}

interface WatchlistItemProps {
  item: WatchlistItemData
  onRemove: () => void
  onClick: () => void
}

export function WatchlistItem({ item, onRemove, onClick }: WatchlistItemProps) {
  const price = item.currentPrice || item.lastPrice
  const change24h = item.currentChange24h || item.lastChange24h
  const changeColor = getValueColor(change24h)
  const isPositive = change24h >= 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="group relative bg-slate-900/50 hover:bg-slate-900/70 backdrop-blur-sm border border-slate-800/50 hover:border-slate-700 rounded-lg p-4 cursor-pointer transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        {/* Symbol and Name */}
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base font-semibold text-white">{item.symbol}</h3>
            {!item.isOnline && (
              <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 text-xs rounded">
                Offline
              </span>
            )}
          </div>
          <p className="text-sm text-gray-400 truncate mt-0.5">{item.name}</p>
        </div>

        {/* Price and Change */}
        <div className="text-right">
          <div className="text-base font-semibold text-white">
            {formatCurrency(price)}
          </div>
          <div
            className="text-sm font-medium flex items-center justify-end space-x-1"
            style={{ color: changeColor }}
          >
            {isPositive ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>{formatPercentage(change24h)}</span>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-500/20 rounded"
          aria-label="Remove from watchlist"
        >
          <svg
            className="w-4 h-4 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Live Update Indicator */}
      {item.isOnline && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}

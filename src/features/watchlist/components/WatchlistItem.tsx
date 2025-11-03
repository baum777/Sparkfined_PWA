/**
 * WatchlistItem Component
 * Single item in the watchlist with price updates
 */

import { motion } from 'framer-motion'
import { TrashIcon } from '@heroicons/react/24/outline'
import type { WatchlistItem } from '@/lib/database'

interface WatchlistItemProps {
  item: WatchlistItem & {
    currentPrice?: number
    change24h?: number
    isOnline: boolean
  }
  onRemove: (id: number) => void
  onClick?: (item: WatchlistItem) => void
}

export function WatchlistItemComponent({
  item,
  onRemove,
  onClick,
}: WatchlistItemProps) {
  const priceChangeColor = item.change24h
    ? item.change24h >= 0
      ? 'text-emerald-400'
      : 'text-red-400'
    : 'text-slate-400'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
      onClick={() => onClick?.(item)}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-white">{item.symbol}</h3>
          {item.name && (
            <span className="text-sm text-slate-400">{item.name}</span>
          )}
          {/* Online Status Indicator */}
          <div
            className={`w-2 h-2 rounded-full ${
              item.isOnline ? 'bg-emerald-500' : 'bg-slate-600'
            }`}
            title={item.isOnline ? 'Live' : 'Offline'}
          />
        </div>

        {item.chain && (
          <span className="text-xs text-slate-500 mt-1 block">
            Chain: {item.chain}
          </span>
        )}

        {item.tags && item.tags.length > 0 && (
          <div className="flex gap-1 mt-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs rounded-full bg-slate-700 text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          {item.currentPrice !== undefined && (
            <div className="text-xl font-semibold text-white">
              ${item.currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6,
              })}
            </div>
          )}
          {item.change24h !== undefined && (
            <div className={`text-sm font-medium ${priceChangeColor}`}>
              {item.change24h >= 0 ? '+' : ''}
              {item.change24h.toFixed(2)}%
            </div>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            if (item.id) onRemove(item.id)
          }}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-colors"
          title="Remove from watchlist"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}

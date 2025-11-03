/**
 * ChartHeader Component
 * Displays symbol info and interval selector
 */

import { motion } from 'framer-motion'
import type { TimeInterval } from '../types'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

interface ChartHeaderProps {
  symbol: string
  interval: TimeInterval
  onIntervalChange: (interval: TimeInterval) => void
  price?: number
  change24h?: number
}

const INTERVALS: TimeInterval[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']

export function ChartHeader({
  symbol,
  interval,
  onIntervalChange,
  price,
  change24h,
}: ChartHeaderProps) {
  const handleIntervalClick = (newInterval: TimeInterval) => {
    onIntervalChange(newInterval)
    trackEvent(TelemetryEvents.TIMEFRAME_CHANGED, {
      symbol,
      from: interval,
      to: newInterval,
    })
  }

  return (
    <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
      {/* Symbol and Price */}
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-white">{symbol}</h2>
        {price !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xl font-semibold text-slate-200">
              ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
            </span>
            {change24h !== undefined && (
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${
                  change24h >= 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {change24h >= 0 ? '+' : ''}
                {change24h.toFixed(2)}%
              </span>
            )}
          </div>
        )}
      </div>

      {/* Interval Selector */}
      <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
        {INTERVALS.map((int) => (
          <motion.button
            key={int}
            onClick={() => handleIntervalClick(int)}
            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
              interval === int
                ? 'bg-emerald-500 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {int}
          </motion.button>
        ))}
      </div>
    </div>
  )
}

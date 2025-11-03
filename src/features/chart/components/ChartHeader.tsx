/**
 * Chart Header Component
 * Symbol info, interval selector, and chart controls
 * Sparkfined PWA Trading Platform
 */

import { useState } from 'react'
import { trackInteraction } from '@/services/telemetry/telemetryService'

interface ChartHeaderProps {
  symbol: string
  interval: string
  onIntervalChange: (interval: string) => void
  price?: number
  change24h?: number
}

const intervals = ['1m', '5m', '15m', '1h', '4h', '1d', '1w']

export function ChartHeader({
  symbol,
  interval,
  onIntervalChange,
  price,
  change24h
}: ChartHeaderProps) {
  const [selectedInterval, setSelectedInterval] = useState(interval)

  const handleIntervalChange = (newInterval: string) => {
    setSelectedInterval(newInterval)
    onIntervalChange(newInterval)
    trackInteraction('interval_change', 'chart_header', { interval: newInterval, symbol })
  }

  const priceChangeColor = change24h && change24h >= 0 ? 'text-emerald-500' : 'text-red-500'
  const priceChangeSign = change24h && change24h >= 0 ? '+' : ''

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Symbol and Price Info */}
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-bold text-white">{symbol}</h2>
            {price !== undefined && (
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-lg text-gray-300">${price.toFixed(2)}</span>
                {change24h !== undefined && (
                  <span className={`text-sm ${priceChangeColor}`}>
                    {priceChangeSign}{change24h.toFixed(2)}%
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Interval Selector */}
        <div className="flex items-center space-x-1 bg-slate-800/50 rounded-lg p-1">
          {intervals.map((int) => (
            <button
              key={int}
              onClick={() => handleIntervalChange(int)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                selectedInterval === int
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              {int}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

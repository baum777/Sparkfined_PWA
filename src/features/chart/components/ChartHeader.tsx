// Chart header with symbol selector and interval controls
import { useState } from 'react'
import { motion } from 'framer-motion'

const INTERVALS = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1d' },
]

export interface ChartHeaderProps {
  symbol: string
  interval: string
  onSymbolChange?: (symbol: string) => void
  onIntervalChange?: (interval: string) => void
}

export function ChartHeader({ 
  symbol, 
  interval, 
  onSymbolChange,
  onIntervalChange 
}: ChartHeaderProps) {
  const [isSymbolInput, setIsSymbolInput] = useState(false)
  const [symbolInput, setSymbolInput] = useState(symbol)

  const handleSymbolSubmit = () => {
    if (symbolInput.trim() && onSymbolChange) {
      onSymbolChange(symbolInput.trim().toUpperCase())
    }
    setIsSymbolInput(false)
  }

  return (
    <div className="flex items-center justify-between p-4 bg-[#0A0E27] border-b border-gray-800">
      {/* Symbol */}
      <div className="flex items-center gap-3">
        {isSymbolInput ? (
          <input
            type="text"
            value={symbolInput}
            onChange={(e) => setSymbolInput(e.target.value)}
            onBlur={handleSymbolSubmit}
            onKeyPress={(e) => e.key === 'Enter' && handleSymbolSubmit()}
            className="px-3 py-1 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-blue-500"
            autoFocus
          />
        ) : (
          <button
            onClick={() => setIsSymbolInput(true)}
            className="text-xl font-bold text-white hover:text-blue-400 transition-colors"
          >
            {symbol}
          </button>
        )}
        <span className="text-xs text-gray-500">/ USDT</span>
      </div>

      {/* Interval Selector */}
      <div className="flex items-center gap-1 bg-gray-900 rounded-lg p-1">
        {INTERVALS.map((int) => (
          <button
            key={int.value}
            onClick={() => onIntervalChange?.(int.value)}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
              interval === int.value
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {int.label}
          </button>
        ))}
      </div>
    </div>
  )
}

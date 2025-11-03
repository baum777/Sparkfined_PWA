/**
 * ChartContainer Component
 * Complete chart view with header and controls
 */

import { useState } from 'react'
import { ChartCanvas } from './ChartCanvas'
import { ChartHeader } from './ChartHeader'
import type { TimeInterval } from '../types'
import { useWebSocket } from '@/hooks/useWebSocket'

interface ChartContainerProps {
  symbol: string
  initialInterval?: TimeInterval
  enableRealTime?: boolean
}

export function ChartContainer({
  symbol,
  initialInterval = '1h',
  enableRealTime = true,
}: ChartContainerProps) {
  const [interval, setInterval] = useState<TimeInterval>(initialInterval)
  const { prices, connected } = useWebSocket([symbol])

  const currentPrice = prices[symbol]

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Connection Status Indicator */}
      {enableRealTime && (
        <div className="px-4 py-2 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                connected ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
              }`}
            />
            <span className="text-slate-400">
              {connected ? 'Live' : 'Offline'}
            </span>
          </div>
        </div>
      )}

      {/* Chart Header */}
      <ChartHeader
        symbol={symbol}
        interval={interval}
        onIntervalChange={setInterval}
        price={currentPrice?.price}
        change24h={currentPrice?.change24h}
      />

      {/* Chart */}
      <div className="flex-1 p-4">
        <ChartCanvas
          symbol={symbol}
          interval={interval}
          enableRealTime={enableRealTime}
          height={600}
        />
      </div>
    </div>
  )
}

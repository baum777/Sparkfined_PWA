/**
 * Chart Container Component
 * Main chart view combining header and canvas
 * Sparkfined PWA Trading Platform
 */

import { useState } from 'react'
import { ChartHeader } from './ChartHeader'
import { ChartCanvas } from './ChartCanvas'
import { motion } from 'framer-motion'

interface ChartContainerProps {
  initialSymbol?: string
  initialInterval?: string
}

export function ChartContainer({
  initialSymbol = 'BTCUSDT',
  initialInterval = '1h'
}: ChartContainerProps) {
  const [symbol] = useState(initialSymbol)
  const [interval, setInterval] = useState(initialInterval)
  const [crosshairData, setCrosshairData] = useState<any>(null)

  const handleCrosshairMove = (data: any) => {
    setCrosshairData(data)
  }

  // Extract price from crosshair or use mock data
  const displayPrice = crosshairData?.seriesData?.get(crosshairData?.seriesData?.entries().next().value?.[0])?.close

  return (
    <motion.div
      className="flex flex-col h-full bg-slate-950 rounded-lg overflow-hidden shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <ChartHeader
        symbol={symbol}
        interval={interval}
        onIntervalChange={setInterval}
        price={displayPrice}
        change24h={undefined} // Would be fetched from API in real implementation
      />
      
      <div className="flex-1 p-4">
        <ChartCanvas
          symbol={symbol}
          interval={interval}
          height={500}
          onCrosshairMove={handleCrosshairMove}
        />
      </div>

      {/* Chart Info Bar */}
      {crosshairData && (
        <motion.div
          className="bg-slate-900/50 backdrop-blur-sm border-t border-slate-800 px-4 py-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Time: {crosshairData.time ? new Date(crosshairData.time * 1000).toLocaleString() : '-'}
            </span>
            {displayPrice && (
              <span className="text-gray-300">
                Price: ${displayPrice.toFixed(2)}
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

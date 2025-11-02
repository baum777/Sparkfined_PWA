// Integrated chart view with header and canvas
import { useState } from 'react'
import { ChartCanvas } from './ChartCanvas'
import { ChartHeader } from './ChartHeader'

export function ChartView({ initialSymbol = 'BTC', initialInterval = '1h' }) {
  const [symbol, setSymbol] = useState(initialSymbol)
  const [interval, setInterval] = useState(initialInterval)

  return (
    <div className="flex flex-col h-full bg-[#0A0E27]">
      <ChartHeader
        symbol={symbol}
        interval={interval}
        onSymbolChange={setSymbol}
        onIntervalChange={setInterval}
      />
      <div className="flex-1 relative">
        <ChartCanvas symbol={symbol} interval={interval} height={600} />
      </div>
    </div>
  )
}

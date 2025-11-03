/**
 * Chart Demo Page
 * Standalone demonstration of new chart module
 * Can be integrated into main app or used for testing
 */

import { ChartContainer } from './ChartContainer'

export function ChartDemo() {
  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-white">
            Sparkfined Chart Module
          </h1>
          <p className="text-slate-400 mt-1">
            Lightweight-charts integration with real-time WebSocket updates
          </p>
        </div>

        <ChartContainer symbol="BTCUSDT" initialInterval="1h" enableRealTime />
      </div>
    </div>
  )
}

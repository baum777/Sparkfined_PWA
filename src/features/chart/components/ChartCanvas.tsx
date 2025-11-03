/**
 * ChartCanvas Component
 * Renders trading chart with lightweight-charts
 */

import { useEffect, useRef, useState } from 'react'
import { createChart, type IChartApi, type ISeriesApi, type CandlestickSeriesOptions, type CandlestickData, type UTCTimestamp } from 'lightweight-charts'
import { motion } from 'framer-motion'
import { useChartData } from '../hooks/useChartData'
import type { TimeInterval, ChartTheme } from '../types'
import { DARK_THEME } from '../types'
import { priceWebSocket } from '@/services/websocket/priceUpdates'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

interface ChartCanvasProps {
  symbol: string
  interval: TimeInterval
  theme?: ChartTheme
  height?: number
  enableRealTime?: boolean
}

export function ChartCanvas({
  symbol,
  interval,
  theme = DARK_THEME,
  height = 600,
  enableRealTime = true,
}: ChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const [isReady, setIsReady] = useState(false)

  const { data, loading, error } = useChartData(symbol, interval)

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current || data.length === 0) return

    const startTime = performance.now()

    // Create chart
    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height,
      layout: {
        background: { color: theme.background },
        textColor: theme.text,
      },
      grid: {
        vertLines: { color: theme.grid.vertLines },
        horzLines: { color: theme.grid.horzLines },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 0,
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.3)',
          style: 0,
        },
      },
      rightPriceScale: {
        borderColor: theme.grid.horzLines,
      },
      timeScale: {
        borderColor: theme.grid.vertLines,
        timeVisible: true,
        secondsVisible: false,
      },
    })

    // Create candlestick series
    const candlestickOptions: Partial<CandlestickSeriesOptions> = {
      upColor: theme.candlestick.upColor,
      downColor: theme.candlestick.downColor,
      borderUpColor: theme.candlestick.borderUpColor,
      borderDownColor: theme.candlestick.borderDownColor,
      wickUpColor: theme.candlestick.wickUpColor,
      wickDownColor: theme.candlestick.wickDownColor,
    }

    seriesRef.current = chartRef.current.addCandlestickSeries(candlestickOptions) as any
    
    // Transform and set data
    const chartData: CandlestickData[] = data.map((d) => ({
      time: d.time as UTCTimestamp,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
    }))
    
    seriesRef.current.setData(chartData)

    // Fit content
    chartRef.current.timeScale().fitContent()

    const duration = performance.now() - startTime
    trackEvent(TelemetryEvents.CHART_LOAD, {
      symbol,
      interval,
      renderTime: duration,
      candles: data.length,
    })

    setIsReady(true)

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }
    }
  }, [data, symbol, interval, theme, height])

  // Real-time updates via WebSocket
  useEffect(() => {
    if (!enableRealTime || !seriesRef.current || data.length === 0) return

    const unsubscribe = priceWebSocket.subscribe(symbol, (update) => {
      if (!seriesRef.current) return

      // Get last candle
      const lastCandle = data[data.length - 1]
      if (!lastCandle) return

      // Update last candle with real-time price
      const updatedCandle: CandlestickData = {
        time: lastCandle.time as UTCTimestamp,
        open: lastCandle.open,
        high: Math.max(lastCandle.high, update.price),
        low: Math.min(lastCandle.low, update.price),
        close: update.price,
      }

      seriesRef.current.update(updatedCandle)
    })

    return () => {
      unsubscribe()
    }
  }, [symbol, enableRealTime, data])

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-900 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2" />
          <p className="text-slate-400 text-sm">Loading chart...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-slate-900 rounded-lg"
        style={{ height }}
      >
        <div className="text-center text-red-400">
          <p className="font-semibold mb-1">Failed to load chart</p>
          <p className="text-sm text-slate-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className="w-full rounded-lg overflow-hidden"
      style={{ height }}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: isReady ? 1 : 0.5, scale: 1 }}
      transition={{ duration: 0.3 }}
    />
  )
}

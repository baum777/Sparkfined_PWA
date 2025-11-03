/**
 * Chart Canvas Component
 * Real-time trading chart using lightweight-charts
 * Sparkfined PWA Trading Platform
 */

import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, CandlestickData } from 'lightweight-charts'
import { motion } from 'framer-motion'
import { useChartData } from '../hooks/useChartData'
import { trackInteraction, trackPerformance } from '@/services/telemetry/telemetryService'

interface ChartCanvasProps {
  symbol: string
  interval: string
  height?: number
  onCrosshairMove?: (data: any) => void
}

export function ChartCanvas({ 
  symbol, 
  interval, 
  height = 500,
  onCrosshairMove 
}: ChartCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi>()
  const seriesRef = useRef<ISeriesApi<'Candlestick'>>()
  const [isReady, setIsReady] = useState(false)

  const { data, isLoading, error } = useChartData({
    symbol,
    interval,
    autoUpdate: true,
    updateInterval: 60000
  })

  // Initialize chart
  useEffect(() => {
    if (!containerRef.current) return

    const startTime = performance.now()

    // Create chart instance
    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0A0E27' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
      },
      crosshair: {
        mode: 1,
        vertLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.4)',
          style: 0,
        },
        horzLine: {
          width: 1,
          color: 'rgba(224, 227, 235, 0.4)',
          style: 0,
        },
      },
      rightPriceScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
      },
      timeScale: {
        borderColor: 'rgba(197, 203, 206, 0.4)',
        timeVisible: true,
        secondsVisible: false,
      },
      width: containerRef.current.clientWidth,
      height: height,
    })

    // Create candlestick series
    const series = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    })

    chartRef.current = chart
    seriesRef.current = series

    // Handle crosshair move
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        onCrosshairMove(param)
      })
    }

    // Handle resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    const renderTime = performance.now() - startTime
    trackPerformance('chart_init', renderTime, { symbol, interval })

    setIsReady(true)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [symbol, interval, height, onCrosshairMove])

  // Update chart data
  useEffect(() => {
    if (!seriesRef.current || !data || data.length === 0) return

    const startTime = performance.now()

    try {
      // Transform data to candlestick format
      const candlestickData: CandlestickData[] = data.map(item => ({
        time: Math.floor(item.time / 1000) as any, // Convert to seconds
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      }))

      seriesRef.current.setData(candlestickData)

      // Fit content
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent()
      }

      const updateTime = performance.now() - startTime
      trackPerformance('chart_update', updateTime, { symbol, interval, dataPoints: data.length })

      trackInteraction('chart_loaded', 'chart', { symbol, interval, dataPoints: data.length })
    } catch (err) {
      console.error('[ChartCanvas] Failed to update chart:', err)
    }
  }, [data, symbol, interval])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900/50 rounded-lg">
        <div className="text-center">
          <p className="text-red-500 mb-2">Failed to load chart</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className="relative w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: isReady ? 1 : 0.5 }}
      transition={{ duration: 0.3 }}
      style={{ height: `${height}px` }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-gray-400 text-sm">Loading chart...</p>
          </div>
        </div>
      )}
    </motion.div>
  )
}

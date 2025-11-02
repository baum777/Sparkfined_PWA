// Chart component using lightweight-charts with WebSocket real-time updates
import { useEffect, useRef, useState } from 'react'
import { createChart, IChartApi, ISeriesApi, ColorType, Time, LineData, CandlestickData } from 'lightweight-charts'
import { motion } from 'framer-motion'

export interface ChartProps {
  symbol: string
  interval?: string // '1m', '5m', '15m', '1h', '4h', '1d'
  height?: number
}

export function ChartCanvas({ symbol, interval = '1h', height = 400 }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create chart
    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#0A0E27' },
        textColor: '#D9D9D9',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.2)' },
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: {
          color: '#758696',
          width: 1,
          style: 0, // Solid
        },
        horzLine: {
          color: '#758696',
          width: 1,
          style: 0,
        },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
        borderColor: '#2A2E39',
      },
      rightPriceScale: {
        borderColor: '#2A2E39',
      },
      width: containerRef.current.clientWidth,
      height: height,
    })

    chartRef.current = chart

    // Create candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    })

    seriesRef.current = candlestickSeries

    // Load initial historical data
    const loadHistoricalData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Map interval to Binance timeframe
        const binanceInterval = interval === '1m' ? '1m' :
          interval === '5m' ? '5m' :
          interval === '15m' ? '15m' :
          interval === '1h' ? '1h' :
          interval === '4h' ? '4h' :
          interval === '1d' ? '1d' : '1h'

        // Fetch historical klines (500 candles)
        const response = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}USDT&interval=${binanceInterval}&limit=500`
        )

        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`)
        }

        const klines = await response.json()

        const data: CandlestickData[] = klines.map((k: any[]) => ({
          time: (k[0] / 1000) as Time,
          open: parseFloat(k[1]),
          high: parseFloat(k[2]),
          low: parseFloat(k[3]),
          close: parseFloat(k[4]),
        }))

        candlestickSeries.setData(data)
        chart.timeScale().fitContent()
        setIsLoading(false)
      } catch (err) {
        console.error('[Chart] Load error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load chart data')
        setIsLoading(false)
      }
    }

    loadHistoricalData()

    // WebSocket for real-time updates
    const connectWebSocket = () => {
      try {
        const wsSymbol = symbol.toLowerCase()
        const wsInterval = interval === '1m' ? '1m' :
          interval === '5m' ? '5m' :
          interval === '15m' ? '15m' :
          interval === '1h' ? '1h' :
          interval === '4h' ? '4h' :
          interval === '1d' ? '1d' : '1h'

        const streamName = `${wsSymbol}usdt@kline_${wsInterval}`
        const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${streamName}`)

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            const k = data.k

            if (k && k.x) {
              // Closed candle - update existing
              candlestickSeries.update({
                time: (k.t / 1000) as Time,
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
              })
            } else if (k) {
              // Open candle - update in real-time
              candlestickSeries.update({
                time: (k.t / 1000) as Time,
                open: parseFloat(k.o),
                high: parseFloat(k.h),
                low: parseFloat(k.l),
                close: parseFloat(k.c),
              })
            }
          } catch (err) {
            console.error('[Chart] WebSocket parse error:', err)
          }
        }

        ws.onerror = (error) => {
          console.error('[Chart] WebSocket error:', error)
        }

        ws.onclose = () => {
          console.log('[Chart] WebSocket closed, reconnecting...')
          setTimeout(connectWebSocket, 3000)
        }

        wsRef.current = ws
      } catch (err) {
        console.error('[Chart] WebSocket connection error:', err)
      }
    }

    // Only connect WebSocket if online
    if (navigator.onLine) {
      connectWebSocket()
    }

    // Handle window resize
    const handleResize = () => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (wsRef.current) {
        wsRef.current.close()
        wsRef.current = null
      }
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [symbol, interval, height])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-[#0A0E27] text-red-400">
        <div className="text-center">
          <p className="text-lg font-semibold">Chart Error</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      ref={containerRef}
      className="w-full bg-[#0A0E27]"
      style={{ height: `${height}px` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoading ? 0.5 : 1 }}
      transition={{ duration: 0.3 }}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0E27]/80 z-10">
          <div className="text-gray-400">Loading chart data...</div>
        </div>
      )}
    </motion.div>
  )
}

/**
 * Chart Data Hook
 * Manages chart data fetching and real-time updates
 * Sparkfined PWA Trading Platform
 */

import { useState, useEffect, useCallback } from 'react'
import { ChartData, OHLCV } from '../types'
import { chartDataService } from '../services/chartDataService'
import { trackError } from '@/services/telemetry/telemetryService'

interface UseChartDataParams {
  symbol: string
  interval: string
  autoUpdate?: boolean
  updateInterval?: number
}

interface UseChartDataReturn {
  data: OHLCV[] | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  lastUpdate: number | null
}

export function useChartData({
  symbol,
  interval,
  autoUpdate = false,
  updateInterval = 60000 // 1 minute
}: UseChartDataParams): UseChartDataReturn {
  const [data, setData] = useState<OHLCV[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<number | null>(null)

  const fetchData = useCallback(async () => {
    if (!symbol || !interval) return

    try {
      setIsLoading(true)
      setError(null)

      const chartData = await chartDataService.fetchChartData({
        symbol,
        interval,
        limit: 500
      })

      setData(chartData.data)
      setLastUpdate(chartData.lastUpdate)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch chart data'
      setError(errorMessage)
      trackError(new Error(errorMessage), { symbol, interval })
    } finally {
      setIsLoading(false)
    }
  }, [symbol, interval])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Auto-update
  useEffect(() => {
    if (!autoUpdate || !symbol || !interval) return

    const intervalId = setInterval(() => {
      fetchData()
    }, updateInterval)

    return () => clearInterval(intervalId)
  }, [autoUpdate, fetchData, updateInterval, symbol, interval])

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
    lastUpdate
  }
}

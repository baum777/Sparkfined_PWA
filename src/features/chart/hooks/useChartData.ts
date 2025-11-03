/**
 * Chart Data Hook
 * Manages chart data loading and caching
 */

import { useState, useEffect, useCallback } from 'react'
import type { OHLCV, TimeInterval } from '../types'
import { api } from '@/services/api/client'
import { trackEvent, TelemetryEvents } from '@/services/telemetry'

interface UseChartDataResult {
  data: OHLCV[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

interface CachedData {
  data: OHLCV[]
  timestamp: number
}

// In-memory cache
const cache = new Map<string, CachedData>()
const CACHE_TTL = 60000 // 1 minute

/**
 * Hook to fetch and manage chart data
 */
export function useChartData(
  symbol: string,
  interval: TimeInterval,
  limit: number = 500
): UseChartDataResult {
  const [data, setData] = useState<OHLCV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cacheKey = `${symbol}-${interval}-${limit}`

  const fetchData = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      setLoading(true)
      setError(null)

      // Check cache first
      const cached = cache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        setData(cached.data)
        setLoading(false)
        trackEvent(TelemetryEvents.CACHE_HIT, { symbol, interval })
        return
      }

      trackEvent(TelemetryEvents.CACHE_MISS, { symbol, interval })

      // Fetch from API
      const response = await api.get<OHLCV[]>(
        `/market/ohlc?symbol=${symbol}&interval=${interval}&limit=${limit}`,
        { timeout: 5000 }
      )

      // Transform data if needed (ensure time is in seconds)
      const transformedData = response.map((candle) => ({
        ...candle,
        time: candle.time > 10000000000 ? Math.floor(candle.time / 1000) : candle.time,
      }))

      setData(transformedData)

      // Update cache
      cache.set(cacheKey, {
        data: transformedData,
        timestamp: Date.now(),
      })

      const duration = performance.now() - startTime
      trackEvent(TelemetryEvents.CHART_LOAD, {
        symbol,
        interval,
        duration,
        candles: transformedData.length,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load chart data'
      setError(errorMessage)
      console.error('[Chart] Failed to fetch data:', err)
      
      trackEvent(TelemetryEvents.API_ERROR, {
        source: 'chart_data',
        symbol,
        interval,
        error: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }, [symbol, interval, limit, cacheKey])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refresh: fetchData,
  }
}

/**
 * Clear chart data cache
 */
export function clearChartCache(): void {
  cache.clear()
}

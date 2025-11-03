/**
 * Chart Data Service
 * Fetches and manages OHLCV data from external APIs
 * Sparkfined PWA Trading Platform
 */

import { OHLCV, ChartData } from '../types'
import { apiClient } from '@/services/api/client'
import { db } from '@/services/storage/database'

export interface FetchChartDataParams {
  symbol: string
  interval: string
  limit?: number
}

class ChartDataService {
  private cache = new Map<string, ChartData>()
  private cacheExpiry = 300000 // 5 minutes

  /**
   * Fetch chart data from API
   */
  async fetchChartData(params: FetchChartDataParams): Promise<ChartData> {
    const { symbol, interval, limit = 500 } = params
    const cacheKey = `${symbol}-${interval}`

    // Check cache first
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.lastUpdate < this.cacheExpiry) {
      return cached
    }

    try {
      // Try to fetch from API
      const response = await apiClient.get<any[]>(
        `/market/ohlc?symbol=${symbol}&interval=${interval}&limit=${limit}`,
        { timeout: 10000 }
      )

      if (response.data) {
        const ohlcv = this.transformAPIData(response.data)
        const chartData: ChartData = {
          symbol,
          interval,
          data: ohlcv,
          lastUpdate: Date.now()
        }

        this.cache.set(cacheKey, chartData)
        return chartData
      }
    } catch (error) {
      console.error('[ChartData] API fetch failed:', error)
    }

    // Fallback to local storage
    try {
      const localData = await this.getLocalChartData(symbol, interval)
      if (localData) {
        return localData
      }
    } catch (error) {
      console.error('[ChartData] Local fetch failed:', error)
    }

    throw new Error('Failed to fetch chart data')
  }

  /**
   * Transform API response to OHLCV format
   */
  private transformAPIData(data: any[]): OHLCV[] {
    return data.map((item: any) => ({
      time: item.timestamp || item.time || item[0],
      open: parseFloat(item.open || item[1]),
      high: parseFloat(item.high || item[2]),
      low: parseFloat(item.low || item[3]),
      close: parseFloat(item.close || item[4]),
      volume: parseFloat(item.volume || item[5] || 0)
    }))
  }

  /**
   * Get chart data from local storage
   */
  private async getLocalChartData(symbol: string, interval: string): Promise<ChartData | null> {
    // This would retrieve cached data from IndexedDB
    // For now, return null as placeholder
    return null
  }

  /**
   * Save chart data to local storage
   */
  async saveChartData(chartData: ChartData): Promise<void> {
    const cacheKey = `${chartData.symbol}-${chartData.interval}`
    this.cache.set(cacheKey, chartData)
    
    // Could also save to IndexedDB for persistence
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.cache.size
  }
}

export const chartDataService = new ChartDataService()

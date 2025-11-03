/**
 * OHLC API Endpoint
 * Fetches candlestick data for charts
 * Sparkfined PWA Trading Platform
 */

import { VercelRequest, VercelResponse } from '@vercel/node'

// Simple cache
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes

/**
 * Generate mock OHLCV data
 * In production, replace with actual API calls to Binance/CoinGecko
 */
function generateMockOHLC(symbol: string, interval: string, limit: number) {
  const now = Date.now()
  const intervalMs = parseInterval(interval)
  const data = []

  let basePrice = 100 + Math.random() * 900
  
  for (let i = limit - 1; i >= 0; i--) {
    const timestamp = now - (i * intervalMs)
    const volatility = basePrice * 0.02
    
    const open = basePrice
    const close = open + (Math.random() - 0.5) * volatility * 2
    const high = Math.max(open, close) + Math.random() * volatility
    const low = Math.min(open, close) - Math.random() * volatility
    const volume = Math.random() * 1000000

    data.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: parseFloat(volume.toFixed(2))
    })

    basePrice = close
  }

  return data
}

function parseInterval(interval: string): number {
  const unit = interval.slice(-1)
  const value = parseInt(interval.slice(0, -1))

  switch (unit) {
    case 'm': return value * 60 * 1000
    case 'h': return value * 60 * 60 * 1000
    case 'd': return value * 24 * 60 * 60 * 1000
    case 'w': return value * 7 * 24 * 60 * 60 * 1000
    default: return 60 * 60 * 1000 // default 1h
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { symbol, interval = '1h', limit = '500' } = req.query

    if (!symbol || typeof symbol !== 'string') {
      return res.status(400).json({ error: 'Symbol is required' })
    }

    const limitNum = parseInt(limit as string)
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({ error: 'Invalid limit (1-1000)' })
    }

    // Check cache
    const cacheKey = `ohlc:${symbol}:${interval}:${limitNum}`
    const cached = cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT')
      return res.status(200).json(cached.data)
    }

    // Generate/fetch data
    const data = generateMockOHLC(symbol, interval as string, limitNum)

    // Cache the result
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    })

    // Clean up old cache
    if (cache.size > 100) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      entries.slice(0, 50).forEach(([key]) => cache.delete(key))
    }

    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json(data)

  } catch (error) {
    console.error('[OHLC API] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

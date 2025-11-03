/**
 * Vercel Edge Function: Prices API
 * Secure API proxy with HMAC validation, rate limiting, and caching
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

// Rate limiting store (in-memory for simplicity, use Redis/Upstash for production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Cache store (use Redis/Upstash for production)
const cacheStore = new Map<string, { data: any; expiresAt: number }>()

const RATE_LIMIT_WINDOW = 60000 // 1 minute
const RATE_LIMIT_MAX = 100 // requests per window
const CACHE_TTL = 60000 // 1 minute

/**
 * Validate HMAC signature
 */
function validateSignature(payload: string, signature: string): boolean {
  const secret = process.env.API_SECRET
  if (!secret) {
    console.error('API_SECRET not configured')
    return false
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Check rate limit
 */
function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const entry = rateLimitStore.get(clientId)

  if (!entry || now >= entry.resetAt) {
    // New window
    rateLimitStore.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW,
    })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

/**
 * Get from cache
 */
function getFromCache(key: string): any | null {
  const entry = cacheStore.get(key)
  if (!entry) return null

  if (Date.now() >= entry.expiresAt) {
    cacheStore.delete(key)
    return null
  }

  return entry.data
}

/**
 * Set cache
 */
function setCache(key: string, data: any, ttl: number = CACHE_TTL): void {
  cacheStore.set(key, {
    data,
    expiresAt: Date.now() + ttl,
  })
}

/**
 * Fetch prices from external API
 */
async function fetchPricesFromAPI(symbols: string[]): Promise<any> {
  // Example: Binance API (can be replaced with any price feed)
  const symbolsQuery = symbols.join(',')
  const url = `https://api.binance.com/api/v3/ticker/24hr?symbols=["${symbols.join('","')}"]`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const data = await response.json()

    // Transform to standardized format
    return data.map((item: any) => ({
      symbol: item.symbol,
      price: parseFloat(item.lastPrice),
      change24h: parseFloat(item.priceChangePercent),
      volume24h: parseFloat(item.volume),
      timestamp: Date.now(),
    }))
  } catch (error) {
    console.error('Failed to fetch prices:', error)
    throw error
  }
}

/**
 * Main handler
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Signature, X-Client-ID')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract client ID
    const clientId = (req.headers['x-client-id'] as string) || req.socket?.remoteAddress || 'unknown'

    // Check rate limit
    if (!checkRateLimit(clientId)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil(RATE_LIMIT_WINDOW / 1000),
      })
    }

    // HMAC validation for POST requests
    if (req.method === 'POST') {
      const signature = req.headers['x-signature'] as string
      const payload = JSON.stringify(req.body)

      if (!signature || !validateSignature(payload, signature)) {
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    // Parse symbols
    let symbols: string[]
    if (req.method === 'GET') {
      const symbolsParam = req.query.symbols as string
      if (!symbolsParam) {
        return res.status(400).json({ error: 'Missing symbols parameter' })
      }
      symbols = symbolsParam.split(',').map((s) => s.trim().toUpperCase())
    } else {
      symbols = req.body?.symbols || []
    }

    if (symbols.length === 0) {
      return res.status(400).json({ error: 'No symbols provided' })
    }

    if (symbols.length > 50) {
      return res.status(400).json({ error: 'Too many symbols (max 50)' })
    }

    // Check cache
    const cacheKey = `prices:${symbols.sort().join(',')}`
    const cached = getFromCache(cacheKey)

    if (cached) {
      return res.status(200).json({
        data: cached,
        cached: true,
        timestamp: Date.now(),
      })
    }

    // Fetch from API
    const prices = await fetchPricesFromAPI(symbols)

    // Cache response
    setCache(cacheKey, prices)

    return res.status(200).json({
      data: prices,
      cached: false,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('API Error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

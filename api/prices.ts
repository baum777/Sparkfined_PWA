/**
 * Prices API Endpoint
 * Secure proxy for fetching price data with caching and rate limiting
 * Sparkfined PWA Trading Platform
 */

import { VercelRequest, VercelResponse } from '@vercel/node'

// Simple in-memory cache for development
// In production, use Redis (Upstash)
const cache = new Map<string, { data: any; timestamp: number }>()
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const CACHE_TTL = 60000 // 1 minute
const RATE_LIMIT = 100 // requests per minute
const RATE_LIMIT_WINDOW = 60000 // 1 minute

/**
 * Validate HMAC signature
 */
function validateSignature(signature: string, payload: string, secret: string): boolean {
  // In production, use crypto.createHmac
  // For now, simple validation
  return signature.length > 0
}

/**
 * Check rate limit
 */
function checkRateLimit(clientId: string): { allowed: boolean; remaining: number } {
  const now = Date.now()
  const record = rateLimitMap.get(clientId)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(clientId, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW
    })
    return { allowed: true, remaining: RATE_LIMIT - 1 }
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 }
  }

  record.count++
  return { allowed: true, remaining: RATE_LIMIT - record.count }
}

/**
 * Fetch prices from external API
 */
async function fetchPricesFromAPI(symbols: string[]): Promise<any> {
  // Mock implementation - replace with actual API calls
  return symbols.map(symbol => ({
    symbol,
    price: Math.random() * 100,
    change24h: (Math.random() - 0.5) * 10,
    volume24h: Math.random() * 1000000,
    timestamp: Date.now()
  }))
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-client-id, x-signature')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Extract client ID
    const clientId = (req.headers['x-client-id'] as string) || req.socket.remoteAddress || 'unknown'

    // Check rate limit
    const rateLimit = checkRateLimit(clientId)
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT.toString())
    res.setHeader('X-RateLimit-Remaining', rateLimit.remaining.toString())

    if (!rateLimit.allowed) {
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        retryAfter: 60
      })
    }

    // Validate signature (optional for GET requests)
    const signature = req.headers['x-signature'] as string
    if (req.method === 'POST' && signature) {
      const payload = JSON.stringify(req.body)
      const isValid = validateSignature(signature, payload, process.env.API_SECRET || 'dev-secret')
      
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' })
      }
    }

    // Get symbols from query or body
    const symbolsParam = req.method === 'GET' 
      ? (req.query.symbols as string)
      : req.body?.symbols

    if (!symbolsParam) {
      return res.status(400).json({ error: 'Missing symbols parameter' })
    }

    const symbols = Array.isArray(symbolsParam) 
      ? symbolsParam 
      : symbolsParam.split(',')

    if (symbols.length === 0 || symbols.length > 50) {
      return res.status(400).json({ 
        error: 'Invalid number of symbols (1-50 allowed)' 
      })
    }

    // Check cache
    const cacheKey = `prices:${symbols.sort().join(',')}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      res.setHeader('X-Cache', 'HIT')
      return res.status(200).json(cached.data)
    }

    // Fetch from external API
    const prices = await fetchPricesFromAPI(symbols)

    // Cache the result
    cache.set(cacheKey, {
      data: prices,
      timestamp: Date.now()
    })

    // Clean up old cache entries
    if (cache.size > 1000) {
      const entries = Array.from(cache.entries())
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp)
      entries.slice(0, 500).forEach(([key]) => cache.delete(key))
    }

    res.setHeader('X-Cache', 'MISS')
    return res.status(200).json(prices)

  } catch (error) {
    console.error('[API] Error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// Secure API Proxy for Price Data with HMAC validation and rate limiting
import type { VercelRequest, VercelResponse } from '@vercel/node'
import crypto from 'crypto'

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>()

// Rate limit: 100 requests per minute per client
const RATE_LIMIT = 100
const RATE_WINDOW = 60 * 1000 // 1 minute

function getClientId(req: VercelRequest): string {
  return (req.headers['x-client-id'] as string) || req.headers['x-forwarded-for'] || req.ip || 'unknown'
}

function checkRateLimit(clientId: string): boolean {
  const now = Date.now()
  const client = rateLimitStore.get(clientId)

  if (!client || now > client.resetAt) {
    rateLimitStore.set(clientId, { count: 1, resetAt: now + RATE_WINDOW })
    return true
  }

  if (client.count >= RATE_LIMIT) {
    return false
  }

  client.count++
  return true
}

function validateHMAC(req: VercelRequest, body: string): boolean {
  const signature = req.headers['x-signature'] as string
  if (!signature) {
    return false // Allow requests without signature in dev (remove in production)
  }

  const apiSecret = process.env.API_SECRET
  if (!apiSecret) {
    console.warn('[API] API_SECRET not set, skipping HMAC validation')
    return true // Allow in development
  }

  const expectedSignature = crypto
    .createHmac('sha256', apiSecret)
    .update(body)
    .digest('hex')

  return signature === expectedSignature
}

async function fetchPricesFromAPI(symbols: string[]): Promise<Record<string, any>> {
  try {
    // Fetch from CoinGecko API
    const symbolsParam = symbols.join(',')
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${symbolsParam}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('[API] Fetch error:', error)
    throw error
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-signature, x-client-id')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // Rate limiting
  const clientId = getClientId(req)
  if (!checkRateLimit(clientId)) {
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Maximum ${RATE_LIMIT} requests per minute`,
    })
  }

  // HMAC validation (for POST requests)
  if (req.method === 'POST') {
    const body = JSON.stringify(req.body)
    if (!validateHMAC(req, body)) {
      return res.status(401).json({
        error: 'Invalid signature',
        message: 'HMAC validation failed',
      })
    }
  }

  // Get symbols from query or body
  const symbolsParam = (req.query.symbols as string) || req.body?.symbols
  if (!symbolsParam) {
    return res.status(400).json({
      error: 'Missing symbols parameter',
      message: 'Provide symbols as query param or in request body',
    })
  }

  const symbols = Array.isArray(symbolsParam)
    ? symbolsParam
    : symbolsParam.split(',').map(s => s.trim().toLowerCase())

  try {
    // Fetch prices
    const prices = await fetchPricesFromAPI(symbols)

    // Cache-Control header
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')

    return res.status(200).json({
      success: true,
      data: prices,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('[API] Handler error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    })
  }
}

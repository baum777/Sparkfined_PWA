import type { VercelRequest, VercelResponse } from '@vercel/node'

const MORALIS_KEY = process.env.MORALIS_API_KEY
const MORALIS_BASE = process.env.MORALIS_BASE_URL || 'https://deep-index.moralis.io/api/v2.2'
const TTL_MS = parseInt(process.env.MORALIS_PROXY_TTL_MS || '60000', 10)
const USE_MOCKS = process.env.DEV_USE_MOCKS === 'true'

type CacheEntry = {
  ts: number
  status: number
  payload: unknown
  headers: Record<string, string>
}

const cache = new Map<string, CacheEntry>()

function buildUpstreamUrl(path: string) {
  const sanitized = path.startsWith('/') ? path : `/${path}`
  return new URL(sanitized, MORALIS_BASE).toString()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    return res.status(204).end()
  }

  const path = (req.url || '').replace(/^\/api\/moralis/, '') || '/'
  const cacheKey = `${req.method}:${path}:${JSON.stringify(req.body || {})}`
  const now = Date.now()
  const isCacheable = (req.method || 'GET').toUpperCase() === 'GET'

  if (isCacheable) {
    const cached = cache.get(cacheKey)
    if (cached && now - cached.ts < TTL_MS) {
      for (const [key, value] of Object.entries(cached.headers)) {
        res.setHeader(key, value)
      }
      return res.status(cached.status).json(cached.payload)
    }
  }

  if (!MORALIS_KEY) {
    if (USE_MOCKS) {
      return res.status(200).json({
        ok: true,
        mocked: true,
        message: 'DEV_USE_MOCKS=true – bypassing Moralis upstream',
        path,
        assumption_status: 'needs_review',
      })
    }

    return res.status(500).json({
      error: 'MORALIS_API_KEY not configured',
      hint: 'Set MORALIS_API_KEY in Vercel project settings',
    })
  }

  try {
    const upstreamUrl = buildUpstreamUrl(path)
    const headers: Record<string, string> = {
      'X-API-Key': MORALIS_KEY,
      accept: 'application/json',
    }

    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'] as string
    }

    const body = ['GET', 'HEAD'].includes((req.method || 'GET').toUpperCase())
      ? undefined
      : typeof req.body === 'string' || req.body instanceof Buffer
        ? req.body
        : JSON.stringify(req.body)

    const upstreamResponse = await fetch(upstreamUrl, {
      method: req.method,
      headers,
      body,
    })

    const text = await upstreamResponse.text()
    const contentType = upstreamResponse.headers.get('content-type') || 'application/json'
    res.setHeader('content-type', contentType)
    res.setHeader('cache-control', isCacheable ? `s-maxage=${Math.floor(TTL_MS / 1000)}` : 'no-store')

    const responsePayload = (() => {
      if (contentType.includes('application/json')) {
        try {
          return JSON.parse(text)
        } catch {
          return { raw: text }
        }
      }
      return { raw: text }
    })()

    if (isCacheable && upstreamResponse.ok) {
      cache.set(cacheKey, {
        ts: now,
        status: upstreamResponse.status,
        payload: responsePayload,
        headers: {
          'content-type': contentType,
          'cache-control': `s-maxage=${Math.floor(TTL_MS / 1000)}`,
        },
      })
    }

    return res.status(upstreamResponse.status).json(responsePayload)
  } catch (error) {
    console.error('moralis proxy error', error)
    return res.status(502).json({ error: 'proxy_error', message: 'Failed to reach Moralis upstream' })
  }
}

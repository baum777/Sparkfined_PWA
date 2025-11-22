export const runtime = 'nodejs'

import type { VercelRequest, VercelResponse } from '@vercel/node'

const DEFAULT_MORALIS_BASE = 'https://deep-index.moralis.io/api/v2.2'

interface CacheEntry {
  ts: number
  status: number
  payload: unknown
  headers: Record<string, string>
}

const cache = new Map<string, CacheEntry>()

function resolveConfig() {
  return {
    key: process.env.MORALIS_API_KEY,
    base: process.env.MORALIS_BASE_URL || DEFAULT_MORALIS_BASE,
    ttlMs: parseInt(process.env.MORALIS_PROXY_TTL_MS || '60000', 10),
    useMocks: process.env.DEV_USE_MOCKS === 'true',
  }
}

function normalizePath(url?: string | null) {
  if (!url) return '/'
  const stripped = url.replace(/^\/api\/moralis/, '')
  return stripped || '/'
}

function buildUpstreamUrl(path: string, base: string) {
  const sanitized = path.startsWith('/') ? path : `/${path}`
  return new URL(sanitized, base).toString()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS')
    return res.status(204).end()
  }

  const path = normalizePath(req.url)
  const method = (req.method || 'GET').toUpperCase()
  const { key, base, ttlMs, useMocks } = resolveConfig()
  const cacheKey = `${method}:${path}:${JSON.stringify(req.body || {})}`
  const now = Date.now()
  const isCacheable = method === 'GET'

  if (method === 'GET' && (path === '/' || path === '/health')) {
    return res.status(200).json({
      ok: true,
      path: '/api/moralis/health',
      hasKey: Boolean(key),
      ttlMs,
      usingMocks: useMocks,
      baseUrl: base,
    })
  }

  if (isCacheable) {
    const cached = cache.get(cacheKey)
    if (cached && now - cached.ts < ttlMs) {
      for (const [key, value] of Object.entries(cached.headers)) {
        res.setHeader(key, value)
      }
      return res.status(cached.status).json(cached.payload)
    }
  }

  if (!key) {
    if (useMocks) {
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
    const upstreamUrl = buildUpstreamUrl(path, base)
    const headers: Record<string, string> = {
      'X-API-Key': key,
      accept: 'application/json',
    }

    const contentTypeHeader = req.headers['content-type']
    if (contentTypeHeader) {
      headers['Content-Type'] = Array.isArray(contentTypeHeader)
        ? contentTypeHeader[0]
        : contentTypeHeader
    }

    const body = ['GET', 'HEAD'].includes(method)
      ? undefined
      : typeof req.body === 'string' || req.body instanceof Buffer
        ? req.body
        : JSON.stringify(req.body)

    const upstreamResponse = await globalThis.fetch(upstreamUrl, {
      method,
      headers,
      body,
    })

    const text = await upstreamResponse.text()
    const contentType = upstreamResponse.headers.get('content-type') || 'application/json'
    res.setHeader('content-type', contentType)
    res.setHeader('cache-control', isCacheable ? `s-maxage=${Math.floor(ttlMs / 1000)}` : 'no-store')

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
          'cache-control': `s-maxage=${Math.floor(ttlMs / 1000)}`,
        },
      })
    }

    return res.status(upstreamResponse.status).json(responsePayload)
  } catch (error) {
    console.error('moralis proxy error', error)
    return res.status(502).json({ error: 'proxy_error', message: 'Failed to reach Moralis upstream' })
  }
}

export function __clearMoralisProxyCacheForTests() {
  cache.clear()
}

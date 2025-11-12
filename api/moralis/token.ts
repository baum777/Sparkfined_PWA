/**
 * Moralis OHLCV Proxy
 *
 * Lightweight Vercel function that forwards OHLC requests to the Moralis API.
 * Responses are cached in-memory for a short period to shield the upstream API
 * from bursts. The handler intentionally does not expose the Moralis API key to
 * the client.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

type CacheEntry = {
  timestamp: number
  payload: unknown
}

const cache = new Map<string, CacheEntry>()

const toSeconds = (ms: number) => Math.max(Math.floor(ms / 1000), 0)

function getMoralisBase(): string {
  const base =
    process.env.MORALIS_BASE_URL ||
    process.env.MORALIS_BASE ||
    'https://deep-index.moralis.io/api/v2.2'
  return base.endsWith('/') ? base.slice(0, -1) : base
}

function getMoralisApiKey(): string {
  return process.env.MORALIS_API_KEY || ''
}

function getTtl(): number {
  const raw = process.env.MORALIS_PROXY_TTL_MS
  const parsed = raw ? Number(raw) : 10_000
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

export function __clearMoralisProxyCacheForTests(): void {
  cache.clear()
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'method not allowed' })
    return
  }

  const { network, address, limit } = req.query
  if (!network || typeof network !== 'string' || !address || typeof address !== 'string') {
    res.status(400).json({ ok: false, error: 'network & address required' })
    return
  }

  const apiKey = getMoralisApiKey()
  if (!apiKey) {
    res.status(500).json({ ok: false, error: 'Moralis API key not configured' })
    return
  }

  const ttl = getTtl()
  const cacheKey = `${network}:${address}:${typeof limit === 'string' ? limit : 'default'}`
  const cached = ttl > 0 ? cache.get(cacheKey) : undefined

  if (cached && Date.now() - cached.timestamp < ttl) {
    if (ttl > 0) {
      const seconds = toSeconds(ttl)
      res.setHeader('Cache-Control', `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=30`)
    }
    res.status(200).json(cached.payload)
    return
  }

  const params = new URLSearchParams({ network })
  if (typeof limit === 'string' && limit.trim() !== '') {
    params.set('limit', limit)
  }

  const moralisUrl = `${getMoralisBase()}/erc20/${encodeURIComponent(address)}/ohlcv?${params.toString()}`

  try {
    const response = await fetch(moralisUrl, {
      headers: {
        Accept: 'application/json',
        'X-API-Key': apiKey,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      const text = await response.text()
      res.status(response.status).send(text || 'request failed')
      return
    }

    const payload = await response.json()
    if (ttl > 0) {
      cache.set(cacheKey, { timestamp: Date.now(), payload })
      const seconds = toSeconds(ttl)
      res.setHeader('Cache-Control', `public, max-age=${seconds}, s-maxage=${seconds}, stale-while-revalidate=30`)
    }

    res.status(200).json(payload)
  } catch (error) {
    console.error('[moralis/token] proxy error', error)
    res.status(502).json({ ok: false, error: 'bad gateway' })
  }
}

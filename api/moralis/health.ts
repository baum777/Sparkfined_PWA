import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const hasKey = Boolean(process.env.MORALIS_API_KEY)
  const ttl = parseInt(process.env.MORALIS_PROXY_TTL_MS || '60000', 10)
  const useMocks = process.env.DEV_USE_MOCKS === 'true'

  const status = {
    ok: hasKey || useMocks,
    hasKey,
    useMocks,
    ttl,
    baseUrl: process.env.MORALIS_BASE_URL || 'https://deep-index.moralis.io/api/v2.2',
    timestamp: new Date().toISOString(),
  }

  res.status(status.ok ? 200 : 500).json(status)
}

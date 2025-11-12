import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import handler, { __clearMoralisProxyCacheForTests } from '../../api/moralis/[...path]'

describe('api/moralis catch-all', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = { ...process.env }
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.restoreAllMocks()
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    process.env.MORALIS_API_KEY = 'test-key'
    process.env.MORALIS_BASE_URL = 'https://example.moralis.io'
    process.env.MORALIS_PROXY_TTL_MS = '1000'
    __clearMoralisProxyCacheForTests()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    if (originalFetch) {
      globalThis.fetch = originalFetch
    }
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    }
    Object.assign(process.env, originalEnv)
  })

  it('returns proxy health payload when hitting /health', async () => {
    delete process.env.MORALIS_API_KEY
    const req = { method: 'GET', url: '/api/moralis/health' } as any
    const res = createMockResponse()

    await handler(req, res)

    expect(res.statusCode).toBe(200)
    expect(res.body).toMatchObject({ ok: true, path: '/api/moralis/health', hasKey: false })
  })

  it('caches successful responses using the configured TTL', async () => {
    const moralisPayload = [{ t: 1, o: 1, h: 2, l: 0.5, c: 1.5 }]
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(moralisPayload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )
    expect(globalThis.fetch).toBe(fetchMock)

    const req = {
      method: 'GET',
      url: '/api/moralis/erc20/So11111111111111111111111111111111111111112/price?chain=solana&limit=10',
      headers: {},
    } as any

    const first = createMockResponse()
    await handler(req, first)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(first.statusCode).toBe(200)

    const second = createMockResponse()
    await handler(req, second)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(second.statusCode).toBe(200)
    expect(second.headers['cache-control']).toContain('s-maxage=1')
  })
})

function createMockResponse() {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: undefined as unknown,
  }

  res.status = (code: number) => {
    res.statusCode = code
    return res
  }

  res.json = (payload: unknown) => {
    res.body = payload
    return res
  }

  res.send = (payload: unknown) => {
    res.body = payload
    return res
  }

  res.setHeader = (name: string, value: string) => {
    res.headers[name.toLowerCase()] = value
  }

  return res
}

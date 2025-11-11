import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import handler, { __clearMoralisProxyCacheForTests } from '../../api/moralis/token'

describe('api/moralis/token', () => {
  const originalFetch = globalThis.fetch
  const originalEnv = { ...process.env }

  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
    process.env.MORALIS_API_KEY = 'test-key'
    process.env.MORALIS_BASE = 'https://example.moralis.io'
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

  it('returns 400 when required parameters are missing', async () => {
    const req = { method: 'GET', query: {} } as any
    const res = createMockResponse()

    await handler(req, res)

    expect(res.statusCode).toBe(400)
    expect(res.body).toMatchObject({ ok: false })
  })

  it('caches successful responses using the configured TTL', async () => {
    const moralisPayload = [{ t: 1, o: 1, h: 2, l: 0.5, c: 1.5 }]
    const fetchMock = vi.mocked(globalThis.fetch as unknown as typeof fetch)
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify(moralisPayload), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      })
    )

    const req = {
      method: 'GET',
      query: { network: 'solana', address: 'So11111111111111111111111111111111111111112', limit: '10' },
    } as any

    const first = createMockResponse()
    await handler(req, first)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(first.statusCode).toBe(200)

    const second = createMockResponse()
    await handler(req, second)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(second.statusCode).toBe(200)
    expect(second.headers['cache-control']).toContain('max-age=1')
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

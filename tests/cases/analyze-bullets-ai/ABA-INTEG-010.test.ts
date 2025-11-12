import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import { aiAssist } from '@/lib/aiClient'
import vars from '../../fixtures/analyze-bullets-ai/sample-vars.json'
import { startAiProxyMock } from '../../mocks/aiProxyMock'

describe('ABA-INTEG-010 — analyze bullets via proxy (mocked)', () => {
  const realFetch = globalThis.fetch
  let closeMock: (() => Promise<void>) | undefined

  beforeAll(async () => {
    const mock = await startAiProxyMock({
      onRequest: (body) => {
        expect(body.vars.address).toMatch(/^So1/)
      }
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const target = typeof input === 'string' ? input : input.toString()
      const rewritten = new URL(target, mock.url).toString()
      return realFetch(rewritten, {
        ...init,
        headers: {
          ...(init?.headers as Record<string, string>),
          authorization: 'Bearer // REDACTED_TOKEN',
        },
      })
    })

    closeMock = mock.close
  })

  afterAll(async () => {
    vi.restoreAllMocks()
    if (closeMock) {
      await closeMock()
    }
  })

  it('returns mocked bullet payload', async () => {
    const response = await aiAssist({
      provider: 'anthropic',
      templateId: 'v1/analyze_bullets',
      vars,
    })

    expect(response.ok).toBe(true)
    expect(response.text).toContain('Mocked bullet')
    expect(response.provider).toBe('anthropic')
  })
})

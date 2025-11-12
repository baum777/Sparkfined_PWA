import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import { aiAssist } from '@/lib/aiClient'
import draft from '../../fixtures/journal-condense-ai/draft.json'
import { startAiProxyMock } from '../../mocks/aiProxyMock'

describe('JCA-INTEG-010 — journal condense via proxy (mocked)', () => {
  const realFetch = globalThis.fetch
  let closeMock: (() => Promise<void>) | undefined

  beforeAll(async () => {
    const mock = await startAiProxyMock({
      responseBody: {
        ok: true,
        provider: 'anthropic',
        text: JSON.stringify({ bullets: ['Kontext', 'Plan'] }),
        usage: { input_tokens: 320, output_tokens: 120 },
      },
    })

    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const rewritten = new URL(typeof input === 'string' ? input : input.toString(), mock.url).toString()
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
    if (closeMock) await closeMock()
  })

  it('returns condensed bullets JSON', async () => {
    const res = await aiAssist({
      provider: 'anthropic',
      templateId: 'v1/journal_condense',
      vars: draft,
    })

    expect(res.ok).toBe(true)
    expect(res.text).toContain('Kontext')
    expect(res.provider).toBe('anthropic')
  })
})

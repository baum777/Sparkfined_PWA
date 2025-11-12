import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { aiAssist } from '@/lib/aiClient'

const systemPrompt = 'Du reduzierst Chart-Notizen auf das Wesentliche. ...'
const userPrompt = 'Titel: Breakout Setup\nCA: So1111111111\nTF: 15m\nNotiz:\nLong an Daily SR, Stop unter Tages-Tief'

describe('JCA-UNIT-001 — journal condense request formatting', () => {
  const realFetch = globalThis.fetch

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('sends system and user prompts via aiAssist', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, text: '- Kontext: ...' }),
    })
    globalThis.fetch = fetchSpy

    await aiAssist({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-latest',
      system: systemPrompt,
      user: userPrompt,
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string)
    expect(body.system).toBe(systemPrompt)
    expect(body.user).toContain('Breakout Setup')
  })
})

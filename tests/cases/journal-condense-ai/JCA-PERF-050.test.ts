import { describe, it, expect, vi } from 'vitest'
import { performance } from 'node:perf_hooks'
import { aiAssist } from '@/lib/aiClient'
import draft from '../../fixtures/journal-condense-ai/draft.json'

describe('JCA-PERF-050 — condensation latency budget', () => {
  it('resolves mocked proxy round-trip under 350ms', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ ok: true, ms: 210, text: '- Kontext: ...' })
    } as Response)

    const start = performance.now()
    await aiAssist({
      provider: 'anthropic',
      templateId: 'v1/journal_condense',
      vars: draft,
    })
    const elapsed = performance.now() - start

    expect(elapsed).toBeLessThan(350)
  })
})

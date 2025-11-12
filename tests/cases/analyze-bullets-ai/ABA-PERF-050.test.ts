import { describe, it, expect, vi } from 'vitest'
import { performance } from 'node:perf_hooks'
import { aiAssist } from '@/lib/aiClient'
import vars from '../../fixtures/analyze-bullets-ai/sample-vars.json'

describe('ABA-PERF-050 — template render latency budget', () => {
  it('completes proxy round-trip under 300ms with mock cache', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: () => Promise.resolve({ ok: true, fromCache: true, text: 'cached', ms: 120 })
    } as Response)

    const start = performance.now()
    const result = await aiAssist({
      provider: 'anthropic',
      templateId: 'v1/analyze_bullets',
      vars,
    })
    const elapsed = performance.now() - start

    expect(result.fromCache).toBe(true)
    expect(elapsed).toBeLessThan(300)
  })
})

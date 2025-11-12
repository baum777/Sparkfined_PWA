import { beforeEach, describe, expect, it, vi } from 'vitest'
import payload from '../../fixtures/teaser-vision-analysis/payload.json'

describe('TVA-SMOKE-020 — openai fallback smoke', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('falls back to heuristic when OPENAI_API_KEY missing', async () => {
    vi.stubEnv('OPENAI_API_KEY', '')

    const { getTeaserAnalysis } = await import('@/lib/ai/teaserAdapter')
    const result = await getTeaserAnalysis(payload, 'openai')

    expect(result.provider).toBe('heuristic')
    expect(result.teaser_text).toContain('Analysis')
  })
})

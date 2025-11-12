import { beforeEach, describe, expect, it, vi } from 'vitest'
import payload from '../../fixtures/teaser-vision-analysis/payload.json'

describe('TVA-UNIT-001 — heuristic fallback produces teaser', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.unstubAllEnvs()
  })

  it('returns heuristic result when provider is none', async () => {
    vi.stubEnv('ANALYSIS_AI_PROVIDER', 'none')

    const { getTeaserAnalysis } = await import('@/lib/ai/teaserAdapter')
    const result = await getTeaserAnalysis({
      dexData: payload.dexData,
      ocrData: payload.ocrData,
    }, 'none')

    expect(result.provider).toBe('heuristic')
    expect(result.teaser_text.length).toBeGreaterThan(0)
    expect(result.sr_levels.length).toBeGreaterThan(0)
  })
})

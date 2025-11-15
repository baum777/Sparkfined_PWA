import { describe, it, expect, vi } from 'vitest'
import { performance } from 'node:perf_hooks'
import payload from '../../fixtures/teaser-vision-analysis/payload.json'

const currentBaseURL = ''

vi.mock('openai', () => {
  return {
    default: class {
      baseURL: string
      constructor() {
        this.baseURL = currentBaseURL || 'http://127.0.0.1:5566/v1'
      }
      chat = {
        completions: {
          create: async () => ({
            choices: [{ message: { content: JSON.stringify({
              sr_levels: [],
              stop_loss: 0.000039,
              tp: [0.000046],
              indicators: ['RSI 64'],
              teaser_text: 'Mock Vision',
              confidence: 0.7,
            }) } }],
          })
        }
      }
    }
  }
})

describe('TVA-PERF-050 — vision latency budget', () => {
  it('completes mock OpenAI flow under 400ms', async () => {
    vi.resetModules()
    vi.stubEnv('OPENAI_API_KEY', '// REDACTED_TOKEN')
    const { getTeaserAnalysis } = await import('@/lib/ai/teaserAdapter')

    const start = performance.now()
    const result = await getTeaserAnalysis(payload, 'openai')
    const elapsed = performance.now() - start

    expect(result.provider).toBe('openai')
    expect(elapsed).toBeLessThan(400)
  })
})

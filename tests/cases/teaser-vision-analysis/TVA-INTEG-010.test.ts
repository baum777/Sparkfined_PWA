import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import payload from '../../fixtures/teaser-vision-analysis/payload.json'
import { startOpenAIVisionMock } from '../../mocks/openaiVisionMock'

let currentBaseURL = ''

vi.mock('openai', () => {
  return {
    default: class {
      baseURL: string
      constructor({ apiKey, dangerouslyAllowBrowser }: { apiKey: string; dangerouslyAllowBrowser?: boolean }) {
        if (!apiKey || !dangerouslyAllowBrowser) {
          throw new Error('Missing OpenAI configuration')
        }
        this.baseURL = currentBaseURL || 'http://127.0.0.1:5566/v1'
      }

      chat = {
        completions: {
          create: async (body: Record<string, unknown>) => {
            const response = await fetch(`${this.baseURL}/chat/completions`, {
              method: 'POST',
              headers: { 'content-type': 'application/json', authorization: 'Bearer // REDACTED_TOKEN' },
              body: JSON.stringify(body),
            })
            return response.json()
          },
        },
      }
    },
  }
})

describe('TVA-INTEG-010 — OpenAI vision integration (mocked)', () => {
  let stop: (() => Promise<void>) | undefined

  beforeAll(async () => {
    vi.resetModules()
    vi.stubEnv('OPENAI_API_KEY', '// REDACTED_TOKEN')
    const mock = await startOpenAIVisionMock({})
    currentBaseURL = mock.baseURL
    stop = mock.close
  })

  afterAll(async () => {
    currentBaseURL = ''
    vi.unstubAllEnvs()
    if (stop) await stop()
  })

  it('parses OpenAI JSON payload correctly', async () => {
    const { getTeaserAnalysis } = await import('@/lib/ai/teaserAdapter')

    const result = await getTeaserAnalysis(payload, 'openai')

    expect(result.provider).toBe('openai')
    expect(result.sr_levels[0]?.label).toBe('S1')
    expect(result.confidence).toBeGreaterThan(0)
  })
})

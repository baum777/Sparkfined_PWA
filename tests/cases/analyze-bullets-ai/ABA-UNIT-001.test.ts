import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { aiAssist } from '@/lib/aiClient'
import vars from '../../fixtures/analyze-bullets-ai/sample-vars.json'

describe('ABA-UNIT-001 — aiAssist template dispatch', () => {
  const realFetch = globalThis.fetch

  beforeEach(() => {
    vi.resetAllMocks()
  })

  afterEach(() => {
    globalThis.fetch = realFetch
  })

  it('sends analyze bullet template with sanitized vars', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ ok: true, text: 'mocked' })
    })
    globalThis.fetch = fetchSpy

    await aiAssist({
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-latest',
      templateId: 'v1/analyze_bullets',
      vars,
      maxOutputTokens: 800,
      maxCostUsd: 0.15,
    })

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, init] = fetchSpy.mock.calls[0]
    expect(url).toBe('/api/ai/assist')
    expect(init?.method).toBe('POST')
    expect(init?.headers).toMatchObject({ 'content-type': 'application/json' })
    const body = JSON.parse(init?.body as string)
    expect(body.templateId).toBe('v1/analyze_bullets')
    expect(body.vars.metrics.lastClose).toBeCloseTo(0.000043)
    expect(body.vars.matrixRows[0].id).toBe('SMA')
  })
})

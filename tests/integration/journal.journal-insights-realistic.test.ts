/**
 * Integration Smoke Test: Journal Insights (Loop J3-E)
 *
 * Ensures the AI insight service can process a realistic batch of entries
 * and produce structured insights + telemetry payloads without touching runtime UI.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { REALISTIC_JOURNAL_ENTRIES } from '../fixtures/journal-entries-realistic'
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import { buildJournalInsightsTelemetryEvent } from '@/lib/journal/journal-insights-telemetry'

const PROMPT_VERSION = 'journal-insights-v1.0'

const aiInsightsPayload = {
  insights: [
    {
      category: 'BEHAVIOR_LOOP',
      severity: 'WARNING',
      title: 'Repeated FOMO entries',
      summary: 'Multiple entries chase candles after CT hype without confirmation.',
      recommendation: 'Wait for 15m close or liquidity sweep before adding exposure.',
      evidenceEntries: ['trade-fomo-1', 'trade-fomo-3', 'trade-fomo-4', 'trade-fomo-5'],
      confidence: 85,
    },
    {
      category: 'TIMING',
      severity: 'INFO',
      title: 'Performance drops late at night',
      summary: 'Entries taken after midnight UTC show degraded execution quality.',
      recommendation: 'Schedule trading blocks before midnight and skip revenge scalps.',
      evidenceEntries: ['trade-night-1', 'trade-night-2', 'trade-night-3', 'trade-night-4'],
      confidence: 72,
    },
    {
      category: 'RISK_MANAGEMENT',
      severity: 'CRITICAL',
      title: 'Oversized conviction trades',
      summary: 'Risk per trade exceeded limits on PEPE/APT/SEI without defined stops.',
      recommendation: 'Cap size at 1R until five disciplined trades logged; predefine stop distance.',
      evidenceEntries: ['trade-risk-1', 'trade-risk-2', 'trade-risk-3'],
      confidence: 88,
    },
  ],
}

const mockChatCompletionResponse = {
  choices: [
    {
      message: {
        content: JSON.stringify(aiInsightsPayload),
      },
    },
  ],
  usage: {
    prompt_tokens: 950,
    completion_tokens: 420,
  },
}

describe('Journal Insights – Realistic Smoke Test', () => {
  const originalFetch = global.fetch
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
    process.env.OPENAI_API_KEY = 'test-smoke-key'
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockChatCompletionResponse,
    } as Response)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalFetch) {
      global.fetch = originalFetch
    }
  })

  it('processes realistic journal entries and returns structured insights', async () => {
    const result = await getJournalInsightsForEntries({
      entries: REALISTIC_JOURNAL_ENTRIES,
      maxEntries: 20,
    })

    expect(result.insights.length).to.be.greaterThan(0)
    expect(result.promptVersion).to.equal(PROMPT_VERSION)
    expect(result.modelUsed).to.equal('gpt-4o-mini')

    const fomoInsight = result.insights.find(
      (insight) => insight.category === 'BEHAVIOR_LOOP'
    )

    expect(fomoInsight, 'expected BEHAVIOR_LOOP insight for FOMO loop').toBeTruthy()
    if (!fomoInsight) {
      return
    }

    expect(fomoInsight.severity).to.equal('WARNING')
    expect(fomoInsight.evidenceEntries).to.include('trade-fomo-1')
    expect(fomoInsight.evidenceEntries.length).to.be.greaterThan(0)
  })

  it('builds telemetry output from the smoke test result', async () => {
    const result = await getJournalInsightsForEntries({
      entries: REALISTIC_JOURNAL_ENTRIES,
      maxEntries: 20,
    })

    const analysisKey = 'realistic-smoke:v1'
    const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

    expect(event.kind).to.equal('journal_insight')
    if (event.kind !== 'journal_insight') {
      throw new Error('Expected journal_insight telemetry event')
    }

    const payload = event.payload

    expect(payload.analysisKey).to.equal(analysisKey)
    expect(payload.insightCount).to.equal(result.insights.length)
    expect(payload.promptVersion).to.equal(PROMPT_VERSION)
    expect(payload.categories).to.include('BEHAVIOR_LOOP')
    expect(payload.severities).to.include('CRITICAL')
  })
})

import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildJournalInsightsTelemetryEvent,
  sendJournalInsightsGeneratedEvent,
} from '@/lib/journal/journal-insights-telemetry'

const mockResult = {
  insights: [
    {
      id: 'insight-1',
      category: 'BEHAVIOR_LOOP',
      severity: 'WARNING',
      title: 'Loop Detected',
      summary: 'Summary',
      recommendation: 'Do X',
      evidenceEntries: ['entry-1'],
      detectedAt: Date.now(),
    },
    {
      id: 'insight-2',
      category: 'EMOTIONAL_PATTERN',
      severity: 'INFO',
      title: 'Mindset Drift',
      summary: 'Summary',
      recommendation: 'Do Y',
      evidenceEntries: ['entry-2'],
      detectedAt: Date.now(),
    },
  ],
  generatedAt: Date.now(),
  modelUsed: 'gpt-4o-mini',
}

describe('journal-insights-telemetry', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('builds telemetry payload with aggregated metadata', () => {
    const event = buildJournalInsightsTelemetryEvent('key', mockResult)
    expect(event.kind).toBe('journal_insight')
    expect(event.payload.analysisKey).toBe('key')
    expect(event.payload.insightCount).toBe(2)
    expect(event.payload.categories).to.have.lengthOf(2)
    expect(event.payload.severities).to.have.lengthOf(2)
  })

  it('sends telemetry via fetch', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchSpy as unknown as typeof fetch)

    await sendJournalInsightsGeneratedEvent('key', mockResult)

    expect(fetchSpy).toHaveBeenCalledTimes(1)
    const [url, options] = fetchSpy.mock.calls[0]!
    expect(url).toBe('/api/telemetry')
    expect(options?.method).toBe('POST')
    expect(options?.body).toContain('key')
  })
})

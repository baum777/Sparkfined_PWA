/**
 * Journal Insights Telemetry Tests (Loop J3-C)
 * 
 * Tests for telemetry events for journal insights generation.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import {
  buildJournalInsightsTelemetryEvent,
  sendJournalInsightsGeneratedEvent,
} from '@/lib/journal/journal-insights-telemetry'
import type { JournalInsightResult } from '@/types/journalInsights'
import type { TelemetryJournalInsightPayloadV1 } from '@/types/telemetry'

const PROMPT_VERSION = 'journal-insights-v1.0'

function isJournalInsightPayload(
  payload: unknown
): payload is TelemetryJournalInsightPayloadV1 {
  return (
    !!payload &&
    typeof payload === 'object' &&
    'analysisKey' in payload &&
    'insightCount' in payload &&
    'categories' in payload &&
    'severities' in payload &&
    'generatedAt' in payload
  )
}

describe('buildJournalInsightsTelemetryEvent', () => {
  it('builds telemetry event with correct structure', () => {
    const analysisKey = 'latest-20:entry-1,entry-2'
    const result: JournalInsightResult = {
      insights: [
        {
          id: 'insight-1',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'FOMO Pattern',
          summary: 'You tend to enter on FOMO.',
          recommendation: 'Wait for confirmation.',
          evidenceEntries: ['entry-1'],
          confidence: 85,
          detectedAt: 1000,
        },
        {
          id: 'insight-2',
          category: 'TIMING',
          severity: 'INFO',
          title: 'Evening Trades',
          summary: 'Most trades happen in evening.',
          recommendation: 'Consider earlier sessions.',
          evidenceEntries: ['entry-2'],
          confidence: 70,
          detectedAt: 2000,
        },
      ],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
      promptVersion: PROMPT_VERSION,
    }

    const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

    expect(event.kind).toBe('journal_insight')
    expect(event.ts).toBeTruthy()

    const payload = event.payload
    if (!isJournalInsightPayload(payload)) {
      throw new Error('Expected TelemetryJournalInsightPayloadV1 payload')
    }

    expect(payload.schemaVersion).toBe(1)
    expect(payload.analysisKey).toBe(analysisKey)
    expect(payload.insightCount).toBe(2)
    expect(payload.categories).toEqual(['BEHAVIOR_LOOP', 'TIMING'])
    expect(payload.severities).toEqual(['WARNING', 'INFO'])
    expect(payload.modelUsed).toBe('gpt-4o-mini')
    expect(payload.generatedAt).toBeTruthy()
    expect(payload.promptVersion).toBe(PROMPT_VERSION)
  })

  it('deduplicates categories and severities', () => {
    const analysisKey = 'latest-20:entry-1,entry-2,entry-3'
    const result: JournalInsightResult = {
      insights: [
        {
          id: 'insight-1',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'Pattern 1',
          summary: 'Summary 1',
          recommendation: 'Recommendation 1',
          evidenceEntries: ['entry-1'],
          detectedAt: 1000,
        },
        {
          id: 'insight-2',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'Pattern 2',
          summary: 'Summary 2',
          recommendation: 'Recommendation 2',
          evidenceEntries: ['entry-2'],
          detectedAt: 2000,
        },
        {
          id: 'insight-3',
          category: 'TIMING',
          severity: 'INFO',
          title: 'Pattern 3',
          summary: 'Summary 3',
          recommendation: 'Recommendation 3',
          evidenceEntries: ['entry-3'],
          detectedAt: 3000,
        },
      ],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
      promptVersion: PROMPT_VERSION,
    }

    const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

    const payload = event.payload
    if (!isJournalInsightPayload(payload)) {
      throw new Error('Expected TelemetryJournalInsightPayloadV1 payload')
    }

    expect(payload.categories).toHaveLength(2)
    expect(payload.categories).toContain('BEHAVIOR_LOOP')
    expect(payload.categories).toContain('TIMING')
    expect(payload.severities).toHaveLength(2)
    expect(payload.severities).toContain('WARNING')
    expect(payload.severities).toContain('INFO')
  })

  it('handles empty insights result', () => {
    const analysisKey = 'latest-20:entry-1,entry-2'
    const result: JournalInsightResult = {
      insights: [],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
      promptVersion: PROMPT_VERSION,
    }

    const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

    const payload = event.payload
    if (!isJournalInsightPayload(payload)) {
      throw new Error('Expected TelemetryJournalInsightPayloadV1 payload')
    }

    expect(payload.insightCount).toBe(0)
    expect(payload.categories).toEqual([])
    expect(payload.severities).toEqual([])
  })
})

describe('sendJournalInsightsGeneratedEvent', () => {
  const originalFetch = global.fetch

  beforeEach(() => {
    global.fetch = vi.fn()
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  it('sends telemetry event via fetch', async () => {
    const analysisKey = 'latest-20:entry-1,entry-2'
    const result: JournalInsightResult = {
      insights: [
        {
          id: 'insight-1',
          category: 'BEHAVIOR_LOOP',
          severity: 'WARNING',
          title: 'FOMO Pattern',
          summary: 'You tend to enter on FOMO.',
          recommendation: 'Wait for confirmation.',
          evidenceEntries: ['entry-1'],
          confidence: 85,
          detectedAt: 1000,
        },
      ],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
      promptVersion: PROMPT_VERSION,
    }

    const mockFetch = global.fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
    } as Response)

    await sendJournalInsightsGeneratedEvent(analysisKey, result)

    expect(mockFetch).toHaveBeenCalledWith('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: expect.stringContaining('"kind":"journal_insight"'),
    })

    const firstCall = mockFetch.mock.calls[0]
    expect(firstCall).toBeTruthy()
    const requestInit = firstCall?.[1] as RequestInit
    expect(requestInit?.body).toBeTruthy()
    
    const callBody = JSON.parse(requestInit.body as string)
    expect(callBody.source).toBe('sparkfined')
    expect(callBody.events).toHaveLength(1)
    expect(callBody.events[0].kind).toBe('journal_insight')
  })

  it('swallows errors silently', async () => {
    const analysisKey = 'latest-20:entry-1,entry-2'
    const result: JournalInsightResult = {
      insights: [],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
      promptVersion: PROMPT_VERSION,
    }

    const mockFetch = global.fetch as ReturnType<typeof vi.fn>
    mockFetch.mockRejectedValue(new Error('Network error'))

    // Should not throw
    await expect(
      sendJournalInsightsGeneratedEvent(analysisKey, result)
    ).resolves.not.toThrow()
  })

  it('handles fetch failure gracefully', async () => {
    const analysisKey = 'latest-20:entry-1,entry-2'
    const result: JournalInsightResult = {
      insights: [
        {
          id: 'insight-1',
          category: 'TIMING',
          severity: 'INFO',
          title: 'Evening Trades',
          summary: 'Most trades happen in evening.',
          recommendation: 'Consider earlier sessions.',
          evidenceEntries: ['entry-1'],
          detectedAt: 1000,
        },
      ],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
      promptVersion: PROMPT_VERSION,
    }

    const mockFetch = global.fetch as ReturnType<typeof vi.fn>
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    } as Response)

    // Should not throw
    await expect(
      sendJournalInsightsGeneratedEvent(analysisKey, result)
    ).resolves.not.toThrow()
  })
})

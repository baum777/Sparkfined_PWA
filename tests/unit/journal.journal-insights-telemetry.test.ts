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
    }

    const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

    expect(event.kind).toBe('journal_insight')
    expect(event.ts).toBeTruthy()
    expect(event.payload.schemaVersion).toBe(1)
    expect(event.payload.analysisKey).toBe(analysisKey)
    expect(event.payload.insightCount).toBe(2)
    expect(event.payload.categories).toEqual(['BEHAVIOR_LOOP', 'TIMING'])
    expect(event.payload.severities).toEqual(['WARNING', 'INFO'])
    expect(event.payload.modelUsed).toBe('gpt-4o-mini')
    expect(event.payload.generatedAt).toBeTruthy()
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
    }

    const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

    expect(event.payload.categories).toHaveLength(2)
    expect(event.payload.categories).toContain('BEHAVIOR_LOOP')
    expect(event.payload.categories).toContain('TIMING')
    expect(event.payload.severities).toHaveLength(2)
    expect(event.payload.severities).toContain('WARNING')
    expect(event.payload.severities).toContain('INFO')
  })

  it('handles empty insights result', () => {
    const analysisKey = 'latest-20:entry-1,entry-2'
    const result: JournalInsightResult = {
      insights: [],
      generatedAt: Date.now(),
      modelUsed: 'gpt-4o-mini',
    }

    const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

    expect(event.payload.insightCount).toBe(0)
    expect(event.payload.categories).toEqual([])
    expect(event.payload.severities).toEqual([])
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

    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
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

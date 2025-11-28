import { describe, it, expect } from 'vitest'

import {
  computeSocialStatsFromInsightTelemetry,
  computeSocialStatsFromInsights,
} from '@/lib/journal/journal-social-analytics'
import type { TelemetryJournalInsightPayloadV1 } from '@/types/telemetry'
import type { JournalInsight } from '@/types/journalInsights'

describe('computeSocialStatsFromInsightTelemetry', () => {
  it('returns empty snapshot for no events', () => {
    const snapshot = computeSocialStatsFromInsightTelemetry([])

    expect(snapshot.totalInsights).to.equal(0)
    expect(snapshot.topPatterns).to.have.lengthOf(0)
    expect(snapshot.schemaVersion).to.equal(1)
  })

  it('aggregates BEHAVIOR_LOOP insights with severities from telemetry events', () => {
    const events: TelemetryJournalInsightPayloadV1[] = [
      {
        schemaVersion: 1,
        analysisKey: 'run-1',
        insightCount: 3,
        categories: ['BEHAVIOR_LOOP'],
        severities: ['WARNING'],
        modelUsed: 'gpt-4o-mini',
        generatedAt: new Date().toISOString(),
        promptVersion: 'journal-insights-v1.0',
      },
      {
        schemaVersion: 1,
        analysisKey: 'run-2',
        insightCount: 2,
        categories: ['BEHAVIOR_LOOP'],
        severities: ['CRITICAL'],
        modelUsed: 'gpt-4o-mini',
        generatedAt: new Date().toISOString(),
        promptVersion: 'journal-insights-v1.0',
      },
    ]

    const snapshot = computeSocialStatsFromInsightTelemetry(events)

    expect(snapshot.totalInsights).to.equal(5)
    expect(snapshot.topPatterns).to.have.lengthOf(1)

    const [metric] = snapshot.topPatterns
    if (!metric) {
      throw new Error('Expected at least one metric')
    }

    expect(metric.category).to.equal('BEHAVIOR_LOOP')
    expect(metric.totalInsights).to.equal(5)
    expect(metric.severityCounts.WARNING).to.equal(3)
    expect(metric.severityCounts.CRITICAL).to.equal(2)
    expect(metric.severityCounts.INFO).to.equal(0)
  })
})

describe('computeSocialStatsFromInsights', () => {
  it('aggregates mixed categories from raw insights', () => {
    const insights: JournalInsight[] = [
      {
        id: 'i1',
        category: 'BEHAVIOR_LOOP',
        severity: 'WARNING',
        title: 'Pattern 1',
        summary: 'Summary 1',
        recommendation: 'Recommendation 1',
        evidenceEntries: [],
        confidence: 80,
        detectedAt: Date.now(),
      },
      {
        id: 'i2',
        category: 'TIMING',
        severity: 'INFO',
        title: 'Pattern 2',
        summary: 'Summary 2',
        recommendation: 'Recommendation 2',
        evidenceEntries: [],
        confidence: 70,
        detectedAt: Date.now(),
      },
      {
        id: 'i3',
        category: 'TIMING',
        severity: 'INFO',
        title: 'Pattern 3',
        summary: 'Summary 3',
        recommendation: 'Recommendation 3',
        evidenceEntries: [],
        confidence: 65,
        detectedAt: Date.now(),
      },
    ]

    const snapshot = computeSocialStatsFromInsights(insights)

    expect(snapshot.totalInsights).to.equal(3)
    expect(snapshot.topPatterns).to.have.lengthOf(2)

    const behaviorLoop = snapshot.topPatterns.find(
      (metric) => metric.category === 'BEHAVIOR_LOOP'
    )
    const timing = snapshot.topPatterns.find(
      (metric) => metric.category === 'TIMING'
    )

    expect(behaviorLoop?.totalInsights).to.equal(1)
    expect(timing?.totalInsights).to.equal(2)
    expect(timing?.severityCounts.INFO).to.equal(2)
  })
})

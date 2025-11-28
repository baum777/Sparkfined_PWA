import { describe, expect, it } from 'vitest'

import { computeAverageQualityScore, computePhaseDistribution } from '@/lib/journal/journey-analytics'
import type { TelemetryJournalPayloadV1 } from '@/types/telemetry'

describe('journey analytics helpers', () => {
  let idCounter = 0
  const baseEvent = (overrides: Partial<TelemetryJournalPayloadV1> = {}): TelemetryJournalPayloadV1 => ({
    schemaVersion: 1,
    eventType: 'JournalEntryCreated',
    entryId: overrides.entryId ?? `entry-${++idCounter}`,
    qualityScore: null,
    ...overrides,
  })

  it('computes ordered phase distribution without zero buckets', () => {
    const events: TelemetryJournalPayloadV1[] = [
      baseEvent({ entryId: '1', phase: 'DEGEN' }),
      baseEvent({ entryId: '2', phase: 'DEGEN' }),
      baseEvent({ entryId: '3', phase: 'MASTER' }),
      baseEvent({ entryId: '4', phase: 'WARRIOR' }),
      baseEvent({ entryId: '5', phase: 'WARRIOR' }),
      baseEvent({ entryId: '6', phase: 'WARRIOR' }),
      baseEvent({ entryId: '7', phase: undefined }),
    ]

    const distribution = computePhaseDistribution(events)

    expect(distribution).toEqual([
      { phase: 'DEGEN', count: 2 },
      { phase: 'WARRIOR', count: 3 },
      { phase: 'MASTER', count: 1 },
    ])
  })

  it('computes average quality score from valid values only', () => {
    const events: TelemetryJournalPayloadV1[] = [
      baseEvent({ entryId: '1', qualityScore: 70 }),
      baseEvent({ entryId: '2', qualityScore: null }),
      baseEvent({ entryId: '3', qualityScore: 90 }),
    ]

    expect(computeAverageQualityScore(events)).toBeCloseTo(80)
  })

  it('returns null when no numeric quality scores exist', () => {
    const events: TelemetryJournalPayloadV1[] = [
      baseEvent({ entryId: '1', qualityScore: null }),
      baseEvent({ entryId: '2', qualityScore: undefined }),
    ]

    expect(computeAverageQualityScore(events)).toBeNull()
  })
})

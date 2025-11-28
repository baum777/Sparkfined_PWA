import { describe, expect, it } from 'vitest'

import { mapJournalEventToTelemetryEvent } from '@/lib/journal/journalTelemetry'
import type { JournalJourneyMeta } from '@/types/journal'
import type {
  JournalEntryCreatedEvent,
  JournalReflexionCompletedEvent,
} from '@/types/journalEvents'

const baseTimestamp = '2024-11-01T00:00:00.000Z'

describe('mapJournalEventToTelemetryEvent', () => {
  it('enriches reflexion events with journey context and quality score', () => {
    const journeyMeta: JournalJourneyMeta = {
      phase: 'WARRIOR',
      xpTotal: 420,
      streak: 5,
      lastEventAt: Date.now(),
      lastPhaseChangeAt: Date.now() - 1000,
    }

    const event: JournalReflexionCompletedEvent = {
      type: 'JournalReflexionCompleted',
      domain: 'journal',
      timestamp: Date.now(),
      payload: {
        entryId: 'entry-1',
        qualityScore: 88,
        journeyMeta,
      },
    }

    const result = mapJournalEventToTelemetryEvent(event, journeyMeta, {
      sessionId: 'session-123',
      walletAddress: 'wallet-42',
      appVersion: '0.9.0',
      ts: baseTimestamp,
    })

    expect(result.kind).toBe('journal')
    expect(result.ts).toBe(baseTimestamp)
    expect(result.sessionId).toBe('session-123')
    expect(result.payload.schemaVersion).toBe(1)
    expect(result.payload.eventType).toBe('JournalReflexionCompleted')
    expect(result.payload.entryId).toBe('entry-1')
    expect(result.payload.phase).toBe('WARRIOR')
    expect(result.payload.xpTotal).toBe(420)
    expect(result.payload.streak).toBe(5)
    expect(result.payload.qualityScore).toBe(88)
  })

  it('falls back to null qualityScore when event does not provide one', () => {
    const event: JournalEntryCreatedEvent = {
      type: 'JournalEntryCreated',
      domain: 'journal',
      timestamp: Date.now(),
      payload: {
        entryId: 'entry-2',
        source: 'manual',
        snapshot: {
          id: 'entry-2',
          ticker: 'SOL',
          address: 'manual',
          setup: 'custom',
          emotion: 'custom',
          status: 'active',
          timestamp: Date.now(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      },
    }

    const result = mapJournalEventToTelemetryEvent(event)

    expect(result.payload.phase).toBeUndefined()
    expect(result.payload.qualityScore).toBeNull()
  })
})

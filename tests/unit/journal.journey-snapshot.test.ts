import { describe, expect, it } from 'vitest'

import { computeUserJourneySnapshotFromEntries } from '@/lib/journal/journey-snapshot'
import type { JournalEntry } from '@/types/journal'

function createEntry(overrides: Partial<JournalEntry>): JournalEntry {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    timestamp: overrides.timestamp ?? Date.now(),
    ticker: overrides.ticker ?? 'SOL',
    address: overrides.address ?? 'manual',
    setup: overrides.setup ?? 'custom',
    emotion: overrides.emotion ?? 'custom',
    status: overrides.status ?? 'active',
    createdAt: overrides.createdAt ?? Date.now(),
    updatedAt: overrides.updatedAt ?? Date.now(),
    journeyMeta: overrides.journeyMeta,
  }
}

describe('computeUserJourneySnapshotFromEntries', () => {
  it('returns null when no journey metadata is available', () => {
    const entries = [createEntry({ journeyMeta: undefined })]

    expect(computeUserJourneySnapshotFromEntries(entries)).toBeNull()
  })

  it('selects the meta with the highest XP total as snapshot', () => {
    const entries: JournalEntry[] = [
      createEntry({
        journeyMeta: {
          phase: 'DEGEN',
          xpTotal: 120,
          streak: 1,
          lastEventAt: 1000,
        },
      }),
      createEntry({
        journeyMeta: {
          phase: 'WARRIOR',
          xpTotal: 420,
          streak: 4,
          lastEventAt: 2000,
        },
      }),
      createEntry({
        journeyMeta: {
          phase: 'MASTER',
          xpTotal: 320,
          streak: 3,
          lastEventAt: 3000,
        },
      }),
    ]

    const snapshot = computeUserJourneySnapshotFromEntries(entries)

    expect(snapshot).toEqual({ phase: 'WARRIOR', xpTotal: 420, streak: 4 })
  })

  it('breaks XP ties by phase order and recency', () => {
    const entries: JournalEntry[] = [
      createEntry({
        journeyMeta: {
          phase: 'SEEKER',
          xpTotal: 500,
          streak: 5,
          lastEventAt: 1000,
        },
      }),
      createEntry({
        journeyMeta: {
          phase: 'MASTER',
          xpTotal: 500,
          streak: 6,
          lastEventAt: 900,
        },
      }),
      createEntry({
        journeyMeta: {
          phase: 'MASTER',
          xpTotal: 500,
          streak: 7,
          lastEventAt: 1100,
        },
      }),
    ]

    const snapshot = computeUserJourneySnapshotFromEntries(entries)

    expect(snapshot).toEqual({ phase: 'MASTER', xpTotal: 500, streak: 7 })
  })
})

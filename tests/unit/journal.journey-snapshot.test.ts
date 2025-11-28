import { describe, expect, it } from 'vitest'

import {
  DEFAULT_JOURNEY_SNAPSHOT,
  computeUserJourneySnapshotFromEntries,
  type JourneySnapshotSource,
} from '@/lib/journal/journey-snapshot'
import type { JournalJourneyMeta } from '@/types/journal'

function buildMeta(overrides: Partial<JournalJourneyMeta> = {}): JournalJourneyMeta {
  return {
    phase: overrides.phase ?? 'DEGEN',
    xpTotal: overrides.xpTotal ?? 0,
    streak: overrides.streak ?? 0,
    lastEventAt: overrides.lastEventAt ?? Date.now(),
    lastPhaseChangeAt: overrides.lastPhaseChangeAt,
  }
}

function buildSource(meta?: JournalJourneyMeta, overrides: Partial<JourneySnapshotSource> = {}): JourneySnapshotSource {
  return {
    journeyMeta: meta,
    updatedAt: overrides.updatedAt,
    createdAt: overrides.createdAt,
  }
}

describe('computeUserJourneySnapshotFromEntries', () => {
  it('returns default snapshot when no journey metadata is available', () => {
    const entries: JourneySnapshotSource[] = [buildSource(undefined)]

    expect(computeUserJourneySnapshotFromEntries(entries)).toEqual(DEFAULT_JOURNEY_SNAPSHOT)
  })

  it('selects the meta with the highest XP total as snapshot', () => {
    const entries: JourneySnapshotSource[] = [
      buildSource(
        buildMeta({ phase: 'DEGEN', xpTotal: 120, streak: 1, lastEventAt: 1_000 }),
        { updatedAt: 1_000 },
      ),
      buildSource(
        buildMeta({ phase: 'WARRIOR', xpTotal: 420, streak: 4, lastEventAt: 2_000 }),
        { updatedAt: 2_000 },
      ),
      buildSource(
        buildMeta({ phase: 'MASTER', xpTotal: 320, streak: 3, lastEventAt: 3_000 }),
        { updatedAt: 3_000 },
      ),
    ]

    const snapshot = computeUserJourneySnapshotFromEntries(entries)

    expect(snapshot).toEqual({ phase: 'WARRIOR', xpTotal: 420, streak: 4 })
  })

  it('breaks XP ties by phase order and recency', () => {
    const entries: JourneySnapshotSource[] = [
      buildSource(buildMeta({ phase: 'SEEKER', xpTotal: 500, streak: 5, lastEventAt: 1_000 }), {
        updatedAt: 1_000,
      }),
      buildSource(buildMeta({ phase: 'MASTER', xpTotal: 500, streak: 6, lastEventAt: 900 }), {
        updatedAt: 900,
      }),
      buildSource(buildMeta({ phase: 'MASTER', xpTotal: 500, streak: 7, lastEventAt: 1_100 }), {
        updatedAt: 1_100,
      }),
    ]

    const snapshot = computeUserJourneySnapshotFromEntries(entries)

    expect(snapshot).toEqual({ phase: 'MASTER', xpTotal: 500, streak: 7 })
  })
})

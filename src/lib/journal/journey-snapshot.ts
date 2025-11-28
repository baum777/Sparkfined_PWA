import type { JournalJourneyMeta, JourneyPhase } from '@/types/journal'

export interface UserJourneySnapshot {
  phase: JourneyPhase
  xpTotal: number
  streak: number
}

export interface JourneySnapshotSource {
  journeyMeta?: JournalJourneyMeta | null
  updatedAt?: number
  createdAt?: number
}

export const DEFAULT_JOURNEY_SNAPSHOT: UserJourneySnapshot = {
  phase: 'DEGEN',
  xpTotal: 0,
  streak: 0,
}

const PHASE_ORDER: JourneyPhase[] = ['DEGEN', 'SEEKER', 'WARRIOR', 'MASTER', 'SAGE']

const PHASE_PRIORITY = PHASE_ORDER.reduce<Record<JourneyPhase, number>>((acc, phase, index) => {
  acc[phase] = index
  return acc
}, {} as Record<JourneyPhase, number>)

function resolveTimestamp(source: JourneySnapshotSource, meta: JournalJourneyMeta): number {
  return source.updatedAt ?? source.createdAt ?? meta.lastEventAt ?? 0
}

/**
 * Computes the most representative user journey snapshot based on available entries.
 * Picks the snapshot with the highest XP, falling back to phase order and recency.
 */
export function computeUserJourneySnapshotFromEntries(entries: JourneySnapshotSource[]): UserJourneySnapshot {
  let best: { meta: JournalJourneyMeta; ts: number } | null = null

  for (const source of entries) {
    const meta = source.journeyMeta
    if (!meta) {
      continue
    }

    const ts = resolveTimestamp(source, meta)

    if (!best) {
      best = { meta, ts }
      continue
    }

    if (meta.xpTotal > best.meta.xpTotal) {
      best = { meta, ts }
      continue
    }

    if (meta.xpTotal === best.meta.xpTotal) {
      const candidatePriority = PHASE_PRIORITY[meta.phase]
      const bestPriority = PHASE_PRIORITY[best.meta.phase]

      if (candidatePriority > bestPriority) {
        best = { meta, ts }
        continue
      }

      if (candidatePriority === bestPriority && ts > best.ts) {
        best = { meta, ts }
      }
    }
  }

  if (!best) {
    return DEFAULT_JOURNEY_SNAPSHOT
  }

  return {
    phase: best.meta.phase,
    xpTotal: best.meta.xpTotal,
    streak: best.meta.streak,
  }
}

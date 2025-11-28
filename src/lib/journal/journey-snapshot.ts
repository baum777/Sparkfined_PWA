import type { JournalEntry, JournalJourneyMeta, JourneyPhase } from '@/types/journal'

export interface UserJourneySnapshot {
  phase: JourneyPhase
  xpTotal: number
  streak: number
}

const PHASE_ORDER: JourneyPhase[] = ['DEGEN', 'SEEKER', 'WARRIOR', 'MASTER', 'SAGE']

const PHASE_PRIORITY = PHASE_ORDER.reduce<Record<JourneyPhase, number>>((acc, phase, index) => {
  acc[phase] = index
  return acc
}, {} as Record<JourneyPhase, number>)

function pickBestMeta(metas: JournalJourneyMeta[]): JournalJourneyMeta | null {
  if (!metas.length) {
    return null
  }

  const [first, ...rest] = metas
  let best = first

  for (const candidate of rest) {
    if (candidate.xpTotal > best.xpTotal) {
      best = candidate
      continue
    }

    if (candidate.xpTotal === best.xpTotal) {
      const candidatePhasePriority = PHASE_PRIORITY[candidate.phase]
      const bestPhasePriority = PHASE_PRIORITY[best.phase]

      if (candidatePhasePriority > bestPhasePriority) {
        best = candidate
        continue
      }

      if (candidatePhasePriority === bestPhasePriority) {
        const candidateEventAt = candidate.lastEventAt ?? 0
        const bestEventAt = best.lastEventAt ?? 0
        if (candidateEventAt > bestEventAt) {
          best = candidate
        }
      }
    }
  }

  return best
}

/**
 * Computes the most recent user journey snapshot from persisted journal entries.
 * We assume each journeyMeta represents a full snapshot for that entry timestamp,
 * so we pick the meta with the highest XP (ties resolved by phase order, then recency).
 */
export function computeUserJourneySnapshotFromEntries(entries: JournalEntry[]): UserJourneySnapshot | null {
  const metas = entries
    .map((entry) => entry.journeyMeta)
    .filter((meta): meta is JournalJourneyMeta => Boolean(meta))

  if (!metas.length) {
    return null
  }

  const bestMeta = pickBestMeta(metas)

  if (!bestMeta) {
    return null
  }

  return {
    phase: bestMeta.phase,
    xpTotal: bestMeta.xpTotal,
    streak: bestMeta.streak,
  }
}

import type { JourneyPhase } from '@/types/journal'
import type { TelemetryJournalPayloadV1 } from '@/types/telemetry'

export interface PhaseBucket {
  phase: JourneyPhase
  count: number
}

const PHASE_ORDER: JourneyPhase[] = ['DEGEN', 'SEEKER', 'WARRIOR', 'MASTER', 'SAGE']

export function computePhaseDistribution(events: TelemetryJournalPayloadV1[]): PhaseBucket[] {
  const counts = new Map<JourneyPhase, number>()

  for (const event of events) {
    if (!event.phase) continue
    counts.set(event.phase, (counts.get(event.phase) ?? 0) + 1)
  }

  return PHASE_ORDER
    .filter((phase) => (counts.get(phase) ?? 0) > 0)
    .map((phase) => ({ phase, count: counts.get(phase)! }))
}

export function computeAverageQualityScore(events: TelemetryJournalPayloadV1[]): number | null {
  const scores = events
    .map((event) => event.qualityScore)
    .filter((score): score is number => typeof score === 'number' && Number.isFinite(score))

  if (!scores.length) {
    return null
  }

  const total = scores.reduce((sum, value) => sum + value, 0)
  return total / scores.length
}

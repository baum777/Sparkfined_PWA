import type { JournalJourneyMeta } from '@/types/journal'
import type { JournalEvent } from '@/types/journalEvents'
import type { TelemetryBase, TelemetryEvent } from '@/types/telemetry'

const TELEMETRY_SCHEMA_VERSION = 1 as const

export function mapJournalEventToTelemetryEvent(
  event: JournalEvent,
  journeyMeta?: JournalJourneyMeta,
  base?: Partial<TelemetryBase>,
): TelemetryEvent {
  const qualityScore =
    event.type === 'JournalReflexionCompleted' ? event.payload.qualityScore : null

  return {
    kind: 'journal',
    ts: base?.ts ?? new Date().toISOString(),
    sessionId: base?.sessionId,
    walletAddress: base?.walletAddress,
    appVersion: base?.appVersion,
    payload: {
      schemaVersion: TELEMETRY_SCHEMA_VERSION,
      eventType: event.type,
      entryId: event.payload.entryId,
      phase: journeyMeta?.phase,
      xpTotal: journeyMeta?.xpTotal,
      streak: journeyMeta?.streak,
      qualityScore,
    },
  }
}

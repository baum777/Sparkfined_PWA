import type { JourneyPhase } from '@/types/journal'
import type { JournalEvent } from '@/types/journalEvents'

export type TelemetryEventKind = 'solana_meme_trend' | 'journal' | 'system'

export interface TelemetryBase {
  kind: TelemetryEventKind
  ts: string
  sessionId?: string
  walletAddress?: string
  appVersion?: string
}

export interface TelemetryJournalPayloadV1 {
  schemaVersion: 1
  eventType: JournalEvent['type']
  entryId: string
  phase?: JourneyPhase
  xpTotal?: number
  streak?: number
  qualityScore?: number | null
}

export type TelemetryEvent =
  | (TelemetryBase & { kind: 'journal'; payload: TelemetryJournalPayloadV1 })
  | (TelemetryBase & { kind: 'solana_meme_trend'; payload?: Record<string, unknown> })
  | (TelemetryBase & { kind: 'system'; payload?: Record<string, unknown> })

export interface TelemetryBatchPayload {
  source: 'sparkfined'
  events: TelemetryEvent[]
}

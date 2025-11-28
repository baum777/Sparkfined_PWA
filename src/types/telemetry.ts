import type { JourneyPhase } from '@/types/journal'
import type { JournalInsightCategory, JournalInsightSeverity } from '@/types/journalInsights'
import type { JournalEvent } from '@/types/journalEvents'

export type TelemetryEventKind = 'solana_meme_trend' | 'journal' | 'journal_insight' | 'system'

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

export interface TelemetryJournalInsightPayloadV1 {
  schemaVersion: 1
  analysisKey: string
  insightCount: number
  categories: JournalInsightCategory[]
  severities: JournalInsightSeverity[]
  modelUsed?: string
  generatedAt: string
}

export type TelemetryEvent =
  | (TelemetryBase & { kind: 'journal'; payload: TelemetryJournalPayloadV1 })
  | (TelemetryBase & { kind: 'journal_insight'; payload: TelemetryJournalInsightPayloadV1 })
  | (TelemetryBase & { kind: 'solana_meme_trend'; payload?: Record<string, unknown> })
  | (TelemetryBase & { kind: 'system'; payload?: Record<string, unknown> })

export interface TelemetryBatchPayload {
  source: 'sparkfined'
  events: TelemetryEvent[]
}

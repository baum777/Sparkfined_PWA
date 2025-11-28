import type { JournalInsightResult } from '@/types/journalInsights'
import type {
  TelemetryBatchPayload,
  TelemetryEvent,
  TelemetryJournalInsightPayloadV1,
} from '@/types/telemetry'

const TELEMETRY_SCHEMA_VERSION = 1 as const

export function buildJournalInsightsTelemetryEvent(
  analysisKey: string,
  result: JournalInsightResult
): TelemetryEvent {
  const generatedAtIso = new Date(result.generatedAt ?? Date.now()).toISOString()
  const categories = Array.from(new Set(result.insights.map((insight) => insight.category)))
  const severities = Array.from(new Set(result.insights.map((insight) => insight.severity)))

  const payload: TelemetryJournalInsightPayloadV1 = {
    schemaVersion: TELEMETRY_SCHEMA_VERSION,
    analysisKey,
    insightCount: result.insights.length,
    categories,
    severities,
    modelUsed: result.modelUsed,
    generatedAt: generatedAtIso,
  }

  return {
    kind: 'journal_insight',
    ts: new Date().toISOString(),
    payload,
  }
}

export async function sendJournalInsightsGeneratedEvent(
  analysisKey: string,
  result: JournalInsightResult
): Promise<void> {
  const telemetryEvent = buildJournalInsightsTelemetryEvent(analysisKey, result)

  const batch: TelemetryBatchPayload = {
    source: 'sparkfined',
    events: [telemetryEvent],
  }

  try {
    if (typeof fetch === 'undefined') {
      return
    }

    await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
      keepalive: true,
    })
  } catch {
    // Fire-and-forget: telemetry failures must not affect UX.
  }
}

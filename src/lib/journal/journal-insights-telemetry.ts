/**
 * Journal Insights Telemetry (Loop J3-C)
 * 
 * Helper functions to send telemetry events for journal insights generation.
 */

import type { TelemetryEvent, TelemetryJournalInsightPayloadV1 } from '@/types/telemetry'
import type { JournalInsightResult } from '@/types/journalInsights'

/**
 * Build a telemetry event for journal insights generation.
 */
export function buildJournalInsightsTelemetryEvent(
  analysisKey: string,
  result: JournalInsightResult
): TelemetryEvent {
  const categories = Array.from(new Set(result.insights.map((i) => i.category)))
  const severities = Array.from(new Set(result.insights.map((i) => i.severity)))

  const payload: TelemetryJournalInsightPayloadV1 = {
    schemaVersion: 1,
    analysisKey,
    insightCount: result.insights.length,
    categories,
    severities,
    modelUsed: result.modelUsed,
    generatedAt: new Date(result.generatedAt).toISOString(),
  }

  return {
    kind: 'journal_insight',
    ts: new Date().toISOString(),
    payload,
  }
}

/**
 * Send a telemetry event for journal insights generation.
 * Fire-and-forget: errors are logged but do not block the UI.
 */
export async function sendJournalInsightsGeneratedEvent(
  analysisKey: string,
  result: JournalInsightResult
): Promise<void> {
  const event = buildJournalInsightsTelemetryEvent(analysisKey, result)

  try {
    await fetch('/api/telemetry', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        source: 'sparkfined',
        events: [event],
      }),
    })
  } catch (error) {
    // Fire-and-forget: log but don't throw
    console.warn('[JournalInsightsTelemetry] Failed to send telemetry event', error)
  }
}

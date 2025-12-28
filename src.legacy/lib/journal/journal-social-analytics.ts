import type { TelemetryJournalInsightPayloadV1 } from '@/types/telemetry'
import type {
  SocialInsightMetric,
  SocialStatsSnapshot,
} from '@/types/journalSocial'
import type {
  JournalInsight,
  JournalInsightCategory,
  JournalInsightSeverity,
} from '@/types/journalInsights'

const ALL_SEVERITIES: JournalInsightSeverity[] = ['INFO', 'WARNING', 'CRITICAL']

function createSeverityCounts(): Record<JournalInsightSeverity, number> {
  return {
    INFO: 0,
    WARNING: 0,
    CRITICAL: 0,
  }
}

function ensureMetric(
  metrics: Map<JournalInsightCategory, SocialInsightMetric>,
  category: JournalInsightCategory
): SocialInsightMetric {
  let metric = metrics.get(category)
  if (!metric) {
    metric = {
      category,
      totalInsights: 0,
      severityCounts: createSeverityCounts(),
    }
    metrics.set(category, metric)
  }
  return metric
}

export function computeSocialStatsFromInsightTelemetry(
  events: TelemetryJournalInsightPayloadV1[],
  options?: { topK?: number }
): SocialStatsSnapshot {
  const topK = options?.topK ?? 5
  const metrics = new Map<JournalInsightCategory, SocialInsightMetric>()
  let totalInsights = 0

  for (const event of events) {
    const insightCount = event.insightCount ?? 0
    if (insightCount <= 0) {
      continue
    }

    totalInsights += insightCount

    for (const category of event.categories) {
      const metric = ensureMetric(metrics, category)
      metric.totalInsights += insightCount

      for (const severity of event.severities) {
        if (!ALL_SEVERITIES.includes(severity)) {
          continue
        }
        metric.severityCounts[severity] += insightCount
      }
    }
  }

  const sortedMetrics = Array.from(metrics.values()).sort(
    (a, b) => b.totalInsights - a.totalInsights
  )

  return {
    schemaVersion: 1,
    totalInsights,
    totalTraders: null,
    topPatterns: sortedMetrics.slice(0, topK),
  }
}

export function computeSocialStatsFromInsights(
  insights: JournalInsight[],
  options?: { topK?: number }
): SocialStatsSnapshot {
  const topK = options?.topK ?? 5
  const metrics = new Map<JournalInsightCategory, SocialInsightMetric>()
  let totalInsights = 0

  for (const insight of insights) {
    totalInsights += 1

    const metric = ensureMetric(metrics, insight.category)
    metric.totalInsights += 1

    if (ALL_SEVERITIES.includes(insight.severity)) {
      metric.severityCounts[insight.severity] += 1
    }
  }

  const sortedMetrics = Array.from(metrics.values()).sort(
    (a, b) => b.totalInsights - a.totalInsights
  )

  return {
    schemaVersion: 1,
    totalInsights,
    totalTraders: null,
    topPatterns: sortedMetrics.slice(0, topK),
  }
}

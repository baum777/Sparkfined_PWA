/**
 * Social Insight Aggregation Types (Loop J4-A)
 *
 * Shared domain types for community-style insight heatmaps.
 */

import type {
  JournalInsightCategory,
  JournalInsightSeverity,
} from '@/types/journalInsights'

export interface SocialInsightMetric {
  category: JournalInsightCategory
  totalInsights: number
  severityCounts: Record<JournalInsightSeverity, number>
}

export interface SocialStatsSnapshot {
  schemaVersion: 1
  totalInsights: number
  totalTraders?: number | null
  topPatterns: SocialInsightMetric[]
}

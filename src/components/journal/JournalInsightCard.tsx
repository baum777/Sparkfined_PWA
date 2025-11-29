import React from 'react'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import type { JournalInsight } from '@/types/journalInsights'

interface JournalInsightCardProps {
  insight: JournalInsight
}

const severityConfig: Record<
  JournalInsight['severity'],
  { label: string; badgeVariant: 'default' | 'warning' | 'danger' }
> = {
  INFO: { label: 'Insight', badgeVariant: 'default' },
  WARNING: { label: 'Watch', badgeVariant: 'warning' },
  CRITICAL: { label: 'Critical', badgeVariant: 'danger' },
}

const categoryLabels: Record<JournalInsight['category'], string> = {
  BEHAVIOR_LOOP: 'Behavior Loop',
  TIMING: 'Timing',
  RISK_MANAGEMENT: 'Risk Management',
  SETUP_DISCIPLINE: 'Setup Discipline',
  EMOTIONAL_PATTERN: 'Emotional Pattern',
  OTHER: 'General',
}

export function JournalInsightCard({ insight }: JournalInsightCardProps) {
  const severity = severityConfig[insight.severity]
  const evidenceCount = insight.evidenceEntries.length

  return (
    <Card
      data-testid="journal-insight-card"
      className="border-border-subtle bg-surface-secondary/60 text-text-primary"
    >
      <CardHeader className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em]">
          <Badge variant={severity.badgeVariant}>{severity.label}</Badge>
          <Badge variant="outline" className="text-text-secondary">
            {categoryLabels[insight.category] ?? insight.category.replace(/_/g, ' ')}
          </Badge>
          {typeof insight.confidence === 'number' && (
            <span className="ml-auto text-[11px] font-medium text-text-tertiary">
              Confidence {Math.round(insight.confidence)}%
            </span>
          )}
        </div>
        <CardTitle className="text-lg text-text-primary">{insight.title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">{insight.summary}</p>

        <div className="rounded-2xl border border-border bg-surface px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">Recommendation</p>
          <p className="mt-1 text-sm text-text-primary">{insight.recommendation}</p>
        </div>

        {evidenceCount > 0 && (
          <p className="text-xs text-text-tertiary">
            Based on {evidenceCount} trade{evidenceCount === 1 ? '' : 's'}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default JournalInsightCard

import React from 'react'
import type { SocialStatsSnapshot } from '@/types/journalSocial'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/design-system'

interface JournalSocialPreviewProps {
  snapshot: SocialStatsSnapshot
  maxPatterns?: number
}

const categoryLabels: Record<string, string> = {
  BEHAVIOR_LOOP: 'Behavior Loop',
  TIMING: 'Timing',
  RISK_MANAGEMENT: 'Risk Management',
  SETUP_DISCIPLINE: 'Setup Discipline',
  EMOTIONAL_PATTERN: 'Emotional Pattern',
  OTHER: 'General',
}

export function JournalSocialPreview({
  snapshot,
  maxPatterns = 3,
}: JournalSocialPreviewProps) {
  const patterns = snapshot.topPatterns.slice(0, maxPatterns)

  if (!patterns.length || snapshot.totalInsights === 0) {
    return null
  }

  return (
    <Card
      data-testid="journal-social-preview"
      className="border-border-subtle bg-surface-secondary/60 text-text-primary"
    >
      <CardHeader className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-tertiary">
          Social Preview
        </p>
        <CardTitle className="text-base text-text-primary">
          Dominant Patterns in Your Insights
        </CardTitle>
        <p className="text-xs text-text-tertiary">
          Based on {snapshot.totalInsights} insight{snapshot.totalInsights === 1 ? '' : 's'} from your recent trades.
        </p>
        <p className="text-sm text-text-secondary">
          A local preview of which patterns surface most often inside your insights.
        </p>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-text-secondary">
        {patterns.map((metric) => {
          const { category, totalInsights, severityCounts } = metric
          const totalForCategory = totalInsights ?? 0
          const warning = severityCounts.WARNING ?? 0
          const critical = severityCounts.CRITICAL ?? 0
          const label = categoryLabels[category] ?? category.replace(/_/g, ' ')

          return (
            <div
              key={category}
              className="flex items-start justify-between gap-3 rounded-xl border border-border-subtle bg-surface px-3 py-2"
              data-testid="journal-social-preview-row"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-text-primary">{label}</p>
                <p className="text-[11px] text-text-tertiary">
                  {totalForCategory} insight{totalForCategory === 1 ? '' : 's'}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1 text-[11px] text-text-tertiary">
                <Badge variant="default" className="px-2 py-0.5 text-[10px] bg-transparent border-border text-text-secondary">
                  Warn {warning}
                </Badge>
                <Badge variant="default" className="px-2 py-0.5 text-[10px] bg-transparent border-border text-text-secondary">
                  Crit {critical}
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

export default JournalSocialPreview

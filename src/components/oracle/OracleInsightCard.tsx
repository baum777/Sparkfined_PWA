import React from 'react'
import { Telemetry } from '@/lib/TelemetryService'
import { BookOpen, Check } from '@/lib/icons'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import type { OracleInsight } from '@/features/oracle'

interface OracleInsightCardProps {
  insight: OracleInsight
  onMarkAsRead: (id: string) => void
  /**
   * If false, hides the "Mark as Read" affordance even when `insight.isRead === false`.
   * Useful because Sparkfined only supports marking *today* as read.
   */
  canMarkAsRead?: boolean
}

export default function OracleInsightCard({ insight, onMarkAsRead, canMarkAsRead = true }: OracleInsightCardProps) {
  const handleOpen = () => {
    Telemetry.log('ui.oracle.insight_opened', 1, { insightId: insight.id })
  }

  return (
    <Card data-testid={`oracle-insight-${insight.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-base">{insight.title}</CardTitle>
              {!insight.isRead ? <Badge variant="brand">New</Badge> : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{insight.theme}</Badge>
              <span className="text-xs text-text-tertiary">{insight.date}</span>
            </div>
          </div>
          <Badge variant="default">{insight.score}/7</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">{insight.summary}</p>

        <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-4">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-text-tertiary">Takeaway</p>
          <p className="text-sm text-text-primary">{insight.takeaway}</p>
        </div>

        <details className="group" data-testid={`oracle-insight-details-${insight.id}`}>
          <summary
            className="flex cursor-pointer items-center gap-2 text-sm text-text-secondary hover:text-text-primary"
            data-testid={`oracle-insight-summary-${insight.id}`}
            onClick={handleOpen}
          >
            <BookOpen size={16} />
            <span>View full analysis</span>
          </summary>
          <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-border-subtle bg-surface-subtle p-4 text-xs leading-relaxed text-text-secondary">
            {insight.content}
          </pre>
        </details>

        {!insight.isRead && canMarkAsRead ? (
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Tooltip
              content={
                <p className="text-xs leading-relaxed text-text-secondary">
                  Marks today as reviewed, logs to journal, and builds your streak.
                </p>
              }
              position="bottom"
            >
              <span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onMarkAsRead(insight.id)}
                  data-testid={`oracle-insight-mark-read-${insight.id}`}
                  leftIcon={<Check size={14} />}
                >
                  Mark as Read
                </Button>
              </span>
            </Tooltip>
            <span className="text-xs text-text-tertiary" data-testid="oracle-insight-mark-read-hint">
              Logs to journal & builds streak
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}


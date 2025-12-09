import React from 'react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import type { JournalOutput } from '../types'

interface JournalResultViewProps {
  result: JournalOutput
}

function MetricTile({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface/60 p-3">
      <p className="text-xs uppercase tracking-wide text-text-tertiary">{label}</p>
      <p className="text-lg font-semibold text-text-primary">{value}</p>
      {hint ? <p className="text-xs text-text-secondary">{hint}</p> : null}
    </div>
  )
}

export function JournalResultView({ result }: JournalResultViewProps) {
  return (
    <Card variant="glass" data-testid="journal-v2-result">
      <CardHeader className="pb-3">
        <Badge variant="outline" className="w-fit uppercase tracking-wide text-xs">Archetype</Badge>
        <CardTitle className="text-2xl font-semibold text-text-primary">{result.archetype}</CardTitle>
        <p className="text-sm text-text-secondary">Score combines conviction, pattern quality, and emotional stability.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3" aria-label="Journal score">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-semibold text-text-primary">
            <span className="inline-flex h-2 w-2 rounded-full bg-brand" aria-hidden />
            Score
          </div>
          <span className="text-3xl font-bold text-text-primary">{result.score.toFixed(0)}</span>
          {result.emotionalTrend ? (
            <Badge variant="brand" className="text-xs capitalize">
              Emotional trend: {result.emotionalTrend}
            </Badge>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <MetricTile label="Decision quality" value={(result.metrics.decisionQuality * 100).toFixed(0) + '%'} />
          <MetricTile
            label="Emotional volatility"
            value={(result.metrics.emotionalVolatility * 100).toFixed(0) + '%'}
            hint="Lower is calmer"
          />
          <MetricTile
            label="Risk alignment"
            value={(result.metrics.riskAlignment * 100).toFixed(0) + '%'}
            hint="Conviction × clarity"
          />
          <MetricTile label="Pattern strength" value={(result.normalized.patternStrength * 100).toFixed(0) + '%'} />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-text-primary">Insights</p>
          <ul className="space-y-1 text-sm text-text-secondary" data-testid="journal-v2-insights">
            {result.insights.map((insight) => (
              <li key={insight} className="flex gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
                <span>{insight}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

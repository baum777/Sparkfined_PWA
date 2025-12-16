import React from 'react'
import { Badge, Card, CardContent, CardHeader } from '@/components/ui'
import { MetricCard } from '@/components/ui/MetricCard'
import type { JournalOutput } from '../types'

interface JournalResultViewProps {
  result: JournalOutput
}

export function JournalResultView({ result }: JournalResultViewProps) {
  const scoreColor = result.score >= 70 ? 'text-emerald-400' : result.score >= 40 ? 'text-amber-400' : 'text-rose-400'

  return (
    <Card variant="glass" data-testid="journal-v2-result">
      {/* Summary strip header */}
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="brand" className="uppercase tracking-wide text-[10px]">
              Archetype
            </Badge>
            <h2 className="text-2xl font-bold text-text-primary">{result.archetype}</h2>
            {result.emotionalTrend && (
              <p className="text-sm text-text-secondary">
                Emotional trend: <span className="font-medium capitalize text-text-primary">{result.emotionalTrend}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-text-tertiary">Score</p>
            <p className={`text-4xl font-bold ${scoreColor}`}>{result.score.toFixed(0)}</p>
            <p className="text-xs text-text-tertiary">out of 100</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 2x2 Metric Grid */}
        <div className="grid grid-cols-2 gap-3" data-testid="journal-metrics-grid">
          <MetricCard
            label="Decision Quality"
            value={`${(result.metrics.decisionQuality * 100).toFixed(0)}%`}
            helper="Based on conviction and pattern clarity"
            trendTone={result.metrics.decisionQuality >= 0.7 ? 'positive' : result.metrics.decisionQuality >= 0.4 ? 'neutral' : 'negative'}
          />
          <MetricCard
            label="Emotional Volatility"
            value={`${(result.metrics.emotionalVolatility * 100).toFixed(0)}%`}
            helper="Lower is calmer"
            trendTone={result.metrics.emotionalVolatility <= 0.3 ? 'positive' : result.metrics.emotionalVolatility <= 0.6 ? 'neutral' : 'negative'}
          />
          <MetricCard
            label="Risk Alignment"
            value={`${(result.metrics.riskAlignment * 100).toFixed(0)}%`}
            helper="Conviction × clarity"
            trendTone={result.metrics.riskAlignment >= 0.7 ? 'positive' : result.metrics.riskAlignment >= 0.4 ? 'neutral' : 'negative'}
          />
          <MetricCard
            label="Pattern Strength"
            value={`${(result.normalized.patternStrength * 100).toFixed(0)}%`}
            helper="Technical setup quality"
            trendTone={result.normalized.patternStrength >= 0.7 ? 'positive' : result.normalized.patternStrength >= 0.4 ? 'neutral' : 'negative'}
          />
        </div>

        {/* Insights as cards */}
        {result.insights.length > 0 && (
          <div className="space-y-3" data-testid="journal-insights-section">
            <h3 className="text-sm font-semibold text-text-primary">What next?</h3>
            <div className="grid gap-2 sm:grid-cols-2">
              {result.insights.slice(0, 4).map((insight, index) => (
                <InsightCard key={index} insight={insight} />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function InsightCard({ insight }: { insight: string }) {
  return (
    <div className="rounded-xl border border-border/70 bg-surface/60 p-3 transition hover:bg-surface-hover/50">
      <div className="flex gap-2">
        <span className="mt-0.5 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
        <p className="text-sm text-text-secondary leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}

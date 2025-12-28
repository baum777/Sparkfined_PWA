import React from "react"
import { Badge, Card, CardContent, CardHeader } from "@/components/ui"
import { MetricCard } from "@/components/ui/MetricCard"
import { cn } from "@/lib/ui/cn"
import type { JournalOutput } from "../types"

interface JournalResultViewProps {
  result: JournalOutput
}

export function JournalResultView({ result }: JournalResultViewProps) {
  const scoreTone =
    result.score >= 70 ? "journal-score--positive" : result.score >= 40 ? "journal-score--neutral" : "journal-score--negative"

  return (
    <Card variant="glass" className="journal-card" data-testid="journal-v2-result">
      {/* Summary strip header */}
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <Badge variant="brand" className="uppercase tracking-wide text-[10px]">
              Archetype
            </Badge>
            <h2 className="journal-heading font-bold">{result.archetype}</h2>
            {result.emotionalTrend && (
              <p className="journal-subtitle">
                Emotional trend: <span className="font-medium capitalize text-text-primary">{result.emotionalTrend}</span>
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="journal-meta">Score</p>
            <p className={cn("journal-score", scoreTone)}>{result.score.toFixed(0)}</p>
            <p className="journal-meta">out of 100</p>
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
            <h3 className="journal-heading text-base">What next?</h3>
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
    <div className="journal-insight p-3 transition">
      <div className="flex gap-2">
        <span className="mt-0.5 inline-flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand" aria-hidden />
        <p className="text-sm text-text-secondary leading-relaxed">{insight}</p>
      </div>
    </div>
  )
}

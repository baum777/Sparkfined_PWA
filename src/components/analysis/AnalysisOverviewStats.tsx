import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import StateView from '@/components/ui/StateView';
import type { LucideIcon } from '@/lib/icons';

export type AnalysisOverviewStatTone = 'positive' | 'negative' | 'neutral';

export interface AnalysisOverviewStat {
  id: string;
  label: string;
  value: React.ReactNode;
  helper?: React.ReactNode;
  icon: LucideIcon;
  tone?: AnalysisOverviewStatTone;
}

interface AnalysisOverviewStatsProps {
  stats: AnalysisOverviewStat[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  showMockBadge?: boolean;
  title?: string;
  description?: string;
  dataTestId?: string;
}

export default function AnalysisOverviewStats({
  stats,
  isLoading = false,
  error,
  onRetry,
  showMockBadge = false,
  title = 'Analysis snapshot',
  description,
  dataTestId,
}: AnalysisOverviewStatsProps) {
  if (isLoading) {
    return (
      <StatsState>
        <StateView
          type="loading"
          title="Loading analysis..."
          description="Fetching the latest analysis snapshot."
          compact
        />
      </StatsState>
    );
  }

  if (error) {
    return (
      <StatsState>
        <StateView
          type="error"
          title="Failed to load analysis data"
          description={error}
          actionLabel={onRetry ? 'Retry' : undefined}
          onAction={onRetry}
          compact
        />
      </StatsState>
    );
  }

  if (!stats.length) {
    return (
      <StatsState>
        <StateView
          type="empty"
          title="No analysis data yet"
          description="Run your first analysis or import trading history to see insights here."
          compact
        />
      </StatsState>
    );
  }

  return (
    <Card className="border-border-subtle bg-surface" data-testid={dataTestId}>
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          {description ? <p className="text-sm text-text-secondary">{description}</p> : null}
        </div>
        {showMockBadge ? <Badge variant="warning">Mock Data</Badge> : null}
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((stat) => (
            <article
              key={stat.id}
              className="flex items-start gap-4 rounded-2xl border border-border-subtle bg-surface-subtle/70 p-4"
              data-testid={`analysis-stat-${stat.id}`}
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneIconClass(stat.tone)}`}>
                <stat.icon size={22} aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-text-tertiary">{stat.label}</p>
                <p className={`text-xl font-semibold ${toneValueClass(stat.tone)}`}>{stat.value}</p>
                {stat.helper ? (
                  <p className="text-xs text-text-secondary leading-relaxed">{stat.helper}</p>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function toneValueClass(tone: AnalysisOverviewStatTone = 'neutral'): string {
  switch (tone) {
    case 'positive':
      return 'text-sentiment-bull';
    case 'negative':
      return 'text-sentiment-bear';
    default:
      return 'text-text-primary';
  }
}

function toneIconClass(tone: AnalysisOverviewStatTone = 'neutral'): string {
  switch (tone) {
    case 'positive':
      return 'bg-sentiment-bull-bg text-sentiment-bull';
    case 'negative':
      return 'bg-sentiment-bear-bg text-sentiment-bear';
    default:
      return 'bg-surface text-text-secondary';
  }
}

function StatsState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6">
      {children}
    </div>
  );
}

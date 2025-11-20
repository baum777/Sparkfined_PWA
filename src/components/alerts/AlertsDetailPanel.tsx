import React from 'react';
import type { Alert, AlertStatus } from '@/store/alertsStore';

interface AlertsDetailPanelProps {
  alert?: Alert;
}

const STATUS_STYLES: Record<AlertStatus, string> = {
  armed: 'bg-status-armed-bg text-status-armed-text',
  triggered: 'bg-status-triggered-bg text-status-triggered-text',
  snoozed: 'bg-status-snoozed-bg text-status-snoozed-text',
};

export default function AlertsDetailPanel({ alert }: AlertsDetailPanelProps) {
  if (!alert) {
    return (
      <div className="min-h-[280px] rounded-2xl border border-dashed border-border-moderate bg-surface-subtle px-6 py-8 text-sm text-text-secondary">
        Select an alert on the left to see more detail and context here.
      </div>
    );
  }

  const statusClass = STATUS_STYLES[alert.status];

  return (
    <section className="space-y-6 rounded-2xl border border-border-moderate bg-surface p-5 text-sm text-text-secondary">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-text-tertiary">
          {alert.symbol} &middot; {alert.timeframe}
        </p>
        <h2 className="text-2xl font-semibold text-text-primary">{alert.condition}</h2>
        {alert.summary ? <p className="text-sm text-text-secondary">{alert.summary}</p> : null}
      </header>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Snapshot</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
            {formatLabel(alert.status)}
          </span>
          <span className="inline-flex items-center rounded-full border border-border-moderate bg-surface-skeleton px-3 py-1 text-xs font-semibold text-text-primary">
            {formatLabel(alert.type)}
          </span>
          {alert.origin === 'grok-trend' ? (
            <span className="inline-flex items-center rounded-full border border-sentiment-bull-border bg-sentiment-bull-bg px-3 py-1 text-xs font-semibold text-sentiment-bull">
              Grok trend
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Context</h3>
        <div className="space-y-3">
          <div className="rounded-xl border border-border-moderate bg-surface-subtle p-4 text-text-secondary">
            {alert.sentimentLabel ? (
              <p className="text-sm text-text-primary">Sentiment: {alert.sentimentLabel}</p>
            ) : null}
            {typeof alert.trendingScore === 'number' ? (
              <p className="text-sm text-text-primary">Trending score: {alert.trendingScore.toFixed(2)}</p>
            ) : null}
            {alert.hypeLevel ? <p className="text-sm text-text-primary">Hype: {alert.hypeLevel}</p> : null}
            {alert.callToAction && alert.callToAction !== 'unknown' ? (
              <p className="text-sm text-text-primary">Action hint: {alert.callToAction}</p>
            ) : null}
            {!alert.sentimentLabel && alert.origin === 'grok-trend' ? (
              <p className="text-sm text-text-secondary">Derived from Grok social trend signal.</p>
            ) : null}
          </div>
          {alert.sourceUrl ? (
            <a
              href={alert.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-border-moderate px-3 py-2 text-xs font-semibold text-sentiment-bull transition hover:border-sentiment-bull-border hover:bg-sentiment-bull-bg"
            >
              View source tweet
              <span aria-hidden="true">↗</span>
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}


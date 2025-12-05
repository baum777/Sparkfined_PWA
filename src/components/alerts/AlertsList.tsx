import React from 'react';
import type { Alert, AlertStatus, AlertType } from '@/store/alertsStore';

interface AlertsListProps {
  alerts: ReadonlyArray<Alert>;
  activeAlertId?: string;
  onSelectAlert?: (id: string) => void;
}

const STATUS_STYLES: Record<AlertStatus, string> = {
  armed: 'bg-status-armed-bg text-status-armed-text',
  triggered: 'bg-status-triggered-bg text-status-triggered-text',
  paused: 'bg-status-snoozed-bg text-status-snoozed-text',
};

const TYPE_LABELS: Record<AlertType, string> = {
  'price-above': 'Price above',
  'price-below': 'Price below',
};

export default function AlertsList({ alerts, activeAlertId, onSelectAlert }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div
        className="card-bordered rounded-2xl border-dashed px-6 py-10 text-center text-sm text-text-secondary"
        data-testid="alerts-empty-state"
      >
        No alerts yet. Create your first trigger to stay ahead of market shifts.
      </div>
    );
  }

  return (
    <div className="space-y-3" data-testid="alerts-list">
      {alerts.map((alert) => {
        const isActive = activeAlertId === alert.id;
        const statusClasses = STATUS_STYLES[alert.status];
        const typeLabel = TYPE_LABELS[alert.type];

        return (
          <article
            key={alert.id}
            onClick={() => onSelectAlert?.(alert.id)}
            className={`rounded-2xl border px-4 py-3 text-sm text-text-secondary transition sm:px-5 sm:py-4 ${
              isActive
                ? 'border-glow-success bg-brand/5'
                : 'border-border bg-surface cursor-pointer hover:bg-interactive-hover hover-lift'
            }`}
            data-testid="alerts-list-item"
            data-alert-id={alert.id}
            data-alert-status={alert.status}
            data-alert-type={alert.type}
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-tertiary">
                  {alert.symbol} &middot; {alert.timeframe}
                </p>
                <p className="mt-1 text-lg font-medium text-text-primary">{alert.condition}</p>
                {alert.summary ? (
                  <p className="mt-1 text-xs text-text-secondary">{alert.summary}</p>
                ) : null}
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                {formatLabel(alert.status)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-text-tertiary">
              <span className="inline-flex items-center rounded-full border border-border-moderate bg-surface-skeleton px-2.5 py-1 text-text-primary">
                {typeLabel}
              </span>
              {alert.origin === 'grok-trend' ? (
                <span className="inline-flex items-center rounded-full border border-sentiment-bull-border bg-sentiment-bull-bg px-2.5 py-1 text-sentiment-bull">
                  Grok trend
                </span>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}


import React from 'react';
import type { Alert, AlertStatus, AlertType } from '@/store/alertsStore';

interface AlertsListProps {
  alerts: ReadonlyArray<Alert>;
  activeAlertId?: string;
  onSelectAlert?: (id: string) => void;
}

const STATUS_STYLES: Record<AlertStatus, { bg: string; text: string; border: string; shadow: string }> = {
  armed: {
    bg: 'bg-status-armed-bg',
    text: 'text-status-armed-text',
    border: 'border-accent/40',
    shadow: 'shadow-glow-cyan',
  },
  triggered: {
    bg: 'bg-status-triggered-bg',
    text: 'text-status-triggered-text',
    border: 'border-warn/40',
    shadow: 'shadow-glow-gold',
  },
  paused: {
    bg: 'bg-surface-elevated',
    text: 'text-text-tertiary',
    border: 'border-border-moderate',
    shadow: '',
  },
};

const TYPE_LABELS: Record<AlertType, string> = {
  'price-above': 'Price above',
  'price-below': 'Price below',
};

export default function AlertsList({ alerts, activeAlertId, onSelectAlert }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div
        className="rounded-2xl border border-dashed border-border-moderate bg-surface-subtle px-6 py-10 text-center text-sm text-text-secondary"
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
        const statusStyle = STATUS_STYLES[alert.status];
        const typeLabel = TYPE_LABELS[alert.type];
        const isTriggered = alert.status === 'triggered';

        return (
          <article
            key={alert.id}
            onClick={() => onSelectAlert?.(alert.id)}
            className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-sm transition-all sm:px-5 ${
              isActive
                ? 'border-brand/60 bg-interactive-active shadow-glow-phosphor'
                : `cursor-pointer ${isTriggered ? 'border-warn/40 bg-surface shadow-glow-gold' : 'border-border-moderate bg-surface hover:border-border-hover hover:bg-interactive-hover hover:shadow-sm'}`
            }`}
            data-testid="alerts-list-item"
            data-alert-id={alert.id}
            data-alert-status={alert.status}
            data-alert-type={alert.type}
          >
            {/* Animated background pulse for triggered alerts */}
            {isTriggered && (
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-warn/10 to-transparent opacity-80 animate-pulse" />
            )}
            
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
                    {alert.symbol}
                  </p>
                  <span className="text-xs text-text-tertiary">•</span>
                  <p className="text-xs font-medium uppercase tracking-wide text-text-tertiary">
                    {alert.timeframe}
                  </p>
                </div>
                <p className="mt-2 text-base font-semibold text-text-primary">{alert.condition}</p>
                {alert.summary ? (
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">{alert.summary}</p>
                ) : null}
              </div>
              
              {/* Enhanced status badge */}
              <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-wide ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} ${statusStyle.shadow}`}>
                {alert.status === 'armed' && '⚡'}
                {alert.status === 'triggered' && '🔥'}
                {alert.status === 'paused' && '⏸'}
                {formatLabel(alert.status)}
              </span>
            </div>
            
            {/* Tags row */}
            <div className="relative mt-3 flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-wide">
              <span className="inline-flex items-center rounded-full border border-border-moderate bg-surface-elevated px-2.5 py-1 text-text-secondary">
                {typeLabel}
              </span>
              {alert.origin === 'grok-trend' ? (
                <span className="inline-flex items-center rounded-full border border-brand/40 bg-sentiment-bull-bg px-2.5 py-1 text-brand shadow-glow-phosphor">
                  🤖 Grok
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


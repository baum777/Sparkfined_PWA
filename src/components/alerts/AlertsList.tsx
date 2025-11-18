import React from 'react';

export type AlertType = 'price' | 'volume' | 'volatility';
export type AlertStatus = 'armed' | 'triggered' | 'snoozed';

export interface AlertListItem {
  id: string;
  symbol: string;
  condition: string;
  type: AlertType;
  status: AlertStatus;
  timeframe: string;
}

interface AlertsListProps {
  alerts: AlertListItem[];
}

const STATUS_STYLES: Record<AlertStatus, string> = {
  armed: 'bg-amber-500/10 text-amber-300',
  triggered: 'bg-emerald-500/10 text-emerald-300',
  snoozed: 'bg-sky-500/10 text-sky-300',
};

const TYPE_LABELS: Record<AlertType, string> = {
  price: 'Price',
  volume: 'Volume',
  volatility: 'Volatility',
};

export default function AlertsList({ alerts }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center text-sm text-zinc-400">
        No alerts yet. Create your first trigger to stay ahead of market shifts.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const statusClasses = STATUS_STYLES[alert.status];
        const typeLabel = TYPE_LABELS[alert.type];

        return (
          <article
            key={alert.id}
            className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/5 sm:px-5 sm:py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">
                  {alert.symbol} &middot; {alert.timeframe}
                </p>
                <p className="mt-1 text-lg font-medium text-white">{alert.condition}</p>
              </div>
              <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
                {formatLabel(alert.status)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-zinc-400">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-white/80">
                {typeLabel}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}


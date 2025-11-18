import React from 'react';
import type { Alert, AlertStatus } from '@/store/alertsStore';

interface AlertsDetailPanelProps {
  alert?: Alert;
}

const STATUS_STYLES: Record<AlertStatus, string> = {
  armed: 'bg-amber-500/10 text-amber-300',
  triggered: 'bg-emerald-500/10 text-emerald-300',
  snoozed: 'bg-sky-500/10 text-sky-300',
};

export default function AlertsDetailPanel({ alert }: AlertsDetailPanelProps) {
  if (!alert) {
    return (
      <div className="min-h-[280px] rounded-2xl border border-dashed border-white/10 bg-black/30 px-6 py-8 text-sm text-zinc-400">
        Select an alert on the left to see more detail and context here.
      </div>
    );
  }

  const statusClass = STATUS_STYLES[alert.status];

  return (
    <section className="space-y-6 rounded-2xl border border-white/10 bg-black/30 p-5 text-sm text-zinc-300">
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-zinc-500">
          {alert.symbol} &middot; {alert.timeframe}
        </p>
        <h2 className="text-2xl font-semibold text-white">{alert.condition}</h2>
      </header>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-500">Snapshot</h3>
        <div className="flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass}`}>
            {formatLabel(alert.status)}
          </span>
          <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
            {formatLabel(alert.type)}
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs uppercase tracking-[0.3em] text-zinc-500">Future hooks</h3>
        <div className="space-y-3">
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-zinc-400">
            Actions (acknowledge, snooze, mute) coming soon.
          </div>
          <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-zinc-400">
            Links to Analysis, Watchlist and Journal will appear here.
          </div>
        </div>
      </div>
    </section>
  );
}

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}


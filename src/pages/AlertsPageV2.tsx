import React from 'react';
import AlertsLayout from '@/components/alerts/AlertsLayout';
import AlertsList from '@/components/alerts/AlertsList';
import { useAlertsStore } from '@/store/alertsStore';

export default function AlertsPageV2() {
  const alerts = useAlertsStore((state) => state.alerts);
  const headerDescription = `${alerts.length} alerts tracked · Stay ahead of key levels, momentum shifts and volatility spikes`;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Signal board</p>
          <div>
            <h1 className="text-4xl font-semibold text-white">Alerts</h1>
            <p className="mt-2 text-sm text-zinc-400">{headerDescription}</p>
          </div>
        </header>

        <AlertsLayout
          title="Alerts"
          subtitle="Centralize signals, key levels and volatility triggers."
        >
          <AlertsList alerts={alerts} />
        </AlertsLayout>
      </div>
    </div>
  );
}

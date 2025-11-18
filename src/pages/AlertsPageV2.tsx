import React from 'react';
import AlertsLayout from '@/components/alerts/AlertsLayout';
import AlertsList from '@/components/alerts/AlertsList';
import { useAlertsStore } from '@/store/alertsStore';

type StatusFilter = 'all' | 'armed' | 'triggered' | 'snoozed';
type TypeFilter = 'all' | 'price' | 'volume' | 'volatility';

export default function AlertsPageV2() {
  const alerts = useAlertsStore((state) => state.alerts);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const headerDescription = `${alerts.length} alerts tracked · Stay ahead of key levels, momentum shifts and volatility spikes`;
  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((alert) => {
      const statusOk = statusFilter === 'all' || alert.status === statusFilter;
      const typeOk = typeFilter === 'all' || alert.type === typeFilter;
      return statusOk && typeOk;
    });
  }, [alerts, statusFilter, typeFilter]);

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
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex flex-wrap items-center gap-2">
                {STATUS_FILTERS.map((filter) => {
                  const isActive = statusFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-full border px-3 py-1 font-semibold transition ${
                        isActive
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/10 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {formatFilterLabel(filter)}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {TYPE_FILTERS.map((filter) => {
                  const isActive = typeFilter === filter;
                  return (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setTypeFilter(filter)}
                      className={`rounded-full border px-3 py-1 font-semibold transition ${
                        isActive
                          ? 'border-white/30 bg-white/10 text-white'
                          : 'border-white/10 text-white/60 hover:bg-white/5'
                      }`}
                    >
                      {formatFilterLabel(filter)}
                    </button>
                  );
                })}
              </div>
            </div>
            <AlertsList alerts={filteredAlerts} />
          </div>
        </AlertsLayout>
      </div>
    </div>
  );
}

const STATUS_FILTERS: StatusFilter[] = ['all', 'armed', 'triggered', 'snoozed'];
const TYPE_FILTERS: TypeFilter[] = ['all', 'price', 'volume', 'volatility'];

function formatFilterLabel(value: string) {
  if (value === 'all') {
    return 'All';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

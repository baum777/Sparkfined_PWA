import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import AlertsLayout from '@/components/alerts/AlertsLayout';
import AlertsList from '@/components/alerts/AlertsList';
import AlertsDetailPanel from '@/components/alerts/AlertsDetailPanel';
import { AlertsHeaderActions } from '@/components/alerts/AlertsHeaderActions';
import { useAlertsStore } from '@/store/alertsStore';
import { useSearchParams } from 'react-router-dom';

type StatusFilter = 'all' | 'armed' | 'triggered' | 'paused';
type TypeFilter = 'all' | 'price-above' | 'price-below';

export default function AlertsPageV2() {
  const alerts = useAlertsStore((state) => state.alerts);
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const alertFromUrl = searchParams.get('alert');
  const isValidAlertId = alerts.some((alert) => alert.id === alertFromUrl);
  const [activeAlertId, setActiveAlertId] = React.useState<string | undefined>(
    isValidAlertId ? (alertFromUrl as string) : undefined,
  );
  const headerDescription = `${alerts.length} alerts tracked · Stay ahead of key levels, momentum shifts and volatility spikes`;
  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((alert) => {
      const statusOk = statusFilter === 'all' || alert.status === statusFilter;
      const typeOk = typeFilter === 'all' || alert.type === typeFilter;
      return statusOk && typeOk;
    });
  }, [alerts, statusFilter, typeFilter]);
  const activeAlert = React.useMemo(() => {
    return alerts.find((alert) => alert.id === activeAlertId);
  }, [alerts, activeAlertId]);
  React.useEffect(() => {
    const current = searchParams.get('alert');
    if (activeAlertId && current !== activeAlertId) {
      const next = new URLSearchParams(searchParams);
      next.set('alert', activeAlertId);
      setSearchParams(next, { replace: true });
      return;
    }
    if (!activeAlertId && current) {
      const next = new URLSearchParams(searchParams);
      next.delete('alert');
      setSearchParams(next, { replace: true });
    }
  }, [activeAlertId, searchParams, setSearchParams]);

  return (
    <DashboardShell
      title="Alerts"
      description={headerDescription}
      actions={<AlertsHeaderActions alerts={alerts} />}
    >
      <AlertsLayout>
        <div
          className="flex flex-col gap-4 text-text-primary lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6"
          data-testid="alerts-page"
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
                      className={`rounded-full border px-3 py-1 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive
                          ? 'border-brand bg-surface-hover text-text-primary'
                          : 'border-border text-text-secondary hover:bg-surface-hover'
                      }`}
                      data-testid={`alerts-status-filter-${filter}`}
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
                      className={`rounded-full border px-3 py-1 font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                        isActive
                          ? 'border-brand bg-surface-hover text-text-primary'
                          : 'border-border text-text-secondary hover:bg-surface-hover'
                      }`}
                      data-testid={`alerts-type-filter-${filter}`}
                    >
                      {formatFilterLabel(filter)}
                    </button>
                  );
                })}
              </div>
            </div>
            <AlertsList
              alerts={filteredAlerts}
              activeAlertId={activeAlertId}
              onSelectAlert={setActiveAlertId}
            />
          </div>
          <AlertsDetailPanel alert={activeAlert} />
        </div>
      </AlertsLayout>
    </DashboardShell>
  );
}

const STATUS_FILTERS: StatusFilter[] = ['all', 'armed', 'triggered', 'paused'];
const TYPE_FILTERS: TypeFilter[] = ['all', 'price-above', 'price-below'];

function formatFilterLabel(value: string) {
  if (value === 'all') {
    return 'All';
  }

  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

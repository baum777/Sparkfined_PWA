import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import AlertsLayout from '@/components/alerts/AlertsLayout';
import AlertsList from '@/components/alerts/AlertsList';
import AlertsDetailPanel from '@/components/alerts/AlertsDetailPanel';
import { AlertsHeaderActions } from '@/components/alerts/AlertsHeaderActions';
import AlertCreateDialog from '@/components/alerts/AlertCreateDialog';
import { useAlertsStore } from '@/store/alertsStore';
import type { AlertType } from '@/store/alertsStore';
import { useSearchParams } from 'react-router-dom';

type StatusFilter = 'all' | 'armed' | 'triggered' | 'paused';
type TypeFilter = 'all' | AlertType;

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'armed', label: 'Armed' },
  { value: 'triggered', label: 'Triggered' },
  { value: 'paused', label: 'Paused' },
];

const TYPE_TABS: Array<{ value: TypeFilter; label: string }> = [
  { value: 'all', label: 'All types' },
  { value: 'price-above', label: '↑ Above' },
  { value: 'price-below', label: '↓ Below' },
];

export default function AlertsPage() {
  const alerts = useAlertsStore((state) => state.alerts);
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = React.useState<TypeFilter>('all');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  
  const alertFromUrl = searchParams.get('alert');
  const [activeAlertId, setActiveAlertId] = React.useState<string | undefined>(undefined);

  // Sync active alert with URL + store data (handles async store hydration).
  React.useEffect(() => {
    if (alertFromUrl && alerts.some((alert) => alert.id === alertFromUrl)) {
      setActiveAlertId((current) => (current === alertFromUrl ? current : alertFromUrl));
      return;
    }

    setActiveAlertId((current) => {
      if (!current) return current;
      return alerts.some((alert) => alert.id === current) ? current : undefined;
    });
  }, [alertFromUrl, alerts]);

  const handleAlertDeleted = React.useCallback(
    (deletedId: string) => {
      setActiveAlertId((current) => (current === deletedId ? undefined : current));
    },
    [setActiveAlertId],
  );

  // Count alerts by status
  const statusCounts = React.useMemo(() => {
    return alerts.reduce(
      (acc, alert) => {
        acc[alert.status] = (acc[alert.status] || 0) + 1;
        return acc;
      },
      { armed: 0, triggered: 0, paused: 0 } as Record<string, number>,
    );
  }, [alerts]);

  const filteredAlerts = React.useMemo(() => {
    return alerts.filter((alert) => {
      const statusMatches = statusFilter === 'all' || alert.status === statusFilter;
      const typeMatches = typeFilter === 'all' || alert.type === typeFilter;
      return statusMatches && typeMatches;
    });
  }, [alerts, statusFilter, typeFilter]);

  const activeAlert = React.useMemo(() => {
    return alerts.find((alert) => alert.id === activeAlertId);
  }, [alerts, activeAlertId]);

  // Sync URL with active alert
  React.useEffect(() => {
    const current = searchParams.get('alert');
    if (activeAlertId && current !== activeAlertId) {
      const next = new URLSearchParams(searchParams);
      next.set('alert', activeAlertId);
      setSearchParams(next, { replace: true });
      return;
    }
    if (!activeAlertId && current) {
      // If the URL points to a real alert, keep it long enough for the state-sync effect to pick it up.
      const isValid = alerts.some((alert) => alert.id === current);
      if (isValid) return;
      const next = new URLSearchParams(searchParams);
      next.delete('alert');
      setSearchParams(next, { replace: true });
    }
  }, [activeAlertId, alerts, searchParams, setSearchParams]);

  return (
    <DashboardShell
      title="Alerts"
      description={`${alerts.length} alerts tracked · Monitor price levels and market conditions`}
      actions={<AlertsHeaderActions alerts={alerts} />}
    >
      <AlertsLayout>
        <div
          className="flex flex-col gap-6 text-text-primary lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]"
          data-testid="alerts-page"
        >
          {/* Left column - List */}
          <div className="flex flex-col gap-4">
            {/* Tab filters */}
            <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-surface-subtle/50 p-1" role="tablist">
              {STATUS_TABS.map((tab) => {
                const isActive = statusFilter === tab.value;
                const count = tab.value === 'all' ? alerts.length : statusCounts[tab.value] || 0;
                
                return (
                  <button
                    key={tab.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      isActive
                        ? 'bg-surface text-text-primary shadow-sm'
                        : 'text-text-secondary hover:bg-surface-hover/50 hover:text-text-primary'
                    }`}
                    data-testid={`alerts-status-filter-${tab.value}`}
                  >
                    {tab.label}
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                      isActive ? 'bg-brand/10 text-brand' : 'bg-surface-subtle text-text-tertiary'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Type filters */}
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Alert type filters">
              {TYPE_TABS.map((tab) => {
                const isActive = typeFilter === tab.value;
                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setTypeFilter(tab.value)}
                    className={`rounded-full border px-3 py-1 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                      isActive
                        ? 'border-brand/40 bg-brand/10 text-brand'
                        : 'border-border text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                    }`}
                    data-testid={`alerts-type-filter-${tab.value}`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Alert list */}
            <AlertsList
              alerts={filteredAlerts}
              activeAlertId={activeAlertId}
              onSelectAlert={setActiveAlertId}
              onCreateAlert={() => setIsCreateOpen(true)}
            />
          </div>

          {/* Right column - Detail panel */}
          <AlertsDetailPanel alert={activeAlert} onAlertDeleted={handleAlertDeleted} />
        </div>
      </AlertsLayout>

      {/* Create dialog controlled externally */}
      <AlertCreateDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        triggerButton={false}
      />
    </DashboardShell>
  );
}

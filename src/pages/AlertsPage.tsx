import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import AlertsLayout from '@/components/alerts/AlertsLayout';
import AlertsList from '@/components/alerts/AlertsList';
import AlertsDetailPanel from '@/components/alerts/AlertsDetailPanel';
import { AlertsHeaderActions } from '@/components/alerts/AlertsHeaderActions';
import AlertCreateDialog from '@/components/alerts/AlertCreateDialog';
import { useAlertsStore } from '@/store/alertsStore';
import { useSearchParams } from 'react-router-dom';

type StatusFilter = 'all' | 'armed' | 'triggered' | 'paused';

const STATUS_TABS: Array<{ value: StatusFilter; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'armed', label: 'Armed' },
  { value: 'triggered', label: 'Triggered' },
  { value: 'paused', label: 'Paused' },
];

export default function AlertsPage() {
  const alerts = useAlertsStore((state) => state.alerts);
  const [searchParams, setSearchParams] = useSearchParams();
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  
  const alertFromUrl = searchParams.get('alert');
  const isValidAlertId = alerts.some((alert) => alert.id === alertFromUrl);
  const [activeAlertId, setActiveAlertId] = React.useState<string | undefined>(
    isValidAlertId ? (alertFromUrl as string) : undefined,
  );

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
      return statusFilter === 'all' || alert.status === statusFilter;
    });
  }, [alerts, statusFilter]);

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
      const next = new URLSearchParams(searchParams);
      next.delete('alert');
      setSearchParams(next, { replace: true });
    }
  }, [activeAlertId, searchParams, setSearchParams]);

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

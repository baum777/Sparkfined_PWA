import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import AlertsLayout from '@/components/alerts/AlertsLayout';
import AlertsList from '@/components/alerts/AlertsList';
import AlertsDetailPanel from '@/components/alerts/AlertsDetailPanel';
import AlertRuleBuilder from '@/components/alerts/AlertRuleBuilder';
import AlertBacktestPanel from '@/components/alerts/AlertBacktestPanel';
import { AlertsHeaderActions } from '@/components/alerts/AlertsHeaderActions';
import { useAlertsStore } from '@/store/alertsStore';
import { useAlertHistoryStore } from '@/store/alertHistoryStore';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';

type StatusFilter = 'all' | 'armed' | 'triggered' | 'snoozed';
type TypeFilter = 'all' | 'price' | 'volume' | 'volatility' | 'trend';

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

  const triggers = useAlertHistoryStore((state) => state.triggers);

  return (
    <DashboardShell
      title="Alerts"
      description={headerDescription}
      actions={<AlertsHeaderActions alerts={alerts} />}
    >
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Alerts</TabsTrigger>
          <TabsTrigger value="builder">Rule Builder</TabsTrigger>
          <TabsTrigger value="backtest">Backtest</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* ========== TAB: ACTIVE ALERTS ========== */}
        <TabsContent value="active">
          <AlertsLayout>
            <div className="flex flex-col gap-4 text-text-primary lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6">
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
        </TabsContent>

        {/* ========== TAB: RULE BUILDER ========== */}
        <TabsContent value="builder">
          <AlertRuleBuilder
            onSave={(rule) => {
              // TODO Codex: Save rule to alertsStore
              console.log('[AlertsPageV2] Rule saved:', rule);
            }}
            onCancel={() => {
              // TODO Codex: Switch back to active tab or close builder
              console.log('[AlertsPageV2] Rule builder cancelled');
            }}
          />
        </TabsContent>

        {/* ========== TAB: BACKTEST ========== */}
        <TabsContent value="backtest">
          {activeAlert ? (
            <AlertBacktestPanel rule={activeAlert as any} />
          ) : (
            <Card className="flex h-64 items-center justify-center p-4">
              <p className="text-sm text-text-secondary">
                Select an alert from the "Active Alerts" tab to run a backtest
              </p>
            </Card>
          )}
        </TabsContent>

        {/* ========== TAB: HISTORY ========== */}
        <TabsContent value="history">
          <Card className="p-4">
            <h3 className="mb-3 text-lg font-semibold text-text-primary">Alert Trigger History</h3>
            {triggers.length === 0 ? (
              <div className="flex h-48 items-center justify-center">
                <p className="text-sm text-text-secondary">No alert triggers yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* TODO Codex: Render trigger history list with timestamp, price, outcome, journal link */}
                <p className="text-xs text-text-secondary">
                  TODO Codex: Implement AlertTriggerHistoryList component
                </p>
                <p className="text-xs text-text-tertiary">
                  Total triggers: {triggers.length}
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}

const STATUS_FILTERS: StatusFilter[] = ['all', 'armed', 'triggered', 'snoozed'];
const TYPE_FILTERS: TypeFilter[] = ['all', 'price', 'volume', 'volatility', 'trend'];

function formatFilterLabel(value: string) {
  if (value === 'all') {
    return 'All';
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
}

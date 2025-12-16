import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Alert } from '@/store/alertsStore';
import { useAlertsStore } from '@/store/alertsStore';

const MAX_ITEMS_PER_CATEGORY = 3;

export default function AlertsSnapshot() {
  const alerts = useAlertsStore((state) => state.alerts);
  const navigate = useNavigate();

  const { armedAlerts, triggeredAlerts, armedCount, triggeredCount } = React.useMemo(() => {
    const armed: Alert[] = [];
    const triggered: Alert[] = [];
    
    for (const alert of alerts) {
      if (alert.status === 'armed' && armed.length < MAX_ITEMS_PER_CATEGORY) {
        armed.push(alert);
      }
      if (alert.status === 'triggered' && triggered.length < MAX_ITEMS_PER_CATEGORY) {
        triggered.push(alert);
      }
    }
    
    return {
      armedAlerts: armed,
      triggeredAlerts: triggered,
      armedCount: alerts.filter((a) => a.status === 'armed').length,
      triggeredCount: alerts.filter((a) => a.status === 'triggered').length,
    };
  }, [alerts]);

  const hasAlerts = alerts.length > 0;

  const handleViewAll = React.useCallback(() => {
    navigate('/alerts');
  }, [navigate]);

  const handleCreateAlert = React.useCallback(() => {
    navigate('/alerts');
  }, [navigate]);

  const handleAlertClick = React.useCallback(
    (alertId: string) => {
      navigate(`/alerts?alert=${alertId}`);
    },
    [navigate],
  );

  return (
    <Card
      data-testid="dashboard-alerts-snapshot"
      variant="muted"
      className="bg-surface-subtle"
    >
      <CardHeader className="mb-2">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-text-tertiary">Signals</p>
            <CardTitle className="text-base">Alerts snapshot</CardTitle>
          </div>
          {hasAlerts && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <span data-testid="dashboard-alerts-armed-count">{armedCount}</span>
                <span>armed</span>
              </span>
              <span className="text-text-tertiary">/</span>
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <span data-testid="dashboard-alerts-triggered-count">{triggeredCount}</span>
                <span>triggered</span>
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      {hasAlerts ? (
        <CardContent className="gap-4">
          {/* Triggered Alerts Section */}
          {triggeredAlerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-300">
                Triggered
              </p>
              <div className="space-y-2">
                {triggeredAlerts.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    onClick={() => handleAlertClick(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Armed Alerts Section */}
          {armedAlerts.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-300">
                Armed
              </p>
              <div className="space-y-2">
                {armedAlerts.map((alert) => (
                  <AlertRow
                    key={alert.id}
                    alert={alert}
                    onClick={() => handleAlertClick(alert.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Summary when there are more alerts */}
          {(armedCount > MAX_ITEMS_PER_CATEGORY || triggeredCount > MAX_ITEMS_PER_CATEGORY) && (
            <p className="text-xs text-text-tertiary">
              Showing top {MAX_ITEMS_PER_CATEGORY} per category. View all for complete list.
            </p>
          )}
        </CardContent>
      ) : (
        <CardContent>
          <EmptyState
            illustration="alerts"
            title="No alerts configured"
            description="Create price alerts to monitor key levels and stay ahead of market moves."
            action={{
              label: 'Create alert',
              onClick: handleCreateAlert,
            }}
            compact
            data-testid="dashboard-alerts-empty-state"
          />
        </CardContent>
      )}

      <CardFooter className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          data-testid="dashboard-alerts-view-all"
        >
          View all
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleCreateAlert}
          data-testid="dashboard-alerts-new"
        >
          New alert
        </Button>
      </CardFooter>
    </Card>
  );
}

interface AlertRowProps {
  alert: Alert;
  onClick: () => void;
}

function AlertRow({ alert, onClick }: AlertRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-xl border border-border/70 bg-surface/60 px-3 py-2 text-left transition hover:border-border-focus hover:bg-surface-hover/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
      data-testid="dashboard-alert-row"
      data-alert-id={alert.id}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-text-primary">{alert.symbol}</p>
          <p className="truncate text-xs text-text-secondary">{alert.condition}</p>
        </div>
        <Badge variant={alert.status === 'triggered' ? 'triggered' : 'armed'} className="flex-shrink-0">
          {alert.timeframe}
        </Badge>
      </div>
    </button>
  );
}

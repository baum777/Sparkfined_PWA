import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StateView from '@/components/ui/StateView';
import { useAlertsStore } from '@/store/alertsStore';

export default function AlertsSnapshot() {
  const alerts = useAlertsStore((state) => state.alerts);
  const navigate = useNavigate();

  const { armedCount, triggeredCount } = React.useMemo(() => {
    return alerts.reduce(
      (acc, alert) => {
        if (alert.status === 'armed') {
          acc.armedCount += 1;
        }
        if (alert.status === 'triggered') {
          acc.triggeredCount += 1;
        }
        return acc;
      },
      { armedCount: 0, triggeredCount: 0 },
    );
  }, [alerts]);

  const totalAlerts = alerts.length;
  const hasAlerts = totalAlerts > 0;

  const handleViewAll = React.useCallback(() => {
    navigate('/alerts-v2');
  }, [navigate]);

  const handleCreateAlert = React.useCallback(() => {
    navigate('/alerts-v2');
  }, [navigate]);

  return (
    <Card
      data-testid="dashboard-alerts-snapshot"
      variant="muted"
      className="bg-surface-subtle"
    >
      <CardHeader className="mb-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-text-tertiary">Signals</p>
        <CardTitle className="text-base">Alerts snapshot</CardTitle>
      </CardHeader>

      {hasAlerts ? (
        <CardContent className="gap-5">
          <div className="grid grid-cols-2 gap-4">
            <StatBlock
              label="Armed"
              value={armedCount}
              testId="dashboard-alerts-armed-count"
              badgeClass="border border-emerald-500/30 bg-emerald-500/5"
            />
            <StatBlock
              label="Triggered"
              value={triggeredCount}
              testId="dashboard-alerts-triggered-count"
              badgeClass="border border-rose-500/30 bg-rose-500/5"
            />
          </div>
        </CardContent>
      ) : (
        <StateView
          type="empty"
          title="No alerts configured"
          description="Create an alert to monitor key price levels."
          actionLabel="Create alert"
          onAction={handleCreateAlert}
          compact
          className="w-full rounded-2xl border border-dashed border-border-moderate bg-surface p-4"
          data-testid="dashboard-alerts-empty-state"
        />
      )}

      <CardFooter className="mt-6 flex flex-wrap items-center justify-between gap-3">
        {hasAlerts ? (
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            Total alerts: <span className="text-text-primary">{totalAlerts}</span>
          </p>
        ) : (
          <p className="text-xs text-text-tertiary">Stay ahead of volatility.</p>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAll}
          data-testid="dashboard-alerts-view-all"
        >
          View all
        </Button>
      </CardFooter>
    </Card>
  );
}

interface StatBlockProps {
  label: string;
  value: number;
  testId: string;
  badgeClass: string;
}

function StatBlock({ label, value, testId, badgeClass }: StatBlockProps) {
  return (
    <div className="rounded-2xl border border-border-moderate bg-surface p-4 shadow-inner">
      <p className="text-xs uppercase tracking-wide text-text-tertiary">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-text-primary" data-testid={testId}>
          {value}
        </span>
        <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${badgeClass}`}>
          {value > 0 ? 'Active' : 'Idle'}
        </span>
      </div>
    </div>
  );
}

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
        <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-text-tertiary">⚡ Signals</p>
        <CardTitle className="text-lg font-bold">Alert Status</CardTitle>
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

      <CardFooter className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
        {hasAlerts ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
            Total: <span className="text-text-primary font-bold">{totalAlerts}</span>
          </p>
        ) : (
          <p className="text-xs text-text-tertiary">Never miss a level 🎯</p>
        )}

        <Button
          variant="ghost"
          size="sm"
          className="text-accent hover:text-accent/80 hover:bg-accent/5"
          onClick={handleViewAll}
          data-testid="dashboard-alerts-view-all"
        >
          Manage Alerts →
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
  const isArmed = label === 'Armed';
  const isTriggered = label === 'Triggered';
  const isActive = value > 0;
  
  return (
    <div className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br from-surface to-surface-elevated p-4 shadow-sm transition-all ${
      isActive 
        ? isArmed 
          ? 'border-accent/30 shadow-glow-cyan hover:shadow-glow-cyan-hover' 
          : 'border-warn/30 shadow-glow-gold hover:shadow-glow-gold-hover'
        : 'border-border-subtle hover:border-border-moderate'
    }`}>
      {/* Animated overlay for active alerts */}
      {isActive && (
        <div className={`pointer-events-none absolute inset-0 opacity-10 ${
          isArmed ? 'bg-gradient-to-br from-accent to-transparent' : 'bg-gradient-to-br from-warn to-transparent'
        } ${isTriggered ? 'animate-pulse' : ''}`} />
      )}
      
      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">{label}</span>
          {isActive && (
            <div className={`status-indicator ${isArmed ? 'armed' : 'triggered'}`} />
          )}
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-mono text-3xl font-bold text-text-primary" data-testid={testId}>
            {value}
          </span>
          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
            isActive
              ? isArmed
                ? 'border-accent/40 bg-accent/10 text-accent shadow-glow-cyan'
                : 'border-warn/40 bg-warn/10 text-warn shadow-glow-gold'
              : 'border-border-subtle bg-surface-skeleton text-text-tertiary'
          }`}>
            {isActive ? '⚡ Live' : 'Idle'}
          </span>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import type { Alert, AlertStatus, AlertType } from '@/store/alertsStore';
import { ListRow } from '@/components/ui/ListRow';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface AlertsListProps {
  alerts: ReadonlyArray<Alert>;
  activeAlertId?: string;
  onSelectAlert?: (id: string) => void;
  onCreateAlert?: () => void;
}

const STATUS_BADGE_VARIANT: Record<AlertStatus, 'armed' | 'triggered' | 'paused'> = {
  armed: 'armed',
  triggered: 'triggered',
  paused: 'paused',
};

const TYPE_LABELS: Record<AlertType, string> = {
  'price-above': '↑ Above',
  'price-below': '↓ Below',
};

export default function AlertsList({ alerts, activeAlertId, onSelectAlert, onCreateAlert }: AlertsListProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        illustration="alerts"
        title="No alerts match your filters"
        description="Create a price alert to monitor key levels and stay ahead of market moves."
        action={onCreateAlert ? { label: 'Create alert', onClick: onCreateAlert } : undefined}
        compact
        data-testid="alerts-empty-state"
      />
    );
  }

  return (
    <div className="space-y-2" data-testid="alerts-list">
      {alerts.map((alert) => {
        const isActive = activeAlertId === alert.id;
        const badgeVariant = STATUS_BADGE_VARIANT[alert.status];
        const typeLabel = TYPE_LABELS[alert.type];

        return (
          <ListRow
            key={alert.id}
            title={
              <span className="flex items-center gap-2">
                <span className="font-semibold">{alert.symbol}</span>
                <Badge variant="outline" className="text-[10px]">
                  {alert.timeframe}
                </Badge>
              </span>
            }
            subtitle={alert.condition}
            meta={
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px]">
                  {typeLabel}
                </Badge>
                <Badge variant={badgeVariant} className="text-[10px]">
                  {formatLabel(alert.status)}
                </Badge>
              </div>
            }
            onPress={() => onSelectAlert?.(alert.id)}
            className={isActive ? 'border-brand/60 bg-brand/5 ring-1 ring-brand/30' : ''}
            data-testid="alerts-list-item"
            data-alert-id={alert.id}
            data-alert-status={alert.status}
            data-alert-type={alert.type}
          />
        );
      })}
    </div>
  );
}

function formatLabel(value: string) {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

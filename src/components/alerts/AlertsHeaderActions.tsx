import React from 'react';
import type { Alert } from '@/store/alertsStore';

interface AlertsHeaderActionsProps {
  alerts: Alert[];
}

export function AlertsHeaderActions({ alerts }: AlertsHeaderActionsProps) {
  const triggeredCount = alerts.filter((alert) => alert.status === 'triggered').length;

  return (
    <div className="flex flex-col items-end gap-2 text-right text-sm text-text-secondary sm:flex-row sm:items-center sm:gap-3">
      <div className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-text-primary">
        {alerts.length} alerts
      </div>
      <div className="rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
        {triggeredCount} triggered
      </div>
    </div>
  );
}

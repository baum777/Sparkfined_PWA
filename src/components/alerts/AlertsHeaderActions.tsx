import React from 'react';
import type { Alert } from '@/store/alertsStore';
import AlertCreateDialog from '@/components/alerts/AlertCreateDialog';

interface AlertsHeaderActionsProps {
  alerts: Alert[];
}

export function AlertsHeaderActions({ alerts }: AlertsHeaderActionsProps) {
  const triggeredCount = alerts.filter((alert) => alert.status === 'triggered').length;

  return (
    <div className="flex flex-col gap-3 text-sm text-text-secondary sm:flex-row sm:items-center sm:justify-end sm:gap-4">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-text-secondary">
        <span className="rounded-full border border-border px-3 py-1 text-text-primary">{alerts.length} alerts</span>
        <span className="rounded-full border border-border px-3 py-1">{triggeredCount} triggered</span>
      </div>
      <AlertCreateDialog />
    </div>
  );
}

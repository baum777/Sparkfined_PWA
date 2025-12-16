import React from 'react';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { RightSheet, RightSheetSection, RightSheetFooter } from '@/components/ui/RightSheet';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { useAlertsStore } from '@/store/alertsStore';
import type { Alert, AlertStatus, AlertType } from '@/store/alertsStore';

interface AlertsDetailPanelProps {
  alert?: Alert;
  onAlertDeleted?: (id: string) => void;
}

const STATUS_BADGE_VARIANT: Record<AlertStatus, 'armed' | 'triggered' | 'paused'> = {
  armed: 'armed',
  triggered: 'triggered',
  paused: 'paused',
};

const ALERT_TYPE_OPTIONS = [
  { value: 'price-above', label: 'Price above threshold' },
  { value: 'price-below', label: 'Price below threshold' },
] as const;

const TIMEFRAME_OPTIONS = ['1m', '5m', '15m', '1h', '4h', '1d'] as const;

export default function AlertsDetailPanel({ alert, onAlertDeleted }: AlertsDetailPanelProps) {
  const deleteAlert = useAlertsStore((state) => state.deleteAlert);
  const updateAlert = useAlertsStore((state) => state.updateAlert);
  
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  
  // Edit form state
  const [formState, setFormState] = React.useState(() => ({
    symbol: alert?.symbol ?? '',
    type: alert?.type ?? 'price-above' as AlertType,
    condition: alert?.condition ?? '',
    threshold: alert?.threshold?.toString() ?? '',
    timeframe: alert?.timeframe ?? '1h',
  }));

  // Reset form when alert changes
  React.useEffect(() => {
    if (alert) {
      setFormState({
        symbol: alert.symbol,
        type: alert.type,
        condition: alert.condition,
        threshold: alert.threshold.toString(),
        timeframe: alert.timeframe,
      });
    }
  }, [alert]);

  if (!alert) {
    return (
      <div
        className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border-moderate bg-surface-subtle/30 px-6 py-8 text-center"
        data-testid="alerts-detail-empty"
      >
        <p className="text-sm text-text-secondary">
          Select an alert to view details and manage it
        </p>
      </div>
    );
  }

  const handleDelete = () => {
    if (!alert) return;
    setIsDeleting(true);
    try {
      deleteAlert(alert.id);
      onAlertDeleted?.(alert.id);
      setIsDeleteOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = () => {
    if (!alert) return;
    const parsedThreshold = Number(formState.threshold);
    if (Number.isNaN(parsedThreshold)) return;
    
    setIsSaving(true);
    try {
      updateAlert(alert.id, {
        symbol: formState.symbol.trim().toUpperCase(),
        type: formState.type,
        condition: formState.condition.trim(),
        threshold: parsedThreshold,
        timeframe: formState.timeframe,
      });
      setIsEditOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const badgeVariant = STATUS_BADGE_VARIANT[alert.status];

  return (
    <>
      <section
        className="space-y-5 rounded-2xl border border-border/70 bg-surface/80 p-5"
        data-testid="alerts-detail-panel"
      >
        {/* Header */}
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-text-primary">{alert.symbol}</span>
                <Badge variant="outline" className="text-[10px]">{alert.timeframe}</Badge>
              </div>
              <p className="text-sm text-text-secondary" data-testid="alerts-detail-condition">
                {alert.condition}
              </p>
            </div>
            <Badge variant={badgeVariant} live={alert.status === 'armed'}>
              {formatLabel(alert.status)}
            </Badge>
          </div>
          {alert.summary && (
            <p className="text-xs text-text-tertiary">{alert.summary}</p>
          )}
        </header>

        {/* Context */}
        {(alert.sentimentLabel || alert.trendingScore || alert.hypeLevel || alert.callToAction) && (
          <div className="space-y-2">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">
              Context
            </h3>
            <div className="rounded-xl border border-border/50 bg-surface-subtle/50 p-3 text-xs text-text-secondary">
              {alert.sentimentLabel && <p>Sentiment: <span className="text-text-primary">{alert.sentimentLabel}</span></p>}
              {typeof alert.trendingScore === 'number' && <p>Trend score: <span className="text-text-primary">{alert.trendingScore.toFixed(2)}</span></p>}
              {alert.hypeLevel && <p>Hype: <span className="text-text-primary">{alert.hypeLevel}</span></p>}
              {alert.callToAction && alert.callToAction !== 'unknown' && <p>Action: <span className="text-text-primary">{alert.callToAction}</span></p>}
            </div>
          </div>
        )}

        {/* Source link */}
        {alert.sourceUrl && (
          <a
            href={alert.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:underline"
          >
            View source tweet
            <span aria-hidden="true">↗</span>
          </a>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsEditOpen(true)}
            data-testid="alerts-edit-alert-button"
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            data-testid="alert-delete-button"
          >
            Delete
          </Button>
        </div>
      </section>

      {/* Edit RightSheet */}
      <RightSheet
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit alert"
        subtitle="Update the alert parameters"
        width="md"
        footer={
          <RightSheetFooter>
            <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave} loading={isSaving}>
              Save changes
            </Button>
          </RightSheetFooter>
        }
      >
        <div className="space-y-4">
          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Symbol</span>
              <Input
                value={formState.symbol}
                onChange={(e) => setFormState((prev) => ({ ...prev, symbol: e.target.value }))}
                placeholder="BTCUSDT"
                data-testid="alert-edit-symbol-input"
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Type</span>
              <Select
                options={ALERT_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                value={formState.type}
                onChange={(value) => setFormState((prev) => ({ ...prev, type: value as AlertType }))}
                triggerProps={{ 'data-testid': 'alert-edit-type-select' }}
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Condition</span>
              <Input
                value={formState.condition}
                onChange={(e) => setFormState((prev) => ({ ...prev, condition: e.target.value }))}
                placeholder="Alert when price closes above threshold"
                data-testid="alert-edit-condition-input"
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Threshold</span>
              <Input
                type="number"
                step="any"
                value={formState.threshold}
                onChange={(e) => setFormState((prev) => ({ ...prev, threshold: e.target.value }))}
                placeholder="42500"
                data-testid="alert-edit-threshold-input"
              />
            </label>
          </RightSheetSection>

          <RightSheetSection>
            <label className="block space-y-2">
              <span className="text-sm font-medium text-text-primary">Timeframe</span>
              <Select
                options={TIMEFRAME_OPTIONS.map((value) => ({ value, label: value.toUpperCase() }))}
                value={formState.timeframe}
                onChange={(value) => setFormState((prev) => ({ ...prev, timeframe: value }))}
                triggerProps={{ 'data-testid': 'alert-edit-timeframe-select' }}
              />
            </label>
          </RightSheetSection>
        </div>
      </RightSheet>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete alert?"
        subtitle="This action cannot be undone."
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Are you sure you want to delete the alert for <strong className="text-text-primary">{alert.symbol}</strong>?
          </p>
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => setIsDeleteOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              loading={isDeleting}
              data-testid="alert-confirm-delete"
            >
              Delete alert
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function formatLabel(value: string) {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

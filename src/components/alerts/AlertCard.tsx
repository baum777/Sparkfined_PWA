/**
 * AlertCard - Standardized Alert Card Component
 *
 * Atomic card structure for displaying alerts consistently across the app.
 *
 * Structure:
 * - Header: Symbol · Timeframe (left), Status Badge + Type Badge (right), Kebab Menu
 * - Body: Condition (primary), Summary (secondary)
 * - Footer: Meta info (Last triggered, Created), Notification channels
 *
 * Usage:
 * ```tsx
 * <AlertCard
 *   alert={alert}
 *   isActive={selectedId === alert.id}
 *   onClick={() => handleSelect(alert.id)}
 *   onEdit={() => handleEdit(alert.id)}
 *   onDelete={() => handleDelete(alert.id)}
 * />
 * ```
 */

import React from 'react';
import { MoreVertical, Bell, Mail, Webhook } from '@/lib/icons';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/ui/cn';
import type { Alert, AlertStatus, AlertType } from '@/store/alertsStore';

export interface AlertCardProps {
  alert: Alert;
  isActive?: boolean;
  onClick?: () => void;
  onEdit?: () => void;
  onPause?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  showActions?: boolean;
}

const STATUS_VARIANTS: Record<AlertStatus, 'success' | 'warning' | 'default'> = {
  armed: 'success',
  triggered: 'warning',
  paused: 'default',
};

const TYPE_LABELS: Record<AlertType, string> = {
  'price-above': 'Price Above',
  'price-below': 'Price Below',
};

export function AlertCard({
  alert,
  isActive = false,
  onClick,
  onEdit,
  onPause,
  onDelete,
  onDuplicate,
  showActions = true,
}: AlertCardProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const statusVariant = STATUS_VARIANTS[alert.status];
  const typeLabel = TYPE_LABELS[alert.type];

  const handleMenuToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

  const handleAction = (action: () => void) => {
    return (event: React.MouseEvent) => {
      event.stopPropagation();
      setIsMenuOpen(false);
      action();
    };
  };

  return (
    <article
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border px-4 py-3 text-sm transition sm:px-5 sm:py-4',
        isActive
          ? 'border-glow-success bg-brand/5'
          : 'border-border bg-surface cursor-pointer hover:bg-interactive-hover hover-lift',
        alert.status === 'triggered' && 'border-l-4 border-l-status-triggered-text'
      )}
      data-testid="alert-card"
      data-alert-id={alert.id}
      data-alert-status={alert.status}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          {/* Symbol · Timeframe */}
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            {alert.symbol} &middot; {alert.timeframe}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Badge */}
          <Badge variant={statusVariant}>
            {formatLabel(alert.status)}
          </Badge>

          {/* Kebab Menu */}
          {showActions && (
            <div className="relative">
              <button
                type="button"
                onClick={handleMenuToggle}
                className="rounded-full p-1 text-text-secondary transition hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                aria-label="Alert actions"
                data-testid="alert-card-menu-button"
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-dropdown"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  {/* Menu */}
                  <div
                    className="absolute right-0 top-8 z-dropdown w-40 rounded-lg border border-border bg-surface-elevated py-1 shadow-2xl"
                    data-testid="alert-card-menu"
                  >
                    {onEdit && (
                      <button
                        type="button"
                        onClick={handleAction(onEdit)}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary transition hover:bg-interactive-hover"
                      >
                        Edit
                      </button>
                    )}
                    {onDuplicate && (
                      <button
                        type="button"
                        onClick={handleAction(onDuplicate)}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary transition hover:bg-interactive-hover"
                      >
                        Duplicate
                      </button>
                    )}
                    {onPause && (
                      <button
                        type="button"
                        onClick={handleAction(onPause)}
                        className="w-full px-4 py-2 text-left text-sm text-text-primary transition hover:bg-interactive-hover"
                      >
                        {alert.status === 'paused' ? 'Resume' : 'Pause'}
                      </button>
                    )}
                    {onDelete && (
                      <>
                        <div className="my-1 border-t border-border" />
                        <button
                          type="button"
                          onClick={handleAction(onDelete)}
                          className="w-full px-4 py-2 text-left text-sm text-danger transition hover:bg-sentiment-bear-bg"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="mt-2">
        <p className="text-base font-medium text-text-primary">{alert.condition}</p>
        {alert.summary && (
          <p className="mt-1 text-xs text-text-secondary">{alert.summary}</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Type Badge + Origin */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="uppercase">
            {typeLabel}
          </Badge>
          {alert.origin === 'grok-trend' && (
            <Badge variant="brand">Grok Trend</Badge>
          )}
        </div>

        {/* Notification Channels (Icon Stack) */}
        <div className="flex items-center gap-1.5 text-text-tertiary">
          <Bell size={14} />
          <Mail size={14} className="opacity-30" />
          <Webhook size={14} className="opacity-30" />
        </div>
      </div>

      {/* Meta Info */}
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
        {alert.status === 'triggered' && (
          <span>Last triggered 2h ago</span>
        )}
        <span>&middot;</span>
        <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
      </div>
    </article>
  );
}

function formatLabel(value: string): string {
  return value
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export default AlertCard;

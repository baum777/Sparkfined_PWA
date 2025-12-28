import React from "react";
import type { AlertListItem } from "@/api/alerts";
import { MoreVertical } from "@/lib/icons";

const TYPE_LABELS: Record<AlertListItem["type"], string> = {
  "price-above": "Price above",
  "price-below": "Price below",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const formatStatus = (status: AlertListItem["status"]) => status.replace(/-/g, " ");

type MobileAlertRowProps = {
  alert: AlertListItem;
  onToggleStatus: (alert: AlertListItem) => void;
  onDelete: (alert: AlertListItem) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
};

export default function MobileAlertRow({
  alert,
  onToggleStatus,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: MobileAlertRowProps) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isPaused = alert.status === "paused";
  const toggleLabel = isPaused ? "Resume" : "Pause";
  const isBusy = isToggling || isDeleting;

  const handleToggleStatus = React.useCallback(() => {
    setIsMenuOpen(false);
    onToggleStatus(alert);
  }, [alert, onToggleStatus]);

  const handleDelete = React.useCallback(() => {
    setIsMenuOpen(false);
    onDelete(alert);
  }, [alert, onDelete]);

  return (
    <article
      className="sf-alert-row"
      tabIndex={0}
      data-testid={`mobile-alert-row-${alert.id}`}
      aria-busy={isBusy}
    >
      <div className="sf-alert-row__main">
        <div className="sf-alert-row__header">
          <div className="sf-alert-row__symbol-block">
            <span className="sf-alert-row__symbol">{alert.symbol}</span>
            <span className="sf-alert-row__type">{TYPE_LABELS[alert.type]}</span>
          </div>
          <span
            className={`sf-alert-row__status sf-alert-row__status--${alert.status}`}
            aria-label={`Status: ${formatStatus(alert.status)}`}
          >
            {formatStatus(alert.status)}
          </span>
        </div>
        <p className="sf-alert-row__condition">{alert.condition}</p>
        <div className="sf-alert-row__meta">
          <span>Threshold {numberFormatter.format(alert.threshold)}</span>
          <span>Timeframe {alert.timeframe}</span>
        </div>
      </div>

      <div className="sf-alert-row__actions">
        <button
          type="button"
          className="sf-alert-row__menu-button sf-focus-ring"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-haspopup="menu"
          aria-expanded={isMenuOpen}
          aria-label={`Alert actions for ${alert.symbol}`}
          data-testid={`mobile-alert-row-menu-${alert.id}`}
          disabled={isBusy}
        >
          <MoreVertical size={18} />
        </button>

        {isMenuOpen ? (
          <>
            <div
              className="sf-alert-row__menu-backdrop"
              onClick={() => setIsMenuOpen(false)}
              role="presentation"
            />
            <div className="sf-alert-row__menu" role="menu">
              <button
                type="button"
                className="sf-alert-row__menu-item"
                onClick={handleToggleStatus}
                role="menuitem"
                disabled={isBusy}
              >
                {toggleLabel}
              </button>
              <button
                type="button"
                className="sf-alert-row__menu-item sf-alert-row__menu-item--danger"
                onClick={handleDelete}
                role="menuitem"
                disabled={isBusy}
              >
                Delete
              </button>
            </div>
          </>
        ) : null}
      </div>
    </article>
  );
}

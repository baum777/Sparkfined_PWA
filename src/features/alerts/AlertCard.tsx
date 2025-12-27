import React from "react";
import type { AlertListItem } from "@/api/alerts";

const TYPE_LABELS: Record<AlertListItem["type"], string> = {
  "price-above": "Price above",
  "price-below": "Price below",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const formatStatus = (status: AlertListItem["status"]) => status.replace(/-/g, " ");

type AlertCardProps = {
  alert: AlertListItem;
  onToggleStatus: (alert: AlertListItem) => void;
  onDelete: (alert: AlertListItem) => void;
  isToggling?: boolean;
  isDeleting?: boolean;
};

export default function AlertCard({
  alert,
  onToggleStatus,
  onDelete,
  isToggling = false,
  isDeleting = false,
}: AlertCardProps) {
  const isPaused = alert.status === "paused";
  const toggleLabel = isPaused ? "Resume" : "Pause";
  const isBusy = isToggling || isDeleting;

  return (
    <article
      className="sf-alert-card"
      tabIndex={0}
      data-testid={`alert-card-${alert.id}`}
      aria-busy={isBusy}
    >
      <div className="sf-alert-card__header">
        <span className="sf-alert-card__symbol">{alert.symbol}</span>
        <span
          className={`sf-alert-card__status sf-alert-card__status--${alert.status}`}
          aria-label={`Status: ${formatStatus(alert.status)}`}
        >
          {formatStatus(alert.status)}
        </span>
      </div>
      <div className="sf-alert-card__condition">{alert.condition}</div>
      <div className="sf-alert-card__meta">
        <span>Type: {TYPE_LABELS[alert.type]}</span>
        <span>Threshold: {numberFormatter.format(alert.threshold)}</span>
        <span>Timeframe: {alert.timeframe}</span>
      </div>
      <div className="sf-alert-card__actions">
        <button
          type="button"
          className="sf-alert-card__action sf-focus-ring"
          onClick={(event) => {
            event.stopPropagation();
            onToggleStatus(alert);
          }}
          disabled={isBusy}
          data-testid={`alert-action-toggle-${alert.id}`}
          aria-label={`${toggleLabel} alert for ${alert.symbol}`}
        >
          {toggleLabel}
        </button>
        <button
          type="button"
          className="sf-alert-card__action sf-alert-card__action--danger sf-focus-ring"
          onClick={(event) => {
            event.stopPropagation();
            onDelete(alert);
          }}
          disabled={isBusy}
          data-testid={`alert-action-delete-${alert.id}`}
          aria-label={`Delete alert for ${alert.symbol}`}
        >
          Delete
        </button>
      </div>
    </article>
  );
}

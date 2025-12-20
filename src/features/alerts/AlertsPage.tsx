import React from "react";
import { getAlertsList, type AlertListItem } from "@/api/alerts";
import FiltersBar from "@/features/alerts/FiltersBar";
import "./alerts.css";

const TYPE_LABELS: Record<AlertListItem["type"], string> = {
  "price-above": "Price above",
  "price-below": "Price below",
};

const numberFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

const formatStatus = (status: AlertListItem["status"]) =>
  status.replace(/-/g, " ");

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState<AlertListItem[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "loaded" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const loadAlerts = React.useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const list = await getAlertsList();
      if (!isMountedRef.current) return;
      setAlerts(list);
      setStatus("loaded");
    } catch (error) {
      if (!isMountedRef.current) return;
      console.warn("AlertsPage: failed to load alerts", error);
      setStatus("error");
      setErrorMessage("We couldn't load alerts just yet. Please try again.");
    }
  }, []);

  React.useEffect(() => {
    loadAlerts();
  }, [loadAlerts]);

  const hasAlerts = status === "loaded" && alerts.length > 0;

  return (
    <section className="sf-alerts-page" data-testid="alerts-page">
      <header className="sf-alerts-page__header">
        <div>
          <h1 className="sf-alerts-page__title">Alerts</h1>
          <p className="sf-alerts-page__subtitle">
            Monitor price levels, conditions, and automated triggers.
          </p>
        </div>
      </header>

      <FiltersBar />

      <div className="sf-alerts-page__list">
        {status === "loading" ? (
          <div className="sf-alerts-list__state" role="status" aria-live="polite">
            Loading alerts…
          </div>
        ) : null}

        {status === "error" ? (
          <div className="sf-alerts-list__state" role="alert">
            <p>{errorMessage}</p>
            <button
              type="button"
              className="sf-alerts-filters__button sf-focus-ring"
              onClick={loadAlerts}
            >
              Retry loading
            </button>
          </div>
        ) : null}

        {status === "loaded" && !hasAlerts ? (
          <div className="sf-alerts-list__state" role="status" aria-live="polite">
            No alerts yet. Create one from the dashboard or chart tools.
          </div>
        ) : null}

        {hasAlerts ? (
          <ul className="sf-alerts-list" aria-label="Alerts list">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <article className="sf-alerts-list__row" tabIndex={0}>
                  <div className="sf-alerts-list__row-header">
                    <span className="sf-alerts-list__symbol">{alert.symbol}</span>
                    <span
                      className="sf-alerts-list__status"
                      aria-label={`Status: ${formatStatus(alert.status)}`}
                    >
                      {formatStatus(alert.status)}
                    </span>
                  </div>
                  <div className="sf-alerts-list__condition">{alert.condition}</div>
                  <div className="sf-alerts-list__meta">
                    <span>Type: {TYPE_LABELS[alert.type]}</span>
                    <span>Threshold: {numberFormatter.format(alert.threshold)}</span>
                    <span>Timeframe: {alert.timeframe}</span>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

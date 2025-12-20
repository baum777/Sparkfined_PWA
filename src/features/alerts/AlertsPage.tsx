import React from "react";
import {
  deleteAlert,
  getAlertsList,
  type AlertListItem,
  updateAlertStatus,
} from "@/api/alerts";
import AlertCard from "@/features/alerts/AlertCard";
import FiltersBar from "@/features/alerts/FiltersBar";
import "./alerts.css";

export default function AlertsPage() {
  const [alerts, setAlerts] = React.useState<AlertListItem[]>([]);
  const [status, setStatus] = React.useState<"idle" | "loading" | "loaded" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [actionMessage, setActionMessage] = React.useState<string | null>(null);
  const [pendingActions, setPendingActions] = React.useState<Record<string, "toggle" | "delete">>(
    {},
  );
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

  const setPendingAction = React.useCallback((id: string, action?: "toggle" | "delete") => {
    setPendingActions((current) => {
      if (!action) {
        const { [id]: removed, ...rest } = current;
        void removed;
        return rest;
      }
      return { ...current, [id]: action };
    });
  }, []);

  const handleToggleStatus = React.useCallback(
    async (alert: AlertListItem) => {
      const nextStatus = alert.status === "paused" ? "armed" : "paused";
      const previousStatus = alert.status;
      setActionMessage(null);
      setPendingAction(alert.id, "toggle");
      setAlerts((current) =>
        current.map((item) => (item.id === alert.id ? { ...item, status: nextStatus } : item)),
      );

      try {
        await updateAlertStatus({ id: alert.id, status: nextStatus });
      } catch (error) {
        console.warn("AlertsPage: failed to toggle alert status", error);
        setAlerts((current) =>
          current.map((item) =>
            item.id === alert.id ? { ...item, status: previousStatus } : item,
          ),
        );
        setActionMessage("We couldn't update that alert. Please try again.");
      } finally {
        setPendingAction(alert.id);
      }
    },
    [setPendingAction],
  );

  const handleDelete = React.useCallback(
    async (alert: AlertListItem) => {
      const previousIndex = alerts.findIndex((item) => item.id === alert.id);
      setActionMessage(null);
      setPendingAction(alert.id, "delete");
      setAlerts((current) => current.filter((item) => item.id !== alert.id));

      try {
        await deleteAlert({ id: alert.id });
      } catch (error) {
        console.warn("AlertsPage: failed to delete alert", error);
        setAlerts((current) => {
          if (current.some((item) => item.id === alert.id)) return current;
          const next = [...current];
          const insertIndex = previousIndex < 0 ? next.length : Math.min(previousIndex, next.length);
          next.splice(insertIndex, 0, alert);
          return next;
        });
        setActionMessage("We couldn't delete that alert. Please try again.");
      } finally {
        setPendingAction(alert.id);
      }
    },
    [alerts, setPendingAction],
  );

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

        {actionMessage ? (
          <div className="sf-alerts-list__state sf-alerts-list__state--action" role="alert">
            {actionMessage}
          </div>
        ) : null}

        {hasAlerts ? (
          <ul className="sf-alerts-list" aria-label="Alerts list" data-testid="alerts-list">
            {alerts.map((alert) => (
              <li key={alert.id}>
                <AlertCard
                  alert={alert}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                  isToggling={pendingActions[alert.id] === "toggle"}
                  isDeleting={pendingActions[alert.id] === "delete"}
                />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

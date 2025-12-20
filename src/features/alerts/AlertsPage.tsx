import React from "react";
import {
  deleteAlert,
  getAlertsList,
  type AlertListItem,
  updateAlertStatus,
} from "@/api/alerts";
import { Button } from "@/components/ui";
import AlertCard from "@/features/alerts/AlertCard";
import MobileAlertRow from "@/features/alerts/MobileAlertRow";
import FiltersBar from "@/features/alerts/FiltersBar";
import NewAlertSheet from "@/features/alerts/NewAlertSheet";
import { applyAlertFilters, type AlertFilterState } from "@/features/alerts/filtering";
import "./alerts.css";

const DEFAULT_FILTERS: AlertFilterState = {
  status: "all",
  type: "all",
  query: "",
  symbol: "",
};

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
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });
  const [isNewAlertOpen, setIsNewAlertOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<AlertFilterState>(DEFAULT_FILTERS);
  const isMountedRef = React.useRef(true);

  React.useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    setIsMobile(mediaQuery.matches);

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }

    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
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

  const handleAlertCreated = React.useCallback((created: AlertListItem) => {
    setAlerts((current) => [created, ...current]);
    setStatus("loaded");
    setActionMessage("Alert created and armed.");
  }, []);

  const filteredAlerts = React.useMemo(() => applyAlertFilters(alerts, filters), [alerts, filters]);
  const hasAlerts = status === "loaded" && alerts.length > 0;
  const hasFilteredAlerts = status === "loaded" && filteredAlerts.length > 0;
  const AlertItem = isMobile ? MobileAlertRow : AlertCard;

  return (
    <section className="sf-alerts-page" data-testid="alerts-page">
      <header className="sf-alerts-page__header">
        <div>
          <h1 className="sf-alerts-page__title">Alerts</h1>
          <p className="sf-alerts-page__subtitle">
            Monitor price levels, conditions, and automated triggers.
          </p>
        </div>
        <div className="sf-alerts-page__actions">
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsNewAlertOpen(true)}
            data-testid="alerts-new-alert-button"
          >
            New alert
          </Button>
        </div>
      </header>

      <FiltersBar filters={filters} onChange={setFilters} />

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

        {status === "loaded" && hasAlerts && !hasFilteredAlerts ? (
          <div className="sf-alerts-list__state" role="status" aria-live="polite">
            No alerts match your filters.
          </div>
        ) : null}

        {actionMessage ? (
          <div className="sf-alerts-list__state sf-alerts-list__state--action" role="alert">
            {actionMessage}
          </div>
        ) : null}

        {hasFilteredAlerts ? (
          <ul
            className={`sf-alerts-list${isMobile ? " sf-alerts-list--mobile" : ""}`}
            aria-label="Alerts list"
            data-testid="alerts-list"
          >
            {filteredAlerts.map((alert) => (
              <li
                key={alert.id}
                data-testid="alerts-list-item"
                data-alert-id={alert.id}
                data-alert-status={alert.status}
                data-alert-type={alert.type}
              >
                <AlertItem
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

      <NewAlertSheet
        isOpen={isNewAlertOpen}
        onClose={() => setIsNewAlertOpen(false)}
        onCreated={handleAlertCreated}
      />
    </section>
  );
}

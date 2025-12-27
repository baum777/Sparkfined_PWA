import React from "react";
import {
  parseAlertPrefillSearchParams,
  stripAlertPrefillSearchParams,
} from "@/features/alerts/prefill";
import { Button } from "@/components/ui";
import AlertCard from "@/features/alerts/AlertCard";
import FiltersBar from "@/features/alerts/FiltersBar";
import NewAlertSheet from "@/features/alerts/NewAlertSheet";
import { applyAlertFilters, type AlertFilterState } from "@/features/alerts/filtering";
import { useSearchParams } from "react-router-dom";
import { useAlertsStore } from "@/store/alertsStore";
import AlertsDetailPanel from "@/components/alerts/AlertsDetailPanel";
import "./alerts.css";

const DEFAULT_FILTERS: AlertFilterState = {
  status: "all",
  type: "all",
  query: "",
  symbol: "",
};

export default function AlertsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const alerts = useAlertsStore((state) => state.alerts);
  const updateAlert = useAlertsStore((state) => state.updateAlert);
  const deleteAlert = useAlertsStore((state) => state.deleteAlert);
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 767px)").matches;
  });
  const [isNewAlertOpen, setIsNewAlertOpen] = React.useState(false);
  const [filters, setFilters] = React.useState<AlertFilterState>(DEFAULT_FILTERS);
  const hasConsumedPrefill = React.useRef(false);

  const prefill = React.useMemo(
    () => parseAlertPrefillSearchParams(searchParams),
    [searchParams],
  );

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

  const selectedAlertId = searchParams.get("alert");
  const selectedAlert = React.useMemo(
    () => (selectedAlertId ? alerts.find((alert) => alert.id === selectedAlertId) : undefined),
    [alerts, selectedAlertId],
  );

  React.useEffect(() => {
    if (!prefill || hasConsumedPrefill.current) return;
    setIsNewAlertOpen(true);
    hasConsumedPrefill.current = true;
    const nextParams = stripAlertPrefillSearchParams(searchParams);
    setSearchParams(nextParams, { replace: true });
  }, [prefill, searchParams, setSearchParams]);

  const handleToggleStatus = React.useCallback(
    async (alert: { id: string; status: string }) => {
      const nextStatus = alert.status === "paused" ? "armed" : "paused";
      updateAlert(alert.id, { status: nextStatus as any });
    },
    [updateAlert],
  );

  const handleDelete = React.useCallback(
    async (alert: { id: string }) => {
      deleteAlert(alert.id);
    },
    [deleteAlert],
  );

  const listItems = React.useMemo(
    () =>
      alerts.map((alert) => ({
        id: alert.id,
        symbol: alert.symbol,
        type: alert.type,
        condition: alert.condition,
        threshold: alert.threshold,
        timeframe: alert.timeframe,
        status: alert.status,
      })),
    [alerts],
  );

  const filteredAlerts = React.useMemo(() => applyAlertFilters(listItems, filters), [listItems, filters]);
  const hasAlerts = alerts.length > 0;
  const hasFilteredAlerts = filteredAlerts.length > 0;

  const handleSelectAlert = React.useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("alert", id);
      setSearchParams(next);
    },
    [searchParams, setSearchParams],
  );

  const handleAlertDeleted = React.useCallback(
    (id: string) => {
      if (selectedAlertId !== id) return;
      const next = new URLSearchParams(searchParams);
      next.delete("alert");
      setSearchParams(next);
    },
    [searchParams, selectedAlertId, setSearchParams],
  );

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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <div className="sf-alerts-page__list">
          {!hasAlerts ? (
            <div className="sf-alerts-list__state" role="status" aria-live="polite">
              No alerts yet. Create one from the dashboard or chart tools.
            </div>
          ) : null}

          {hasAlerts && !hasFilteredAlerts ? (
            <div className="sf-alerts-list__state" role="status" aria-live="polite" data-testid="alerts-empty-state">
              No alerts match your filters.
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
                  onClick={() => handleSelectAlert(alert.id)}
                >
                  <AlertCard alert={alert} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <aside>
          <AlertsDetailPanel alert={selectedAlert} onAlertDeleted={handleAlertDeleted} />
        </aside>
      </div>

      <NewAlertSheet
        isOpen={isNewAlertOpen}
        onClose={() => setIsNewAlertOpen(false)}
        onCreated={(id) => handleSelectAlert(id)}
        prefill={prefill}
      />
    </section>
  );
}

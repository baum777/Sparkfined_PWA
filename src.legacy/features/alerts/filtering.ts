import type { AlertListItem } from "@/api/alerts";
import type { AlertStatus, AlertType } from "@/store/alertsStore";

export type AlertFilterStatus = "all" | AlertStatus;
export type AlertFilterType = "all" | AlertType;

export type AlertFilterState = {
  status: AlertFilterStatus;
  type: AlertFilterType;
  query: string;
  symbol: string;
};

const normalizeSymbol = (value: string) => value.trim().toUpperCase();

const matchesSymbolFilters = (alert: AlertListItem, filters: AlertFilterState) => {
  const normalizedSymbol = normalizeSymbol(filters.symbol);
  if (normalizedSymbol) {
    return normalizeSymbol(alert.symbol) === normalizedSymbol;
  }

  const normalizedQuery = normalizeSymbol(filters.query);
  if (!normalizedQuery) return true;

  return normalizeSymbol(alert.symbol).includes(normalizedQuery);
};

export const applyAlertFilters = (alerts: AlertListItem[], filters: AlertFilterState) => {
  return alerts.filter((alert) => {
    if (filters.status !== "all" && alert.status !== filters.status) return false;
    if (filters.type !== "all" && alert.type !== filters.type) return false;
    if (!matchesSymbolFilters(alert, filters)) return false;
    return true;
  });
};

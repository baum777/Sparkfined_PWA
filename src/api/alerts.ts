import { config } from "@/lib/config";
import type { Alert, AlertStatus, AlertType } from "@/store/alertsStore";

export interface AlertsOverviewDTO {
  armed: number;
  triggered: number;
  paused: number;
}

export type AlertListItem = Pick<
  Alert,
  "id" | "symbol" | "type" | "condition" | "threshold" | "timeframe" | "status"
>;

const MOCK_ALERTS_OVERVIEW: AlertsOverviewDTO = {
  armed: 2,
  triggered: 1,
  paused: 0,
};

const MOCK_ALERTS_LIST: AlertListItem[] = [
  {
    id: "chart-btc-breakout",
    symbol: "BTCUSDT",
    type: "price-above",
    condition: "Breaks above 42,500 with RSI > 60",
    threshold: 42500,
    timeframe: "4h",
    status: "armed",
  },
  {
    id: "chart-eth-sweep",
    symbol: "ETHUSDT",
    type: "price-below",
    condition: "Reclaim failure after liquidity sweep",
    threshold: 2350,
    timeframe: "1h",
    status: "triggered",
  },
  {
    id: "chart-sol-range",
    symbol: "SOLUSDT",
    type: "price-above",
    condition: "Breaks above value area high for 2 closes",
    threshold: 190,
    timeframe: "1d",
    status: "paused",
  },
];

const ALERT_STATUSES: AlertStatus[] = ["armed", "triggered", "paused"];
const ALERT_TYPES: AlertType[] = ["price-above", "price-below"];

const normalizeCount = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const extractOverview = (payload: unknown): AlertsOverviewDTO | null => {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const source =
    record.overview && typeof record.overview === "object"
      ? (record.overview as Record<string, unknown>)
      : record;

  const armed = normalizeCount(source.armed);
  const triggered = normalizeCount(source.triggered);
  const paused = normalizeCount(source.paused);

  if (armed === null || triggered === null || paused === null) return null;

  return { armed, triggered, paused };
};

const normalizeString = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const normalizeNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const normalizeStatus = (value: unknown): AlertStatus | null => {
  const normalized = normalizeString(value);
  if (!normalized) return null;
  return ALERT_STATUSES.includes(normalized as AlertStatus) ? (normalized as AlertStatus) : null;
};

const normalizeType = (value: unknown): AlertType | null => {
  const normalized = normalizeString(value);
  if (!normalized) return null;
  return ALERT_TYPES.includes(normalized as AlertType) ? (normalized as AlertType) : null;
};

const normalizeAlert = (value: unknown): AlertListItem | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const id = normalizeString(record.id);
  const symbol = normalizeString(record.symbol);
  const type = normalizeType(record.type);
  const condition = normalizeString(record.condition);
  const threshold = normalizeNumber(record.threshold);
  const timeframe = normalizeString(record.timeframe);
  const status = normalizeStatus(record.status);

  if (!id || !symbol || !type || !condition || threshold === null || !timeframe || !status) {
    return null;
  }

  return {
    id,
    symbol,
    type,
    condition,
    threshold,
    timeframe,
    status,
  };
};

const extractAlertsList = (payload: unknown): AlertListItem[] | null => {
  if (!payload) return null;
  const rawList = Array.isArray(payload)
    ? payload
    : typeof payload === "object" && "alerts" in payload
      ? (payload as { alerts?: unknown }).alerts
      : null;

  if (!Array.isArray(rawList)) return null;

  const normalized = rawList.map(normalizeAlert).filter((alert): alert is AlertListItem => Boolean(alert));

  return normalized.length > 0 ? normalized : null;
};

export async function getAlertsOverview(): Promise<AlertsOverviewDTO> {
  const baseUrl = config?.apiBaseUrl?.trim();
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, "")}/alerts/overview` : null;

  if (endpoint && typeof fetch === "function") {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const payload = await response.json();
        const overview = extractOverview(payload);
        if (overview) return overview;
      }
    } catch (error) {
      console.warn("getAlertsOverview: falling back to mock overview", error);
    }
  }

  return { ...MOCK_ALERTS_OVERVIEW };
}

export async function getAlertsList(): Promise<AlertListItem[]> {
  const baseUrl = config?.apiBaseUrl?.trim();
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, "")}/alerts` : null;

  if (endpoint && typeof fetch === "function") {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const payload = await response.json();
        const list = extractAlertsList(payload);
        if (list) return list;
      }
    } catch (error) {
      console.warn("getAlertsList: falling back to mock alerts", error);
    }
  }

  return [...MOCK_ALERTS_LIST];
}

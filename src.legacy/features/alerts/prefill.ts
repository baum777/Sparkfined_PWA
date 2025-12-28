import type { AlertType } from "@/store/alertsStore";

export interface AlertPrefillValues {
  symbol?: string;
  type?: AlertType;
  condition?: string;
  threshold?: string;
  timeframe?: string;
}

const PREFILL_FLAG = "new";
const PREFILL_KEYS = [
  PREFILL_FLAG,
  "symbol",
  "type",
  "condition",
  "threshold",
  "timeframe",
] as const;

const normalizeAlertType = (value: string | null): AlertType | undefined => {
  if (value === "price-above" || value === "price-below") return value;
  return undefined;
};

export const buildAlertPrefillSearchParams = (prefill: AlertPrefillValues): URLSearchParams => {
  const params = new URLSearchParams();
  params.set(PREFILL_FLAG, "1");

  if (prefill.symbol) params.set("symbol", prefill.symbol);
  if (prefill.type) params.set("type", prefill.type);
  if (prefill.condition) params.set("condition", prefill.condition);
  if (prefill.threshold) params.set("threshold", prefill.threshold);
  if (prefill.timeframe) params.set("timeframe", prefill.timeframe);

  return params;
};

export const parseAlertPrefillSearchParams = (
  params: URLSearchParams,
): AlertPrefillValues | null => {
  if (params.get(PREFILL_FLAG) !== "1") return null;

  const symbol = params.get("symbol")?.trim();
  const condition = params.get("condition")?.trim();
  const threshold = params.get("threshold")?.trim();
  const timeframe = params.get("timeframe")?.trim();
  const type = normalizeAlertType(params.get("type"));

  return {
    symbol: symbol || undefined,
    type,
    condition: condition || undefined,
    threshold: threshold || undefined,
    timeframe: timeframe || undefined,
  };
};

export const stripAlertPrefillSearchParams = (params: URLSearchParams): URLSearchParams => {
  const next = new URLSearchParams(params);
  PREFILL_KEYS.forEach((key) => next.delete(key));
  return next;
};

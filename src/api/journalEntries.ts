import { config } from "@/lib/config";

export interface TradeLogItemDTO {
  id: string;
  symbol: string;
  side: "BUY" | "SELL";
  size?: number;
  price?: number;
  pnlUsd?: number;
  timestamp: string;
}

const MOCK_TRADES: TradeLogItemDTO[] = [
  { id: "t-001", symbol: "BTC", side: "BUY", size: 0.25, price: 42150, pnlUsd: 320, timestamp: "2024-05-20T14:20:00Z" },
  { id: "t-002", symbol: "ETH", side: "SELL", size: 1.2, price: 3180, pnlUsd: -85, timestamp: "2024-05-20T10:05:00Z" },
  { id: "t-003", symbol: "SOL", side: "BUY", size: 15, price: 148, pnlUsd: 210, timestamp: "2024-05-19T21:42:00Z" },
  { id: "t-004", symbol: "AVAX", side: "SELL", size: 8, price: 42.5, pnlUsd: -65, timestamp: "2024-05-19T18:18:00Z" },
  { id: "t-005", symbol: "ATOM", side: "BUY", size: 20, price: 9.8, pnlUsd: 45, timestamp: "2024-05-19T09:05:00Z" },
  { id: "t-006", symbol: "BONK", side: "BUY", size: 250000, price: 0.000027, pnlUsd: 35, timestamp: "2024-05-18T23:50:00Z" },
  { id: "t-007", symbol: "JTO", side: "SELL", size: 110, price: 3.45, pnlUsd: -24, timestamp: "2024-05-18T15:30:00Z" },
  { id: "t-008", symbol: "LINK", side: "BUY", size: 40, price: 15.1, pnlUsd: 68, timestamp: "2024-05-17T20:12:00Z" },
  { id: "t-009", symbol: "APT", side: "SELL", size: 18, price: 9.2, pnlUsd: -42, timestamp: "2024-05-17T11:44:00Z" },
  { id: "t-010", symbol: "ARB", side: "BUY", size: 65, price: 1.38, pnlUsd: 12, timestamp: "2024-05-16T16:05:00Z" },
];

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const normalizeTimestamp = (value: unknown): string | null => {
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return new Date(value).toISOString();
  }
  return null;
};

const sanitizeTrade = (value: unknown): TradeLogItemDTO | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  const id = typeof record.id === "string" && record.id.trim().length > 0 ? record.id : null;
  const symbol =
    typeof record.symbol === "string" && record.symbol.trim().length > 0
      ? record.symbol.trim().toUpperCase()
      : null;
  const side = record.side === "BUY" || record.side === "SELL" ? record.side : null;
  const size = toNumber(record.size) ?? undefined;
  const price = toNumber(record.price) ?? undefined;
  const pnlUsd = toNumber(record.pnlUsd) ?? undefined;
  const timestamp = normalizeTimestamp(record.timestamp);

  if (!id || !symbol || !side || !timestamp) return null;

  return {
    id,
    symbol,
    side,
    size,
    price,
    pnlUsd,
    timestamp,
  };
};

const extractTrades = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.trades)) return record.trades;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
};

export async function getRecentTrades(limit?: number): Promise<TradeLogItemDTO[]> {
  const baseUrl = config?.apiBaseUrl?.trim();
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, "")}/journal/trades` : null;
  const search = limit ? `?limit=${encodeURIComponent(String(limit))}` : "";

  if (endpoint && typeof fetch === "function") {
    try {
      const response = await fetch(`${endpoint}${search}`, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const payload = await response.json();
        const trades = extractTrades(payload)
          .map((item) => sanitizeTrade(item))
          .filter((trade): trade is TradeLogItemDTO => Boolean(trade));

        if (trades.length > 0) {
          return typeof limit === "number" ? trades.slice(0, limit) : trades;
        }
      }
    } catch (error) {
      console.warn("getRecentTrades: falling back to mock trades", error);
    }
  }

  const items = MOCK_TRADES.map((trade) => ({ ...trade }));
  return typeof limit === "number" ? items.slice(0, limit) : items;
}

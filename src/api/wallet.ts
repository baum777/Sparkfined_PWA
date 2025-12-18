import { config } from "@/lib/config";

export interface HoldingDTO {
  symbol: string;
  amount: number;
  valueUsd: number;
  changePct24h?: number;
}

const MOCK_HOLDINGS: HoldingDTO[] = [
  { symbol: "SOL", amount: 2.4, valueUsd: 420.35, changePct24h: 1.8 },
  { symbol: "USDC", amount: 1200, valueUsd: 1200, changePct24h: 0 },
  { symbol: "JTO", amount: 150, valueUsd: 380.5, changePct24h: -2.3 },
  { symbol: "BONK", amount: 950000, valueUsd: 215.12, changePct24h: 4.6 },
];

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const sanitizeHolding = (value: unknown): HoldingDTO | null => {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;

  const symbol =
    typeof record.symbol === "string" && record.symbol.trim().length > 0
      ? record.symbol.trim().toUpperCase()
      : null;
  const amount = toNumber(record.amount);
  const valueUsd = toNumber(record.valueUsd);
  const changePct24h = toNumber(record.changePct24h);

  if (!symbol || amount === null || valueUsd === null) return null;

  return {
    symbol,
    amount,
    valueUsd,
    changePct24h: changePct24h ?? undefined,
  };
};

const extractHoldings = (payload: unknown): unknown[] => {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    if (Array.isArray(record.holdings)) return record.holdings;
    if (Array.isArray(record.data)) return record.data;
  }
  return [];
};

export async function getHoldings(walletAddress?: string): Promise<HoldingDTO[]> {
  const trimmed = walletAddress?.trim();
  if (!trimmed) return [];

  const baseUrl = config?.apiBaseUrl?.trim();
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, "")}/wallets/${encodeURIComponent(trimmed)}/holdings` : null;

  if (endpoint && typeof fetch === "function") {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const payload = await response.json();
        const holdings = extractHoldings(payload)
          .map((item) => sanitizeHolding(item))
          .filter((holding): holding is HoldingDTO => Boolean(holding));

        if (holdings.length > 0) {
          return holdings;
        }
      }
    } catch (error) {
      console.warn("getHoldings: falling back to mock holdings", error);
    }
  }

  return MOCK_HOLDINGS.map((holding) => ({ ...holding }));
}

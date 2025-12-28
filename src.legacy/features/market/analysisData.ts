import { fetchTokenCandles, type Candle } from "@/lib/priceAdapter";

export type AnalysisSnapshot = {
  symbol: string;
  price: number;
  change24hPct: number;
  timeframeLabel: string;
};

const ANALYSIS_SYMBOL_CONFIG = {
  symbol: "SOLUSDT",
  network: "solana",
  address: "So11111111111111111111111111111111111111112",
} as const;

const CANDLE_SAMPLE_LIMIT = 25;

export async function fetchAnalysisSnapshot(): Promise<AnalysisSnapshot> {
  const candles = await fetchTokenCandles(
    ANALYSIS_SYMBOL_CONFIG.network,
    ANALYSIS_SYMBOL_CONFIG.address,
    {
      limit: CANDLE_SAMPLE_LIMIT,
    }
  );

  if (!candles.length) {
    throw new Error("No candle data available for analysis snapshot");
  }

  const latest = candles[candles.length - 1];
  if (!latest || !Number.isFinite(latest.close)) {
    throw new Error("Invalid candle payload for analysis snapshot");
  }

  const firstCandle = candles[0] ?? latest;
  const change24hPct = computeChangePct(latest, firstCandle);

  return {
    symbol: ANALYSIS_SYMBOL_CONFIG.symbol,
    price: latest.close,
    change24hPct,
    timeframeLabel: "4H",
  };
}

/**
 * Simple 24h approximation: compare oldest vs most recent candle in the window.
 * NOTE(P2-backlog): Centralize once market helper consolidation lands.
 */
function computeChangePct(latest: Candle, baseline?: Candle): number {
  if (!baseline || !Number.isFinite(baseline.close) || baseline.close === 0) {
    return 0;
  }

  const delta = ((latest.close - baseline.close) / baseline.close) * 100;
  return Number.isFinite(delta) ? delta : 0;
}

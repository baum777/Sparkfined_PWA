/**
 * Analyze Market Endpoint
 * Returns AnalyzeMarketResult with Advanced Insight data
 * 
 * Beta v0.9: Backend endpoint for Advanced Insight feature
 */

export const config = { runtime: "edge" };

import type {
  AnalyzeMarketResult,
  MarketSnapshotPayload,
  MarketMeta,
  OhlcCandle,
} from "../../src/types/ai";
import {
  enrichMarketSnapshot,
  generatePlaybookFromSnapshot,
} from "../../src/lib/ai/enrichMarketSnapshot";
import { buildAdvancedInsightFromSnapshot } from "../../src/lib/ai/buildAdvancedInsight";

const json = (obj: unknown, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

interface AnalyzeMarketRequest {
  /** Token contract address or ticker */
  address: string;

  /** Timeframe (1m, 5m, 15m, 1h, 4h, 1d) */
  timeframe: string;

  /** Current price */
  price?: number;

  /** 24h volume in USD */
  volume24hUsd?: number;

  /** Market cap in USD */
  marketCapUsd?: number;

  /** Liquidity in USD */
  liquidityUsd?: number;

  /** OHLC candles (if pre-fetched) */
  candles?: OhlcCandle[];

  /** Whether to check access gating */
  checkAccess?: boolean;
}

const SUPPORTED_TIMEFRAMES = new Set([
  "1m",
  "5m",
  "15m",
  "1h",
  "4h",
  "1d",
]);

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return json(
      { ok: false, error: "POST only", code: "METHOD_NOT_ALLOWED" },
      405
    );
  }

  try {
    const body = (await req.json()) as AnalyzeMarketRequest;
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const timeframe =
      typeof body.timeframe === "string" ? body.timeframe.trim() : "";

    if (!address || !timeframe) {
      return json(
        { ok: false, error: "address and timeframe required", code: "MISSING_FIELDS" },
        400
      );
    }

    if (!SUPPORTED_TIMEFRAMES.has(timeframe)) {
      return json(
        { ok: false, error: "Unsupported timeframe", code: "UNSUPPORTED_TIMEFRAME" },
        422
      );
    }

    const volume24hUsd = coerceNumber(body.volume24hUsd);
    const marketCapUsd = coerceNumber(body.marketCapUsd);
    const liquidityUsd = coerceNumber(body.liquidityUsd);
    const checkAccess = Boolean(body.checkAccess);

    const providedCandles = normalizeCandles(body.candles);
    if (providedCandles === null) {
      return json(
        { ok: false, error: "Invalid candles payload", code: "INVALID_CANDLES" },
        422
      );
    }

    let ohlcCandles: OhlcCandle[] = providedCandles;

    if (ohlcCandles.length === 0) {
      const ohlcUrl = new URL("/api/data/ohlc", req.url);
      ohlcUrl.searchParams.set("address", address);
      ohlcUrl.searchParams.set("tf", timeframe);

      try {
        const ohlcRes = await fetch(ohlcUrl.toString());
        if (!ohlcRes.ok) {
          return json(
            {
              ok: false,
              error: `Failed to fetch OHLC data (status ${ohlcRes.status})`,
              code: "UPSTREAM_ERROR",
            },
            502
          );
        }
        const ohlcData = await ohlcRes.json().catch(() => ({}));
        const fetchedCandles = normalizeCandles(ohlcData?.candles);
        if (fetchedCandles === null) {
          return json(
            {
              ok: false,
              error: "OHLC provider returned invalid data",
              code: "UPSTREAM_INVALID",
            },
            502
          );
        }
        ohlcCandles = fetchedCandles ?? [];
      } catch (err) {
        return json(
          { ok: false, error: "Failed to fetch OHLC data", code: "UPSTREAM_ERROR" },
          502
        );
      }
    }

    const meta: MarketMeta = {
      symbol: `${address}/USDT`,
      ticker: address.slice(0, 8).toUpperCase(),
      timeframe,
      exchange: "DexScreener",
      source: "Sparkfined",
      timestamp: new Date().toISOString(),
    };

    const baseSnapshot: Partial<MarketSnapshotPayload> = {
      meta,
      candles: ohlcCandles,
      volume_24h_usd: volume24hUsd,
      market_cap_usd: marketCapUsd,
      liquidity_usd: liquidityUsd,
      heuristics_source: "local_engine",
    };

    let enrichedSnapshot: MarketSnapshotPayload;

    if (ohlcCandles.length === 0) {
      enrichedSnapshot = {
        meta,
        candles: [],
        volume_24h_usd: volume24hUsd,
        market_cap_usd: marketCapUsd,
        liquidity_usd: liquidityUsd,
        macro_tags: [],
        indicator_status: [],
        heuristics_source: "fallback_no_candles",
      };
    } else {
      enrichedSnapshot = enrichMarketSnapshot(baseSnapshot);
    }

    const playbookEntries =
      ohlcCandles.length === 0
        ? []
        : generatePlaybookFromSnapshot(enrichedSnapshot);

    const advancedInsight = buildAdvancedInsightFromSnapshot(enrichedSnapshot, {
      playbookEntries,
    });

    let accessMeta = undefined;
    if (checkAccess) {
      accessMeta = await checkAccessGating(req);
    }

    const result: AnalyzeMarketResult = {
      snapshot: null,
      deep_signal: null,
      advanced: advancedInsight,
      access: accessMeta,
      sanity_flags: [],
    };

    return json({ ok: true, data: result });
  } catch (error: any) {
    console.error("[analyze-market] Error:", error);
    return json(
      {
        ok: false,
        error: error?.message || "Internal server error",
        code: "UNHANDLED_ERROR",
      },
      500
    );
  }
}

/**
 * Check access gating for Advanced Insight
 */
async function checkAccessGating(req: Request): Promise<any> {
  // Beta v0.9: Mock access check
  // TODO: Implement real NFT-based access gating
  
  // For now, return unlocked access in development
  const isDev = process.env.NODE_ENV !== "production";
  
  return {
    feature: "advanced_deep_dive",
    tier: isDev ? "basic" : "advanced_locked",
    is_unlocked: isDev,
    token_lock_id: isDev ? undefined : "pending-nft-check",
    reason: isDev ? undefined : "Beta: Advanced Insight requires NFT-based access",
  };
}

function coerceNumber(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function normalizeCandles(input: unknown): OhlcCandle[] | null {
  if (input === undefined) {
    return [];
  }

  if (!Array.isArray(input)) {
    return null;
  }

  const sanitized: OhlcCandle[] = [];

  for (const candle of input) {
    if (!isRecord(candle)) {
      return null;
    }

    const t = toFiniteNumber(candle.t);
    const o = toFiniteNumber(candle.o);
    const h = toFiniteNumber(candle.h);
    const l = toFiniteNumber(candle.l);
    const c = toFiniteNumber(candle.c);

    if (
      t === null ||
      o === null ||
      h === null ||
      l === null ||
      c === null
    ) {
      return null;
    }

    const normalizedCandle: OhlcCandle = {
      t,
      o,
      h,
      l,
      c,
    };

    const v = toFiniteNumber(candle.v, true);
    if (v !== null) {
      normalizedCandle.v = v;
    }

    sanitized.push(normalizedCandle);
  }

  return sanitized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, allowZero = true): number | null {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    return null;
  }
  if (!allowZero && num === 0) {
    return null;
  }
  return num;
}

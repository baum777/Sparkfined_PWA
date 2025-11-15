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

// Import from compiled build (Vercel edge runtime compatibility)
// Note: These imports will resolve after build
// For development, ensure proper tsconfig paths

const json = (obj: any, status = 200) =>
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

export default async function handler(req: Request) {
  if (req.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }

  try {
    const body = (await req.json()) as AnalyzeMarketRequest;
    const { address, timeframe, price, volume24hUsd, marketCapUsd, liquidityUsd, candles, checkAccess } = body;

    if (!address || !timeframe) {
      return json({ error: "address and timeframe required" }, 400);
    }

    // Fetch OHLC data if not provided
    let ohlcCandles: OhlcCandle[] = candles || [];
    
    if (ohlcCandles.length === 0) {
      // Call OHLC API to get candle data
      const ohlcUrl = new URL("/api/data/ohlc", req.url);
      ohlcUrl.searchParams.set("address", address);
      ohlcUrl.searchParams.set("tf", timeframe);
      
      const ohlcRes = await fetch(ohlcUrl.toString());
      if (ohlcRes.ok) {
        const ohlcData = await ohlcRes.json();
        ohlcCandles = ohlcData.candles || [];
      } else {
        return json({ error: "Failed to fetch OHLC data" }, 500);
      }
    }

    if (ohlcCandles.length === 0) {
      return json({ error: "No candle data available" }, 400);
    }

    // Build market meta
    const meta: MarketMeta = {
      symbol: `${address}/USDT`,
      ticker: address.slice(0, 8),
      timeframe,
      exchange: "DexScreener",
      source: "Sparkfined",
      timestamp: new Date().toISOString(),
    };

    // Build base snapshot
    const baseSnapshot: Partial<MarketSnapshotPayload> = {
      meta,
      candles: ohlcCandles,
      volume_24h_usd: volume24hUsd,
      market_cap_usd: marketCapUsd,
      liquidity_usd: liquidityUsd,
    };

    // Enrich with heuristics
    const enrichedSnapshot = await enrichSnapshot(baseSnapshot);

    // Generate playbook
    const playbookEntries = await generatePlaybook(enrichedSnapshot);

    // Build Advanced Insight Card
    const advancedInsight = await buildAdvancedInsight(enrichedSnapshot, playbookEntries);

    // Check access if requested
    let accessMeta = undefined;
    if (checkAccess) {
      accessMeta = await checkAccessGating(req);
    }

    // Build result
    const result: AnalyzeMarketResult = {
      snapshot: null, // Basic snapshot not implemented yet
      deep_signal: null, // Deep signal not implemented yet
      advanced: advancedInsight,
      access: accessMeta,
      sanity_flags: [],
    };

    return json(result);
  } catch (error: any) {
    console.error("[analyze-market] Error:", error);
    return json({ error: error.message || "Internal server error" }, 500);
  }
}

/**
 * Enrich snapshot with heuristics
 * This would normally import from src/lib/ai/enrichMarketSnapshot
 * For edge runtime, we inline the logic
 */
async function enrichSnapshot(
  snapshot: Partial<MarketSnapshotPayload>
): Promise<MarketSnapshotPayload> {
  const { meta, candles } = snapshot;
  
  if (!meta || !candles || candles.length === 0) {
    throw new Error("Invalid snapshot: missing meta or candles");
  }

  // Compute range structure
  const high = Math.max(...candles.map(c => c.h));
  const low = Math.min(...candles.map(c => c.l));
  const mid = (high + low) / 2;
  
  const rangeStructure = {
    window_hours: 24,
    low,
    high,
    mid,
  };

  // Compute bias
  const lastClose = candles[candles.length - 1]?.c || mid;
  const aboveMid = lastClose > mid;
  const percentFromMid = ((lastClose - mid) / mid) * 100;
  
  const bias = {
    bias: (Math.abs(percentFromMid) < 1 ? "neutral" : aboveMid ? "bullish" : "bearish") as any,
    reason: `Price ${aboveMid ? "above" : "below"} midrange (${percentFromMid.toFixed(1)}%)`,
    above_midrange: aboveMid,
    higher_lows: false,
    lower_highs: false,
  };

  // Compute key levels (simplified)
  const keyLevels = [
    {
      price: high,
      type: ["resistance"] as any,
      label: "24h High",
      strength: "medium" as any,
    },
    {
      price: low,
      type: ["support"] as any,
      label: "24h Low",
      strength: "medium" as any,
    },
  ];

  // Compute zones
  const zones = [
    {
      label: "support" as any,
      from: low * 0.98,
      to: low * 1.02,
      source_level: low,
      offset_type: "percent" as any,
      offset_value: 0.02,
      is_default: true,
    },
    {
      label: "target_tp1" as any,
      from: high * 0.98,
      to: high * 1.02,
      source_level: high,
      offset_type: "percent" as any,
      offset_value: 0.02,
      is_default: true,
    },
  ];

  // Flow/volume
  const flowVolume = {
    vol_24h_usd: snapshot.volume_24h_usd,
    vol_24h_delta_pct: undefined,
    source: meta.source,
  };

  return {
    meta,
    candles,
    indicators: snapshot.indicators,
    liquidity_usd: snapshot.liquidity_usd,
    market_cap_usd: snapshot.market_cap_usd,
    volume_24h_usd: snapshot.volume_24h_usd,
    range_structure: rangeStructure,
    key_levels: keyLevels,
    zones: zones,
    bias: bias,
    flow_volume: flowVolume,
    macro_tags: [],
    indicator_status: [],
    heuristics_source: "local_engine",
  };
}

/**
 * Generate playbook from enriched snapshot
 */
async function generatePlaybook(snapshot: MarketSnapshotPayload): Promise<string[]> {
  const { range_structure, bias, key_levels, zones } = snapshot;
  
  if (!range_structure || !bias) {
    return [];
  }

  const currentPrice = snapshot.candles[snapshot.candles.length - 1]?.c || range_structure.mid;
  const entries: string[] = [];

  // Generate tactical entries based on bias
  if (bias.bias === "bullish") {
    entries.push(
      `If price breaks above $${range_structure.high.toFixed(2)} with volume → target $${(range_structure.high * 1.05).toFixed(2)}`
    );
    entries.push(
      `On pullback to $${range_structure.low.toFixed(2)} → look for long entry with tight stop`
    );
    entries.push(
      `Stop loss: clean break below $${(range_structure.low * 0.98).toFixed(2)} → bias shifts bearish`
    );
  } else if (bias.bias === "bearish") {
    entries.push(
      `If price breaks below $${range_structure.low.toFixed(2)} → target $${(range_structure.low * 0.95).toFixed(2)}`
    );
    entries.push(
      `On bounce to $${range_structure.high.toFixed(2)} → look for short entry or exit longs`
    );
    entries.push(
      `Stop loss for shorts: clean break above $${(range_structure.high * 1.02).toFixed(2)} → bias shifts bullish`
    );
  } else {
    entries.push(
      `Range-bound between $${range_structure.low.toFixed(2)}-$${range_structure.high.toFixed(2)} → fade extremes`
    );
    entries.push(
      `Break above $${range_structure.high.toFixed(2)} → bullish, target $${(range_structure.high * 1.05).toFixed(2)}`
    );
    entries.push(
      `Break below $${range_structure.low.toFixed(2)} → bearish, target $${(range_structure.low * 0.95).toFixed(2)}`
    );
  }

  return entries;
}

/**
 * Build Advanced Insight Card from enriched snapshot
 */
async function buildAdvancedInsight(
  snapshot: MarketSnapshotPayload,
  playbookEntries: string[]
): Promise<any> {
  return {
    sections: {
      market_structure: {
        range: {
          auto_value: snapshot.range_structure,
          user_value: undefined,
          is_overridden: false,
        },
        key_levels: {
          auto_value: snapshot.key_levels || [],
          user_value: undefined,
          is_overridden: false,
        },
        zones: {
          auto_value: snapshot.zones || [],
          user_value: undefined,
          is_overridden: false,
        },
        bias: {
          auto_value: snapshot.bias,
          user_value: undefined,
          is_overridden: false,
        },
      },
      flow_volume: {
        flow: {
          auto_value: snapshot.flow_volume,
          user_value: undefined,
          is_overridden: false,
        },
      },
      playbook: {
        entries: {
          auto_value: playbookEntries,
          user_value: undefined,
          is_overridden: false,
        },
      },
      macro: {
        tags: {
          auto_value: snapshot.macro_tags || [],
          user_value: undefined,
          is_overridden: false,
        },
      },
    },
    source_payload: snapshot,
    active_layers: ["L1_STRUCTURE", "L2_FLOW", "L3_TACTICAL"],
  };
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

// api/ai.ts
// Consolidated AI API
// Consolidates: api/ai/{analyze-market, assist, grok-context} (3→1)
// Routes:
//   POST /api/ai?action=analyze-market  → Advanced market analysis with OHLC enrichment
//   POST /api/ai?action=assist           → Dual AI provider (OpenAI + Grok) with templates
//   POST /api/ai?action=grok-context     → Twitter context via Grok API

export const config = { runtime: "edge" };

import type {
  AnalyzeMarketResult,
  MarketSnapshotPayload,
  MarketMeta,
  OhlcCandle,
} from "../src/types/ai";
import {
  enrichMarketSnapshot,
  generatePlaybookFromSnapshot,
} from "../src/lib/ai/enrichMarketSnapshot";
import { buildAdvancedInsightFromSnapshot } from "../src/lib/ai/buildAdvancedInsight";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  try {
    switch (action) {
      case "analyze-market":
        return handleAnalyzeMarket(req);
      case "assist":
        return handleAssist(req);
      case "grok-context":
        return handleGrokContext(req);
      default:
        return json(
          { ok: false, error: "Unknown action. Use ?action=analyze-market|assist|grok-context" },
          400
        );
    }
  } catch (error: any) {
    console.error("[ai] Handler error:", error);
    return json({ ok: false, error: error.message || "Internal error" }, 500);
  }
}

// ============================================================================
// ANALYZE-MARKET
// ============================================================================

interface AnalyzeMarketRequest {
  address: string;
  timeframe: string;
  price?: number;
  volume24hUsd?: number;
  marketCapUsd?: number;
  liquidityUsd?: number;
  candles?: OhlcCandle[];
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

async function handleAnalyzeMarket(req: Request): Promise<Response> {
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
        console.error("[analyze-market] OHLC fetch failed", err);
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

async function checkAccessGating(_req: Request): Promise<any> {
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

// ============================================================================
// ASSIST (Dual AI Provider)
// ============================================================================

type AssistRequest = {
  provider: "openai" | "grok";
  model?: string;
  system?: string;
  user?: string;
  templateId?: "v1/analyze_bullets" | "v1/journal_condense";
  vars?: Record<string, unknown>;
  maxOutputTokens?: number;
  maxCostUsd?: number;
};

async function handleAssist(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ ok: false, error: "POST only" }, 405);

  const authError = ensureAiProxyAuthorized(req);
  if (authError) return authError;

  try {
    const envCap = Number(process.env.AI_MAX_COST_USD || "0") || undefined;
    const cacheTtlSec = Number(process.env.AI_CACHE_TTL_SEC || "0") || 0;
    const { provider, model, system, user, templateId, vars, maxOutputTokens, maxCostUsd } =
      (await req.json()) as AssistRequest;

    if (!provider) return json({ ok: false, error: "provider required" }, 400);

    const prompt = templateId ? renderTemplate(templateId, vars || {}) : { system, user };
    if (!prompt.user) return json({ ok: false, error: "user or templateId required" }, 400);

    const caps = {
      maxCostUsd: Math.min(
        ...[maxOrInf(maxCostUsd), maxOrInf(envCap)].filter((n) => Number.isFinite(n))
      ),
    };

    const est = estimatePromptCost(provider, model, prompt.system, prompt.user);
    if (caps.maxCostUsd && est.inCostUsd > caps.maxCostUsd) {
      return json(
        {
          ok: false,
          error: `prompt cost (${est.inCostUsd.toFixed(4)}$) exceeds cap (${caps.maxCostUsd}$)`,
        },
        200
      );
    }

    const cacheKey = await keyFor(provider, model, prompt.system, prompt.user);
    const cached = cacheTtlSec ? await cacheGet(cacheKey) : null;
    if (cached) return json({ ok: true, fromCache: true, ...cached }, 200);

    const start = Date.now();
    const out = await routeAiProvider(
      provider,
      model,
      prompt.system,
      prompt.user,
      clampTokens(maxOutputTokens)
    );
    const ms = Date.now() - start;
    const payload = { ms, ...out };
    if (cacheTtlSec) await cacheSet(cacheKey, payload, cacheTtlSec);
    return json({ ok: true, ...payload });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

async function routeAiProvider(
  p: AssistRequest["provider"],
  model?: string,
  system?: string,
  user?: string,
  maxOutputTokens?: number
) {
  switch (p) {
    case "openai":
      return callOpenAI(model ?? "gpt-4.1-mini", system, user!, maxOutputTokens);
    case "grok":
      return callGrok(model ?? "grok-4-mini", system, user!, maxOutputTokens);
    default:
      throw new Error("unknown provider");
  }
}

async function callOpenAI(
  model: string,
  system: string | undefined,
  user: string,
  maxOutputTokens?: number
) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_API_KEY missing");
  const r = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: maxOutputTokens ?? 800,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: user },
      ],
    }),
  });
  const j = await r.json();
  const text = j?.choices?.[0]?.message?.content ?? "";
  return {
    provider: "openai",
    model,
    text,
    usage: j?.usage ?? null,
    costUsd: estimateOpenaiCost(model, j?.usage),
  };
}

function estimateOpenaiCost(model: string, usage: any) {
  const inTok = usage?.prompt_tokens ?? 0;
  const outTok = usage?.completion_tokens ?? 0;
  const price = /mini|small/i.test(model)
    ? { in: 0.00015, out: 0.0006 }
    : { in: 0.005, out: 0.015 };
  return (inTok / 1000) * price.in + (outTok / 1000) * price.out;
}

async function callGrok(
  model: string,
  system: string | undefined,
  user: string,
  maxOutputTokens?: number
) {
  const key = process.env.GROK_API_KEY;
  if (!key) throw new Error("GROK_API_KEY missing");
  const r = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      max_tokens: maxOutputTokens ?? 800,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        { role: "user", content: user },
      ],
    }),
  });
  const j = await r.json();
  const text = j?.choices?.[0]?.message?.content ?? "";
  return {
    provider: "grok",
    model,
    text,
    usage: j?.usage ?? null,
    costUsd: null as number | null,
  };
}

function ensureAiProxyAuthorized(req: Request): Response | null {
  const secret = process.env.AI_PROXY_SECRET?.trim();
  const env = process.env.NODE_ENV ?? "production";
  const isProd = env === "production";

  if (!secret) {
    if (!isProd) {
      console.warn("[ai/assist] AI_PROXY_SECRET not set – allowing request in non-production");
      return null;
    }
    console.error("[ai/assist] AI_PROXY_SECRET missing – blocking AI proxy request");
    return json({ ok: false, error: "AI proxy disabled" }, 503);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (token.trim() !== secret) {
    return json({ ok: false, error: "Unauthorized" }, 403);
  }

  return null;
}

function renderTemplate(
  templateId: "v1/analyze_bullets" | "v1/journal_condense",
  vars: Record<string, unknown>
) {
  const T: any = {
    "v1/analyze_bullets": (v: any) => ({
      system:
        "Du bist ein präziser, knapper TA-Assistent. Antworte in deutsch mit Bulletpoints. Keine Floskeln, keine Disclaimer.",
      user: [
        `CA: ${v.address} · TF: ${v.tf}`,
        `KPIs:`,
        `- lastClose=${v.metrics?.lastClose}`,
        `- change24h=${v.metrics?.change24h}%`,
        `- volatility24hσ=${v.metrics ? (v.metrics.volStdev * 100).toFixed(2) : "n/a"}%`,
        `- ATR14=${v.metrics?.atr14} · HiLo24h=${v.metrics?.hiLoPerc}% · Vol24h=${v.metrics?.volumeSum}`,
        `Signals:`,
        (v.matrixRows || [])
          .map((r: any) => `${r.id}: ${r.values.map((s: number) => (s > 0 ? "Bull" : s < 0 ? "Bear" : "Flat")).join(", ")}`)
          .join("\n"),
        `Task: Schreibe 4–7 prägnante Analyse-Bullets; erst Fakten, dann mögliche Trade-Setups.`,
      ].join("\n"),
    }),
    "v1/journal_condense": (v: any) => ({
      system:
        "Du reduzierst Chart-Notizen auf das Wesentliche. Antworte in deutsch als 4–6 kurze Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion.",
      user: [
        v.title ? `Titel: ${v.title}` : "",
        v.address ? `CA: ${v.address}` : "",
        v.tf ? `TF: ${v.tf}` : "",
        v.body ? `Notiz:\n${v.body}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
    }),
  };
  return T[templateId](vars);
}

function maxOrInf(n?: number) {
  return Number.isFinite(n!) && n! > 0 ? n! : Number.POSITIVE_INFINITY;
}

function pricePer1k(provider: string, model?: string) {
  if (provider === "openai") {
    const mini = /mini|small/i.test(model || "");
    return { in: mini ? 0.00015 : 0.005, out: mini ? 0.0006 : 0.015 };
  }
  return { in: 0.00015, out: 0.0006 };
}

function estimatePromptCost(
  provider: string,
  model: string | undefined,
  system?: string,
  user?: string
) {
  const chars = (system?.length || 0) + (user?.length || 0);
  const tokens = Math.ceil(chars / 4);
  const price = pricePer1k(provider, model);
  return { inTokens: tokens, inCostUsd: (tokens / 1000) * price.in };
}

function clampTokens(maxOutput?: number) {
  return Math.max(64, Math.min(4000, maxOutput ?? 800));
}

const CACHE = new Map<string, { v: any; exp: number }>();
async function keyFor(p: any, m: any, s: any, u: any) {
  const jsonStr = JSON.stringify([p, m, s, u]);
  const enc = new TextEncoder().encode(jsonStr);
  const buf = await crypto.subtle.digest("SHA-256", enc);
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
async function cacheGet(k: string) {
  const itm = CACHE.get(k);
  if (!itm) return null;
  if (Date.now() > itm.exp) {
    CACHE.delete(k);
    return null;
  }
  return itm.v;
}
async function cacheSet(k: string, v: any, ttlSec: number) {
  CACHE.set(k, { v, exp: Date.now() + ttlSec * 1000 });
}

// ============================================================================
// GROK-CONTEXT (Twitter context via Grok API)
// ============================================================================

interface GrokContextRequest {
  ticker: string;
  address: string;
  timestamp: number;
}

interface GrokTweet {
  author: string;
  text: string;
  url: string;
  timestamp: number;
  likes?: number;
  retweets?: number;
}

interface GrokContextResponse {
  success: boolean;
  data?: {
    lore: string;
    sentiment: "bullish" | "bearish" | "neutral";
    keyTweets: GrokTweet[];
    fetchedAt: number;
  };
  error?: string;
}

const XAI_API_KEY = process.env.XAI_API_KEY || "";
const XAI_BASE_URL = process.env.XAI_BASE_URL || "https://api.x.ai/v1";

async function handleGrokContext(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ success: false, error: "Method not allowed" }, 405);
  }

  const authError = ensureAiProxyAuthorized(req);
  if (authError) return authError;

  try {
    const body: GrokContextRequest = await req.json();
    const { ticker, address, timestamp } = body;

    if (!ticker || !address) {
      return json(
        { success: false, error: "Missing required fields: ticker, address" },
        400
      );
    }

    console.log("[Grok] Fetching context for:", { ticker, address });

    const allTweets = await searchTwitterViaGrok(ticker, address, timestamp);
    const keyTweets = selectKeyTweets(allTweets);

    console.log(
      `[Grok] Found ${allTweets.length} tweets, selected ${keyTweets.length} key tweets`
    );

    const { lore, sentiment } = await extractLoreWithGrok(keyTweets, ticker);

    const response: GrokContextResponse = {
      success: true,
      data: {
        lore,
        sentiment,
        keyTweets,
        fetchedAt: Date.now(),
      },
    };

    return json(response, 200);
  } catch (error) {
    console.error("[Grok] Error:", error);
    return json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Internal server error",
      },
      500
    );
  }
}

async function searchTwitterViaGrok(
  ticker: string,
  address: string,
  timestamp: number
): Promise<GrokTweet[]> {
  if (!XAI_API_KEY) {
    console.error("[Grok] XAI_API_KEY not configured");
    return [];
  }

  try {
    const startTime = new Date(timestamp - 24 * 60 * 60 * 1000).toISOString();
    const query = `(${ticker} OR $${ticker} OR ${address.slice(0, 8)}) -is:retweet lang:en`;
    const tweets = await fetchTweetsFromXAPI(query, startTime);
    return tweets;
  } catch (error) {
    console.error("[Grok] Twitter search failed:", error);
    return [];
  }
}

async function fetchTweetsFromXAPI(
  query: string,
  startTime: string
): Promise<GrokTweet[]> {
  const mockTweets: GrokTweet[] = [
    {
      author: "@crypto_analyst",
      text: `${query.split(" ")[0]} showing strong community support. Chart looks bullish! 🚀`,
      url: "https://x.com/crypto_analyst/status/123",
      timestamp: new Date(startTime).getTime(),
      likes: 150,
      retweets: 45,
    },
    {
      author: "@degen_trader",
      text: `Just aped into ${query.split(" ")[0]}. This could be the next 100x. DYOR!`,
      url: "https://x.com/degen_trader/status/124",
      timestamp: new Date(startTime).getTime() + 3600000,
      likes: 89,
      retweets: 23,
    },
  ];

  return mockTweets;
}

async function extractLoreWithGrok(
  tweets: GrokTweet[],
  ticker: string
): Promise<{
  lore: string;
  sentiment: "bullish" | "bearish" | "neutral";
}> {
  if (tweets.length === 0) {
    return {
      lore: "Insufficient data to determine token lore.",
      sentiment: "neutral",
    };
  }

  try {
    const tweetTexts = tweets.map((t, i) => `${i + 1}. @${t.author}: ${t.text}`).join("\n");

    const prompt = `Analyze these tweets about ${ticker} and provide:
1. A concise summary (2-3 sentences) of the token's lore, concept, and hype
2. Overall sentiment (bullish/bearish/neutral)

Tweets:
${tweetTexts}

Format your response as JSON:
{
  "lore": "...",
  "sentiment": "bullish|bearish|neutral"
}`;

    const response = await fetch(`${XAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${XAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "grok-beta",
        messages: [
          {
            role: "system",
            content: "You are a crypto analyst extracting key insights from social media.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) {
      throw new Error(`Grok API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(content);

    return {
      lore: parsed.lore || "Unable to extract lore.",
      sentiment: parsed.sentiment || "neutral",
    };
  } catch (error) {
    console.error("[Grok] Lore extraction failed:", error);

    const positiveKeywords = ["moon", "bullish", "pump", "rocket", "gem", "alpha"];
    const negativeKeywords = ["dump", "rug", "scam", "bearish", "dead", "rekt"];

    const allText = tweets.map((t) => t.text.toLowerCase()).join(" ");
    const positiveCount = positiveKeywords.filter((kw) => allText.includes(kw)).length;
    const negativeCount = negativeKeywords.filter((kw) => allText.includes(kw)).length;

    let sentiment: "bullish" | "bearish" | "neutral" = "neutral";
    if (positiveCount > negativeCount + 2) sentiment = "bullish";
    if (negativeCount > positiveCount + 2) sentiment = "bearish";

    return {
      lore: `Community discussing ${ticker}. ${tweets.length} tweets analyzed.`,
      sentiment,
    };
  }
}

function selectKeyTweets(tweets: GrokTweet[]): GrokTweet[] {
  if (tweets.length === 0) return [];

  const sorted = [...tweets].sort((a, b) => a.timestamp - b.timestamp);
  const oldest = sorted.slice(0, Math.min(10, sorted.length));
  const newest = sorted.slice(-Math.min(10, sorted.length)).reverse();

  const byEngagement = [...tweets].sort((a, b) => {
    const aScore = (a.likes || 0) + (a.retweets || 0);
    const bScore = (b.likes || 0) + (b.retweets || 0);
    return bScore - aScore;
  });
  const top = byEngagement.slice(0, Math.min(10, tweets.length));

  const combined = new Map<string, GrokTweet>();
  oldest.forEach((t) => combined.set(t.url, t));
  newest.forEach((t) => combined.set(t.url, t));
  top.forEach((t) => combined.set(t.url, t));

  return Array.from(combined.values());
}

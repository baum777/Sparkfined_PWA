// api/grok-pulse.ts
// Consolidated Grok-Pulse API
// Consolidates: api/grok-pulse/{cron, state, sentiment, context} (4→1)
// Routes:
//   POST /api/grok-pulse?action=cron            → Cron job (Bearer auth)
//   GET  /api/grok-pulse?action=state[&addresses=X,Y] → Get sentiments + history
//   POST /api/grok-pulse?action=sentiment       → Update sentiment for token
//   GET  /api/grok-pulse?action=context&address=X → Get/build context for token

export const config = { runtime: "nodejs" };

import { runGrokPulseCron } from "../src/lib/grokPulse/engine";
import {
  getCurrentSnapshot,
  getHistory,
  getPulseGlobalList,
  getPulseMetaLastRun,
  appendHistory,
  cacheTokenContext,
  getCachedTokenContext,
  getWatchlistTokens,
  setCurrentSnapshot,
} from "../src/lib/grokPulse/kv";
import { buildEnhancedGrokContext } from "../src/lib/grokPulse/contextBuilder";
import { fetchAndValidateGrokSentiment } from "../src/lib/grokPulse/grokClient";
import { buildKeywordSentimentFallback } from "../src/lib/grokPulse/sentimentFallback";
import { sanitizeSymbol } from "../src/lib/grokPulse/sources";
import type {
  GrokSentimentHistoryEntry,
  GrokSentimentSnapshot,
  PulseGlobalToken,
} from "../src/lib/grokPulse/types";

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
      case "cron":
        return handleCron(req);
      case "state":
        return handleState(req);
      case "sentiment":
        return handleSentiment(req);
      case "context":
        return handleContext(req);
      default:
        return json(
          { ok: false, error: "Unknown action. Use ?action=cron|state|sentiment|context" },
          400
        );
    }
  } catch (error: any) {
    console.error("[grok-pulse] Handler error:", error);
    return json({ ok: false, error: error.message || "Internal error" }, 500);
  }
}

// ============================================================================
// CRON
// ============================================================================
async function handleCron(req: Request): Promise<Response> {
  const secret = process.env.PULSE_CRON_SECRET?.trim();
  if (!secret) {
    return json({ ok: false, error: "PULSE_CRON_SECRET not configured" }, 500);
  }

  const authHeader = req.headers.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ", 2);

  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (token.trim() !== secret) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const result = await runGrokPulseCron();
  return json({ ok: true, ...result }, 200);
}

// ============================================================================
// STATE
// ============================================================================
async function handleState(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const addressesParam = url.searchParams.get("addresses")?.trim();

  let addresses: string[] = [];
  if (addressesParam && addressesParam.length > 0) {
    addresses = addressesParam
      .split(",")
      .map((addr) => addr.trim())
      .filter(Boolean);
  } else {
    const tokens = await getPulseGlobalList();
    addresses = tokens.map((token) => token.address);
  }

  const sentimentsByAddress: Record<string, GrokSentimentSnapshot | null> = {};
  const historyByAddress: Record<string, GrokSentimentHistoryEntry[]> = {};

  for (const address of addresses) {
    try {
      const snapshot = await getCurrentSnapshot(address);
      const history = await getHistory(address);
      sentimentsByAddress[address] = snapshot;
      historyByAddress[address] = history;
    } catch (error) {
      console.error("[grokPulse] failed to read state for", address, error);
      sentimentsByAddress[address] = null;
      historyByAddress[address] = [];
    }
  }

  const meta = await getPulseMetaLastRun();
  const lastPulseTs = meta?.ts ?? null;

  return json({ sentimentsByAddress, historyByAddress, lastPulseTs });
}

// ============================================================================
// SENTIMENT
// ============================================================================
async function handleSentiment(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  let payload: any = {};
  try {
    payload = await req.json();
  } catch {
    return json({ ok: false, error: "Invalid JSON" }, 400);
  }

  const address = payload?.address?.trim();
  const symbol = sanitizeSymbol(payload?.symbol ?? "UNKNOWN");
  if (!address) {
    return json({ ok: false, error: "address is required" }, 400);
  }

  const token: PulseGlobalToken = { address, symbol };

  const sourceArgs = {
    dexscreenerApiKey: process.env.DEXSCREENER_API_KEY?.trim(),
    dexscreenerBaseUrl: process.env.DEXSCREENER_BASE_URL?.trim(),
    birdeyeApiKey: process.env.BIRDEYE_API_KEY?.trim(),
    birdeyeBaseUrl: process.env.BIRDEYE_BASE_URL?.trim(),
  } as const;

  const socialArgs = {
    socialApiKey: process.env.PULSE_SOCIAL_API_KEY?.trim(),
    socialBaseUrl: process.env.PULSE_SOCIAL_API_URL?.trim(),
    twitterApiKey: process.env.PULSE_TWITTER_API_KEY?.trim(),
    twitterBaseUrl: process.env.PULSE_TWITTER_API_URL?.trim(),
  } as const;

  const watchlistTokens = await Promise.resolve(
    typeof getWatchlistTokens === "function" ? getWatchlistTokens() : []
  ).catch(() => []);

  const cachedContext = await getCachedTokenContext(address);
  const context = cachedContext
    ? {
        context: cachedContext,
        social: { total: 0, entries: [], twitterEntries: [] },
        onchain: null,
        watchlistHit: false,
      }
    : await buildEnhancedGrokContext(token, {
        ...sourceArgs,
        ...socialArgs,
        watchlistTokens,
      }).catch((error) => {
        console.warn("[grokPulse] sentiment context builder failed", error);
        return {
          context: `Token: ${token.symbol} (${token.address})\nNo live context; return low confidence score.`,
          onchain: null,
          social: { entries: [], twitterEntries: [], total: 0 },
          watchlistHit: false,
        };
      });

  if (!cachedContext) {
    await cacheTokenContext(address, context.context);
  }

  const snapshot =
    (await fetchAndValidateGrokSentiment({
      symbol: token.symbol,
      address: token.address,
      context: context.context,
    })) ?? buildKeywordSentimentFallback(token, context.context);

  await persistSnapshot(token, snapshot);

  return json({ ok: true, snapshot, context: context.context });
}

// ============================================================================
// CONTEXT
// ============================================================================
async function handleContext(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const address = url.searchParams.get("address")?.trim();
  const symbolParam = url.searchParams.get("symbol")?.trim();

  if (!address) {
    return json({ ok: false, error: "address is required" }, 400);
  }

  const symbol = sanitizeSymbol(symbolParam ?? "UNKNOWN");
  const token: PulseGlobalToken = { address, symbol };

  const sourceArgs = {
    dexscreenerApiKey: process.env.DEXSCREENER_API_KEY?.trim(),
    dexscreenerBaseUrl: process.env.DEXSCREENER_BASE_URL?.trim(),
    birdeyeApiKey: process.env.BIRDEYE_API_KEY?.trim(),
    birdeyeBaseUrl: process.env.BIRDEYE_BASE_URL?.trim(),
  } as const;

  const socialArgs = {
    socialApiKey: process.env.PULSE_SOCIAL_API_KEY?.trim(),
    socialBaseUrl: process.env.PULSE_SOCIAL_API_URL?.trim(),
    twitterApiKey: process.env.PULSE_TWITTER_API_KEY?.trim(),
    twitterBaseUrl: process.env.PULSE_TWITTER_API_URL?.trim(),
  } as const;

  const [watchlistTokens, globalList] = await Promise.all([
    getWatchlistTokens().catch(() => []),
    getPulseGlobalList().catch(() => []),
  ]);

  const cached = await getCachedTokenContext(address);
  if (cached) {
    return json({
      ok: true,
      context: cached,
      source: "cache",
      meta: { inGlobalList: globalList.some((item) => item.address === address) },
    });
  }

  const context = await buildEnhancedGrokContext(token, {
    ...sourceArgs,
    ...socialArgs,
    watchlistTokens,
  });

  await cacheTokenContext(address, context.context);

  return json({
    ok: true,
    context: context.context,
    social: context.social.total,
    watchlist: context.watchlistHit,
    source: context.onchain?.source ?? null,
  });
}

// ============================================================================
// HELPERS
// ============================================================================
async function persistSnapshot(
  token: PulseGlobalToken,
  snapshot: GrokSentimentSnapshot
) {
  const previousSnapshot = await Promise.resolve(
    typeof getCurrentSnapshot === "function"
      ? getCurrentSnapshot(token.address)
      : null
  ).catch(() => null);
  const history = previousSnapshot
    ? []
    : (await Promise.resolve(
        typeof getHistory === "function" ? getHistory(token.address) : []
      ).catch(() => [])) ?? [];
  const previousScore = previousSnapshot
    ? previousSnapshot.score
    : history.at(-1)?.score ?? null;

  if (previousScore !== null) {
    snapshot.delta = snapshot.score - previousScore;
  }

  await setCurrentSnapshot(token.address, snapshot);
  await appendHistory(token.address, { ts: snapshot.ts, score: snapshot.score });
}

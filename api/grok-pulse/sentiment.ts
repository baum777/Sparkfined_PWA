export const config = { runtime: "edge" };

import { buildEnhancedGrokContext } from "../../src/lib/grokPulse/contextBuilder";
import { fetchAndValidateGrokSentiment } from "../../src/lib/grokPulse/grokClient";
import {
  appendHistory,
  cacheTokenContext,
  getCachedTokenContext,
  getCurrentSnapshot,
  getHistory,
  getWatchlistTokens,
  setCurrentSnapshot,
} from "../../src/lib/grokPulse/kv";
import { buildKeywordSentimentFallback } from "../../src/lib/grokPulse/sentimentFallback";
import { sanitizeSymbol } from "../../src/lib/grokPulse/sources";
import type { GrokSentimentSnapshot, PulseGlobalToken } from "../../src/lib/grokPulse/types";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "Method not allowed" }, 405);
  }

  let payload: any = {};
  try {
    payload = await req.json();
  } catch (error) {
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

  const watchlistTokens = await getWatchlistTokens().catch(() => []);

  const cachedContext = await getCachedTokenContext(address);
  const context = cachedContext
    ? { context: cachedContext, social: { total: 0, entries: [], twitterEntries: [] }, onchain: null, watchlistHit: false }
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

async function persistSnapshot(
  token: PulseGlobalToken,
  snapshot: GrokSentimentSnapshot
) {
  const previousSnapshot = await getCurrentSnapshot(token.address).catch(() => null);
  const history = previousSnapshot ? [] : await getHistory(token.address).catch(() => []);
  const previousScore = previousSnapshot
    ? previousSnapshot.score
    : history.at(-1)?.score ?? null;

  if (previousScore !== null) {
    snapshot.delta = snapshot.score - previousScore;
  }

  await setCurrentSnapshot(token.address, snapshot);
  await appendHistory(token.address, { ts: snapshot.ts, score: snapshot.score });
}

export const config = { runtime: "nodejs" };

import { buildEnhancedGrokContext } from "../../src/lib/grokPulse/contextBuilder";
import {
  cacheTokenContext,
  getCachedTokenContext,
  getPulseGlobalList,
  getWatchlistTokens,
} from "../../src/lib/grokPulse/kv";
import { sanitizeSymbol } from "../../src/lib/grokPulse/sources";
import type { PulseGlobalToken } from "../../src/lib/grokPulse/types";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
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

  try {
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
  } catch (error) {
    console.error("[grokPulse] failed to build context", error);
    return json({ ok: false, error: "context build failed" }, 500);
  }
}

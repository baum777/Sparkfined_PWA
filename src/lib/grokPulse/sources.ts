import type { PulseGlobalToken } from "./types";

export interface GlobalTokenSourceArgs {
  dexscreenerApiKey?: string;
  dexscreenerBaseUrl?: string;
  birdeyeApiKey?: string;
  birdeyeBaseUrl?: string;
}

export async function fetchDexScreenerTopGainers(
  _args: GlobalTokenSourceArgs
): Promise<PulseGlobalToken[]> {
  // TODO: Implement real DexScreener adapter (HTTP fetch + schema validation)
  return [];
}

export async function fetchBirdeyeTopVolume(
  _args: GlobalTokenSourceArgs
): Promise<PulseGlobalToken[]> {
  // TODO: Implement real Birdeye adapter (HTTP fetch + schema validation)
  return [];
}

export async function fetchWatchlistTokens(): Promise<PulseGlobalToken[]> {
  // TODO: Wire watchlist-backed token selection when available
  return [];
}

export async function buildGlobalTokenList(
  args: GlobalTokenSourceArgs,
  maxUnique = 120
): Promise<PulseGlobalToken[]> {
  const [dexscreener, birdeye, watchlist] = await Promise.all([
    fetchDexScreenerTopGainers(args),
    fetchBirdeyeTopVolume(args),
    fetchWatchlistTokens(),
  ]);

  const deduped = new Map<string, PulseGlobalToken>();
  for (const token of [...dexscreener, ...birdeye, ...watchlist]) {
    const address = token.address.trim();
    if (!address || deduped.has(address)) continue;
    deduped.set(address, { address, symbol: token.symbol });
  }

  return Array.from(deduped.values()).slice(0, maxUnique);
}

import type { PulseGlobalToken } from "./types";

export type GlobalTokenSourceArgs = {
  dexscreenerApiKey?: string;
  birdeyeApiKey?: string;
  watchlistTokens?: PulseGlobalToken[];
  dexscreenerBaseUrl?: string;
  birdeyeBaseUrl?: string;
};

export async function fetchDexScreenerTopGainers(
  _args: GlobalTokenSourceArgs
): Promise<PulseGlobalToken[]> {
  // TODO: Implement DexScreener HTTP adapter.
  return [];
}

export async function fetchBirdeyeTopVolume(
  _args: GlobalTokenSourceArgs
): Promise<PulseGlobalToken[]> {
  // TODO: Implement Birdeye HTTP adapter.
  return [];
}

export async function fetchWatchlistTokens(
  args: GlobalTokenSourceArgs = {}
): Promise<PulseGlobalToken[]> {
  // TODO: Connect to persisted watchlist tokens when available.
  return args.watchlistTokens ?? [];
}

export async function buildGlobalTokenList(
  args: GlobalTokenSourceArgs,
  maxUnique = 120
): Promise<PulseGlobalToken[]> {
  const [dexscreener, birdeye, watchlist] = await Promise.all([
    fetchDexScreenerTopGainers(args),
    fetchBirdeyeTopVolume(args),
    fetchWatchlistTokens(args),
  ]);

  const tokensMap = new Map<string, PulseGlobalToken>();
  const allSources = [dexscreener, birdeye, watchlist];

  for (const source of allSources) {
    for (const token of source) {
      if (!tokensMap.has(token.address)) {
        tokensMap.set(token.address, token);
      }
      if (tokensMap.size >= maxUnique) {
        break;
      }
    }
    if (tokensMap.size >= maxUnique) {
      break;
    }
  }

  return Array.from(tokensMap.values());
}

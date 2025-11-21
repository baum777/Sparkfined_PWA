import type {
  BirdeyeTokenListResponse,
  DexscreenerPairEntry,
  DexscreenerResponse,
  PulseGlobalToken,
} from "./types";

export interface GlobalTokenSourceArgs {
  dexscreenerApiKey?: string;
  dexscreenerBaseUrl?: string;
  birdeyeApiKey?: string;
  birdeyeBaseUrl?: string;
}

export async function fetchDexScreenerTopGainers(
  args: GlobalTokenSourceArgs
): Promise<PulseGlobalToken[]> {
  const baseUrl =
    args.dexscreenerBaseUrl?.trim() ??
    "https://api.dexscreener.com/latest/dex";

  const endpoints = ["/solana/gainers", "/solana/new-pairs"];
  const headers: Record<string, string> = {
    accept: "application/json",
  };
  if (args.dexscreenerApiKey) {
    headers["x-api-key"] = args.dexscreenerApiKey;
  }

  const tokens: PulseGlobalToken[] = [];

  for (const path of endpoints) {
    try {
      const res = await fetch(`${baseUrl}${path}`, { headers });
      if (!res.ok) {
        console.warn(
          `[grokPulse] DexScreener request failed: ${res.status} ${res.statusText}`
        );
        continue;
      }

      const data = (await res.json()) as DexscreenerResponse;
      const pairs = Array.isArray(data?.pairs) ? data.pairs : [];

      for (const pair of pairs) {
        const token = normalizeDexscreenerPair(pair);
        if (token) tokens.push(token);
      }
    } catch (error) {
      console.warn("[grokPulse] DexScreener request error", error);
    }
  }

  return dedupeTokens(tokens);
}

export async function fetchBirdeyeTopVolume(
  args: GlobalTokenSourceArgs
): Promise<PulseGlobalToken[]> {
  const baseUrl = args.birdeyeBaseUrl?.trim() ?? "https://public-api.birdeye.so";
  const url = `${baseUrl}/public/tokenlist?sort_by=vol24hUSD&sort_type=desc&limit=50`;

  const headers: Record<string, string> = {
    accept: "application/json",
  };
  if (args.birdeyeApiKey) {
    headers["x-api-key"] = args.birdeyeApiKey;
  }

  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      console.warn(
        `[grokPulse] Birdeye request failed: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const data = (await res.json()) as BirdeyeTokenListResponse;
    const tokens = data?.data?.tokens ?? [];

    return dedupeTokens(
      tokens
        .filter((token) => Boolean(token?.address) && Boolean(token?.symbol))
        .map((token) => ({
          address: token.address.trim(),
          symbol: token.symbol.trim(),
        }))
    );
  } catch (error) {
    console.warn("[grokPulse] Birdeye request error", error);
    return [];
  }
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

function normalizeDexscreenerPair(
  pair: DexscreenerPairEntry
): PulseGlobalToken | null {
  const address = pair?.baseToken?.address?.trim();
  const symbol = pair?.baseToken?.symbol?.trim();
  if (!address) return null;

  return { address, symbol: symbol ?? "UNKNOWN" };
}

function dedupeTokens(tokens: PulseGlobalToken[]): PulseGlobalToken[] {
  const deduped = new Map<string, PulseGlobalToken>();
  for (const token of tokens) {
    const address = token.address.trim();
    if (!address || deduped.has(address)) continue;
    const symbol = token.symbol?.trim() || "UNKNOWN";
    deduped.set(address, { address, symbol });
  }

  return Array.from(deduped.values());
}

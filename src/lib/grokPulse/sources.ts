import { getWatchlistTokens } from "./kv";
import type {
  BirdeyeTokenListResponse,
  DexscreenerPairEntry,
  DexscreenerResponse,
  PulseGlobalToken,
} from "./types";

export type { PulseGlobalToken } from "./types";

const MAX_SYMBOL_LENGTH = 12;

export interface GlobalTokenSourceArgs {
  dexscreenerApiKey?: string;
  dexscreenerBaseUrl?: string;
  birdeyeApiKey?: string;
  birdeyeBaseUrl?: string;
  staticTokens?: PulseGlobalToken[];
  includeStaticTokens?: boolean;
}

const DEFAULT_STATIC_TOKENS: PulseGlobalToken[] = [
  { symbol: "BONK", address: "DezXAZ8z7Pnrn1SUSGLJhWnG8tA1sx9eES1ifBht7Prs" },
  { symbol: "JUP", address: "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB" },
  { symbol: "SOL", address: "So11111111111111111111111111111111111111112" },
  { symbol: "USDC", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { symbol: "USDT", address: "Es9vMFrzaCERrYjBf9d7Yk2uCUXaY3dTz4mB3x5p7VJ" },
  { symbol: "SAMO", address: "7xKXjQpX9d2QkZ4XXCtK9pwrKyYVJZZzUboZhoaq2BD" },
  { symbol: "MSOL", address: "mSoLzCr9uNZh8Y6AqFV3U8rQxYYbMhmZtaLe7eN9BXw" },
  { symbol: "RAY", address: "4k3Dyjzvzp8eMZWUXb7GF9w2Z9CZcMZ2z7amDV12vHf5" },
  { symbol: "ORCA", address: "orcaEKTdK7LKz57vaAYr9Qe7G1dFA5p7kS3dAXJ9UG8" },
  { symbol: "PYTH", address: "FsRiAgFmx7ug8QDXGrQoygbL6iRhK3rR9LMV8uJkmZs5" },
  { symbol: "WIF", address: "8s5QAVcPpAUMf27YgLdPFkjo1szh8QcJMcJUG7WnP6Je" },
  { symbol: "KIN", address: "KinXdEcpDQeHPEuQnqmGxBhw1wN8B5GD7e2w1WB9W3x" },
];

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
      const res = await fetch(`${baseUrl}${path}`, {
        headers,
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        console.warn(
          `[grokPulse] DexScreener request failed: ${res.status} ${res.statusText}`
        );
        continue;
      }

      const data = (await res.json().catch(() => null)) as DexscreenerResponse;
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
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      console.warn(
        `[grokPulse] Birdeye request failed: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const data = (await res.json().catch(() => null)) as BirdeyeTokenListResponse;
    const tokens = data?.data?.tokens ?? [];

    return dedupeTokens(
      tokens
        .filter((token) => Boolean(token?.address) && Boolean(token?.symbol))
        .map((token) => ({
          address: token.address.trim(),
          symbol: sanitizeSymbol(token.symbol),
        }))
    );
  } catch (error) {
    console.warn("[grokPulse] Birdeye request error", error);
    return [];
  }
}

export async function fetchWatchlistTokens(): Promise<PulseGlobalToken[]> {
  try {
    const tokens = await getWatchlistTokens();
    if (Array.isArray(tokens) && tokens.length) {
      return dedupeTokens(tokens);
    }
  } catch (error) {
    console.warn("[grokPulse] watchlist fetch failed", error);
  }

  const envList = process.env.PULSE_WATCHLIST_TOKENS?.trim();
  if (envList) {
    const parsed = envList
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [symbol, address] = entry.split(":");
        if (!address) return null;
        return { symbol: sanitizeSymbol(symbol), address: address.trim() };
      })
      .filter((token): token is PulseGlobalToken => Boolean(token?.address));

    if (parsed.length) return dedupeTokens(parsed);
  }

  return [];
}

export async function buildGlobalTokenList(
  args: GlobalTokenSourceArgs,
  maxUnique = 120,
  includeStatic = true
): Promise<PulseGlobalToken[]> {
  const [dexscreener, birdeye, watchlist] = await Promise.all([
    fetchDexScreenerTopGainers(args),
    fetchBirdeyeTopVolume(args),
    fetchWatchlistTokens(),
  ]);

  const staticTokens = includeStatic ? resolveStaticTokens(args) : [];

  const deduped = new Map<string, PulseGlobalToken>();
  for (const token of [...staticTokens, ...dexscreener, ...birdeye, ...watchlist]) {
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
  const symbol = sanitizeSymbol(pair?.baseToken?.symbol);
  if (!address) return null;

  return { address, symbol: symbol ?? "UNKNOWN" };
}

function dedupeTokens(tokens: PulseGlobalToken[]): PulseGlobalToken[] {
  const deduped = new Map<string, PulseGlobalToken>();
  for (const token of tokens) {
    const address = token.address.trim();
    if (!address || deduped.has(address)) continue;
    const symbol = sanitizeSymbol(token.symbol);
    deduped.set(address, { address, symbol });
  }

  return Array.from(deduped.values());
}

export function sanitizeSymbol(input?: string | null): string {
  const trimmed = input?.trim();
  if (!trimmed) return "UNKNOWN";

  const normalized = trimmed.toUpperCase().slice(0, MAX_SYMBOL_LENGTH);
  if (!normalized) return "UNKNOWN";

  return normalized;
}

function resolveStaticTokens(args: GlobalTokenSourceArgs): PulseGlobalToken[] {
  if (args.includeStaticTokens === false) return [];
  if (Array.isArray(args.staticTokens)) return dedupeTokens(args.staticTokens);

  const envList = process.env.PULSE_STATIC_TOKENS?.trim();
  if (envList) {
    const parsed = envList
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [symbol, address] = entry.split(":");
        if (!address) return null;
        return { symbol: sanitizeSymbol(symbol), address: address.trim() };
      })
      .filter((token): token is PulseGlobalToken => Boolean(token?.address));

    if (parsed.length) return dedupeTokens(parsed);
  }

  return dedupeTokens(DEFAULT_STATIC_TOKENS);
}

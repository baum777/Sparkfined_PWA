import { sanitizeSymbol } from "./sources";
import type { GlobalTokenSourceArgs, PulseGlobalToken } from "./sources";
import type { DexscreenerPairEntry } from "./types";

type DexscreenerPairWithMetrics = DexscreenerPairEntry & {
  liquidity?: { usd?: number | string };
  priceUsd?: number | string;
  volume?: { h24?: number | string };
  txns?: { h24?: { volumeUSD?: number | string } };
  priceChange?: { h24?: number | string };
  priceChange24h?: number | string;
};

export interface EnhancedSocialContext {
  entries: SocialContextEntry[];
  twitterEntries: SocialContextEntry[];
  total: number;
}

interface SocialContextEntry {
  text: string;
  score?: number;
}

interface OnchainSnapshot {
  priceUsd?: number;
  volume24hUsd?: number;
  liquidityUsd?: number;
  priceChange24hPct?: number;
  source: "dexscreener" | "birdeye";
}

export interface TokenContextBuilderArgs extends GlobalTokenSourceArgs {
  socialBaseUrl?: string;
  socialApiKey?: string;
  twitterBaseUrl?: string;
  twitterApiKey?: string;
  watchlistTokens?: PulseGlobalToken[];
}

const MAX_SOCIAL_ENTRIES = 4;
const MAX_SNIPPET_LENGTH = 220;

export interface EnhancedGrokContext {
  context: string;
  onchain?: OnchainSnapshot | null;
  social: EnhancedSocialContext;
  watchlistHit: boolean;
}

export async function buildEnhancedGrokContext(
  token: PulseGlobalToken,
  args: TokenContextBuilderArgs
): Promise<EnhancedGrokContext> {
  const [dexSnapshot, birdeyeSnapshot, socialMentions, twitterMentions] =
    await Promise.all([
      fetchDexscreenerSnapshot(token, args),
      fetchBirdeyeSnapshot(token, args),
      fetchSocialMentions(token, args),
      fetchTwitterMentions(token, args),
    ]);

  const onchain = dexSnapshot ?? birdeyeSnapshot;
  const contextParts: string[] = [];

  const watchlistHit = Boolean(
    args.watchlistTokens?.some(
      (candidate) => candidate.address === token.address ||
        sanitizeSymbol(candidate.symbol) === sanitizeSymbol(token.symbol)
    )
  );

  contextParts.push(`Token: ${sanitizeSymbol(token.symbol)} (${token.address})`);

  if (onchain) {
    const price = onchain.priceUsd ? `$${onchain.priceUsd.toFixed(6)}` : "n/a";
    const change =
      typeof onchain.priceChange24hPct === "number"
        ? `${onchain.priceChange24hPct.toFixed(2)}%`
        : "n/a";
    const volume = onchain.volume24hUsd
      ? `$${formatLargeNumber(onchain.volume24hUsd)}`
      : "n/a";
    const liq = onchain.liquidityUsd
      ? `$${formatLargeNumber(onchain.liquidityUsd)}`
      : "n/a";

    contextParts.push(
      [
        `On-chain (${onchain.source}): price ${price}`,
        `24h change ${change}`,
        `24h vol ${volume}`,
        `liquidity ${liq}`,
      ].join(" | ")
    );
  } else {
    contextParts.push(
      "On-chain: missing live market metrics; treat confidence conservatively."
    );
  }

  if (watchlistHit) {
    contextParts.push("Watchlist: token is tracked by Sparkfined users.");
  }

  const socialEntries = [...socialMentions, ...twitterMentions];
  const totalSocial = socialEntries.length;
  const combinedSnippets = socialEntries
    .slice(0, MAX_SOCIAL_ENTRIES)
    .map((entry) => formatSocialEntry(entry))
    .filter(Boolean)
    .join(" | ");

  if (totalSocial > 0) {
    contextParts.push(
      `Social (${totalSocial}): ${
        combinedSnippets || "unable to parse snippets"
      }`
    );
  } else {
    contextParts.push(
      "Social: No live mentions fetched; rely on on-chain momentum and general sentiment keywords."
    );
  }

  contextParts.push(
    "Guidance: Prioritize meme/retail sentiment. If context is thin, lower confidence to 70-75."
  );

  return {
    context: contextParts.join("\n"),
    onchain,
    social: {
      entries: socialMentions,
      twitterEntries: twitterMentions,
      total: totalSocial,
    },
    watchlistHit,
  };
}

export async function buildTokenContext(
  token: PulseGlobalToken,
  args: TokenContextBuilderArgs
): Promise<string> {
  const enhanced = await buildEnhancedGrokContext(token, args);
  return enhanced.context;
}

async function fetchDexscreenerSnapshot(
  token: PulseGlobalToken,
  args: GlobalTokenSourceArgs
): Promise<OnchainSnapshot | null> {
  const baseUrl =
    args.dexscreenerBaseUrl?.trim() ?? "https://api.dexscreener.com/latest/dex";
  const headers: Record<string, string> = { accept: "application/json" };
  if (args.dexscreenerApiKey) {
    headers["x-api-key"] = args.dexscreenerApiKey;
  }

  try {
    const res = await fetch(`${baseUrl}/tokens/${token.address}`, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      console.warn(
        `[grokPulse] DexScreener detail failed: ${res.status} ${res.statusText}`
      );
      return null;
    }

    const data = await res.json().catch(() => null);
    const pairs = Array.isArray(data?.pairs)
      ? (data.pairs as DexscreenerPairWithMetrics[])
      : [];
    if (!pairs.length) return null;

    const primary = pairs.reduce(
      (
        best: DexscreenerPairWithMetrics,
        current: DexscreenerPairWithMetrics
      ): DexscreenerPairWithMetrics => {
        const bestLiq = Number(best?.liquidity?.usd ?? 0);
        const liq = Number(current?.liquidity?.usd ?? 0);
        return liq > bestLiq ? current : best;
      }
    );

    if (!primary) return null;

    return {
      priceUsd: toNumber(primary.priceUsd),
      volume24hUsd: toNumber(primary.volume?.h24 ?? primary.txns?.h24?.volumeUSD),
      liquidityUsd: toNumber(primary.liquidity?.usd),
      priceChange24hPct: toNumber(primary.priceChange?.h24 ?? primary.priceChange24h),
      source: "dexscreener",
    };
  } catch (error) {
    console.warn("[grokPulse] DexScreener detail error", error);
    return null;
  }
}

async function fetchBirdeyeSnapshot(
  token: PulseGlobalToken,
  args: GlobalTokenSourceArgs
): Promise<OnchainSnapshot | null> {
  const baseUrl = args.birdeyeBaseUrl?.trim() ?? "https://public-api.birdeye.so";
  const headers: Record<string, string> = { accept: "application/json" };
  if (args.birdeyeApiKey) {
    headers["x-api-key"] = args.birdeyeApiKey;
  }

  const url = `${baseUrl}/public/token?address=${encodeURIComponent(token.address)}`;

  try {
    const res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      console.warn(`[grokPulse] Birdeye detail failed: ${res.status}`);
      return null;
    }

    const data = await res.json().catch(() => null);
    const tokenData = data?.data ?? {};

    return {
      priceUsd: toNumber(tokenData.price ?? tokenData.value ?? tokenData.priceUsd),
      volume24hUsd: toNumber(
        tokenData.v24hUSD ?? tokenData.v24h ?? tokenData.volume24hUsd
      ),
      liquidityUsd: toNumber(tokenData.liquidity ?? tokenData.liquidityUsd),
      priceChange24hPct: toNumber(
        tokenData.priceChange24hPercent ?? tokenData.priceChange24hPct
      ),
      source: "birdeye",
    };
  } catch (error) {
    console.warn("[grokPulse] Birdeye detail error", error);
    return null;
  }
}

async function fetchSocialMentions(
  token: PulseGlobalToken,
  args: TokenContextBuilderArgs
): Promise<SocialContextEntry[]> {
  const baseUrl = args.socialBaseUrl?.trim();
  if (!baseUrl) return [];

  const headers: Record<string, string> = { accept: "application/json" };
  if (args.socialApiKey) {
    headers["authorization"] = `Bearer ${args.socialApiKey}`;
  }

  const url = new URL("/v1/search", baseUrl);
  url.searchParams.set("symbol", sanitizeSymbol(token.symbol));
  url.searchParams.set("address", token.address);
  url.searchParams.set("limit", String(MAX_SOCIAL_ENTRIES));

  try {
    const res = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.warn(
        `[grokPulse] Social context failed: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const data = await res.json().catch(() => null);
    const results = Array.isArray(data?.results) ? data.results : [];

    const normalized = results
      .map((entry: unknown): SocialContextEntry | null => normalizeSocialEntry(entry))
      .filter(
        (entry: SocialContextEntry | null): entry is SocialContextEntry =>
          Boolean(entry?.text)
      );

    return normalized;
  } catch (error) {
    console.warn("[grokPulse] Social context error", error);
    return [];
  }
}

async function fetchTwitterMentions(
  token: PulseGlobalToken,
  args: TokenContextBuilderArgs
): Promise<SocialContextEntry[]> {
  const baseUrl = args.twitterBaseUrl?.trim();
  if (!baseUrl) return [];

  const headers: Record<string, string> = { accept: "application/json" };
  if (args.twitterApiKey) {
    headers["authorization"] = `Bearer ${args.twitterApiKey}`;
  }

  const url = new URL("/v1/twitter/search", baseUrl);
  url.searchParams.set("symbol", sanitizeSymbol(token.symbol));
  url.searchParams.set("address", token.address);
  url.searchParams.set("limit", String(MAX_SOCIAL_ENTRIES));

  try {
    const res = await fetch(url.toString(), {
      headers,
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      console.warn(
        `[grokPulse] Twitter context failed: ${res.status} ${res.statusText}`
      );
      return [];
    }

    const data = await res.json().catch(() => null);
    const results = Array.isArray(data?.results) ? data.results : [];

    const normalized = results
      .map((entry: unknown): SocialContextEntry | null => normalizeSocialEntry(entry))
      .filter(
        (entry: SocialContextEntry | null): entry is SocialContextEntry =>
          Boolean(entry?.text)
      );

    return normalized;
  } catch (error) {
    console.warn("[grokPulse] Twitter context error", error);
    return [];
  }
}

function normalizeSocialEntry(input: unknown): SocialContextEntry | null {
  const text =
    (input as { text?: unknown })?.text ??
    (input as { snippet?: unknown })?.snippet ??
    (input as { summary?: unknown })?.summary;

  const score = (input as { score?: unknown })?.score;
  if (typeof text !== "string" || text.trim().length === 0) return null;

  return { text: text.trim(), score: typeof score === "number" ? score : undefined };
}

function formatSocialEntry(entry: SocialContextEntry): string {
  const truncated = truncate(entry.text, MAX_SNIPPET_LENGTH);
  if (typeof entry.score === "number") {
    return `${truncated} (score:${entry.score.toFixed(2)})`;
  }
  return truncated;
}

function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

function toNumber(value: unknown): number | undefined {
  const num = typeof value === "string" ? Number(value) : (value as number);
  if (!Number.isFinite(num)) return undefined;
  return num;
}

function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toFixed(0);
}

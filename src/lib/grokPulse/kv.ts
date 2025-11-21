import { kv } from "@vercel/kv";
import type {
  GrokSentimentHistoryEntry,
  GrokSentimentSnapshot,
  PulseDeltaEvent,
  PulseGlobalToken,
  PulseMetaLastRun,
} from "./types";

const CONTEXT_TTL_SECONDS = 20 * 60; // 20 minutes
const WATCHLIST_TTL_SECONDS = 15 * 60; // 15 minutes

const SNAPSHOT_TTL_SECONDS = 2700; // 45 minutes
const HISTORY_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const GLOBAL_LIST_TTL_SECONDS = 30 * 60; // 30 minutes

export async function getCurrentSnapshot(
  address: string
): Promise<GrokSentimentSnapshot | null> {
  if (!address) return null;
  const snapshot = await kv.get<GrokSentimentSnapshot>(`sentiment:${address}`);
  return snapshot ?? null;
}

export async function setCurrentSnapshot(
  address: string,
  snapshot: GrokSentimentSnapshot
): Promise<void> {
  await kv.set(`sentiment:${address}`, snapshot, { ex: SNAPSHOT_TTL_SECONDS });
}

export async function cacheTokenContext(
  address: string,
  context: string
): Promise<void> {
  await kv.set(`sentiment:context:${address}`, context, { ex: CONTEXT_TTL_SECONDS });
}

export async function getCachedTokenContext(
  address: string
): Promise<string | null> {
  const cached = await kv.get<string | null>(`sentiment:context:${address}`);
  return cached ?? null;
}

export async function getHistory(
  address: string
): Promise<GrokSentimentHistoryEntry[]> {
  if (!address) return [];
  const history = await kv.get<GrokSentimentHistoryEntry[] | null>(
    `sentiment:history:${address}`
  );
  return history ?? [];
}

export async function appendHistory(
  address: string,
  entry: GrokSentimentHistoryEntry,
  maxEntries = 50
): Promise<void> {
  const history = await getHistory(address);
  const nextHistory = [...history, entry];
  const trimmed =
    nextHistory.length > maxEntries
      ? nextHistory.slice(nextHistory.length - maxEntries)
      : nextHistory;

  await kv.set(`sentiment:history:${address}`, trimmed, {
    ex: HISTORY_TTL_SECONDS,
  });
}

export async function setPulseMetaLastRun(meta: PulseMetaLastRun): Promise<void> {
  await kv.set("pulse:meta:last_run", meta);
}

export async function getPulseMetaLastRun(): Promise<PulseMetaLastRun | null> {
  const meta = await kv.get<PulseMetaLastRun | null>("pulse:meta:last_run");
  return meta ?? null;
}

export async function setPulseGlobalList(
  tokens: PulseGlobalToken[]
): Promise<void> {
  await kv.set("pulse:global_list", tokens, { ex: GLOBAL_LIST_TTL_SECONDS });
}

export async function getPulseGlobalList(): Promise<PulseGlobalToken[]> {
  const list = await kv.get<PulseGlobalToken[] | null>("pulse:global_list");
  return list ?? [];
}

export async function setWatchlistTokens(tokens: PulseGlobalToken[]): Promise<void> {
  await kv.set("pulse:watchlist:tokens", tokens, { ex: WATCHLIST_TTL_SECONDS });
}

export async function getWatchlistTokens(): Promise<PulseGlobalToken[]> {
  const tokens = await kv.get<PulseGlobalToken[] | null>("pulse:watchlist:tokens");
  return tokens ?? [];
}

export async function pushDeltaEvent(event: PulseDeltaEvent): Promise<void> {
  await kv.rpush("pulse:events:queue", event);
}

export async function getAndIncrementDailyCallCounter(): Promise<number> {
  const today = new Date().toISOString().slice(0, 10);
  const key = `pulse:meta:daily_calls:${today}`;
  const count = await kv.incr(key);
  if (count === 1) {
    await kv.expire(key, 48 * 60 * 60);
  }
  return count;
}

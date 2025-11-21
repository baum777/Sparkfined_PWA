import { kv } from "@vercel/kv";

import type {
  GrokSentimentHistoryEntry,
  GrokSentimentSnapshot,
  PulseDeltaEvent,
  PulseGlobalToken,
  PulseMetaLastRun,
} from "./types";

const SENTIMENT_TTL_SECONDS = 45 * 60; // 45 minutes
const HISTORY_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const GLOBAL_LIST_TTL_SECONDS = 30 * 60; // 30 minutes

export async function getCurrentSnapshot(
  address: string
): Promise<GrokSentimentSnapshot | null> {
  const snapshot = await kv.get<GrokSentimentSnapshot | null>(`sentiment:${address}`);
  return snapshot ?? null;
}

export async function setCurrentSnapshot(
  address: string,
  snapshot: GrokSentimentSnapshot
) {
  await kv.set(`sentiment:${address}`, snapshot, { ex: SENTIMENT_TTL_SECONDS });
}

export async function getHistory(address: string): Promise<GrokSentimentHistoryEntry[]> {
  const history = await kv.get<GrokSentimentHistoryEntry[] | null>(`sentiment:history:${address}`);
  return history ?? [];
}

export async function appendHistory(
  address: string,
  entry: GrokSentimentHistoryEntry,
  maxEntries = 50
) {
  const history = await getHistory(address);
  const nextHistory = [...history, entry].slice(-maxEntries);
  await kv.set(`sentiment:history:${address}`, nextHistory, { ex: HISTORY_TTL_SECONDS });
}

export async function setPulseMetaLastRun(meta: PulseMetaLastRun) {
  await kv.set("pulse:meta:last_run", meta);
}

export async function getPulseMetaLastRun(): Promise<PulseMetaLastRun | null> {
  const meta = await kv.get<PulseMetaLastRun | null>("pulse:meta:last_run");
  return meta ?? null;
}

export async function setPulseGlobalList(tokens: PulseGlobalToken[]) {
  await kv.set("pulse:global_list", tokens, { ex: GLOBAL_LIST_TTL_SECONDS });
}

export async function getPulseGlobalList(): Promise<PulseGlobalToken[]> {
  const tokens = await kv.get<PulseGlobalToken[] | null>("pulse:global_list");
  return tokens ?? [];
}

export async function pushDeltaEvent(event: PulseDeltaEvent) {
  await kv.lpush("pulse:events:queue", event);
}

export async function getAndIncrementDailyCallCounter(): Promise<number> {
  const dateKey = new Date().toISOString().slice(0, 10);
  const key = `pulse:meta:daily_calls:${dateKey}`;
  const current = await kv.incr(key);
  if (current === 1) {
    await kv.expire(key, 48 * 60 * 60);
  }
  return current;
}

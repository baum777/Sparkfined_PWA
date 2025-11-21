import { fetchAndValidateGrokSentiment } from "./grokClient";
import {
  appendHistory,
  getAndIncrementDailyCallCounter,
  getCurrentSnapshot,
  getHistory,
  pushDeltaEvent,
  setCurrentSnapshot,
  setPulseGlobalList,
  setPulseMetaLastRun,
} from "./kv";
import { buildGlobalTokenList } from "./sources";
import type { GrokSentimentSnapshot, PulseRunResult } from "./types";

export const MAX_CONCURRENCY = 20;
export const MAX_GROK_CALLS_PER_RUN = 150;
export const MAX_DAILY_GROK_CALLS = Number(process.env.MAX_DAILY_GROK_CALLS ?? "900");
export const DELTA_THRESHOLD = 30;

export async function runGrokPulseCron(): Promise<PulseRunResult> {
  const tokens = await buildGlobalTokenList({});
  await setPulseGlobalList(tokens);

  let success = 0;
  let failed = 0;
  let totalCalls = 0;
  let skippedByDailyCap = 0;
  let tokensProcessed = 0;

  const runTs = Math.floor(Date.now() / 1000);

  const initialDailyCount = await getAndIncrementDailyCallCounter();
  if (initialDailyCount > MAX_DAILY_GROK_CALLS) {
    await setPulseMetaLastRun({ ts: runTs, success, failed, total_calls: totalCalls });
    return { success, failed, totalCalls, skippedByDailyCap: tokens.length, tokensProcessed };
  }

  const processToken = async (token: { address: string; symbol: string }) => {
    if (totalCalls >= MAX_GROK_CALLS_PER_RUN) {
      skippedByDailyCap++;
      return;
    }

    const currentDailyCount = await getAndIncrementDailyCallCounter();
    if (currentDailyCount > MAX_DAILY_GROK_CALLS) {
      skippedByDailyCap++;
      return;
    }

    let snapshot: GrokSentimentSnapshot | null = null;
    try {
      snapshot = await fetchAndValidateGrokSentiment({
        symbol: token.symbol,
        address: token.address,
        context: "CT sentiment scan + onchain momentum", // TODO: enrich with real context
      });
    } catch (error) {
      console.error("[grokPulse] Unexpected error during Grok fetch", error);
    }

    totalCalls++;
    tokensProcessed++;

    if (!snapshot) {
      failed++;
      // TODO: Implement keyword-based fallback snapshot
      return;
    }

    const previousSnapshot = await getCurrentSnapshot(token.address);
    const history = await getHistory(token.address);
    const lastHistoryEntry = history.length ? history[history.length - 1] : undefined;
    const previousScore = previousSnapshot?.score ?? (lastHistoryEntry ? lastHistoryEntry.score : null);

    if (previousScore !== null) {
      const delta = snapshot.score - previousScore;
      snapshot.delta = delta;
      if (Math.abs(delta) >= DELTA_THRESHOLD) {
        await pushDeltaEvent({
          address: token.address,
          symbol: token.symbol,
          previousScore,
          newScore: snapshot.score,
          delta,
          ts: snapshot.ts,
        });
      }
    }

    await setCurrentSnapshot(token.address, snapshot);
    await appendHistory(token.address, { ts: snapshot.ts, score: snapshot.score });
    success++;
  };

  for (let i = 0; i < tokens.length; i += MAX_CONCURRENCY) {
    const batch = tokens.slice(i, i + MAX_CONCURRENCY);
    await Promise.all(batch.map((token) => processToken(token)));
  }

  await setPulseMetaLastRun({ ts: runTs, success, failed, total_calls: totalCalls });

  return { success, failed, totalCalls, skippedByDailyCap, tokensProcessed };
}

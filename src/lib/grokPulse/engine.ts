import {
  appendHistory,
  getAndIncrementDailyCallCounter,
  getCurrentSnapshot,
  getHistory,
  getWatchlistTokens,
  pushDeltaEvent,
  setCurrentSnapshot,
  setPulseGlobalList,
  setPulseMetaLastRun,
} from "./kv";
import { buildGlobalTokenList } from "./sources";
import { fetchAndValidateGrokSentiment } from "./grokClient";
import { buildEnhancedGrokContext } from "./contextBuilder";
import type { PulseRunResult } from "./types";
import { buildKeywordSentimentFallback } from "./sentimentFallback";

const MAX_CONCURRENCY = 20;
const MAX_GROK_CALLS_PER_RUN = 150;
const MAX_DAILY_GROK_CALLS = Number(process.env.MAX_DAILY_GROK_CALLS ?? "900");
const DELTA_THRESHOLD = 30;

export async function runGrokPulseCron(): Promise<PulseRunResult> {
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

  const tokens = await buildGlobalTokenList(sourceArgs, MAX_GROK_CALLS_PER_RUN);
  await setPulseGlobalList(tokens);

  let watchlistTokens = [] as Awaited<ReturnType<typeof getWatchlistTokens>>;
  try {
    watchlistTokens = await getWatchlistTokens();
  } catch (error) {
    console.warn("[grokPulse] failed to load watchlist tokens", error);
    watchlistTokens = [];
  }

  let success = 0;
  let failed = 0;
  let totalCalls = 0;
  let skippedByDailyCap = 0;
  let tokensProcessed = 0;

  let dailyCounter = await getAndIncrementDailyCallCounter();
  if (dailyCounter > MAX_DAILY_GROK_CALLS) {
    return {
      success,
      failed,
      totalCalls,
      skippedByDailyCap: tokens.length,
      tokensProcessed,
    };
  }

  let abortProcessing = false;

  for (let i = 0; i < tokens.length && !abortProcessing; i += MAX_CONCURRENCY) {
    const batch = tokens.slice(i, i + MAX_CONCURRENCY);
    await Promise.all(
      batch.map(async (token, batchIndex) => {
        if (abortProcessing) return;

        const globalIndex = i + batchIndex;
        const remaining = tokens.length - globalIndex;

        if (totalCalls >= MAX_GROK_CALLS_PER_RUN) {
          skippedByDailyCap += remaining;
          abortProcessing = true;
          return;
        }

        if (dailyCounter >= MAX_DAILY_GROK_CALLS) {
          skippedByDailyCap += remaining;
          abortProcessing = true;
          return;
        }

        try {
          dailyCounter = await getAndIncrementDailyCallCounter();
        } catch (error) {
          console.error("[grokPulse] failed to increment daily counter", error);
          failed += 1;
          return;
        }

        if (dailyCounter > MAX_DAILY_GROK_CALLS) {
          skippedByDailyCap += remaining;
          abortProcessing = true;
          return;
        }

        totalCalls += 1;
        tokensProcessed += 1;

        try {
          const context = await buildEnhancedGrokContext(token, {
            ...sourceArgs,
            ...socialArgs,
            watchlistTokens,
          }).catch((error) => {
            console.warn("[grokPulse] context builder failed", error);
            return {
              context: `Token: ${token.symbol} (${token.address})\nNo live context; return low confidence score.`,
              onchain: null,
              social: { entries: [], twitterEntries: [], total: 0 },
              watchlistHit: false,
            };
          });

          const snapshot =
            (await fetchAndValidateGrokSentiment({
              symbol: token.symbol,
              address: token.address,
              context: context.context,
            })) ?? buildKeywordSentimentFallback(token, context.context);

          const previousSnapshot = await getCurrentSnapshot(token.address);
          const history = previousSnapshot ? [] : await getHistory(token.address);
          const previousScore = previousSnapshot
            ? previousSnapshot.score
            : history.at(-1)?.score ?? null;

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
          await appendHistory(token.address, {
            ts: snapshot.ts,
            score: snapshot.score,
          });

          success += 1;
        } catch (error) {
          console.error("[grokPulse] failed to process token", token.address, error);
          failed += 1;
        }
      })
    );
  }

  const lastRunTs = Math.floor(Date.now() / 1000);
  await setPulseMetaLastRun({
    ts: lastRunTs,
    success,
    failed,
    total_calls: totalCalls,
  });

  return { success, failed, totalCalls, skippedByDailyCap, tokensProcessed };
}

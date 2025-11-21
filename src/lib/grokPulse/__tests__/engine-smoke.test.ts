import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { runGrokPulseCron } from "../engine";
import type { GrokSentimentSnapshot, PulseGlobalToken } from "../types";
import * as kv from "../kv";
import * as sources from "../sources";
import * as grokClient from "../grokClient";
import * as contextBuilder from "../contextBuilder";

type MockFn = ReturnType<typeof vi.fn>;

vi.mock("../kv", () => {
  const setPulseGlobalList = vi.fn();
  const setCurrentSnapshot = vi.fn();
  const appendHistory = vi.fn();
  const pushDeltaEvent = vi.fn();
  const setPulseMetaLastRun = vi.fn();
  const getCurrentSnapshot = vi.fn();
  const getHistory = vi.fn();
  const getAndIncrementDailyCallCounter = vi.fn();

  return {
    setPulseGlobalList,
    setCurrentSnapshot,
    appendHistory,
    pushDeltaEvent,
    setPulseMetaLastRun,
    getCurrentSnapshot,
    getHistory,
    getAndIncrementDailyCallCounter,
  };
});

vi.mock("../sources", () => {
  const buildGlobalTokenList = vi.fn();
  return { buildGlobalTokenList };
});

vi.mock("../grokClient", () => {
  const fetchAndValidateGrokSentiment = vi.fn();
  return { fetchAndValidateGrokSentiment };
});

vi.mock("../contextBuilder", () => {
  const buildTokenContext = vi.fn();
  return { buildTokenContext };
});

describe("grokPulse engine smoke test", () => {
  const tokens: PulseGlobalToken[] = [
    { address: "addrA", symbol: "AAA" },
    { address: "addrB", symbol: "BBB" },
  ];

  const snapshot: GrokSentimentSnapshot = {
    score: 75,
    label: "BULL",
    confidence: 90,
    one_liner: "good",
    top_snippet: "context",
    cta: "WATCH",
    validation_hash: "hash",
    ts: 1700000000,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (sources.buildGlobalTokenList as MockFn).mockResolvedValue(tokens);
    (grokClient.fetchAndValidateGrokSentiment as MockFn).mockResolvedValue(
      snapshot
    );
    (contextBuilder.buildTokenContext as MockFn).mockResolvedValue("ctx");

    let counter = 0;
    (kv.getAndIncrementDailyCallCounter as MockFn).mockImplementation(
      async () => counter++
    );
    (kv.getCurrentSnapshot as MockFn).mockResolvedValue(null);
    (kv.getHistory as MockFn).mockResolvedValue([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test("runGrokPulseCron writes snapshots, history, and meta", async () => {
    const result = await runGrokPulseCron();

    expect(sources.buildGlobalTokenList).toHaveBeenCalledTimes(1);
    expect(kv.setPulseGlobalList).toHaveBeenCalledWith(tokens);

    expect(contextBuilder.buildTokenContext).toHaveBeenCalledTimes(tokens.length);

    expect(grokClient.fetchAndValidateGrokSentiment).toHaveBeenCalledTimes(
      tokens.length
    );
    expect(kv.setCurrentSnapshot).toHaveBeenCalledTimes(tokens.length);
    expect(kv.appendHistory).toHaveBeenCalledTimes(tokens.length);
    expect(kv.pushDeltaEvent).not.toHaveBeenCalled();

    expect(kv.setPulseMetaLastRun).toHaveBeenCalledTimes(1);
    expect(kv.setPulseMetaLastRun).toHaveBeenCalledWith(
      expect.objectContaining({
        success: tokens.length,
        failed: 0,
        total_calls: tokens.length,
      })
    );

    expect(result).toEqual({
      success: tokens.length,
      failed: 0,
      totalCalls: tokens.length,
      skippedByDailyCap: 0,
      tokensProcessed: tokens.length,
    });
  });
});

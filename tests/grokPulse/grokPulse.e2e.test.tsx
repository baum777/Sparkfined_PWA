import React from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import type { GrokSentimentSnapshot } from "@/lib/grokPulse/types";
import "@testing-library/jest-dom";

vi.mock("@vercel/kv", () => {
  const kvMock = {
    get: vi.fn(),
    set: vi.fn(),
    rpush: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
  };

  return { kv: kvMock };
});

import cronHandler from "../../api/grok-pulse/cron";
import stateHandler from "../../api/grok-pulse/state";
import * as engine from "../../src/lib/grokPulse/engine";
import * as kv from "../../src/lib/grokPulse/kv";
import type { PulseGlobalToken } from "../../src/lib/grokPulse/types";
import WatchlistDetailPanel from "@/components/watchlist/WatchlistDetailPanel";
import { useWatchlistStore } from "@/store/watchlistStore";
import type { SolanaMemeTrendEvent } from "@/types/events";
import { act } from "@testing-library/react";

const initialWatchlistState = useWatchlistStore.getState();

const resetWatchlist = () => {
  useWatchlistStore.setState({
    rows: initialWatchlistState.rows,
    isLoading: initialWatchlistState.isLoading,
    error: null,
    trends: {},
  });
};

const sampleSnapshot: GrokSentimentSnapshot = {
  score: 82,
  label: "BULL",
  confidence: 91,
  one_liner: "Momentum building",
  top_snippet: "Fresh social traction with solid bids",
  cta: "WATCH",
  validation_hash: "hash",
  ts: 1_700_000_000,
};

const sampleTokens: PulseGlobalToken[] = [
  { address: "addr-a", symbol: "AAA" },
  { address: "addr-b", symbol: "BBB" },
];

const sampleTrendEvent: SolanaMemeTrendEvent = {
  type: "SolanaMemeTrendEvent",
  id: "evt-1",
  source: {
    platform: "x",
    tweetId: "123",
    tweetUrl: "https://x.com/t/123",
    importedAt: new Date().toISOString(),
  },
  author: {
    handle: "tester",
    authorType: "human",
    followers: 42000,
    verified: true,
  },
  tweet: {
    createdAt: new Date().toISOString(),
    fullText: "SOLUSDT getting bullish across CT",
    language: "en",
    cashtags: ["SOLUSDT"],
    hashtags: ["SOL"],
    hasMedia: false,
    hasLinks: false,
    metrics: { likes: 10, replies: 2, reposts: 3, quotes: 1 },
  },
  token: {
    symbol: "SOLUSDT",
    cashtag: "SOL",
    chain: "solana",
    contractAddress: "So11111111111111111111111111111111111111112",
  },
  market: {
    priceUsd: 98.4,
    priceChange24hPct: 1.3,
    volume24hUsd: 1_000_000,
  },
  sentiment: {
    label: "bullish",
    score: 0.82,
    confidence: 0.9,
    hypeLevel: "high",
  },
  trading: {
    hypeLevel: "high",
    callToAction: "buy",
  },
  sparkfined: {
    trendingScore: 0.77,
    alertRelevance: 0.65,
    callToAction: "buy",
  },
  derived: {
    normalizedSymbol: "SOLUSDT",
    primaryCashtag: "SOL",
    lastUpdated: new Date().toISOString(),
    snippet: "SOL sentiment is ripping",
    latestTweetUrl: "https://x.com/t/123",
  },
  receivedAt: new Date().toISOString(),
};

describe("Grok Pulse cron handler", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test("triggers engine when bearer secret matches", async () => {
    vi.stubEnv("PULSE_CRON_SECRET", "top-secret");

    const cronSpy = vi.spyOn(engine, "runGrokPulseCron").mockResolvedValue({
      success: 2,
      failed: 0,
      totalCalls: 2,
      skippedByDailyCap: 0,
      tokensProcessed: 2,
    });

    const req = new Request("http://localhost/api/grok-pulse/cron", {
      headers: { authorization: "Bearer top-secret" },
    });

    const res = await cronHandler(req);
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, success: 2, tokensProcessed: 2 });
    expect(cronSpy).toHaveBeenCalledTimes(1);
  });

  test("rejects missing or invalid cron secret", async () => {
    vi.stubEnv("PULSE_CRON_SECRET", "expected");
    const cronSpy = vi.spyOn(engine, "runGrokPulseCron").mockResolvedValue({
      success: 0,
      failed: 0,
      totalCalls: 0,
      skippedByDailyCap: 0,
      tokensProcessed: 0,
    });

    const req = new Request("http://localhost/api/grok-pulse/cron", {
      headers: { authorization: "Bearer wrong" },
    });

    const res = await cronHandler(req);
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(401);
    expect(body).toMatchObject({ ok: false, error: "Unauthorized" });
    expect(cronSpy).not.toHaveBeenCalled();
  });

  test("returns failure payload when engine throws", async () => {
    vi.stubEnv("PULSE_CRON_SECRET", "secret");
    vi
      .spyOn(engine, "runGrokPulseCron")
      .mockRejectedValue(new Error("engine offline"));

    const req = new Request("http://localhost/api/grok-pulse/cron", {
      headers: { authorization: "Bearer secret" },
    });

    const res = await cronHandler(req);
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(500);
    expect(body).toMatchObject({ ok: false, error: "Cron execution failed" });
  });
});

describe("Grok Pulse state endpoint", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("returns snapshots, history, and metadata for all global tokens", async () => {
    vi.spyOn(kv, "getPulseGlobalList").mockResolvedValue(sampleTokens);
    vi.spyOn(kv, "getCurrentSnapshot").mockResolvedValue(sampleSnapshot);
    vi.spyOn(kv, "getHistory").mockResolvedValue([{ ts: 1_699_999_999, score: 74 }]);
    vi
      .spyOn(kv, "getPulseMetaLastRun")
      .mockResolvedValue({ ts: 1_700_000_123, success: 2, failed: 0, total_calls: 2 });

    const res = await stateHandler(
      new Request("http://localhost/api/grok-pulse/state")
    );
    const body = (await res.json()) as Record<string, any>;

    expect(res.status).toBe(200);
    expect(Object.keys(body.sentimentsByAddress)).toEqual(
      sampleTokens.map((token) => token.address)
    );
    expect(body.sentimentsByAddress["addr-a"]).toMatchObject({
      score: 82,
      label: "BULL",
    });
    expect(body.historyByAddress["addr-a"]).toHaveLength(1);
    expect(body.lastPulseTs).toBe(1_700_000_123);
  });

  test("gracefully handles KV read failures per address", async () => {
    vi.spyOn(kv, "getPulseGlobalList").mockResolvedValue([sampleTokens[0]]);
    vi
      .spyOn(kv, "getCurrentSnapshot")
      .mockRejectedValue(new Error("kv unavailable"));
    vi.spyOn(kv, "getHistory").mockRejectedValue(new Error("kv unavailable"));
    vi.spyOn(kv, "getPulseMetaLastRun").mockResolvedValue(null);

    const res = await stateHandler(
      new Request("http://localhost/api/grok-pulse/state")
    );
    const body = (await res.json()) as Record<string, any>;

    expect(res.status).toBe(200);
    expect(body.sentimentsByAddress["addr-a"]).toBeNull();
    expect(body.historyByAddress["addr-a"]).toEqual([]);
    expect(body.lastPulseTs).toBeNull();
  });
});

describe("Client live sentiment and price updates", () => {
  beforeEach(() => {
    resetWatchlist();
  });

  afterEach(() => {
    cleanup();
    resetWatchlist();
  });

  const PriceAndTrendProbe = () => {
    const row = useWatchlistStore((state) =>
      state.rows.find((candidate) => candidate.symbol === "SOLUSDT")
    );
    const trend = useWatchlistStore((state) => state.trends["SOLUSDT"]);

    return (
      <div>
        <div data-testid="price">{row?.price}</div>
        <div data-testid="change">{row?.change24h}</div>
        <WatchlistDetailPanel row={row} trend={trend} />
      </div>
    );
  };

  test("polling updates propagate price and change into the watchlist", () => {
    render(<PriceAndTrendProbe />);

    expect(screen.getByTestId("price").textContent).toBe("$98.42");
    expect(screen.getByTestId("change").textContent).toBe("-0.8%");

    act(() => {
      useWatchlistStore
        .getState()
        .updateLivePrice("SOLUSDT", 120.5, 2.4);
    });

    expect(screen.getByTestId("price").textContent).toBe("$120.50");
    expect(screen.getByTestId("change").textContent).toBe("+2.4%");
  });

  test("incoming Grok sentiment events render in client panels", () => {
    render(<PriceAndTrendProbe />);

    expect(
      screen.getByText(
        /No recent social trend signals yet\. When Grok spots movement, you’ll see it here\./i
      )
    ).toBeInTheDocument();

    act(() => {
      useWatchlistStore.getState().updateTrendFromEvent(sampleTrendEvent);
    });

    expect(screen.getByText(/Social trend/i)).toBeInTheDocument();
    expect(screen.getByText(/bullish/i)).toBeInTheDocument();
    expect(screen.getByText(/CTA: buy/i)).toBeInTheDocument();
    expect(screen.getByText(/Hype: high/i)).toBeInTheDocument();
  });
});

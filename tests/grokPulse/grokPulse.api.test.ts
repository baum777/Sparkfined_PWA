import { afterEach, describe, expect, test, vi } from "vitest";
import contextHandler from "../../api/grok-pulse/context";
import sentimentHandler from "../../api/grok-pulse/sentiment";
import * as kv from "../../src/lib/grokPulse/kv";
import * as contextBuilder from "../../src/lib/grokPulse/contextBuilder";
import * as grokClient from "../../src/lib/grokPulse/grokClient";
import type { GrokSentimentSnapshot } from "../../src/lib/grokPulse/types";

vi.mock("../../src/lib/grokPulse/kv", () => ({
  getPulseGlobalList: vi.fn().mockResolvedValue([]),
  getWatchlistTokens: vi.fn().mockResolvedValue([]),
  getCachedTokenContext: vi.fn().mockResolvedValue(null),
  cacheTokenContext: vi.fn().mockResolvedValue(undefined),
  appendHistory: vi.fn().mockResolvedValue(undefined),
  setCurrentSnapshot: vi.fn().mockResolvedValue(undefined),
  getCurrentSnapshot: vi.fn().mockResolvedValue(null),
  getHistory: vi.fn().mockResolvedValue([]),
  getPulseMetaLastRun: vi.fn().mockResolvedValue(null),
}));

describe("grok-pulse API handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  test("context handler builds and caches context", async () => {
    vi
      .spyOn(contextBuilder, "buildEnhancedGrokContext")
      .mockResolvedValue({
        context: "Token: BONK\nOn-chain...",
        onchain: null,
        social: { total: 0, entries: [], twitterEntries: [] },
        watchlistHit: false,
      });

    const res = await contextHandler(
      new Request("http://localhost/api/grok-pulse/context?address=addr&symbol=bonk")
    );
    const body = (await res.json()) as Record<string, unknown>;

    expect(res.status).toBe(200);
    expect(body).toMatchObject({ ok: true, context: expect.stringContaining("BONK") });
    expect(kv.cacheTokenContext).toHaveBeenCalledWith("addr", expect.any(String));
  });

  test("sentiment handler stores grok snapshot", async () => {
    const snapshot: GrokSentimentSnapshot = {
      score: 10,
      label: "BULL",
      confidence: 80,
      one_liner: "ok",
      top_snippet: "ctx",
      cta: "WATCH",
      validation_hash: "hash",
      ts: 1000,
    };

    vi.spyOn(contextBuilder, "buildEnhancedGrokContext").mockResolvedValue({
      context: "ctx",
      onchain: null,
      social: { total: 0, entries: [], twitterEntries: [] },
      watchlistHit: false,
    });
    vi.spyOn(grokClient, "fetchAndValidateGrokSentiment").mockResolvedValue(snapshot);

    const res = await sentimentHandler(
      new Request("http://localhost/api/grok-pulse/sentiment", {
        method: "POST",
        body: JSON.stringify({ address: "addr", symbol: "bonk" }),
      })
    );
    const body = (await res.json()) as Record<string, any>;

    expect(res.status).toBe(200);
    expect(body.snapshot).toMatchObject({ label: "BULL", score: 10 });
    expect(kv.setCurrentSnapshot).toHaveBeenCalledWith("addr", snapshot);
    expect(kv.appendHistory).toHaveBeenCalledWith("addr", {
      ts: snapshot.ts,
      score: snapshot.score,
    });
  });

  test("sentiment handler falls back when grok fails", async () => {
    vi.spyOn(contextBuilder, "buildEnhancedGrokContext").mockResolvedValue({
      context: "token hype and pump",
      onchain: null,
      social: { total: 1, entries: [], twitterEntries: [] },
      watchlistHit: false,
    });
    vi.spyOn(grokClient, "fetchAndValidateGrokSentiment").mockResolvedValue(null);

    const res = await sentimentHandler(
      new Request("http://localhost/api/grok-pulse/sentiment", {
        method: "POST",
        body: JSON.stringify({ address: "addr", symbol: "bonk" }),
      })
    );
    const body = (await res.json()) as Record<string, any>;

    expect(res.status).toBe(200);
    expect(body.snapshot.source).toBe("keyword_fallback");
    expect(body.snapshot.score).not.toBeNaN();
  });
});

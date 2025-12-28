import { describe, expect, test, vi } from "vitest";
import { buildKeywordSentimentFallback } from "../sentimentFallback";
import type { PulseGlobalToken } from "../types";

const token: PulseGlobalToken = { address: "addr1", symbol: "BONK" };

describe("keyword sentiment fallback", () => {
  test("maps bullish keywords to positive score and CTA", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-01-01T00:00:00Z"));

    const snapshot = buildKeywordSentimentFallback(
      token,
      "massive pump and moon setup with viral hype"
    );

    expect(snapshot.score).toBeGreaterThan(0);
    expect(snapshot.label).toBe("STRONG_BULL");
    expect(snapshot.cta).toBe("APE");
    expect(snapshot.source).toBe("keyword_fallback");
    expect(snapshot.ts).toBe(Math.floor(Date.now() / 1000));

    vi.useRealTimers();
  });

  test("handles bearish language with negative score", () => {
    const snapshot = buildKeywordSentimentFallback(
      token,
      "community calls rug and dump incoming"
    );

    expect(snapshot.score).toBeLessThan(0);
    expect(snapshot.label).toBe("BEAR");
    expect(snapshot.low_confidence).toBe(true);
  });
});

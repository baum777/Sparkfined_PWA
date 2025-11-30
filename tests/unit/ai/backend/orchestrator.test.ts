import { readFile } from "fs/promises";
import path from "path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AIOrchestrator, SANITY_WARNING, mergeJournalFields, validateBulletResponse } from "@/ai/backend/orchestrator.js";
import { withExponentialBackoff } from "@/ai/backend/retry.js";
import type { MarketPayload, SocialAnalysis } from "@/types/ai";

vi.mock("@/lib/ai/heuristics", () => ({
  sanityCheck: vi.fn((bullets: string[]) => bullets),
  computeBotScore: vi.fn(),
}));

import { sanityCheck } from "@/lib/ai/heuristics";

const sanityCheckMock = vi.mocked(sanityCheck);

beforeEach(() => {
  sanityCheckMock.mockReset();
  sanityCheckMock.mockImplementation((bullets: string[]) => bullets);
});

const fixturePath = path.resolve(process.cwd(), "tests", "unit", "ai", "backend", "fixtures", "btc_payload.json");

async function loadPayload(): Promise<MarketPayload> {
  const json = await readFile(fixturePath, "utf8");
  return JSON.parse(json) as MarketPayload;
}

describe("validateBulletResponse", () => {
  it("throws when bullet count outside bounds", () => {
    expect(() => validateBulletResponse({ bullets: ["a", "b", "c"] })).toThrow(/between 4 and 7/);
  });

  it("truncates bullets to 20 words", () => {
    const words = new Array(40).fill("wort").join(" ");
    const analysis = { bullets: [words, "ok", "ok2", "ok3"] };
    validateBulletResponse(analysis);
    const [firstBullet] = analysis.bullets;
    if (!firstBullet) {
      throw new Error("validateBulletResponse should retain at least one bullet");
    }
    expect(firstBullet.split(" ").length).toBeLessThanOrEqual(20);
  });
});

describe("withExponentialBackoff", () => {
  it("retries failing function until success", async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("ok");

    const result = await withExponentialBackoff(fn, {
      retries: 2,
      baseDelayMs: 10,
      jitter: 0,
      maxDelayMs: 10,
    });

    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(2);
  });
});

describe("AIOrchestrator", () => {
  it("merges market and social analysis when posts provided", async () => {
    const payload = await loadPayload();
    const orchestrator = new AIOrchestrator({
      openaiClient: {
        analyzeMarket: vi.fn(async () => ({
          provider: "openai",
          model: "test-mini",
          bullets: [
            "Marktstatus: Preis 58.200 USD, Support 57.000, Resistance 59.400.",
            "Momentum: RSI 62, SMA50 56k, SMA200 52k.",
            "Risiko: ATR14 1.8%, Vol 4.6%.",
            "Trades: Long 58.4k SL 57.6k TP1 60.2k.",
          ],
          source_trace: { price_source: "dexpaprika" },
        })),
      } as unknown as any,
      grokClient: {
        analyzeSocial: vi.fn(async () => ({
          provider: "grok",
          model: "grok-4-mini",
          mode: "newest",
          thesis: "Listing-Hype treibt kurzfristig Nachfrage.",
          bullets: ["Social: FOMO wegen neuem Listing."],
          sentiment: 0.6,
          confidence: 0.7,
          aggregates: { positive: 6, neutral: 2, negative: 2 },
          posts: [
            {
              id: "p1",
              text_snippet: "Bullische Diskussion",
              sentiment: 0.8,
              botScore: 0.2,
              isLikelyBot: false,
              reason_flags: ["verified_reduction"],
            },
          ],
          narrative_lore: "Solana-TV-Deal sorgt für Buzz.",
          source_trace: { social_provider: "xapi" },
          social_review_required: false,
        } satisfies SocialAnalysis)),
      } as unknown as any,
      random: () => 0,
    });

    const result = await orchestrator.generateAnalysis(payload, {
      posts: [
        {
          id: "p1",
          text: "Bullische Diskussion",
          created_at: "2025-11-11T10:00:00Z",
          source: "x",
          author: { id: "user123", followers: 120, created_at: "2020-01-01T00:00:00Z" },
        },
      ],
    });

    expect(result.marketAnalysis.bullets).toHaveLength(4);
    expect(result.socialAnalysis?.thesis).toContain("Listing-Hype");
    expect(result.meta.usedProviders).toEqual(["openai", "grok"]);
  });

  it("flags social review when Grok signals review", async () => {
    const payload = await loadPayload();
    const orchestrator = new AIOrchestrator({
      openaiClient: {
        analyzeMarket: vi.fn(async () => ({
          provider: "openai",
          model: "test-mini",
          bullets: [
            "Marktstatus: Preis 58.200 USD, Support 57.000, Resistance 59.400.",
            "Momentum: RSI 62, SMA50 56k, SMA200 52k.",
            "Risiko: ATR14 1.8%, Vol 4.6%.",
            "Trades: Long 58.4k SL 57.6k TP1 60.2k.",
          ],
          source_trace: { price_source: "dexpaprika" },
        })),
      } as unknown as any,
      grokClient: {
        analyzeSocial: vi.fn(async () => ({
          provider: "grok",
          model: "grok-4-mini",
          mode: "newest",
          thesis: "Unsichere Quellen dominieren.",
          bullets: ["Social: Viele Bots aktiv."],
          sentiment: -0.1,
          confidence: 0.4,
          aggregates: { positive: 2, neutral: 3, negative: 5 },
          posts: [],
          source_trace: { social_provider: "xapi" },
          social_review_required: true,
        } satisfies Partial<SocialAnalysis> as SocialAnalysis)),
      } as unknown as any,
      random: () => 0,
    });

    const result = await orchestrator.generateAnalysis(payload, {
      posts: [
        {
          id: "p1",
          text: "Signal: Buy now!",
          created_at: "2025-11-11T10:00:00Z",
          source: "x",
          author: { id: "user123", followers: 5, created_at: "2025-11-10T00:00:00Z" },
        },
      ],
    });

    expect(result.meta.warnings).toContain("social_analysis flagged for review");
    const merged = mergeJournalFields(result);
    expect(merged.social_review_required).toBe(true);
  });

  it("skips social analysis when sampling misses and includeSocial false", async () => {
    const payload = await loadPayload();
    const orchestrator = new AIOrchestrator({
      openaiClient: {
        analyzeMarket: vi.fn(async () => ({
          provider: "openai",
          model: "test-mini",
          bullets: [
            "Marktstatus: Preis 58.200 USD, Support 57.000, Resistance 59.400.",
            "Momentum: RSI 62, SMA50 56k, SMA200 52k.",
            "Risiko: ATR14 1.8%, Vol 4.6%.",
            "Trades: Long 58.4k SL 57.6k TP1 60.2k.",
          ],
          source_trace: { price_source: "dexpaprika" },
        })),
      } as unknown as any,
      grokClient: {
        analyzeSocial: vi.fn(),
      } as unknown as any,
      random: () => 0.99,
      socialSampleRate: 0.1,
    });

    const result = await orchestrator.generateAnalysis(payload, { posts: [] });
    expect(result.socialAnalysis).toBeUndefined();
  });

  it("handles missing bullet arrays without crashing or warnings", async () => {
    const payload = await loadPayload();
    const orchestrator = new AIOrchestrator({
      openaiClient: {
        analyzeMarket: vi.fn(async () => ({
          provider: "openai",
          model: "test-mini",
          bullets: undefined as unknown as string[],
          source_trace: { price_source: "dexpaprika" },
        })),
      } as unknown as any,
      grokClient: {
        analyzeSocial: vi.fn(),
      } as unknown as any,
      random: () => 1,
      socialSampleRate: 0,
    });

    const result = await orchestrator.generateAnalysis(payload, { posts: [] });
    expect(result.marketAnalysis.bullets).toEqual([]);
    expect(result.meta.warnings).not.toContain(SANITY_WARNING);
    expect(sanityCheckMock).toHaveBeenCalledWith([], expect.anything());
  });

  it("adds warning when sanityCheck modifies bullets", async () => {
    const payload = await loadPayload();
    const adjustedBullets = [
      "Trimmed Marktstatus.",
      "Trimmed Momentum.",
      "Trimmed Risiko.",
      "Trimmed Trades.",
    ];
    sanityCheckMock.mockImplementationOnce(() => adjustedBullets);

    const orchestrator = new AIOrchestrator({
      openaiClient: {
        analyzeMarket: vi.fn(async () => ({
          provider: "openai",
          model: "test-mini",
          bullets: [
            "Marktstatus: Preis 58.200 USD, Support 57.000, Resistance 59.400.",
            "Momentum: RSI 62, SMA50 56k, SMA200 52k.",
            "Risiko: ATR14 1.8%, Vol 4.6%.",
            "Trades: Long 58.4k SL 57.6k TP1 60.2k.",
          ],
          source_trace: { price_source: "dexpaprika" },
        })),
      } as unknown as any,
      grokClient: {
        analyzeSocial: vi.fn(),
      } as unknown as any,
      random: () => 1,
      socialSampleRate: 0,
    });

    const result = await orchestrator.generateAnalysis(payload, { posts: [] });
    expect(result.marketAnalysis.bullets).toEqual(adjustedBullets);
    expect(result.meta.warnings).toContain(SANITY_WARNING);
  });
});

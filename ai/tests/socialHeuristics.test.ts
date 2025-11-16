import { describe, expect, it, vi } from "vitest";
import * as heuristics from "@/lib/ai/heuristics";
import { scoreBotLikelihood } from "../socialHeuristics.js";

describe("scoreBotLikelihood", () => {
  it("builds payload with safe defaults for missing author data", () => {
    const computeSpy = vi.spyOn(heuristics, "computeBotScore").mockReturnValue(0.42);

    const result = scoreBotLikelihood({
      id: "p1",
      text: "Test post about SOL.",
      author: { id: "user-1" },
      created_at: "2025-11-15T00:00:00Z",
      source: "x",
    } as any);

    const { botScore, bot_score } = result;
    if (botScore === undefined || bot_score === undefined) {
      throw new Error("scoreBotLikelihood should always return bot scores");
    }

    expect(computeSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        author: expect.objectContaining({
          followers: 0,
          verified: false,
        }),
        text: "Test post about SOL.",
      }),
    );
    expect(botScore).toBeCloseTo(0.42);
    expect(bot_score).toBeCloseTo(botScore);

    computeSpy.mockRestore();
  });

  it("clamps computeBotScore output into [0, 1]", () => {
    const computeSpy = vi.spyOn(heuristics, "computeBotScore").mockReturnValue(1.4);

    const result = scoreBotLikelihood({
      id: "p2",
      text: "Aggressive promotion",
      author: { id: "user-2", followers: 2, verified: false },
      created_at: "2025-11-15T00:00:00Z",
      source: "telegram",
    } as any);

    const { botScore, bot_score } = result;
    if (botScore === undefined || bot_score === undefined) {
      throw new Error("scoreBotLikelihood should always return bot scores");
    }

    expect(botScore).toBe(1);
    expect(bot_score).toBe(1);

    computeSpy.mockRestore();
  });
});

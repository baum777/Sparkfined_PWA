import { describe, expect, it } from "vitest";
import { mergeBotScores } from "@/ai/backend/clients/grok_client.js";

describe("mergeBotScores", () => {
  it("returns heuristic score when model is missing", () => {
    expect(mergeBotScores(0.75, undefined)).toBeCloseTo(0.75);
  });

  it("returns model score when heuristic is missing", () => {
    expect(mergeBotScores(undefined, 0.25)).toBeCloseTo(0.25);
  });

  it("averages heuristic and model scores when both exist", () => {
    expect(mergeBotScores(0.6, 0.2)).toBeCloseTo(0.4);
  });

  it("clamps invalid values into [0, 1]", () => {
    expect(mergeBotScores(1.4, 1.6)).toBe(1);
    expect(mergeBotScores(-0.4, undefined)).toBe(0);
    expect(mergeBotScores(undefined, Number.NaN)).toBe(0);
  });
});

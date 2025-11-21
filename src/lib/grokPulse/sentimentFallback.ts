import { sanitizeSymbol } from "./sources";
import type { GrokCTA, GrokSentimentSnapshot, GrokSentimentLabel, PulseGlobalToken } from "./types";

const POSITIVE_KEYWORDS = [
  "pump",
  "moon",
  "bull",
  "green",
  "up",
  "rally",
  "breakout",
  "support",
  "bid",
  "strong",
];

const NEGATIVE_KEYWORDS = [
  "dump",
  "rug",
  "bear",
  "down",
  "sell",
  "liquidation",
  "bag",
  "exit",
  "weak",
  "concern",
];

const HYPE_KEYWORDS = ["viral", "trend", "hype", "ct", "fomo", "momentum"];

const LABEL_MAP: Array<{ min: number; label: GrokSentimentLabel; cta: GrokCTA }> = [
  { min: 75, label: "MOON", cta: "APE" },
  { min: 50, label: "STRONG_BULL", cta: "APE" },
  { min: 20, label: "BULL", cta: "DCA" },
  { min: -10, label: "NEUTRAL", cta: "WATCH" },
  { min: -40, label: "BEAR", cta: "WATCH" },
  { min: -70, label: "STRONG_BEAR", cta: "DUMP" },
  { min: -90, label: "RUG", cta: "AVOID" },
  { min: -101, label: "DEAD", cta: "AVOID" },
];

export function buildKeywordSentimentFallback(
  token: PulseGlobalToken,
  context: string
): GrokSentimentSnapshot {
  const normalizedContext = context.toLowerCase();
  const positiveHits = scoreForKeywords(normalizedContext, POSITIVE_KEYWORDS);
  const negativeHits = scoreForKeywords(normalizedContext, NEGATIVE_KEYWORDS);
  const hypeHits = scoreForKeywords(normalizedContext, HYPE_KEYWORDS);

  const baseScore = (positiveHits - negativeHits) * 20 + hypeHits * 10;
  const score = clamp(baseScore, -100, 100);
  const { label, cta } = resolveLabel(score);

  return {
    score,
    label,
    confidence: 72,
    one_liner: `${sanitizeSymbol(token.symbol)} fallback sentiment: ${label.toLowerCase()} keywords`,
    top_snippet: context.slice(0, 380),
    cta,
    validation_hash: "keyword_fallback",
    ts: Math.floor(Date.now() / 1000),
    low_confidence: true,
    source: "keyword_fallback",
  };
}

function scoreForKeywords(context: string, keywords: string[]): number {
  return keywords.reduce((hits, keyword) => {
    const regex = new RegExp(`\\b${keyword}\\b`, "gi");
    const matches = context.match(regex);
    return hits + (matches ? matches.length : 0);
  }, 0);
}

function resolveLabel(score: number): { label: GrokSentimentLabel; cta: GrokCTA } {
  for (const entry of LABEL_MAP) {
    if (score >= entry.min) return { label: entry.label, cta: entry.cta };
  }
  return { label: "DEAD", cta: "AVOID" };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export type GrokSentimentLabel =
  | "MOON"
  | "STRONG_BULL"
  | "BULL"
  | "NEUTRAL"
  | "BEAR"
  | "STRONG_BEAR"
  | "RUG"
  | "DEAD";

export type GrokCTA = "APE" | "DCA" | "WATCH" | "DUMP" | "AVOID";

export type GrokSentimentSnapshot = {
  score: number;
  label: GrokSentimentLabel;
  confidence: number;
  one_liner: string;
  top_snippet: string;
  cta: GrokCTA;
  validation_hash: string;
  ts: number;
  delta?: number;
  low_confidence?: boolean;
  source?: "grok" | "keyword_fallback";
};

export type GrokSentimentHistoryEntry = {
  ts: number;
  score: number;
};

export type PulseMetaLastRun = {
  ts: number;
  success: number;
  failed: number;
  total_calls: number;
};

export type PulseGlobalToken = {
  address: string;
  symbol: string;
};

export type PulseRunResult = {
  success: number;
  failed: number;
  totalCalls: number;
  skippedByDailyCap: number;
  tokensProcessed: number;
};

export type PulseDeltaEvent = {
  address: string;
  symbol: string;
  previousScore: number | null;
  newScore: number;
  delta: number;
  ts: number;
};

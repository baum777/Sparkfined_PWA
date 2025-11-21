import type {
  GrokCTA,
  GrokSentimentLabel,
  GrokSentimentSnapshot,
} from "./types";

export type GrokTokenContext = {
  symbol: string;
  address: string;
  context: string;
};

export type RawGrokResponse = {
  score: number;
  label: GrokSentimentLabel;
  confidence: number;
  one_liner: string;
  top_snippet: string;
  cta: GrokCTA;
  validation_hash: string;
};

const DEFAULT_MODEL = "grok-4-mini";

const GROK_API_KEY = process.env.GROK_API_KEY;
const GROK_API_URL = process.env.GROK_API_URL ?? "https://api.x.ai/v1/chat/completions";

export function buildPrompt(ctx: GrokTokenContext): string {
  return `Du bist der Grok-Pulse-Sentiment-Analyst für Solana-Token. Liefere eine prägnante JSON-Antwort ohne Zusatztext.\n\nToken: ${ctx.symbol} (${ctx.address})\nKontext: ${ctx.context}\n\nGib exakt dieses JSON-Schema zurück (ohne Codeblock):\\n{\\n  "score": number zwischen -100 und 100,\\n  "label": eine der [\"MOON\", \"STRONG_BULL\", \"BULL\", \"NEUTRAL\", \"BEAR\", \"STRONG_BEAR\", \"RUG\", \"DEAD\"],\\n  "confidence": Zahl 70..100,\\n  "one_liner": kurzer Satz < 200 Zeichen,\\n  "top_snippet": prägnantestes Beleg-Zitat < 500 Zeichen,\\n  "cta": eine der [\"APE\", \"DCA\", \"WATCH\", \"DUMP\", \"AVOID\"],\\n  "validation_hash": SHA-256 Hash über das JSON ohne das Feld \\\"validation_hash\\\"\n}`;
}

function normalizeContent(content: string): string {
  return content
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

async function computeHash(payload: Omit<RawGrokResponse, "validation_hash">): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function isValidRange(parsed: RawGrokResponse): boolean {
  const scoreInRange = typeof parsed.score === "number" && parsed.score >= -100 && parsed.score <= 100;
  const confidenceInRange =
    typeof parsed.confidence === "number" && parsed.confidence >= 70 && parsed.confidence <= 100;
  const oneLinerValid = typeof parsed.one_liner === "string" && parsed.one_liner.length > 0 && parsed.one_liner.length <= 240;
  const snippetValid =
    typeof parsed.top_snippet === "string" && parsed.top_snippet.length > 0 && parsed.top_snippet.length <= 800;
  const labelValid: readonly GrokSentimentLabel[] = [
    "MOON",
    "STRONG_BULL",
    "BULL",
    "NEUTRAL",
    "BEAR",
    "STRONG_BEAR",
    "RUG",
    "DEAD",
  ];
  const ctaValid: readonly GrokCTA[] = ["APE", "DCA", "WATCH", "DUMP", "AVOID"];

  return (
    scoreInRange &&
    confidenceInRange &&
    oneLinerValid &&
    snippetValid &&
    labelValid.includes(parsed.label) &&
    ctaValid.includes(parsed.cta) &&
    typeof parsed.validation_hash === "string" &&
    parsed.validation_hash.length > 0
  );
}

export async function fetchAndValidateGrokSentiment(
  ctx: GrokTokenContext
): Promise<GrokSentimentSnapshot | null> {
  if (!GROK_API_KEY) {
    console.warn("[grokPulse] GROK_API_KEY missing; skipping Grok sentiment call");
    return null;
  }

  const prompt = buildPrompt(ctx);

  let response: Response;
  try {
    response = await fetch(GROK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        stream: false,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
  } catch (error) {
    console.error("[grokPulse] Failed to call Grok", error);
    return null;
  }

  if (!response.ok) {
    console.error("[grokPulse] Grok API returned non-OK status", response.status, response.statusText);
    return null;
  }

  let rawContent: string | undefined;
  try {
    const result = await response.json();
    rawContent = result?.choices?.[0]?.message?.content;
  } catch (error) {
    console.error("[grokPulse] Failed to parse Grok response body", error);
    return null;
  }

  if (!rawContent || typeof rawContent !== "string") {
    console.warn("[grokPulse] Grok response missing content field");
    return null;
  }

  const cleaned = normalizeContent(rawContent);
  let parsed: RawGrokResponse;

  try {
    parsed = JSON.parse(cleaned) as RawGrokResponse;
  } catch (error) {
    console.error("[grokPulse] Failed to parse Grok JSON", error, cleaned);
    return null;
  }

  if (!isValidRange(parsed)) {
    console.warn("[grokPulse] Grok response failed validation", parsed);
    return null;
  }

  const { validation_hash, ...rest } = parsed;
  let computedHash: string;

  try {
    computedHash = await computeHash(rest);
  } catch (error) {
    console.error("[grokPulse] Failed to compute validation hash", error);
    return null;
  }

  if (computedHash !== validation_hash) {
    console.warn("[grokPulse] Hash validation failed", { validation_hash, computedHash });
    return null;
  }

  const ts = Math.floor(Date.now() / 1000);
  const snapshot: GrokSentimentSnapshot = {
    ...parsed,
    ts,
    source: "grok",
  };

  return snapshot;
}

import type {
  GrokCTA,
  GrokSentimentLabel,
  GrokSentimentSnapshot,
} from "./types";

export interface GrokTokenContext {
  symbol: string;
  address: string;
  context: string;
}

export interface RawGrokResponse {
  score: number;
  label: GrokSentimentLabel;
  confidence: number;
  one_liner: string;
  top_snippet: string;
  cta: GrokCTA;
  validation_hash: string;
  low_confidence?: boolean;
}

const VALID_LABELS: GrokSentimentLabel[] = [
  "MOON",
  "STRONG_BULL",
  "BULL",
  "NEUTRAL",
  "BEAR",
  "STRONG_BEAR",
  "RUG",
  "DEAD",
];

const VALID_CTA: GrokCTA[] = ["APE", "DCA", "WATCH", "DUMP", "AVOID"];

function stableStringify(payload: Record<string, unknown>): string {
  const sortedKeys = Object.keys(payload).sort();
  const sortedPayload: Record<string, unknown> = {};
  for (const key of sortedKeys) {
    sortedPayload[key] = payload[key];
  }
  return JSON.stringify(sortedPayload);
}

async function computeValidationHash(payload: Record<string, unknown>): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = encoder.encode(stableStringify(payload));
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function buildPrompt(ctx: GrokTokenContext): string {
  return [
    "Du bist der Grok Pulse Engine Worker für Solana-Meme-Coins.",
    "Analysiere nur das bereitgestellte Context-Snippet (Tweets/News/Onchain) und liefere ein kompaktes JSON.",
    "Antwort **nur** mit JSON, keine Erklärungen.",
    "Schema:",
    "{",
    "  \"score\": number (-100..100)",
    "  \"label\": one of [MOON, STRONG_BULL, BULL, NEUTRAL, BEAR, STRONG_BEAR, RUG, DEAD]",
    "  \"confidence\": number (70..100)",
    "  \"one_liner\": string (<=200 chars, DE)",
    "  \"top_snippet\": string (<=400 chars, DE)",
    "  \"cta\": one of [APE, DCA, WATCH, DUMP, AVOID]",
    "  \"validation_hash\": sha256(JSON ohne validation_hash, alphabetisch sortierte Keys)",
    "  \"low_confidence\": boolean (optional)",
    "}",
    "Kontext:",
    `Token: ${ctx.symbol} (${ctx.address})`,
    `Daten: ${ctx.context}`,
    "Hinweise:",
    "- Bei schwachem Kontext: confidence auf 70-75 und low_confidence=true setzen.",
    "- validation_hash = SHA-256 Hex über das JSON (ohne validation_hash) mit alphabetisch sortierten Keys.",
  ].join("\n");
}

export async function fetchAndValidateGrokSentiment(
  ctx: GrokTokenContext
): Promise<GrokSentimentSnapshot | null> {
  const apiKey = process.env.GROK_API_KEY;
  if (!apiKey) {
    console.warn("[grokPulse] GROK_API_KEY missing – skipping sentiment fetch");
    return null;
  }

  const apiUrl = process.env.GROK_API_URL?.trim() ||
    "https://api.x.ai/v1/chat/completions";
  const model = process.env.GROK_MODEL?.trim() || "grok-2-latest";
  const prompt = buildPrompt(ctx);

  let rawText = "";
  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.15,
        max_tokens: 400,
        messages: [
          { role: "system", content: "Du bist ein präziser Krypto-Sentiment-Scorer." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      console.error(
        `[grokPulse] Grok request failed: ${res.status} ${res.statusText}`
      );
      return null;
    }

    const data = await res.json().catch(() => null);
    rawText = data?.choices?.[0]?.message?.content ?? "";
  } catch (error) {
    console.error("[grokPulse] Grok request error", error);
    return null;
  }

  if (typeof rawText !== "string" || rawText.trim().length === 0) {
    console.error("[grokPulse] Grok returned empty content");
    return null;
  }

  let parsed: RawGrokResponse;
  try {
    parsed = JSON.parse(rawText.trim()) as RawGrokResponse;
  } catch (error) {
    console.error("[grokPulse] Failed to parse Grok JSON", error, rawText);
    return null;
  }

  if (!VALID_LABELS.includes(parsed.label)) {
    console.warn(`[grokPulse] Invalid label: ${parsed.label}`);
    return null;
  }

  if (!VALID_CTA.includes(parsed.cta)) {
    console.warn(`[grokPulse] Invalid CTA: ${parsed.cta}`);
    return null;
  }

  if (
    typeof parsed.score !== "number" ||
    parsed.score < -100 ||
    parsed.score > 100
  ) {
    console.warn(`[grokPulse] score out of range: ${parsed.score}`);
    return null;
  }

  if (
    typeof parsed.confidence !== "number" ||
    parsed.confidence < 70 ||
    parsed.confidence > 100
  ) {
    console.warn(`[grokPulse] confidence out of range: ${parsed.confidence}`);
    return null;
  }

  if (
    typeof parsed.one_liner !== "string" ||
    parsed.one_liner.length === 0 ||
    parsed.one_liner.length > 200
  ) {
    console.warn("[grokPulse] one_liner invalid length");
    return null;
  }

  if (
    typeof parsed.top_snippet !== "string" ||
    parsed.top_snippet.length === 0 ||
    parsed.top_snippet.length > 400
  ) {
    console.warn("[grokPulse] top_snippet invalid length");
    return null;
  }

  if (typeof parsed.validation_hash !== "string") {
    console.warn("[grokPulse] validation_hash missing");
    return null;
  }

  const { validation_hash, ...hashPayload } = parsed;
  const computedHash = await computeValidationHash(hashPayload);

  if (validation_hash !== computedHash) {
    console.warn("[grokPulse] validation_hash mismatch", {
      expected: computedHash,
      received: validation_hash,
    });
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

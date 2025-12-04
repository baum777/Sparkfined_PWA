export const config = { runtime: "edge" };

import type { OracleAPIResponse, OracleTheme } from "../src/types/oracle";
import { ORACLE_THEMES } from "../src/types/oracle";
import {
  ORACLE_ALPHA_PROMPT,
  ORACLE_SCORE_PROMPT,
  ORACLE_SYSTEM_PROMPT,
  ORACLE_THEME_PROMPT,
} from "../src/lib/prompts/oracle";

interface OraclePromptOptions {
  temperature?: number;
  maxTokens?: number;
}

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
};

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "GET" && req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  const secret = process.env.ORACLE_CRON_SECRET?.trim();
  if (!secret) {
    return json({ error: "ORACLE_CRON_SECRET not configured" }, 500);
  }

  const authHeader = req.headers.get("authorization") || "";
  const [scheme, token] = authHeader.split(" ", 2);

  if (!scheme || !token || scheme.toLowerCase() !== "bearer" || token.trim() !== secret) {
    return json({ error: "Unauthorized" }, 401);
  }

  try {
    const [scoreRaw, themeRaw, alphaRaw] = await Promise.all([
      callGrokPrompt(ORACLE_SCORE_PROMPT, { maxTokens: 900, temperature: 0.1 }),
      callGrokPrompt(ORACLE_THEME_PROMPT, { maxTokens: 700, temperature: 0.2 }),
      callGrokPrompt(ORACLE_ALPHA_PROMPT, { maxTokens: 900, temperature: 0.35 }),
    ]);

    const timestamp = Date.now();
    const payload: OracleAPIResponse = {
      report: buildFullReport(scoreRaw, themeRaw, alphaRaw),
      score: extractScore(scoreRaw),
      theme: extractTopTheme(themeRaw),
      timestamp,
      date: new Date(timestamp).toISOString().split("T")[0],
    };

    return json(payload, 200);
  } catch (error) {
    console.error("[oracle-api] Failed to generate report", error);
    return json({ error: "ORACLE_FETCH_FAILED" }, 500);
  }
}

async function callGrokPrompt(
  prompt: string,
  options: OraclePromptOptions = {}
): Promise<string> {
  const apiKey =
    process.env.XAI_API_KEY?.trim() ?? process.env.GROK_API_KEY?.trim() ?? "";
  if (!apiKey) {
    throw new Error("XAI_API_KEY missing");
  }

  const endpoint =
    process.env.XAI_API_URL?.trim() ||
    process.env.GROK_API_URL?.trim() ||
    "https://api.x.ai/v1/chat/completions";
  const model =
    process.env.ORACLE_GROK_MODEL?.trim() ||
    process.env.GROK_MODEL?.trim() ||
    "grok-2-latest";

  const temperature = options.temperature ?? 0.2;
  const maxTokens = options.maxTokens ?? 800;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: ORACLE_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    console.error("[oracle-api] Grok request failed", {
      status: response.status,
      bodyPreview: responseText.slice(0, 240),
    });
    throw new Error("Grok request failed");
  }

  let data: unknown;
  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error("[oracle-api] Failed to parse Grok JSON", error, {
      bodyPreview: responseText.slice(0, 240),
    });
    throw new Error("Invalid Grok response");
  }

  const content =
    (data as { choices?: Array<{ message?: { content?: string } }> })?.choices?.[0]
      ?.message?.content;

  if (typeof content !== "string" || !content.trim()) {
    throw new Error("Empty Grok response");
  }

  return content.trim();
}

function extractScore(scoreRaw: string): number {
  const match = scoreRaw.match(/SCORE:\s*(\d+(?:\.\d+)?)\s*\/\s*7/i);
  if (!match) return 0;

  const parsed = Number(match[1]);
  if (!Number.isFinite(parsed)) {
    return 0;
  }

  const rounded = Math.round(parsed);
  if (rounded < 0) return 0;
  if (rounded > 7) return 7;
  return rounded;
}

function extractTopTheme(themeRaw: string): OracleTheme {
  const lines = themeRaw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let bestTheme: OracleTheme | undefined;
  let bestValue = -1;

  for (const line of lines) {
    const match = line.match(/^[-*•]?\s*([A-Za-z/ ]+):\s*(\d{1,3}(?:\.\d+)?)%/i);
    if (!match) continue;

    const candidate = normalizeTheme(match[1]);
    if (!candidate) continue;

    const value = Number(match[2]);
    if (!Number.isFinite(value)) continue;

    if (value > bestValue) {
      bestValue = value;
      bestTheme = candidate;
    }
  }

  if (!bestTheme) {
    const topLine = lines.find((line) => line.toUpperCase().startsWith("TOP THEME"));
    if (topLine) {
      const [, value] = topLine.split(":");
      const candidate = normalizeTheme(value?.trim() ?? "");
      if (candidate) {
        bestTheme = candidate;
      }
    }
  }

  return bestTheme ?? ORACLE_THEMES[0];
}

function normalizeTheme(input: string): OracleTheme | undefined {
  const target = input.trim().toLowerCase();
  return ORACLE_THEMES.find((theme) => theme.toLowerCase() === target);
}

function buildFullReport(scoreSection: string, themeSection: string, alphaSection: string): string {
  return [
    "## Score Analysis",
    scoreSection.trim(),
    "",
    "## Meta Themes",
    themeSection.trim(),
    "",
    "## Early Alpha Signals",
    alphaSection.trim(),
  ]
    .map((block) => block.trim())
    .filter(Boolean)
    .join("\n\n");
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: JSON_HEADERS,
  });
}

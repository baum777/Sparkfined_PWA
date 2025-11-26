// -----------------------------------------------------------------------------
// Sparkfined – Teaser Adapter (Bundle-Safe / Zero SDK / Pure Fetch)
// -----------------------------------------------------------------------------
// This module provides a tiny, edge-compatible AI wrapper for generating
// short teaser analysis messages for the user interface.
//
// It intentionally avoids all Node-only SDKs (OpenAI SDK, Anthropic SDK, etc.)
// to prevent 500–900 KB bundle regressions. The entire module ships ~0 KB,
// since fetch + Typescript types get tree-shaken.
//
// Usage:
//   const teaser = await generateTeaser({ prompt, apiKey, model });
// -----------------------------------------------------------------------------

// Domain Types ---------------------------------------------------------------

export type TeaserModel = {
  model: string;
  apiKey: string;
  baseUrl?: string; // optional, fallback = OpenAI / custom gateway
};

export type TeaserRequest = {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
};

export interface TeaserResponse {
  teaser: string;
  raw?: unknown;
}

// Internal Types -------------------------------------------------------------

// Minimal compatible shape with OAI/Grok/OpenRouter
interface ChatMessage {
  role: "system" | "user";
  content: string | ChatContentItem[];
}

type ChatContentItem =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: "json_object" };
}

interface ChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

// Utilities ------------------------------------------------------------------

async function safeReadText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "<unreadable>";
  }
}

function defaultSystemPrompt(): string {
  return `
You are Sparkfined AI. 
Generate a short, sharp teaser insight for crypto traders.
Tone: concise, confident, signal-driven. 
Output MUST be plain text, no markdown.
`.trim();
}

// Core Chat Call -------------------------------------------------------------

async function callChatCompletion(
  request: ChatCompletionRequest,
  opts: TeaserModel
): Promise<ChatCompletionResponse> {
  const baseUrl = opts.baseUrl ?? "https://api.openai.com/v1";

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify(request),
  });

  if (!res.ok) {
    const errText = await safeReadText(res);
    throw new Error(`AI Error ${res.status}: ${errText}`);
  }

  return (await res.json()) as ChatCompletionResponse;
}

// Public API ----------------------------------------------------------------

export async function generateTeaser(
  input: TeaserRequest,
  ai: TeaserModel
): Promise<TeaserResponse> {
  const system = defaultSystemPrompt();

  const req: ChatCompletionRequest = {
    model: ai.model,
    temperature: input.temperature ?? 0.7,
    max_tokens: input.maxTokens ?? 60,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: input.prompt },
    ],
  };

  const raw = await callChatCompletion(req, ai);

  const text =
    raw?.choices?.[0]?.message?.content?.trim() ??
    "No teaser generated.";

  return {
    teaser: text,
    raw,
  };
}

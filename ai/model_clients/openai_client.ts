import { renderPrompt } from "../promptLoader.js";
import { withExponentialBackoff } from "../retry.js";
import type { BulletAnalysis, FetchLike, MarketPayload, RetryOptions } from "@/types/ai";

export interface OpenAIClientConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retry?: RetryOptions;
  endpoint?: string;
  fetchImpl?: FetchLike;
}

export class OpenAIClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly retry: RetryOptions;
  private readonly endpoint: string;
  private readonly fetchImpl: FetchLike;

  constructor(config: OpenAIClientConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.OPENAI_API_KEY ?? "";
    if (!this.apiKey) {
      throw new Error("OPENAI_API_KEY missing – set env or pass via config");
    }
    this.model = config.model ?? process.env.DEFAULT_UI_MODEL ?? "gpt-4o-mini";
    this.temperature = config.temperature ?? 0.2;
    this.maxTokens = config.maxTokens ?? 800;
    this.retry = config.retry ?? { retries: 3, baseDelayMs: 400, jitter: 0.25 };
    this.endpoint = config.endpoint ?? "https://api.openai.com/v1/chat/completions";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async analyzeMarket(payload: MarketPayload): Promise<BulletAnalysis> {
    const atrValue = payload.indicators?.atr;
    const prompt = await renderPrompt("task_prompt_openai.md", {
      ticker: payload.ticker,
      timeframe: payload.timeframe,
      price: payload.price.toFixed(2),
      atr: atrValue ?? (atrValue === 0 ? 0 : "unbekannt"),
      indicators: payload.indicators,
      onchain: payload.onchain ?? {},
      meta: payload.meta,
    });

    const body = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: [
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    };

    const response = await withExponentialBackoff(async () => {
      const res = await this.fetchImpl(this.endpoint, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(body),
      });

      if (res.status === 401) {
        throw new Error("OpenAI authentication failed");
      }

      if (res.status >= 500) {
        throw new RetryableError(`OpenAI ${res.status}`);
      }

      if (res.status === 429) {
        throw new RetryableError("OpenAI rate limited");
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenAI error ${res.status}: ${text}`);
      }

      return res.json();
    }, this.retry);

    const text: string = response?.choices?.[0]?.message?.content ?? "";
    let parsed: { bullets?: string[]; source_trace?: Record<string, unknown> } = {};
    try {
      parsed = text ? JSON.parse(text) : {};
    } catch (error) {
      const reason = error instanceof Error ? error.message : "unknown parse error";
      throw new Error(`OpenAI returned non-JSON payload: ${text} (${reason})`);
    }

    const usage = response?.usage;
    const costUsd = usage ? estimateOpenaiCost(this.model, usage) : null;

    return {
      provider: "openai",
      model: this.model,
      bullets: parsed.bullets ?? [],
      source_trace: parsed.source_trace ?? { price_source: payload.meta.source },
      rawText: text,
      costUsd,
    };
  }
}

export class RetryableError extends Error {}

function estimateOpenaiCost(model: string, usage: { prompt_tokens?: number; completion_tokens?: number } | undefined) {
  const inTok = usage?.prompt_tokens ?? 0;
  const outTok = usage?.completion_tokens ?? 0;
  const isMini = /mini|small/i.test(model);
  const price = isMini
    ? { in: 0.00015, out: 0.0006 }
    : { in: 0.005, out: 0.015 };
  return (inTok / 1000) * price.in + (outTok / 1000) * price.out;
}

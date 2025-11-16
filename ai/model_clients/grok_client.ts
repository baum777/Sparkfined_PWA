import { renderPrompt } from "../promptLoader.js";
import { withExponentialBackoff } from "../retry.js";
import type {
  FetchLike,
  MarketPayload,
  RetryOptions,
  SocialAnalysis,
  SocialPost,
  SocialPostAssessment,
} from "@/types/ai";
import { scoreBotLikelihood } from "../socialHeuristics.js";

export interface GrokClientConfig {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  retry?: RetryOptions;
  endpoint?: string;
  fetchImpl?: FetchLike;
}

export class GrokClient {
  private readonly apiKey: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly retry: RetryOptions;
  private readonly endpoint: string;
  private readonly fetchImpl: FetchLike;

  constructor(config: GrokClientConfig = {}) {
    this.apiKey = config.apiKey ?? process.env.GROK_API_KEY ?? "";
    if (!this.apiKey) {
      throw new Error("GROK_API_KEY missing – set env or pass via config");
    }
    this.model = config.model ?? "grok-4-mini";
    this.temperature = config.temperature ?? 0.2;
    this.maxTokens = config.maxTokens ?? 1200;
    this.retry = config.retry ?? { retries: 3, baseDelayMs: 600, jitter: 0.3 };
    this.endpoint = config.endpoint ?? "https://api.x.ai/v1/chat/completions";
    this.fetchImpl = config.fetchImpl ?? fetch;
  }

  async analyzeSocial(
    payload: MarketPayload,
    posts: SocialPost[],
  ): Promise<SocialAnalysis> {
    if (!posts.length) {
      throw new Error("Grok social analysis requires at least one post");
    }

    const prompt = await renderPrompt("task_prompt_grok.md", {
      ticker: payload.ticker,
      mode: payload.socialMode ?? "newest",
      sources: (payload.socialSources ?? []).join(",") || "n/a",
      posts,
    });

    const body = {
      model: this.model,
      temperature: this.temperature,
      max_tokens: this.maxTokens,
      messages: [{ role: "user", content: prompt }],
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
        throw new Error("Grok authentication failed");
      }

      if (res.status >= 500) {
        throw new RetryableSocialError(`Grok ${res.status}`);
      }

      if (res.status === 429) {
        throw new RetryableSocialError("Grok rate limited");
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Grok error ${res.status}: ${text}`);
      }

      return res.json();
    }, this.retry);

    const text: string = response?.choices?.[0]?.message?.content ?? "";

    let parsed: Partial<SocialAnalysis> & {
      posts?: Array<Partial<SocialPostAssessment>>;
      aggregates?: SocialAnalysis["aggregates"];
    } = {};

    try {
      parsed = text ? JSON.parse(text) : {};
    } catch (error) {
      throw new Error(`Grok returned non-JSON payload: ${text}`);
    }

    const assessedPosts = posts.map((post, index) => {
      const heuristics = scoreBotLikelihood(post);
      const modelAssessment = parsed.posts?.[index];
      const modelBotScore = extractModelBotScore(modelAssessment);
      const combinedScore = mergeBotScores(heuristics.botScore, modelBotScore);
      const reasons = new Set<string>([
        ...(heuristics.reason_flags ?? []),
        ...((modelAssessment?.reason_flags ?? []) as string[]),
      ]);

      return {
        id: post.id,
        text_snippet:
          modelAssessment?.text_snippet ?? post.text.slice(0, 140),
        sentiment: modelAssessment?.sentiment ?? 0,
        botScore: combinedScore,
        bot_score: combinedScore,
        isLikelyBot:
          typeof modelAssessment?.isLikelyBot === "boolean"
            ? modelAssessment.isLikelyBot
            : combinedScore >= 0.5,
        reason_flags: Array.from(reasons),
      } satisfies SocialPostAssessment;
    });

    const botRatio = assessedPosts.length
      ? assessedPosts.filter((p) => p.isLikelyBot).length / assessedPosts.length
      : 0;

    return {
      provider: "grok",
      model: this.model,
      mode: (payload.socialMode ?? "newest") as "newest" | "oldest",
      thesis: parsed.thesis ?? "",
      bullets: parsed.bullets ?? [],
      sentiment: parsed.sentiment ?? 0,
      confidence: parsed.confidence ?? 0,
      aggregates: parsed.aggregates ?? {
        positive: 0,
        neutral: 0,
        negative: 0,
      },
      posts: assessedPosts,
      narrative_lore: parsed.narrative_lore,
      source_trace: parsed.source_trace ?? { social_provider: "unknown" },
      social_review_required:
        (parsed.confidence ?? 0) < 0.6 || botRatio >= 0.4,
    };
  }
}

export class RetryableSocialError extends Error {}

export function mergeBotScores(
  heuristicScore?: number,
  modelScore?: number,
): number {
  const hasHeuristic = isFiniteNumber(heuristicScore);
  const hasModel = isFiniteNumber(modelScore);

  if (hasHeuristic && hasModel) {
    return clampToUnit(((heuristicScore as number) + (modelScore as number)) / 2);
  }

  if (hasHeuristic) {
    return clampToUnit(heuristicScore as number);
  }

  if (hasModel) {
    return clampToUnit(modelScore as number);
  }

  return 0;
}

function extractModelBotScore(
  modelAssessment?: Partial<SocialPostAssessment>,
): number | undefined {
  if (!modelAssessment) return undefined;
  if (isFiniteNumber(modelAssessment.bot_score)) return modelAssessment.bot_score;
  if (isFiniteNumber(modelAssessment.botScore)) return modelAssessment.botScore;
  return undefined;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clampToUnit(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

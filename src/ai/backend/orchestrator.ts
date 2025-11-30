import { appendFile, mkdir } from "fs/promises";
import path from "path";
import { OpenAIClient } from "./clients/openai_client.js";
import { GrokClient } from "./clients/grok_client.js";
import type {
  MarketPayload,
  OrchestratorResult,
  Provider,
  SocialAnalysis,
  SocialPost,
  TelemetryEvent,
} from "@/types/ai";
import { sanityCheck } from "@/lib/ai/heuristics";

export const SANITY_WARNING = "sanity_check adjusted AI bullets";

export interface OrchestratorOptions {
  openaiClient?: OpenAIClient;
  grokClient?: GrokClient;
  telemetryDir?: string;
  socialSampleRate?: number;
  random?: () => number;
  now?: () => number;
}

export interface GenerateAnalysisOptions {
  posts?: SocialPost[];
  maxCostUsd?: number;
}

const TELEMETRY_DEFAULT = path.resolve(process.cwd(), "telemetry", "ai", "events.jsonl");

export class AIOrchestrator {
  private readonly openai: OpenAIClient;
  private readonly grok: GrokClient;
  private readonly telemetryPath: string;
  private readonly socialSampleRate: number;
  private readonly random: () => number;
  private readonly now: () => number;

  constructor(options: OrchestratorOptions = {}) {
    this.openai = options.openaiClient ?? new OpenAIClient();
    this.grok = options.grokClient ?? new GrokClient();
    this.telemetryPath = options.telemetryDir
      ? path.resolve(options.telemetryDir)
      : TELEMETRY_DEFAULT;
    this.socialSampleRate = options.socialSampleRate ?? 0.1;
    this.random = options.random ?? Math.random;
    this.now = options.now ?? Date.now;
  }

  async generateAnalysis(
    payload: MarketPayload,
    options: GenerateAnalysisOptions = {},
  ): Promise<OrchestratorResult> {
    const normalized = normalizePayload(payload);

    if (options.maxCostUsd && options.maxCostUsd < 0.05) {
      throw new Error("maxCostUsd too low for orchestration (min 0.05)");
    }

    const usedProviders: Provider[] = [];
    const warnings: string[] = [];
    const telemetryEvents: TelemetryEvent[] = [];

    const startOpenAi = this.now();
    const marketAnalysis = await this.openai.analyzeMarket(normalized);
    const initialBullets = Array.isArray(marketAnalysis.bullets) ? marketAnalysis.bullets : [];
    marketAnalysis.bullets = initialBullets;
    if (marketAnalysis.bullets.length > 0) {
      validateBulletResponse(marketAnalysis);
    } else {
      marketAnalysis.bullets = [];
    }
    const validatedBullets = [...marketAnalysis.bullets];
    const sanityResult = sanityCheck(validatedBullets, normalized);
    const sanitizedBullets = Array.isArray(sanityResult) ? sanityResult : validatedBullets;
    if (bulletsChanged(validatedBullets, sanitizedBullets)) {
      warnings.push(SANITY_WARNING);
    }
    marketAnalysis.bullets = sanitizedBullets;
    usedProviders.push("openai");
    telemetryEvents.push({
      timestamp: new Date().toISOString(),
      provider: "openai",
      model: marketAnalysis.model,
      latencyMs: this.now() - startOpenAi,
      success: true,
      payloadSize: JSON.stringify(normalized).length,
      costUsd: marketAnalysis.costUsd ?? undefined,
      additional: { ticker: normalized.ticker },
    });

    let socialAnalysis: SocialAnalysis | undefined;
    const shouldRunSocial = this.shouldRunSocial(normalized);

    if (shouldRunSocial || normalized.includeSocial) {
      const posts = (options.posts ?? []).slice(0, 10);
      if (!posts.length) {
        warnings.push("includeSocial requested but no posts supplied");
      } else {
        const startGrok = this.now();
        socialAnalysis = await this.grok.analyzeSocial(normalized, posts);
        usedProviders.push("grok");
        telemetryEvents.push({
          timestamp: new Date().toISOString(),
          provider: "grok",
          model: socialAnalysis.model,
          latencyMs: this.now() - startGrok,
          success: true,
          payloadSize: JSON.stringify(posts).length,
          additional: { ticker: normalized.ticker, mode: socialAnalysis.mode },
        });

        if (socialAnalysis.social_review_required) {
          warnings.push("social_analysis flagged for review");
        }
      }
    }

    await this.persistTelemetry(telemetryEvents);

    const meta = {
      usedProviders,
      timestamp: new Date().toISOString(),
      samplingRate: this.socialSampleRate,
      costUsdEstimate: estimateCostUsd(telemetryEvents),
      warnings,
    };

    return {
      marketAnalysis,
      socialAnalysis,
      meta,
    };
  }

  shouldRunSocial(payload: MarketPayload): boolean {
    if (payload.includeSocial) return true;
    return this.random() < this.socialSampleRate;
  }

  private async persistTelemetry(events: TelemetryEvent[]): Promise<void> {
    if (!events.length) return;
    const dir = path.dirname(this.telemetryPath);
    await mkdir(dir, { recursive: true });
    const serialized = events.map((event) => JSON.stringify(event)).join("\n") + "\n";
    await appendFile(this.telemetryPath, serialized, { encoding: "utf8" });
  }
}

function normalizePayload(payload: MarketPayload): MarketPayload {
  return {
    ...payload,
    ticker: payload.ticker.trim().toUpperCase(),
    timeframe: payload.timeframe.trim(),
    socialMode: payload.socialMode ?? "newest",
    socialSources: payload.socialSources ?? [payload.meta.source],
    indicators: payload.indicators ?? {},
  };
}

export function validateBulletResponse(analysis: { bullets: string[] }): void {
  if (!analysis.bullets || analysis.bullets.length < 4 || analysis.bullets.length > 7) {
    throw new Error("Model must return between 4 and 7 bullets");
  }

  analysis.bullets = analysis.bullets.map((bullet) => {
    const clean = bullet.replace(/\s+/g, " ").trim();
    const words = clean.split(" ").filter(Boolean);
    if (words.length > 20) {
      return words.slice(0, 20).join(" ");
    }
    return clean;
  });
}

export function mergeJournalFields(result: OrchestratorResult) {
  return {
    bullets: result.marketAnalysis.bullets,
    source_trace: result.marketAnalysis.source_trace,
    social_analysis: result.socialAnalysis
      ? {
          thesis: result.socialAnalysis.thesis,
          sentiment: result.socialAnalysis.sentiment,
          confidence: result.socialAnalysis.confidence,
          posts: result.socialAnalysis.posts,
          narrative_lore: result.socialAnalysis.narrative_lore,
          social_review_required: result.socialAnalysis.social_review_required,
          source_trace: result.socialAnalysis.source_trace,
        }
      : undefined,
    narrative_lore: result.socialAnalysis?.narrative_lore,
    social_review_required: result.socialAnalysis?.social_review_required ?? false,
  };
}

function estimateCostUsd(events: TelemetryEvent[]): number {
  return events.reduce((acc, event) => acc + (event.costUsd ?? 0), 0);
}

function bulletsChanged(original: string[], sanitized: string[]): boolean {
  if (original.length !== sanitized.length) {
    return true;
  }
  return original.some((bullet, index) => bullet !== sanitized[index]);
}

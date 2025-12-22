import { estimateTokens } from '@/lib/tokens'
import {
  DEFAULT_DAILY_TOKEN_BUDGET,
  DEFAULT_PER_REQUEST_OUTPUT_TOKEN_CAP,
  withTokenLockOrMock,
} from './ai/withTokenLockOrMock'

export type AssistResult = { ok:boolean; text?:string; ms?:number; provider?:string; model?:string; usage?:any; costUsd?:number|null; error?:string; fromCache?:boolean };

type AssistArgs = {
  provider:"openai"|"anthropic"|"xai";
  model?:string;
  system?:string;
  user?:string;
  templateId?: "v1/analyze_bullets"|"v1/journal_condense";
  vars?: Record<string, any>;
  maxOutputTokens?: number;
  maxCostUsd?: number;
}

function extractTokens(usage: any): number | undefined {
  if (typeof usage?.total_tokens === 'number') return usage.total_tokens
  if (typeof usage?.totalTokens === 'number') return usage.totalTokens
  return undefined
}

function estimatePromptTokens(args: AssistArgs): number {
  const promptParts = [args.system, args.user]
  if (args.templateId) {
    promptParts.push(JSON.stringify(args.vars ?? {}))
  }
  const combined = promptParts.filter(Boolean).join('\n')
  return estimateTokens(combined)
}

export async function aiAssist(args: AssistArgs): Promise<AssistResult> {
  const estimatedTokens = estimatePromptTokens(args)
  const { provider, model, system, user, templateId, vars, maxOutputTokens, maxCostUsd } = args

  const { result } = await withTokenLockOrMock<AssistResult>({
    requestedMaxOutputTokens: maxOutputTokens,
    reservedTokens: maxOutputTokens,
    estimatedTokens,
    dailyTokenBudget: DEFAULT_DAILY_TOKEN_BUDGET,
    perRequestOutputTokenCap: DEFAULT_PER_REQUEST_OUTPUT_TOKEN_CAP,
    doDemoCall: async ({ reason }) => ({
      ok: false,
      text: '',
      error: reason === 'api-call-budget-exceeded'
        ? 'Daily API call budget exceeded'
        : 'Daily token budget exceeded',
    }),
    doRealCall: async ({ maxOutputTokens: cappedMaxOutputTokens }) => {
      const r = await fetch("/api/ai/assist", {
        method:"POST",
        headers:{ "content-type":"application/json" },
        body: JSON.stringify({
          provider,
          model,
          system,
          user,
          templateId,
          vars,
          maxOutputTokens: cappedMaxOutputTokens,
          maxCostUsd,
        })
      });
      const parsed = await r.json() as AssistResult
      const tokensUsed = extractTokens(parsed.usage)
      const estimatedFromText = estimateTokens(parsed?.text ?? '')
      return {
        result: parsed,
        tokensUsed,
        reservedTokens: cappedMaxOutputTokens,
        estimatedTokens: estimatedFromText,
      }
    },
  })

  return result
}

import { commitUsageAfterRealCall, maybeResetUsage, type UsageSnapshot } from '@/features/settings/token-usage'

export const DEFAULT_DAILY_TOKEN_BUDGET = 196_000
export const DEFAULT_DAILY_API_CALL_BUDGET = Number.POSITIVE_INFINITY
export const DEFAULT_PER_REQUEST_OUTPUT_TOKEN_CAP = 1_200

type DemoContext = {
  reason: 'token-budget-exceeded' | 'api-call-budget-exceeded'
  remainingTokens: number
  usage: UsageSnapshot
}

type RealCallContext = {
  maxOutputTokens?: number
  usage: UsageSnapshot
}

type RealCallResult<T> = {
  result: T
  tokensUsed?: number
  reservedTokens?: number
  estimatedTokens?: number
}

export type WithTokenLockOrMockOptions<T> = {
  requestedMaxOutputTokens?: number
  reservedTokens?: number
  estimatedTokens?: number
  dailyTokenBudget?: number
  dailyApiCallBudget?: number
  perRequestOutputTokenCap?: number
  now?: () => Date
  doDemoCall: (context: DemoContext) => Promise<T>
  doRealCall: (context: RealCallContext) => Promise<RealCallResult<T>>
}

export type TokenLockResult<T> = {
  mode: 'demo' | 'real'
  result: T
  usageSnapshot?: UsageSnapshot
  reason?: DemoContext['reason']
}

const clampMaxTokens = (requested: number | undefined, cap: number) => {
  if (typeof requested !== 'number' || Number.isNaN(requested)) return cap
  return Math.max(0, Math.min(requested, cap))
}

export async function withTokenLockOrMock<T>({
  requestedMaxOutputTokens,
  reservedTokens,
  estimatedTokens,
  dailyTokenBudget = DEFAULT_DAILY_TOKEN_BUDGET,
  dailyApiCallBudget = DEFAULT_DAILY_API_CALL_BUDGET,
  perRequestOutputTokenCap = DEFAULT_PER_REQUEST_OUTPUT_TOKEN_CAP,
  doDemoCall,
  doRealCall,
  now = () => new Date(),
}: WithTokenLockOrMockOptions<T>): Promise<TokenLockResult<T>> {
  const nowDate = now()
  const usage = maybeResetUsage({ now: nowDate })
  const cappedMaxTokens = clampMaxTokens(requestedMaxOutputTokens, perRequestOutputTokenCap)
  const plannedTokens = Math.max(0, reservedTokens ?? estimatedTokens ?? cappedMaxTokens ?? 0)
  const remainingTokens = Math.max(0, dailyTokenBudget - usage.tokens)
  const remainingCalls = Math.max(0, dailyApiCallBudget - usage.apiCalls)

  if (remainingCalls <= 0 || plannedTokens > remainingTokens) {
    const reason: DemoContext['reason'] = remainingCalls <= 0 ? 'api-call-budget-exceeded' : 'token-budget-exceeded'
    const result = await doDemoCall({ reason, remainingTokens, usage })
    return { mode: 'demo', result, reason }
  }

  const real = await doRealCall({ maxOutputTokens: cappedMaxTokens, usage })
  const tokensUsed = Math.max(
    0,
    real.tokensUsed ?? real.reservedTokens ?? real.estimatedTokens ?? plannedTokens,
  )
  const committed = commitUsageAfterRealCall({ tokensUsed, apiCallsDelta: 1, now: nowDate })
  return { mode: 'real', result: real.result, usageSnapshot: committed }
}

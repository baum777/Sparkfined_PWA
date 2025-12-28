import { getBudgets, readUsage, TokenBudgets, TokenUsageState } from '../usage/tokenUsage';

export type TokenLockDeniedReason = 'budget_exceeded' | 'lock_unavailable' | 'disabled';

export type TokenLockAcquire = {
  ok: true;
  lockId: string;
  reservedTokens: number;
  budgets: TokenBudgets;
  usage: TokenUsageState;
};

export type TokenLockDenied = {
  ok: false;
  reason: TokenLockDeniedReason;
};

export type TokenLockResult = TokenLockAcquire | TokenLockDenied;

export const tryAcquireTokenLock = ({
  estimatedTokens,
  now = new Date(),
}: {
  estimatedTokens: number;
  now?: Date;
}): TokenLockResult => {
  const budgets = getBudgets();
  const usage = readUsage(now);

  if (budgets.dailyTokenBudget <= 0) {
    return { ok: false, reason: 'disabled' };
  }

  const clampedEstimate = Math.max(0, Math.min(estimatedTokens, budgets.perRequestOutputTokenCap));
  const projectedTokens = usage.tokensUsedToday + clampedEstimate;

  if (projectedTokens > budgets.dailyTokenBudget) {
    return { ok: false, reason: 'budget_exceeded' };
  }

  if (budgets.dailyApiCallBudget !== undefined && budgets.dailyApiCallBudget !== null) {
    if (usage.apiCallsToday >= budgets.dailyApiCallBudget) {
      return { ok: false, reason: 'budget_exceeded' };
    }
  }

  return {
    ok: true,
    lockId: `lock-${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    reservedTokens: clampedEstimate,
    budgets,
    usage,
  };
};

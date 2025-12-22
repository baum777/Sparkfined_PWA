import { recordApiCall } from '../usage/tokenUsage';
import { tryAcquireTokenLock } from './tokenLock';

type Mode = 'real' | 'demo';

type CallResult<T> = {
  result: T;
  mode: Mode;
  note?: string;
};

type RealCallResult<T> = { result: T; tokensUsed?: number };

type WithTokenLockOrMockParams<T> = {
  kind: string;
  estimatedTokens: number;
  maxOutputTokens: number;
  doRealCall: (params: { maxOutputTokens: number }) => Promise<RealCallResult<T>>;
  mockResult: (() => Promise<T>) | (() => T);
  now?: Date;
};

export async function withTokenLockOrMock<T>(params: WithTokenLockOrMockParams<T>): Promise<CallResult<T>> {
  const { estimatedTokens, maxOutputTokens, doRealCall, mockResult, now = new Date() } = params;

  const lockAttempt = tryAcquireTokenLock({ estimatedTokens, now });
  const cappedMaxOutputTokens = lockAttempt.ok
    ? Math.min(maxOutputTokens, lockAttempt.budgets.perRequestOutputTokenCap)
    : maxOutputTokens;

  if (!lockAttempt.ok) {
    const demoResult = await Promise.resolve(mockResult());
    return {
      result: demoResult,
      mode: 'demo',
      note: 'Example/Demo result (no API call counted)',
    };
  }

  const realResponse = await doRealCall({ maxOutputTokens: cappedMaxOutputTokens });
  const tokensUsed = Math.max(
    0,
    Math.min(realResponse.tokensUsed ?? lockAttempt.reservedTokens ?? estimatedTokens, lockAttempt.budgets.perRequestOutputTokenCap),
  );
  recordApiCall({ tokensUsed, now });

  return {
    result: realResponse.result,
    mode: 'real',
  };
}

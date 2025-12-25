import { beforeEach, describe, expect, it, vi } from 'vitest';

import { getBerlinDayKey, readUsage, setBudgets, recordApiCall } from '../usage/tokenUsage';
import { withTokenLockOrMock } from './withTokenLockOrMock';

const NOW = new Date('2024-02-01T10:00:00Z');

describe('withTokenLockOrMock', () => {
  beforeEach(() => {
    localStorage.clear();
    setBudgets({
      dailyTokenBudget: 100,
      dailyApiCallBudget: 5,
      perRequestOutputTokenCap: 50,
      warn80: 80,
      warn95: 95,
    });
  });

  it('returns demo mode without incrementing usage when lock is denied', async () => {
    recordApiCall({ tokensUsed: 95, now: NOW });
    const before = readUsage(NOW);

    const response = await withTokenLockOrMock<string>({
      kind: 'demo-path',
      estimatedTokens: 20,
      maxOutputTokens: 200,
      doRealCall: vi.fn(),
      mockResult: () => 'demo-output',
      now: NOW,
    });

    expect(response.mode).toBe('demo');
    expect(response.result).toBe('demo-output');
    expect(response.note).toContain('Example/Demo');

    const usage = readUsage(NOW);
    expect(usage.tokensUsedToday).toBe(before.tokensUsedToday);
    expect(usage.apiCallsToday).toBe(before.apiCallsToday);
  });

  it('does not increment usage when starting in demo mode with empty counters', async () => {
    setBudgets({
      dailyTokenBudget: 0,
      dailyApiCallBudget: 0,
    });

    const response = await withTokenLockOrMock<string>({
      kind: 'demo-empty',
      estimatedTokens: 200,
      maxOutputTokens: 200,
      doRealCall: vi.fn(),
      mockResult: () => 'demo-output',
      now: NOW,
    });

    expect(response.mode).toBe('demo');
    expect(response.note).toContain('Example/Demo result (no API call counted)');
    const usage = readUsage(NOW);
    expect(usage.tokensUsedToday).toBe(0);
    expect(usage.apiCallsToday).toBe(0);
  });

  it('runs real call and increments usage when lock is acquired', async () => {
    const realCall = vi.fn().mockResolvedValue({ result: 'real-output', tokensUsed: 12 });

    const response = await withTokenLockOrMock<string>({
      kind: 'real-path',
      estimatedTokens: 10,
      maxOutputTokens: 40,
      doRealCall: realCall,
      mockResult: () => 'demo-output',
      now: NOW,
    });

    expect(response.mode).toBe('real');
    expect(response.result).toBe('real-output');
    expect(response.note).toBeUndefined();

    const usage = readUsage(NOW);
    expect(usage.tokensUsedToday).toBe(12);
    expect(usage.apiCallsToday).toBe(1);
  });

  it('falls back to reserved tokens when the real call does not return usage', async () => {
    await withTokenLockOrMock<string>({
      kind: 'real-reserved',
      estimatedTokens: 15,
      maxOutputTokens: 40,
      doRealCall: vi.fn().mockResolvedValue({ result: 'real-output' }),
      mockResult: () => 'demo-output',
      now: NOW,
    });

    const usage = readUsage(NOW);
    expect(usage.tokensUsedToday).toBe(15);
    expect(usage.apiCallsToday).toBe(1);
  });

  it('does not commit usage when the real call throws', async () => {
    const realCall = vi.fn().mockRejectedValue(new Error('fail'));

    await expect(
      withTokenLockOrMock<string>({
        kind: 'real-error',
        estimatedTokens: 10,
        maxOutputTokens: 40,
        doRealCall: realCall,
        mockResult: () => 'demo-output',
        now: NOW,
      }),
    ).rejects.toThrow('fail');

    const usage = readUsage(NOW);
    expect(usage.tokensUsedToday).toBe(0);
    expect(usage.apiCallsToday).toBe(0);
  });

  it('clamps maxOutputTokens using the per-request cap', async () => {
    const callSpy = vi.fn().mockResolvedValue({ result: 'real-output', tokensUsed: 5 });

    await withTokenLockOrMock<string>({
      kind: 'cap-path',
      estimatedTokens: 10,
      maxOutputTokens: 120,
      doRealCall: callSpy,
      mockResult: () => 'demo-output',
      now: NOW,
    });

    expect(callSpy).toHaveBeenCalledWith({ maxOutputTokens: 50 });
  });

  it('blocks once the daily call budget is exceeded', async () => {
    const todayKey = getBerlinDayKey(NOW);
    localStorage.setItem(
      'sf-token-usage',
      JSON.stringify({ dayKey: todayKey, tokensUsedToday: 20, apiCallsToday: 5, lastResetAt: NOW.toISOString() }),
    );

    const response = await withTokenLockOrMock<string>({
      kind: 'call-budget',
      estimatedTokens: 5,
      maxOutputTokens: 10,
      doRealCall: vi.fn(),
      mockResult: () => 'demo-output',
      now: NOW,
    });

    expect(response.mode).toBe('demo');
    const usage = readUsage(NOW);
    expect(usage.apiCallsToday).toBe(5);
  });
});

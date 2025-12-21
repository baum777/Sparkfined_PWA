import { describe, expect, beforeEach, it } from 'vitest';

import {
  TokenUsageState,
  getBerlinDayKey,
  maybeResetUsage,
  readUsage,
  recordApiCall,
  getBudgets,
  setBudgets,
} from './tokenUsage';

describe('tokenUsage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('computes Berlin day key using Europe/Berlin timezone', () => {
    const winterEveningUtc = new Date('2024-01-01T22:30:00Z');
    const summerLateUtc = new Date('2024-07-01T22:30:00Z');

    expect(getBerlinDayKey(winterEveningUtc)).toBe('2024-01-01');
    expect(getBerlinDayKey(summerLateUtc)).toBe('2024-07-02');
  });

  it('resets counters when the Berlin day key changes', () => {
    const beforeMidnight: TokenUsageState = {
      dayKey: getBerlinDayKey(new Date('2024-01-01T22:30:00Z')),
      tokensUsedToday: 500,
      apiCallsToday: 3,
      lastResetAt: new Date('2024-01-01T22:30:00Z').toISOString(),
    };

    const afterMidnight = maybeResetUsage(beforeMidnight, new Date('2024-01-01T23:10:00Z'));

    expect(afterMidnight.dayKey).toBe(getBerlinDayKey(new Date('2024-01-01T23:10:00Z')));
    expect(afterMidnight.tokensUsedToday).toBe(0);
    expect(afterMidnight.apiCallsToday).toBe(0);
  });

  it('records api calls and token usage when invoked', () => {
    const now = new Date('2024-01-02T10:00:00Z');
    const initial = readUsage(now);
    expect(initial.tokensUsedToday).toBe(0);
    expect(initial.apiCallsToday).toBe(0);

    const updated = recordApiCall({ tokensUsed: 120, now });

    expect(updated.tokensUsedToday).toBe(120);
    expect(updated.apiCallsToday).toBe(1);

    const persisted = readUsage(now);
    expect(persisted.tokensUsedToday).toBe(120);
    expect(persisted.apiCallsToday).toBe(1);
  });

  it('provides default budgets and allows overrides', () => {
    const defaults = getBudgets();

    expect(defaults.dailyTokenBudget).toBeGreaterThan(0);
    expect(defaults.warn80).toBe(Math.floor(defaults.dailyTokenBudget * 0.8));
    expect(defaults.warn95).toBe(Math.floor(defaults.dailyTokenBudget * 0.95));
    expect(defaults.perRequestOutputTokenCap).toBeGreaterThan(0);

    const updated = setBudgets({ dailyTokenBudget: 1000, perRequestOutputTokenCap: 200 });

    expect(updated.dailyTokenBudget).toBe(1000);
    expect(updated.warn80).toBe(800);
    expect(updated.warn95).toBe(950);
    expect(updated.perRequestOutputTokenCap).toBe(200);
  });
});

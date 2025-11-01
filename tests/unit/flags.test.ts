/**
 * Alpha Issue 0: Bootstrap & Flags
 * Tests for flag parsing and provider configuration
 */

import { describe, it, expect } from 'vitest';
import { pickProvider, isAITeaserEnabled, getPerformanceBudgets } from '@/lib/config/flags';

describe('flags', () => {
  it('reads defaults safely', () => {
    const f = pickProvider();
    expect(['dexpaprika', 'moralis', 'mock']).toContain(f.primary);
    expect(['moralis', 'none']).toContain(f.secondary);
    expect(['none', 'openai', 'grok', 'anthropic']).toContain(f.ai);
  });

  it('returns performance budgets with defaults', () => {
    const budgets = getPerformanceBudgets();
    expect(budgets.startMs).toBeGreaterThan(0);
    expect(budgets.apiMedianMs).toBeGreaterThan(0);
    expect(budgets.aiTeaserP95Ms).toBeGreaterThan(0);
  });

  it('checks AI teaser flag', () => {
    const enabled = isAITeaserEnabled();
    expect(typeof enabled).toBe('boolean');
  });
});

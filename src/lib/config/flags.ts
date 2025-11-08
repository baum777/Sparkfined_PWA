/**
 * Alpha Issue 0: Bootstrap & Flags
 * Feature flags and provider configuration management
 */

import { ENV } from '@/config/env';

export type DataProvider = 'dexpaprika' | 'moralis' | 'mock';
export type AIProvider = 'none' | 'openai' | 'grok' | 'anthropic';

export interface ProviderConfig {
  primary: DataProvider;
  secondary: DataProvider | 'none';
  ai: AIProvider;
}

/**
 * Read provider flags from environment
 * @returns ProviderConfig with defaults
 */
export function pickProvider(): ProviderConfig {
  const primary = (ENV.DATA_PRIMARY_PROVIDER || 'dexpaprika') as DataProvider;
  const secondary = (ENV.DATA_SECONDARY_PROVIDER || 'moralis') as DataProvider | 'none';
  const ai = ENV.ANALYSIS_AI_PROVIDER as AIProvider;

  return {
    primary,
    secondary,
    ai,
  };
}

/**
 * Check if AI teaser is enabled
 */
export function isAITeaserEnabled(): boolean {
  return ENV.ENABLE_AI_TEASER;
}

/**
 * Get performance budgets from environment
 */
export function getPerformanceBudgets() {
  return {
    startMs: ENV.PERF_BUDGET_START_MS,
    apiMedianMs: ENV.PERF_BUDGET_API_MEDIAN_MS,
    aiTeaserP95Ms: ENV.PERF_BUDGET_AI_TEASER_P95_MS,
    replayOpenP95Ms: ENV.PERF_BUDGET_REPLAY_OPEN_P95_MS,
    journalSaveMs: ENV.PERF_BUDGET_JOURNAL_SAVE_MS,
    journalGridMs: ENV.PERF_BUDGET_JOURNAL_GRID_MS,
    exportZipP95Ms: ENV.PERF_BUDGET_EXPORT_ZIP_P95_MS,
  };
}

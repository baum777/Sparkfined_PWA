/**
 * Alpha Issue 0: Bootstrap & Flags
 * Feature flags and provider configuration management
 */

export type DataProvider = 'dexpaprika' | 'moralis' | 'mock';
export type AIProvider = 'none' | 'openai' | 'grok' | 'anthropic';
export type LiveDataMode = 'polling' | 'websocket' | 'auto';

export interface ProviderConfig {
  primary: DataProvider;
  secondary: DataProvider | 'none';
  ai: AIProvider;
}

export interface LiveDataConfig {
  enabled: boolean;
  mode: LiveDataMode;
  activePollIntervalMs: number;
  passivePollIntervalMs: number;
  solanaWsUrl: string | null;
}

/**
 * Read provider flags from environment
 * @returns ProviderConfig with defaults
 */
export function pickProvider(): ProviderConfig {
  const primary = (import.meta.env.VITE_DATA_PRIMARY || 'dexpaprika') as DataProvider;
  const secondary = (import.meta.env.VITE_DATA_SECONDARY || 'moralis') as DataProvider | 'none';
  const ai = (import.meta.env.VITE_ANALYSIS_AI_PROVIDER || 'none') as AIProvider;

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
  return import.meta.env.VITE_ENABLE_AI_TEASER === 'true';
}

/**
 * Get Live Data v1 configuration
 */
export function getLiveDataConfig(): LiveDataConfig {
  const enabled = import.meta.env.VITE_LIVE_V1_ENABLED === 'true';
  const mode = (import.meta.env.VITE_LIVE_DATA_MODE || 'auto') as LiveDataMode;
  const activePollIntervalMs = Number(import.meta.env.VITE_LIVE_POLL_INTERVAL_MS) || 3000;
  const passivePollIntervalMs = Number(import.meta.env.VITE_LIVE_PASSIVE_INTERVAL_MS) || 15000;
  const solanaWsUrl = import.meta.env.VITE_SOLANA_WS_URL || null;

  return {
    enabled,
    mode,
    activePollIntervalMs,
    passivePollIntervalMs,
    solanaWsUrl,
  };
}

/**
 * Check if Live Data v1 is enabled
 */
export function isLiveDataEnabled(): boolean {
  return getLiveDataConfig().enabled;
}

/**
 * Get performance budgets from environment
 */
export function getPerformanceBudgets() {
  return {
    startMs: Number(import.meta.env.PERF_BUDGET_START_MS) || 1000,
    apiMedianMs: Number(import.meta.env.PERF_BUDGET_API_MEDIAN_MS) || 500,
    aiTeaserP95Ms: Number(import.meta.env.PERF_BUDGET_AI_TEASER_P95_MS) || 2000,
    replayOpenP95Ms: Number(import.meta.env.PERF_BUDGET_REPLAY_OPEN_P95_MS) || 350,
    journalSaveMs: Number(import.meta.env.PERF_BUDGET_JOURNAL_SAVE_MS) || 60,
    journalGridMs: Number(import.meta.env.PERF_BUDGET_JOURNAL_GRID_MS) || 250,
    exportZipP95Ms: Number(import.meta.env.PERF_BUDGET_EXPORT_ZIP_P95_MS) || 800,
  };
}

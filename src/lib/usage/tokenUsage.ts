export interface TokenUsageState {
  dayKey: string;
  tokensUsedToday: number;
  apiCallsToday: number;
  lastResetAt: string;
}

export interface TokenBudgets {
  dailyTokenBudget: number;
  dailyApiCallBudget?: number;
  warn80: number;
  warn95: number;
  perRequestOutputTokenCap: number;
}

const USAGE_STORAGE_KEY = 'sf-token-usage';
const BUDGETS_STORAGE_KEY = 'sf-token-budgets';

const DEFAULT_TOKEN_BUDGET = 20000;
const DEFAULT_API_CALL_BUDGET = 50;
const DEFAULT_PER_REQUEST_OUTPUT_CAP = 500;

const defaultBudgets: TokenBudgets = {
  dailyTokenBudget: DEFAULT_TOKEN_BUDGET,
  dailyApiCallBudget: DEFAULT_API_CALL_BUDGET,
  warn80: Math.floor(DEFAULT_TOKEN_BUDGET * 0.8),
  warn95: Math.floor(DEFAULT_TOKEN_BUDGET * 0.95),
  perRequestOutputTokenCap: DEFAULT_PER_REQUEST_OUTPUT_CAP,
};

const getStorage = () => {
  if (typeof globalThis === 'undefined') return undefined;
  try {
    return globalThis.localStorage;
  } catch (error) {
    return undefined;
  }
};

const safeGetItem = (storage: Storage, key: string): string | null => {
  try {
    return storage.getItem(key);
  } catch (error) {
    return null;
  }
};

const safeSetItem = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
  } catch (error) {
    // Swallow quota/private-mode errors; token usage should never crash the UI.
  }
};

export const isTokenUsageStorageAvailable = (): boolean => {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const probeKey = '__sf_token_usage_probe__';
    storage.setItem(probeKey, '1');
    storage.removeItem(probeKey);
    return true;
  } catch (error) {
    return false;
  }
};

export const getBerlinDayKey = (now: Date = new Date()): string => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Berlin',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  return formatter.format(now);
};

const createDefaultState = (now: Date = new Date()): TokenUsageState => {
  const dayKey = getBerlinDayKey(now);
  return {
    dayKey,
    tokensUsedToday: 0,
    apiCallsToday: 0,
    lastResetAt: now.toISOString(),
  };
};

export const maybeResetUsage = (state: TokenUsageState, now: Date = new Date()): TokenUsageState => {
  const currentDayKey = getBerlinDayKey(now);
  if (state.dayKey === currentDayKey) {
    return state;
  }

  return {
    dayKey: currentDayKey,
    tokensUsedToday: 0,
    apiCallsToday: 0,
    lastResetAt: now.toISOString(),
  };
};

export const readUsage = (now: Date = new Date()): TokenUsageState => {
  const storage = getStorage();
  if (!storage) {
    return createDefaultState(now);
  }

  const raw = safeGetItem(storage, USAGE_STORAGE_KEY);
  if (!raw) {
    const initial = createDefaultState(now);
    safeSetItem(storage, USAGE_STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const parsed = JSON.parse(raw) as TokenUsageState;
    const reset = maybeResetUsage(parsed, now);
    safeSetItem(storage, USAGE_STORAGE_KEY, JSON.stringify(reset));
    return reset;
  } catch (error) {
    const fallback = createDefaultState(now);
    safeSetItem(storage, USAGE_STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

export const recordApiCall = ({ tokensUsed, now = new Date() }: { tokensUsed: number; now?: Date }): TokenUsageState => {
  const storage = getStorage();
  const current = readUsage(now);

  const updated: TokenUsageState = {
    ...current,
    tokensUsedToday: current.tokensUsedToday + Math.max(0, tokensUsed),
    apiCallsToday: current.apiCallsToday + 1,
    lastResetAt: current.lastResetAt,
  };

  if (storage) {
    safeSetItem(storage, USAGE_STORAGE_KEY, JSON.stringify(updated));
  }

  return updated;
};

export const getBudgets = (): TokenBudgets => {
  const storage = getStorage();
  if (!storage) return defaultBudgets;

  const raw = safeGetItem(storage, BUDGETS_STORAGE_KEY);
  if (!raw) return defaultBudgets;

  try {
    const parsed = JSON.parse(raw) as TokenBudgets;
    return {
      dailyTokenBudget: parsed.dailyTokenBudget ?? defaultBudgets.dailyTokenBudget,
      dailyApiCallBudget: parsed.dailyApiCallBudget ?? defaultBudgets.dailyApiCallBudget,
      perRequestOutputTokenCap: parsed.perRequestOutputTokenCap ?? defaultBudgets.perRequestOutputTokenCap,
      warn80: parsed.warn80 ?? Math.floor((parsed.dailyTokenBudget ?? defaultBudgets.dailyTokenBudget) * 0.8),
      warn95: parsed.warn95 ?? Math.floor((parsed.dailyTokenBudget ?? defaultBudgets.dailyTokenBudget) * 0.95),
    };
  } catch (error) {
    return defaultBudgets;
  }
};

export const setBudgets = (budgets: Partial<TokenBudgets>): TokenBudgets => {
  const storage = getStorage();
  const existing = getBudgets();
  const merged: TokenBudgets = {
    ...existing,
    ...budgets,
  };

  const normalized: TokenBudgets = {
    dailyTokenBudget: merged.dailyTokenBudget,
    dailyApiCallBudget: merged.dailyApiCallBudget,
    perRequestOutputTokenCap: merged.perRequestOutputTokenCap,
    warn80: budgets.warn80 ?? Math.floor(merged.dailyTokenBudget * 0.8),
    warn95: budgets.warn95 ?? Math.floor(merged.dailyTokenBudget * 0.95),
  };

  if (storage) {
    safeSetItem(storage, BUDGETS_STORAGE_KEY, JSON.stringify(normalized));
  }

  return normalized;
};

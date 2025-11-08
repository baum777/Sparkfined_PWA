type IssueKind = 'missing' | 'warning'

interface Issue {
  key: string
  description: string
}

interface ReadOptions<T> {
  defaultValue?: T
  description?: string
  required?: boolean
  warnWhenEmpty?: boolean
  fallbackKeys?: string[]
}

const RAW_ENV = (import.meta as any)?.env ?? {}

const issues: Record<IssueKind, Issue[]> = {
  missing: [],
  warning: [],
}

const toTrimmed = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : undefined
  }
  return typeof value === 'number' ? String(value) : undefined
}

const recordIssue = (
  kind: IssueKind,
  key: string,
  description?: string
): void => {
  const existing = issues[kind].some((entry) => entry.key === key)
  if (!existing) {
    issues[kind].push({
      key,
      description: description ?? key,
    })
  }
}

const readRaw = (
  key: string,
  fallbackKeys?: string[]
): string | undefined => {
  const keys = [key, ...(fallbackKeys ?? [])]
  for (const candidate of keys) {
    const raw = toTrimmed(RAW_ENV[candidate])
    if (typeof raw === 'string' && raw.length > 0) {
      return raw
    }
  }
  return undefined
}

const readString = (
  key: string,
  options: ReadOptions<string> = {}
): string => {
  const value = readRaw(key, options.fallbackKeys)

  if (value !== undefined) {
    return value
  }

  if (options.required) {
    recordIssue('missing', key, options.description)
  } else if (options.warnWhenEmpty) {
    recordIssue('warning', key, options.description)
  }

  return options.defaultValue ?? ''
}

const readBoolean = (
  key: string,
  options: ReadOptions<boolean> = {}
): boolean => {
  const raw = readRaw(key, options.fallbackKeys)

  if (raw === undefined) {
    if (options.required) {
      recordIssue('missing', key, options.description)
    }
    return options.defaultValue ?? false
  }

  const normalized = raw.toLowerCase()
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false
  }

  // Fall back to boolean coercion for non-standard values
  return Boolean(raw)
}

const readNumber = (
  key: string,
  options: ReadOptions<number> = {}
): number => {
  const raw = readRaw(key, options.fallbackKeys)

  if (raw === undefined) {
    if (options.required) {
      recordIssue('missing', key, options.description)
    }
    return options.defaultValue ?? 0
  }

  const value = Number(raw)

  if (Number.isNaN(value)) {
    if (options.required) {
      recordIssue('missing', key, options.description)
    } else if (options.warnWhenEmpty) {
      recordIssue('warning', key, options.description)
    }
    return options.defaultValue ?? 0
  }

  return value
}

export const ENV = Object.freeze({
  MODE: RAW_ENV.MODE ?? 'development',
  DEV: Boolean(RAW_ENV.DEV),
  PROD: Boolean(RAW_ENV.PROD),
  BASE_URL: RAW_ENV.BASE_URL ?? '/',
  VERCEL_ENV: readString('VITE_VERCEL_ENV'),

  APP_VERSION: readString('VITE_APP_VERSION', { defaultValue: 'dev' }),

  API_BASE_URL: readString('VITE_API_BASE_URL', { defaultValue: 'http://localhost:3000' }),
  API_KEY: readString('VITE_API_KEY', { defaultValue: '' }),

  MORALIS_API_KEY: readString('VITE_MORALIS_API_KEY', {
    required: true,
    description: 'Moralis API key (charts)',
  }),
  MORALIS_BASE_URL: readString('VITE_MORALIS_BASE', {
    defaultValue: 'https://deep-index.moralis.io/api/v2.2',
  }),

  DEXPAPRIKA_BASE_URL: readString('VITE_DEXPAPRIKA_BASE', {
    defaultValue: '',
    warnWhenEmpty: true,
    description: 'DexPaprika API base URL (fallback provider)',
  }),

  OPENAI_API_KEY: readString('VITE_OPENAI_API_KEY', {
    defaultValue: '',
    warnWhenEmpty: true,
    description: 'OpenAI API key (AI analysis)',
    fallbackKeys: ['OPENAI_API_KEY'],
  }),
  GROK_API_KEY: readString('VITE_GROK_API_KEY', {
    defaultValue: '',
    fallbackKeys: ['GROK_API_KEY'],
  }),
  ANTHROPIC_API_KEY: readString('VITE_ANTHROPIC_API_KEY', {
    defaultValue: '',
    fallbackKeys: ['ANTHROPIC_API_KEY'],
  }),

  VAPID_PUBLIC_KEY: readString('VITE_VAPID_PUBLIC_KEY', {
    defaultValue: '',
    warnWhenEmpty: true,
    description: 'VAPID public key (push notifications)',
  }),

  ENABLE_AI_TEASER: readBoolean('VITE_ENABLE_AI_TEASER', { defaultValue: false }),
  ENABLE_ANALYTICS: readBoolean('VITE_ENABLE_ANALYTICS', { defaultValue: false }),
  ENABLE_METRICS: readBoolean('VITE_ENABLE_METRICS', { defaultValue: true }),
  ENABLE_DEBUG: readBoolean('VITE_ENABLE_DEBUG', { defaultValue: false }),
  DEBUG_FLAG: readBoolean('VITE_DEBUG', { defaultValue: false }),

  ORDERFLOW_PROVIDER: readString('VITE_ORDERFLOW_PROVIDER', { defaultValue: 'none' }),
  WALLETFLOW_PROVIDER: readString('VITE_WALLETFLOW_PROVIDER', { defaultValue: 'none' }),

  DATA_PRIMARY_PROVIDER: readString('VITE_DATA_PRIMARY', { defaultValue: 'dexpaprika' }),
  DATA_SECONDARY_PROVIDER: readString('VITE_DATA_SECONDARY', { defaultValue: 'moralis' }),
  DATA_FALLBACK_PROVIDERS: readString('VITE_DATA_FALLBACKS', { defaultValue: 'dexscreener,pumpfun' }),

  ANALYSIS_AI_PROVIDER: readString('VITE_ANALYSIS_AI_PROVIDER', {
    defaultValue: 'none',
    fallbackKeys: ['ANALYSIS_AI_PROVIDER'],
  }) as 'none' | 'openai' | 'grok' | 'anthropic',

  DEX_API_BASE: readString('DEX_API_BASE', { defaultValue: 'https://api.dexscreener.com' }),
  DEX_API_TIMEOUT: readNumber('DEX_API_TIMEOUT', { defaultValue: 5000 }),

  PUMPFUN_API_BASE: readString('PUMPFUN_API_BASE', { defaultValue: 'https://api.pump.fun' }),
  PUMPFUN_API_TIMEOUT: readNumber('PUMPFUN_API_TIMEOUT', { defaultValue: 5000 }),

  PERF_BUDGET_START_MS: readNumber('PERF_BUDGET_START_MS', { defaultValue: 1000 }),
  PERF_BUDGET_API_MEDIAN_MS: readNumber('PERF_BUDGET_API_MEDIAN_MS', { defaultValue: 500 }),
  PERF_BUDGET_AI_TEASER_P95_MS: readNumber('PERF_BUDGET_AI_TEASER_P95_MS', { defaultValue: 2000 }),
  PERF_BUDGET_REPLAY_OPEN_P95_MS: readNumber('PERF_BUDGET_REPLAY_OPEN_P95_MS', { defaultValue: 350 }),
  PERF_BUDGET_JOURNAL_SAVE_MS: readNumber('PERF_BUDGET_JOURNAL_SAVE_MS', { defaultValue: 60 }),
  PERF_BUDGET_JOURNAL_GRID_MS: readNumber('PERF_BUDGET_JOURNAL_GRID_MS', { defaultValue: 250 }),
  PERF_BUDGET_EXPORT_ZIP_P95_MS: readNumber('PERF_BUDGET_EXPORT_ZIP_P95_MS', { defaultValue: 800 }),

  ACCESS_OG_SYMBOL: readString('VITE_ACCESS_OG_SYMBOL', { defaultValue: 'OGPASS' }),
  SOLANA_NETWORK: readString('VITE_SOLANA_NETWORK', { defaultValue: 'devnet' }) as
    | 'devnet'
    | 'mainnet-beta',
  SOLANA_RPC_URL: readString('VITE_SOLANA_RPC_URL', {
    defaultValue: 'https://api.devnet.solana.com',
  }),
  ACCESS_TOKEN_MINT: readString('VITE_ACCESS_TOKEN_MINT', {
    defaultValue: 'So11111111111111111111111111111111111111112',
  }),
  METAPLEX_COLLECTION_MINT: readString('VITE_METAPLEX_COLLECTION_MINT'),
})

export interface EnvSummary {
  missing: Issue[]
  warnings: Issue[]
  isReady: boolean
}

const summary: EnvSummary = {
  missing: issues.missing,
  warnings: issues.warning,
  isReady: issues.missing.length === 0,
}

export const getEnvSummary = (): EnvSummary => ({
  missing: [...summary.missing],
  warnings: [...summary.warnings],
  isReady: summary.isReady,
})

export const assertRequiredEnv = (): void => {
  if (summary.missing.length > 0) {
    const missingList = summary.missing.map((item) => item.key).join(', ')
    throw new Error(`Missing required environment variables: ${missingList}`)
  }
}


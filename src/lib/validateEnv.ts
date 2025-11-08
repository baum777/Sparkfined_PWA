import { ENV, getEnvSummary } from '@/config/env'

export interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
}

export function validateEnv(): EnvValidationResult {
  const summary = getEnvSummary()

  return {
    isValid: summary.isReady,
    missing: summary.missing.map(
      (item) => `${item.key}: ${item.description}`
    ),
    warnings: summary.warnings.map(
      (item) => `${item.key}: ${item.description}`
    ),
  }
}

export function hasFeature(feature: 'ai' | 'notifications' | 'charts'): boolean {
  switch (feature) {
    case 'ai':
      return Boolean(
        ENV.OPENAI_API_KEY || ENV.ANTHROPIC_API_KEY
      )
    case 'notifications':
      return Boolean(ENV.VAPID_PUBLIC_KEY)
    case 'charts':
      return Boolean(
        ENV.MORALIS_API_KEY || ENV.DEXPAPRIKA_BASE_URL
      )
    default:
      return false
  }
}

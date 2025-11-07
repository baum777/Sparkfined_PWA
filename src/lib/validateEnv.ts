/**
 * Runtime Environment Validator
 * Checks for required API keys and env vars at app startup
 */

export interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
}

interface EnvCheck {
  key: string
  required: boolean
  description: string
}

const ENV_CHECKS: EnvCheck[] = [
  // CRITICAL - App won't function without these
  {
    key: 'VITE_MORALIS_API_KEY',
    required: true,
    description: 'Moralis API key (for chart data)',
  },
  {
    key: 'VITE_DEXPAPRIKA_BASE',
    required: false,
    description: 'DexPaprika API base URL (fallback provider)',
  },
  
  // OPTIONAL - App works but features degraded
  {
    key: 'VITE_OPENAI_API_KEY',
    required: false,
    description: 'OpenAI API key (for AI analysis)',
  },
  {
    key: 'VITE_VAPID_PUBLIC_KEY',
    required: false,
    description: 'VAPID public key (for push notifications)',
  },
]

/**
 * Validate environment variables at runtime
 * Returns list of missing/invalid keys
 */
export function validateEnv(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []

  for (const check of ENV_CHECKS) {
    const value = import.meta.env[check.key]
    
    if (!value || value === '') {
      if (check.required) {
        missing.push(`${check.key}: ${check.description}`)
      } else {
        warnings.push(`${check.key}: ${check.description}`)
      }
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
  }
}

/**
 * Check if specific feature is available based on env vars
 */
export function hasFeature(feature: 'ai' | 'notifications' | 'charts'): boolean {
  switch (feature) {
    case 'ai':
      return !!(import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.VITE_ANTHROPIC_API_KEY)
    case 'notifications':
      return !!(import.meta.env.VITE_VAPID_PUBLIC_KEY)
    case 'charts':
      return !!(import.meta.env.VITE_MORALIS_API_KEY || import.meta.env.VITE_DEXPAPRIKA_BASE)
    default:
      return false
  }
}

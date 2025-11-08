import { ENV, getEnvSummary } from '@/config/env'

export { ENV, getEnvSummary, assertRequiredEnv } from '@/config/env'

/**
 * Early environment validation guard.
 * Logs contextual warnings without crashing the app.
 */
export function validateEnv(): void {
  const summary = getEnvSummary()

  if (summary.missing.length > 0) {
    console.warn('[env] Missing required environment variables:', summary.missing)
    console.warn('[env] App will run with reduced functionality')
  } else if (summary.warnings.length > 0) {
    console.warn('[env] Optional environment variables missing:', summary.warnings)
  } else if (ENV.DEV) {
    console.log('[env] All tracked environment variables present')
  }
}

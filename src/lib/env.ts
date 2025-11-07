/**
 * Environment Variable Validator
 * Ensures critical ENV vars are present at runtime
 * Prevents crashes from undefined VITE_* variables
 */

export interface EnvConfig {
  VITE_VERCEL_ENV?: string;
  // Add other critical ENV vars as needed
}

/**
 * Get environment variables with safe fallbacks
 */
export function getEnv(): EnvConfig {
  if (typeof import.meta.env === 'undefined') {
    console.warn('[env] import.meta.env is undefined');
    return {};
  }
  
  return {
    VITE_VERCEL_ENV: import.meta.env.VITE_VERCEL_ENV,
  };
}

/**
 * Check if critical ENV vars are missing (non-fatal)
 * Returns list of missing vars for UI warning banner
 */
export function getMissingEnvVars(): string[] {
  const env = getEnv();
  const missing: string[] = [];
  
  // Optional vars - only warn in preview/prod
  // (Currently no critical ENV vars to check)
  
  return missing;
}

/**
 * Early ENV check - logs warnings but doesn't crash
 * Call in main.tsx before React render
 */
export function validateEnv(): void {
  const missing = getMissingEnvVars();
  
  if (missing.length > 0) {
    console.warn('[env] Missing ENV vars (non-fatal):', missing);
    console.warn('[env] App will run with reduced functionality');
  } else if (import.meta.env.DEV) {
    console.log('[env] All critical ENV vars present');
  }
}

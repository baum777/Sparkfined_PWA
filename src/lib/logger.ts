import { ENV } from '@/config/env'

/**
 * Centralized Logger
 * Wraps console statements with env-based filtering
 * Only logs in development mode unless VITE_DEBUG=true
 */

const isDev = ENV.DEV
const isDebugEnabled = ENV.DEBUG_FLAG || ENV.ENABLE_DEBUG

const shouldLog = isDev || isDebugEnabled

/**
 * Log info message (only in dev or debug mode)
 */
export const log = (...args: unknown[]): void => {
  if (shouldLog) {
    console.log(...args)
  }
}

/**
 * Log warning (always enabled)
 */
export const warn = (...args: unknown[]): void => {
  console.warn(...args)
}

/**
 * Log error (always enabled)
 */
export const error = (...args: unknown[]): void => {
  console.error(...args)
}

/**
 * Log debug message (only in dev mode with verbose)
 */
export const debug = (...args: unknown[]): void => {
  if (isDev) {
    console.debug(...args)
  }
}

/**
 * Log telemetry/metrics (only if enabled)
 */
export const metric = (name: string, value: number, metadata?: Record<string, unknown>): void => {
  if (shouldLog) {
    console.log(`[METRIC] ${name}:`, value, metadata || '')
  }
}

/**
 * Logger object (for importing as namespace)
 */
export const logger = {
  log,
  warn,
  error,
  debug,
  metric,
}

export default logger

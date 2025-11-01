/**
 * Market Data Orchestrator - Feature-Flag Routing & Fallbacks
 *
 * Orchestrates data fetching across multiple providers with:
 * - Feature-flag based primary selection (DexPaprika vs Moralis)
 * - Automatic fallback chain (Primary → Fallback1 → Fallback2 → ...)
 * - Timeout controls per provider
 * - Telemetry logging for provider switches
 * - Performance tracking
 *
 * Flow:
 * 1. Check ENV for DATA_PRIMARY (dexpaprika | moralis)
 * 2. Try primary with timeout
 * 3. On error/timeout → try fallbacks in order
 * 4. Log all provider switches for analytics
 *
 * @module lib/data/marketOrchestrator
 */

import type { MarketSnapshot, AdapterResponse, ChainId, ProviderId } from '../../types/market'
import { getDexPaprikaSnapshot } from '../adapters/dexpaprikaAdapter'
import { getMoralisSnapshot } from '../adapters/moralisAdapter'
import { getDexscreenerToken } from '../adapters/dexscreenerAdapter'
import { getPumpfunData } from '../adapters/pumpfunAdapter'

// ============================================================================
// CONFIGURATION
// ============================================================================

interface OrchestratorConfig {
  primary: ProviderId
  fallbacks: ProviderId[]
  timeout: number
  maxRetries: number
  enableTelemetry: boolean
}

/**
 * Load configuration from environment variables
 */
function loadConfig(): OrchestratorConfig {
  const primary = (import.meta.env.VITE_DATA_PRIMARY || 'dexpaprika') as ProviderId
  const fallbacksStr = import.meta.env.VITE_DATA_FALLBACKS || 'dexscreener,pumpfun'
  const fallbacks = fallbacksStr.split(',').map((f: string) => f.trim()) as ProviderId[]

  return {
    primary,
    fallbacks,
    timeout: 8000, // 8s global timeout
    maxRetries: 2,
    enableTelemetry: import.meta.env.VITE_ENABLE_METRICS !== 'false',
  }
}

const CONFIG = loadConfig()

// ============================================================================
// TELEMETRY
// ============================================================================

interface TelemetryEvent {
  type: 'provider_switch' | 'provider_failure' | 'provider_success'
  provider: ProviderId
  reason?: string
  latency?: number
  timestamp: number
}

const telemetryEvents: TelemetryEvent[] = []

/**
 * Log telemetry event
 */
function logTelemetry(event: Omit<TelemetryEvent, 'timestamp'>) {
  if (!CONFIG.enableTelemetry) return

  const fullEvent: TelemetryEvent = {
    ...event,
    timestamp: Date.now(),
  }

  telemetryEvents.push(fullEvent)

  // Keep last 100 events only
  if (telemetryEvents.length > 100) {
    telemetryEvents.shift()
  }

  // Log to console in dev mode
  if (import.meta.env.DEV) {
    console.log('[MarketOrchestrator]', fullEvent)
  }
}

/**
 * Get telemetry events (for debugging/analytics)
 */
export function getOrchestratorTelemetry(): TelemetryEvent[] {
  return [...telemetryEvents]
}

/**
 * Clear telemetry history
 */
export function clearOrchestratorTelemetry(): void {
  telemetryEvents.length = 0
}

// ============================================================================
// ADAPTER MAPPING
// ============================================================================

type AdapterFunction = (
  address: string,
  chain: ChainId,
  forceRefresh?: boolean
) => Promise<AdapterResponse<MarketSnapshot>>

/**
 * Map provider ID to adapter function
 */
function getAdapter(provider: ProviderId): AdapterFunction | null {
  switch (provider) {
    case 'dexpaprika':
      return getDexPaprikaSnapshot
    case 'moralis':
      return getMoralisSnapshot
    case 'dexscreener':
      // Wrap existing dexscreener adapter to match signature
      return async (address, _chain) => {
        try {
          const data = await getDexscreenerToken(address)
          if (!data) throw new Error('Token not found')

          // Convert to MarketSnapshot format
          const snapshot: MarketSnapshot = {
            token: {
              address: data.address || address,
              symbol: data.symbol || 'UNKNOWN',
              name: data.name || 'Unknown Token',
              chain: (data.chain as ChainId) || 'solana',
            },
            price: {
              current: data.price || 0,
              high24h: data.high24 || 0,
              low24h: data.low24 || 0,
              change24h: data.priceChange24h || 0,
            },
            volume: {
              volume24h: data.vol24 || 0,
            },
            liquidity: {
              total: data.liquidity || 0,
            },
            marketCap: data.marketCap,
            metadata: {
              provider: 'dexscreener',
              timestamp: data.timestamp || Date.now(),
              cached: false,
              confidence: 0.8,
            },
          }

          return {
            success: true,
            data: snapshot,
            metadata: {
              provider: 'dexscreener',
              cached: false,
              latency: 0,
              retries: 0,
            },
          }
        } catch (error) {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
              provider: 'dexscreener',
              timestamp: Date.now(),
            },
            metadata: {
              provider: 'dexscreener',
              cached: false,
              latency: 0,
              retries: 0,
            },
          }
        }
      }
    case 'pumpfun':
      // Wrap pump.fun adapter
      return async (address, _chain) => {
        try {
          const data = await getPumpfunData(address)
          if (!data) throw new Error('Token not found')

          const snapshot: MarketSnapshot = {
            token: {
              address,
              symbol: data.symbol || 'UNKNOWN',
              name: data.name || 'Unknown Token',
              chain: 'solana',
            },
            price: {
              current: 0,
              high24h: 0,
              low24h: 0,
              change24h: 0,
            },
            volume: {
              volume24h: 0,
            },
            liquidity: {
              total: data.liquidity || 0,
            },
            social: {
              website: data.socialLinks?.website,
              twitter: data.socialLinks?.twitter,
              telegram: data.socialLinks?.telegram,
            },
            metadata: {
              provider: 'pumpfun',
              timestamp: Date.now(),
              cached: false,
              confidence: 0.6,
            },
          }

          return {
            success: true,
            data: snapshot,
            metadata: {
              provider: 'pumpfun',
              cached: false,
              latency: 0,
              retries: 0,
            },
          }
        } catch (error) {
          return {
            success: false,
            error: {
              code: 'NETWORK_ERROR',
              message: error instanceof Error ? error.message : 'Unknown error',
              provider: 'pumpfun',
              timestamp: Date.now(),
            },
            metadata: {
              provider: 'pumpfun',
              cached: false,
              latency: 0,
              retries: 0,
            },
          }
        }
      }
    default:
      return null
  }
}

// ============================================================================
// ORCHESTRATION
// ============================================================================

interface FetchResult {
  snapshot?: MarketSnapshot
  provider: ProviderId
  latency: number
  error?: string
}

/**
 * Try fetching from a single provider with timeout
 */
async function tryProvider(
  provider: ProviderId,
  address: string,
  chain: ChainId,
  timeout: number
): Promise<FetchResult> {
  const startTime = Date.now()

  try {
    const adapter = getAdapter(provider)
    if (!adapter) {
      throw new Error(`Unknown provider: ${provider}`)
    }

    // Race between adapter call and timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout')), timeout)
    })

    const response = await Promise.race([adapter(address, chain, false), timeoutPromise])

    const latency = Date.now() - startTime

    if (response.success && response.data) {
      logTelemetry({
        type: 'provider_success',
        provider,
        latency,
      })

      return {
        snapshot: response.data,
        provider,
        latency,
      }
    } else {
      const errorMsg = response.error?.message || 'Unknown error'
      logTelemetry({
        type: 'provider_failure',
        provider,
        reason: errorMsg,
        latency,
      })

      return {
        provider,
        latency,
        error: errorMsg,
      }
    }
  } catch (error) {
    const latency = Date.now() - startTime
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'

    logTelemetry({
      type: 'provider_failure',
      provider,
      reason: errorMsg,
      latency,
    })

    return {
      provider,
      latency,
      error: errorMsg,
    }
  }
}

/**
 * Get market snapshot with automatic fallback chain
 *
 * @param address - Token contract address
 * @param chain - Blockchain (default: 'solana')
 * @returns MarketSnapshot with metadata about provider used
 */
export async function getMarketSnapshot(
  address: string,
  chain: ChainId = 'solana'
): Promise<{
  snapshot: MarketSnapshot | null
  provider: ProviderId
  fallbackUsed: boolean
  attempts: number
  totalLatency: number
}> {
  const startTime = Date.now()
  const providers = [CONFIG.primary, ...CONFIG.fallbacks]
  let attempts = 0

  // Try each provider in order
  for (const provider of providers) {
    attempts++

    const result = await tryProvider(provider, address, chain, CONFIG.timeout)

    if (result.snapshot) {
      // Success!
      const fallbackUsed = attempts > 1

      if (fallbackUsed) {
        logTelemetry({
          type: 'provider_switch',
          provider,
          reason: `Fallback after ${attempts - 1} failed attempt(s)`,
        })
      }

      return {
        snapshot: result.snapshot,
        provider,
        fallbackUsed,
        attempts,
        totalLatency: Date.now() - startTime,
      }
    }

    // Log failure and try next provider
    if (import.meta.env.DEV) {
      console.warn(`[MarketOrchestrator] ${provider} failed: ${result.error}`)
    }
  }

  // All providers failed
  return {
    snapshot: null,
    provider: CONFIG.primary,
    fallbackUsed: false,
    attempts,
    totalLatency: Date.now() - startTime,
  }
}

/**
 * Get market snapshots for multiple tokens (batch)
 */
export async function getMarketSnapshotBatch(
  addresses: string[],
  chain: ChainId = 'solana'
): Promise<
  Array<{
    address: string
    snapshot: MarketSnapshot | null
    provider: ProviderId
    fallbackUsed: boolean
  }>
> {
  const results = await Promise.all(
    addresses.map(async (address) => {
      const result = await getMarketSnapshot(address, chain)
      return {
        address,
        ...result,
      }
    })
  )

  return results
}

/**
 * Get current orchestrator configuration
 */
export function getOrchestratorConfig(): OrchestratorConfig {
  return { ...CONFIG }
}

/**
 * Reload configuration from environment (for hot-reload during dev)
 */
export function reloadOrchestratorConfig(): void {
  const newConfig = loadConfig()
  Object.assign(CONFIG, newConfig)
}

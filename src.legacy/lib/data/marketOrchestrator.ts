import { Telemetry } from '@/lib/TelemetryService'
import { SWRCache } from '@/lib/cache/swrCache'
import { ProviderHealthTracker } from '@/lib/markets/providerHealthTracker'
import type { AdapterResponse, ChainId, MarketSnapshot, ProviderId } from '@/types/market'
import { getDexPaprikaSnapshot } from '../adapters/dexpaprikaAdapter'
import { getMoralisSnapshot } from '../adapters/moralisAdapter'
import { getDexscreenerToken } from '../adapters/dexscreenerAdapter'

export type TokenSnapshotParams = {
  address: string
  chain?: ChainId
  symbol?: string
}

export interface TokenSnapshot {
  symbol: string
  address: string
  chain: ChainId
  price: number
  change24h?: number
  marketCap?: number
  volume24h?: number
  provider: ProviderId
  latencyMs?: number
  timestamp: number
  cached?: boolean
}

export class MarketDataUnavailableError extends Error {
  constructor(message: string, public causes: unknown[]) {
    super(message)
    this.name = 'MarketDataUnavailableError'
  }
}

const DEFAULT_PROVIDER_ORDER: ProviderId[] = ['moralis', 'dexpaprika', 'dexscreener']
const CACHE_TTL_MS = 60_000
const STALE_WHILE_REVALIDATE_MS = 60_000

export const providerHealthTracker = new ProviderHealthTracker(DEFAULT_PROVIDER_ORDER)
const swrCache = new SWRCache<TokenSnapshot>({
  ttlMs: CACHE_TTL_MS,
  staleWhileRevalidateMs: STALE_WHILE_REVALIDATE_MS,
})

function snapshotFromMarketSnapshot(
  snapshot: MarketSnapshot,
  provider: ProviderId,
  latencyMs: number
): TokenSnapshot {
  return {
    symbol: snapshot.token.symbol,
    address: snapshot.token.address,
    chain: snapshot.token.chain,
    price: snapshot.price.current,
    change24h: snapshot.price.change24h,
    marketCap: snapshot.marketCap,
    volume24h: snapshot.volume.volume24h,
    provider,
    latencyMs,
    timestamp: snapshot.metadata.timestamp ?? Date.now(),
    cached: snapshot.metadata.cached,
  }
}

async function callAdapter(
  provider: ProviderId,
  adapterCall: () => Promise<AdapterResponse<MarketSnapshot>>
): Promise<TokenSnapshot> {
  const start = performance.now()
  try {
    const response = await adapterCall()
    const latencyMs = performance.now() - start

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Unknown provider error')
    }

    providerHealthTracker.recordSuccess(provider, latencyMs)
    return snapshotFromMarketSnapshot(response.data, provider, latencyMs)
  } catch (error) {
    const latencyMs = performance.now() - start
    providerHealthTracker.recordFailure(provider, error, latencyMs)
    throw error
  }
}

async function fetchFromMoralis(params: TokenSnapshotParams): Promise<TokenSnapshot> {
  const chain = params.chain ?? 'solana'
  return callAdapter('moralis', () => getMoralisSnapshot(params.address, chain, false))
}

async function fetchFromDexPaprika(params: TokenSnapshotParams): Promise<TokenSnapshot> {
  const chain = params.chain ?? 'solana'
  return callAdapter('dexpaprika', () => getDexPaprikaSnapshot(params.address, chain, false))
}

async function fetchFromDexScreener(params: TokenSnapshotParams): Promise<TokenSnapshot> {
  const start = performance.now()
  try {
    const response = await getDexscreenerToken(params.address)
    const latencyMs = performance.now() - start

    if (!response) {
      throw new Error('Dexscreener returned empty response')
    }

    const snapshot: TokenSnapshot = {
      symbol: response.symbol || params.symbol || 'UNKNOWN',
      address: response.address ?? params.address,
      chain: (response.chain as ChainId) || params.chain || 'solana',
      price: response.price ?? 0,
      change24h: response.priceChange24h,
      marketCap: response.marketCap,
      volume24h: response.vol24,
      provider: 'dexscreener',
      latencyMs,
      timestamp: response.timestamp ?? Date.now(),
      cached: false,
    }

    providerHealthTracker.recordSuccess('dexscreener', latencyMs)
    return snapshot
  } catch (error) {
    const latencyMs = performance.now() - start
    providerHealthTracker.recordFailure('dexscreener', error, latencyMs)
    throw error
  }
}

export function getProvidersSortedByHealthAndLatency(): ProviderId[] {
  const healthSnapshots = providerHealthTracker
    .getAllHealth()
    .filter((snapshot) => DEFAULT_PROVIDER_ORDER.includes(snapshot.provider))

  const ranked = healthSnapshots.sort((a, b) => {
    if (a.healthScore !== b.healthScore) {
      return b.healthScore - a.healthScore
    }

    const latencyA = a.averageLatencyMs ?? Number.POSITIVE_INFINITY
    const latencyB = b.averageLatencyMs ?? Number.POSITIVE_INFINITY

    if (latencyA !== latencyB) {
      return latencyA - latencyB
    }

    return (
      DEFAULT_PROVIDER_ORDER.indexOf(a.provider) - DEFAULT_PROVIDER_ORDER.indexOf(b.provider)
    )
  })

  return ranked.map((snapshot) => snapshot.provider)
}

export async function fetchFromProviderChain(params: TokenSnapshotParams): Promise<TokenSnapshot> {
  const errors: unknown[] = []
  const providers = getProvidersSortedByHealthAndLatency()

  for (const provider of providers) {
    try {
      const snapshot = await fetchFromProvider(provider, params)
      return snapshot
    } catch (error) {
      errors.push({ provider, error })
    }
  }

  throw new MarketDataUnavailableError('Unable to fetch market data from any provider', errors)
}

async function fetchFromProvider(provider: ProviderId, params: TokenSnapshotParams): Promise<TokenSnapshot> {
  switch (provider) {
    case 'moralis':
      return fetchFromMoralis(params)
    case 'dexpaprika':
      return fetchFromDexPaprika(params)
    case 'dexscreener':
      return fetchFromDexScreener(params)
    default:
      throw new Error(`Unsupported provider ${provider}`)
  }
}

export async function getTokenSnapshot(
  params: TokenSnapshotParams,
  options?: { forceRefresh?: boolean }
): Promise<TokenSnapshot> {
  const key = `tokenSnapshot:${params.address}:${params.chain ?? 'default'}`
  const cacheState = swrCache.get(key).state
  const cacheHit = cacheState !== 'miss' && !options?.forceRefresh

  const start = performance.now()
  const snapshot = await swrCache.fetch(key, () => fetchFromProviderChain(params), options)
  const latencyMs = performance.now() - start

  const resultSnapshot = cacheHit ? { ...snapshot, cached: true } : snapshot

  Telemetry.log('market.provider.used', latencyMs, {
    providerId: snapshot.provider,
    cacheHit,
    state: cacheState,
    forceRefresh: options?.forceRefresh ?? false,
  })

  return resultSnapshot
}

export function resetMarketOrchestratorState(): void {
  swrCache.clear()
  providerHealthTracker.reset()
}

export function getMarketSnapshot(
  address: string,
  chain: ChainId = 'solana',
  options?: { forceRefresh?: boolean }
): Promise<TokenSnapshot> {
  return getTokenSnapshot({ address, chain }, options)
}

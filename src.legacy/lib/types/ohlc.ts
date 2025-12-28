import type { Timeframe as JournalTimeframe } from '@/types/journal'

export type Timeframe = Extract<
  JournalTimeframe,
  '30s' | '1m' | '5m' | '15m' | '1h' | '4h' | '1d'
>

export type OHLCProviderId = 'moralis' | 'dexscreener'

export interface OHLCPoint {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

export interface OHLCSeriesMetadata {
  fetchedAt: number
  address?: string
  chainId?: string
  from?: number
  to?: number
  limit?: number
}

export interface OHLCSeries {
  symbol: string
  timeframe: Timeframe
  points: OHLCPoint[]
  providerId: OHLCProviderId
  metadata?: OHLCSeriesMetadata
}

export interface OHLCProviderResult {
  providerId: OHLCProviderId
  series: OHLCSeries
  raw?: unknown
}

export interface OHLCRequestParams {
  symbol: string
  timeframe: Timeframe
  address?: string
  chainId?: string
  from?: number
  to?: number
  limit?: number
}

export class OHLCProviderError extends Error {
  provider: OHLCProviderId
  code?: string
  override cause?: unknown

  constructor(provider: OHLCProviderId, message: string, code?: string, cause?: unknown) {
    super(message)
    this.name = 'OHLCProviderError'
    this.provider = provider
    this.code = code
    this.cause = cause
  }
}

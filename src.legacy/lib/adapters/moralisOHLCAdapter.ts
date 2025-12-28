import { moralisFetch } from '../moralisProxy'
import { timeframeToInterval } from '../utils/ohlcTimeframe'
import type {
  OHLCPoint,
  OHLCProviderResult,
  OHLCRequestParams,
} from '../types/ohlc'
import { OHLCProviderError } from '../types/ohlc'

interface MoralisOhlcRow {
  time?: number
  timestamp?: number
  open?: number
  high?: number
  low?: number
  close?: number
  volume?: number
  o?: number
  h?: number
  l?: number
  c?: number
  v?: number
}

interface MoralisOhlcResponse {
  data?: { items?: MoralisOhlcRow[] } | MoralisOhlcRow[]
  result?: MoralisOhlcRow[]
  items?: MoralisOhlcRow[]
}

function toMilliseconds(timestamp: number | undefined): number | null {
  if (timestamp == null || Number.isNaN(Number(timestamp))) return null
  const numeric = Number(timestamp)
  return numeric > 1_000_000_000_000 ? numeric : numeric * 1000
}

function normalizeRows(rows: MoralisOhlcRow[]): OHLCPoint[] {
  return rows
    .map((row) => {
      const timestamp =
        toMilliseconds(row.timestamp) ?? toMilliseconds(row.time) ?? toMilliseconds((row as unknown as number[])?.[0])

      const open = row.open ?? row.o ?? (row as unknown as number[])?.[1]
      const high = row.high ?? row.h ?? (row as unknown as number[])?.[2]
      const low = row.low ?? row.l ?? (row as unknown as number[])?.[3]
      const close = row.close ?? row.c ?? (row as unknown as number[])?.[4]
      const volume = row.volume ?? row.v ?? (row as unknown as number[])?.[5]

      if (
        timestamp == null ||
        !Number.isFinite(open as number) ||
        !Number.isFinite(high as number) ||
        !Number.isFinite(low as number) ||
        !Number.isFinite(close as number)
      ) {
        return null
      }

      const normalized: OHLCPoint = {
        timestamp,
        open: Number(open),
        high: Number(high),
        low: Number(low),
        close: Number(close),
      }

      if (volume != null) {
        normalized.volume = Number(volume)
      }

      return normalized
    })
    .filter((row): row is OHLCPoint => Boolean(row))
}

function extractRows(payload: MoralisOhlcResponse | MoralisOhlcRow[] | undefined): MoralisOhlcRow[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray((payload.data as { items?: MoralisOhlcRow[] })?.items)) return (payload.data as { items?: MoralisOhlcRow[] }).items ?? []
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.result)) return payload.result
  return []
}

export async function fetchOHLCFromMoralis(params: OHLCRequestParams): Promise<OHLCProviderResult> {
  const { symbol, timeframe, address, chainId, from, to, limit } = params
  const interval = timeframeToInterval(timeframe)
  const query = new URLSearchParams({ symbol, interval: String(interval) })

  if (address) query.set('address', address)
  if (chainId) query.set('chainId', chainId)
  if (from !== undefined) query.set('from', String(from))
  if (to !== undefined) query.set('to', String(to))
  if (limit !== undefined) query.set('limit', String(limit))

  try {
    const payload = await moralisFetch<MoralisOhlcResponse>(`/ohlc?${query.toString()}`, {
      headers: { accept: 'application/json' },
    })

    const rows = extractRows(payload)
    const points = normalizeRows(rows)

    if (points.length === 0) {
      throw new OHLCProviderError('moralis', 'Moralis returned no OHLC data')
    }

    return {
      providerId: 'moralis',
      series: {
        symbol,
        timeframe,
        providerId: 'moralis',
        points,
        metadata: {
          fetchedAt: Date.now(),
          address,
          chainId,
          from,
          to,
          limit,
        },
      },
      raw: payload,
    }
  } catch (error) {
    if (error instanceof OHLCProviderError) {
      throw error
    }

    const message = error instanceof Error ? error.message : 'Unknown Moralis error'
    throw new OHLCProviderError('moralis', message, undefined, error)
  }
}

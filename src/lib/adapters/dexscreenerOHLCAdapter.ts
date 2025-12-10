import { timeframeToInterval } from '../utils/ohlcTimeframe'
import type {
  OHLCPoint,
  OHLCProviderResult,
  OHLCRequestParams,
} from '../types/ohlc'
import { OHLCProviderError } from '../types/ohlc'

interface DexscreenerOhlcRow {
  timestamp?: number
  time?: number
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

interface DexscreenerOhlcResponse {
  candles?: DexscreenerOhlcRow[]
  data?: DexscreenerOhlcRow[]
  result?: DexscreenerOhlcRow[]
}

const DEX_API_BASE = (import.meta as any).env?.DEX_API_BASE || 'https://api.dexscreener.com'
const DEX_API_TIMEOUT = Number((import.meta as any).env?.DEX_API_TIMEOUT ?? 5000)

function toMilliseconds(timestamp: number | undefined): number | null {
  if (timestamp == null || Number.isNaN(Number(timestamp))) return null
  const numeric = Number(timestamp)
  return numeric > 1_000_000_000_000 ? numeric : numeric * 1000
}

function normalizeRows(rows: DexscreenerOhlcRow[]): OHLCPoint[] {
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

function extractRows(payload: DexscreenerOhlcResponse | DexscreenerOhlcRow[] | undefined): DexscreenerOhlcRow[] {
  if (!payload) return []
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload.candles)) return payload.candles
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.result)) return payload.result
  return []
}

export async function fetchOHLCFromDexScreener(params: OHLCRequestParams): Promise<OHLCProviderResult> {
  const { symbol, timeframe, address, chainId, from, to, limit } = params
  const interval = timeframeToInterval(timeframe)
  const query = new URLSearchParams({ symbol, interval: String(interval) })

  if (address) query.set('address', address)
  if (chainId) query.set('chainId', chainId)
  if (from !== undefined) query.set('from', String(from))
  if (to !== undefined) query.set('to', String(to))
  if (limit !== undefined) query.set('limit', String(limit))

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), DEX_API_TIMEOUT)

  try {
    const response = await fetch(`${DEX_API_BASE}/latest/dex/ohlc?${query.toString()}`, {
      headers: { accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new OHLCProviderError('dexscreener', `Dexscreener responded with ${response.status}`)
    }

    const payload = (await response.json()) as DexscreenerOhlcResponse | DexscreenerOhlcRow[]
    const rows = extractRows(payload)
    const points = normalizeRows(rows)

    if (points.length === 0) {
      throw new OHLCProviderError('dexscreener', 'Dexscreener returned no OHLC data')
    }

    return {
      providerId: 'dexscreener',
      series: {
        symbol,
        timeframe,
        providerId: 'dexscreener',
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
    clearTimeout(timeoutId)

    if (error instanceof OHLCProviderError) {
      throw error
    }

    const message = error instanceof Error ? error.message : 'Unknown Dexscreener error'
    throw new OHLCProviderError('dexscreener', message, undefined, error)
  }
}

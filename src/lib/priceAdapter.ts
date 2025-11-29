/**
 * Candle Adapter (Client)
 *
 * Prefers DexPaprika OHLC data and falls back to the Moralis proxy when
 * DexPaprika is unavailable or throttled. The adapter keeps a short cooldown
 * per network to avoid hammering DexPaprika after repeated failures.
 */

export type Candle = {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume?: number
}

type UnknownCandleRow = Record<string, unknown> | unknown[] | null | undefined

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const toUnixSeconds = (input: unknown): number | null => {
  if (input == null) {
    return null
  }

  const candidate =
    input instanceof Date || typeof input === 'number' || typeof input === 'string' ? input : String(input)
  const timestamp = new Date(candidate).getTime()

  if (!Number.isFinite(timestamp)) {
    return null
  }

  return Math.floor(timestamp / 1000)
}

const toFiniteNumber = (input: unknown): number | null => {
  if (input == null) {
    return null
  }
  const value = Number(input)
  return Number.isFinite(value) ? value : null
}

const mapRowToCandle = (
  row: UnknownCandleRow,
  fieldMap: {
    time: Array<string | number>
    open: Array<string | number>
    high: Array<string | number>
    low: Array<string | number>
    close: Array<string | number>
    volume?: Array<string | number>
  }
): Candle | null => {
  if (row == null) {
    return null
  }

  const record = isPlainObject(row) ? row : undefined
  const tuple = Array.isArray(row) ? row : undefined

  const resolveValue = (candidates: Array<string | number>): unknown => {
    for (const candidate of candidates) {
      if (typeof candidate === 'number') {
        if (!tuple) {
          continue
        }
        const value = tuple[candidate]
        if (value != null) {
          return value
        }
      } else if (record && candidate in record) {
        const value = record[candidate]
        if (value != null) {
          return value
        }
      }
    }
    return undefined
  }

  const time = toUnixSeconds(resolveValue(fieldMap.time))
  const open = toFiniteNumber(resolveValue(fieldMap.open))
  const high = toFiniteNumber(resolveValue(fieldMap.high))
  const low = toFiniteNumber(resolveValue(fieldMap.low))
  const close = toFiniteNumber(resolveValue(fieldMap.close))
  const volumeValue = fieldMap.volume ? toFiniteNumber(resolveValue(fieldMap.volume)) : null

  if (time == null || open == null || high == null || low == null || close == null) {
    return null
  }

  return {
    time,
    open,
    high,
    low,
    close,
    volume: volumeValue ?? undefined,
  }
}

const isCandle = (value: Candle | null): value is Candle => value !== null

const COOLDOWN_MS = 30_000
const cooldowns: Record<string, number> = {}

const now = () => Date.now()

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })

const fetchWithRetry = async (
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 3
): Promise<Response> => {
  let attempt = 0
  let lastError: unknown

  while (attempt <= retries) {
    try {
      const response = await fetch(input, init)
      if (response.ok) {
        return response
      }

      if (response.status === 429 && attempt < retries) {
        const backoff = 200 * Math.pow(2, attempt)
        await sleep(backoff)
        attempt += 1
        continue
      }

      throw response
    } catch (error) {
      lastError = error
      if (attempt >= retries || error instanceof Response) {
        break
      }
      attempt += 1
      await sleep(150)
    }
  }

  throw lastError ?? new Error('request failed')
}

const mapDexPaprikaCandles = (rows: unknown[]): Candle[] =>
  rows
    .map((row) =>
      mapRowToCandle(row, {
        time: ['timestamp', 'time', 0],
        open: ['open', 1],
        high: ['high', 2],
        low: ['low', 3],
        close: ['close', 4],
        volume: ['volume', 5],
      })
    )
    .filter(isCandle)

const mapMoralisCandles = (rows: unknown[]): Candle[] =>
  rows
    .map((row) =>
      mapRowToCandle(row, {
        time: ['time', 'timestamp', 0],
        open: ['open', 'o', 1],
        high: ['high', 'h', 2],
        low: ['low', 'l', 3],
        close: ['close', 'c', 4],
        volume: ['volume', 'v', 5],
      })
    )
    .filter(isCandle)

export const fetchTokenCandles = async (
  network: string,
  address: string,
  params: { limit?: number } = {}
): Promise<Candle[]> => {
  const dpBase = (import.meta as any).env?.VITE_DEXPAPRIKA_BASE || 'https://api.dexpaprika.com'
  const cooldownKey = `dexpaprika:${network}`

  if (cooldowns[cooldownKey] && now() - cooldowns[cooldownKey] < COOLDOWN_MS) {
    return fetchMoralisFallback(network, address, params)
  }

  const query = new URLSearchParams()
  if (params.limit != null) {
    query.set('limit', String(params.limit))
  }

  const endpoint = `${dpBase.replace(/\/$/, '')}/networks/${encodeURIComponent(network)}/tokens/${encodeURIComponent(
    address
  )}/ohlcv`
  const dpUrl = query.toString() ? `${endpoint}?${query.toString()}` : endpoint

  try {
    const response = await fetchWithRetry(dpUrl, { method: 'GET', cache: 'no-store' }, 3)
    const payload = await response.json()
    const rows = Array.isArray(payload) ? payload : payload?.data ?? payload?.result ?? []
    return mapDexPaprikaCandles(rows)
  } catch (error) {
    const status = error instanceof Response ? error.status : (error as { status?: number })?.status
    if (typeof status === 'number' && (status === 429 || status >= 500)) {
      cooldowns[cooldownKey] = now()
    }
    return fetchMoralisFallback(network, address, params)
  }
}

const fetchMoralisFallback = async (
  network: string,
  address: string,
  params: { limit?: number } = {}
): Promise<Candle[]> => {
  const query = new URLSearchParams({ network, address })
  if (params.limit != null) {
    query.set('limit', String(params.limit))
  }

  const url = `/api/moralis/token?${query.toString()}`
  const response = await fetchWithRetry(url, { method: 'GET', cache: 'no-store' }, 2)
  if (!response.ok) {
    throw new Error(`Moralis fallback failed (${response.status})`)
  }

  const payload = await response.json()
  const rows = Array.isArray(payload) ? payload : payload?.data ?? payload?.result ?? []
  return mapMoralisCandles(rows)
}

export function resetAdapterState(): void {
  Object.keys(cooldowns).forEach((key) => {
    delete cooldowns[key]
  })
}

export default { fetchTokenCandles }

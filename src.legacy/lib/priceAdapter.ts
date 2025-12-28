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

const mapDexPaprikaCandles = (rows: any[]): Candle[] =>
  rows
    .map((row) => ({
      time: Math.floor(new Date(row.timestamp ?? row.time ?? row[0]).getTime() / 1000),
      open: Number(row.open ?? row[1]),
      high: Number(row.high ?? row[2]),
      low: Number(row.low ?? row[3]),
      close: Number(row.close ?? row[4]),
      volume: row.volume != null ? Number(row.volume) : undefined,
    }))
    .filter((candle) => Number.isFinite(candle.time) && Number.isFinite(candle.close))

const mapMoralisCandles = (rows: any[]): Candle[] =>
  rows
    .map((row) => ({
      time: Math.floor(new Date(row.time ?? row.timestamp ?? row[0]).getTime() / 1000),
      open: Number(row.open ?? row.o ?? row[1]),
      high: Number(row.high ?? row.h ?? row[2]),
      low: Number(row.low ?? row.l ?? row[3]),
      close: Number(row.close ?? row.c ?? row[4]),
      volume: row.volume != null ? Number(row.volume ?? row.v) : undefined,
    }))
    .filter((candle) => Number.isFinite(candle.time) && Number.isFinite(candle.close))

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

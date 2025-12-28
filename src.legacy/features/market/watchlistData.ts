import { fetchTokenCandles, type Candle } from '@/lib/priceAdapter'

export type WatchlistQuote = {
  symbol: string
  price: number
  change24hPct: number
}

type SymbolConfig = {
  symbol: string
  network: string
  address: string
}

// Temporary mapping for the static Watchlist V2 rows.
// NOTE(P1-backlog): Replace with user-managed symbols once the watchlist CRUD flow ships.
const WATCHLIST_TOKEN_CONFIG: Record<string, SymbolConfig> = {
  BTCUSDT: {
    symbol: 'BTCUSDT',
    network: 'ethereum',
    address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
  },
  ETHUSDT: {
    symbol: 'ETHUSDT',
    network: 'ethereum',
    address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  },
  SOLUSDT: {
    symbol: 'SOLUSDT',
    network: 'solana',
    address: 'So11111111111111111111111111111111111111112',
  },
  OPUSDT: {
    symbol: 'OPUSDT',
    network: 'ethereum',
    address: '0x4200000000000000000000000000000000000042',
  },
  LINKUSDT: {
    symbol: 'LINKUSDT',
    network: 'ethereum',
    address: '0x514910771af9ca656af840dff83e8264ecf986ca',
  },
  ARBUSDT: {
    symbol: 'ARBUSDT',
    network: 'ethereum',
    address: '0x912ce59144191c1204f64559fe8253a0e49e6548',
  },
  TIAUSDT: {
    symbol: 'TIAUSDT',
    network: 'ethereum',
    address: '0x2261daa3a42d3a7c2717b1b0ce68b6310c47fe0a',
  },
}

const CANDLE_SAMPLE_LIMIT = 25

export async function fetchWatchlistQuotes(symbols: string[]): Promise<WatchlistQuote[]> {
  if (!symbols.length) {
    return []
  }

  const uniqueSymbols = Array.from(new Set(symbols.map((symbol) => symbol.trim()).filter(Boolean)))
  const results = await Promise.all(uniqueSymbols.map((symbol) => fetchQuoteForSymbol(symbol)))

  const successfulQuotes = results.filter((quote): quote is WatchlistQuote => Boolean(quote))
  if (successfulQuotes.length === 0) {
    throw new Error('Unable to resolve watchlist quotes')
  }

  return successfulQuotes
}

async function fetchQuoteForSymbol(symbol: string): Promise<WatchlistQuote | null> {
  const normalizedSymbol = symbol.toUpperCase()
  const config = WATCHLIST_TOKEN_CONFIG[normalizedSymbol]

  if (!config) {
    console.warn(`[watchlist] No token config for ${normalizedSymbol}`)
    return null
  }

  try {
    const candles = await fetchTokenCandles(config.network, config.address, { limit: CANDLE_SAMPLE_LIMIT })
    if (!candles.length) {
      console.warn(`[watchlist] Empty candle payload for ${normalizedSymbol}`)
      return null
    }

    const latest = candles[candles.length - 1]
    if (!latest || !Number.isFinite(latest.close)) {
      console.warn(`[watchlist] Invalid candle data for ${normalizedSymbol}`)
      return null
    }

    const firstCandle = candles[0] ?? latest
    const change24hPct = computeChangePct(latest, firstCandle)

    return {
      symbol: normalizedSymbol,
      price: latest.close,
      change24hPct,
    }
  } catch (error) {
    console.warn(`[watchlist] Failed to fetch price for ${normalizedSymbol}`, error)
    return null
  }
}

/**
 * Approximate a 24h change by comparing the oldest candle in the window
 * against the latest close. DexPaprika does not yet expose a direct delta
 * on this endpoint, so we keep the placeholder simple until the provider
 * API ships richer data.
 */
function computeChangePct(latest: Candle, baseline?: Candle): number {
  if (!baseline || !Number.isFinite(baseline.close) || baseline.close === 0) {
    return 0
  }

  const delta = ((latest.close - baseline.close) / baseline.close) * 100
  return Number.isFinite(delta) ? delta : 0
}

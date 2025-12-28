import { moralisGet } from './moralisClient'
import type { TradeEventSide, TradeEventSource } from '../store/tradeEvents'

export interface NormalizedTradeEvent {
  walletAddress: string
  txHash: string
  timestamp: number
  side: TradeEventSide
  source: TradeEventSource
  amount: number | null
  price: number | null
  baseSymbol: string | null
  quoteSymbol: string | null
  baseMint: string | null
  quoteMint: string | null
}

interface MoralisSwapTokenInfo {
  mint?: string
  address?: string
  symbol?: string
  amount?: number | string
  usdValue?: number | string
}

interface MoralisSwap {
  txHash?: string
  signature?: string
  transactionHash?: string
  blockTime?: number
  blockTimestamp?: number | string
  timestamp?: number
  direction?: string
  transactionType?: string
  transaction_types?: string
  side?: string
  price?: number | string
  priceUsd?: number | string
  fromToken?: MoralisSwapTokenInfo
  toToken?: MoralisSwapTokenInfo
  tokenIn?: MoralisSwapTokenInfo
  tokenOut?: MoralisSwapTokenInfo
  amount?: number | string
}

interface MoralisWalletSwapsResponse {
  result?: MoralisSwap[]
  cursor?: string | null
}

export interface FetchWalletSwapsOptions {
  limit?: number
  order?: 'ASC' | 'DESC'
  transactionTypes?: string[]
  fromDate?: string
  cursor?: string
}

function normalizeSide(raw?: string): TradeEventSide {
  if (!raw) return 'BUY'

  const normalized = raw.toLowerCase()
  if (normalized === 'sell' || normalized === 'out' || normalized === 'outgoing') {
    return 'SELL'
  }

  return 'BUY'
}

function parseNumeric(value?: number | string | null): number | null {
  if (value === undefined || value === null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function parseTimestampMs(value?: number | string): number | null {
  if (value === undefined) return null

  if (typeof value === 'number') {
    return value > 1e12 ? value : value * 1000
  }

  const parsed = Date.parse(value)
  return Number.isNaN(parsed) ? null : parsed
}

function pickTxHash(swap: MoralisSwap): string | null {
  return swap.txHash ?? swap.signature ?? swap.transactionHash ?? null
}

function pickTokens(swap: MoralisSwap) {
  const soldToken = swap.fromToken ?? swap.tokenIn
  const receivedToken = swap.toToken ?? swap.tokenOut

  return { soldToken, receivedToken }
}

function resolveBaseQuoteTokens(side: TradeEventSide, swap: MoralisSwap) {
  const { soldToken, receivedToken } = pickTokens(swap)

  const baseToken = side === 'BUY' ? receivedToken : soldToken
  const quoteToken = side === 'BUY' ? soldToken : receivedToken

  return { baseToken, quoteToken }
}

function mapSwapToEvent(walletAddress: string, swap: MoralisSwap): NormalizedTradeEvent | null {
  const txHash = pickTxHash(swap)
  const timestamp =
    parseTimestampMs(swap.blockTimestamp) ?? parseTimestampMs(swap.blockTime) ?? parseTimestampMs(swap.timestamp)

  if (!txHash || !timestamp) return null

  const side = normalizeSide(swap.transactionType ?? swap.transaction_types ?? swap.side ?? swap.direction)
  const { baseToken, quoteToken } = resolveBaseQuoteTokens(side, swap)

  const baseAmount = parseNumeric(baseToken?.amount ?? swap.amount)
  const price = parseNumeric(swap.price ?? swap.priceUsd ?? quoteToken?.usdValue)

  return {
    txHash,
    timestamp,
    walletAddress,
    side,
    source: 'moralis',
    amount: baseAmount,
    price,
    baseSymbol: baseToken?.symbol ?? null,
    quoteSymbol: quoteToken?.symbol ?? null,
    baseMint: baseToken?.mint ?? baseToken?.address ?? null,
    quoteMint: quoteToken?.mint ?? quoteToken?.address ?? null,
  }
}

export async function fetchWalletSwaps(
  walletAddress: string,
  { limit, order = 'DESC', transactionTypes, fromDate, cursor }: FetchWalletSwapsOptions = {},
): Promise<NormalizedTradeEvent[]> {
  const params: Record<string, string | number | undefined> = {
    limit,
    order,
    cursor,
    transactionTypes: transactionTypes?.join(','),
    fromDate,
  }

  const data = await moralisGet<MoralisWalletSwapsResponse>(`/account/mainnet/${walletAddress}/swaps`, params)
  const swaps = data.result ?? []

  return swaps
    .map((swap) => mapSwapToEvent(walletAddress, swap))
    .filter((event): event is NormalizedTradeEvent => event !== null)
}

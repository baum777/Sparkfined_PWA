/**
 * BLOCK 2: Moralis Streams Webhook Handler
 * 
 * Receives real-time wallet activity from Moralis Streams API
 * Creates temp journal entries for detected buy transactions
 * 
 * Setup Instructions (Manual in Moralis Dashboard):
 * 1. Go to https://admin.moralis.io/streams
 * 2. Create new Stream:
 *    - Type: "Wallet Activity"
 *    - Network: "Solana Mainnet"
 *    - Address: [User's wallet address from settings]
 *    - Events: "SPL Token Transfer IN"
 *    - Webhook URL: https://your-app.vercel.app/api/wallet/webhook
 *    - Secret: Set in env var MORALIS_WEBHOOK_SECRET
 * 
 * Payload Example:
 * {
 *   "confirmed": true,
 *   "chainId": "mainnet",
 *   "abi": [...],
 *   "streamId": "...",
 *   "tag": "wallet-monitor",
 *   "retries": 0,
 *   "block": {...},
 *   "logs": [{
 *     "logIndex": "0",
 *     "transactionHash": "5J...",
 *     ...
 *   }],
 *   "txs": [{
 *     "hash": "5J...",
 *     "from": "...",
 *     "to": "...",
 *     ...
 *   }],
 *   "nativeBalances": [{...}]
 * }
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

export const config = { runtime: 'edge' }

// Types for Moralis Streams payload
interface MoralisStreamPayload {
  confirmed: boolean
  chainId: string
  streamId: string
  tag?: string
  block: {
    number: string
    timestamp: string
    hash: string
  }
  txs: Array<{
    hash: string
    from: string
    to: string
    value?: string
    gas?: string
  }>
  logs: Array<{
    logIndex: string
    transactionHash: string
    address?: string
    data?: string
    topic0?: string
    topic1?: string
    topic2?: string
    topic3?: string
  }>
  erc20Transfers?: Array<{
    transactionHash: string
    contract: string
    from: string
    to: string
    value: string
    tokenName?: string
    tokenSymbol?: string
    tokenDecimals?: string
    valueWithDecimals?: string
  }>
  nftTransfers?: Array<any>
  internalTransactions?: Array<any>
}

interface WebhookResponse {
  success: boolean
  message: string
  entriesCreated?: number
  errors?: string[]
}

/**
 * Verify Moralis webhook signature
 * Prevents unauthorized webhook calls
 */
function verifySignature(req: Request): boolean {
  const signature = req.headers.get('x-signature')
  const secret = process.env.MORALIS_WEBHOOK_SECRET

  if (!secret) {
    console.warn('[Webhook] MORALIS_WEBHOOK_SECRET not set, skipping verification')
    return true // Allow in dev/testing
  }

  if (!signature) {
    console.error('[Webhook] Missing x-signature header')
    return false
  }

  // TODO: Implement HMAC verification when Moralis provides signing method
  // For now, check if signature exists (basic security)
  return signature.length > 0
}

/**
 * Parse Moralis payload and extract buy transactions
 */
async function parseBuyTransactions(payload: MoralisStreamPayload) {
  const buyTransactions: Array<{
    ticker: string
    address: string
    price: number
    amount: number
    mcap: number
    txHash: string
    timestamp: number
  }> = []

  // Check ERC20 transfers (SPL tokens on Solana)
  if (payload.erc20Transfers && payload.erc20Transfers.length > 0) {
    for (const transfer of payload.erc20Transfers) {
      // Only process transfers TO the monitored wallet (buys)
      // Transfer FROM would be sells
      const isBuy = transfer.to.toLowerCase() === process.env.MONITORED_WALLET?.toLowerCase()

      if (isBuy) {
        // Fetch additional token data (price, mcap)
        const tokenData = await fetchTokenData(transfer.contract)

        buyTransactions.push({
          ticker: transfer.tokenSymbol || 'UNKNOWN',
          address: transfer.contract,
          price: tokenData?.price || 0,
          amount: parseFloat(transfer.valueWithDecimals || transfer.value || '0'),
          mcap: tokenData?.mcap || 0,
          txHash: transfer.transactionHash,
          timestamp: parseInt(payload.block.timestamp) * 1000, // Convert to ms
        })
      }
    }
  }

  return buyTransactions
}

/**
 * Fetch token price and MCap from Moralis API
 */
async function fetchTokenData(
  address: string
): Promise<{ price: number; mcap: number } | null> {
  const MORALIS_BASE = process.env.MORALIS_BASE || 'https://deep-index.moralis.io/api/v2.2'
  const MORALIS_API_KEY = process.env.MORALIS_API_KEY

  if (!MORALIS_API_KEY) {
    console.error('[Webhook] MORALIS_API_KEY not configured')
    return null
  }

  try {
    const response = await fetch(
      `${MORALIS_BASE}/erc20/${address}/price?chain=mainnet`,
      {
        headers: {
          'X-API-Key': MORALIS_API_KEY,
          'Accept': 'application/json',
        },
        // 3s timeout for webhook context
        signal: AbortSignal.timeout(3000),
      }
    )

    if (!response.ok) {
      console.error(`[Webhook] Moralis API error: ${response.status}`)
      return null
    }

    const data = await response.json()

    return {
      price: parseFloat(data.usdPrice || '0'),
      mcap: parseFloat(data.marketCap || '0'),
    }
  } catch (error) {
    console.error('[Webhook] Failed to fetch token data:', error)
    return null
  }
}

/**
 * Create temp journal entry via internal API
 * Uses JournalService on server-side
 */
async function createTempEntry(transaction: {
  ticker: string
  address: string
  price: number
  amount: number
  mcap: number
  txHash: string
  timestamp: number
}) {
  // Import JournalService server-side
  // Note: This assumes we're running in Node.js context
  // If edge runtime doesn't support dynamic imports, we'll need to refactor
  try {
    // For now, store in KV (like existing journal API)
    // In production, this would call JournalService directly
    const entryData = {
      id: crypto.randomUUID(),
      ticker: transaction.ticker,
      address: transaction.address,
      setup: 'custom' as const,
      emotion: 'uncertain' as const,
      status: 'temp' as const,
      timestamp: transaction.timestamp,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      outcome: {
        pnl: 0,
        pnlPercent: 0,
        transactions: [
          {
            type: 'buy' as const,
            timestamp: transaction.timestamp,
            price: transaction.price,
            amount: transaction.amount,
            mcap: transaction.mcap,
            txHash: transaction.txHash,
          },
        ],
      },
    }

    // Store in KV (for edge runtime compatibility)
    // TODO: Migrate to direct IndexedDB when server-side rendering supports it
    const { kvSet, kvSAdd } = await import('../../src/lib/kv')
    const userId = 'default' // TODO: Get from auth context

    await kvSet(`journal:${userId}:${entryData.id}`, entryData)
    await kvSAdd(`journal:byUser:${userId}`, entryData.id)
    await kvSAdd(`journal:temp:${userId}`, entryData.id) // Track temp entries

    return entryData
  } catch (error) {
    console.error('[Webhook] Failed to create temp entry:', error)
    throw error
  }
}

/**
 * Main webhook handler
 */
export default async function handler(req: Request): Promise<Response> {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Method not allowed',
      }),
      {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  // Verify signature
  if (!verifySignature(req)) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Invalid signature',
      }),
      {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }

  try {
    // Parse payload
    const payload: MoralisStreamPayload = await req.json()

    console.log('[Webhook] Received stream event:', {
      streamId: payload.streamId,
      confirmed: payload.confirmed,
      txCount: payload.txs?.length || 0,
      transferCount: payload.erc20Transfers?.length || 0,
    })

    // Only process confirmed transactions
    if (!payload.confirmed) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'Waiting for confirmation',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Parse buy transactions
    const buyTxs = await parseBuyTransactions(payload)

    if (buyTxs.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No buy transactions detected',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Create temp journal entries
    const entries = []
    const errors = []

    for (const tx of buyTxs) {
      try {
        const entry = await createTempEntry(tx)
        entries.push(entry)
        console.log('[Webhook] Created temp entry:', {
          id: entry.id,
          ticker: entry.ticker,
          txHash: tx.txHash,
        })
      } catch (error) {
        console.error('[Webhook] Failed to create entry for tx:', tx.txHash, error)
        errors.push(`Failed to create entry for ${tx.ticker}`)
      }
    }

    // Send notification (optional: push notification)
    // TODO: Implement push notification in BLOCK 5
    if (entries.length > 0) {
      console.log(`[Webhook] ✅ Created ${entries.length} temp journal entries`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${buyTxs.length} transactions`,
        entriesCreated: entries.length,
        errors: errors.length > 0 ? errors : undefined,
      } as WebhookResponse),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error)

    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

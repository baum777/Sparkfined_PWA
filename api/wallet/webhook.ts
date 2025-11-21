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

export const config = { runtime: 'edge' }

const JSON_HEADERS = { 'Content-Type': 'application/json' } as const

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
async function verifySignature(req: Request): Promise<Response | null> {
  const secret = process.env.MORALIS_WEBHOOK_SECRET?.trim()
  const env = process.env.NODE_ENV ?? 'production'
  const isProd = env === 'production'

  if (!secret) {
    if (!isProd) {
      console.warn('[Webhook] MORALIS_WEBHOOK_SECRET not set – allowing request in non-production environment')
      return null
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: 'Webhook verification disabled',
      }),
      {
        status: 503,
        headers: JSON_HEADERS,
      }
    )
  }

  const signature = req.headers.get('x-signature')
  if (!signature) {
    console.error('[Webhook] Missing x-signature header')
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Missing signature',
      }),
      {
        status: 401,
        headers: JSON_HEADERS,
      }
    )
  }

  try {
    const rawBody = await req.clone().text()
    const isValid = await verifyHmacSignature(secret, rawBody, signature)

    if (!isValid) {
      console.error('[Webhook] Invalid Moralis signature')
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid signature',
        }),
        {
          status: 401,
          headers: JSON_HEADERS,
        }
      )
    }
  } catch (error) {
    console.error('[Webhook] Failed to verify signature:', error)
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Signature verification failed',
      }),
      {
        status: 401,
        headers: JSON_HEADERS,
      }
    )
  }

  return null
}

async function verifyHmacSignature(secret: string, payload: string, signatureHex: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const payloadData = encoder.encode(payload)
  const cleanedSignature = signatureHex.trim().toLowerCase().replace(/^0x/, '')

  let signatureBytes: Uint8Array
  try {
    signatureBytes = hexToUint8Array(cleanedSignature)
  } catch {
    return false
  }

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )

  const signatureBuffer = new ArrayBuffer(signatureBytes.byteLength)
  new Uint8Array(signatureBuffer).set(signatureBytes)

  return crypto.subtle.verify('HMAC', key, signatureBuffer, payloadData)
}

function hexToUint8Array(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error('Invalid hex string length')
  }

  const array = new Uint8Array(hex.length / 2)
  for (let i = 0; i < array.length; i++) {
    const byte = parseInt(hex.substr(i * 2, 2), 16)
    if (Number.isNaN(byte)) {
      throw new Error('Invalid hex byte')
    }
    array[i] = byte
  }
  return array
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
  const MORALIS_BASE =
    process.env.MORALIS_BASE_URL ||
    process.env.MORALIS_BASE ||
    'https://deep-index.moralis.io/api/v2.2'
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
          headers: JSON_HEADERS,
        }
      )
  }

  // Verify signature
  const signatureError = await verifySignature(req)
  if (signatureError) {
    return signatureError
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
          headers: JSON_HEADERS,
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
          headers: JSON_HEADERS,
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
        headers: JSON_HEADERS,
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
        headers: JSON_HEADERS,
      }
    )
  }
}

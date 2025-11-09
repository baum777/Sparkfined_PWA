/**
 * BLOCK 2: Wallet Monitor (Polling Fallback)
 * 
 * Polls Moralis API for wallet activity when Streams are not available
 * Fallback for users who haven't set up Moralis Streams manually
 * 
 * Usage:
 * ```typescript
 * const monitor = new WalletMonitor('YOUR_WALLET_ADDRESS')
 * monitor.start() // Polls every 2 minutes
 * monitor.stop()
 * ```
 * 
 * Features:
 * - Polls Moralis wallet token transfers endpoint
 * - Detects new SPL token buys
 * - Creates temp journal entries
 * - Configurable polling interval (default: 2 minutes)
 * - Auto-retry on errors
 */

import { createEntry } from './JournalService'
import type { Transaction } from '@/types/journal'

// ============================================================================
// CONFIGURATION
// ============================================================================

const POLL_INTERVAL_MS = 2 * 60 * 1000 // 2 minutes
const MORALIS_BASE = import.meta.env.VITE_MORALIS_BASE || 'https://deep-index.moralis.io/api/v2.2'
const MORALIS_API_KEY = import.meta.env.VITE_MORALIS_API_KEY || ''

// ============================================================================
// TYPES
// ============================================================================

interface MoralisTokenTransfer {
  transaction_hash: string
  block_timestamp: string
  block_number: string
  from_address: string
  to_address: string
  value: string
  address: string // Token contract address
  token_name?: string
  token_symbol?: string
  token_decimals?: string
  logo?: string
}

interface MoralisTokenTransfersResponse {
  total: number
  page: number
  page_size: number
  cursor?: string
  result: MoralisTokenTransfer[]
}

interface DetectedBuy {
  ticker: string
  address: string
  txHash: string
  timestamp: number
  amount: number
}

// ============================================================================
// WALLET MONITOR CLASS
// ============================================================================

export class WalletMonitor {
  private walletAddress: string
  private intervalId: NodeJS.Timeout | null = null
  private isRunning: boolean = false
  private lastCheckedTimestamp: number = Date.now()
  private seenTxHashes: Set<string> = new Set()

  constructor(walletAddress: string) {
    this.walletAddress = walletAddress
    
    // Load seen tx hashes from localStorage
    try {
      const stored = localStorage.getItem(`wallet-monitor:${walletAddress}:seen`)
      if (stored) {
        this.seenTxHashes = new Set(JSON.parse(stored))
      }
    } catch (error) {
      console.warn('[WalletMonitor] Failed to load seen tx hashes:', error)
    }
  }

  /**
   * Start monitoring wallet activity
   */
  start(intervalMs: number = POLL_INTERVAL_MS): void {
    if (this.isRunning) {
      console.warn('[WalletMonitor] Already running')
      return
    }

    console.log('[WalletMonitor] Starting monitor for:', this.walletAddress)
    this.isRunning = true

    // Initial check
    this.checkWalletActivity().catch((error) => {
      console.error('[WalletMonitor] Initial check failed:', error)
    })

    // Set up polling
    this.intervalId = setInterval(() => {
      this.checkWalletActivity().catch((error) => {
        console.error('[WalletMonitor] Poll failed:', error)
      })
    }, intervalMs)
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    console.log('[WalletMonitor] Stopping monitor')
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }

    // Save seen tx hashes
    this.saveSeenTxHashes()
  }

  /**
   * Check wallet for new token transfers
   */
  private async checkWalletActivity(): Promise<void> {
    if (!MORALIS_API_KEY) {
      console.error('[WalletMonitor] MORALIS_API_KEY not configured')
      return
    }

    try {
      console.log('[WalletMonitor] Checking wallet activity...')

      // Fetch token transfers
      const transfers = await this.fetchTokenTransfers()

      if (transfers.length === 0) {
        console.log('[WalletMonitor] No new transfers')
        return
      }

      // Filter for buys (transfers TO this wallet)
      const buys = transfers.filter((t) => {
        return (
          t.to_address.toLowerCase() === this.walletAddress.toLowerCase() &&
          !this.seenTxHashes.has(t.transaction_hash)
        )
      })

      if (buys.length === 0) {
        console.log('[WalletMonitor] No new buys detected')
        return
      }

      console.log(`[WalletMonitor] ✅ Detected ${buys.length} new buy(s)`)

      // Process each buy
      for (const buy of buys) {
        await this.processBuy(buy)
        this.seenTxHashes.add(buy.transaction_hash)
      }

      // Update last checked timestamp
      this.lastCheckedTimestamp = Date.now()
      this.saveSeenTxHashes()

      // Dispatch event for UI update
      window.dispatchEvent(new CustomEvent('wallet:buys-detected', {
        detail: { count: buys.length }
      }))
    } catch (error) {
      console.error('[WalletMonitor] Check failed:', error)
    }
  }

  /**
   * Fetch token transfers from Moralis
   */
  private async fetchTokenTransfers(): Promise<MoralisTokenTransfer[]> {
    const url = `${MORALIS_BASE}/wallets/${this.walletAddress}/tokens/transfers?chain=mainnet&limit=20`

    const response = await fetch(url, {
      headers: {
        'X-API-Key': MORALIS_API_KEY,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    if (!response.ok) {
      throw new Error(`Moralis API error: ${response.status}`)
    }

    const data: MoralisTokenTransfersResponse = await response.json()
    return data.result || []
  }

  /**
   * Process a detected buy transaction
   */
  private async processBuy(transfer: MoralisTokenTransfer): Promise<void> {
    try {
      // Fetch token price & mcap
      const tokenData = await this.fetchTokenData(transfer.address)

      // Parse amount
      const decimals = parseInt(transfer.token_decimals || '9')
      const amount = parseInt(transfer.value) / Math.pow(10, decimals)

      // Create transaction object
      const transaction: Transaction = {
        type: 'buy',
        timestamp: new Date(transfer.block_timestamp).getTime(),
        price: tokenData?.price || 0,
        amount,
        mcap: tokenData?.mcap || 0,
        txHash: transfer.transaction_hash,
      }

      // Create temp journal entry
      const entry = await createEntry({
        ticker: transfer.token_symbol || 'UNKNOWN',
        address: transfer.address,
        setup: 'custom',
        emotion: 'uncertain',
        status: 'temp',
        timestamp: transaction.timestamp,
        outcome: {
          pnl: 0,
          pnlPercent: 0,
          transactions: [transaction],
        },
      })

      console.log('[WalletMonitor] ✅ Created temp entry:', {
        id: entry.id,
        ticker: entry.ticker,
        txHash: transfer.transaction_hash,
      })
    } catch (error) {
      console.error('[WalletMonitor] Failed to process buy:', error)
    }
  }

  /**
   * Fetch token price & mcap from Moralis
   */
  private async fetchTokenData(
    address: string
  ): Promise<{ price: number; mcap: number } | null> {
    try {
      const response = await fetch(
        `${MORALIS_BASE}/erc20/${address}/price?chain=mainnet`,
        {
          headers: {
            'X-API-Key': MORALIS_API_KEY,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(5000),
        }
      )

      if (!response.ok) {
        return null
      }

      const data = await response.json()

      return {
        price: parseFloat(data.usdPrice || '0'),
        mcap: parseFloat(data.marketCap || '0'),
      }
    } catch (error) {
      console.warn('[WalletMonitor] Failed to fetch token data:', error)
      return null
    }
  }

  /**
   * Save seen tx hashes to localStorage
   */
  private saveSeenTxHashes(): void {
    try {
      // Keep only last 100 hashes (prevent localStorage bloat)
      const hashes = Array.from(this.seenTxHashes).slice(-100)
      localStorage.setItem(
        `wallet-monitor:${this.walletAddress}:seen`,
        JSON.stringify(hashes)
      )
    } catch (error) {
      console.warn('[WalletMonitor] Failed to save seen tx hashes:', error)
    }
  }

  /**
   * Get monitoring status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      walletAddress: this.walletAddress,
      lastChecked: new Date(this.lastCheckedTimestamp).toISOString(),
      seenTransactions: this.seenTxHashes.size,
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let globalMonitor: WalletMonitor | null = null

/**
 * Get or create global wallet monitor instance
 */
export function getWalletMonitor(walletAddress?: string): WalletMonitor | null {
  if (!walletAddress && !globalMonitor) {
    return null
  }

  if (walletAddress && (!globalMonitor || globalMonitor.getStatus().walletAddress !== walletAddress)) {
    // Stop old monitor if exists
    if (globalMonitor) {
      globalMonitor.stop()
    }

    // Create new monitor
    globalMonitor = new WalletMonitor(walletAddress)
  }

  return globalMonitor
}

/**
 * Start monitoring wallet (convenience function)
 */
export function startWalletMonitoring(walletAddress: string): void {
  const monitor = getWalletMonitor(walletAddress)
  if (monitor) {
    monitor.start()
  }
}

/**
 * Stop monitoring (convenience function)
 */
export function stopWalletMonitoring(): void {
  if (globalMonitor) {
    globalMonitor.stop()
  }
}

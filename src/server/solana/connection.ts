/**
 * Solana Connection & Keypair Management
 * Server-side only
 */

import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { ACCESS_CONFIG, SERVER_CONFIG } from '../../config/access'

// Singleton connection instance
let _connection: Connection | null = null
let _serverKeypair: Keypair | null = null

/**
 * Get Solana connection (cached)
 */
export function getConnection(): Connection {
  if (!_connection) {
    _connection = new Connection(ACCESS_CONFIG.RPC_URL, {
      commitment: 'confirmed',
    })
  }
  return _connection
}

/**
 * Get server keypair (cached)
 * Used for signing transactions (NFT mints, etc.)
 */
export function getServerKeypair(): Keypair {
  if (!_serverKeypair) {
    if (!SERVER_CONFIG.SOLANA_KEYPAIR_JSON) {
      throw new Error('SOLANA_KEYPAIR_JSON not configured')
    }

    try {
      const secretKey = JSON.parse(SERVER_CONFIG.SOLANA_KEYPAIR_JSON)
      _serverKeypair = Keypair.fromSecretKey(Uint8Array.from(secretKey))
    } catch (error) {
      throw new Error(`Failed to parse SOLANA_KEYPAIR_JSON: ${error}`)
    }
  }
  return _serverKeypair
}

/**
 * Validate Solana public key
 */
export function isValidPublicKey(key: string): boolean {
  try {
    new PublicKey(key)
    return true
  } catch {
    return false
  }
}

/**
 * Get SPL token balance for a wallet
 */
export async function getTokenBalance(
  wallet: string,
  tokenMint: string
): Promise<number> {
  const connection = getConnection()
  
  try {
    const walletPubkey = new PublicKey(wallet)
    const mintPubkey = new PublicKey(tokenMint)
    
    // Get token accounts owned by wallet for this mint
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      walletPubkey,
      { mint: mintPubkey }
    )
    
    if (tokenAccounts.value.length === 0) {
      return 0
    }
    
    // Sum up all token account balances
    const totalBalance = tokenAccounts.value.reduce((sum, account) => {
      const amount = account.account.data.parsed?.info?.tokenAmount?.uiAmount || 0
      return sum + amount
    }, 0)
    
    return totalBalance
  } catch (error) {
    console.error('Error fetching token balance:', error)
    return 0
  }
}

/**
 * Check if transaction signature is valid and confirmed
 */
export async function verifyTransaction(signature: string): Promise<boolean> {
  const connection = getConnection()
  
  try {
    const status = await connection.getSignatureStatus(signature)
    return status.value?.confirmationStatus === 'confirmed' || 
           status.value?.confirmationStatus === 'finalized'
  } catch {
    return false
  }
}

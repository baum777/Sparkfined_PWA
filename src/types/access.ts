/**
 * Access Pass Type Definitions
 */

// Access Status Types
export type AccessStatus = 'og' | 'holder' | 'none'

export interface AccessDetails {
  status: AccessStatus
  rank: number | null
  nftMint: string | null
  tokenBalance: number
  hasNFT: boolean
  meetsHoldRequirement: boolean
  note?: string
}

// Lock Request/Response
export interface LockRequest {
  wallet: string
  amount: number
  txSignature?: string // Optional: client-side Streamflow tx signature
}

export interface LockResponse {
  ok: boolean
  rank: number
  lockId: string
  note?: string
  error?: string
}

// NFT Mint Request/Response
export interface MintNFTRequest {
  wallet: string
  rank: number
}

export interface MintNFTResponse {
  ok: boolean
  mintAddress?: string
  symbol?: string
  name?: string
  error?: string
}

// Access Status Request/Response
export interface AccessStatusRequest {
  wallet: string
}

export interface AccessStatusResponse {
  status: AccessStatus
  details: {
    rank: number | null
    nftMint: string | null
    tokenBalance: number
    note?: string
  }
}

// Leaderboard Entry
export interface LeaderboardEntry {
  rank: number
  wallet: string
  amount: number
  timestamp: number
  nftMinted: boolean
}

// Rank Storage (File-based KV for MVP)
export interface RankStorage {
  currentRank: number
  locks: Array<{
    wallet: string
    rank: number
    timestamp: number
    lockId: string
  }>
  lastUpdated: number
}

// Error Types
export class AccessError extends Error {
  constructor(
    message: string,
    public code: 'INVALID_RANK' | 'DUPLICATE_LOCK' | 'RPC_ERROR' | 'MINT_ERROR' | 'UNAUTHORIZED',
    public details?: unknown
  ) {
    super(message)
    this.name = 'AccessError'
  }
}

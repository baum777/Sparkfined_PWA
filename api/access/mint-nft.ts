/**
 * POST /api/access/mint-nft
 * 
 * Mint OG Pass NFT for wallet with valid rank (≤ 333)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { mintOGPassNFT } from '../../src/server/metaplex/mint'
import { getLockInfo } from '../../src/server/streamflow/lock'
import { isValidPublicKey } from '../../src/server/solana/connection'
import { isOGRank, ACCESS_CONFIG } from '../../src/config/access'
import type { MintNFTRequest, MintNFTResponse } from '../../src/types/access'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { wallet, rank }: MintNFTRequest = req.body

    // Validate inputs
    if (!wallet || !isValidPublicKey(wallet)) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid wallet address' 
      })
    }

    if (typeof rank !== 'number' || rank <= 0) {
      return res.status(400).json({ 
        ok: false, 
        error: 'Invalid rank' 
      })
    }

    // Check if rank is within OG slots
    if (!isOGRank(rank)) {
      return res.status(400).json({ 
        ok: false, 
        error: `Rank ${rank} is beyond OG slots (${ACCESS_CONFIG.OG_SLOTS}). NFT mint not available.` 
      })
    }

    // Verify wallet has a lock with this rank
    const lockInfo = await getLockInfo(wallet)
    if (!lockInfo || !lockInfo.hasLock) {
      return res.status(403).json({ 
        ok: false, 
        error: 'No lock found for this wallet' 
      })
    }

    if (lockInfo.rank !== rank) {
      return res.status(403).json({ 
        ok: false, 
        error: `Rank mismatch: expected ${lockInfo.rank}, got ${rank}` 
      })
    }

    // Mint OG Pass NFT
    const mintAddress = await mintOGPassNFT(wallet, rank)

    const response: MintNFTResponse = {
      ok: true,
      mintAddress,
      symbol: ACCESS_CONFIG.OG_SYMBOL,
      name: `${ACCESS_CONFIG.OG_COLLECTION_NAME} #${rank}`,
    }

    console.log(`[API /mint-nft] Success: wallet=${wallet}, rank=${rank}, mint=${mintAddress}`)

    return res.status(200).json(response)

  } catch (error: unknown) {
    console.error('[API /mint-nft] Error:', error)

    const err = error as { message?: string }
    return res.status(500).json({ 
      ok: false, 
      error: 'Failed to mint NFT',
      message: err.message || 'Unknown error',
    })
  }
}

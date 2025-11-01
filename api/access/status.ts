/**
 * GET /api/access/status?wallet=<pubkey>
 * 
 * Get access status for a wallet (OG / Holder / None)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'
import { checkOGPassOwnership } from '../../src/server/metaplex/mint'
import { getTokenBalance, isValidPublicKey } from '../../src/server/solana/connection'
import { ACCESS_CONFIG } from '../../src/config/access'
import type { AccessStatusResponse, AccessStatus } from '../../src/types/access'

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only accept GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const wallet = req.query.wallet as string

    // Validate wallet
    if (!wallet || !isValidPublicKey(wallet)) {
      return res.status(400).json({ error: 'Invalid wallet address' })
    }

    // Check OG Pass ownership (via Metaplex)
    const ogCheck = await checkOGPassOwnership(wallet)

    // Check token hold balance (via RPC)
    const tokenBalance = await getTokenBalance(wallet, ACCESS_CONFIG.TOKEN_MINT)
    const meetsHoldRequirement = tokenBalance >= ACCESS_CONFIG.HOLD_REQUIREMENT

    // Determine status
    let status: AccessStatus = 'none'
    if (ogCheck.hasNFT) {
      status = 'og'
    } else if (meetsHoldRequirement) {
      status = 'holder'
    }

    // Build response
    const response: AccessStatusResponse = {
      status,
      details: {
        rank: ogCheck.rank,
        nftMint: ogCheck.mintAddress,
        tokenBalance,
      },
    }

    // Add note if no access
    if (status === 'none') {
      response.details.note = `No access. Options: (1) Lock tokens to get OG rank, or (2) Hold ≥${ACCESS_CONFIG.HOLD_REQUIREMENT.toLocaleString()} tokens.`
    }

    console.log(`[API /status] wallet=${wallet}, status=${status}`)

    return res.status(200).json(response)

  } catch (error: unknown) {
    console.error('[API /status] Error:', error)

    // Fallback on RPC error
    return res.status(200).json({
      status: 'none',
      details: {
        rank: null,
        nftMint: null,
        tokenBalance: 0,
        note: 'RPC error: Could not verify access. Please try again later.',
      },
    })
  }
}

/**
 * Metaplex NFT Mint Helper
 * Server-side only
 */

// @ts-expect-error - @metaplex-foundation/js has incomplete type definitions
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js'
import { PublicKey } from '@solana/web3.js'
import { getConnection, getServerKeypair } from '../solana/connection'
import { ACCESS_CONFIG, getOGPassMetadataURI } from '../../config/access'

let _metaplex: Metaplex | null = null

/**
 * Get Metaplex instance (cached)
 */
function getMetaplex(): Metaplex {
  if (!_metaplex) {
    const connection = getConnection()
    const serverKeypair = getServerKeypair()
    
    _metaplex = Metaplex.make(connection)
      .use(keypairIdentity(serverKeypair))
      .use(bundlrStorage())
  }
  return _metaplex
}

/**
 * Mint OG Pass NFT
 * 
 * @param toWallet - Recipient wallet address
 * @param rank - OG rank (1-333)
 * @returns Mint address of created NFT
 */
export async function mintOGPassNFT(
  toWallet: string,
  rank: number
): Promise<string> {
  try {
    const mx = getMetaplex()
    const recipient = new PublicKey(toWallet)
    
    const { nft } = await mx.nfts().create({
      name: `${ACCESS_CONFIG.OG_COLLECTION_NAME} #${rank}`,
      symbol: ACCESS_CONFIG.OG_SYMBOL,
      uri: getOGPassMetadataURI(rank),
      sellerFeeBasisPoints: 0, // No royalties
      isMutable: false, // Immutable metadata
      maxSupply: 1, // Only 1 copy exists
      // Optional: Add to collection if configured
      collection: ACCESS_CONFIG.COLLECTION_MINT 
        ? new PublicKey(ACCESS_CONFIG.COLLECTION_MINT)
        : undefined,
    })
    
    // Transfer to recipient (if different from server wallet)
    const serverWallet = getServerKeypair().publicKey
    if (!recipient.equals(serverWallet)) {
      await mx.nfts().transfer({
        nftOrSft: nft,
        toOwner: recipient,
      })
    }
    
    return nft.mint.address.toBase58()
  } catch (error) {
    console.error('Error minting OG Pass NFT:', error)
    throw new Error(`Failed to mint NFT: ${error}`)
  }
}

/**
 * Check if wallet owns an OG Pass NFT
 * 
 * @param wallet - Wallet address to check
 * @returns Object with hasNFT, rank, mintAddress
 */
export async function checkOGPassOwnership(wallet: string): Promise<{
  hasNFT: boolean
  rank: number | null
  mintAddress: string | null
}> {
  try {
    const mx = getMetaplex()
    const ownerPubkey = new PublicKey(wallet)
    
    // Find all NFTs owned by wallet
    const nfts = await mx.nfts().findAllByOwner({ owner: ownerPubkey })
    
    // Filter for OG Pass NFTs (by symbol)
    const ogPassNFTs = nfts.filter(
      (nft: { symbol: string }) => nft.symbol === ACCESS_CONFIG.OG_SYMBOL
    )
    
    if (ogPassNFTs.length === 0) {
      return { hasNFT: false, rank: null, mintAddress: null }
    }
    
    // Get rank from NFT name (e.g., "Sparkfiend OG Pass #127")
    const firstNFT = ogPassNFTs[0]
    const rankMatch = firstNFT.name.match(/#(\d+)$/)
    const rank = rankMatch ? parseInt(rankMatch[1]) : null
    
    return {
      hasNFT: true,
      rank,
      mintAddress: firstNFT.mint.address.toBase58(),
    }
  } catch (error) {
    console.error('Error checking OG Pass ownership:', error)
    return { hasNFT: false, rank: null, mintAddress: null }
  }
}

/**
 * Verify NFT is soulbound (non-transferable)
 * For MVP: Just check metadata, optional on-chain enforcement later
 */
export async function verifySoulbound(mintAddress: string): Promise<boolean> {
  try {
    const mx = getMetaplex()
    const mint = new PublicKey(mintAddress)
    
    const nft = await mx.nfts().findByMint({ mintAddress: mint })
    
    // Check if NFT is marked as non-transferable in metadata
    // For Metaplex v0.19, we check isMutable and maxSupply
    return !nft.isMutable && nft.mint.supply.basisPoints.toNumber() === 1
  } catch {
    return false
  }
}

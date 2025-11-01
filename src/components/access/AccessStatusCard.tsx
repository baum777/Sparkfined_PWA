/**
 * AccessStatusCard — Display current access status
 * 
 * States:
 * - OG: Has soulbound NFT (rank ≤ 333)
 * - Holder: Holds ≥100k tokens
 * - None: No access
 */

import { useAccessStatus } from '../../store/AccessProvider'

export default function AccessStatusCard() {
  const {
    status,
    details,
    loading,
    walletConnected,
    connectWallet,
  } = useAccessStatus()

  const type = status
  const hasNFT = details?.hasNFT || false
  const holdBalance = details?.tokenBalance || 0
  const lockRank = details?.rank

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400" />
          <p className="text-slate-400">Checking access status...</p>
        </div>
      </div>
    )
  }

  if (!walletConnected) {
    return (
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <div className="text-center py-8">
          <div className="text-6xl mb-4">🔌</div>
          <h3 className="text-xl font-semibold mb-2">Connect Wallet</h3>
          <p className="text-slate-400 mb-6">
            Connect your Solana wallet to check your access status
          </p>
          <button
            onClick={connectWallet}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    )
  }

  // OG Access
  if (type === 'og') {
    return (
      <div className="bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-lg p-6 border-2 border-green-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-5xl">👑</div>
            <div>
              <h3 className="text-2xl font-bold text-green-400">OG Access</h3>
              <p className="text-slate-300">Lifetime Pass Holder</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Rank</p>
            <p className="text-3xl font-bold text-green-400">#{lockRank}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">NFT Status</p>
            <p className="text-lg font-semibold">
              {hasNFT ? '✅ Minted' : '⏳ Pending'}
            </p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Access Level</p>
            <p className="text-lg font-semibold text-green-400">Full Access</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Transferable</p>
            <p className="text-lg font-semibold">❌ Soulbound</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
          <p className="text-sm text-slate-400">
            🎉 Congratulations! You're one of the 333 OG members. Your access is permanent and non-transferable.
          </p>
        </div>
      </div>
    )
  }

  // Holder Access
  if (type === 'holder') {
    return (
      <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg p-6 border-2 border-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-5xl">💎</div>
            <div>
              <h3 className="text-2xl font-bold text-blue-400">Holder Access</h3>
              <p className="text-slate-300">Token Holder</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Your Balance</p>
            <p className="text-lg font-semibold">{holdBalance.toLocaleString()} Tokens</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Requirement</p>
            <p className="text-lg font-semibold">≥100,000 Tokens</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
          <p className="text-sm text-slate-400">
            💪 You have access via token holding. Maintain ≥100k tokens to keep access.
          </p>
        </div>
      </div>
    )
  }

  // No Access
  return (
    <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
      <div className="text-center py-8">
        <div className="text-6xl mb-4">🔐</div>
        <h3 className="text-xl font-semibold mb-2">No Access</h3>
        <p className="text-slate-400 mb-6">
          You don't have access yet. Choose one of the options below:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {/* Option 1: Lock & Mint NFT */}
          <div className="bg-slate-800 rounded-lg p-6 text-left">
            <div className="text-3xl mb-3">🔒</div>
            <h4 className="text-lg font-semibold mb-2">Lock & Mint OG NFT</h4>
            <p className="text-sm text-slate-400 mb-4">
              Lock tokens based on MCAP to get a rank. Top 333 get a soulbound NFT with lifetime access.
            </p>
            <button className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
              Calculate Lock Amount
            </button>
          </div>

          {/* Option 2: Hold Tokens */}
          <div className="bg-slate-800 rounded-lg p-6 text-left">
            <div className="text-3xl mb-3">💎</div>
            <h4 className="text-lg font-semibold mb-2">Hold ≥100k Tokens</h4>
            <p className="text-sm text-slate-400 mb-4">
              Hold at least 100,000 tokens in your wallet to get access. No locking required.
            </p>
            <button className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors">
              Check Your Balance
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

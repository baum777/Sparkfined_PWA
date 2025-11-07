/**
 * LockCalculator — Calculate lock amount based on MCAP
 * 
 * Formula: Lock Amount = MCAP * Multiplier
 * Example: MCAP = $3.5M → Lock = 3500 * 1000 = 3.5M tokens
 */

import { useState } from 'react'

interface LockCalculatorProps {
  onNavigate?: (tab: 'status' | 'lock' | 'hold' | 'leaderboard') => void
}

export default function LockCalculator({ onNavigate }: LockCalculatorProps) {
  const [mcap, setMcap] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Replace with real API call (Issue #2)
  const fetchMCAP = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock: await fetch('/api/mcap')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setMcap(3500) // Fallback value: $3.5M
    } catch (err) {
      setError('Failed to fetch MCAP. Using fallback value.')
      setMcap(3500)
    } finally {
      setLoading(false)
    }
  }

  const lockAmount = mcap ? mcap * 1000 : 0
  const lockAmountFormatted = lockAmount.toLocaleString()

  return (
    <div className="space-y-6">
      {/* MCAP Fetcher */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h3 className="text-xl font-semibold mb-4">Current MCAP</h3>
        
        {!mcap && !loading && (
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">
              Click below to fetch the current market cap from Pyth oracle
            </p>
            <button
              onClick={fetchMCAP}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
            >
              Fetch Current MCAP
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400" />
            <p className="text-slate-400 text-center">Fetching from Pyth oracle...</p>
          </div>
        )}

        {mcap && !loading && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Market Cap</p>
                <p className="text-2xl font-bold text-green-400">${mcap.toLocaleString()}</p>
              </div>
              <div className="bg-slate-800 rounded-lg p-4">
                <p className="text-sm text-slate-400 mb-1">Required Lock</p>
                <p className="text-2xl font-bold text-blue-400">{lockAmountFormatted} Tokens</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
                <p className="text-sm text-yellow-400">⚠️ {error}</p>
              </div>
            )}

            <button
              onClick={fetchMCAP}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
            >
              Refresh MCAP
            </button>
          </div>
        )}
      </div>

      {/* Lock Info */}
      {mcap && (
        <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
          <h3 className="text-xl font-semibold mb-4">How It Works</h3>
          
          <div className="space-y-4 text-slate-300">
            <div className="flex items-start space-x-3">
              <div className="text-2xl">1️⃣</div>
              <div>
                <p className="font-semibold mb-1">Lock Tokens</p>
                <p className="text-sm text-slate-400">
                  Lock {lockAmountFormatted} tokens based on current MCAP (${mcap.toLocaleString()})
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">2️⃣</div>
              <div>
                <p className="font-semibold mb-1">Get Your Rank</p>
                <p className="text-sm text-slate-400">
                  You'll be assigned a rank based on lock timestamp. First 333 become OGs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="text-2xl">3️⃣</div>
              <div>
                <p className="font-semibold mb-1">Mint Soulbound NFT</p>
                <p className="text-sm text-slate-400">
                  If rank ≤ 333, you can mint a lifetime access NFT (non-transferable).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="p-4 bg-blue-900/20 border border-blue-500/50 rounded-lg">
              <p className="text-sm text-blue-300">
                💡 <strong>Pro Tip:</strong> MCAP is dynamic and updated via Pyth oracle. Lock early to secure a better rank!
              </p>
            </div>
            
            <button 
              onClick={() => onNavigate?.('leaderboard')}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>🏆</span>
              <span>View Leaderboard</span>
            </button>
          </div>

          <button className="w-full mt-6 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors">
            Proceed to Lock
          </button>
        </div>
      )}
    </div>
  )
}

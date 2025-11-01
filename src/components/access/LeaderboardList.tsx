/**
 * LeaderboardList — Display top 333 OG locks
 */

import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  rank: number
  wallet: string
  amount: number
  timestamp: number
}

export default function LeaderboardList() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // TODO: Replace with real API call (Issue #6)
  const fetchLeaderboard = async () => {
    setLoading(true)
    setError(null)
    try {
      // Mock: await fetch('/api/leaderboard')
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Mock data
      const mockEntries: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
        rank: i + 1,
        wallet: `${Math.random().toString(36).substring(2, 6).toUpperCase()}...${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        amount: Math.floor(Math.random() * 5000000) + 3500000,
        timestamp: Date.now() - Math.floor(Math.random() * 86400000 * 30),
      }))
      
      setEntries(mockEntries)
    } catch (err) {
      setError('Failed to load leaderboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const formatWallet = (wallet: string) => wallet
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold">OG Leaderboard</h3>
            <p className="text-sm text-slate-400">Top 333 token locks with lifetime access</p>
          </div>
          <button
            onClick={fetchLeaderboard}
            disabled={loading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 text-white font-medium rounded-lg transition-colors"
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Total OG Slots</p>
            <p className="text-2xl font-bold text-green-400">333</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Filled Slots</p>
            <p className="text-2xl font-bold text-blue-400">{entries.length}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-sm text-slate-400 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-yellow-400">{333 - entries.length}</p>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400" />
          <p className="ml-4 text-slate-400">Loading leaderboard...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500 rounded-lg text-center">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {!loading && !error && entries.length > 0 && (
        <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-slate-800 text-sm font-semibold text-slate-400">
            <div>Rank</div>
            <div>Wallet</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Date</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-slate-800">
            {entries.map((entry) => (
              <div
                key={entry.rank}
                className={`grid grid-cols-4 gap-4 p-4 hover:bg-slate-800/50 transition-colors ${
                  entry.rank <= 10 ? 'bg-green-900/10' : ''
                }`}
              >
                <div className="flex items-center space-x-2">
                  {entry.rank <= 3 && (
                    <span className="text-xl">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                    </span>
                  )}
                  <span className="font-semibold">#{entry.rank}</span>
                </div>
                <div className="font-mono text-sm text-slate-300">
                  {formatWallet(entry.wallet)}
                </div>
                <div className="text-right font-semibold text-green-400">
                  {entry.amount.toLocaleString()}
                </div>
                <div className="text-right text-sm text-slate-400">
                  {formatDate(entry.timestamp)}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-800 text-center text-sm text-slate-400">
            Showing top {entries.length} of 333 • Updates every 5 minutes
          </div>
        </div>
      )}

      {!loading && !error && entries.length === 0 && (
        <div className="bg-slate-900 rounded-lg p-12 border border-slate-800 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h4 className="text-xl font-semibold mb-2">No Locks Yet</h4>
          <p className="text-slate-400">
            Be the first to lock tokens and claim rank #1!
          </p>
        </div>
      )}
    </div>
  )
}

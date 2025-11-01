/**
 * HoldCheck — Verify token hold balance (≥100k)
 */

import { useState } from 'react'

export default function HoldCheck() {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{
    balance: number
    hasAccess: boolean
  } | null>(null)

  // TODO: Replace with real API call (Issue #4)
  const checkHold = async () => {
    setChecking(true)
    try {
      // Mock: await fetch('/api/hold-check', { method: 'POST', body: { wallet } })
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const mockBalance = Math.floor(Math.random() * 200000)
      setResult({
        balance: mockBalance,
        hasAccess: mockBalance >= 100000,
      })
    } catch (err) {
      console.error('Hold check failed:', err)
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Check Button */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h3 className="text-xl font-semibold mb-4">Verify Token Hold</h3>
        
        <p className="text-slate-400 mb-6">
          Hold at least <strong className="text-white">100,000 tokens</strong> to get access.
          No locking required—just keep them in your wallet.
        </p>

        {!result && (
          <button
            onClick={checkHold}
            disabled={checking}
            className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {checking ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>Checking Balance...</span>
              </>
            ) : (
              <span>Check My Balance</span>
            )}
          </button>
        )}
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg p-6 border-2 ${
            result.hasAccess
              ? 'bg-green-900/20 border-green-500'
              : 'bg-red-900/20 border-red-500'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-4xl">{result.hasAccess ? '✅' : '❌'}</div>
              <div>
                <h4 className="text-xl font-semibold">
                  {result.hasAccess ? 'Access Granted!' : 'Insufficient Balance'}
                </h4>
                <p className="text-slate-400">
                  {result.hasAccess
                    ? 'You have holder access'
                    : 'You need more tokens'}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Your Balance</p>
              <p className="text-2xl font-bold">{result.balance.toLocaleString()} Tokens</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4">
              <p className="text-sm text-slate-400 mb-1">Requirement</p>
              <p className="text-2xl font-bold">100,000 Tokens</p>
            </div>
          </div>

          {!result.hasAccess && (
            <div className="p-4 bg-slate-900/50 rounded-lg">
              <p className="text-sm text-slate-400 mb-3">
                You're {(100000 - result.balance).toLocaleString()} tokens short.
              </p>
              <p className="text-sm text-slate-400">
                💡 <strong>Alternative:</strong> Lock tokens to get an OG NFT instead (goes to Lock tab).
              </p>
            </div>
          )}

          <button
            onClick={checkHold}
            className="w-full mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors"
          >
            Re-check Balance
          </button>
        </div>
      )}

      {/* Info */}
      <div className="bg-slate-900 rounded-lg p-6 border border-slate-800">
        <h4 className="text-lg font-semibold mb-3">How Holder Access Works</h4>
        
        <div className="space-y-3 text-sm text-slate-400">
          <div className="flex items-start space-x-2">
            <span className="text-green-400 mt-0.5">✓</span>
            <p>
              <strong className="text-white">No Locking:</strong> Just hold tokens in your wallet
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 mt-0.5">✓</span>
            <p>
              <strong className="text-white">Dynamic Access:</strong> Keep ≥100k to maintain access
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-green-400 mt-0.5">✓</span>
            <p>
              <strong className="text-white">No NFT Required:</strong> Different from OG access
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-yellow-400 mt-0.5">⚠</span>
            <p>
              <strong className="text-white">Note:</strong> If balance drops below 100k, you lose access
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

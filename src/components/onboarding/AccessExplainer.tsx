/**
 * AccessExplainer - Explains the OG Pass vs Holder access system
 * 
 * Shows on first visit to Access Page.
 */

import { useState, useEffect } from 'react'
import { getOnboardingState, updateOnboardingState, trackOnboardingEvent } from '@/lib/onboarding'
import { ACCESS_CONFIG } from '@/config/access'

export default function AccessExplainer() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const state = getOnboardingState()
    if (!state.accessExplainerSeen) {
      setVisible(true)
      trackOnboardingEvent('access_explainer_shown')
    }
  }, [])

  const handleClose = () => {
    trackOnboardingEvent('access_explainer_closed')
    updateOnboardingState({ accessExplainerSeen: true })
    setVisible(false)
  }

  const handleCalculateLock = () => {
    trackOnboardingEvent('access_explainer_calculate_clicked')
    updateOnboardingState({ accessExplainerSeen: true })
    setVisible(false)
    // Parent component should switch to Lock tab
    window.dispatchEvent(new CustomEvent('switch-to-lock-tab'))
  }

  const handleCheckBalance = () => {
    trackOnboardingEvent('access_explainer_check_balance_clicked')
    updateOnboardingState({ accessExplainerSeen: true })
    setVisible(false)
    // Parent component should switch to Hold tab
    window.dispatchEvent(new CustomEvent('switch-to-hold-tab'))
  }

  if (!visible) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose()
      }}
    >
      <div className="bg-slate-900 rounded-2xl p-6 max-w-2xl w-full border border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">🎫</div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
            Understanding Access
          </h2>
          <p className="text-slate-400">
            Two ways to unlock full features
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* OG Pass Option */}
          <div className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-2 border-green-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">👑</div>
              <div>
                <h3 className="text-xl font-bold text-green-400">OG Pass</h3>
                <p className="text-sm text-slate-400">Limited to {ACCESS_CONFIG.OG_SLOTS} slots</p>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Lock tokens based on MCAP</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Get soulbound NFT with rank</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Lifetime access (non-transferable)</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>Early rank = more prestige</span>
              </li>
            </ul>

            <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                💡 <strong>How it works:</strong> Lock amount is calculated based on current market cap. 
                First {ACCESS_CONFIG.OG_SLOTS} locks get a soulbound NFT with unique rank number.
              </p>
            </div>

            <button
              onClick={handleCalculateLock}
              className="w-full px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
            >
              Calculate Lock Amount
            </button>
          </div>

          {/* Holder Option */}
          <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border-2 border-blue-500/30 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl">💎</div>
              <div>
                <h3 className="text-xl font-bold text-blue-400">Holder Access</h3>
                <p className="text-sm text-slate-400">Unlimited slots</p>
              </div>
            </div>

            <ul className="space-y-2 mb-4">
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Hold ≥{ACCESS_CONFIG.HOLD_REQUIREMENT.toLocaleString()} tokens</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>No locking required</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Access while holding tokens</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-slate-300">
                <span className="text-blue-500 mt-0.5">✓</span>
                <span>Flexible entry/exit</span>
              </li>
            </ul>

            <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                💡 <strong>How it works:</strong> Simply hold the required tokens in your wallet. 
                Access is verified on-chain. No lock-up period.
              </p>
            </div>

            <button
              onClick={handleCheckBalance}
              className="w-full px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-semibold transition-colors"
            >
              Check My Balance
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6">
          <h4 className="font-semibold mb-3 text-slate-200">Quick Comparison</h4>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 border-b border-slate-700">
                <th className="text-left py-2">Feature</th>
                <th className="text-center py-2">OG Pass</th>
                <th className="text-center py-2">Holder</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              <tr className="border-b border-slate-800">
                <td className="py-2">Slots Available</td>
                <td className="text-center">{ACCESS_CONFIG.OG_SLOTS}</td>
                <td className="text-center">∞</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2">Lock Required</td>
                <td className="text-center">✓</td>
                <td className="text-center">✗</td>
              </tr>
              <tr className="border-b border-slate-800">
                <td className="py-2">NFT Badge</td>
                <td className="text-center">✓</td>
                <td className="text-center">✗</td>
              </tr>
              <tr>
                <td className="py-2">Duration</td>
                <td className="text-center">Lifetime</td>
                <td className="text-center">While holding</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Maybe Later
          </button>
          <button
            onClick={handleCalculateLock}
            className="flex-1 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

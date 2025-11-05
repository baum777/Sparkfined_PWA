/**
 * AccessPage — Sparkfiend Access Pass Dashboard
 * 
 * Tabs:
 * - Status: Show current access status (OG / Holder / None)
 * - Lock: MCAP-based lock calculator
 * - Hold: Token hold verification
 * - Leaderboard: Top 333 OG locks
 */

import { useState } from 'react'
import AccessStatusCard from '../components/access/AccessStatusCard'
import LockCalculator from '../components/access/LockCalculator'
import HoldCheck from '../components/access/HoldCheck'
import LeaderboardList from '../components/access/LeaderboardList'

type TabType = 'status' | 'lock' | 'hold' | 'leaderboard'

export default function AccessPage() {
  const [activeTab, setActiveTab] = useState<TabType>('status')

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'status', label: 'Status', icon: '🎫' },
    { id: 'lock', label: 'Lock', icon: '🔒' },
    { id: 'hold', label: 'Hold', icon: '💎' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 pb-20 md:p-8 md:pb-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Sparkfiend Access Pass
        </h1>
        <p className="text-slate-400">
          Fair OG-Gating • 333 Slots • MCAP-Dynamic Lock • Soulbound NFT
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex space-x-2 border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-3 font-medium transition-colors
                ${
                  activeTab === tab.id
                    ? 'text-green-400 border-b-2 border-green-400'
                    : 'text-slate-400 hover:text-white'
                }
              `}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        {activeTab === 'status' && <AccessStatusCard />}
        {activeTab === 'lock' && <LockCalculator />}
        {activeTab === 'hold' && <HoldCheck />}
        {activeTab === 'leaderboard' && <LeaderboardList />}
      </div>
    </div>
  )
}

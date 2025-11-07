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

  // Function to switch tabs from child components
  const navigateToTab = (tab: TabType) => {
    setActiveTab(tab)
    // Smooth scroll to top on tab change
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'status', label: 'Status', icon: '🎫' },
    { id: 'lock', label: 'Lock', icon: '🔒' },
    { id: 'hold', label: 'Hold', icon: '💎' },
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
  ]

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 pb-24 md:pb-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="text-4xl">🎫</div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Sparkfiend Access Pass
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-1">
              Fair OG-Gating • 333 Slots • MCAP-Dynamic Lock • Soulbound NFT
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto mb-6">
        {/* Desktop Tabs */}
        <div className="hidden md:flex space-x-2 border-b border-slate-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateToTab(tab.id)}
              className={`
                  px-4 py-3 font-medium transition-all duration-200
                  ${
                    activeTab === tab.id
                      ? 'text-green-400 border-b-2 border-green-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }
                `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile Tabs - Horizontal Scroll */}
        <div className="md:hidden flex space-x-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => navigateToTab(tab.id)}
              className={`
                  flex-shrink-0 px-4 py-3 font-medium transition-all duration-200 rounded-t-lg
                  ${
                    activeTab === tab.id
                      ? 'text-green-400 bg-slate-800 border-b-2 border-green-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }
                `}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-in">
          {activeTab === 'status' && <AccessStatusCard onNavigate={navigateToTab} />}
          {activeTab === 'lock' && <LockCalculator onNavigate={navigateToTab} />}
          {activeTab === 'hold' && <HoldCheck onNavigate={navigateToTab} />}
          {activeTab === 'leaderboard' && <LeaderboardList onNavigate={navigateToTab} />}
        </div>
      </div>
    </div>
  )
}

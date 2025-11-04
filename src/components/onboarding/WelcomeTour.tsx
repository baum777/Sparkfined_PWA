/**
 * WelcomeTour - First-time user onboarding tour
 * 
 * Shows 3-screen carousel explaining key features.
 */

import { useState, useEffect } from 'react'
import { getOnboardingState, updateOnboardingState, trackOnboardingEvent } from '@/lib/onboarding'

interface TourScreen {
  id: string
  icon: string
  title: string
  description: string
}

const TOUR_SCREENS: TourScreen[] = [
  {
    id: 'analyze',
    icon: '📊',
    title: 'Instant Token Analysis',
    description: 'Paste any token address and get instant KPIs, heatmaps, and AI-powered insights.',
  },
  {
    id: 'chart',
    icon: '📈',
    title: 'Advanced Charting',
    description: 'Draw, analyze, and replay your sessions. Perfect for reviewing your trading decisions.',
  },
  {
    id: 'access',
    icon: '🎫',
    title: 'Fair Access System',
    description: 'Get OG Pass (333 slots) via token locking, or hold ≥100k tokens for access.',
  },
]

export default function WelcomeTour() {
  const [visible, setVisible] = useState(false)
  const [currentScreen, setCurrentScreen] = useState(0)

  useEffect(() => {
    const state = getOnboardingState()
    if (!state.tourShown) {
      setVisible(true)
      trackOnboardingEvent('onboarding_tour_shown')
    }
  }, [])

  const handleNext = () => {
    trackOnboardingEvent('onboarding_tour_next', { screen: currentScreen })
    
    if (currentScreen < TOUR_SCREENS.length - 1) {
      setCurrentScreen(prev => prev + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    trackOnboardingEvent('onboarding_tour_skipped', { at_screen: currentScreen })
    updateOnboardingState({
      tourShown: true,
      completed: false,
      skipCount: getOnboardingState().skipCount + 1,
    })
    setVisible(false)
  }

  const handleComplete = () => {
    trackOnboardingEvent('onboarding_tour_completed')
    updateOnboardingState({
      tourShown: true,
      completed: true,
      currentStep: TOUR_SCREENS.length,
    })
    setVisible(false)
  }

  if (!visible) return null

  const screen = TOUR_SCREENS[currentScreen]
  if (!screen) return null // Safety check

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget) handleSkip()
      }}
    >
      <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-800 shadow-2xl">
        {/* Screen Content */}
        <div className="text-center mb-8">
          <div className="text-7xl mb-4 animate-bounce-slow">{screen.icon}</div>
          <h2 className="text-2xl font-bold mb-3 text-slate-100">{screen.title}</h2>
          <p className="text-slate-400 leading-relaxed">{screen.description}</p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {TOUR_SCREENS.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === currentScreen
                  ? 'w-8 bg-green-500'
                  : 'w-2 bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium transition-colors"
          >
            Skip Tour
          </button>
          <button
            onClick={handleNext}
            className="flex-1 px-4 py-3 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition-colors"
          >
            {currentScreen === TOUR_SCREENS.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        {/* Screen Counter */}
        <div className="text-center mt-4 text-sm text-slate-500">
          {currentScreen + 1} / {TOUR_SCREENS.length}
        </div>
      </div>
    </div>
  )
}

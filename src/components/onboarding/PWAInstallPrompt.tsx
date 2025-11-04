/**
 * PWAInstallPrompt - Progressive Web App installation prompt
 * 
 * Shows custom install prompt after user sees value (3+ minutes of usage).
 */

import { useState, useEffect } from 'react'
import { getOnboardingState, updateOnboardingState, trackOnboardingEvent } from '@/lib/onboarding'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Listen for beforeinstallprompt event
    const handler = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)

      // Check if we should show the prompt
      checkShouldShowPrompt()
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      updateOnboardingState({ pwaInstalled: true })
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const checkShouldShowPrompt = () => {
    const state = getOnboardingState()

    // Don't show if already prompted or installed
    if (state.pwaInstallPrompted || state.pwaInstalled) {
      return
    }

    // Show after 3 minutes of first analyze action
    if (state.firstAnalyzeTimestamp) {
      const elapsed = Date.now() - state.firstAnalyzeTimestamp
      if (elapsed > 3 * 60 * 1000) {
        setVisible(true)
        trackOnboardingEvent('pwa_install_prompt_shown')
      } else {
        // Schedule for later
        const remaining = 3 * 60 * 1000 - elapsed
        setTimeout(() => {
          setVisible(true)
          trackOnboardingEvent('pwa_install_prompt_shown')
        }, remaining)
      }
    }
  }

  const handleInstall = async () => {
    if (!deferredPrompt) {
      console.warn('[PWA] No deferred prompt available')
      return
    }

    trackOnboardingEvent('pwa_install_clicked')

    // Show native install prompt
    await deferredPrompt.prompt()

    // Wait for user choice
    const { outcome } = await deferredPrompt.userChoice

    trackOnboardingEvent('pwa_install_outcome', { outcome })

    if (outcome === 'accepted') {
      updateOnboardingState({
        pwaInstallPrompted: true,
        pwaInstalled: true,
      })
    } else {
      updateOnboardingState({
        pwaInstallPrompted: true,
      })
    }

    setDeferredPrompt(null)
    setVisible(false)
  }

  const handleDismiss = () => {
    trackOnboardingEvent('pwa_install_dismissed')
    updateOnboardingState({
      pwaInstallPrompted: true,
    })
    setVisible(false)

    // Show again after 24 hours
    setTimeout(() => {
      const state = getOnboardingState()
      if (!state.pwaInstalled) {
        setVisible(true)
        trackOnboardingEvent('pwa_install_prompt_reshown')
      }
    }, 24 * 60 * 60 * 1000)
  }

  if (!visible || !deferredPrompt) return null

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 animate-slide-up">
      <div className="bg-slate-900 border-2 border-green-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-lg">
        <div className="flex items-start gap-3">
          <div className="text-4xl">📲</div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1 text-slate-100">Install Sparkfined</h3>
            <p className="text-sm text-slate-400 mb-3">
              Get the full experience with faster loading, offline access, and push notifications.
            </p>

            {/* Benefits */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-green-500">✓</span>
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-green-500">✓</span>
                <span>Instant loading</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <span className="text-green-500">✓</span>
                <span>Price alerts</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 flex items-center justify-center text-xs transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

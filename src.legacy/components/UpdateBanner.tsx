/**
 * UpdateBanner Component
 * 
 * Shows a banner when a new service worker version is available
 * User must click "Update" to apply the new version
 */

import { useEffect, useState } from 'react'
import { setupSwUpdater, applyUpdate } from '../lib/swUpdater'

export default function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Only run in production and if SW is supported
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
      return
    }

    // Get SW registration
    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return

      setRegistration(reg)

      // Setup updater
      const cleanup = setupSwUpdater(reg, (hasUpdate) => {
        setShowBanner(hasUpdate)
      })

      return cleanup
    })
  }, [])

  const handleUpdate = () => {
    if (!registration) return

    setIsUpdating(true)
    
    try {
      applyUpdate(registration)
      // Page will reload automatically after update
    } catch (error) {
      console.error('Failed to apply update:', error)
      setIsUpdating(false)
    }
  }

  const handleDismiss = () => {
    setShowBanner(false)
    // User can still update later by refreshing manually
  }

  if (!showBanner) return null

  return (
    <div className="pointer-events-none fixed top-0 left-0 right-0 z-toast flex justify-center px-4 pt-4 sm:px-6">
      <div
        className="pointer-events-auto flex w-full max-w-3xl flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-surface/90 px-4 py-3 text-text-primary shadow-card-subtle backdrop-blur-2xl"
        role="alert"
        aria-live="polite"
      >
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-brand" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold tracking-wide text-text-primary">New version available</p>
            <p className="text-xs text-text-secondary">
              Refresh the shell to apply the latest Adaptive Intelligence surfaces.
            </p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex items-center gap-2 rounded-xl border border-transparent bg-brand px-4 py-2 text-sm font-semibold text-bg transition hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Update application now"
          >
            {isUpdating ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating…
              </>
            ) : (
              'Update now'
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="rounded-xl border border-transparent p-2 text-text-secondary transition hover:border-border/60 hover:bg-interactive-hover hover:text-text-primary"
            aria-label="Dismiss update notification"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

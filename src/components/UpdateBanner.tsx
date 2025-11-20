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
    <div
      className="fixed top-0 left-0 right-0 z-50 border-b border-border-moderate bg-app-gradient text-text-primary shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-3">
        <div className="flex items-center gap-3 flex-1">
          <svg
            className="w-5 h-5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <div className="flex-1">
            <p className="text-sm md:text-base font-medium text-text-primary">
              New version available!
            </p>
            <p className="text-xs md:text-sm text-text-secondary hidden sm:block">
              Update now to get the latest features and improvements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-bg transition-colors hover:bg-brand/90 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Update application now"
          >
            {isUpdating ? (
              <>
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Updating...
              </>
            ) : (
              'Update Now'
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="rounded-lg p-2 text-text-primary transition-colors hover:bg-interactive-hover"
            aria-label="Dismiss update notification"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

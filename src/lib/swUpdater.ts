/**
 * Service Worker Update Manager
 * 
 * Implements manual update flow:
 * - Detects when a new SW is waiting
 * - Shows update banner to user
 * - Applies update only after user confirmation
 * - Polling fallback for update detection
 */

export interface SwUpdateManager {
  registration: ServiceWorkerRegistration | null
  hasUpdate: boolean
  checkForUpdate: () => Promise<void>
  applyUpdate: () => void
}

/**
 * Setup service worker updater with manual control flow
 * 
 * @param registration - ServiceWorkerRegistration instance
 * @param onUpdateReady - Callback when update is ready (show banner)
 * @returns Cleanup function
 */
export function setupSwUpdater(
  registration: ServiceWorkerRegistration,
  onUpdateReady: (hasUpdate: boolean) => void
): () => void {
  
  // Check if SW is already waiting
  function checkWaiting() {
    if (registration.waiting) {
      onUpdateReady(true)
      return true
    }
    return false
  }

  // Listen for new SW installation
  function handleUpdateFound() {
    const installing = registration.installing
    if (!installing) return

    installing.addEventListener('statechange', () => {
      if (installing.state === 'installed' && navigator.serviceWorker.controller) {
        // New SW installed and old one still controlling → update ready
        if (registration.waiting) {
          onUpdateReady(true)
        }
      }
    })
  }

  // Initial check
  checkWaiting()

  // Listen for new updates
  registration.addEventListener('updatefound', handleUpdateFound)

  // Polling fallback: check for updates every 60 seconds (only when page focused)
  const pollInterval = setInterval(() => {
    if (document.visibilityState === 'visible') {
      registration.update().catch(() => {
        // Silently ignore update check failures
      })
    }
  }, 60000) // 60 seconds

  // Cleanup function
  return () => {
    clearInterval(pollInterval)
    registration.removeEventListener('updatefound', handleUpdateFound)
  }
}

/**
 * Apply the waiting service worker update
 * Sends SKIP_WAITING message and reloads the page
 * 
 * @param registration - ServiceWorkerRegistration instance
 */
export function applyUpdate(registration: ServiceWorkerRegistration): void {
  const waiting = registration.waiting
  
  if (!waiting) {
    console.warn('No waiting service worker to activate')
    return
  }

  // Listen for controlling SW change
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    refreshing = true
    window.location.reload()
  })

  // Tell waiting SW to skip waiting and become active
  waiting.postMessage({ type: 'SKIP_WAITING' })
}

/**
 * Manual update check (e.g., triggered by user button)
 * 
 * @param registration - ServiceWorkerRegistration instance
 */
export async function checkForUpdate(
  registration: ServiceWorkerRegistration
): Promise<void> {
  try {
    await registration.update()
  } catch (error) {
    console.error('Update check failed:', error)
    throw error
  }
}

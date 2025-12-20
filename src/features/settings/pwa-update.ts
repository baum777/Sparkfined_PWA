export type UpdateStatus = 'idle' | 'checking' | 'available' | 'updating' | 'updated' | 'error'

interface UpdateCapability {
  supported: boolean
  registration: ServiceWorkerRegistration | null
  waiting: boolean
  reason?: string
}

interface UpdateCheckResult {
  registration: ServiceWorkerRegistration
  waiting: boolean
}

async function resolveRegistration(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) return null

  const registration = (await navigator.serviceWorker.getRegistration()) ?? null
  if (registration) return registration

  try {
    const ready = await navigator.serviceWorker.ready
    return ready ?? null
  } catch (error) {
    console.warn('[pwa-update] Failed to resolve SW registration', error)
    return null
  }
}

function waitForWaitingState(registration: ServiceWorkerRegistration, timeoutMs = 8000): Promise<boolean> {
  return new Promise((resolve) => {
    if (registration.waiting) {
      resolve(true)
      return
    }

    const installing = registration.installing
    if (installing) {
      const onStateChange = () => {
        if (installing.state === 'installed') {
          resolve(!!registration.waiting)
          installing.removeEventListener('statechange', onStateChange)
        }
      }
      installing.addEventListener('statechange', onStateChange)
      return
    }

    const timer = setTimeout(() => resolve(!!registration.waiting), timeoutMs)
    const onUpdateFound = () => {
      const sw = registration.installing
      if (!sw) {
        clearTimeout(timer)
        registration.removeEventListener('updatefound', onUpdateFound)
        resolve(!!registration.waiting)
        return
      }

      const onStateChange = () => {
        if (sw.state === 'installed') {
          clearTimeout(timer)
          sw.removeEventListener('statechange', onStateChange)
          registration.removeEventListener('updatefound', onUpdateFound)
          resolve(!!registration.waiting)
        }
      }

      sw.addEventListener('statechange', onStateChange)
    }

    registration.addEventListener('updatefound', onUpdateFound)
  })
}

export async function getUpdateCapability(): Promise<UpdateCapability> {
  if (!('serviceWorker' in navigator)) {
    return { supported: false, registration: null, waiting: false, reason: 'Service workers not supported' }
  }

  const registration = await resolveRegistration()
  return { supported: true, registration, waiting: !!registration?.waiting }
}

export async function checkForUpdate(): Promise<UpdateCheckResult> {
  if (!('serviceWorker' in navigator)) {
    throw new Error('Service workers not supported')
  }

  const registration = await resolveRegistration()
  if (!registration) {
    throw new Error('No service worker registration found')
  }

  await registration.update()

  const waiting = registration.waiting ? true : await waitForWaitingState(registration)
  return { registration, waiting }
}

export async function applyUpdate(registration?: ServiceWorkerRegistration): Promise<void> {
  const resolvedRegistration = registration ?? (await resolveRegistration())

  if (!resolvedRegistration) {
    throw new Error('No service worker registration found')
  }

  const waiting = resolvedRegistration.waiting
  if (!waiting) {
    throw new Error('No waiting service worker to activate')
  }

  return new Promise((resolve, reject) => {
    let settled = false

    const cleanup = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange)
    }

    const handleControllerChange = () => {
      if (settled) return
      settled = true
      cleanup()
      window.location.reload()
      resolve()
    }

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange)

    try {
      waiting.postMessage({ type: 'SKIP_WAITING' })
    } catch (error) {
      cleanup()
      reject(error)
      return
    }

    setTimeout(() => {
      if (settled) return
      cleanup()
      reject(new Error('Service worker update timed out'))
    }, 12000)
  })
}

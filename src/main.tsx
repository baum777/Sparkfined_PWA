import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import './styles/driver-override.css'
import { BrowserRouter } from 'react-router-dom'
import { AppErrorBoundary } from '@/app/AppErrorBoundary'
import { logError } from '@/lib/log-error'
import { validateEnv } from '@/lib/env'
import { installGlobalErrorHooks } from '@/diagnostics/crash-report'
import { installBootguard } from '@/diagnostics/bootguard'

// CRITICAL: Install boot guard FIRST (captures errors before React)
installBootguard()

// CRITICAL: Install global error hooks SECOND (before any other code)
installGlobalErrorHooks()

// STEP B: Early ENV validation (non-fatal, logs warnings only)
try {
  validateEnv()
} catch (error) {
  console.warn('[main.tsx] ENV validation failed:', error)
}

if (import.meta.env.DEV) {
  import('@/ai/ingest/devIngest')
    .then(({ registerDevTrendIngest }) => registerDevTrendIngest())
    .catch((error) => console.warn('[main.tsx] Dev trend ingest hook failed:', error))
}

// Service Worker Registration - Manual Update Flow
// SW is registered via vite-plugin-pwa with registerType: 'autoUpdate'
// Update handling is done via UpdateBanner component
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // STEP A: Enhanced SW lifecycle logging (preview-only)
  const isPreview = (import.meta as any).env?.VERCEL_ENV === 'preview'
  
  // Listen for SW messages (e.g., cache status, SKIP_WAITING)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data) {
      switch (event.data.type) {
        case 'CACHE_UPDATED':
          console.log('📦 Cache updated:', event.data.url)
          break
        case 'SW_ACTIVATED':
          console.log('✅ Service Worker activated')
          break
      }
    }
  })

  // Listen for controllerchange - reload when new SW takes over
  let refreshing = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return
    console.log('[PWA] controllerchange → reload')
    refreshing = true
    setTimeout(() => location.reload(), 250)
  })

  // STEP A: Log SW registration state (preview-only)
  navigator.serviceWorker.ready
    .then((registration) => {
      if (isPreview) {
        console.log('[PWA] SW ready:', {
          scope: registration.scope,
          active: !!registration.active,
          waiting: !!registration.waiting,
          installing: !!registration.installing,
        })
      }
      
      // Check for waiting SW (update available)
      if (registration.waiting && isPreview) {
        console.warn('[PWA] Update available (waiting SW detected)')
      }
    })
    .catch((error) => {
      console.error('[PWA] Service worker registration failed:', error)
    })
}

// Track online/offline status (browser-only)
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (import.meta.env.DEV) console.log('🌐 Back online')
    document.body.classList.remove('offline-mode')
  })

  window.addEventListener('offline', () => {
    if (import.meta.env.DEV) console.log('📴 Offline mode')
    document.body.classList.add('offline-mode')
  })
}

const ensureOverlayRoot = () => {
  let overlayRoot = document.getElementById('overlay-root')
  if (!overlayRoot) {
    overlayRoot = document.createElement('div')
    overlayRoot.id = 'overlay-root'
    document.body.appendChild(overlayRoot)
  }
  return overlayRoot
}

// Ensure root element exists before rendering
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('[main.tsx] Root element not found!')
  // Create root element if it doesn't exist (shouldn't happen, but safety check)
  const newRoot = document.createElement('div')
  newRoot.id = 'root'
  document.body.appendChild(newRoot)
  ensureOverlayRoot()
  const root = ReactDOM.createRoot(newRoot, {
    onRecoverableError(error, info) {
      if ((import.meta as any).env?.VERCEL_ENV === 'preview') {
        logError('RecoverableError', error, info)
      }
    },
  })
  // global listeners only in preview
  if ((import.meta as any).env?.VERCEL_ENV === 'preview') {
    window.addEventListener('error', (event: ErrorEvent) => {
      const detail = event.error ?? event.message
      logError('window.error', detail)
    })
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      logError('unhandledrejection', event.reason)
    })
  }
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>
  )
} else {
  ensureOverlayRoot()
  const root = ReactDOM.createRoot(rootElement, {
    onRecoverableError(error, info) {
      if ((import.meta as any).env?.VERCEL_ENV === 'preview') {
        logError('RecoverableError', error, info)
      }
    },
  })
  if ((import.meta as any).env?.VERCEL_ENV === 'preview') {
    window.addEventListener('error', (event: ErrorEvent) => {
      const detail = event.error ?? event.message
      logError('window.error', detail)
    })
    window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
      logError('unhandledrejection', event.reason)
    })
  }
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </BrowserRouter>
    </React.StrictMode>
  )
}

// Defer non-critical initialization until after React hydration
// This reduces the initial bundle size by deferring these imports
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    if (import.meta.env.DEV) console.log('[idle] app settled')
    
    // Initialize layout toggles (deferred - not critical for initial render)
    import('./lib/layout-toggle').then(({ initializeLayoutToggles }) => {
      try {
        initializeLayoutToggles()
      } catch (error) {
        console.warn('[main.tsx] Layout toggle initialization failed:', error)
      }
    }).catch(error => console.warn('[main.tsx] Failed to load layout-toggle:', error))
    
    // Initialize event subscriptions (deferred)
    import('@/ai/ingest/eventSubscriptions').then(({ initializeEventSubscriptions }) => {
      try {
        initializeEventSubscriptions()
      } catch (error) {
        console.warn('[main.tsx] Event subscription initialization failed:', error)
      }
    }).catch(error => console.warn('[main.tsx] Failed to load event subscriptions:', error))
    
    // Initialize Live Data (deferred)
    import('@/lib/live/liveDataManager').then(({ initializeLiveData }) => {
      try {
        initializeLiveData()
      } catch (error) {
        console.warn('[main.tsx] Live data initialization failed:', error)
      }
    }).catch(error => console.warn('[main.tsx] Failed to load live data manager:', error))
    
    // Auto-check assets (deferred - only in production)
    if (import.meta.env.PROD) {
      import('@/lib/debug-assets').then(({ autoCheckAssets }) => {
        autoCheckAssets()
      }).catch(error => console.warn('[main.tsx] Failed to load debug-assets:', error))
    }
  })
} else {
  // Fallback for browsers without requestIdleCallback
  setTimeout(() => {
    // Initialize layout toggles (deferred)
    import('./lib/layout-toggle').then(({ initializeLayoutToggles }) => {
      try {
        initializeLayoutToggles()
      } catch (error) {
        console.warn('[main.tsx] Layout toggle initialization failed:', error)
      }
    }).catch(error => console.warn('[main.tsx] Failed to load layout-toggle:', error))
    
    // Initialize event subscriptions (deferred)
    import('@/ai/ingest/eventSubscriptions').then(({ initializeEventSubscriptions }) => {
      try {
        initializeEventSubscriptions()
      } catch (error) {
        console.warn('[main.tsx] Event subscription initialization failed:', error)
      }
    }).catch(error => console.warn('[main.tsx] Failed to load event subscriptions:', error))
    
    // Initialize Live Data (deferred)
    import('@/lib/live/liveDataManager').then(({ initializeLiveData }) => {
      try {
        initializeLiveData()
      } catch (error) {
        console.warn('[main.tsx] Live data initialization failed:', error)
      }
    }).catch(error => console.warn('[main.tsx] Failed to load live data manager:', error))
    
    // Auto-check assets (deferred - only in production)
    if (import.meta.env.PROD) {
      import('@/lib/debug-assets').then(({ autoCheckAssets }) => {
        autoCheckAssets()
      }).catch(error => console.warn('[main.tsx] Failed to load debug-assets:', error))
    }
  }, 100)
}

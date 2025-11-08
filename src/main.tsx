import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import './styles/driver-override.css'
import 'driver.js/dist/driver.css'
import { BrowserRouter } from 'react-router-dom'
import { initializeLayoutToggles } from './lib/layout-toggle'
import { AppErrorBoundary } from '@/app/AppErrorBoundary'
import { logError } from '@/lib/log-error'
import { ENV, validateEnv } from '@/lib/env'
import { autoCheckAssets } from '@/lib/debug-assets'
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

// Initialize layout toggles BEFORE React render
// Wrap in try-catch to prevent blocking app initialization
try {
  initializeLayoutToggles()
} catch (error) {
  console.warn('[main.tsx] Layout toggle initialization failed:', error)
  // Continue anyway - app should still work
}

// Service Worker Registration - Manual Update Flow
// SW is registered via vite-plugin-pwa with registerType: 'autoUpdate'
// Update handling is done via UpdateBanner component
if ('serviceWorker' in navigator && ENV.PROD) {
  // STEP A: Enhanced SW lifecycle logging (preview-only)
  const isPreview = ENV.VERCEL_ENV === 'preview'
  
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
    if (ENV.DEV) console.log('🌐 Back online')
    document.body.classList.remove('offline-mode')
  })

  window.addEventListener('offline', () => {
    if (ENV.DEV) console.log('📴 Offline mode')
    document.body.classList.add('offline-mode')
  })
}

// Ensure root element exists before rendering
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('[main.tsx] Root element not found!')
  // Create root element if it doesn't exist (shouldn't happen, but safety check)
  const newRoot = document.createElement('div')
  newRoot.id = 'root'
  document.body.appendChild(newRoot)
  const root = ReactDOM.createRoot(newRoot, {
    onRecoverableError(error, info) {
      if (ENV.VERCEL_ENV === 'preview') {
        logError('RecoverableError', error, info)
      }
    }
  })
  // global listeners only in preview
  if (ENV.VERCEL_ENV === 'preview') {
    window.addEventListener('error', (e) =>
      logError('window.error', (e as ErrorEvent).error || (e as any).message)
    )
    window.addEventListener('unhandledrejection', (e) =>
      logError('unhandledrejection', (e as PromiseRejectionEvent).reason)
    )
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
  const root = ReactDOM.createRoot(rootElement, {
    onRecoverableError(error, info) {
      if (ENV.VERCEL_ENV === 'preview') {
        logError('RecoverableError', error, info)
      }
    }
  })
  if (ENV.VERCEL_ENV === 'preview') {
    window.addEventListener('error', (e) =>
      logError('window.error', (e as ErrorEvent).error || (e as any).message)
    )
    window.addEventListener('unhandledrejection', (e) =>
      logError('unhandledrejection', (e as PromiseRejectionEvent).reason)
    )
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

// Hydration hint for Lighthouse (main thread idle sooner)
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    if (ENV.DEV) console.log('[idle] app settled')
  })
}

// CRITICAL FIX: Auto-check assets in preview/prod to diagnose load failures
if (ENV.PROD) {
  autoCheckAssets()
}

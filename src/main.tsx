import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/index.css'
import { initializeLayoutToggles } from './lib/layout-toggle'

// Initialize layout toggles BEFORE React render
initializeLayoutToggles()

// Service Worker Registration - Manual Update Flow
// SW is registered via vite-plugin-pwa with registerType: 'autoUpdate'
// Update handling is done via UpdateBanner component
if ('serviceWorker' in navigator && import.meta.env.PROD) {
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

  // Catch service worker errors
  navigator.serviceWorker.ready.catch((error) => {
    console.error('[PWA] Service worker registration failed:', error)
  })
}

// Track online/offline status
window.addEventListener('online', () => {
  if (import.meta.env.DEV) console.log('🌐 Back online')
  document.body.classList.remove('offline-mode')
})

window.addEventListener('offline', () => {
  if (import.meta.env.DEV) console.log('📴 Offline mode')
  document.body.classList.add('offline-mode')
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)

// Hydration hint for Lighthouse (main thread idle sooner)
if ('requestIdleCallback' in window) {
  (window as any).requestIdleCallback(() => {
    if (import.meta.env.DEV) console.log('[idle] app settled')
  })
}

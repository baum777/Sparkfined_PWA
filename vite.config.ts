import { defineConfig, splitVendorChunkPlugin, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    process.env.ANALYZE ? visualizer({ open: true, gzipSize: true, filename: 'dist/stats.html' }) as unknown as PluginOption : undefined,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg', 'icons/*', 'offline.html'],
      injectRegister: 'auto',
      manifest: false, // Use public/manifest.webmanifest instead of inline config
      manifestFilename: 'manifest.webmanifest',
      // CRITICAL FIX: Explicit versioning for cache invalidation
      // This ensures SW updates trigger cache refresh on new deploys
      strategies: 'generateSW',
      workbox: {
        // STEP A: Service Worker Cache-Sanity
        cleanupOutdatedCaches: true, // Remove old precaches automatically
        skipWaiting: true, // Activate new SW immediately (don't wait for tab close)
        clientsClaim: true, // New SW takes control of all tabs immediately
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Pre-cache app shell for instant offline access
        // CRITICAL FIX: Use index.html as fallback instead of offline.html
        // offline.html should only be shown when truly offline, not on errors
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/_next/, /^\/static/],
        // CRITICAL FIX: Ensure assets are not cached incorrectly
        // Don't cache assets that might change (SW handles versioning via hashes)
        dontCacheBustURLsMatching: /^\/assets\/.*-[a-zA-Z0-9]{8}\.(js|css)$/,
        runtimeCaching: [
          // Board API - Stale-While-Revalidate (KPIs, Feed)
          {
            urlPattern: /^\/api\/board\/(kpis|feed)/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'board-api-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60, // 1 minute (fresh data preferred)
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
              backgroundSync: {
                name: 'board-api-sync',
                options: {
                  maxRetentionTime: 24 * 60, // Retry for up to 24 hours (in minutes)
                },
              },
            },
          },
          // Dexscreener API - Stale-While-Revalidate for fast perceived performance
          {
            urlPattern: /^https:\/\/api\.dexscreener\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'dexscreener-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 86400, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Moralis/Dexpaprika APIs - Network First (prefer fresh data)
          {
            urlPattern: /^\/api\/(moralis|dexpaprika|data)\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'token-api-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Other external APIs
          {
            urlPattern: /^https:\/\/api\.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300, // 5 minutes
              },
            },
          },
          // CDN assets (fonts, icons, etc.)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 31536000, // 1 year
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // Disable SW in dev for easier debugging
      },
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: true,
    port: 4173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    target: 'es2020',
    // CRITICAL FIX: Always enable sourcemaps in production for crash diagnosis
    // This helps trace errors to original source in production builds
    sourcemap: true,
    minify: 'esbuild',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // CRITICAL: Granular vendor splitting for CI bundle size limits
          // Strategy: Split large/lazy-loadable libs, keep small libs together
          // NOTE: lightweight-charts is NOT included here - it's loaded dynamically on-demand
          
          // Only process node_modules
          if (!id.includes('node_modules')) {
            // App code splitting - more aggressive splitting for better caching
            // NOTE: keep journal base chunk lean; split heavier/optional sub-features out.
            if (id.includes('/components/journal/templates/')) return 'chunk-journal-templates';
            if (id.includes('/components/journal/EmotionalSlider')) return 'chunk-journal-emotional-slider';
            if (id.includes('/components/journal/')) return 'chunk-journal-components';
            if (id.includes('/sections/chart/')) return 'chunk-chart';
            if (id.includes('/sections/analyze/')) return 'chunk-analyze';
            if (id.includes('/sections/signals/')) return 'chunk-signals';
            if (id.includes('/ai/')) return 'chunk-ai';
            return undefined;
          }

          // === VENDOR SPLITTING ===
          
          // 0. Lucide Icons - Split separately for better caching
          // Must run before the react check (lucide-react includes "react" in its path).
          if (id.includes('lucide-react')) {
            return 'vendor-icons';
          }

          // 1. React Ecosystem (React + ReactDOM + Scheduler + React-Router)
          // Note: React-Router is bundled with React (always used together)
          // Current: ~55KB gzip
          if (id.includes('react') || id.includes('scheduler') || id.includes('react-router') || id.includes('@remix-run/router')) {
            return 'vendor-react';
          }

          // 2. Dexie (IndexedDB wrapper)
          // Core feature (Journal, Watchlist), always loaded
          // Current: ~27KB gzip
          if (id.includes('dexie')) {
            return 'vendor-dexie';
          }

          // 3. Tesseract.js (OCR) - Heavy library, isolate for lazy loading
          // Used only in SettingsPage (OCR scan feature)
          // Estimated: ~30KB gzip
          if (id.includes('tesseract')) {
            return 'vendor-ocr';
          }

          // 4. Driver.js (Onboarding tour) - Isolate for lazy loading
          // Used only when user starts onboarding
          // Estimated: ~20KB gzip
          if (id.includes('driver.js')) {
            return 'vendor-onboarding';
          }

          // 6. Charting (lightweight-charts + fancy-canvas) - Heavy visual library
          // Keep isolated so the main vendor chunk stays lean and only loads when charts are opened.
          if (id.includes('lightweight-charts') || id.includes('fancy-canvas')) {
            return 'vendor-charts';
          }

          // 7. Zustand (State management) - Small but critical
          if (id.includes('zustand')) {
            return 'vendor-state';
          }

          // 8. Generic vendor (everything else: OpenAI SDK, workbox, etc.)
          // Small libraries that don't need separate chunks
          // Expected: ~30KB gzip (after splitting above)
          return 'vendor';
        },
      },
    },
  }
}))

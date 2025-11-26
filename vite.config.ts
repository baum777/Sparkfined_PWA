import { defineConfig, splitVendorChunkPlugin, type PluginOption } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

const VENDOR_CHUNKS: Record<string, string[]> = {
  'vendor-react': ['react', 'react-dom', 'scheduler'],
  'vendor-router': ['react-router-dom'],
  'vendor-state': ['zustand'],
  'vendor-workbox': ['workbox-window'],
  'vendor-icons': ['lucide-react'],
  'vendor-dexie': ['dexie'],
}

const matchDependency = (id: string, dep: string): boolean => {
  const normalizedDep = dep.replace(/\\/g, '/')
  return id.includes(`/node_modules/${normalizedDep}/`) || id.includes(`\\node_modules\\${normalizedDep}\\`)
}

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
    port: 5173,
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
          // NOTE: lightweight-charts is NOT included here - it's loaded dynamically on-demand
          if (id.includes('node_modules')) {
            for (const [chunkName, dependencies] of Object.entries(VENDOR_CHUNKS)) {
              if (dependencies.some(dep => matchDependency(id, dep))) {
                return chunkName
              }
            }

            // All other node_modules (driver.js, tesseract, etc.)
            return 'vendor'
          }
          
          // App code splitting (route-based lazy loading)
          if (id.includes('/sections/chart/')) return 'chunk-chart'
          if (id.includes('/sections/analyze/')) return 'chunk-analyze'
          if (id.includes('/sections/signals/')) return 'chunk-signals'
          
          return undefined
        },
      },
    },
  }
}))

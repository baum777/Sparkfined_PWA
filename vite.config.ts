import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: '/',
  plugins: [
    react(),
    splitVendorChunkPlugin(),
    process.env.ANALYZE ? visualizer({ open: true, gzipSize: true, filename: 'dist/stats.html' }) : undefined,
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Sparkfined Trading',
        short_name: 'Sparkfined',
        description: 'Advanced Trading Platform - Real-Time Charts, Watchlists & Technical Analysis',
        theme_color: '#0A0E27',
        background_color: '#0A0E27',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        categories: ['finance', 'productivity', 'utilities'],
        shortcuts: [
          {
            name: 'Quick Chart',
            short_name: 'Chart',
            description: 'Open chart analysis',
            url: '/chart',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Watchlist',
            short_name: 'Watch',
            description: 'View watchlist',
            url: '/',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Journal',
            short_name: 'Journal',
            description: 'Trading journal',
            url: '/journal',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Analyze',
            short_name: 'Analyze',
            description: 'Market analysis',
            url: '/analyze',
            icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }]
          }
        ],
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'apple-touch-icon.png',
            sizes: '180x180',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Pre-cache app shell for instant offline access
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        // Increase max size for bundled assets
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          // Price APIs - Stale-While-Revalidate for fast perceived performance
          {
            urlPattern: /^https:\/\/api\.(coingecko|binance|dexscreener)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'price-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 300, // 5 minutes for price data
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          // Chart data - Network First with fallback
          {
            urlPattern: /^https:\/\/.*\/(klines|ohlcv|candles).*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'chart-data-cache',
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 900, // 15 minutes
              },
            },
          },
          // Token metadata - Cache First for performance
          {
            urlPattern: /^https:\/\/.*\/(token|metadata|info).*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'token-metadata-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 86400, // 24 hours
              },
            },
          },
          // Images - Cache First with long expiration
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 86400 * 30, // 30 days
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
        enabled: true, // Enable SW in dev for testing
        type: 'module',
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
    sourcemap: mode === 'development',
    minify: 'esbuild',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // libs auf eigene Chunks (bessere Caching-Trennung)
          if (id.includes('node_modules')) {
            if (id.includes('react')) return 'vendor-react';
            if (id.includes('workbox')) return 'vendor-workbox';
            if (id.includes('dexie')) return 'vendor-dexie';
            return 'vendor';
          }
          if (id.includes('/sections/chart/')) return 'chart';
          if (id.includes('/sections/analyze/')) return 'analyze';
          return undefined;
        },
      },
    },
  }
}))

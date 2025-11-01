import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Sparkfined TA-PWA',
        short_name: 'Sparkfined',
        description: 'Technical Analysis Progressive Web App',
        theme_color: '#1e293b',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
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
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        // Pre-cache app shell for instant offline access
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
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
  ],
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
    outDir: 'dist'
  }
})

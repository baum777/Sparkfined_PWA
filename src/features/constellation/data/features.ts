/**
 * Feature Roadmap Data
 * Define all features and their positions in 3D space
 */

import type { Feature, Dependency } from '../types'

export const features: Feature[] = [
  // Core Infrastructure (Center)
  {
    id: 'CORE_PWA',
    name: 'PWA Core',
    description: 'Service Worker, Manifest, Offline Support',
    status: 'completed',
    priority: 10,
    position: [0, 0, 0],
    tags: ['infrastructure', 'pwa'],
  },
  {
    id: 'CORE_DB',
    name: 'IndexedDB Layer',
    description: 'Dexie 4.x integration with offline-first storage',
    status: 'completed',
    priority: 10,
    position: [0, 1, 0],
    dependencies: ['CORE_PWA'],
    tags: ['infrastructure', 'database'],
  },
  {
    id: 'CORE_API',
    name: 'API Client',
    description: 'HMAC-signed API client with caching',
    status: 'completed',
    priority: 9,
    position: [0, -1, 0],
    dependencies: ['CORE_PWA'],
    tags: ['infrastructure', 'api'],
  },

  // Chart Module (Left cluster)
  {
    id: 'CHART_CANVAS',
    name: 'Chart Canvas',
    description: 'Lightweight-charts integration',
    status: 'completed',
    priority: 10,
    position: [-3, 2, 1],
    dependencies: ['CORE_API'],
    tags: ['chart', 'ui'],
  },
  {
    id: 'CHART_REALTIME',
    name: 'Real-Time Updates',
    description: 'WebSocket price feed integration',
    status: 'completed',
    priority: 8,
    position: [-4, 3, 0],
    dependencies: ['CHART_CANVAS'],
    tags: ['chart', 'websocket'],
  },
  {
    id: 'CHART_INDICATORS',
    name: 'Technical Indicators',
    description: 'MA, EMA, RSI, MACD, Bollinger Bands',
    status: 'in-progress',
    priority: 7,
    position: [-3, 4, -1],
    dependencies: ['CHART_CANVAS'],
    tags: ['chart', 'analysis'],
  },
  {
    id: 'CHART_DRAWINGS',
    name: 'Drawing Tools',
    description: 'Trendlines, Fibonacci, shapes',
    status: 'planned',
    priority: 6,
    position: [-2, 3, 2],
    dependencies: ['CHART_CANVAS'],
    tags: ['chart', 'tools'],
  },

  // Watchlist Module (Right cluster)
  {
    id: 'WATCH_CORE',
    name: 'Watchlist Core',
    description: 'Manage symbols with offline support',
    status: 'completed',
    priority: 9,
    position: [3, 2, 1],
    dependencies: ['CORE_DB', 'CORE_API'],
    tags: ['watchlist', 'ui'],
  },
  {
    id: 'WATCH_SYNC',
    name: 'Real-Time Sync',
    description: 'WebSocket price updates for watchlist',
    status: 'completed',
    priority: 8,
    position: [4, 3, 0],
    dependencies: ['WATCH_CORE'],
    tags: ['watchlist', 'websocket'],
  },
  {
    id: 'WATCH_ALERTS',
    name: 'Price Alerts',
    description: 'Custom price alerts with push notifications',
    status: 'planned',
    priority: 7,
    position: [3, 4, -1],
    dependencies: ['WATCH_CORE'],
    tags: ['watchlist', 'notifications'],
  },

  // Constellation UI (Top cluster)
  {
    id: 'CONST_VIEW',
    name: 'Constellation View',
    description: '3D roadmap visualization',
    status: 'in-progress',
    priority: 5,
    position: [0, 5, 2],
    dependencies: ['CORE_PWA'],
    tags: ['visualization', '3d'],
  },
  {
    id: 'CONST_INTERACT',
    name: 'Interactive Controls',
    description: 'Orbit, zoom, filter features',
    status: 'planned',
    priority: 4,
    position: [1, 6, 1],
    dependencies: ['CONST_VIEW'],
    tags: ['visualization', 'ui'],
  },

  // Edge Functions (Bottom cluster)
  {
    id: 'EDGE_PROXY',
    name: 'API Proxy',
    description: 'Secure API gateway with rate limiting',
    status: 'planned',
    priority: 8,
    position: [0, -3, -1],
    dependencies: ['CORE_API'],
    tags: ['backend', 'security'],
  },
  {
    id: 'EDGE_CACHE',
    name: 'Edge Caching',
    description: 'Redis-based caching layer',
    status: 'planned',
    priority: 6,
    position: [-1, -4, 0],
    dependencies: ['EDGE_PROXY'],
    tags: ['backend', 'performance'],
  },

  // Testing (Back cluster)
  {
    id: 'TEST_E2E',
    name: 'E2E Tests',
    description: 'Playwright test suite',
    status: 'planned',
    priority: 7,
    position: [0, 1, -4],
    dependencies: ['CORE_PWA'],
    tags: ['testing', 'quality'],
  },
  {
    id: 'TEST_UNIT',
    name: 'Unit Tests',
    description: 'Vitest coverage for core modules',
    status: 'in-progress',
    priority: 6,
    position: [2, 0, -4],
    dependencies: ['CORE_PWA'],
    tags: ['testing', 'quality'],
  },
]

export const dependencies: Dependency[] = features
  .flatMap((feature) =>
    (feature.dependencies || []).map((depId) => ({
      from: depId,
      to: feature.id,
      critical: feature.priority >= 8,
    }))
  )

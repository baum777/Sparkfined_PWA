/**
 * Constellation Roadmap Data
 * Feature roadmap for Sparkfined PWA
 * Sparkfined PWA Trading Platform
 */

import { Feature, Dependency } from '../types'

export const features: Feature[] = [
  // Core Foundation (Phase 1)
  {
    id: 'PWA_CONFIG',
    name: 'PWA Configuration',
    description: 'Optimize PWA manifest, service worker, and offline capabilities',
    priority: 10,
    status: 'completed',
    position: [0, 0, 0],
    dependencies: [],
    tags: ['foundation', 'pwa']
  },
  {
    id: 'PROJECT_STRUCTURE',
    name: 'Project Structure',
    description: 'Feature-based architecture with services and utilities',
    priority: 9,
    status: 'completed',
    position: [3, 0, 0],
    dependencies: ['PWA_CONFIG'],
    tags: ['foundation', 'architecture']
  },

  // Chart Module (Phase 2)
  {
    id: 'CHART_CANVAS',
    name: 'Chart Canvas',
    description: 'Real-time trading charts with lightweight-charts',
    priority: 9,
    status: 'completed',
    position: [0, 3, 0],
    dependencies: ['PROJECT_STRUCTURE'],
    tags: ['chart', 'core']
  },
  {
    id: 'CHART_INDICATORS',
    name: 'Chart Indicators',
    description: 'Technical indicators (SMA, EMA, RSI, MACD)',
    priority: 7,
    status: 'planned',
    position: [2, 4, 0],
    dependencies: ['CHART_CANVAS'],
    tags: ['chart', 'analysis']
  },
  {
    id: 'DRAWING_TOOLS',
    name: 'Drawing Tools',
    description: 'Trendlines, fibonacci, rectangles',
    priority: 6,
    status: 'planned',
    position: [4, 4, 0],
    dependencies: ['CHART_CANVAS'],
    tags: ['chart', 'tools']
  },

  // Watchlist (Phase 2)
  {
    id: 'WATCHLIST_CORE',
    name: 'Watchlist Core',
    description: 'Real-time watchlist with offline support',
    priority: 8,
    status: 'completed',
    position: [6, 3, 0],
    dependencies: ['PROJECT_STRUCTURE'],
    tags: ['watchlist', 'core']
  },
  {
    id: 'PRICE_ALERTS',
    name: 'Price Alerts',
    description: 'Push notifications for price targets',
    priority: 6,
    status: 'planned',
    position: [8, 4, 0],
    dependencies: ['WATCHLIST_CORE'],
    tags: ['watchlist', 'notifications']
  },

  // Constellation UI (Phase 3)
  {
    id: 'CONSTELLATION_3D',
    name: 'Constellation 3D',
    description: 'Interactive 3D roadmap visualization',
    priority: 5,
    status: 'in_progress',
    position: [3, 6, 0],
    dependencies: ['PROJECT_STRUCTURE'],
    tags: ['visualization', '3d']
  },
  {
    id: 'FEATURE_DETAILS',
    name: 'Feature Details',
    description: 'Detailed view for each feature node',
    priority: 4,
    status: 'planned',
    position: [5, 7, 0],
    dependencies: ['CONSTELLATION_3D'],
    tags: ['visualization', 'ui']
  },

  // Edge Functions (Phase 4)
  {
    id: 'API_PROXY',
    name: 'API Proxy',
    description: 'Secure Vercel Edge Functions for API access',
    priority: 7,
    status: 'planned',
    position: [0, -3, 0],
    dependencies: ['PROJECT_STRUCTURE'],
    tags: ['backend', 'security']
  },
  {
    id: 'RATE_LIMITING',
    name: 'Rate Limiting',
    description: 'Redis-based rate limiting for API calls',
    priority: 6,
    status: 'planned',
    position: [2, -4, 0],
    dependencies: ['API_PROXY'],
    tags: ['backend', 'security']
  },

  // Testing (Phase 5)
  {
    id: 'E2E_TESTS',
    name: 'E2E Tests',
    description: 'Playwright tests for critical flows',
    priority: 5,
    status: 'planned',
    position: [6, -3, 0],
    dependencies: ['CHART_CANVAS', 'WATCHLIST_CORE'],
    tags: ['testing', 'quality']
  },
  {
    id: 'PERFORMANCE_TESTS',
    name: 'Performance Tests',
    description: 'Lighthouse CI and Core Web Vitals monitoring',
    priority: 4,
    status: 'planned',
    position: [8, -4, 0],
    dependencies: ['E2E_TESTS'],
    tags: ['testing', 'performance']
  },

  // Analytics & Monitoring
  {
    id: 'TELEMETRY',
    name: 'Telemetry Service',
    description: 'Event tracking and analytics',
    priority: 6,
    status: 'completed',
    position: [-3, 0, 0],
    dependencies: ['PROJECT_STRUCTURE'],
    tags: ['monitoring', 'analytics']
  },
  {
    id: 'ERROR_TRACKING',
    name: 'Error Tracking',
    description: 'Sentry integration for error monitoring',
    priority: 5,
    status: 'planned',
    position: [-5, 1, 0],
    dependencies: ['TELEMETRY'],
    tags: ['monitoring', 'quality']
  }
]

export const dependencies: Dependency[] = [
  // Foundation dependencies
  { from: 'PWA_CONFIG', to: 'PROJECT_STRUCTURE', critical: true },
  
  // Chart dependencies
  { from: 'PROJECT_STRUCTURE', to: 'CHART_CANVAS', critical: true },
  { from: 'CHART_CANVAS', to: 'CHART_INDICATORS', critical: false },
  { from: 'CHART_CANVAS', to: 'DRAWING_TOOLS', critical: false },
  
  // Watchlist dependencies
  { from: 'PROJECT_STRUCTURE', to: 'WATCHLIST_CORE', critical: true },
  { from: 'WATCHLIST_CORE', to: 'PRICE_ALERTS', critical: false },
  
  // Constellation dependencies
  { from: 'PROJECT_STRUCTURE', to: 'CONSTELLATION_3D', critical: false },
  { from: 'CONSTELLATION_3D', to: 'FEATURE_DETAILS', critical: false },
  
  // Backend dependencies
  { from: 'PROJECT_STRUCTURE', to: 'API_PROXY', critical: true },
  { from: 'API_PROXY', to: 'RATE_LIMITING', critical: false },
  
  // Testing dependencies
  { from: 'CHART_CANVAS', to: 'E2E_TESTS', critical: false },
  { from: 'WATCHLIST_CORE', to: 'E2E_TESTS', critical: false },
  { from: 'E2E_TESTS', to: 'PERFORMANCE_TESTS', critical: false },
  
  // Monitoring dependencies
  { from: 'PROJECT_STRUCTURE', to: 'TELEMETRY', critical: true },
  { from: 'TELEMETRY', to: 'ERROR_TRACKING', critical: false }
]

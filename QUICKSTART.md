# Sparkfined PWA - Quick Start Guide

## 🚀 Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
# E2E Tests
npm run test:e2e

# Unit Tests
npm test

# Test Coverage
npm test -- --coverage
```

### Performance Analysis

```bash
# Bundle size analysis
npm run analyze

# Lighthouse audit
npm run lighthouse
```

## 📦 New Features Implemented

### 1. Chart Module (`/src/features/chart`)

Interactive trading charts with real-time updates.

**Usage:**
```tsx
import { ChartContainer } from '@/features/chart'

<ChartContainer 
  initialSymbol="BTCUSDT" 
  initialInterval="1h" 
/>
```

**Features:**
- Real-time price updates
- Multiple timeframes (1m, 5m, 15m, 1h, 4h, 1d, 1w)
- Crosshair with price info
- Smooth animations
- Offline caching

### 2. Watchlist Module (`/src/features/watchlist`)

Manage your crypto watchlist with real-time updates and offline support.

**Usage:**
```tsx
import { WatchlistCore } from '@/features/watchlist'

<WatchlistCore 
  onSymbolClick={(symbol) => navigate(`/chart?symbol=${symbol}`)} 
/>
```

**Features:**
- Add/remove symbols
- Real-time price updates via WebSocket
- Offline persistence with IndexedDB
- Sort by change percentage
- Visual indicators for price changes

### 3. Constellation Roadmap (`/src/features/constellation`)

Interactive 3D visualization of the project roadmap.

**Usage:**
```tsx
import { ConstellationView } from '@/features/constellation'

<ConstellationView />
```

**Features:**
- 3D star map of features
- Dependency visualization
- Interactive controls (rotate, zoom, pan)
- Feature details on click
- Status-based filtering

### 4. Services Layer

#### API Client (`/src/services/api/client.ts`)
```tsx
import { apiClient } from '@/services'

const response = await apiClient.get('/prices', { params: { symbols: 'BTC,ETH' }})
```

#### WebSocket Service (`/src/services/websocket/priceSocket.ts`)
```tsx
import { priceSocket } from '@/services'

priceSocket.subscribe(['BTCUSDT'], (symbol, data) => {
  console.log(symbol, data.price)
})
```

#### Database (`/src/services/storage/database.ts`)
```tsx
import { db } from '@/services'

// Add to watchlist
await db.watchlist.add({
  symbol: 'BTCUSDT',
  name: 'Bitcoin',
  lastPrice: 50000,
  lastChange24h: 2.5,
  addedAt: Date.now(),
  order: 1
})

// Query
const items = await db.watchlist.toArray()
```

#### Telemetry (`/src/services/telemetry`)
```tsx
import { trackEvent, trackPageView, trackInteraction } from '@/services'

// Track page view
trackPageView('chart')

// Track interaction
trackInteraction('button_click', 'add_watchlist', { symbol: 'BTC' })

// Track custom event
trackEvent('trade_completed', { symbol: 'ETH', profit: 100 })
```

### 5. Utility Functions (`/src/utils`)

```tsx
import { 
  formatCurrency, 
  formatPercentage, 
  debounce,
  isMobile,
  isStandalone 
} from '@/utils'

// Format currency
formatCurrency(1234.56) // "$1,234.56"

// Format percentage
formatPercentage(5.234) // "+5.23%"

// Debounce function
const debouncedSearch = debounce(search, 300)

// Check if mobile
if (isMobile()) {
  // Mobile specific logic
}

// Check if PWA installed
if (isStandalone()) {
  // PWA specific features
}
```

## 🔌 API Endpoints

### Health Check
```bash
GET /api/health
```

Returns service status and uptime.

### Prices
```bash
GET /api/prices?symbols=BTCUSDT,ETHUSDT
POST /api/prices
```

Get current prices for multiple symbols.

### OHLC Data
```bash
GET /api/market/ohlc?symbol=BTCUSDT&interval=1h&limit=500
```

Get candlestick data for charts.

### Telemetry
```bash
POST /api/telemetry
```

Send analytics events.

## 🧪 Testing

### E2E Test Suites

1. **Chart Flow** (`tests/e2e/chart-flow.spec.ts`)
   - Chart loading and rendering
   - Interval switching
   - Offline functionality
   - Performance tests

2. **Watchlist Flow** (`tests/e2e/watchlist-flow.spec.ts`)
   - Add/remove items
   - Data persistence
   - Real-time updates
   - Sorting and filtering

3. **PWA Functionality** (`tests/e2e/pwa-functionality.spec.ts`)
   - Service worker registration
   - Offline caching
   - IndexedDB persistence
   - Installation

4. **Navigation** (`tests/e2e/navigation.spec.ts`)
   - Route navigation
   - Browser history
   - Deep links
   - Mobile navigation

### Running Specific Tests

```bash
# Run single test file
npx playwright test tests/e2e/chart-flow.spec.ts

# Run in headed mode
npx playwright test --headed

# Run in debug mode
npx playwright test --debug
```

## 📱 PWA Features

### Offline Support
- Service Worker caches all assets
- IndexedDB stores user data
- Graceful degradation when offline
- Background sync when back online

### Installation
- Add to Home Screen on mobile
- Desktop installation prompt
- Shortcuts for Quick Chart and Watchlist

### Caching Strategy
- **App Shell**: Cache-First
- **API Responses**: Stale-While-Revalidate (5min TTL)
- **Images**: Cache-First (30 days)
- **Fonts**: Cache-First (1 year)

## 🎨 Components Data Attributes

For testing, add these data-testid attributes to your components:

### Navigation
- `data-testid="nav-chart"` - Chart navigation button
- `data-testid="nav-watchlist"` - Watchlist navigation button
- `data-testid="nav-settings"` - Settings navigation button
- `data-testid="bottom-nav"` - Bottom navigation (mobile)

### Chart
- `data-testid="chart-canvas"` - Chart canvas element
- `data-testid="chart-header"` - Chart header

### Watchlist
- `data-testid="watchlist-empty"` - Empty state
- `data-testid="watchlist-item"` - Watchlist item
- `data-testid="add-to-watchlist-btn"` - Add button
- `data-testid="symbol-input"` - Symbol input field
- `data-testid="name-input"` - Name input field
- `data-testid="submit-add-watchlist"` - Submit button
- `data-testid="remove-watchlist-item"` - Remove button
- `data-testid="sort-watchlist"` - Sort selector
- `data-testid="sync-status"` - Sync status indicator
- `data-testid="sync-status-offline"` - Offline indicator
- `data-testid="item-price"` - Price display

### General
- `data-testid="offline-indicator"` - Global offline indicator

## 🔧 Environment Variables

Create a `.env` file in the root:

```env
# API Configuration
VITE_API_BASE_URL=/api

# Telemetry (optional)
VITE_TELEMETRY_ENABLED=true

# For production deployment
API_SECRET=your-secret-key-here
UPSTASH_REDIS_URL=your-redis-url
UPSTASH_REDIS_TOKEN=your-redis-token
```

## 📊 Performance Optimization

### Bundle Size
- Code splitting by feature
- Vendor chunks separated
- Lazy loading for 3D components

### Caching
- API responses cached (1-5 minutes)
- Static assets cached (30 days)
- Service Worker precaching

### Rendering
- Target: < 16ms render time (60 FPS)
- Framer Motion for smooth animations
- React.memo for expensive components

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables in Vercel
Set these in your Vercel project settings:
- `API_SECRET`
- `UPSTASH_REDIS_URL` (for production caching)
- `UPSTASH_REDIS_TOKEN`

### Other Platforms
The app is a static SPA and can be deployed to:
- Netlify
- Cloudflare Pages
- AWS Amplify
- GitHub Pages

## 📚 Documentation

- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **API Documentation**: Check `/api` folder
- **Component Examples**: See feature folders
- **Test Examples**: See `/tests/e2e`

## 🐛 Troubleshooting

### Service Worker Issues
```bash
# Clear service worker cache
# Open DevTools > Application > Clear Storage > Clear site data
```

### IndexedDB Issues
```javascript
// Clear database in console
indexedDB.deleteDatabase('SparkfinedDB')
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📞 Support

For issues or questions:
1. Check `IMPLEMENTATION_SUMMARY.md`
2. Review test files for usage examples
3. Check browser console for errors
4. Enable debug mode in services

## ✅ Checklist for Production

- [ ] Set environment variables in Vercel
- [ ] Configure Redis for caching
- [ ] Set up error tracking (Sentry)
- [ ] Enable Lighthouse CI
- [ ] Test PWA installation on mobile
- [ ] Verify offline functionality
- [ ] Check Core Web Vitals
- [ ] Review security headers
- [ ] Test on slow 3G connection
- [ ] Verify CORS configuration

---

**Version**: 1.0.0
**Last Updated**: 2025-11-03
**Status**: Production Ready ✅

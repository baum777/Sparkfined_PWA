# Troubleshooting Guide — Sparkfined PWA

**Last Updated:** 2025-11-20

---

## Table of Contents

- [Build & Development Issues](#build--development-issues)
- [PWA & Service Worker Issues](#pwa--service-worker-issues)
- [Deployment Issues](#deployment-issues)
- [API & Backend Issues](#api--backend-issues)
- [Performance Issues](#performance-issues)
- [TypeScript Errors](#typescript-errors)
- [UI & Layout Issues](#ui--layout-issues)
- [Debugging Tools](#debugging-tools)

---

## Build & Development Issues

### Problem: `pnpm install` Fails

**Symptoms:**
```bash
Error: ENOENT: no such file or directory
Error: EPERM: operation not permitted
```

**Solutions:**

```bash
# 1. Clear cache and retry
rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install

# 2. Check Node.js version (requires >= 20.10.0)
node --version

# 3. Update pnpm
npm install -g pnpm@latest

# 4. Use npm as fallback
npm install
```

---

### Problem: TypeScript Errors on Build

**Symptoms:**
```
error TS2688: Cannot find type definition file for '@testing-library/jest-dom'
error TS2688: Cannot find type definition file for 'node'
```

**Solution:**

```bash
# Install missing type definitions
pnpm add -D @types/node @testing-library/jest-dom vitest

# Verify tsconfig.json references
cat tsconfig.json | grep "types"
```

---

### Problem: Import Path Not Resolved

**Symptoms:**
```
Cannot find module '@/components/...'
Module not found: Error: Can't resolve '@/lib/...'
```

**Solution:**

```bash
# Verify tsconfig.json has path alias
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

# Verify vite.config.ts has alias
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})

# Restart dev server
pnpm dev
```

---

### Problem: Hot Module Replacement (HMR) Not Working

**Symptoms:**
- Changes not reflected in browser
- Need to manually refresh

**Solutions:**

```bash
# 1. Check Vite server is running
pnpm dev
# → Should see "Local: http://localhost:5173"

# 2. Clear Vite cache
rm -rf node_modules/.vite

# 3. Restart with clean cache
pnpm dev --force

# 4. Check browser console for WebSocket errors
# DevTools → Console → Filter "WebSocket"
```

---

## PWA & Service Worker Issues

### Problem: Service Worker Not Registering

**Symptoms:**
- DevTools → Application → Service Workers shows "none"
- PWA installation not available

**Solutions:**

```bash
# 1. Verify you're on production build (SW only works in preview/production)
pnpm build
pnpm preview

# 2. Check manifest.json is accessible
curl http://localhost:4173/manifest.webmanifest

# 3. Verify sw.js is generated
ls -lh dist/sw.js

# 4. Check console for registration errors
# DevTools → Console → Filter "service worker"

# 5. Force re-registration
# DevTools → Application → Service Workers → Unregister → Reload
```

---

### Problem: Service Worker Not Updating

**Symptoms:**
- Old version still active after deployment
- Changes not visible to users

**Solutions:**

```bash
# Local Development:
# 1. Enable "Update on reload"
# DevTools → Application → Service Workers → ☑ Update on reload

# 2. Force update
# DevTools → Application → Service Workers → Skip waiting

# Production:
# 1. Clear browser cache (Ctrl+Shift+Delete)
# 2. Hard reload (Ctrl+Shift+R)
# 3. Unregister SW manually
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(r => r.unregister())
})

# 4. Wait 24h for automatic update (skipWaiting: true in vite.config.ts)
```

---

### Problem: PWA Not Installable

**Symptoms:**
- No "Install" button in browser
- Lighthouse reports "PWA not installable"

**Solutions:**

```bash
# 1. Verify manifest.json requirements
curl http://localhost:4173/manifest.webmanifest | jq

# Required fields:
# - "name": "Sparkfined"
# - "short_name": "Sparkfined"
# - "start_url": "/"
# - "display": "standalone"
# - "icons": [... at least 192x192 and 512x512 ...]

# 2. Verify HTTPS (required for PWA)
# Local: http://localhost OK
# Production: https:// required

# 3. Check service worker is active
# DevTools → Application → Service Workers → Status: "activated"

# 4. Check browser console for errors
# DevTools → Console → Filter "manifest"
```

---

### Problem: Offline Page Not Showing

**Symptoms:**
- Offline shows "No internet" instead of custom page

**Solutions:**

```bash
# 1. Verify offline.html exists in public/
ls public/offline.html

# 2. Check Workbox configuration in vite.config.ts
# navigateFallback: '/index.html' (NOT '/offline.html')
# navigateFallbackDenylist: [/^\/api\//]

# 3. Test offline mode
# DevTools → Network → Offline → Reload
# Should show app with cached data, NOT offline.html
```

---

## Deployment Issues

### Problem: Vercel Build Fails

**Symptoms:**
```
Error: Build exceeded maximum duration
Error: Process exited with status 1
```

**Solutions:**

```bash
# 1. Check build command in vercel.json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist"
}

# 2. Verify build works locally
pnpm build

# 3. Check build logs in Vercel dashboard
# → Deployments → [deployment] → Build Logs

# 4. Common issues:
# - Missing environment variables
# - TypeScript errors
# - Bundle size exceeded
# - Out of memory (increase Node.js heap)
```

---

### Problem: Environment Variables Not Available

**Symptoms:**
```
ReferenceError: process is not defined
API returns 401 Unauthorized
```

**Solutions:**

```bash
# 1. Verify variables are set in Vercel Dashboard
# → Project → Settings → Environment Variables

# 2. Check variable naming
# Client variables: Must start with VITE_
# Server variables: No prefix

# 3. Redeploy after changing variables
# Vercel Dashboard → Deployments → [deployment] → Redeploy

# 4. Verify in serverless function
// api/health.ts
export default function handler(req, res) {
  console.log('MORALIS_API_KEY:', process.env.MORALIS_API_KEY ? 'SET' : 'MISSING')
  return res.json({ env: Object.keys(process.env) })
}
```

---

### Problem: API Routes Return 404

**Symptoms:**
```
GET /api/health → 404 Not Found
```

**Solutions:**

```bash
# 1. Verify api/ folder structure
ls -R api/
# Should have api/health.ts or api/health/index.ts

# 2. Check Vercel function logs
# Vercel Dashboard → Deployments → [deployment] → Functions

# 3. Verify serverless function export
// api/health.ts
export default function handler(req, res) {
  return res.status(200).json({ status: 'ok' })
}

# 4. Test locally with Vercel CLI
vercel dev
curl http://localhost:3000/api/health
```

---

## API & Backend Issues

### Problem: Moralis Proxy Returns 500

**Symptoms:**
```
GET /api/moralis/health → 500 Internal Server Error
```

**Solutions:**

```bash
# 1. Check MORALIS_API_KEY is set (server-side, no VITE_ prefix)
# Vercel Dashboard → Environment Variables

# 2. Verify Moralis API key is valid
curl -H "X-API-Key: $MORALIS_API_KEY" \
  https://deep-index.moralis.io/api/v2.2/erc20/metadata

# 3. Check rate limits
# Moralis Dashboard → Usage

# 4. Enable mock mode for testing
DEV_USE_MOCKS=true pnpm dev

# 5. Check function logs
# Vercel Dashboard → Functions → api/moralis
```

---

### Problem: CORS Errors

**Symptoms:**
```
Access to fetch at 'https://api.example.com' from origin 'https://sparkfined.vercel.app' has been blocked by CORS policy
```

**Solutions:**

```bash
# 1. Use serverless proxy (recommended)
# api/proxy/external-api.ts
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')

  const response = await fetch('https://api.example.com/data', {
    headers: { 'X-API-Key': process.env.EXTERNAL_API_KEY }
  })

  return res.json(await response.json())
}

# 2. Configure vercel.json headers (last resort)
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

---

## Performance Issues

### Problem: Slow First Load

**Symptoms:**
- Lighthouse Performance < 70
- LCP > 2.5s
- FID > 100ms

**Solutions:**

```bash
# 1. Analyze bundle size
pnpm run analyze

# 2. Lazy load heavy components
// Before
import HeavyChart from '@/components/HeavyChart'

// After
const HeavyChart = lazy(() => import('@/components/HeavyChart'))

# 3. Optimize images
# - Use WebP format
# - Add width/height attributes
# - Use loading="lazy"

# 4. Reduce JavaScript bundle
# - Remove unused dependencies
# - Use dynamic imports
# - Enable tree-shaking

# 5. Enable compression in vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

### Problem: Memory Leaks

**Symptoms:**
- App slows down over time
- Browser tab crashes
- High memory usage in DevTools

**Solutions:**

```tsx
// 1. Clean up event listeners
useEffect(() => {
  const handleResize = () => console.log('resize')
  window.addEventListener('resize', handleResize)

  return () => window.removeEventListener('resize', handleResize) // ✅ Cleanup
}, [])

// 2. Cancel pending requests
useEffect(() => {
  const controller = new AbortController()

  fetch('/api/data', { signal: controller.signal })
    .then(res => res.json())
    .then(data => setState(data))

  return () => controller.abort() // ✅ Cancel on unmount
}, [])

// 3. Clear intervals/timeouts
useEffect(() => {
  const interval = setInterval(() => console.log('tick'), 1000)
  return () => clearInterval(interval) // ✅ Clear on unmount
}, [])

// 4. Profile memory usage
// DevTools → Memory → Take heap snapshot → Compare
```

---

## TypeScript Errors

### Problem: `any` Type Warnings

**Symptoms:**
```
Parameter 'x' implicitly has an 'any' type
```

**Solution:**

```tsx
// ❌ Bad
const handleError = (error: any) => console.error(error)

// ✅ Good
const handleError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(error.message)
  } else {
    console.error('Unknown error', error)
  }
}
```

---

### Problem: Null/Undefined Errors

**Symptoms:**
```
Object is possibly 'null'
Object is possibly 'undefined'
```

**Solution:**

```tsx
// ❌ Bad
const name = user.profile.name // Error if user or profile is null

// ✅ Good: Optional chaining
const name = user?.profile?.name

// ✅ Good: Nullish coalescing
const name = user?.profile?.name ?? 'Anonymous'

// ✅ Good: Type guard
if (user && user.profile) {
  const name = user.profile.name
}
```

---

## UI & Layout Issues

### Problem: Double Headers on V2 Pages

**Symptoms:**
- Two headers visible on dashboard/journal/watchlist pages
- Extra padding/spacing

**Cause:**
- `App.tsx` renders `AppHeader` globally
- V2 pages also render their own headers

**Solution:**

```tsx
// Option 1: Conditional header in App.tsx
const location = useLocation()
const isV2Page = location.pathname.includes('-v2')

return (
  <>
    {!isV2Page && <AppHeader />}
    <Routes>...</Routes>
  </>
)

// Option 2: Wrap V2 pages with DashboardShell
// DashboardShell already includes header
<DashboardShell title="Dashboard">
  <DashboardContent />
</DashboardShell>
```

---

### Problem: Hardcoded Colors Not Matching Theme

**Symptoms:**
- Inconsistent colors across pages
- Dark mode doesn't affect some elements

**Solution:**

```tsx
// ❌ Bad: Hardcoded colors
<div className="bg-[#050505] border border-white/5">

// ✅ Good: Use design tokens
<div className="bg-bg border border-border">

// Update tailwind.config.ts if tokens missing
export default {
  theme: {
    extend: {
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)'
      }
    }
  }
}
```

---

## Debugging Tools

### DevTools Shortcuts

```bash
# Chrome DevTools
Ctrl+Shift+I (Windows) / Cmd+Opt+I (Mac)

# Useful Panels:
# - Console: Errors, warnings, logs
# - Network: API calls, loading times
# - Application: Service Worker, Cache, Storage
# - Lighthouse: Performance, PWA, Accessibility
# - Performance: Profiling, frame rate
```

### Logging Best Practices

```tsx
// Development only logging
if (import.meta.env.DEV) {
  console.log('[DEBUG]', data)
}

// Conditional debug flag
if (import.meta.env.VITE_DEBUG === 'true') {
  console.log('[DEBUG]', data)
}

// Use logger abstraction
import { logger } from '@/lib/logger'
logger.debug('Data loaded', data)
logger.error('Failed to fetch', error)
```

### Network Debugging

```bash
# Test API endpoint locally
curl -v http://localhost:5173/api/health

# Test with authentication
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5173/api/journal

# Check response headers
curl -I http://localhost:5173/api/health

# Test WebSocket connection
wscat -c ws://localhost:5173/ws
```

### Service Worker Debugging

```bash
# Enable verbose logging
# chrome://serviceworker-internals/

# View all registered service workers
navigator.serviceWorker.getRegistrations().then(console.log)

# Check service worker state
navigator.serviceWorker.ready.then(reg => {
  console.log('SW State:', reg.active?.state)
  console.log('SW Script:', reg.active?.scriptURL)
})

# Force update
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.update())
})
```

---

## Getting Help

If you can't resolve an issue:

1. **Check Recent Changes:** `git log --oneline -10`
2. **Search Codebase:** `grep -r "error message" src/`
3. **Review Archives:** `docs/_archive/` may have historical fixes
4. **Check Browser Console:** Often contains detailed error messages
5. **Review Function Logs:** Vercel Dashboard → Functions (for API issues)

---

## Additional Resources

- **Deployment Guide:** `docs/guides/deployment.md`
- **Architecture Overview:** `CLAUDE.md`
- **Environment Variables:** `docs/setup/environment-and-providers.md`
- **Build Scripts:** `package.json` scripts section
- **Historical Issues:** `docs/_archive/` (PWA_BLACK_SCREEN_FIX.md, etc.)

---

**Last Updated:** 2025-11-20
**Maintained by:** Sparkfined DevOps Team

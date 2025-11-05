# Lighthouse Optimization Guide

**Target:** 100/100 scores across Performance, Accessibility, Best Practices, SEO  
**Status:** Phase 5 - Post-Launch Polish  
**Date:** 2025-11-05

---

## Current Status (Estimated)

| Category | Expected Score | Notes |
|----------|----------------|-------|
| **Performance** | 85-95 | Good code splitting, lazy loading active |
| **Accessibility** | 90-100 | Semantic HTML, ARIA labels present |
| **Best Practices** | 90-95 | HTTPS, no console errors, CSP headers |
| **SEO** | 95-100 | Meta tags, manifest, sitemap present |
| **PWA** | ✅ Installable | Service Worker + Manifest configured |

---

## How to Run Lighthouse Audit

### Option 1: Chrome DevTools (Manual)
```bash
# 1. Build production bundle
pnpm build

# 2. Serve locally
npx serve dist -p 3000

# 3. Open Chrome → DevTools → Lighthouse
# 4. Select "Desktop" or "Mobile"
# 5. Click "Analyze page load"
```

### Option 2: CLI (Automated)
```bash
# Install Lighthouse CLI (if not present)
npm install -g lighthouse

# Run audit
pnpm build
npx serve dist -p 3000 &
lighthouse http://localhost:3000 --view

# Or run against deployed Vercel URL
lighthouse https://your-app.vercel.app --view
```

### Option 3: Vercel Deploy (Live)
```bash
# Deploy to staging
vercel

# Copy preview URL
# Run Lighthouse against preview URL in Chrome DevTools
```

---

## Performance Optimizations

### ✅ Already Implemented
- [x] **Code Splitting:** Lazy-loaded routes via `React.lazy()`
- [x] **Bundle Analysis:** `rollup-plugin-visualizer` configured
- [x] **PWA Caching:** Workbox precaching (35 entries, 427 KB)
- [x] **Image Optimization:** Icons in WebP/PNG, sizes 192/512/180
- [x] **CSS Minification:** Vite auto-minifies in production
- [x] **JS Minification:** Terser enabled in Vite
- [x] **Tree Shaking:** ES modules, unused exports removed

### ⚠️ Pending Improvements

#### 1. Font Loading Optimization (PRIORITY)
**Current:** Google Fonts CDN (~300ms delay)  
**Fix:** Self-host JetBrains Mono

```css
/* src/styles/fonts.css - Already configured, needs font file */
@font-face {
  font-family: 'JetBrains Mono';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/fonts/jetbrains-mono-latin.woff2') format('woff2');
}
```

**Action:**
1. Download: https://www.jetbrains.com/lp/mono/
2. Extract WOFF2 files
3. Place in `public/fonts/jetbrains-mono-latin.woff2`
4. Remove `@import url('https://fonts.googleapis.com/...')` from `fonts.css`

**Impact:** +10-15 Performance score

#### 2. Preconnect DNS for External Resources
```html
<!-- index.html - Add to <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="dns-prefetch" href="https://fonts.gstatic.com">
```

**Impact:** +2-5 Performance score (if keeping Google Fonts)

#### 3. Image Lazy Loading
**Current:** All images load eagerly  
**Fix:** Add `loading="lazy"` to below-the-fold images

```tsx
// Example: LandingPage testimonial avatars
<img 
  src="/avatars/user-1.png" 
  alt="User 1" 
  loading="lazy"  // ← Add this
  decoding="async"
/>
```

**Impact:** +5-10 Performance score (if many images)

#### 4. Critical CSS Inlining
**Current:** All CSS loaded via separate file  
**Fix:** Inline critical CSS (first viewport)

```html
<!-- index.html -->
<style>
  /* Inline critical styles for above-the-fold content */
  body { margin: 0; font-family: system-ui; }
  .loading-spinner { /* ... */ }
</style>
```

**Tool:** Use `critical` npm package to extract automatically  
**Impact:** +5-10 Performance score

---

## Accessibility Optimizations

### ✅ Already Implemented
- [x] Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`)
- [x] ARIA labels on interactive elements
- [x] Focus indicators (outline on buttons/inputs)
- [x] Color contrast (Zinc palette, high contrast)
- [x] Alt text on icons (using Lucide React with aria-label)

### ⚠️ Pending Improvements

#### 1. Keyboard Navigation
**Check:** All interactive elements focusable with Tab key  
**Fix:** Add `tabindex="0"` to custom interactive elements

```tsx
// Example: Custom button-like div
<div 
  role="button" 
  tabIndex={0}  // ← Add this
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

#### 2. Skip Link for Screen Readers
```tsx
// Add to App.tsx or Layout component
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

**CSS for sr-only:**
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.focus\:not-sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
```

#### 3. Form Labels
**Check:** All `<input>` have associated `<label>`  
**Fix:** Use `id` and `for` attributes

```tsx
// Before
<input placeholder="Email" />

// After
<label htmlFor="email">Email</label>
<input id="email" type="email" placeholder="you@example.com" />
```

---

## Best Practices Optimizations

### ✅ Already Implemented
- [x] HTTPS (enforced by Vercel)
- [x] No console errors/warnings (clean build)
- [x] Service Worker (PWA)
- [x] Manifest with theme colors
- [x] Favicon & touch icons

### ⚠️ Pending Improvements

#### 1. Content Security Policy (CSP)
**Current:** None  
**Fix:** Add CSP headers in `vercel.json`

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.vercel.app"
        }
      ]
    }
  ]
}
```

**Note:** `'unsafe-inline'` needed for React inline styles, `'unsafe-eval'` for dev mode  
**Impact:** +5-10 Best Practices score

#### 2. Permissions Policy
```json
{
  "key": "Permissions-Policy",
  "value": "geolocation=(), microphone=(), camera=(), payment=()"
}
```

#### 3. Remove Unused Console Logs
**Find:** `grep -r "console\\.log" src/`  
**Fix:** Remove or replace with proper logging library

```tsx
// Before
console.log('User clicked button');

// After (production)
// Remove or use conditional logging
if (import.meta.env.DEV) {
  console.log('User clicked button');
}
```

---

## SEO Optimizations

### ✅ Already Implemented
- [x] `<title>` tag in `index.html`
- [x] Meta description
- [x] Open Graph tags (for social sharing)
- [x] Manifest with name/description
- [x] Canonical URLs

### ⚠️ Pending Improvements

#### 1. Structured Data (JSON-LD)
```html
<!-- index.html - Add before </head> -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Sparkfined PWA",
  "description": "Technical Analysis Progressive Web App",
  "url": "https://your-domain.vercel.app",
  "applicationCategory": "FinanceApplication",
  "operatingSystem": "All"
}
</script>
```

#### 2. Sitemap
```xml
<!-- public/sitemap.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-domain.vercel.app/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://your-domain.vercel.app/landing</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add all public routes -->
</urlset>
```

#### 3. Robots.txt
```txt
# public/robots.txt
User-agent: *
Allow: /
Sitemap: https://your-domain.vercel.app/sitemap.xml
```

---

## PWA Optimizations

### ✅ Already Implemented
- [x] Service Worker (Workbox)
- [x] Manifest (`public/manifest.webmanifest`)
- [x] Icons (192x192, 512x512, Apple Touch Icon)
- [x] Offline fallback (`public/offline.html`)
- [x] Theme colors

### ⚠️ Pending Improvements

#### 1. Add to Home Screen Prompt
```tsx
// src/components/InstallPrompt.tsx
import { useState, useEffect } from 'react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome === 'accepted' ? 'accepted' : 'dismissed'} install`);
    setDeferredPrompt(null);
  };

  if (!deferredPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 bg-emerald-500 text-white rounded-lg p-4 shadow-lg">
      <p className="font-medium mb-2">Install Sparkfined</p>
      <p className="text-sm mb-3">Get quick access from your home screen</p>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="btn-primary flex-1">
          Install
        </button>
        <button onClick={() => setDeferredPrompt(null)} className="btn-secondary flex-1">
          Later
        </button>
      </div>
    </div>
  );
}
```

#### 2. Update Notification
**Current:** Service Worker updates silently  
**Fix:** Show toast when new version available

```tsx
// src/main.tsx - Add after SW registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New version available
          const shouldUpdate = confirm('New version available! Reload to update?');
          if (shouldUpdate) {
            newWorker.postMessage({ type: 'SKIP_WAITING' });
            window.location.reload();
          }
        }
      });
    });
  });
}
```

---

## Bundle Size Optimizations

### Current Bundle Sizes
```
vendor-react-91gktpLi.js      166 KB → 52 KB gzipped ✅
chart-BiFG5xMD.js              30 KB → 10 KB gzipped ✅
index-DYcJJWfF.js              23 KB →  8 KB gzipped ✅
```

**Status:** ✅ Already optimized (lazy loading active)

### Further Optimizations (Optional)

#### 1. Analyze Bundle
```bash
pnpm analyze
# Opens visualizer report in browser
```

**Look for:**
- Duplicate dependencies
- Large libraries (consider lighter alternatives)
- Unused exports

#### 2. Dynamic Imports for Heavy Components
```tsx
// Before
import { HeavyChart } from './HeavyChart';

// After
const HeavyChart = lazy(() => import('./HeavyChart'));

<Suspense fallback={<div>Loading chart...</div>}>
  <HeavyChart />
</Suspense>
```

#### 3. Remove Unused Dependencies
```bash
npx depcheck
# Lists unused dependencies

npm uninstall <unused-package>
```

---

## Monitoring & Analytics

### Recommended Tools

#### 1. Web Vitals Monitoring
```tsx
// src/lib/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
  
  // Send to analytics endpoint
  // e.g., Google Analytics, Vercel Analytics
}
```

#### 2. Error Tracking (Sentry)
```bash
npm install @sentry/react
```

```tsx
// src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    tracesSampleRate: 0.1,
  });
}
```

#### 3. Performance Monitoring (Vercel Analytics)
```tsx
// Add to src/main.tsx
import { inject } from '@vercel/analytics';
inject();
```

---

## Target Scores & Checklist

| Optimization | Priority | Status | Impact |
|--------------|----------|--------|--------|
| Self-host fonts | High | ⏳ Pending | +10-15 Perf |
| Add preconnect | Medium | ⏳ Pending | +2-5 Perf |
| Lazy load images | Low | ⏳ Pending | +5-10 Perf |
| Skip link (a11y) | Medium | ⏳ Pending | +5 A11y |
| CSP headers | High | ⏳ Pending | +10 BP |
| Remove console.logs | Low | ⏳ Pending | +2 BP |
| Structured data (SEO) | Low | ⏳ Pending | +5 SEO |
| Sitemap.xml | Low | ⏳ Pending | +3 SEO |
| Install prompt | Medium | ⏳ Pending | UX improvement |

**Legend:**
- **High:** Do before launch
- **Medium:** Do in first week post-launch
- **Low:** Nice-to-have, iterate later

---

## Quick Wins (Do These First)

1. ✅ **Self-host JetBrains Mono** → +15 points
2. ✅ **Add CSP headers** → +10 points
3. ✅ **Skip link for a11y** → +5 points
4. ✅ **Remove console.logs** → +2 points

**Total potential gain:** +32 points (from estimated 85 → 100)

---

## Testing Checklist

After implementing optimizations, verify:

- [ ] Lighthouse Desktop: 95+ all categories
- [ ] Lighthouse Mobile: 90+ all categories
- [ ] PWA Badge: ✅ Installable
- [ ] Web Vitals: All "Good" thresholds
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
  - FCP < 1.8s
  - TTFB < 600ms

---

## Resources

- [Lighthouse Docs](https://developer.chrome.com/docs/lighthouse)
- [Web Vitals](https://web.dev/vitals/)
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Vercel Analytics](https://vercel.com/analytics)
- [Bundle Analyzer](https://www.npmjs.com/package/rollup-plugin-visualizer)

---

**Last Updated:** 2025-11-05  
**Next Review:** After first Vercel deploy

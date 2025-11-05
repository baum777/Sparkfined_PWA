# Analytics & Error Tracking Setup

**Status:** Phase 5 - Optional Post-Launch  
**Priority:** Medium (not required for MVP, but recommended)  
**Date:** 2025-11-05

---

## Overview

This guide covers setting up:
1. **Web Analytics** (Privacy-friendly alternatives to Google Analytics)
2. **Error Tracking** (Sentry for production errors)
3. **Performance Monitoring** (Vercel Analytics, Web Vitals)
4. **User Behavior** (Optional: Hotjar, PostHog)

---

## 1. Web Analytics

### Option A: Vercel Analytics (Recommended)

**Pros:**
- ✅ Zero-config (automatically enabled on Vercel Pro)
- ✅ Privacy-friendly (no cookies, GDPR-compliant)
- ✅ Real-time Web Vitals
- ✅ No external scripts (built into Vercel)

**Cons:**
- ⚠️ Requires Vercel Pro plan ($20/month)
- ⚠️ Limited compared to Google Analytics

**Setup:**
```bash
# 1. Upgrade to Vercel Pro
# https://vercel.com/account/billing

# 2. Enable Analytics in Vercel Dashboard
# https://vercel.com/[your-team]/[your-project]/analytics

# 3. Install package (optional, for custom events)
npm install @vercel/analytics

# 4. Inject into app
# src/main.tsx
import { inject } from '@vercel/analytics';

if (import.meta.env.PROD) {
  inject();
}
```

**Cost:** $20/month (Vercel Pro)

---

### Option B: Umami (Self-Hosted, Free)

**Pros:**
- ✅ 100% free (self-hosted)
- ✅ Privacy-friendly (no cookies, GDPR-compliant)
- ✅ Simple, beautiful UI
- ✅ Open-source

**Cons:**
- ⚠️ Requires hosting (Vercel, Railway, Fly.io)
- ⚠️ Manual setup

**Setup:**
```bash
# 1. Deploy Umami to Vercel
# https://umami.is/docs/running-on-vercel

# 2. Create website in Umami dashboard
# Copy Website ID

# 3. Add to .env.local
VITE_UMAMI_WEBSITE_ID=your-website-id-here
VITE_UMAMI_SRC=https://your-umami-instance.vercel.app/script.js

# 4. Add script to index.html
# index.html <head>
<script
  async
  defer
  data-website-id="${process.env.VITE_UMAMI_WEBSITE_ID}"
  src="${process.env.VITE_UMAMI_SRC}"
></script>
```

**Cost:** $0 (hosting on Vercel Hobby or Railway free tier)

---

### Option C: Plausible (Paid, Hosted)

**Pros:**
- ✅ Privacy-friendly (no cookies, GDPR-compliant)
- ✅ Beautiful dashboard
- ✅ Google Analytics import
- ✅ Custom events

**Cons:**
- ⚠️ Paid ($9/month for 10k pageviews)

**Setup:**
```bash
# 1. Sign up at plausible.io
# 2. Add domain

# 3. Add script to index.html
# index.html <head>
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>

# 4. (Optional) Custom events
# src/lib/analytics.ts
export function trackEvent(eventName: string, props?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
}

// Usage
trackEvent('Button Clicked', { location: 'Header' });
```

**Cost:** $9-99/month (based on pageviews)

---

## 2. Error Tracking (Sentry)

**Why Sentry:**
- ✅ Catch production errors before users report them
- ✅ Source maps for readable stack traces
- ✅ User context (which user hit the error)
- ✅ Performance monitoring (slow API calls)

**Setup:**

```bash
# 1. Sign up at sentry.io (free tier: 5k errors/month)

# 2. Install Sentry SDK
npm install @sentry/react

# 3. Add to src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    tracesSampleRate: 0.1, // 10% of transactions
    replaysSessionSampleRate: 0.1, // 10% of sessions
    replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
    integrations: [
      new Sentry.BrowserTracing(),
      new Sentry.Replay(),
    ],
  });
}

// 4. Wrap App in ErrorBoundary
Sentry.withProfiler(App);

// 5. Add to .env.local
VITE_SENTRY_DSN=https://your-dsn@sentry.io/project-id

# 6. Upload source maps (Vercel build)
# vercel.json
{
  "build": {
    "env": {
      "SENTRY_AUTH_TOKEN": "@sentry-auth-token",
      "SENTRY_ORG": "your-org",
      "SENTRY_PROJECT": "your-project"
    }
  }
}

# Install Sentry Vercel integration
# https://vercel.com/integrations/sentry
```

**Cost:** Free (5k errors/month), $26/month (50k errors)

---

## 3. Performance Monitoring (Web Vitals)

**Setup:**

```bash
# 1. Install web-vitals
npm install web-vitals

# 2. Create lib/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    onCLS(onPerfEntry);
    onFID(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
}

# 3. Use in src/main.tsx
import { reportWebVitals } from './lib/webVitals';

reportWebVitals((metric) => {
  console.log(metric); // Or send to analytics
  
  // Send to Google Analytics (if using)
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
  
  // Send to Vercel Analytics (if using)
  if (window.va) {
    window.va('event', {
      name: metric.name,
      data: {
        value: metric.value,
        rating: metric.rating,
      },
    });
  }
});
```

---

## 4. User Behavior (Optional)

### Option A: PostHog (Open-Source)

**Pros:**
- ✅ Open-source
- ✅ Session replay
- ✅ Feature flags
- ✅ A/B testing
- ✅ Self-hostable

**Setup:**
```bash
npm install posthog-js

# src/main.tsx
import posthog from 'posthog-js';

if (import.meta.env.PROD) {
  posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
  });
}

# Track custom events
posthog.capture('Button Clicked', { location: 'Header' });
```

**Cost:** Free (self-hosted), $0-$450/month (cloud)

---

### Option B: Hotjar (Heat Maps)

**Pros:**
- ✅ Heat maps
- ✅ Session recordings
- ✅ Surveys

**Cons:**
- ⚠️ Privacy concerns (records everything)
- ⚠️ Paid ($39/month)

**Setup:**
```html
<!-- index.html <head> -->
<script>
  (function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_HOTJAR_ID,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

**Cost:** $39-99/month

---

## Recommended Setup (MVP)

**For MVP Launch:**
1. ✅ **Vercel Analytics** (if Pro) or **Umami** (free)
2. ✅ **Sentry** (Free tier, 5k errors/month)
3. ✅ **Web Vitals** (built-in, no cost)

**Total Cost:** $0-20/month

---

**For Post-Launch (Growth Phase):**
1. ✅ Vercel Analytics or Plausible
2. ✅ Sentry (Paid tier if >5k errors/month)
3. ✅ PostHog (Session replay + Feature flags)

**Total Cost:** $29-100/month

---

## Privacy & GDPR Compliance

**Key Points:**
- ✅ All recommended tools are cookie-free (no consent banner needed)
- ✅ No PII (Personally Identifiable Information) tracked
- ✅ User IPs anonymized
- ✅ Data stored in EU (Sentry, Plausible, Umami support EU hosting)

**Optional:** Add Privacy Policy link in footer

```tsx
// src/components/layout/Footer.tsx
<footer>
  <a href="/privacy">Privacy Policy</a>
  <a href="/terms">Terms of Service</a>
</footer>
```

---

## Custom Event Tracking (Example)

```tsx
// src/lib/analytics.ts
export function trackEvent(
  eventName: string, 
  props?: Record<string, any>
) {
  // Vercel Analytics
  if (window.va) {
    window.va('event', { name: eventName, data: props });
  }
  
  // Umami
  if (window.umami) {
    window.umami.track(eventName, props);
  }
  
  // Plausible
  if ((window as any).plausible) {
    (window as any).plausible(eventName, { props });
  }
  
  // PostHog
  if (window.posthog) {
    window.posthog.capture(eventName, props);
  }
}

// Usage in components
import { trackEvent } from '@/lib/analytics';

function SettingsPage() {
  const handleExport = () => {
    trackEvent('Data Exported', { format: 'JSON' });
    // ... export logic
  };
  
  return (
    <button onClick={handleExport}>Export JSON</button>
  );
}
```

---

## Next Steps

1. **Choose Analytics Provider**
   - Vercel Analytics (if Pro) ✅
   - Umami (free, self-hosted) ✅
   - Plausible (paid, hosted) ⚠️

2. **Set Up Sentry**
   - Sign up at sentry.io
   - Install @sentry/react
   - Add DSN to .env.local

3. **Add Web Vitals**
   - Install web-vitals
   - Create reportWebVitals function
   - Send to analytics provider

4. **Test in Production**
   - Deploy to Vercel
   - Verify analytics dashboard
   - Test Sentry error capture

---

**Last Updated:** 2025-11-05  
**Next Review:** After first production deploy

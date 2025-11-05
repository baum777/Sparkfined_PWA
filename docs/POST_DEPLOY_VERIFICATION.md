# Post-Deploy Verification Checklist

**Project:** Sparkfined PWA  
**Deploy URL:** https://sparkfined-pwa.vercel.app (example)  
**Date:** 2025-11-05

---

## ✅ Critical Checks (First 5 Minutes)

### 1. Homepage Loads
```bash
curl -I https://your-app.vercel.app
```

**Expected:**
```
HTTP/2 200
content-type: text/html
x-content-type-options: nosniff
x-frame-options: DENY
content-security-policy: ...
```

**Status:** [ ] PASS / [ ] FAIL

---

### 2. All Pages Load

Visit each page manually:

- [ ] `/` (Board) → Loads without errors
- [ ] `/landing` → Hero + Features visible
- [ ] `/board` → KPI tiles load (or show mock data)
- [ ] `/chart` → Canvas renders
- [ ] `/analyze` → Form + KPI cards visible
- [ ] `/journal` → Note list loads
- [ ] `/notifications` → Alert list visible
- [ ] `/lessons` → Empty state visible
- [ ] `/signals` → Empty state visible
- [ ] `/access` → Tabs visible
- [ ] `/settings` → All settings sections visible

**Status:** [ ] ALL PASS / [ ] SOME FAIL

---

### 3. No Console Errors

1. Open: https://your-app.vercel.app
2. Press F12 (Chrome DevTools)
3. Go to Console tab
4. Refresh page (Cmd+R / Ctrl+R)

**Expected:** No red errors (warnings OK)

**Common Acceptable Warnings:**
- Font preload warnings (if fonts via CDN)
- Service Worker update available

**Status:** [ ] PASS / [ ] FAIL

---

### 4. Security Headers Present

```bash
curl -I https://your-app.vercel.app | grep -E "Content-Security|Permissions|Referrer"
```

**Expected:**
```
content-security-policy: default-src 'self'; ...
permissions-policy: geolocation=(), microphone=(), ...
referrer-policy: strict-origin-when-cross-origin
```

**Status:** [ ] ALL PRESENT / [ ] MISSING

---

### 5. Sitemap Loads

```bash
curl https://your-app.vercel.app/sitemap.xml
```

**Expected:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://your-app.vercel.app/</loc>
    ...
```

**Check:**
- [ ] XML is valid (no parsing errors)
- [ ] All 11 pages listed
- [ ] URLs match deployment URL (not placeholder)

**Status:** [ ] PASS / [ ] FAIL

---

### 6. Robots.txt Loads

```bash
curl https://your-app.vercel.app/robots.txt
```

**Expected:**
```
User-agent: *
Allow: /
Sitemap: https://your-app.vercel.app/sitemap.xml
```

**Check:**
- [ ] File loads (200 OK)
- [ ] Sitemap URL matches deployment URL

**Status:** [ ] PASS / [ ] FAIL

---

## 🎯 Lighthouse Audit (10 Minutes)

### Desktop Audit

1. Open: https://your-app.vercel.app
2. Chrome DevTools (F12) → Lighthouse
3. Select:
   - Device: Desktop
   - Categories: All
   - Mode: Navigation
4. Click "Analyze page load"
5. Wait ~30s

**Target Scores:**
- [ ] Performance: **90+** (Current: ___)
- [ ] Accessibility: **95+** (Current: ___)
- [ ] Best Practices: **95+** (Current: ___)
- [ ] SEO: **95+** (Current: ___)
- [ ] PWA: **✅ Installable** (Current: ___)

**If <90:** See `docs/LIGHTHOUSE_OPTIMIZATION.md`

---

### Mobile Audit

1. Repeat above with "Mobile" selected
2. Wait ~45s (mobile audit takes longer)

**Target Scores:**
- [ ] Performance: **85+** (Current: ___)
- [ ] Accessibility: **95+** (Current: ___)
- [ ] Best Practices: **95+** (Current: ___)
- [ ] SEO: **95+** (Current: ___)
- [ ] PWA: **✅ Installable** (Current: ___)

**Note:** Mobile scores are typically 5-10 points lower than desktop

---

### Lighthouse Issues (Common)

**Performance <90:**
- **Issue:** Fonts via CDN (~50-100ms delay)
- **Fix:** Self-host JetBrains Mono (see `LIGHTHOUSE_OPTIMIZATION.md`)

**Accessibility <95:**
- **Issue:** Missing alt text on images
- **Fix:** Add `alt=""` to decorative images, descriptive alt to others

**Best Practices <95:**
- **Issue:** Console errors present
- **Fix:** Check browser console, fix JS errors

**SEO <95:**
- **Issue:** Missing meta description
- **Fix:** Verify `index.html` has `<meta name="description">`

---

## 📱 PWA Install Test (5 Minutes)

### Desktop Chrome

1. Open: https://your-app.vercel.app
2. Look in address bar for install icon (⊕)
3. Click icon → "Install Sparkfined"
4. Click "Install"

**Expected:**
- [ ] App opens in standalone window (no browser chrome)
- [ ] App icon appears in OS app launcher (macOS Dock, Windows Start Menu)
- [ ] Opening icon launches app directly

**Status:** [ ] PASS / [ ] FAIL

---

### iOS Safari

1. Open: https://your-app.vercel.app in Safari
2. Tap Share button (box with arrow)
3. Scroll down → Tap "Add to Home Screen"
4. Tap "Add"

**Expected:**
- [ ] Icon appears on home screen
- [ ] Tapping icon opens app (no Safari chrome)
- [ ] App feels like native app

**Status:** [ ] PASS / [ ] FAIL

---

### Android Chrome

1. Open: https://your-app.vercel.app in Chrome
2. Banner appears at bottom: "Install Sparkfined"
3. Tap "Install"

**Expected:**
- [ ] App icon appears in app drawer
- [ ] Opening app launches in standalone mode
- [ ] No browser UI visible

**Status:** [ ] PASS / [ ] FAIL

---

## ♿ Accessibility Test (3 Minutes)

### Skip Link Test

1. Open: https://your-app.vercel.app
2. Press **Tab** key once
3. Observe: Green "Skip to main content" button appears

**Expected:**
- [ ] Button visible on focus
- [ ] Button styled correctly (green, readable)
- [ ] Clicking button jumps to `#main-content`
- [ ] Pressing Tab again focuses first interactive element

**Status:** [ ] PASS / [ ] FAIL

---

### Keyboard Navigation Test

1. Tab through all interactive elements
2. Verify all are reachable

**Check:**
- [ ] Sidebar links focusable (desktop)
- [ ] BottomNav links focusable (mobile)
- [ ] All buttons focusable
- [ ] All form inputs focusable
- [ ] Focus indicator visible (outline)

**Status:** [ ] PASS / [ ] FAIL

---

### Screen Reader Test (Optional)

**macOS VoiceOver:**
1. Enable: Cmd+F5
2. Navigate with VoiceOver (VO+Right Arrow)

**Windows Narrator:**
1. Enable: Win+Ctrl+Enter
2. Navigate with Narrator (Caps Lock+Right Arrow)

**Expected:**
- [ ] Page structure announced (headings, lists, regions)
- [ ] Links announced with meaningful text
- [ ] Buttons announced with purpose
- [ ] Images have alt text

**Status:** [ ] PASS / [ ] SKIP (Optional)

---

## 🌐 Offline Mode Test (2 Minutes)

1. Open app (https://your-app.vercel.app)
2. Open Chrome DevTools → Network tab
3. Toggle "Offline" checkbox
4. Refresh page (Cmd+R / Ctrl+R)

**Expected:**
- [ ] Offline fallback page loads (`public/offline.html`)
- [ ] Page shows "You are offline" message
- [ ] No blank screen / connection error

5. Toggle "Online" checkbox
6. Refresh page

**Expected:**
- [ ] App loads normally
- [ ] All features work

**Status:** [ ] PASS / [ ] FAIL

---

## 🚀 Performance Test (5 Minutes)

### Web Vitals (Chrome DevTools)

1. Open: https://your-app.vercel.app
2. Chrome DevTools → Lighthouse → View Treemap
3. Check "Web Vitals":

**Target:**
- [ ] **LCP** (Largest Contentful Paint): <2.5s
- [ ] **FID** (First Input Delay): <100ms
- [ ] **CLS** (Cumulative Layout Shift): <0.1
- [ ] **FCP** (First Contentful Paint): <1.8s
- [ ] **TTFB** (Time to First Byte): <600ms

**All Green?** ✅ Excellent  
**Any Orange/Red?** See `LIGHTHOUSE_OPTIMIZATION.md`

**Status:** [ ] ALL GREEN / [ ] SOME ORANGE / [ ] RED

---

### Bundle Size Check

1. Open: Chrome DevTools → Network tab
2. Refresh page
3. Check total transfer size (bottom of Network tab)

**Expected:**
- [ ] Total: <1 MB (first load)
- [ ] Total: <100 KB (cached reload)
- [ ] Vendor (React): ~52 KB gzipped ✅
- [ ] Main bundle: ~23 KB gzipped ✅

**Status:** [ ] PASS / [ ] FAIL

---

## 🔍 SEO Check (5 Minutes)

### Google Search Console

1. Go to: https://search.google.com/search-console
2. Add property: `https://your-app.vercel.app`
3. Verify ownership (DNS TXT / HTML file / Meta tag)
4. Submit sitemap: `https://your-app.vercel.app/sitemap.xml`

**Expected:**
- [ ] Property verified successfully
- [ ] Sitemap submitted (status: Pending → Success)
- [ ] Wait 24-48h for indexing

**Status:** [ ] SUBMITTED / [ ] PENDING

---

### Meta Tags Check

View page source (Cmd+U / Ctrl+U):

**Check:**
- [ ] `<title>` present (not empty)
- [ ] `<meta name="description">` present
- [ ] `<meta property="og:title">` present (Open Graph)
- [ ] `<meta property="og:description">` present
- [ ] `<meta property="og:image">` present
- [ ] `<link rel="canonical">` present

**Status:** [ ] ALL PRESENT / [ ] MISSING

---

### Structured Data (Optional)

Use Google's Rich Results Test:
1. Go to: https://search.google.com/test/rich-results
2. Enter URL: `https://your-app.vercel.app`
3. Click "Test URL"

**Expected:**
- [ ] No errors
- [ ] Structured data detected (if added)

**Status:** [ ] PASS / [ ] SKIP (Optional)

---

## 🔒 Security Check (3 Minutes)

### SecurityHeaders.com

1. Go to: https://securityheaders.com
2. Enter URL: `https://your-app.vercel.app`
3. Click "Scan"

**Target Grade:** A or A+

**Check:**
- [ ] Content-Security-Policy: Present ✅
- [ ] X-Frame-Options: DENY ✅
- [ ] X-Content-Type-Options: nosniff ✅
- [ ] Referrer-Policy: Present ✅
- [ ] Permissions-Policy: Present ✅

**Status:** Grade: ___ / [ ] A+ / [ ] A / [ ] B

---

### SSL Certificate

```bash
curl -vI https://your-app.vercel.app 2>&1 | grep "SSL certificate"
```

**Expected:**
- [ ] Certificate valid (issued by Let's Encrypt)
- [ ] No certificate errors

**Status:** [ ] VALID / [ ] EXPIRED

---

## 📊 Analytics Setup (Optional, 10 Minutes)

### Vercel Analytics (If using Vercel Pro)

1. Go to: https://vercel.com/[team]/sparkfined-pwa/analytics
2. Enable: Web Analytics
3. Verify: Data starts appearing (wait 5-10 min)

**Status:** [ ] ENABLED / [ ] SKIP

---

### Umami (If using self-hosted)

1. Deploy Umami: https://umami.is/docs/running-on-vercel
2. Create website in Umami dashboard
3. Add tracking script to `index.html`
4. Redeploy app
5. Verify: Events tracked in Umami dashboard

**Status:** [ ] ENABLED / [ ] SKIP

---

### Sentry (Error Tracking)

1. Sign up: https://sentry.io
2. Create project: "Sparkfined PWA"
3. Install: `npm install @sentry/react`
4. Add DSN to `.env.local`
5. Add init code to `src/main.tsx`
6. Redeploy
7. Test: Trigger error, verify in Sentry dashboard

**Status:** [ ] ENABLED / [ ] SKIP

---

## 🐛 Known Issues & Workarounds

### Issue 1: Fonts Load Slowly (Performance 85-90)

**Status:** Known, acceptable for MVP  
**Impact:** -5 to -10 Lighthouse Performance  
**Workaround:** Self-host fonts (see `LIGHTHOUSE_OPTIMIZATION.md`)  
**Action:** [ ] ACCEPTED / [ ] FIX NOW

---

### Issue 2: Backend APIs Return Mock Data

**Status:** Expected, graceful degradation  
**Impact:** Board KPIs/Feed show static data  
**Workaround:** App works fully with localStorage  
**Action:** [ ] ACCEPTED / [ ] DEPLOY APIS

---

### Issue 3: TypeScript Errors in `api/` Folder

**Status:** Non-blocking (backend not deployed yet)  
**Impact:** None (production build succeeds)  
**Workaround:** Fix when deploying Edge Functions  
**Action:** [ ] ACCEPTED / [ ] FIX LATER

---

## ✅ Final Checklist

### Critical (Must Pass)
- [ ] Homepage loads (200 OK)
- [ ] All 11 pages load without errors
- [ ] No console errors (red)
- [ ] Security headers present (6 headers)
- [ ] Sitemap loads (XML valid)
- [ ] Robots.txt loads
- [ ] Lighthouse Desktop: 90+ all categories
- [ ] PWA installable (Chrome, iOS, Android)

### Important (Should Pass)
- [ ] Skip link works (Tab key)
- [ ] Offline mode works (fallback page)
- [ ] Web Vitals: All green
- [ ] Bundle size <1 MB
- [ ] SEO meta tags present

### Optional (Nice to Have)
- [ ] Lighthouse Mobile: 85+
- [ ] SecurityHeaders.com: A+
- [ ] Google Search Console: Submitted
- [ ] Analytics enabled
- [ ] Sentry enabled

---

## 🎯 Success Criteria

**Minimum for Launch:**
- ✅ All Critical checks pass
- ✅ 8/8 Important checks pass
- ⚠️ 0+ Optional checks pass

**Ideal for Launch:**
- ✅ All Critical checks pass
- ✅ All Important checks pass
- ✅ 3+ Optional checks pass

---

## 📝 Issue Tracking Template

If any check fails, document:

```markdown
### Issue: [Brief Description]

**Check:** [Which check failed]
**Status:** [ ] BLOCKER / [ ] HIGH / [ ] MEDIUM / [ ] LOW
**Expected:** [What should happen]
**Actual:** [What actually happens]
**Screenshot:** [Link to screenshot if applicable]
**Console Errors:** [Paste console errors]
**Fix:** [Proposed solution]
**ETA:** [When fix will be deployed]
```

---

## 🚀 Next Steps After Verification

### If All Checks Pass ✅
1. ✅ Celebrate! 🎉
2. Monitor for 24 hours (Vercel Dashboard)
3. Add analytics (Week 1)
4. Optimize Lighthouse scores (if <95)
5. Collect user feedback

### If Some Checks Fail ⚠️
1. Document issues (use template above)
2. Prioritize (Blocker → High → Medium → Low)
3. Fix blockers immediately
4. Fix high priority within 24h
5. Fix medium/low within week

### If Critical Checks Fail 🚨
1. **DO NOT LAUNCH** yet
2. Identify root cause
3. Fix immediately
4. Re-run verification
5. Only launch when all critical pass

---

## 📞 Support & Resources

**Vercel Support:**
- Dashboard: https://vercel.com/[team]/sparkfined-pwa
- Logs: https://vercel.com/[team]/sparkfined-pwa/deployments
- Docs: https://vercel.com/docs

**Lighthouse:**
- Docs: https://developer.chrome.com/docs/lighthouse
- Web Vitals: https://web.dev/vitals/

**PWA:**
- Checklist: https://web.dev/pwa-checklist/
- Workbox Docs: https://developer.chrome.com/docs/workbox/

**Internal Docs:**
- Deployment: `docs/DEPLOY_GUIDE.md`
- Optimization: `docs/LIGHTHOUSE_OPTIMIZATION.md`
- Production: `docs/PRODUCTION_CHECKLIST.md`

---

**Last Updated:** 2025-11-05  
**Status:** Ready for Post-Deploy Verification  
**Estimated Time:** 30-45 minutes

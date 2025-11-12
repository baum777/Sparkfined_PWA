# Vercel Deployment Guide - Step by Step

**Project:** Sparkfined PWA  
**Status:** Launch-Ready (All Phases 0-6 Complete)  
**Date:** 2025-11-05

---

## Pre-Deployment Checklist ✅

Before deploying, verify:

- [x] **Build passes:** `pnpm build` → 11.47s, 0 errors ✅
- [x] **PWA configured:** 35 entries, 428 KB precached ✅
- [x] **Security headers:** 6 headers in `vercel.json` ✅
- [x] **Skip link:** A11y enhancement added ✅
- [x] **Sitemap:** `public/sitemap.xml` present ✅
- [x] **Robots.txt:** `public/robots.txt` present ✅
- [x] **Console.logs:** Konditionalisiert (DEV only) ✅
- [x] **Documentation:** 32 files complete ✅

**Status:** ✅ ALL CHECKS PASSED - Ready to deploy

---

## Option 1: Vercel CLI (Recommended) 🚀

### Step 1: Install Vercel CLI

```bash
# If not installed
npm install -g vercel

# Verify installation
vercel --version
```

---

### Step 2: Login to Vercel

```bash
vercel login

# Follow prompts:
# - Choose login method (GitHub, GitLab, Bitbucket, Email)
# - Verify in browser
# - Return to terminal
```

**Expected Output:**
```
> Success! Authentication complete.
```

---

### Step 3: Build Locally (Verify)

```bash
# Clean install (optional but recommended)
rm -rf node_modules dist
pnpm install

# Build
pnpm build

# Verify no errors
echo $?  # Should output: 0
```

**Expected Output:**
```
✓ built in 11.47s
PWA v0.20.5
precache  35 entries (428.17 KiB)
```

---

### Step 4: Deploy to Production

```bash
# Deploy to production
vercel --prod

# Follow prompts:
# ? Set up and deploy "~/workspace"? [Y/n] Y
# ? Which scope? [Your team/personal]
# ? Link to existing project? [Y/n] N (if first deploy)
# ? What's your project's name? sparkfined-pwa
# ? In which directory is your code located? ./
# ? Want to modify these settings? [y/N] N
```

**Expected Output:**
```
🔍  Inspect: https://vercel.com/[team]/sparkfined-pwa/[deployment-id]
✅  Production: https://sparkfined-pwa.vercel.app
```

---

### Step 5: Copy Production URL

```bash
# Your production URL (example):
https://sparkfined-pwa.vercel.app

# Or custom domain (if configured):
https://sparkfined.com
```

**Save this URL** - you'll need it for:
- Lighthouse audit
- Sitemap/robots.txt updates
- Google Search Console

---

## Option 2: GitHub Integration (Auto-Deploy)

### Step 1: Connect Repository to Vercel

1. Go to: https://vercel.com/new
2. Click "Import Git Repository"
3. Select: `baum777/Sparkfined_PWA`
4. Click "Import"

---

### Step 2: Configure Build Settings

Vercel auto-detects Vite, but verify:

```
Framework Preset: Vite
Build Command: pnpm build
Output Directory: dist
Install Command: pnpm install
Root Directory: ./
Node.js Version: 20.x
```

**Do NOT change** these settings (already correct).

---

### Step 3: Add Environment Variables

Go to: Project Settings → Environment Variables

**Add:**
```
VITE_APP_VERSION=1.0.0
```

**Optional (if using):**
```
VITE_VAPID_PUBLIC_KEY=<your-vapid-public-key>
OPENAI_API_KEY=<your-openai-key>
ANTHROPIC_API_KEY=<your-anthropic-key>
```

**Select Environments:**
- [x] Production
- [x] Preview
- [ ] Development (optional)

Click "Save"

---

### Step 4: Deploy

Click **"Deploy"** button

**Wait** (~60-90 seconds)

**Expected Output:**
```
✅ Build Successful
🚀 Deployment Ready
🌐 Production: https://sparkfined-pwa.vercel.app
```

---

### Step 5: Enable Auto-Deploy

Go to: Project Settings → Git

**Configure:**
- Production Branch: `main`
- Auto-Deploy: Enabled ✅

**Result:** Every push to `main` triggers auto-deploy

---

## Option 3: GitHub Actions (CI/CD)

### Step 1: Get Vercel Tokens

1. Go to: https://vercel.com/account/tokens
2. Create new token: "GitHub Actions"
3. Copy token (you'll only see it once)

4. Go to: https://vercel.com/[team]/[project]/settings/general
5. Copy:
   - Project ID (shown in settings)
   - Team/Org ID (shown in URL or settings)

---

### Step 2: Add GitHub Secrets

Go to: Repository Settings → Secrets → Actions

**Add 3 secrets:**
- `VERCEL_TOKEN`: Your Vercel token
- `VERCEL_ORG_ID`: Your Vercel org ID
- `VERCEL_PROJECT_ID`: Your Vercel project ID

---

### Step 3: Create Workflow File

Create: `.github/workflows/deploy.yml`

```yaml
name: Deploy to Vercel Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 20
      
      - name: Install pnpm
        run: npm install -g pnpm
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Build
        run: pnpm build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

### Step 4: Push & Auto-Deploy

```bash
git add .github/workflows/deploy.yml
git commit -m "Add Vercel auto-deploy workflow"
git push origin main

# GitHub Actions runs automatically
# Check: https://github.com/baum777/Sparkfined_PWA/actions
```

---

## Post-Deployment Actions (CRITICAL)

### 1. Update Sitemap & Robots.txt

**Replace placeholder URL:**

```bash
# Edit public/sitemap.xml
# Find: https://your-domain.vercel.app
# Replace with: https://sparkfined-pwa.vercel.app (or your custom domain)

# Edit public/robots.txt
# Find: https://your-domain.vercel.app
# Replace with: https://sparkfined-pwa.vercel.app

# Commit & redeploy
git add public/sitemap.xml public/robots.txt
git commit -m "Update sitemap/robots.txt with production URL"
git push origin main
```

---

### 2. Verify Deployment

**Quick Checks (2 min):**

```bash
# 1. Homepage loads
curl -I https://sparkfined-pwa.vercel.app
# Expected: HTTP/2 200

# 2. Sitemap loads
curl https://sparkfined-pwa.vercel.app/sitemap.xml
# Expected: XML with all 11 pages

# 3. Robots.txt loads
curl https://sparkfined-pwa.vercel.app/robots.txt
# Expected: User-agent + Sitemap URL

# 4. Security headers present
curl -I https://sparkfined-pwa.vercel.app | grep -E "Content-Security|Permissions"
# Expected: CSP, Permissions-Policy headers
```

---

### 3. Run Lighthouse Audit

**Desktop:**
1. Open: https://sparkfined-pwa.vercel.app
2. Chrome DevTools (F12) → Lighthouse
3. Select: Desktop, All categories
4. Click "Analyze page load"

**Target Scores:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
- PWA: ✅ Installable

**Mobile:**
1. Repeat above with "Mobile" selected
2. Target: 85+ (mobile is stricter)

---

### 4. Test PWA Install

**Desktop Chrome:**
1. Open app
2. Look for install icon in address bar
3. Click install → App opens standalone
4. Verify: App appears in OS app launcher

**iOS Safari:**
1. Open app in Safari
2. Tap Share → "Add to Home Screen"
3. Tap "Add"
4. Verify: Icon on home screen
5. Tap icon → App opens (no browser chrome)

**Android Chrome:**
1. Open app
2. Banner appears: "Install Sparkfined"
3. Tap "Install"
4. Verify: App in app drawer
5. Open → Standalone mode

---

### 5. Test Skip Link (A11y)

1. Open app
2. Press **Tab** key once
3. Green "Skip to main content" button appears
4. Click button → Jumps to main content
5. Press Tab again → First interactive element focused

**Expected:** ✅ Skip link works

---

### 6. Test Offline Mode

1. Open app
2. Chrome DevTools → Network → Offline
3. Refresh page
4. Expected: Offline fallback page loads (`public/offline.html`)
5. Toggle online → App works normally

---

### 7. Submit to Google Search Console

**One-time setup:**

1. Go to: https://search.google.com/search-console
2. Click "Add Property"
3. Enter URL: `https://sparkfined-pwa.vercel.app`
4. Verify ownership:
   - **Option A:** DNS TXT record
   - **Option B:** HTML file upload
   - **Option C:** Meta tag (recommended)

5. After verification:
   - Go to Sitemaps
   - Submit: `https://sparkfined-pwa.vercel.app/sitemap.xml`
   - Wait 24-48h for indexing

---

## Troubleshooting

### Build Failed on Vercel

**Check:**
1. Vercel logs: https://vercel.com/[team]/[project]/deployments
2. Common issues:
   - Missing `pnpm-lock.yaml` → Run `pnpm install` locally, commit
   - Node version mismatch → Ensure `"engines": { "node": ">=20.10.0" }` in `package.json`
   - Out of memory → Contact Vercel support (unlikely with current bundle size)

**Fix:**
```bash
# Re-install dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
git add pnpm-lock.yaml
git commit -m "Update pnpm lockfile"
git push
```

---

### App Doesn't Load

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Service Worker status (DevTools → Application → Service Workers)

**Fix:**
```bash
# Clear browser cache
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

# Unregister Service Worker
# DevTools → Application → Service Workers → Unregister
```

---

### PWA Won't Install

**Check:**
1. HTTPS enabled (Vercel auto-provides) ✅
2. Manifest valid (DevTools → Application → Manifest)
3. Service Worker registered (DevTools → Application → Service Workers)
4. Icons present (192x192, 512x512)

**Fix:**
- Verify `manifest.webmanifest` has no JSON errors
- Check browser console for manifest/SW errors
- Try different browser (Chrome, Edge have best PWA support)

---

### Lighthouse Score <90

**Common Issues:**

**Performance <90:**
- Fonts via Google CDN → Self-host (see `LIGHTHOUSE_OPTIMIZATION.md`)
- Large images → Optimize, use WebP
- Slow server response → Check Vercel logs

**Accessibility <95:**
- Skip link not working → Verify `sr-only` CSS present
- Color contrast low → Check `tokens.css` values
- Missing alt text → Add to all images

**Best Practices <95:**
- Console errors → Check browser console, fix errors
- Mixed content → Ensure all resources use HTTPS
- Security headers missing → Verify `vercel.json` deployed

**SEO <95:**
- Missing meta tags → Verify `index.html` has title, description
- Sitemap not loading → Check URL, verify deployed
- Robots.txt not loading → Check `public/robots.txt` deployed

---

## Rollback Plan

**If critical bug found post-deploy:**

### Option 1: Promote Previous Deployment

1. Go to: https://vercel.com/[team]/[project]/deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"

**Result:** Previous version restored in <30s

---

### Option 2: Git Revert

```bash
# Find last good commit
git log --oneline

# Revert to previous commit
git revert HEAD

# Push (triggers auto-deploy)
git push origin main
```

**Result:** Previous version deployed automatically

---

## Custom Domain Setup (Optional)

### Step 1: Add Domain in Vercel

1. Go to: Project Settings → Domains
2. Click "Add"
3. Enter domain: `sparkfined.com`
4. Click "Add"

---

### Step 2: Configure DNS

**If using Vercel DNS (Recommended):**
1. Update nameservers at your registrar
2. Point to Vercel nameservers
3. Wait 24-48h for propagation

**If using external DNS:**
1. Add CNAME record:
   - Name: `www`
   - Value: `cname.vercel-dns.com`
2. Add A record (for apex domain):
   - Name: `@`
   - Value: `76.76.21.21` (Vercel IP)

---

### Step 3: Update Sitemap

```bash
# Edit public/sitemap.xml
# Replace: https://sparkfined-pwa.vercel.app
# With: https://sparkfined.com

# Commit & push
git add public/sitemap.xml
git commit -m "Update sitemap for custom domain"
git push
```

---

## Monitoring Post-Deploy

### First 24 Hours

- [ ] No 5xx errors (Vercel Dashboard)
- [ ] Lighthouse scores 90+ (Desktop) / 85+ (Mobile)
- [ ] PWA installable (Chrome, iOS, Android)
- [ ] Skip link works (Tab key test)
- [ ] Offline mode works (Network toggle test)

### First Week

- [ ] Google Search Console: Sitemap processed
- [ ] No critical errors in browser console
- [ ] Web Vitals "Good" (LCP, FID, CLS)
- [ ] Uptime 99.9%+ (Vercel provides)

---

## Next Steps After Deploy

### Week 1
- [ ] Add analytics (Umami/Vercel/Plausible)
- [ ] Add error tracking (Sentry)
- [ ] Monitor Lighthouse scores daily
- [ ] Self-host fonts (if Performance <90)

### Month 1
- [ ] Add structured data (JSON-LD)
- [ ] Deploy backend APIs (real data)
- [ ] A/B test landing page
- [ ] Collect user feedback

---

## Success Criteria ✅

| Metric | Target | How to Check |
|--------|--------|--------------|
| Deployment Time | <2 min | Vercel logs |
| Homepage Load | <2s | Lighthouse |
| Lighthouse (Desktop) | 90+ | Chrome DevTools |
| Lighthouse (Mobile) | 85+ | Chrome DevTools |
| PWA Installable | ✅ | Install icon visible |
| Offline Works | ✅ | Network toggle test |
| Uptime | 99.9% | Vercel Dashboard |

---

## Summary

**Deployment Options:**
1. ✅ **Vercel CLI** (fastest, manual)
2. ✅ **GitHub Integration** (auto-deploy on push)
3. ✅ **GitHub Actions** (full CI/CD control)

**Post-Deploy:**
1. Update sitemap/robots.txt URLs
2. Run Lighthouse audit (target: 90+)
3. Test PWA install (Chrome, iOS, Android)
4. Submit sitemap to Google Search Console

**Launch Command:**
```bash
pnpm build && vercel --prod
```

**Expected Time:** 2-5 minutes (first deploy)

---

**Last Updated:** 2025-11-05  
**Status:** Ready to Deploy  
**Repo:** https://github.com/baum777/Sparkfined_PWA

---

🚀 **LAUNCH COMMAND:**
```bash
vercel --prod
```

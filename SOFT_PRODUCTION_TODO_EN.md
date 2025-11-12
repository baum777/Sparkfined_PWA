# Soft Production Launch - Todo List

**Goal:** Tool focus and operability for soft launch  
**Scope:** Without token lock and NFT integration (coming after soft launch)  
**Priority:** Stability, core features, user experience

---

## 🔴 Critical Blockers (must be fixed before launch)

### Enable TypeScript Strict Mode

The build currently runs with disabled null checks, which can lead to runtime crashes.

**Tasks:**
- Remove `strictNullChecks: false` from `tsconfig.build.json`
- Go through and fix all 22 TypeScript errors
- Common issues: Missing null checks, optional props without default values
- Test build locally with `pnpm build`
- Ensure no new runtime errors occur

**Validation:**
- `pnpm typecheck` runs without errors
- `pnpm build` compiles successfully
- Manual testing: Click through Board, Analyze, Chart, Journal

---

### Integrate E2E Tests into CI Pipeline

Playwright tests only run locally, not in Vercel deployment.

**Tasks:**
- Add `pnpm test:e2e` to Vercel build command
- Configure Playwright browser dependencies for Vercel
- Alternative: Create GitHub Actions workflow for E2E (before Vercel deploy)
- Smoke tests for critical flows: Board load, chart render, journal save

**Validation:**
- CI fails on breaking changes
- All 15+ E2E specs run green
- Build logs show Playwright output

---

### Runtime Environment Validator

App starts even without API keys and shows cryptic errors.

**Tasks:**
- Build env validator in `src/main.tsx` (before React render)
- Check: `MORALIS_API_KEY`, `DEXPAPRIKA_BASE`, `DATA_PROXY_SECRET`
- On missing keys: Show `MissingConfigBanner` with clear instructions
- Banner should contain links to environment setup docs
- Developer mode: Show banner only in production, not in dev mode

**Validation:**
- Build without `.env.local` shows understandable error UI
- Banner disappears after key configuration + reload
- Developers can still work with `DEV_USE_MOCKS=true`

---

## 🟠 Important Fixes (should be fixed before launch)

### Disable Access Gating for Soft Launch

Token lock and NFT check should only become active after soft launch.

**Tasks:**
- Switch access provider in `src/store/AccessProvider.tsx` to mock mode
- Temporarily remove all route guards in `src/routes/RoutesRoot.tsx`
- Access page shows "Coming Soon" banner instead of wallet connect
- Introduce environment variable: `VITE_ENABLE_ACCESS_GATING=false` (default)
- Documentation: Instructions on how to enable access gating later

**Validation:**
- App is usable without wallet connection
- All features are accessible (Board, Chart, Journal, Analyze)
- Access page shows clear information about upcoming feature

---

### Set Up Error Monitoring

Crashes are currently not captured.

**Tasks:**
- Create Sentry account (free tier sufficient)
- Integrate Sentry SDK in `src/main.tsx`
- Connect error boundary in `src/components/ErrorBoundary.tsx` with Sentry
- Environment variable: `VITE_SENTRY_DSN` (only set in production)
- Configure alert threshold: Error rate >0.1% triggers notification

**Validation:**
- Trigger test error and see in Sentry dashboard
- Source maps are uploaded correctly
- Error rate graph is visible

---

### Build Performance Monitoring

LCP, FID and CLS are not measured.

**Tasks:**
- Add Web Vitals library: `npm install web-vitals`
- Collect metrics in `src/main.tsx` via `getCLS`, `getFID`, `getLCP`
- Send metrics to `/api/telemetry` (opt-in via Settings)
- Set up Lighthouse CI in GitHub Actions
- Define performance budget: LCP <2s, FID <100ms, CLS <0.1

**Validation:**
- Lighthouse report visible in CI logs
- Web Vitals are received in telemetry endpoint
- Build fails on budget violation

---

### Test API Provider Fallback

Multi-provider logic must be tested under load.

**Tasks:**
- Document fallback chain: DexPaprika → Moralis → Dexscreener → Cache
- Configure timeout values: 5s for primary, 10s for secondary
- Build retry logic: 3 attempts with exponential backoff
- Show error states in UI: "Provider XY offline, using fallback"
- Mock mode for testing: `DEV_FORCE_FALLBACK=true`

**Validation:**
- Manually block DexPaprika request → App uses Moralis
- Block Moralis too → App uses cache + shows warning
- No white screens on provider failures

---

## 🟡 Nice-to-Have (can be fixed after launch)

### Monitor Bundle Size

Current size is OK, but there are no limits.

**Tasks:**
- Extend bundle size CI check with `scripts/check-bundle-size.mjs`
- Set limits: Main bundle <500 KB, total <3 MB
- Store bundle analyzer report in CI artifacts
- Alert on >10% size increase

**Validation:**
- CI shows bundle size in logs
- Build fails on limit violation

---

### Clean Up Console.log Statements

104 console.log() statements in production code.

**Tasks:**
- Create logger wrapper: `src/lib/logger.ts`
- Logger checks `import.meta.env.DEV` before output
- Replace all `console.log()` with `logger.debug()`
- Production build should show no logs

**Validation:**
- DevTools console empty in production
- Logs still appear in dev mode

---

### Test iOS PWA Installation

Safari has special quirks for PWA installation.

**Tasks:**
- Testing on iOS 15, 16, 17 (Safari)
- Check install prompt: "Add to Home Screen"
- Check push notification support (iOS 16.4+)
- Test offline mode on iOS
- Optimize manifest icons for iOS

**Validation:**
- App installs on all iOS versions
- Icons appear correctly on home screen
- Offline page is shown on network failure

---

### IndexedDB Backup Feature

Data loss possible on browser reset.

**Tasks:**
- Export function in Settings: Journal, trades, signals as JSON
- Import function with merge strategy (keep local data on conflict)
- Auto-backup every 7 days (optional, opt-in)
- Backup in localStorage as compressed JSON

**Validation:**
- Export creates valid JSON
- Import reconstructs all data correctly
- Merge conflicts are resolved cleanly

---

## 🔵 Feature Improvements

### Onboarding Optimization

Welcome modal and tour should better onboard users.

**Tasks:**
- Welcome modal: Describe personas more clearly (Beginner, Intermediate, Advanced)
- Tour: Reduce step count (currently 8 steps → max 5)
- Hint banner: Improve timing (not immediately after tour, but when needed)
- Skip button for experienced users
- Save onboarding status: Users shouldn't see tour multiple times

**Validation:**
- New users understand app after tour
- Retention rate >50% after day 1

---

### Optimize Chart Performance

Canvas chart should run smoothly even on weak devices.

**Tasks:**
- Throttling for mousemove events (max 60 FPS)
- Lazy rendering: Only draw visible candles
- Move indicator calculation to Web Worker
- RequestAnimationFrame instead of setInterval for animations
- Performance profiling with Chrome DevTools

**Validation:**
- Chart runs at 60 FPS on mid-range smartphones
- CPU load <20% in idle mode

---

### AI Cost Tracking

Users should see how much AI budget they're consuming.

**Tasks:**
- Build token counter into AI context
- Cost estimation: Tokens × provider price
- UI element in Settings: "AI Budget: $2.50 / $10.00 consumed"
- Warning at 80% budget consumption
- Opt-out option for paid AI features

**Validation:**
- Settings shows correct token consumption
- Warning appears on budget violation

---

### Improve Journal Server Sync

Offline changes can lead to conflicts.

**Tasks:**
- Show conflict markers in UI: "Server version: ..., Local version: ..."
- Merge dialog with side-by-side comparison
- Background sync queue for pending saves
- Retry logic with exponential backoff (3 attempts)
- Last-write-wins as fallback strategy

**Validation:**
- Offline changes are synchronized after reconnect
- Conflicts are resolved cleanly
- No data loss on simultaneous edits

---

## 🧪 Testing & QA

### Expand Smoke Test Suite

Automated tests for critical user flows.

**Tasks:**
- E2E test: Board → Analyze → Chart → Journal (happy path)
- E2E test: Generate AI bullets and insert into journal
- E2E test: Create signal → trade plan → log outcome
- E2E test: Offline mode → load data from cache
- E2E test: Push notification subscribed → alert triggers

**Validation:**
- All tests run green in CI
- Test coverage >50% for critical flows

---

### Manual Testing Checklist

Manual tests before deployment.

**Tasks:**
- [ ] Board page loads KPIs without errors
- [ ] Overview tiles show real data (not "N/A")
- [ ] Quick actions navigate to correct pages
- [ ] Onboarding modal appears on first visit
- [ ] Chart renders OHLC data for known token
- [ ] Indicators (SMA, RSI, Bollinger) display correctly
- [ ] Replay mode runs without stuttering
- [ ] Journal note save works (local + server)
- [ ] AI bullets generate 4-7 bullet points
- [ ] Journal condense compresses long notes
- [ ] Signals page shows detected patterns
- [ ] Signal filters (pattern, confidence) work
- [ ] Settings changes are persisted
- [ ] Theme switch (if implemented) works
- [ ] PWA installation works (desktop + mobile)
- [ ] Offline page shows on network failure
- [ ] Service worker updates on new version
- [ ] Push notification permission request appears
- [ ] Alert rule create and save works

**Validation:**
- All checkboxes checked before deployment

---

## 📦 Deployment Preparation

### Set Environment Variables in Vercel

Production secrets must be configured.

**Tasks:**
- Open Vercel dashboard: Settings → Environment Variables
- Set required fields:
  - `MORALIS_API_KEY` (hidden secret)
  - `DEXPAPRIKA_BASE` (URL)
  - `DATA_PROXY_SECRET` (random string)
- Optional keys:
  - `OPENAI_API_KEY` (for AI features)
  - `ANTHROPIC_API_KEY` (as fallback)
  - `VITE_SENTRY_DSN` (for error tracking)
  - `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (for push notifications)
- Mark all secrets as "Hidden"
- Configure preview + production environments separately

**Validation:**
- Build in Vercel runs through without missing-key errors
- `/api/health` endpoint returns status 200

---

### Optimize Vercel Build Settings

Improve build performance and caching.

**Tasks:**
- Check build command: `pnpm build` (incl. TypeScript check)
- Confirm output directory: `dist`
- Set Node version: `20.10.0` (from package.json)
- Select framework preset: `Vite`
- Install command: `pnpm install` (not npm)
- Enable caching: Cache `pnpm store`

**Validation:**
- Build time <3 minutes
- Build cache is used on repeated deployments

---

### Configure Domains & SSL

Production domain should be custom domain, not `*.vercel.app`.

**Tasks:**
- Add custom domain in Vercel dashboard
- Set DNS records at domain provider (A/CNAME)
- SSL certificate automatically via Let's Encrypt
- Set up redirects: `www` → non-www (or vice versa)
- Check `vercel.json`: Rewrites for SPA routing

**Validation:**
- HTTPS works without warnings
- All subpaths (`/chart`, `/journal`, etc.) load correctly
- Service worker runs on custom domain

---

### Set Up Monitoring & Alerts

Production monitoring for uptime and errors.

**Tasks:**
- Enable Vercel monitoring (free in Pro tier)
- Set up uptime check for `/api/health`
- Configure Sentry alerts:
  - Error rate >0.1% → Email to team
  - Critical error (5xx) → Slack notification
- Set performance budgets in Lighthouse CI
- Check cron jobs: `/api/cron/cleanup-temp-entries` runs daily

**Validation:**
- Test error triggers Sentry alert
- Uptime check runs every 5 minutes

---

## 📝 Update Documentation

### Adapt README for Soft Launch

Main README should reflect current status.

**Tasks:**
- Add status badge: "Beta - Open for Testing"
- Update feature list: Mark access gating as "Coming Soon"
- Simplify quick start guide (fewer technical details)
- Add screenshots/GIFs (Board, Chart, Journal)
- Insert link to live demo

**Validation:**
- README is understandable for non-technical users
- All links work

---

### Create User Guide

Users need help getting started.

**Tasks:**
- Create guide file: `/docs/USER_GUIDE.md`
- Chapters:
  - What is Sparkfined?
  - First steps (onboarding)
  - Board page explained (KPIs, feed, quick actions)
  - Analyze tokens (Analyze page)
  - Use chart (indicators, replay)
  - Keep journal (notes, AI condense)
  - Understand signals (pattern, confidence)
  - Adjust settings
- Screenshots for each chapter
- FAQ section at the end

**Validation:**
- Users can follow guide without prior knowledge

---

### API Documentation for Third Parties

If API access will be offered later.

**Tasks:**
- Create OpenAPI spec: `/docs/api/openapi.yaml`
- Document endpoints:
  - `/api/data/ohlc` - Retrieve OHLC data
  - `/api/journal` - Journal notes CRUD
  - `/api/rules` - Manage alert rules
  - `/api/ai/assist` - Call AI templates
- Describe authentication (currently: none, later: API keys)
- Document rate limits
- Example requests with cURL

**Validation:**
- Swagger UI renders OpenAPI spec correctly

---

## 🚀 Launch Checklist

### Pre-Launch (1 week before go-live)

- [ ] All critical blockers fixed (TypeScript, E2E, env validator)
- [ ] Access gating disabled and documented
- [ ] Error monitoring running (Sentry configured)
- [ ] Performance monitoring active (Web Vitals, Lighthouse CI)
- [ ] API fallback chain tested
- [ ] Manual testing checklist complete
- [ ] Environment variables set in Vercel
- [ ] Build settings optimized
- [ ] Custom domain configured (SSL active)
- [ ] Monitoring & alerts set up
- [ ] README and user guide updated
- [ ] Staging deployment successfully tested

### Launch Day

- [ ] Deploy final build from `main` branch
- [ ] Run smoke tests on production URL
- [ ] Check error rate in Sentry (should be <0.1%)
- [ ] Check performance metrics (LCP <2s, FID <100ms)
- [ ] Prepare social media announcement (see `/docs/lore/x-timeline-posts.md`)
- [ ] Inform community on Discord/Telegram
- [ ] Activate feedback mechanism (modal in app)

### Post-Launch (first 48h)

- [ ] Monitor error rate (Sentry dashboard)
- [ ] Collect user feedback (Discord, feedback modal)
- [ ] Check performance metrics daily
- [ ] Track API provider costs (Moralis, OpenAI)
- [ ] Keep hot-fix branch ready for critical bugs
- [ ] Daily standup with team: Discuss blockers

---

## 📊 Success Metrics for Soft Launch

After 2 weeks, the following metrics should be achieved:

**Technical Metrics:**
- Error rate <0.1%
- LCP (Largest Contentful Paint) <2s
- FID (First Input Delay) <100ms
- PWA install rate >50% (mobile users)
- Offline functionality: 100% of core features usable

**User Metrics:**
- 50+ active users
- D1 retention >40% (return after 1 day)
- D7 retention >25% (return after 1 week)
- Average session duration >5 minutes
- 20+ journal entries created
- 10+ AI bullets generated

**Business Metrics:**
- 0 critical bugs
- <1 critical bug per 100 users
- Positive feedback >80%
- API costs <$50/month
- Uptime >99.5%

---

## 🎯 Prioritization

**This Week (before soft launch):**
1. Enable TypeScript strict mode
2. Integrate E2E tests into CI
3. Runtime environment validator
4. Disable access gating
5. Set up error monitoring

**Next Week (launch week):**
6. Build performance monitoring
7. Test API provider fallback
8. Go through manual testing checklist
9. Deployment preparation (Vercel config)
10. Update documentation

**After Launch (follow-up):**
11. Monitor bundle size
12. Clean up console.log
13. Test iOS PWA
14. IndexedDB backup feature
15. Further feature improvements from backlog

---

**Created:** 2025-11-12  
**Target Launch:** Soft launch without token lock/NFT  
**Post-Launch:** Token lock and NFT integration in phase R1

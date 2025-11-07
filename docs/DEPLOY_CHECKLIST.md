# 🚀 Pre-Deploy Checklist — Sparkfined PWA

Use this checklist before deploying to production or preview environments.

---

## 📋 1. Environment Variables (Vercel Dashboard)

### Required (App Won't Function)

- [ ] **`VITE_APP_VERSION`** — Set to current version (e.g., `1.0.0-beta`)
- [ ] **`MORALIS_API_KEY`** — Get from [admin.moralis.io](https://admin.moralis.io/)
  - Set in: **Production**, **Preview**, **Development**
- [ ] **`MORALIS_BASE`** — `https://deep-index.moralis.io/api/v2.2`

### Optional (Degraded Features)

- [ ] **`VITE_OPENAI_API_KEY`** — For AI analysis ([platform.openai.com](https://platform.openai.com/api-keys))
- [ ] **`VITE_VAPID_PUBLIC_KEY`** — For push notifications (`npx web-push generate-vapid-keys`)
- [ ] **`VAPID_PRIVATE_KEY`** — For server-side push (same command, **server-only**)
- [ ] **`VAPID_SUBJECT`** — `mailto:your-email@example.com`

### Verification

```bash
# Check that keys are set in Vercel dashboard
vercel env ls
```

---

## 🧪 2. CI/CD Checks

### Local Pre-Commit

Run these commands before pushing:

```bash
# 1. TypeScript check (must pass)
pnpm typecheck

# 2. Build (must succeed)
pnpm build        # Fast build without E2E

# 3. Linter (warnings OK, errors must be fixed)
pnpm lint

# 4. E2E tests (recommended before deploy)
pnpm test:e2e     # Runs in CI via build:ci

# 5. Full CI build (optional locally)
pnpm build:ci     # Same as Vercel runs
```

### Vercel Build Checks

**Important:** Use `build:ci` in Vercel (not `build`)

Update Vercel build command to:
```bash
pnpm build:ci
```

Ensure these pass in Vercel CI:

- [ ] Build succeeds without errors
- [ ] E2E tests pass (7 specs)
- [ ] No TypeScript errors in production config
- [ ] Bundle size <2.5MB (check `dist/` folder)

---

## 🔍 3. Manual Testing (Pre-Production)

### Desktop (Chrome/Firefox/Edge)

- [ ] PWA installable (install prompt shows)
- [ ] Offline mode works (disconnect WiFi, reload Board page)
- [ ] Chart loads data (enter token address, click Load)
- [ ] Push notification subscription works (Settings → Notifications)
- [ ] Service worker updates automatically (check DevTools → Application)

### Mobile (iOS Safari + Android Chrome)

- [ ] PWA installable (Add to Home Screen)
- [ ] Offline mode works (airplane mode, open app)
- [ ] Touch gestures work (swipe navigation, pinch zoom on chart)
- [ ] Bottom nav visible and functional
- [ ] No layout overflow (test on iPhone SE, Pixel 5)

### A11y Testing

- [ ] Tab navigation works (keyboard-only user flow)
- [ ] Screen reader announces page changes (VoiceOver/NVDA)
- [ ] Color contrast meets WCAG 2.1 AA (check with browser DevTools)
- [ ] No overlapping content at 200% zoom

---

## 📊 4. Performance Checks

### Lighthouse CI

Run Lighthouse on preview deployment:

```bash
# After deploying to preview URL
npm run lighthouse
```

**Target Scores:**
- Performance: >90
- PWA: >90
- Best Practices: >90
- Accessibility: >85

### Bundle Size

Check bundle analyzer:

```bash
pnpm analyze
```

**Thresholds:**
- `vendor-react`: <55KB gzipped
- `chart`: <12KB gzipped
- `index`: <12KB gzipped
- Total: <150KB gzipped

---

## 🔐 5. Security Review

- [ ] No hardcoded secrets in code (run `git grep -E "(sk-|pk_|key_)[a-zA-Z0-9_-]{20,}"`)
- [ ] `.env.example` up-to-date with all keys
- [ ] Vercel headers configured (X-Frame-Options, CSP)
- [ ] API keys have IP restrictions (if supported by provider)
- [ ] No sensitive data in localStorage (check DevTools → Application)

---

## 📝 6. Documentation

- [ ] README.md up-to-date with current features
- [ ] ENVIRONMENT_VARIABLES.md reflects all required keys
- [ ] Changelog updated (if using CHANGELOG.md)
- [ ] API docs current (if exposing backend routes)

---

## 🎯 7. Feature Flags

Verify these flags are set correctly:

```bash
# Production
VITE_ENABLE_AI_TEASER=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_METRICS=true

# Preview/Dev
VITE_ENABLE_DEBUG=true  # Only for troubleshooting
```

---

## 🚦 8. Deploy

### Preview Deployment

```bash
# Push to feature branch → auto-deploys to preview
git push origin feature/my-feature

# Or manual deploy
vercel --prod=false
```

**Verify preview:**
- [ ] Preview URL works
- [ ] No console errors in browser DevTools
- [ ] MissingConfigBanner doesn't show (keys are set)

### Production Deployment

```bash
# Merge to main → auto-deploys to production
git push origin main

# Or manual deploy
vercel --prod
```

**Post-Deploy Checks:**
- [ ] Production URL works
- [ ] Service worker updates (check version in DevTools)
- [ ] No breaking changes for existing users
- [ ] Analytics tracking working (Vercel Analytics, Umami)

---

## 🔄 9. Rollback Plan

If deploy breaks:

```bash
# Instant rollback to previous deploy (Vercel)
vercel rollback

# Or redeploy specific commit
vercel --prod --target=production --yes
```

**Monitor:**
- Error rate in Sentry (if configured)
- User complaints in Discord/support channels
- Vercel logs for 5xx errors

---

## 📞 10. Post-Deploy

- [ ] Announce deployment in team chat
- [ ] Update status page (if using one)
- [ ] Monitor error rate for 1 hour
- [ ] Check user feedback (Discord, GitHub issues)
- [ ] Tag release in GitHub: `git tag v1.0.0 && git push origin v1.0.0`

---

## ✅ Sign-Off

**Deployed by:** _______________  
**Date:** _______________  
**Version:** _______________  
**Vercel URL:** _______________  

---

## 📚 Resources

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Moralis Admin](https://admin.moralis.io/)
- [OpenAI API Keys](https://platform.openai.com/api-keys)
- [Web Push VAPID Generator](https://web-push-codelab.glitch.me/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

**Questions?** Check `/docs/ENVIRONMENT_VARIABLES.md` or ask in #sparkfined-dev.

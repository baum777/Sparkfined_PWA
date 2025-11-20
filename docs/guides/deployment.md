# Deployment Guide — Sparkfined PWA

**Last Updated:** 2025-11-20
**Target Platform:** Vercel (recommended), Self-Hosted (advanced)

---

## Table of Contents

- [Quick Deploy (Vercel)](#quick-deploy-vercel)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Build Scripts Reference](#build-scripts-reference)
- [Deployment Steps](#deployment-steps)
- [Post-Deployment Validation](#post-deployment-validation)
- [Rollback Strategy](#rollback-strategy)
- [Risk Management](#risk-management)
- [Troubleshooting](#troubleshooting)

---

## Quick Deploy (Vercel)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baum777/sparkfined-pwa)

**Automated deployment via Git push:**
1. Connect repository to Vercel
2. Configure environment variables (see below)
3. Push to main branch → auto-deploy
4. Verify deployment health

---

## Pre-Deployment Checklist

Run these commands locally before deploying:

```bash
# 1. Code Quality Checks
pnpm lint                    # ESLint validation
pnpm typecheck               # TypeScript strict mode check
pnpm test                    # Vitest unit tests
pnpm test:e2e                # Playwright E2E tests (optional)

# 2. Build Verification
pnpm build:local             # Production build + bundle size check
pnpm check:size              # Standalone bundle size assertion

# 3. Environment Validation
pnpm run check-env           # Validates required environment variables

# 4. Local Preview
pnpm preview                 # Preview production build (port 4173)
pnpm lighthouse              # Run Lighthouse audit (optional)
```

### Expected Results

- ✅ Zero TypeScript errors
- ✅ Bundle size < 500KB (target: < 400KB)
- ✅ All tests passing
- ✅ Lighthouse PWA score ≥ 90

---

## Environment Configuration

### Required Environment Variables

Set these in **Vercel Dashboard → Project → Settings → Environment Variables**:

| Variable | Required | Environment | Description |
|----------|----------|-------------|-------------|
| `MORALIS_API_KEY` | ✅ | Production, Preview | Server-only Moralis API key |
| `MORALIS_BASE_URL` | ❌ | All | Override Moralis endpoint (default: official) |
| `DEXPAPRIKA_BASE` | ✅ | Production | DexPaprika API base URL |
| `DEXPAPRIKA_API_KEY` | ❌ | Production | DexPaprika API key (if required) |
| `DATA_PROXY_SECRET` | ✅ | Production | Shared secret for API proxy calls |
| `OPENAI_API_KEY` | ❌ | Production | OpenAI API key for AI features |
| `XAI_API_KEY` | ❌ | Production | xAI/Grok API key for crypto insights |
| `VAPID_PUBLIC_KEY` | ❌ | Production | Web Push public key |
| `VAPID_PRIVATE_KEY` | ❌ | Production | Web Push private key (server-only) |
| `ALERTS_ADMIN_SECRET` | ❌ | Production | Bearer token for `/api/push/test-send` |

### Client-Side Variables (VITE_ prefix)

These are exposed in the browser bundle:

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_VERSION` | `1.0.0-beta` | App version displayed in UI |
| `VITE_SOLANA_RPC_URL` | Mainnet | Solana RPC endpoint |
| `VITE_VAPID_PUBLIC_KEY` | - | Web Push public key (must match server) |
| `VITE_DEBUG` | `false` | Enable debug logging |
| `VITE_ENABLE_AI_TEASER` | `false` | Toggle AI teaser UI |

### Security Best Practices

⚠️ **NEVER expose server-side secrets with VITE_ prefix**

```bash
# ✅ Good: Server-Side-Only (no VITE_ prefix)
MORALIS_API_KEY=sk-abc123...

# ❌ Bad: Exposed in client bundle
VITE_MORALIS_API_KEY=sk-abc123...
```

### Local Development

```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Add required secrets
echo "MORALIS_API_KEY=your_key_here" >> .env.local

# 3. Enable mock mode (optional, no live API calls)
echo "DEV_USE_MOCKS=true" >> .env.local

# 4. Start development server
pnpm dev
```

---

## Build Scripts Reference

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `pnpm build` | TypeScript check + production bundle | Standard production build |
| `pnpm build:local` | Build + bundle size verification | Before committing large changes |
| `pnpm build:ci` | Build + Playwright E2E tests | CI/CD pipeline |
| `pnpm preview` | Preview production build locally | Test PWA features locally |
| `pnpm analyze` | Bundle size visualization | Debug bundle bloat |
| `pnpm lighthouse` | Lighthouse audit | Performance testing |
| `pnpm check:size` | Standalone bundle size check | Quick size validation |

---

## Deployment Steps

### Option 1: Vercel (Recommended)

#### First-Time Setup

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import from GitHub: `baum777/Sparkfined_PWA`

2. **Configure Build Settings**
   ```
   Build Command: pnpm run build
   Output Directory: dist
   Install Command: pnpm install
   Framework Preset: Vite
   ```

3. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all required variables (see table above)
   - Set visibility: Production, Preview, or Development

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (~2-3 minutes)
   - Verify deployment URL

#### Ongoing Deployments

```bash
# Push to main branch triggers auto-deploy
git push origin main

# Preview deployment for feature branches
git push origin feature/my-feature
# → Creates preview URL: sparkfined-pwa-<hash>.vercel.app
```

### Option 2: Self-Hosted

```bash
# 1. Build production bundle
pnpm build

# 2. Deploy dist/ folder to CDN/S3/Nginx
# Example: AWS S3 + CloudFront
aws s3 sync dist/ s3://your-bucket/
aws cloudfront create-invalidation --distribution-id XXXXX --paths "/*"

# 3. Ensure Service Worker scope
# nginx.conf:
# location / {
#   try_files $uri $uri/ /index.html;
#   add_header Service-Worker-Allowed "/";
# }
```

---

## Post-Deployment Validation

### Automated Health Checks

```bash
# Run smoke tests against deployed URL
./scripts/smoke-vercel-check.sh https://your-app.vercel.app

# Checks:
# - /api/health (200 OK)
# - /api/moralis/health (proxy status)
# - Service Worker registration
# - Manifest.json validity
```

### Manual Verification

#### 1. PWA Installation

- Open Chrome DevTools → Application → Manifest
- Verify all 14 icons listed (32px - 1024px)
- Check Service Worker status: "activated"
- Click "Install" button in address bar
- Test offline: Disconnect network → reload → custom offline page

#### 2. API Endpoints

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Moralis proxy
curl https://your-app.vercel.app/api/moralis/health

# Expected: { "status": "ok", "timestamp": ... }
```

#### 3. Performance Metrics

Run Lighthouse audit:

```bash
pnpm lighthouse
# Or manually: DevTools → Lighthouse → Analyze page load
```

**Target Scores:**
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 90
- SEO: ≥ 90
- **PWA: ≥ 95**

#### 4. Service Worker

- Open DevTools → Application → Service Workers
- Verify: `sw.js` is activated
- Check: "Update on reload" for development
- Test: Offline functionality (Network tab → Offline)

#### 5. Push Notifications (if enabled)

```bash
# Test push notification
curl -X POST https://your-app.vercel.app/api/push/test-send \
  -H "Authorization: Bearer $ALERTS_ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Alert",
    "message": "Deployment successful"
  }'
```

---

## Rollback Strategy

### Vercel Rollback (Instant)

1. Go to Vercel Dashboard → Deployments
2. Find last stable deployment
3. Click "⋮" menu → "Promote to Production"
4. Rollback completes in ~5-10 seconds

### Git Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main
# → Triggers new deployment

# Or reset to specific commit
git reset --hard <commit-hash>
git push --force origin main
# ⚠️ Use with caution
```

---

## Risk Management

### Critical Risks (Deploy Blockers)

| Risk ID | Risk | Mitigation |
|---------|------|------------|
| **O-007** | Missing API keys → broken deploy | Runtime env validator + UI banner |
| **T-001** | Null/undefined crashes | Remove `strictNullChecks: false` |
| **T-002** | Regressions without detection | Add E2E tests to CI |

### Pre-Deploy Risk Checks

```bash
# 1. Verify no critical TODOs
grep -r "TODO: CRITICAL" src/

# 2. Check bundle size
pnpm run check:size

# 3. Verify environment variables
node scripts/check-env.mjs

# 4. Review recent commits
git log --oneline -10

# 5. Check for breaking changes
git diff main..HEAD -- src/types/ src/lib/
```

### Deployment Risks

- **Cache Corruption:** Bump Service Worker version in `vite.config.ts`
- **User Confusion:** Add toast notification for major UI changes
- **API Cost Overruns:** Monitor AI request costs (set `AI_MAX_COST_USD`)
- **Incomplete Features:** Ensure NFT gating is mocked with clear labels

See `docs/_archive/history/RISK_REGISTER.md` for full risk matrix.

---

## Troubleshooting

### Build Fails: Missing Dependencies

```bash
# Error: Cannot find module '@types/node'
pnpm install

# Error: Type definition files not found
pnpm add -D @types/node @testing-library/jest-dom
```

### Build Fails: Bundle Size Exceeded

```bash
# Check what's included
pnpm run analyze

# Common fixes:
# - Lazy load heavy libraries (Tesseract, Chart libraries)
# - Remove unused dependencies
# - Use dynamic imports
```

### Deployment Fails: Environment Variable Missing

```bash
# Error: MORALIS_API_KEY is required
# → Go to Vercel Dashboard → Settings → Environment Variables
# → Add MORALIS_API_KEY (no VITE_ prefix)
# → Redeploy
```

### Service Worker Not Updating

```bash
# Local development:
# - Open DevTools → Application → Service Workers
# - Check "Update on reload"
# - Click "Unregister" → reload page

# Production:
# - Clear browser cache
# - Hard reload (Ctrl+Shift+R)
# - Wait 24h for automatic update
```

### PWA Installation Fails

```bash
# Check manifest.json
curl https://your-app.vercel.app/manifest.webmanifest

# Verify:
# - "start_url": "/"
# - "scope": "/"
# - All icon paths valid
# - "display": "standalone"
```

### API Proxy Returns 500

```bash
# Check Vercel function logs:
# Vercel Dashboard → Deployments → [deployment] → Functions → api/moralis

# Common issues:
# - MORALIS_API_KEY not set
# - MORALIS_BASE_URL incorrect
# - Rate limit exceeded
```

---

## Additional Resources

- **Environment Variables:** `docs/setup/environment-and-providers.md`
- **Build Scripts Explained:** `package.json` scripts section
- **PWA Configuration:** `vite.config.ts` (vite-plugin-pwa)
- **Risk Register:** `docs/_archive/history/RISK_REGISTER.md`
- **Smoke Tests:** `scripts/smoke-vercel-check.sh`

---

## Changelog

- **2025-11-20:** Consolidated from `vercel-deploy-checklist.md`, `verifications.md`, `RISK_REGISTER.md`, and `docs/setup/build-and-deploy.md`
- **2025-11-07:** Added risk management section
- **2025-11-06:** Initial deployment documentation

---

**Maintained by:** Sparkfined DevOps Team
**Review Cadence:** After each major release
**Support:** See `docs/guides/troubleshooting.md` for common issues

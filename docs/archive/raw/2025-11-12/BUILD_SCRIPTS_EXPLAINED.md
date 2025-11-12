# Build Scripts Explained

**Status:** ✅ Optimized for Vercel Deployment  
**Last Updated:** 2025-11-07

---

## 📦 Available Build Scripts

### Production Build (Vercel)
```bash
pnpm build
```

**What it does:**
- TypeScript compilation (`tsc -b tsconfig.build.json`)
- Vite production build
- PWA service worker generation

**Duration:** ~1.6s  
**Use case:** Vercel/production deployments  
**Exit on error:** Yes

---

### Local Development Build
```bash
pnpm build:local
```

**What it does:**
- Everything in `pnpm build`
- + Bundle size verification (`check:size`)

**Duration:** ~2s  
**Use case:** Local development, pre-commit checks  
**Exit on error:** Yes (if bundle exceeds thresholds)

---

### CI/CD Build with E2E Tests
```bash
pnpm build:ci
```

**What it does:**
- Everything in `pnpm build:local`
- + E2E tests via Playwright (38 tests)

**Duration:** ~2-3min  
**Use case:** GitHub Actions, CI pipelines  
**Exit on error:** Yes (if build or tests fail)

---

## 🎯 When to Use Each Script

| Scenario | Command | Reason |
|----------|---------|--------|
| **Vercel Deployment** | `pnpm build` | Fast, no dev checks needed |
| **Local Testing** | `pnpm build:local` | Verify bundle sizes before commit |
| **GitHub Actions** | `pnpm build:ci` | Full validation with E2E tests |
| **Quick Iteration** | `pnpm dev` | Hot reload, no build needed |

---

## 🚨 Recent Changes (2025-11-07)

### Problem
```
Error: Cannot find module '/vercel/path0/scripts/check-bundle-size.mjs'
```

### Root Cause
- `pnpm build` included `check:size` step
- `.vercelignore` excluded entire `scripts/` directory
- Vercel deployment failed (missing script file)

### Solution
1. **Separated build concerns:**
   - `pnpm build` → Production only (no size checks)
   - `pnpm build:local` → Dev with size checks
   - `pnpm build:ci` → Full CI pipeline

2. **Updated `.vercelignore`:**
   ```diff
   - scripts/
   + scripts/*.sh
   + scripts/*.ps1
   + scripts/verify*.mjs
   ```
   Now allows `check-bundle-size.mjs` but excludes dev scripts

---

## 📊 Bundle Size Thresholds

Located in: `scripts/check-bundle-size.mjs`

```javascript
const THRESHOLDS = {
  'vendor-react': 55,  // KB (gzipped)
  'chart': 12,
  'index': 12,
  'vendor': 15,
};
```

**Current sizes:**
- `vendor-react`: 48KB / 55KB (87%) ✅
- `chart`: 9KB / 12KB (75%) ✅
- `index`: 9KB / 12KB (75%) ✅
- `vendor`: 4KB / 15KB (27%) ✅

---

## 🔧 Script Internals

### TypeScript Compilation
```bash
tsc -b tsconfig.build.json
```
- Uses build-specific config
- Excludes tests, dev files
- Outputs to `dist/`

### Vite Build
```bash
vite build
```
- Bundles React app
- Code splitting (vendor, chart, pages)
- Minification via esbuild
- Generates PWA assets

### Bundle Size Check
```bash
node scripts/check-bundle-size.mjs
```
- Scans `dist/assets/*.js`
- Estimates gzipped sizes (~30% of uncompressed)
- Fails if any bundle exceeds threshold
- Only runs in `build:local` and `build:ci`

### E2E Tests
```bash
playwright test
```
- 38 tests across 7 spec files
- Uses `reuseExistingServer` (no rebuild)
- Runs on `http://localhost:4173` (preview server)
- Only runs in `build:ci`

---

## 🐛 Troubleshooting

### Build fails with "Cannot find module check-bundle-size.mjs"
**Cause:** Using old build command that includes `check:size`

**Fix:**
```bash
# Update package.json scripts (already done)
# OR run production build:
pnpm build
```

### Bundle size check fails locally
**Cause:** Bundle exceeds threshold

**Fix:**
```bash
# Analyze bundle composition
pnpm analyze

# Opens dist/stats.html with bundle breakdown
# Look for:
# - Large dependencies
# - Duplicate code
# - Unused exports
```

### E2E tests fail in CI
**Cause:** Preview server not starting or timing out

**Fix:**
```bash
# Check build works first
pnpm build

# Start preview server manually
pnpm preview

# Run tests in separate terminal
pnpm test:e2e
```

---

## 📚 Related Documentation

- **Build Fix Report:** `docs/BUILD_FIX_REPORT.md`
- **Deployment Checklist:** `docs/DEPLOY_CHECKLIST.md`
- **Vite Config:** `vite.config.ts`
- **TypeScript Config:** `tsconfig.build.json`
- **Playwright Config:** `playwright.config.ts`

---

## ✅ Verification

Run all builds to ensure they work:

```bash
# 1. Clean build
rm -rf dist
pnpm build
# Expected: ✅ Build succeeds in ~1.6s

# 2. Local build with size check
pnpm build:local
# Expected: ✅ All bundles within limits

# 3. Full CI build (takes ~2-3min)
pnpm build:ci
# Expected: ✅ Build + 38 E2E tests pass
```

---

**Last verified:** 2025-11-07  
**Status:** ✅ All builds working correctly

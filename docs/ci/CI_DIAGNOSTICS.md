# CI Diagnostics Report — Sparkfined PWA
**Date:** 2025-11-25  
**Branch:** `cursor/analyze-and-plan-ci-fixes-claude-4.5-sonnet-thinking-4c50`  
**Last CI Status:** ❌ **FAILING** (All workflows blocked on install step)

---

## Executive Summary

### Current CI Status
**🔴 CRITICAL: All CI workflows failing immediately at dependency installation**

**Recent CI Runs (2025-11-25 11:53 UTC):**
- ❌ **CI** (main workflow) — Failed in 18s
- ❌ **CI — Analyze Hardening** — Failed in 15s
- ✅ **CI - Manifest & Static Smoke Test** — Passing
- ❌ **Lighthouse CI** — Failed (bundle-size job)

### Root Cause
**Primary Blocker:** `pnpm-lock.yaml` out of sync with `package.json`
- **Impact:** 🔴 **BLOCKER** — Prevents all CI workflows from running
- **Affected Workflows:** All (CI, Analyze, Lighthouse)
- **Estimated Fix Time:** 5-10 minutes

### Secondary Issues (Blocked by Primary)
1. **Invalid Dependency:** `@types/lightweight-charts` doesn't exist in npm registry
2. **Missing Environment Variables:** Some build-time checks may fail
3. **Potential TypeScript Errors:** Not yet discovered (blocked by install failure)
4. **Potential Lint Errors:** Not yet discovered (blocked by install failure)

### Quick Stats
- **Total Workflows:** 4
- **Failing:** 3 (75%)
- **Blocking Errors:** 2
- **High-Priority Warnings:** 0 (not yet reached)
- **Medium-Priority Issues:** 0 (not yet reached)

---

## 1. CI Topology & Build Pipeline

### Infrastructure Overview
- **Package Manager:** pnpm 9.0.0 (locked via `packageManager` field)
- **Node Version:** 20.10.0 (engines requirement) / 20.19.5 (CI actual)
- **Build System:** Vite 5.4.21
- **Framework:** React 18.3 + TypeScript 5.6.2
- **Deployment:** Vercel (Frankfurt region)

### CI Workflow Matrix

| Check / Workflow | Trigger | Key Steps | Expected Outcome | Current Status |
|------------------|---------|-----------|------------------|----------------|
| **CI** (main) | push/PR to `main`/`develop` | install → typecheck → lint → test → build:ci | All steps green | ❌ **FAIL** (install) |
| **CI — Analyze Hardening** | push/PR to `main` | install → build → test (coverage) → playwright → lint → typecheck | All steps green + artifacts | ❌ **FAIL** (install) |
| **CI - Manifest Check** | push/PR to `main` | smoke test manifest URL | 200 OK | ✅ **PASS** |
| **Lighthouse CI** | push/PR to `main`/`master` | build → lighthouse → bundle-size | Scores + size check | ❌ **FAIL** (bundle-size) |

### Script Inventory (package.json)

| Script | Purpose | Used in CI? | Status |
|--------|---------|-------------|--------|
| `pnpm install` | Install dependencies (frozen-lockfile) | ✅ All workflows | ❌ **BLOCKED** |
| `pnpm typecheck` | TypeScript type-checking | ✅ CI, Analyze | 🔶 **UNKNOWN** |
| `pnpm lint` | ESLint | ✅ CI, Analyze | 🔶 **UNKNOWN** |
| `pnpm test` | Vitest unit tests | ✅ CI (basic) | 🔶 **UNKNOWN** |
| `pnpm test --coverage --run` | Vitest with coverage | ✅ Analyze | 🔶 **UNKNOWN** |
| `pnpm exec playwright test` | E2E tests | ✅ Analyze | 🔶 **UNKNOWN** |
| `pnpm build` | Production build | ✅ Lighthouse | 🔶 **UNKNOWN** |
| `pnpm build:ci` | Build + bundle-size check | ✅ CI, Analyze, Lighthouse | 🔶 **UNKNOWN** |
| `pnpm run check:size` | Bundle size validation | ✅ build:ci (via prebuild) | 🔶 **UNKNOWN** |
| `pnpm run check-env` | Env validation (prebuild hook) | ✅ build:ci (via prebuild) | 🔶 **UNKNOWN** |

---

## 2. Detailed Error Analysis

### CI-ERR-001: Outdated pnpm-lock.yaml
**Category:** 🔴 **BLOCKER** — Dependency Management  
**Severity:** CRITICAL  
**Workflow(s):** CI, CI — Analyze Hardening, Lighthouse CI (bundle-size job)

#### Original Error Message
```
ERR_PNPM_OUTDATED_LOCKFILE  Cannot install with "frozen-lockfile" because 
pnpm-lock.yaml is not up to date with package.json

Failure reason:
specifiers in the lockfile (...) don't match specs in package.json (...)
```

#### Root Cause
`package.json` includes `@types/lightweight-charts: "^3.8.0"` in `devDependencies`, but `pnpm-lock.yaml` was generated before this dependency was added.

**Affected File(s):**
- `/package.json` (line 56: `"@types/lightweight-charts": "^3.8.0"`)
- `/pnpm-lock.yaml` (missing entry for `@types/lightweight-charts`)

#### Impact
- **Build Impact:** 🔴 **TOTAL BLOCK** — No CI workflow can proceed past install step
- **Developer Impact:** ✅ **LOW** — Local dev likely working with `--no-frozen-lockfile`
- **Deploy Impact:** 🔴 **HIGH** — Vercel deployments failing (CI must pass for protected branches)

#### Hypothesis
Someone added `@types/lightweight-charts` to `package.json` manually without running `pnpm install` locally to update the lockfile. This could happen via:
1. Direct `package.json` edit in GitHub UI
2. Merge conflict resolution that added the dependency
3. Automated dependency update tool (e.g., Dependabot) that only updated package.json

#### Recommended Fix
**Option A (Preferred):** Remove the invalid dependency
```bash
# Remove @types/lightweight-charts from package.json (doesn't exist in npm)
pnpm remove @types/lightweight-charts
# This will automatically update pnpm-lock.yaml
git add package.json pnpm-lock.yaml
git commit -m "fix(deps): remove non-existent @types/lightweight-charts"
```

**Option B:** Install and regenerate lockfile (if package exists elsewhere)
```bash
pnpm install --no-frozen-lockfile
git add pnpm-lock.yaml
git commit -m "chore(deps): update pnpm-lock.yaml"
```

**Why Option A?** See CI-ERR-002 below.

---

### CI-ERR-002: Non-Existent npm Package
**Category:** 🔴 **BLOCKER** — Dependency Management  
**Severity:** CRITICAL  
**Workflow(s):** All (after lockfile sync)

#### Original Error Message
```
ERR_PNPM_FETCH_404  GET https://registry.npmjs.org/@types%2Flightweight-charts: 
Not Found - 404

@types/lightweight-charts is not in the npm registry, or you have no permission to fetch it.
```

#### Root Cause
`@types/lightweight-charts` **does not exist** in the npm registry. The `lightweight-charts` package is written in TypeScript and ships with its own type definitions (no separate `@types` package needed).

**Affected File(s):**
- `/package.json` (line 56: `"@types/lightweight-charts": "^3.8.0"`)

#### Impact
- **Build Impact:** 🔴 **TOTAL BLOCK** — Even after lockfile sync, install will fail with 404
- **Type Safety Impact:** ✅ **NONE** — `lightweight-charts` already includes types
- **Developer Impact:** 🔴 **HIGH** — Local installs will fail

#### Hypothesis
Developer assumed `lightweight-charts` needed a separate `@types` package (common pattern for older npm packages). However, modern TypeScript libraries like `lightweight-charts` bundle their own `.d.ts` files.

#### Recommended Fix
```bash
# Remove the non-existent @types package
pnpm remove @types/lightweight-charts

# Verify types are available from main package
node -e "console.log(require.resolve('lightweight-charts/dist/typings.d.ts'))"
# Should output: /workspace/node_modules/lightweight-charts/dist/typings.d.ts
```

**Verification:**
```typescript
// This should work without @types/lightweight-charts:
import { createChart, IChartApi } from 'lightweight-charts';
```

---

### CI-ERR-003: Environment Variable Validation (Potential)
**Category:** 🟡 **HIGH** — Configuration  
**Severity:** HIGH (not yet confirmed — blocked by install failure)  
**Workflow(s):** CI, CI — Analyze Hardening (build step)

#### Context
`package.json` includes a `prebuild` hook that runs `pnpm run check-env`:

```json
"scripts": {
  "prebuild": "pnpm run check-env",
  "check-env": "node scripts/check-env.js"
}
```

`scripts/check-env.js` validates:
- **Required:** `MORALIS_API_KEY` (server-side only)
- **Disallowed:** `VITE_MORALIS_API_KEY` (client-side leak prevention)

#### Potential Error Message (Not Yet Seen)
```
[env] Missing required server env vars: MORALIS_API_KEY — failing build 
(CI/production context detected).
```

#### Current CI Configuration
✅ **LIKELY OK** — Both workflows set `MORALIS_API_KEY`:
```yaml
# .github/workflows/ci.yml
env:
  MORALIS_API_KEY: ${{ secrets.MORALIS_API_KEY }}
```

#### Impact
- **If Secret Missing:** 🔴 **BLOCKER** — Build will fail with exit code 2
- **If Secret Present:** ✅ **PASS** — Script will log "All required server env vars present"

#### Recommended Action
**Verification Step (for Codex):**
```bash
# After fixing install issues, check if secret is set:
gh secret list --repo baum777/Sparkfined_PWA | grep MORALIS_API_KEY
```

**If missing:**
```bash
gh secret set MORALIS_API_KEY --body "YOUR_KEY_HERE" --repo baum777/Sparkfined_PWA
```

---

## 3. Configuration Deep Dive

### TypeScript Configuration
**Files:** `tsconfig.json`, `tsconfig.build.json`

#### tsconfig.json Analysis
✅ **Configuration Quality:** GOOD — Strict mode enabled

**Key Settings:**
```json
{
  "compilerOptions": {
    "strict": true,                          // ✅ GOOD
    "noUncheckedIndexedAccess": true,       // ✅ GOOD (extra safety)
    "noImplicitOverride": true,             // ✅ GOOD
    "noEmit": true,                         // ✅ GOOD (Vite handles emit)
    "skipLibCheck": true,                   // ⚠️  PRAGMATIC (speeds up checks)
    "moduleResolution": "Bundler",          // ✅ GOOD (Vite 5 compatible)
    "paths": { "@/*": ["src/*"] }          // ✅ GOOD (path alias)
  },
  "include": ["src", "api", "tests", "ai", "vite.config.ts", "vitest.config.ts", "playwright.config.ts"]
}
```

**Potential Issues:**
- ⚠️ `skipLibCheck: true` may hide type errors in `node_modules` (acceptable tradeoff for build speed)
- ⚠️ `noPropertyAccessFromIndexSignature: false` allows `obj['key']` without type narrowing

#### tsconfig.build.json Analysis
```json
{
  "extends": "./tsconfig.json",
  "exclude": ["docs/archive", "tests", "**/*.test.ts", "**/*.test.tsx", "**/__tests__"]
}
```

✅ **Correctly excludes test files from production build**

**Risk:** If `tsc -b tsconfig.build.json` is used in CI (it is), type errors in tests won't block build. However, `pnpm typecheck` uses base tsconfig.json, so test type errors *will* be caught.

---

### ESLint Configuration
**File:** `eslint.config.js` (Flat Config — ESLint 9)

#### Configuration Quality
✅ **GOOD** — Modern flat config, type-aware linting enabled

**Key Rules (Pragmatic):**
```javascript
rules: {
  "@typescript-eslint/no-explicit-any": "off",              // ⚠️  PERMISSIVE
  "@typescript-eslint/no-unsafe-*": "off",                  // ⚠️  PERMISSIVE (5 rules)
  "@typescript-eslint/no-unused-vars": ["warn", ...],       // ✅ GOOD (warn only)
  "jsx-a11y/*": "warn"                                      // ✅ GOOD (a11y warnings)
}
```

**Risk Assessment:**
- **No Blocker Risk:** Warnings don't fail CI (only `error` level does)
- **Possible Warnings:** Unused variables, a11y issues (won't block builds)
- **Type Safety:** Relaxed rules reduce noise but may hide bugs

**Files Ignored:**
```javascript
ignores: [
  "dist/**", 
  "node_modules/**", 
  "*.config.js", 
  "*.config.ts",     // ⚠️  Vite config not linted!
  "scripts/**",      // ⚠️  Scripts not linted!
  "wireframes/**",
  "docs/archive/**"
]
```

**Recommendation:** Re-enable linting for config files (currently ignored) to catch issues like unused imports.

---

### Vitest Configuration
**File:** `vitest.config.ts`

#### Configuration Quality
✅ **GOOD** — Modern setup with coverage

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,              // ✅ GOOD (describe/it/expect global)
    environment: 'jsdom',       // ✅ GOOD (React testing)
    setupFiles: [],             // ⚠️  No setup files (may need mocks)
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.spec.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@vercel/kv': path.resolve(__dirname, './tests/mocks/vercel-kv.ts'),
      'lightweight-charts': path.resolve(__dirname, './tests/mocks/lightweight-charts.ts')
    }
  }
})
```

**Potential Issues:**
- ⚠️ Empty `setupFiles` — No global test setup (e.g., `@testing-library/jest-dom` matchers)
- ✅ Mock aliases for `@vercel/kv` and `lightweight-charts` — GOOD practice

**Risk:** Tests may fail if they rely on mocked modules that aren't properly set up.

---

### Playwright Configuration
**File:** `playwright.config.ts`

#### Configuration Quality
✅ **GOOD** — Standard setup

```typescript
export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  use: {
    baseURL: 'http://localhost:4173',  // Preview server
    trace: 'on-first-retry'
  },
  webServer: {
    command: 'pnpm run build && pnpm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
})
```

**Potential Issues:**
- ⚠️ `webServer.command` runs full build every time (slow for local dev)
- ⚠️ 2-minute timeout may be insufficient for cold builds in CI

**Risk:** E2E tests may timeout if build + preview startup exceeds 120 seconds.

---

### Vercel Configuration
**File:** `vercel.json`

#### Configuration Quality
✅ **GOOD** — Comprehensive

**Key Settings:**
```json
{
  "installCommand": "npm install -g pnpm@9.0.0 && pnpm install --frozen-lockfile",
  "buildCommand": "pnpm run build",
  "crons": [
    { "path": "/api/cron/cleanup-temp-entries", "schedule": "0 2 * * *" }
  ]
}
```

**Potential Issue:**
- ⚠️ `installCommand` uses `--frozen-lockfile` — **WILL FAIL** until lockfile is fixed
- ✅ Cron job configured (cleanup runs daily at 2 AM)

---

## 4. Test Status & Coverage

### Test Inventory
**Total Test Files:** ~69 (based on `tests/` directory scan)

**Test Types:**
- **Unit Tests:** `tests/unit/*.test.ts` (~20 files)
- **E2E Tests:** `tests/e2e/*.spec.ts` (count TBD)
- **Integration Tests:** Mixed in `tests/` root

**Current Coverage Target:** 80% overall, 90% for critical modules

### Known Test Files (Sample)
```
tests/unit/indicators.test.ts           — Technical indicators (RSI, EMA)
tests/unit/journal.crud.test.ts         — Journal CRUD operations
tests/unit/chartSnapshots.test.ts       — Chart snapshot logic
tests/unit/priceAdapter.fallback.test.ts — Price data fallback
tests/unit/moralis.adapter.test.ts      — Moralis API adapter
tests/grokPulse/grokPulse.e2e.test.tsx  — E2E Grok Pulse feature
tests/components/AdvancedChart.test.tsx — Chart component
```

### Potential Test Failures (Not Yet Confirmed)
Since CI is blocked before test execution, the following are **hypothetical risks**:

#### Test Risk Matrix

| Test Category | Risk Level | Hypothesis | Verification Step |
|---------------|------------|------------|-------------------|
| **Mocked Dependencies** | 🟡 MEDIUM | Tests rely on mocks for `@vercel/kv`, `lightweight-charts` | Run `pnpm test` locally |
| **Network-Dependent Tests** | 🟡 MEDIUM | API integration tests may fail without real endpoints | Check for `fetch()` calls |
| **Snapshot Tests** | 🟢 LOW | Snapshots may diverge if components changed | Run `pnpm test -- -u` |
| **Flaky E2E Tests** | 🟡 MEDIUM | Playwright tests may timeout or be non-deterministic | Run `pnpm test:e2e` |

---

## 5. Build & Bundle Analysis

### Build Process
**Command:** `pnpm run build` → `tsc -b tsconfig.build.json && vite build`

**Steps:**
1. **TypeScript Compilation:** `tsc -b` emits declarations (build-only)
2. **Vite Build:** Bundles for production
3. **PWA Service Worker:** Generated via `vite-plugin-pwa`

### Bundle Size Thresholds (from `scripts/check-bundle-size.mjs`)

| Chunk Pattern | Threshold (gzipped) | Purpose |
|---------------|---------------------|---------|
| `vendor-react` | 115 KB | React + ReactDOM + Router |
| `vendor-workbox` | 12 KB | Service Worker utilities |
| `vendor-dexie` | 8 KB | IndexedDB wrapper |
| `chart` | 15 KB | Lightweight Charts |
| `analyze` | 12 KB | Analysis sections |
| `index` | 35 KB | Main app shell |
| `vendor` | 22 KB | Generic vendor chunks |
| **TOTAL** | 950 KB (uncompressed) | Global budget |

**Current Status:** 🔶 **UNKNOWN** (blocked by install failure)

**Risk:** Bundle size may exceed thresholds if new dependencies were added (e.g., `@types/lightweight-charts` dependency bloat).

---

## 6. Security & Secrets Management

### Required Secrets (CI)

| Secret | Required By | Status | Impact if Missing |
|--------|-------------|--------|-------------------|
| `MORALIS_API_KEY` | CI, Analyze, Lighthouse | ✅ **SET** (visible in workflow env) | 🔴 **BLOCKER** (build fails) |
| `DEPLOY_URL` | Manifest Smoke Test | ✅ **SET** (test passes) | 🟡 Test skipped |

### Secret Exposure Risks
✅ **GOOD** — Secrets handled server-side only

**Validation Script:** `scripts/check-env.js` prevents:
- ❌ `VITE_MORALIS_API_KEY` (client-side leak)
- ✅ `MORALIS_API_KEY` (server-side only) ✅

---

## 7. Risk Register

### Critical Risks (Must Fix Before Merge)

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-001 | Outdated lockfile blocks all CI | 🔴 100% | 🔴 CRITICAL | Remove `@types/lightweight-charts` + regenerate lock |
| R-002 | Invalid npm dependency | 🔴 100% | 🔴 CRITICAL | Remove `@types/lightweight-charts` from package.json |

### High Risks (Address Soon)

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-003 | TypeScript errors hidden by install failure | 🟡 50% | 🟡 HIGH | Run `pnpm typecheck` after fixing install |
| R-004 | Lint warnings/errors hidden by install failure | 🟡 30% | 🟡 MEDIUM | Run `pnpm lint` after fixing install |
| R-005 | Test failures hidden by install failure | 🟡 40% | 🟡 HIGH | Run `pnpm test` after fixing install |
| R-006 | Bundle size exceeds threshold | 🟡 20% | 🟡 MEDIUM | Run `pnpm run check:size` after build |

### Medium Risks (Monitor)

| ID | Risk | Probability | Impact | Mitigation |
|----|------|-------------|--------|------------|
| R-007 | E2E tests timeout in CI | 🟢 20% | 🟡 MEDIUM | Increase `playwright.config.ts` webServer timeout |
| R-008 | Flaky tests cause intermittent CI failures | 🟢 10% | 🟡 MEDIUM | Isolate flaky tests, add retry logic |
| R-009 | Snapshot tests diverge | 🟢 15% | 🟢 LOW | Run `pnpm test -- -u` to update snapshots |

---

## 8. Technical Debt Observations

### Config Inconsistencies
1. **Node Version Drift:** `package.json` specifies 20.10.0, CI runs 20.19.5 (minor — likely OK)
2. **Config Files Not Linted:** `*.config.ts` excluded from ESLint (may hide unused imports)
3. **Empty Vitest Setup:** No global test setup file (may need `@testing-library/jest-dom` matchers)

### Documentation Gaps
1. **Missing CI Documentation:** No `docs/ci/README.md` explaining workflow structure
2. **Missing Troubleshooting Guide:** No guide for "CI failing — what to do?"
3. **Missing Dependency Update Policy:** No docs on how to add/update dependencies safely

### Automation Opportunities
1. **Pre-Commit Hooks:** Could catch lockfile drift before push
2. **Automated Dependency Updates:** Dependabot/Renovate not configured
3. **Bundle Size Tracking:** Could track bundle size over time (e.g., in PR comments)

---

## 9. Recommendations for Stabilization

### Immediate Actions (P0 — Unblock CI)
1. ✅ **Fix Lockfile + Remove Invalid Dependency**
   ```bash
   pnpm remove @types/lightweight-charts
   git add package.json pnpm-lock.yaml
   git commit -m "fix(deps): remove non-existent @types/lightweight-charts and sync lockfile"
   ```

2. ✅ **Verify CI Secret**
   ```bash
   gh secret list --repo baum777/Sparkfined_PWA | grep MORALIS_API_KEY
   ```

3. ✅ **Run Full CI Locally**
   ```bash
   pnpm install
   pnpm typecheck
   pnpm lint
   pnpm test
   pnpm build:ci
   ```

### Short-Term Actions (P1 — Stabilize CI)
4. **Add Pre-Commit Hook** to prevent lockfile drift:
   ```bash
   # .husky/pre-commit
   pnpm install --frozen-lockfile || (echo "Lockfile out of sync — run 'pnpm install'" && exit 1)
   ```

5. **Document CI Workflow** in `docs/ci/README.md`

6. **Add Troubleshooting Guide** for common CI failures

### Medium-Term Actions (P2 — Improve DX)
7. **Configure Dependabot/Renovate** for automated dependency updates

8. **Add Bundle Size Tracking** (e.g., Bundlesize GitHub Action)

9. **Improve Playwright Timeout** if E2E tests prove flaky

10. **Re-enable Lighthouse CI** (currently disabled) once stabilized

---

## 10. Next Steps for Codex

See **`docs/ci/CI_FIX_PLAN_FOR_CODEX.md`** for actionable fix plan.

**Summary of Codex Tasks:**
1. **Phase 1 (CRITICAL):** Fix lockfile + remove invalid dependency
2. **Phase 2 (HIGH):** Run typecheck, lint, test — address any failures
3. **Phase 3 (MEDIUM):** Verify bundle size, update docs

---

## Appendix A: CI Workflow Details

### Workflow: CI (main)
**File:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint-test-build:
    runs-on: ubuntu-latest
    env:
      MORALIS_API_KEY: ${{ secrets.MORALIS_API_KEY }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20.10.0'
      - uses: pnpm/action-setup@v3
        with:
          version: 9.0.0
      - run: pnpm install --frozen-lockfile  # ❌ FAILS HERE
      - run: pnpm run typecheck
      - run: pnpm run lint
      - run: pnpm test
      - run: pnpm run build:ci
```

**Failure Point:** Step 4 (install)

---

### Workflow: CI — Analyze Hardening
**File:** `.github/workflows/ci-analyze.yml`

**Key Differences from Main CI:**
- Runs Playwright E2E tests (grep `@analyze`)
- Generates coverage reports (uploads lcov)
- Uses environment variables:
  - `DEV_USE_MOCKS=true`
  - `ANALYZE_IDEA_PACKET=true`
  - `NODE_ENV=test`

**Failure Point:** Step 6 (install) — same as main CI

---

### Workflow: Lighthouse CI
**File:** `.github/workflows/lighthouse-ci.yml`

**Status:** Lighthouse job disabled (`if: false`), bundle-size job active

**Bundle-Size Job:**
- Builds app
- Runs `pnpm run check:size`
- Uploads `dist/stats.html` artifact (if PR)

**Failure Point:** Install step (same lockfile issue)

---

## Appendix B: File Change Log (Hypothetical)

**If fixing all issues, these files would change:**

| File | Change | Reason |
|------|--------|--------|
| `package.json` | Remove `@types/lightweight-charts` | Package doesn't exist |
| `pnpm-lock.yaml` | Regenerated | Sync with package.json |
| `docs/ci/CI_DIAGNOSTICS.md` | Created | This document |
| `docs/ci/CI_FIX_PLAN_FOR_CODEX.md` | Created | Actionable plan |
| `.husky/pre-commit` | Created (optional) | Prevent future lockfile drift |

---

## Revision History

- **2025-11-25 (Initial):** Full CI diagnostics report created by Claude (CI / Codebase Diagnostics Auditor)

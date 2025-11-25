# CI Fix Plan for Codex — Sparkfined PWA
**Target:** Get all CI checks to 🟢 GREEN  
**Date:** 2025-11-25  
**Related:** `docs/ci/CI_DIAGNOSTICS.md` (full analysis)

---

## Quick Briefing

**Goal:** Fix all blocking CI issues and stabilize the build pipeline.

**Current State:**
- ❌ **3 of 4 workflows failing** (CI, Analyze, Lighthouse)
- 🔴 **Root Cause:** `pnpm-lock.yaml` out of sync + invalid dependency `@types/lightweight-charts`
- ⏱️ **Estimated Total Time:** 30-45 minutes

**Reference:**
- Full diagnostics: `docs/ci/CI_DIAGNOSTICS.md`
- Error IDs: `CI-ERR-001` (lockfile), `CI-ERR-002` (404 dependency)

---

## Fix Phases

### Phase 1 — Hard Blockers (CI Must Run)
**Goal:** Unblock install step so CI can proceed  
**Time Estimate:** 5-10 minutes

| Task | Files/Dirs | Priority | Recommendation |
|------|------------|----------|----------------|
| **Remove invalid dependency** | `package.json` | 🔴 P0 | Remove `@types/lightweight-charts` from devDependencies |
| **Regenerate lockfile** | `pnpm-lock.yaml` | 🔴 P0 | Run `pnpm install` to sync lockfile |
| **Commit fix** | `package.json`, `pnpm-lock.yaml` | 🔴 P0 | Atomic commit: "fix(deps): remove non-existent @types/lightweight-charts" |

**Detailed Steps:**
```bash
# Step 1: Remove the invalid dependency
pnpm remove @types/lightweight-charts

# Step 2: Verify lockfile is now in sync
pnpm install --frozen-lockfile

# Step 3: Verify types still work (lightweight-charts includes its own)
# Check that this import works without @types:
# import { createChart } from 'lightweight-charts';

# Step 4: Commit the fix
git add package.json pnpm-lock.yaml
git commit -m "fix(deps): remove non-existent @types/lightweight-charts

- @types/lightweight-charts does not exist in npm registry (404)
- lightweight-charts package includes native TypeScript types
- Regenerated pnpm-lock.yaml to sync with package.json
- Fixes CI-ERR-001 (lockfile sync) and CI-ERR-002 (404 dependency)"

# Step 5: Push and verify CI
git push origin HEAD
```

**Expected Outcome:**
- ✅ `pnpm install --frozen-lockfile` succeeds in CI
- ✅ CI workflows proceed past install step
- ⚠️ May reveal new errors in subsequent steps (typecheck, lint, test)

---

### Phase 2 — Stabilization & Verification
**Goal:** Ensure all CI steps pass  
**Time Estimate:** 15-25 minutes

| Task | Command | Priority | Expected Issues | Action if Failed |
|------|---------|----------|-----------------|------------------|
| **Typecheck** | `pnpm typecheck` | 🟡 P1 | Possible TS errors now visible | Fix each error (see sub-tasks below) |
| **Lint** | `pnpm lint` | 🟡 P1 | Possible unused vars, a11y warnings | Fix errors (warnings OK) |
| **Unit Tests** | `pnpm test` | 🟡 P1 | Possible mock issues, test failures | Fix or skip flaky tests temporarily |
| **Build** | `pnpm build:ci` | 🟡 P1 | Possible bundle size issues, env errors | See sub-tasks below |
| **E2E Tests** | `pnpm test:e2e` (or Playwright in CI) | 🟡 P1 | Possible timeouts, flaky tests | Increase timeout or skip temporarily |

#### Sub-Task 2.1: TypeScript Errors
**If `pnpm typecheck` fails:**

1. **Read full error output:**
   ```bash
   pnpm typecheck 2>&1 | tee typecheck-errors.log
   ```

2. **Common error patterns & fixes:**

| Error Pattern | Example | Fix |
|---------------|---------|-----|
| `Property 'X' does not exist on type 'Y'` | Missing type import | Add type import or use type assertion |
| `Type 'X' is not assignable to type 'Y'` | Type mismatch | Fix type definition or use `as` cast |
| `Cannot find module 'X'` | Missing path alias or types | Check `tsconfig.json` paths, install missing types |
| `'X' is declared but never used` | Unused import | Remove unused import (or prefix with `_`) |

3. **Fix strategy:**
   - Fix **errors** (exit code 1) — these block builds
   - Optionally fix **warnings** (if time permits)
   - Create follow-up tickets for non-critical type improvements

#### Sub-Task 2.2: Lint Errors
**If `pnpm lint` fails:**

1. **Read full error output:**
   ```bash
   pnpm lint 2>&1 | tee lint-errors.log
   ```

2. **Common error patterns & fixes:**

| Error Pattern | Example | Fix |
|---------------|---------|-----|
| `@typescript-eslint/no-unused-vars` | Unused variable | Remove or prefix with `_` |
| `jsx-a11y/alt-text` | Missing alt text on `<img>` | Add `alt="..."` attribute |
| `import/no-unresolved` | Cannot resolve import | Fix import path or add to eslint ignore |

3. **Fix strategy:**
   - Fix **errors** only (ESLint config has most rules as `warn`)
   - Review warnings but don't block merge
   - Use `// eslint-disable-next-line` sparingly (document why)

#### Sub-Task 2.3: Test Failures
**If `pnpm test` fails:**

1. **Read failure report:**
   ```bash
   pnpm test --reporter=verbose 2>&1 | tee test-failures.log
   ```

2. **Common failure patterns:**

| Failure Pattern | Example | Fix |
|-----------------|---------|-----|
| `ReferenceError: X is not defined` | Missing global mock | Add to `vitest.config.ts` setupFiles |
| `TypeError: Cannot read property 'X' of undefined` | Mock not properly initialized | Check mock in `tests/mocks/` |
| `Timeout of 5000ms exceeded` | Async test not awaiting | Add `await` or increase timeout |
| `expect(X).toBe(Y) // received: Z` | Assertion failure | Fix test or code logic |

3. **Fix strategy:**
   - Fix **blocking failures** (tests that prevent build)
   - Mark **flaky tests** as `test.skip()` temporarily (create follow-up ticket)
   - Update **snapshots** if intentional changes: `pnpm test -- -u`

#### Sub-Task 2.4: Build Failures
**If `pnpm build:ci` fails:**

1. **Check for env validation error:**
   ```bash
   # If error: "Missing required server env vars: MORALIS_API_KEY"
   gh secret list --repo baum777/Sparkfined_PWA | grep MORALIS_API_KEY
   ```

   **If missing:**
   ```bash
   gh secret set MORALIS_API_KEY --body "YOUR_KEY_HERE" --repo baum777/Sparkfined_PWA
   ```

2. **Check for bundle size error:**
   ```bash
   # If error: "Bundle size exceeds threshold"
   pnpm run analyze  # Opens visualization in browser
   ```

   **Fix:**
   - Identify large dependencies in bundle visualizer
   - Consider lazy loading heavy components
   - Update thresholds in `scripts/check-bundle-size.mjs` if justified

3. **Check for build-time errors:**
   - Read Vite build output for errors
   - Common issues: missing env vars, SSR-incompatible code (window/document in server context)

---

### Phase 3 — Cleanup & Documentation
**Goal:** Prevent future issues, document fixes  
**Time Estimate:** 10-15 minutes

| Task | Files | Priority | Recommendation |
|------|-------|----------|----------------|
| **Update CI docs** | `docs/ci/README.md` (create if missing) | 🟢 P2 | Document workflow structure, common fixes |
| **Add pre-commit hook** | `.husky/pre-commit` (optional) | 🟢 P2 | Prevent lockfile drift |
| **Verify all workflows** | GitHub Actions UI | 🟡 P1 | Check all 4 workflows pass |
| **Clean up branches** | GitHub UI | 🟢 P3 | Close stale PRs if any |

#### Sub-Task 3.1: Create CI README
**File:** `docs/ci/README.md`

```markdown
# CI/CD Documentation — Sparkfined PWA

## Workflows

### CI (Main)
- **Triggers:** Push/PR to `main` or `develop`
- **Steps:** install → typecheck → lint → test → build
- **Duration:** ~2-3 minutes (cached)

### CI — Analyze Hardening
- **Triggers:** Push/PR to `main`
- **Steps:** install → build → test (coverage) → playwright → lint → typecheck
- **Artifacts:** Coverage reports, Playwright traces
- **Duration:** ~5-7 minutes

### CI - Manifest Check
- **Triggers:** Push/PR to `main`
- **Steps:** Smoke test manifest URL
- **Duration:** ~10 seconds

### Lighthouse CI
- **Triggers:** Push/PR to `main` (lighthouse disabled, bundle-size active)
- **Steps:** build → bundle-size check → lighthouse (disabled)
- **Duration:** ~3-4 minutes

## Common Failures & Fixes

### "pnpm-lock.yaml is not up to date"
**Cause:** Dependency added/removed without updating lockfile  
**Fix:**
```bash
pnpm install  # Regenerates lockfile
git add pnpm-lock.yaml
git commit -m "chore(deps): update lockfile"
```

### "Missing required server env vars: MORALIS_API_KEY"
**Cause:** Secret not set in GitHub repo  
**Fix:**
```bash
gh secret set MORALIS_API_KEY --body "YOUR_KEY" --repo baum777/Sparkfined_PWA
```

### "Bundle size exceeds threshold"
**Cause:** New dependencies increased bundle size  
**Fix:**
1. Run `pnpm run analyze` to visualize bundle
2. Lazy load heavy components or update thresholds in `scripts/check-bundle-size.mjs`

## Pre-Commit Checklist

Before pushing:
1. ✅ Run `pnpm typecheck`
2. ✅ Run `pnpm lint`
3. ✅ Run `pnpm test`
4. ✅ Run `pnpm build` (or `pnpm build:ci` for full check)
5. ✅ Verify lockfile is in sync: `pnpm install --frozen-lockfile`
```

#### Sub-Task 3.2: Add Pre-Commit Hook (Optional)
**File:** `.husky/pre-commit`

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

echo "🔍 Pre-commit: Checking lockfile sync..."
pnpm install --frozen-lockfile || {
  echo "❌ pnpm-lock.yaml is out of sync with package.json"
  echo "💡 Run 'pnpm install' to regenerate lockfile"
  exit 1
}

echo "✅ Lockfile is in sync"
```

**Setup:**
```bash
# Install husky (if not already installed)
pnpm add -D husky

# Initialize husky
npx husky install

# Create pre-commit hook
npx husky add .husky/pre-commit "pnpm install --frozen-lockfile || exit 1"

# Make executable
chmod +x .husky/pre-commit

# Commit
git add .husky/pre-commit
git commit -m "chore(ci): add pre-commit hook to prevent lockfile drift"
```

---

## Detailed Task List (Copy-Paste Checklist)

### ✅ Phase 1: Hard Blockers (MUST DO)

- [ ] **P1.1** Remove `@types/lightweight-charts` from `package.json`
  ```bash
  pnpm remove @types/lightweight-charts
  ```

- [ ] **P1.2** Verify lockfile sync
  ```bash
  pnpm install --frozen-lockfile
  ```

- [ ] **P1.3** Commit fix
  ```bash
  git add package.json pnpm-lock.yaml
  git commit -m "fix(deps): remove non-existent @types/lightweight-charts"
  git push origin HEAD
  ```

- [ ] **P1.4** Wait for CI to run (check GitHub Actions UI)

---

### ⚠️ Phase 2: Stabilization (IF P1 reveals issues)

- [ ] **P2.1** Run local typecheck
  ```bash
  pnpm typecheck 2>&1 | tee typecheck-errors.log
  ```
  - [ ] If errors: Fix each TypeScript error
  - [ ] Commit fixes: `git commit -m "fix(types): resolve typecheck errors"`

- [ ] **P2.2** Run local lint
  ```bash
  pnpm lint 2>&1 | tee lint-errors.log
  ```
  - [ ] If errors: Fix lint errors (warnings OK to ignore)
  - [ ] Commit fixes: `git commit -m "fix(lint): resolve linter errors"`

- [ ] **P2.3** Run local tests
  ```bash
  pnpm test --reporter=verbose 2>&1 | tee test-failures.log
  ```
  - [ ] If failures: Fix test failures or mark flaky tests as `skip`
  - [ ] Commit fixes: `git commit -m "fix(tests): resolve test failures"`

- [ ] **P2.4** Run local build
  ```bash
  pnpm build:ci
  ```
  - [ ] If env error: Set `MORALIS_API_KEY` secret in GitHub
  - [ ] If bundle size error: Run `pnpm run analyze`, optimize or update thresholds
  - [ ] Commit fixes: `git commit -m "fix(build): resolve build errors"`

- [ ] **P2.5** Verify E2E tests (if applicable)
  ```bash
  pnpm run build && pnpm run preview &
  pnpm test:e2e
  ```
  - [ ] If failures: Fix or mark flaky tests as `skip`
  - [ ] Commit fixes: `git commit -m "fix(e2e): resolve playwright failures"`

---

### 🧹 Phase 3: Cleanup (NICE TO HAVE)

- [ ] **P3.1** Create CI README
  - [ ] Create `docs/ci/README.md` (see template above)
  - [ ] Commit: `git commit -m "docs(ci): add CI troubleshooting guide"`

- [ ] **P3.2** Add pre-commit hook (optional)
  - [ ] Install husky: `pnpm add -D husky`
  - [ ] Create `.husky/pre-commit` (see template above)
  - [ ] Commit: `git commit -m "chore(ci): add lockfile pre-commit hook"`

- [ ] **P3.3** Verify all workflows pass
  - [ ] Check GitHub Actions UI for all 4 workflows
  - [ ] Confirm all are 🟢 GREEN

- [ ] **P3.4** Update this plan with actual findings
  - [ ] Document any unexpected issues in `CI_DIAGNOSTICS.md`
  - [ ] Commit: `git commit -m "docs(ci): update diagnostics with real findings"`

---

## Quick Reference: Error ID → Fix

| Error ID | Error | Fix Command | Files |
|----------|-------|-------------|-------|
| CI-ERR-001 | Lockfile out of sync | `pnpm install` | `pnpm-lock.yaml` |
| CI-ERR-002 | `@types/lightweight-charts` 404 | `pnpm remove @types/lightweight-charts` | `package.json`, `pnpm-lock.yaml` |
| CI-ERR-003 | Missing `MORALIS_API_KEY` | `gh secret set MORALIS_API_KEY` | GitHub Secrets |
| (TBD) | TypeScript error | Fix type error | Source file(s) |
| (TBD) | Lint error | Fix lint issue | Source file(s) |
| (TBD) | Test failure | Fix test or skip | Test file(s) |
| (TBD) | Bundle size exceeded | Optimize or update threshold | `scripts/check-bundle-size.mjs` |

---

## Expected Outcomes by Phase

### After Phase 1 (Install Fix)
✅ **Immediate:**
- CI workflows proceed past install step
- `pnpm install --frozen-lockfile` succeeds locally and in CI

⚠️ **Possible Next Issues:**
- TypeScript errors (now visible)
- Lint errors (now visible)
- Test failures (now visible)
- Build errors (now visible)

### After Phase 2 (Stabilization)
✅ **Complete:**
- All CI workflows pass (🟢 GREEN)
- Local `pnpm build:ci` succeeds
- No blocking errors remain

⚠️ **Acceptable Warnings:**
- Lint warnings (a11y, unused vars)
- Bundle size warnings (if < 95% of threshold)

### After Phase 3 (Cleanup)
✅ **Long-Term:**
- CI is documented and maintainable
- Pre-commit hook prevents future lockfile drift
- Team can troubleshoot CI issues independently

---

## Rollback Plan (If Things Go Wrong)

If fixes introduce new problems:

```bash
# Revert to last known good commit
git reset --hard HEAD~1

# Or revert specific commits
git revert <commit-sha>

# Force push (if already pushed — use with caution)
git push origin HEAD --force-with-lease
```

**Alternative:** Create a new branch, fix there, and merge after verification.

---

## Communication Template (for PR/Commit)

### Commit Message Template
```
fix(ci): unblock CI workflows by removing invalid dependency

- Remove non-existent @types/lightweight-charts (404 in npm)
- Regenerate pnpm-lock.yaml to sync with package.json
- Verify types still work (lightweight-charts includes native TS types)

Fixes:
- CI-ERR-001: Lockfile out of sync
- CI-ERR-002: @types/lightweight-charts 404

Workflows affected:
- CI (main)
- CI — Analyze Hardening
- Lighthouse CI (bundle-size job)

Tested locally:
- pnpm install --frozen-lockfile ✅
- pnpm typecheck ✅
- pnpm lint ✅
- pnpm test ✅
- pnpm build:ci ✅
```

### PR Description Template
```markdown
## 🎯 Goal
Fix all failing CI workflows by resolving dependency management issues.

## 🔴 Problem
- All CI workflows failing at install step
- Root cause: `pnpm-lock.yaml` out of sync with `package.json`
- Invalid dependency: `@types/lightweight-charts` (404 in npm)

## ✅ Solution
- Removed `@types/lightweight-charts` (doesn't exist, library has native types)
- Regenerated `pnpm-lock.yaml`
- Verified types still work without @types package

## 🧪 Testing
- [x] Local install: `pnpm install --frozen-lockfile`
- [x] Typecheck: `pnpm typecheck`
- [x] Lint: `pnpm lint`
- [x] Tests: `pnpm test`
- [x] Build: `pnpm build:ci`
- [x] CI workflows: [Link to successful run]

## 📊 Impact
- Unblocks 3 failing workflows
- No type safety regression (library has native types)
- CI now passes end-to-end

## 📚 Related
- Diagnostics: `docs/ci/CI_DIAGNOSTICS.md`
- Fix plan: `docs/ci/CI_FIX_PLAN_FOR_CODEX.md`
```

---

## Support & Escalation

**If stuck:**
1. Review full diagnostics: `docs/ci/CI_DIAGNOSTICS.md`
2. Check CI logs in GitHub Actions UI
3. Run commands locally to reproduce
4. Document new findings in diagnostics
5. Escalate to team if blocker can't be resolved

**Contact:**
- **Repo Owner:** baum777
- **GitHub Issues:** [Link to issue tracker]

---

## Revision History

- **2025-11-25 (Initial):** Created by Claude (CI Diagnostics Auditor) as actionable fix plan for Codex

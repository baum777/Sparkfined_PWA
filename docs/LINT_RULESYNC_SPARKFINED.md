# Sparkfined PWA – Lint RuleSync & Pattern Guide (v1.0)

**Created:** 2025-11-28  
**Purpose:** Synchronize de-facto code patterns with official ESLint/TypeScript rules, document common violations, and provide actionable fix patterns for Codex.

---

## 1. Toolchain Overview

### 1.1 ESLint Configuration

**File:** `eslint.config.js` (Flat Config)

**Base Extends:**
- `@eslint/js` (recommended)
- `typescript-eslint` (recommendedTypeChecked)
- `eslint-plugin-react`
- `eslint-plugin-jsx-a11y`

**Project Parser:**
- TypeScript ESLint Parser with `tsconfig.json` project reference
- Type-aware linting enabled for `.ts` and `.tsx` files

**Key Rule Overrides (Pragmatic Approach):**

```javascript
// TypeScript – Relaxed for Pragmatism
"@typescript-eslint/no-explicit-any": "off"              // ✅ Allowed (19 instances in codebase)
"@typescript-eslint/no-unsafe-*": "off"                  // ✅ All unsafe-* rules disabled
"@typescript-eslint/no-floating-promises": "off"         // ⚠️ Risk: unhandled promise rejections
"@typescript-eslint/no-misused-promises": "off"
"@typescript-eslint/no-unused-vars": "warn"              // ✅ Warns, not blocks (with _-prefix ignore)

// React
"react/react-in-jsx-scope": "off"                        // ✅ React 18 JSX transform

// A11y
"jsx-a11y/*": "warn"                                     // ✅ Warnings only, not blocking
```

**Ignored Paths:**
- `dist/`, `node_modules/`, `*.config.*`, `scripts/`, `wireframes/`, `docs/archive/`, `ai/`, `middleware.ts`

---

### 1.2 TypeScript Configuration

**File:** `tsconfig.json`

**Strictness (VERY HIGH):**

```json
{
  "strict": true,                           // ✅ All strict checks enabled
  "noUncheckedIndexedAccess": true,         // ⚠️ [0] returns T | undefined
  "noImplicitOverride": true,
  "noPropertyAccessFromIndexSignature": false
}
```

**Critical Impact of `noUncheckedIndexedAccess`:**
- **Every** array access `arr[0]`, `obj[key]` returns `T | undefined`
- Requires explicit guards or `.at()` with null-checks
- **59 instances** of `[0]`/`[1]`/`.at()` in codebase → potential violations

---

### 1.3 Testing Stack

**Frameworks:**
- **Unit/Component:** Vitest + @testing-library/react
- **E2E:** Playwright

**Assertion Libraries:**
- **Vitest:** `.toBeTruthy()`, `.toEqual()`, `.toBeNull()`, etc.
- **Chai (Legacy, being phased out):** `.to.exist`, `.to.be.null`, `.to.contain`

**Current State:**
- **117 Vitest assertions** (✅ modern)
- **10 Chai assertions** (⚠️ migration ~92% complete)

---

## 2. Top Lint / Pattern Issues

### 2.1 Type Safety – `possibly undefined` (Array/Object Access)

**Rule:** TypeScript TS18048 / TS2532 + `noUncheckedIndexedAccess`

**Symptom:** Compiler errors when accessing arrays/objects without guards.

**Examples:**

```typescript
// ❌ BEFORE (fails with noUncheckedIndexedAccess)
const first = entries[0]
const ticker = first.ticker  // Error: Object is possibly 'undefined'

// ✅ AFTER – Option 1: Guard
const first = entries[0]
if (!first) {
  throw new Error('Expected at least one entry')
}
const ticker = first.ticker  // OK

// ✅ AFTER – Option 2: Optional Chaining
const ticker = entries[0]?.ticker
if (!ticker) {
  return fallback
}

// ✅ AFTER – Option 3: Destructuring with Guard
const [first, second] = entries
if (!first || !second) {
  throw new Error('Expected at least two entries')
}
expect(first.id).toBe('entry-1')
```

**Where Found:**
- `src/lib/priceAdapter.ts` – Mapping API responses (any[])
- `src/lib/journal/journal-mapping.ts` – deriveTicker() uses tags[0]
- `tests/unit/*.test.ts` – Array destructuring in assertions

**Fix Pattern:**
1. **Early return/throw** for critical paths
2. **Optional chaining** for nullable flows
3. **Destructuring + Guard** for test assertions

**Do:**
- ✅ `if (!value) throw new Error('...')` before access
- ✅ `Array.prototype.at(0)` + null-check
- ✅ Use `.find()` + guard instead of `[0]` when semantic match matters

**Don't:**
- ❌ `value!` (non-null assertion) – hides bugs
- ❌ `as any` to silence errors
- ❌ Disable `noUncheckedIndexedAccess` – defeats type safety

---

### 2.2 Type Safety – Store vs Domain Type Mapping

**Symptom:** Mismatch between `@/store/journalStore.JournalEntry` (UI/store) and `@/types/journal.JournalEntry` (domain/AI).

**Example:**

```typescript
// ❌ BEFORE – Inline mapping, duplication risk
const domainEntries = storeEntries.map((entry) => ({
  id: entry.id,
  ticker: entry.tags?.[0]?.toUpperCase() ?? 'MANUAL',  // Fragile
  // ... 15 more fields with fallbacks
}))

// ✅ AFTER – Centralized helper
import { mapStoreEntriesToDomain } from '@/lib/journal/journal-mapping'

const domainEntries = mapStoreEntriesToDomain(storeEntries)
```

**Where Found:**
- `src/components/journal/JournalInsightsPanel.tsx` (now uses helper ✅)
- Future: Any component calling AI services with journal data

**Fix Pattern:**
- **Central mapping module:** `src/lib/journal/journal-mapping.ts`
- **Tests for edge cases:** Empty arrays, missing journeyMeta, etc.

**Do:**
- ✅ Use `mapStoreEntriesToDomain()` for all AI/analytics flows
- ✅ Keep store types minimal (UI-focused)
- ✅ Keep domain types complete (business-logic-focused)

**Don't:**
- ❌ Copy-paste mapping logic into components
- ❌ Use `as DomainJournalEntry` without validation

---

### 2.3 React Hooks – Dependency Arrays & URL/State Sync

**Rules:** 
- `react-hooks/exhaustive-deps` (disabled in config, but de-facto pattern enforced)
- Custom project pattern: URL ↔ State single source of truth

**Symptom:** Infinite re-render loops when URL state and component state fight.

**Example (URL/State Sync):**

```typescript
// ❌ BEFORE – Potential loop
useEffect(() => {
  if (entryFromUrl !== activeId) {
    setActiveId(entryFromUrl)
    setSearchParams({ entry: entryFromUrl })  // ⚠️ Triggers URL change → loop
  }
}, [entryFromUrl, activeId, setSearchParams])

// ✅ AFTER – Clear separation
// 1. URL → State (mount only, or explicit URL listener)
useEffect(() => {
  if (!entries.length) return
  
  if (entryFromUrl && entries.some(e => e.id === entryFromUrl)) {
    if (entryFromUrl !== activeId) {
      setActiveId(entryFromUrl)  // Only state update, NO URL write
    }
    return
  }
  
  const fallback = entries[0]
  if (fallback && (!activeId || !entries.some(e => e.id === activeId))) {
    setActiveId(fallback.id)
  }
}, [entries, entryFromUrl, activeId, setActiveId])

// 2. State → URL (in click handlers only)
const handleEntryClick = useCallback((id: string) => {
  setActiveId(id)
  setSearchParams({ entry: id })  // Explicit user action
}, [setActiveId, setSearchParams])
```

**Where Found:**
- `src/pages/JournalPageV2.tsx` (✅ pattern implemented correctly)
- `src/pages/AnalysisPageV2.tsx` (similar URL sync)

**Fix Pattern:**
1. **Mount-only init:** Use `useRef` to track first load
2. **URL → State:** In `useEffect`, read URL params, update state (NO URL writes)
3. **State → URL:** In event handlers (clicks, form submits), update both

**Do:**
- ✅ Separate URL listeners from state setters
- ✅ Use `useMemo` for derived URL params
- ✅ Guard against empty arrays before accessing `[0]`

**Don't:**
- ❌ Write to both state AND URL in the same `useEffect`
- ❌ Use `// eslint-disable react-hooks/exhaustive-deps` as workaround

---

### 2.4 Testing – Assertion Library Migration (Chai → Vitest)

**Symptom:** ESLint `no-unused-expressions` errors with Chai getters.

**Example:**

```typescript
// ❌ BEFORE – Chai getter (ESLint: unused expression)
expect(element).to.exist        // Property access, not function call
expect(value).to.be.null

// ✅ AFTER – Vitest matcher (function call)
expect(element).toBeTruthy()    // Explicit function call
expect(value).toBeNull()
```

**Where Found:**
- `tests/components/JournalSocialPreview.test.tsx` (fixed ✅)
- `tests/components/JournalInsightsPanel.test.tsx` (fixed ✅)
- `tests/integration/journal.journal-insights-realistic.test.ts` (fixed ✅)

**Migration Map:**

| Chai | Vitest | Notes |
|------|--------|-------|
| `.to.exist` | `.toBeTruthy()` | Checks truthy value |
| `.to.be.null` | `.toBeNull()` | Explicit null check |
| `.to.be.undefined` | `.toBeUndefined()` | Explicit undefined check |
| `.to.equal(x)` | `.toBe(x)` or `.toEqual(x)` | Strict vs deep |
| `.to.contain(x)` | `.toContain(x)` | Array/string inclusion |

**Fix Pattern:**
- Global search for `.to.exist`, `.to.be.null`, `.to.contain`
- Replace with Vitest equivalents
- No functional change, just API syntax

**Do:**
- ✅ Use Vitest matchers for all new tests
- ✅ Migrate Chai on file-by-file basis (low risk)

**Don't:**
- ❌ Mix Chai and Vitest in same file (confusing)
- ❌ Use `// @ts-ignore` to hide Chai type errors

---

### 2.5 Code Hygiene – Unused Imports/Variables

**Rule:** `@typescript-eslint/no-unused-vars: "warn"`

**Symptom:** Imports/variables declared but never used (clutters code, slows builds).

**Example:**

```typescript
// ❌ BEFORE
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
// ... test code never uses afterEach

const mockCursor = { delete: vi.fn(), continue: vi.fn() }
// ... mock never used in test

mockIndex.openCursor.mockImplementation((range) => ({ ... }))
// ... 'range' parameter unused

// ✅ AFTER
import { describe, it, expect, beforeEach, vi } from 'vitest'  // afterEach removed

// mockCursor removed entirely

mockIndex.openCursor.mockImplementation((_range) => ({ ... }))  // _ prefix signals intentional
```

**Where Found:**
- `tests/unit/journal.journal-insights-store.test.ts` (fixed ✅)
- `src/state/settings.tsx` (1 intentional eslint-disable for destructure ignore)

**Fix Pattern:**
1. **Remove** unused imports (safe refactor)
2. **Remove** unused variables (verify no side-effects first)
3. **Prefix with `_`** if parameter required by signature but unused

**Do:**
- ✅ Clean up imports on every PR
- ✅ Use `_paramName` for unused function params
- ✅ Run `pnpm run lint` before commit

**Don't:**
- ❌ Leave debug imports (`import { log } from './debug'`)
- ❌ Keep "aspirational" imports for future features

---

### 2.6 Pragmatic `any` Usage

**Rule:** `@typescript-eslint/no-explicit-any: "off"` (project policy)

**Symptom:** `any` used for quick prototyping or complex external API types.

**Current State:**
- **19 instances** of `: any` in codebase
- Concentrated in:
  - `src/lib/priceAdapter.ts` (API responses: `any[]`)
  - `src/lib/adapters/*.ts` (external API adapters)
  - `src/hooks/useBoardKPIs.ts`, `useBoardFeed.ts`

**Example (API Adapters):**

```typescript
// ✅ ACCEPTABLE – External API with unknown/changing schema
const mapDexPaprikaCandles = (rows: any[]): Candle[] =>
  rows
    .map((row) => ({
      time: Math.floor(new Date(row.timestamp ?? row.time ?? row[0]).getTime() / 1000),
      open: Number(row.open ?? row[1]),
      // ... defensive parsing
    }))
    .filter((candle) => Number.isFinite(candle.time))

// ⚠️ IMPROVEMENT – Define minimal interface
interface DexPaprikaRawCandle {
  timestamp?: string | number
  time?: string | number
  open?: string | number
  // ... known fields
  [key: string]: unknown  // Index signature for flexibility
}

const mapDexPaprikaCandles = (rows: DexPaprikaRawCandle[]): Candle[] => ...
```

**Fix Pattern (Pragmatic):**
- **Short-term:** `any` is acceptable for:
  - External API adapters (DexPaprika, Moralis, etc.)
  - Event payloads (third-party libraries)
  - Rapid prototyping (with TODO comment)
- **Long-term:** Replace with:
  - Minimal interface (known fields + index signature)
  - `unknown` + runtime validation (Zod/Yup)

**Do:**
- ✅ Track `any` usage with TODO comments
- ✅ Isolate `any` in adapter/boundary layers
- ✅ Add runtime validation for critical flows

**Don't:**
- ❌ Use `any` in domain/business logic
- ❌ Cast `unknown as any` without comment
- ❌ Spread `any` types across modules

---

### 2.7 Console Logging

**Rule:** No explicit ESLint rule (console allowed)

**Current State:**
- **241 instances** of `console.log/warn/error` in codebase
- Mostly legitimate (error handling, telemetry, debugging)

**Example:**

```typescript
// ✅ ACCEPTABLE – Error logging
catch (error) {
  console.error('[JournalInsights] AI call failed:', error)
  return { insights: [], error: 'AI service unavailable' }
}

// ✅ ACCEPTABLE – Dev-only debug
if (import.meta.env.DEV) {
  console.log('[ChartSync] State updated:', newState)
}

// ⚠️ REVIEW – Production noise
console.log('User clicked button')  // Use telemetry instead
```

**Fix Pattern:**
- **Keep:** Error logs (`console.error`), warnings (`console.warn`)
- **Keep:** Dev-only logs (gated by `import.meta.env.DEV`)
- **Replace:** User actions → Telemetry events
- **Remove:** Temporary debug logs before commit

**Do:**
- ✅ Prefix logs with component/module name: `[JournalInsights]`
- ✅ Use structured logging for errors (object with context)
- ✅ Gate verbose logs with env check

**Don't:**
- ❌ Log sensitive data (API keys, user PII)
- ❌ Leave uncommitted debug logs (`console.log('HERE')`)

---

### 2.8 TODO/FIXME Comments

**Current State:**
- **18 instances** of TODO/FIXME/HACK comments
- Concentrated in:
  - `src/lib/wallet/transaction-monitor.ts` (4)
  - `src/lib/data/getTokenSnapshot.ts` (3)
  - `src/lib/analysis/setup-detector.ts` (3)

**Example:**

```typescript
// ✅ GOOD TODO – Actionable, tracked
// TODO(J4): Replace mock data with real Solana NFT check
if (import.meta.env.VITE_BYPASS_ACCESS === 'true') {
  return { hasAccess: true }
}

// ⚠️ VAGUE TODO – No context
// TODO: Fix this later
const result = hackyWorkaround(data)
```

**Fix Pattern:**
1. **Review** each TODO: Is it still relevant?
2. **Link** to GitHub issue if complex (e.g., `TODO(#123)`)
3. **Remove** if already fixed
4. **Escalate** if blocking feature

**Do:**
- ✅ Add context: Why is this TODO here?
- ✅ Link to ticket/epic if multi-step
- ✅ Mark critical TODOs with severity (`TODO(CRITICAL)`)

**Don't:**
- ❌ Use TODO as excuse for bad code
- ❌ Leave TODOs without owner/timeline

---

## 3. Handoff for Codex

### 3.1 Fix Cluster Prioritization

**Cluster 1: Type Safety (High Impact, Medium Effort)**

**Scope:**
- All `possibly undefined` violations in:
  - `src/lib/priceAdapter.ts`
  - `src/lib/journal/*.ts`
  - `src/hooks/*.ts`
  - `tests/unit/*.test.ts`

**Fix Approach:**
1. Scan for `[0]`, `[1]`, `.at()` without guards
2. Add guards (early return, optional chaining, or destructure + check)
3. Update tests to cover edge cases (empty arrays, undefined props)

**Success Criteria:**
- `pnpm run typecheck` passes with no TS18048/TS2532 errors
- No new `!` (non-null assertions) introduced
- Test coverage maintained or improved

---

**Cluster 2: Test Assertions Migration (Low Risk, Low Effort)**

**Scope:**
- Remaining **10 Chai assertions** in test files

**Fix Approach:**
1. Global search: `.to.exist`, `.to.be.null`, `.to.contain`, etc.
2. Replace with Vitest equivalents (see §2.4 Migration Map)
3. Run tests to verify no behavior change

**Success Criteria:**
- `pnpm run test` passes (no regressions)
- Zero Chai imports remaining in `tests/`
- ESLint `no-unused-expressions` errors eliminated

---

**Cluster 3: Code Hygiene (Low Impact, Low Effort)**

**Scope:**
- Unused imports/variables flagged by ESLint warnings

**Fix Approach:**
1. Run `pnpm run lint` to get full list
2. Remove unused imports (safe)
3. Prefix unused params with `_` (if required by signature)
4. Remove debug variables (verify no side-effects)

**Success Criteria:**
- `pnpm run lint` shows 0 warnings (or only intentional ones)
- No functional changes to code

---

**Cluster 4: API Adapter Type Safety (Long-term, Optional)**

**Scope:**
- Replace `any[]` in API adapters with minimal interfaces
- Files: `src/lib/priceAdapter.ts`, `src/lib/adapters/*.ts`

**Fix Approach:**
1. Define minimal interfaces for known API fields
2. Add index signature `[key: string]: unknown` for flexibility
3. Keep defensive parsing (Number(), fallbacks)

**Success Criteria:**
- Less reliance on `any` (tracked via grep)
- No runtime behavior changes
- Type hints available in editor

---

### 3.2 Working Guidelines for Codex

**General Principles:**

1. **Never Weaken Rules to Fix Errors**
   - ❌ Don't add `// @ts-ignore` or `// eslint-disable`
   - ❌ Don't relax `tsconfig.json` strictness
   - ✅ Fix the code, not the linter

2. **Test-Driven Fixes**
   - For any behavior change, add/update tests first
   - Run `pnpm run test` after every cluster
   - Verify E2E tests still pass (`pnpm run test:e2e`)

3. **Incremental Progress**
   - Fix one cluster at a time
   - Commit after each cluster (or per-file if large)
   - No giant "lint cleanup" PRs (hard to review)

4. **Pattern Consistency**
   - Follow existing patterns in codebase
   - Reuse helpers (e.g., `mapStoreEntriesToDomain`)
   - Don't introduce new libraries/dependencies

5. **Documentation**
   - Update this RuleSync doc if new patterns emerge
   - Add inline comments for non-obvious fixes

---

### 3.3 Lint Playbook (Quick Reference)

**Before Every Commit:**

```bash
# 1. Type check
pnpm run typecheck

# 2. Lint
pnpm run lint

# 3. Tests
pnpm run test

# 4. Build smoke test
pnpm run build
```

**For New Code:**

- ✅ Define types FIRST (interfaces, unions)
- ✅ Use `mapStoreEntriesToDomain` for journal data
- ✅ Guard all array accesses (`[0]` → guard or `?.`)
- ✅ Vitest matchers for tests (`.toBeTruthy()`, not `.to.exist`)
- ✅ URL/State sync: separate listeners from setters

**Common Pitfalls to Avoid:**

- ❌ `value!` (non-null assertion) – use guards instead
- ❌ `as any` casting – use `unknown` + validation
- ❌ Chai matchers – migrate to Vitest
- ❌ URL/State loops – read §2.3 pattern
- ❌ Unused imports – clean up before commit

---

### 3.4 Next Steps (Post-Cleanup)

**After Clusters 1-3 Complete:**

1. **Enable Stricter Rules** (Optional):
   - Consider re-enabling `@typescript-eslint/no-floating-promises`
   - Add React Hooks exhaustive-deps warnings

2. **Pre-commit Hooks** (Recommended):
   - Add Husky + lint-staged
   - Auto-run `pnpm run lint --fix` on staged files

3. **CI Checks** (Already Implemented):
   - Lint must pass in GitHub Actions
   - TypeCheck must pass
   - Test coverage maintained

4. **Monitoring**:
   - Track `any` count over time (goal: <10)
   - Track TODO count (goal: <10 critical)
   - Monitor bundle size (already tracked)

---

## 4. Appendix

### 4.1 File Hotspots (Most Likely to Need Fixes)

**Type Safety:**
- `src/lib/priceAdapter.ts` (4 `[index]` accesses, 2 `any[]`)
- `src/lib/journal/journal-mapping.ts` (2 `[index]` accesses)
- `src/store/journalStore.ts` (2 `[index]` accesses)

**Hooks/Effects:**
- `src/pages/JournalPageV2.tsx` (13 hooks, complex URL sync)
- `src/pages/AnalysisPageV2.tsx` (4 hooks)
- `src/hooks/useSignals.ts` (10 hooks)

**Tests (Chai Migration):**
- `tests/components/JournalSocialPreview.test.tsx` (5 Chai → fixed ✅)
- `tests/components/JournalJourneyBanner.test.tsx` (3 Chai)

### 4.2 ESLint Config Reference

**Full Config:** `eslint.config.js`

**Key Disabled Rules (and Why):**

| Rule | Reason |
|------|--------|
| `no-explicit-any` | Pragmatic for API adapters (19 instances) |
| `no-unsafe-*` | Too strict for real-world external APIs |
| `no-floating-promises` | Many fire-and-forget patterns (telemetry, cache) |
| `react-hooks/exhaustive-deps` | Custom URL/State pattern requires manual oversight |

**Key Enabled Rules:**

| Rule | Severity | Impact |
|------|----------|--------|
| `@typescript-eslint/no-unused-vars` | warn | Catches dead code |
| `jsx-a11y/*` | warn | Accessibility hints (non-blocking) |

### 4.3 TypeScript Strictness Impact

**`strict: true` enables:**
- `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`, `noImplicitThis`, `alwaysStrict`

**`noUncheckedIndexedAccess: true` impact:**
- **Every** `obj[key]` or `arr[index]` returns `T | undefined`
- Requires explicit guards or optional chaining
- Catches 90% of runtime "cannot read property of undefined" bugs

**Trade-off:**
- ✅ Prevents runtime crashes
- ⚠️ Requires more boilerplate (guards, checks)

---

## 5. Summary & Quick Stats

### Current State (2025-11-28)

| Metric | Count | Status |
|--------|-------|--------|
| **ESLint Errors** | 0 | ✅ Clean |
| **TypeScript Errors** | 0 | ✅ Clean |
| **eslint-disable directives** | 1 | ✅ Excellent |
| **`: any` usages** | 19 | ✅ Acceptable |
| **Array accesses ([0], [1])** | 59 | ⚠️ Review needed |
| **Hooks (useEffect, etc.)** | 190 | ✅ Normal for React app |
| **Chai assertions (legacy)** | 10 | ⚠️ Migration 92% done |
| **Vitest assertions (modern)** | 117 | ✅ Majority migrated |
| **TODO/FIXME comments** | 18 | ✅ Manageable |
| **console.* statements** | 241 | ✅ Mostly legitimate |

### Top 3 Priorities for Codex

1. **Type Safety Guards** – Fix 59 array accesses with proper guards
2. **Test Migration** – Complete Chai → Vitest for remaining 10 assertions
3. **Code Hygiene** – Clean up unused imports/vars (current warnings)

### Expected Outcome

After Codex completes Clusters 1-3:

```bash
pnpm run lint      # ✅ 0 errors, 0 warnings
pnpm run typecheck # ✅ 0 errors
pnpm run test      # ✅ All tests pass
pnpm run build     # ✅ Production build succeeds
```

---

**End of Document**

**Next Action:** Codex begins with Cluster 1 (Type Safety) or Cluster 2 (Test Migration) based on priority.

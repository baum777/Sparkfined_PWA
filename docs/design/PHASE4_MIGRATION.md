# Phase 4: Design System Migration – Complete Implementation Plan

> **Purpose**: Comprehensive migration strategy to complete the Spark Design System rollout across all Sparkfined PWA surfaces.
>
> **Status**: Planning Complete – Ready for Implementation  
> **Last Updated**: 2025-12-04  
> **Owner**: Claude (UI/UX Architect)  
> **Target**: Codex (Implementation Agent)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Migration Architecture](#migration-architecture)
4. [Surface-by-Surface Migration Plan](#surface-by-surface-migration-plan)
5. [Legacy Cleanup Strategy](#legacy-cleanup-strategy)
6. [Implementation Guardrails for Codex](#implementation-guardrails-for-codex)
7. [Testing & Validation](#testing--validation)
8. [Risk Mitigation](#risk-mitigation)
9. [Rollback Strategy](#rollback-strategy)
10. [Success Criteria](#success-criteria)

---

## Executive Summary

### What is Phase 4?

Phase 4 completes the migration from legacy Tailwind color palettes (emerald, rose, zinc, slate) to the **Spark Design System** (Spark cyan, Void black, mystical theming).

### Current Migration Status

| Component | Status | Notes |
|-----------|--------|-------|
| **Design System Core** | ✅ Complete | `/src/design-system/` with tokens, components, gestures |
| **Token System** | ✅ Complete | `/src/styles/tokens.css` with Spark colors |
| **Tailwind Config** | ⚠️ Partial | Spark tokens integrated, legacy palettes still present |
| **Core Pages (V2)** | ✅ Complete | Dashboard, Journal, Alerts, Watchlist use Spark tokens |
| **Component Shims** | ⚠️ Partial | `/src/components/ui/` re-exports from design-system |
| **Legacy Color Usage** | ❌ Cleanup Needed | 4 files with emerald/rose/zinc/slate hardcoded |
| **Legacy Palette in Tailwind** | ❌ Cleanup Needed | zinc, emerald, rose, slate palettes still in config |

### Phase 4 Goals

1. **Migrate all remaining surfaces** to Spark tokens
2. **Remove all hardcoded legacy colors** from codebase
3. **Remove legacy Tailwind palettes** from `tailwind.config.ts`
4. **Remove shim layer** at `/src/components/ui/` (consolidate to design-system)
5. **Establish long-term design-system governance**

---

## Current State Analysis

### Design System Structure (Already Implemented)

```
src/design-system/
├── components/
│   ├── Alert/
│   ├── Badge/
│   ├── Button/
│   ├── Card/
│   ├── Input/
│   ├── Modal/
│   └── Tooltip/
├── gestures/
│   ├── useBottomSheet.ts
│   ├── useDragReorder.ts
│   ├── usePullToRefresh.ts
│   └── useSwipeable.ts
├── theme/
│   └── sparkTheme.ts
├── tokens/
│   ├── animation.ts
│   ├── colors.ts
│   ├── shadows.ts
│   ├── spacing.ts
│   └── typography.ts
└── utils/
    ├── cn.ts
    └── haptic.ts
```

**Status**: ✅ All design-system components are implemented with tests.

### Token System (Complete)

**Location**: `/src/styles/tokens.css`

**Spark Color Tokens**:
```css
--color-void: 10 10 10;           /* Background */
--color-spark: 0 240 255;         /* Brand cyan */
--color-smoke: 42 42 42;          /* Cards */
--color-mist: 255 255 255;        /* Primary text */
--color-gold: 255 184 0;          /* Warning */
--color-blood: 255 0 110;         /* Danger */
--color-phosphor: 57 255 20;      /* Success */
--color-violet: 157 78 221;       /* Mystical accent */
--color-ember: 255 69 0;          /* High volatility */
```

**Semantic Aliases**:
```css
--color-brand: var(--color-spark);
--color-success: var(--color-phosphor);
--color-danger: var(--color-blood);
--color-sentiment-bull: var(--color-phosphor);
--color-sentiment-bear: var(--color-blood);
```

**Status**: ✅ Complete and wired into Tailwind config.

### Legacy Color Usage Audit

**Files with hardcoded emerald/rose/zinc/slate** (from grep results):

| File | Legacy Usage | Severity |
|------|-------------|----------|
| `src/routes/RoutesRoot.tsx` | `bg-slate-950`, `border-slate-700`, `border-t-emerald-500`, `text-slate-300` | 🔴 High |
| `src/App.tsx` | `bg-emerald-500` | 🟡 Low |
| `src/app/AppErrorBoundary.tsx` | `bg-slate-950`, `text-emerald-400`, `bg-emerald-500`, `bg-slate-900` | 🔴 High |
| `src/components/ReplayPlayer.tsx` | 33 instances of `zinc-*` | 🔴 High |
| `src/components/JournalBadge.tsx` | `border-emerald-500`, `bg-emerald-500/20`, `text-emerald-100` | 🟡 Low |

**Total**: 41 legacy color usages across 5 files.

### Component Import Audit

**Files importing from `@/components/ui/`**: 51 imports across 31 files.

**Example imports**:
- `import Button from '@/components/ui/Button'`
- `import { Card } from '@/components/ui/Card'`
- `import { Badge } from '@/components/ui/Badge'`

**Current Shim Strategy**:
Many `/src/components/ui/*` files already re-export from design-system:

```tsx
// src/components/ui/Button.tsx (example shim)
export { Button } from '@/design-system/components/Button'
```

**Status**: ⚠️ Shim layer partially complete, but direct imports still exist.

### Tailwind Config Legacy Palettes

**Location**: `/workspace/tailwind.config.ts`, lines 182-273

```typescript
// TODO: design-system: drop legacy Tailwind palettes after spark tokens cover all usage
// TODO: design-system: remove legacy palettes once dashboard + journal surfaces finish Spark migration

zinc: { 50: '#fafafa', ... },
emerald: { 50: '#ecfdf5', ... },
rose: { 50: '#fff1f2', ... },
slate: { 50: '#f8fafc', ... },
```

**Status**: ❌ Still present, can be removed once all legacy color usages are migrated.

---

## Migration Architecture

### Phased Approach

Phase 4 is broken into **4 sub-phases** to ensure zero breaking changes:

| Sub-Phase | Focus | Risk Level |
|-----------|-------|------------|
| **4.1** | Legacy Color Cleanup | 🟢 Low |
| **4.2** | Component Import Migration | 🟡 Medium |
| **4.3** | Shim Layer Removal | 🟢 Low |
| **4.4** | Tailwind Config Cleanup | 🟢 Low |

### Migration Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│ Phase 4.1: Legacy Color Cleanup                                 │
│ Replace all emerald/rose/zinc/slate → Spark tokens              │
├─────────────────────────────────────────────────────────────────┤
│ Phase 4.2: Component Import Migration                           │
│ Replace @/components/ui/* → @/design-system imports             │
├─────────────────────────────────────────────────────────────────┤
│ Phase 4.3: Shim Layer Removal                                   │
│ Delete /src/components/ui/* (Button, Card, Badge, etc.)         │
├─────────────────────────────────────────────────────────────────┤
│ Phase 4.4: Tailwind Config Cleanup                              │
│ Remove zinc, emerald, rose, slate palettes                      │
└─────────────────────────────────────────────────────────────────┘
```

### Import Strategy

**Before (Legacy)**:
```tsx
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
```

**After (Design System)**:
```tsx
import { Button, Card } from '@/design-system'
```

---

## Surface-by-Surface Migration Plan

### 4.1 Legacy Color Cleanup

#### 4.1.1 Loading State (RoutesRoot.tsx)

**File**: `src/routes/RoutesRoot.tsx`

**Current**:
```tsx
<div className="min-h-screen bg-slate-950 flex items-center justify-center">
  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-700 border-t-emerald-500 mb-4"></div>
  <p className="text-slate-300 text-lg">Lade…</p>
</div>
```

**Migration**:
```tsx
<div className="min-h-screen bg-void flex items-center justify-center">
  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-smoke-light border-t-spark mb-4"></div>
  <p className="text-mist text-lg">Lade…</p>
</div>
```

**Changes**:
- `bg-slate-950` → `bg-void`
- `border-slate-700` → `border-smoke-light`
- `border-t-emerald-500` → `border-t-spark`
- `text-slate-300` → `text-mist`

**Test**: Reload app, verify loading spinner uses Spark colors.

---

#### 4.1.2 Error Boundary (AppErrorBoundary.tsx)

**File**: `src/app/AppErrorBoundary.tsx`

**Current**:
```tsx
<main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
  <h1 className="text-2xl font-bold text-emerald-400 mb-4">Es gab einen Fehler beim Laden</h1>
  <p className="text-slate-300 mb-6">...</p>
  <button className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
    Seite neu laden
  </button>
  <details className="mt-6 text-left bg-slate-900 rounded-lg p-4">
    <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 mb-2">
      Technische Details
    </summary>
    <pre className="p-3 bg-slate-950 rounded text-xs overflow-auto text-red-300 whitespace-pre-wrap">
      {this.state.error?.stack}
    </pre>
  </details>
</main>
```

**Migration**:
```tsx
<main className="min-h-screen bg-void text-mist flex items-center justify-center p-6">
  <h1 className="text-2xl font-bold text-spark mb-4">Es gab einen Fehler beim Laden</h1>
  <p className="text-fog mb-6">...</p>
  <button className="px-6 py-3 bg-spark hover:bg-spark/80 text-void rounded-lg font-medium transition-colors">
    Seite neu laden
  </button>
  <details className="mt-6 text-left bg-smoke rounded-lg p-4">
    <summary className="cursor-pointer text-sm text-fog hover:text-mist mb-2">
      Technische Details
    </summary>
    <pre className="p-3 bg-void rounded text-xs overflow-auto text-blood whitespace-pre-wrap">
      {this.state.error?.stack}
    </pre>
  </details>
</main>
```

**Changes**:
- `bg-slate-950` → `bg-void`
- `text-slate-100` → `text-mist`
- `text-emerald-400` → `text-spark`
- `text-slate-300` → `text-fog`
- `bg-emerald-500` → `bg-spark`
- `hover:bg-emerald-600` → `hover:bg-spark/80`
- `bg-slate-900` → `bg-smoke`
- `text-slate-400` → `text-fog`
- `text-red-300` → `text-blood`

**Test**: Trigger error boundary (throw error in dev), verify styling.

---

#### 4.1.3 Replay Player (ReplayPlayer.tsx)

**File**: `src/components/ReplayPlayer.tsx`

**Current**: 33 instances of `zinc-*` classes.

**Strategy**: Bulk replace with Spark tokens.

**Replacements**:
- `bg-zinc-900` → `bg-smoke`
- `bg-zinc-950` → `bg-void-lighter`
- `border-zinc-800` → `border-smoke-light`
- `text-zinc-200` → `text-mist`
- `text-zinc-300` → `text-fog`
- `text-zinc-400` → `text-fog`
- `text-zinc-500` → `text-ash`
- `text-zinc-600` → `text-ash`

**Example Before**:
```tsx
<div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
  <h3 className="text-sm font-semibold text-zinc-200">Playback Controls</h3>
  <p className="text-xs text-zinc-500">Speed: {speed}x</p>
</div>
```

**Example After**:
```tsx
<div className="rounded-xl border border-smoke-light bg-smoke/60 p-4">
  <h3 className="text-sm font-semibold text-mist">Playback Controls</h3>
  <p className="text-xs text-ash">Speed: {speed}x</p>
</div>
```

**Test**: Open Replay Page, verify all controls render correctly with Spark theme.

---

#### 4.1.4 Journal Badge (JournalBadge.tsx)

**File**: `src/components/JournalBadge.tsx`

**Current**:
```tsx
className="animate-pulse border-emerald-500 bg-emerald-500/20 text-emerald-100"
```

**Migration**:
```tsx
className="animate-pulse border-spark bg-spark/20 text-spark"
```

**Changes**:
- `border-emerald-500` → `border-spark`
- `bg-emerald-500/20` → `bg-spark/20`
- `text-emerald-100` → `text-spark`

**Test**: View journal page with live entries, verify badge styling.

---

#### 4.1.5 Skip Link (App.tsx)

**File**: `src/App.tsx`

**Current**:
```tsx
className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-emerald-500 focus:px-4 focus:py-2 focus:text-white focus:shadow-lg"
```

**Migration**:
```tsx
className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:bg-spark focus:px-4 focus:py-2 focus:text-void focus:shadow-lg"
```

**Changes**:
- `focus:bg-emerald-500` → `focus:bg-spark`
- `focus:text-white` → `focus:text-void`

**Test**: Tab through app (keyboard navigation), verify skip link appears with Spark background.

---

### Sub-Phase 4.1 Summary

| File | Instances | Complexity | Est. Time |
|------|-----------|------------|-----------|
| RoutesRoot.tsx | 5 | Low | 5 min |
| AppErrorBoundary.tsx | 11 | Low | 10 min |
| ReplayPlayer.tsx | 33 | Medium | 20 min |
| JournalBadge.tsx | 3 | Low | 5 min |
| App.tsx | 1 | Low | 2 min |

**Total Est. Time**: 42 minutes

---

### 4.2 Component Import Migration

#### Strategy

Replace all `@/components/ui/*` imports with `@/design-system` imports.

**Files Affected**: 31 files with 51 imports.

**Automation Approach**:

1. **Grep all files** importing from `@/components/ui/`
2. **For each file**, replace:
   ```tsx
   // Old
   import Button from '@/components/ui/Button'
   import { Card, CardHeader } from '@/components/ui/Card'
   
   // New
   import { Button, Card, CardHeader } from '@/design-system'
   ```

**Example Migration**:

**Before** (`src/pages/DashboardPageV2.tsx`):
```tsx
import ErrorBanner from '@/components/ui/ErrorBanner';
```

**After**:
```tsx
import { ErrorBanner } from '@/design-system';
```

---

#### 4.2.1 High-Priority Files

These files are critical user-facing surfaces:

| File | Imports | Priority |
|------|---------|----------|
| `src/pages/DashboardPageV2.tsx` | 1 | 🔴 High |
| `src/pages/JournalPageV2.tsx` | 0 | 🟢 Low (already migrated) |
| `src/pages/AlertsPageV2.tsx` | 1 | 🔴 High |
| `src/pages/WatchlistPageV2.tsx` | 1 | 🔴 High |
| `src/pages/AnalysisPageV2.tsx` | 1 | 🔴 High |
| `src/pages/ChartPageV2.tsx` | 4 | 🔴 High |
| `src/pages/SettingsPageV2.tsx` | 0 | 🟢 Low (already migrated) |

---

#### 4.2.2 Component Files

| File | Imports | Priority |
|------|---------|----------|
| `src/components/dashboard/AlertsSnapshot.tsx` | 1 | 🟡 Medium |
| `src/components/dashboard/InsightTeaser.tsx` | 1 | 🟡 Medium |
| `src/components/dashboard/JournalSnapshot.tsx` | 1 | 🟡 Medium |
| `src/components/dashboard/DashboardQuickActions.tsx` | 1 | 🟡 Medium |
| `src/components/alerts/*` | 4 | 🟡 Medium |
| `src/components/journal/*` | 4 | 🟡 Medium |
| `src/components/analysis/*` | 3 | 🟡 Medium |
| `src/components/chart/*` | 1 | 🟡 Medium |

---

#### 4.2.3 Lower-Priority Files

| File | Imports | Priority |
|------|---------|----------|
| `src/pages/LessonsPage.tsx` | 1 | 🟢 Low |
| `src/pages/SignalsPage.tsx` | 1 | 🟢 Low |
| `src/pages/UXShowcasePage.tsx` | 9 | 🟢 Low (showcase) |
| `src/components/onboarding/*` | 1 | 🟢 Low |
| `src/components/settings/*` | 1 | 🟢 Low |

---

#### Migration Script (Pseudo-code)

```bash
# For each file with @/components/ui/ imports:
# 1. Read file
# 2. Replace:
#    - import Button from '@/components/ui/Button' → import { Button } from '@/design-system'
#    - import { Card } from '@/components/ui/Card' → import { Card } from '@/design-system'
# 3. Consolidate multiple design-system imports into one line
# 4. Save file
# 5. Run typecheck
# 6. Run lint
```

**Tools**: VS Code Find & Replace with regex, or automated script.

---

### 4.3 Shim Layer Removal

**Goal**: Delete `/src/components/ui/*` files that are pure re-exports.

**Criteria for Deletion**:
- File only contains `export { X } from '@/design-system'`
- No additional logic or customization
- All imports have been migrated to `@/design-system`

**Files to Remove**:

| File | Status | Action |
|------|--------|--------|
| `/src/components/ui/Button.tsx` | Shim | ❌ Delete |
| `/src/components/ui/Card.tsx` | Shim | ❌ Delete |
| `/src/components/ui/Badge.tsx` | Shim | ❌ Delete |
| `/src/components/ui/Input.tsx` | Shim | ❌ Delete |
| `/src/components/ui/Tooltip.tsx` | Partial shim | ⚠️ Review |
| `/src/components/ui/Modal/` | Complex | ⚠️ Review |

**Files to Keep** (custom logic):

| File | Reason |
|------|--------|
| `/src/components/ui/EmptyState.tsx` | Custom composition |
| `/src/components/ui/ErrorBanner.tsx` | Custom logic |
| `/src/components/ui/ErrorState.tsx` | Custom logic |
| `/src/components/ui/FormField.tsx` | Custom wrapper |
| `/src/components/ui/LoadingSkeleton.tsx` | Custom patterns |
| `/src/components/ui/Select.tsx` | Complex select logic |
| `/src/components/ui/Skeleton.tsx` | Animation logic |
| `/src/components/ui/StateView.tsx` | Custom state handler |
| `/src/components/ui/Textarea.tsx` | Custom textarea |
| `/src/components/ui/Toast.tsx` | Toast manager |
| `/src/components/ui/Collapsible.tsx` | Animation logic |
| `/src/components/ui/PageTransition.tsx` | Page transition wrapper |
| `/src/components/ui/KeyboardShortcutsDialog.tsx` | Feature-specific |

---

### 4.4 Tailwind Config Cleanup

**Goal**: Remove legacy Tailwind palettes once all usages are migrated.

**File**: `/workspace/tailwind.config.ts`, lines 182-273

**Removal Checklist**:

- [ ] All emerald usages migrated
- [ ] All rose usages migrated
- [ ] All zinc usages migrated
- [ ] All slate usages migrated
- [ ] TypeScript check passes
- [ ] No console warnings about missing classes

**Before**:
```typescript
colors: {
  // ... Spark tokens ...
  
  // TODO: design-system: remove legacy palettes
  zinc: { 50: '#fafafa', ... },
  emerald: { 50: '#ecfdf5', ... },
  rose: { 50: '#fff1f2', ... },
  slate: { 50: '#f8fafc', ... },
}
```

**After**:
```typescript
colors: {
  // ... Spark tokens only ...
}
```

**Also Remove**:
- Legacy shadow utilities: `emerald-glow`, `emerald-glow-lg`, `rose-glow`
- Legacy gradients: `emerald-gradient` (replace with `gradient-spark`)

---

## Legacy Cleanup Strategy

### Phase 4.1: Color Migration Checklist

```
✅ Step 1: Create migration branch
   git checkout -b design-system/phase4-legacy-cleanup

✅ Step 2: Migrate RoutesRoot.tsx
   - Replace slate-* → void/smoke/mist
   - Replace emerald-* → spark
   - Test: Loading spinner

✅ Step 3: Migrate AppErrorBoundary.tsx
   - Replace slate-* → void/smoke/mist
   - Replace emerald-* → spark
   - Replace red-* → blood
   - Test: Trigger error boundary

✅ Step 4: Migrate ReplayPlayer.tsx
   - Bulk replace zinc-* → smoke/void/mist/ash
   - Test: Replay page functionality

✅ Step 5: Migrate JournalBadge.tsx
   - Replace emerald-* → spark
   - Test: Journal badges

✅ Step 6: Migrate App.tsx skip link
   - Replace emerald-* → spark
   - Test: Keyboard navigation

✅ Step 7: Run full test suite
   pnpm test

✅ Step 8: Run E2E tests
   pnpm test:e2e

✅ Step 9: Run typecheck
   pnpm typecheck

✅ Step 10: Run lint
   pnpm lint
```

### Phase 4.2: Import Migration Checklist

```
✅ Step 1: Scan all @/components/ui/ imports
   grep -r "from '@/components/ui/" src/ --include="*.tsx"

✅ Step 2: Migrate high-priority pages
   - DashboardPageV2.tsx
   - AlertsPageV2.tsx
   - WatchlistPageV2.tsx
   - AnalysisPageV2.tsx
   - ChartPageV2.tsx

✅ Step 3: Migrate component files
   - dashboard/*
   - alerts/*
   - journal/*
   - analysis/*
   - chart/*

✅ Step 4: Migrate low-priority files
   - LessonsPage.tsx
   - SignalsPage.tsx
   - onboarding/*
   - settings/*

✅ Step 5: Consolidate imports
   Replace multiple imports with single @/design-system import

✅ Step 6: Run typecheck
   pnpm typecheck

✅ Step 7: Run lint
   pnpm lint

✅ Step 8: Run test suite
   pnpm test

✅ Step 9: Visual regression test (manual)
   - Load each migrated page
   - Verify styling matches previous
```

### Phase 4.3: Shim Removal Checklist

```
✅ Step 1: Verify no imports remain
   grep -r "from '@/components/ui/Button'" src/
   grep -r "from '@/components/ui/Card'" src/
   grep -r "from '@/components/ui/Badge'" src/
   grep -r "from '@/components/ui/Input'" src/

✅ Step 2: Delete shim files
   rm src/components/ui/Button.tsx
   rm src/components/ui/Card.tsx
   rm src/components/ui/Badge.tsx
   rm src/components/ui/Input.tsx

✅ Step 3: Run typecheck
   pnpm typecheck

✅ Step 4: Run test suite
   pnpm test
```

### Phase 4.4: Tailwind Cleanup Checklist

```
✅ Step 1: Verify no legacy color usages
   grep -r "zinc-" src/ --include="*.tsx"
   grep -r "emerald-" src/ --include="*.tsx"
   grep -r "rose-" src/ --include="*.tsx"
   grep -r "slate-" src/ --include="*.tsx"
   
   Expected: 0 results

✅ Step 2: Remove legacy palettes from tailwind.config.ts
   Delete lines 182-273 (zinc, emerald, rose, slate)

✅ Step 3: Remove legacy shadow utilities
   Delete: emerald-glow, emerald-glow-lg, rose-glow

✅ Step 4: Run typecheck
   pnpm typecheck

✅ Step 5: Run build
   pnpm build

✅ Step 6: Visual regression test
   Load all pages, verify no styling changes
```

---

## Implementation Guardrails for Codex

### ✅ DO

1. **Test each change incrementally**
   - Migrate one file at a time
   - Run `pnpm typecheck` after each migration
   - Run `pnpm test` after each sub-phase

2. **Preserve exact visual appearance**
   - Spark tokens should be 1:1 replacements
   - No visual regressions
   - Take screenshots before/after if uncertain

3. **Use Spark token equivalents consistently**
   - `emerald-500` → `spark` (brand accent)
   - `zinc-900` → `smoke` (card background)
   - `slate-950` → `void` (page background)
   - `zinc-200` → `mist` (primary text)
   - `zinc-400` → `fog` (secondary text)

4. **Consolidate imports**
   ```tsx
   // Bad
   import { Button } from '@/design-system'
   import { Card } from '@/design-system'
   import { Badge } from '@/design-system'
   
   // Good
   import { Button, Card, Badge } from '@/design-system'
   ```

5. **Update tests if imports change**
   - If a component import path changes, update its test imports
   - Run test suite after migration

6. **Document breaking changes**
   - If a token doesn't have an exact equivalent, document the decision
   - Add inline comments if color mapping is non-obvious

### ❌ DON'T

1. **Don't change component behavior**
   - Only change styling tokens
   - No functional changes during migration

2. **Don't introduce new dependencies**
   - Use existing Spark tokens
   - No new color tokens without approval

3. **Don't skip tests**
   - Always run typecheck and tests after each sub-phase
   - Don't merge if tests fail

4. **Don't delete files before migration complete**
   - Keep shims until all imports are migrated
   - Delete only when confirmed safe

5. **Don't make subjective color choices**
   - Follow token mapping guide strictly
   - If unsure, ask (via TODO comment)

6. **Don't mix legacy and Spark tokens in same file**
   - Complete migration per file
   - No half-migrated files

### Token Mapping Reference Table

| Legacy Token | Spark Token | Use Case |
|-------------|-------------|----------|
| `slate-950` | `void` | Page background |
| `slate-900` | `smoke` | Card background |
| `slate-800` | `smoke-light` | Borders, dividers |
| `slate-700` | `smoke-lighter` | Disabled states |
| `slate-300` | `fog` | Secondary text |
| `slate-200` | `mist` | Primary text |
| `slate-100` | `mist` | Bright text |
| `zinc-950` | `void-lighter` | Elevated background |
| `zinc-900` | `smoke` | Card background |
| `zinc-800` | `smoke-light` | Borders |
| `zinc-600` | `ash` | Tertiary text |
| `zinc-500` | `ash` | Tertiary text |
| `zinc-400` | `fog` | Secondary text |
| `zinc-300` | `fog` | Secondary text |
| `zinc-200` | `mist` | Primary text |
| `emerald-500` | `spark` | Brand accent, CTAs |
| `emerald-400` | `spark` | Hover states |
| `emerald-100` | `spark` (with opacity) | Light text on dark |
| `rose-500` | `blood` | Danger, errors |
| `rose-400` | `blood` | Hover states |
| `cyan-400` | `spark` | Info, accents |

---

## Testing & Validation

### Unit Tests

**Run after each file migration**:
```bash
pnpm test
```

**Focus areas**:
- Component rendering
- Token application
- No broken imports

### E2E Tests

**Run after each sub-phase**:
```bash
pnpm test:e2e
```

**Critical flows**:
- Dashboard load
- Journal CRUD
- Alerts CRUD
- Watchlist navigation
- Chart interaction

### Visual Regression Testing

**Manual checklist**:

| Page | Before Screenshot | After Screenshot | Status |
|------|-------------------|------------------|--------|
| Dashboard | ✅ | ✅ | ⏳ |
| Journal | ✅ | ✅ | ⏳ |
| Alerts | ✅ | ✅ | ⏳ |
| Watchlist | ✅ | ✅ | ⏳ |
| Analysis | ✅ | ✅ | ⏳ |
| Chart | ✅ | ✅ | ⏳ |
| Settings | ✅ | ✅ | ⏳ |

**Tools**:
- Percy (if available)
- Manual side-by-side comparison
- Playwright screenshot assertions

### Accessibility Testing

**WCAG AA Compliance**:
- [ ] All text has 4.5:1 contrast ratio
- [ ] All interactive elements have 3:1 contrast
- [ ] Focus indicators visible
- [ ] Keyboard navigation works

**Tools**:
- `pnpm test:a11y` (if available)
- Manual keyboard testing
- Lighthouse audit

### Performance Testing

**Metrics to monitor**:
- [ ] No increase in bundle size
- [ ] No performance regressions
- [ ] No console errors/warnings

**Tools**:
```bash
pnpm build
# Check build output for size changes
```

---

## Risk Mitigation

### Risk: Visual Regressions

**Mitigation**:
- Take screenshots before migration
- Use Percy for automated visual regression testing
- Manual QA on each page

**Rollback**: Revert commit if visual issues found.

### Risk: Broken Imports

**Mitigation**:
- Run `pnpm typecheck` after each change
- Run `pnpm test` after each sub-phase
- Use TypeScript to catch missing imports

**Rollback**: Fix broken imports immediately or revert.

### Risk: Performance Degradation

**Mitigation**:
- Monitor bundle size during build
- Profile app performance before/after
- No new dependencies introduced

**Rollback**: Revert if bundle size increases >5%.

### Risk: Accessibility Issues

**Mitigation**:
- Run accessibility audits
- Test keyboard navigation
- Verify color contrast ratios

**Rollback**: Fix accessibility issues before merge.

---

## Rollback Strategy

### Per-File Rollback

If a single file causes issues:
```bash
git checkout HEAD -- src/path/to/file.tsx
```

### Sub-Phase Rollback

If an entire sub-phase causes issues:
```bash
git reset --hard <commit-before-subphase>
```

### Full Phase 4 Rollback

If Phase 4 must be abandoned:
```bash
git checkout main
git branch -D design-system/phase4-legacy-cleanup
```

**Note**: Rollback should be rare. Follow incremental testing to catch issues early.

---

## Success Criteria

### Phase 4.1 Complete

- [ ] 0 instances of `emerald-*`, `rose-*`, `zinc-*`, `slate-*` in codebase
- [ ] All pages load correctly
- [ ] All colors match Spark design spec
- [ ] All tests pass
- [ ] No console errors

### Phase 4.2 Complete

- [ ] 0 imports from `@/components/ui/Button`
- [ ] 0 imports from `@/components/ui/Card`
- [ ] 0 imports from `@/components/ui/Badge`
- [ ] 0 imports from `@/components/ui/Input`
- [ ] All imports use `@/design-system`
- [ ] All tests pass
- [ ] No TypeScript errors

### Phase 4.3 Complete

- [ ] `/src/components/ui/Button.tsx` deleted
- [ ] `/src/components/ui/Card.tsx` deleted
- [ ] `/src/components/ui/Badge.tsx` deleted
- [ ] `/src/components/ui/Input.tsx` deleted
- [ ] All tests pass
- [ ] No broken imports

### Phase 4.4 Complete

- [ ] Legacy palettes removed from `tailwind.config.ts`
- [ ] Build succeeds
- [ ] No Tailwind warnings
- [ ] All pages render correctly
- [ ] No visual regressions

### Overall Phase 4 Complete

- [ ] All 4 sub-phases complete
- [ ] All tests pass
- [ ] All E2E tests pass
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] No console warnings
- [ ] Visual regression tests pass
- [ ] Accessibility audits pass
- [ ] Performance metrics stable
- [ ] Documentation updated

## Phase 4 Completion Snapshot (2025‑12‑04)
- ✅ All spark design-system components (Button, Card, Badge, Input, Tooltip, Alert, Modal) are the single source for UI primitives; legacy shims in `src/components/ui/*` have been removed.
- ✅ Spark tokens replace every Tailwind standard palette (zinc, slate, emerald, rose, cyan, amber, green, blue, red). Searches for `(?<![A-Za-z0-9_-])(palette-name)-[0-9]` return zero matches in `src/**`.
- ✅ `tailwind.config.ts` now only exposes Spark tokens, spark gradients, and glow utilities; legacy palettes, `emerald-gradient`, and `emerald-glow*` entries are removed.
- ✅ Alerts CRUD dialogs, dashboard snapshots, watchlist tables, onboarding flows, and signals boards import from `@/design-system` directly and rely exclusively on tokens defined in `src/styles/tokens.css`.
- ⚠️ Purpose-built composites that still live in `src/components/ui/` (e.g., `StateView`, `Select`, `Toast`, `EmptyState`) are intentionally retained. They wrap Spark primitives internally and are candidates for a future move into `src/design-system/components/composites`.

### Critical QA Surfaces for Phase 5
1. **Dashboard & Watchlist (dark + light themes)** – verify spark sentiment badges, metric tiles, and quick actions retain hover/active depth.
2. **Alerts CRUD (create + edit + delete)** – inputs use `errorText`, modals animate via Design System. Run through validation states and confirm aria attributes.
3. **Onboarding wizard** – focus rings, progress bars, and CTA buttons were auto‑mapped to spark tokens. Validate reduced-motion + keyboard usage.
4. **Signals & Analysis boards** – color-coded cards now rely on spark/blood/gold; confirm contrast ratios ≥ 4.5:1, especially for “neutral” bias badges.
5. **Landing / Marketing surfaces** – gradients transitioned away from cyan/emerald palettes. Compare hero cards vs. spec to ensure brand glow intensity is acceptable.
6. **NotificationsPermissionButton / LiveStatusBadge / OfflineIndicator** – check micro-interactions (pulses, badges) for AA compliance and consistent glow strengths.

### Known UX & Token Follow-ups
- `SettingsPage.tsx` received an automated mapping from zinc/emerald to spark tokens. A TODO is left in-file to perform a dedicated light/dark QA sweep on toggles, select controls, and danger-zone panels.
- `MetricsPanel` now renders spark/phosphor foregrounds in both themes. Visual QA should confirm that the dual theme classes (`dark:bg-…`) still express hierarchy and that exported rows remain readable.
- `UXShowcasePage` continues to use bespoke `btn-*` utility classes for demo purposes. Keep this page out of production builds (DEV-only route) until buttons are migrated to Spark components.
- `src/components/ui/*` houses composite patterns (FormField, EmptyState, Select, Toast, etc.) that still export from that path. These files are explicitly whitelisted; new primitives must live under `src/design-system/components/`.
- Gradient tokens (`gradient-spark`, `gradient-gold`, `gradient-void`) cover current hero needs. If product wants exotic blends again, the request must go through Design review instead of ad-hoc CSS.

---

## Post-Migration Governance

### Design System Ownership

**Owner**: Claude (UI/UX Architect)

**Responsibilities**:
- Maintain design token consistency
- Review design-system PRs
- Update design documentation
- Define new components

### Adding New Components

**Process**:
1. Design spec created in `/docs/design/`
2. Component implemented in `/src/design-system/components/`
3. Tests written in `*.test.tsx`
4. Storybook story created (if available)
5. Exported from `/src/design-system/index.ts`
6. Documentation updated

### Modifying Existing Tokens

**Process**:
1. Propose change in `/docs/design/`
2. Update token in `/src/design-system/tokens/`
3. Update `tailwind.config.ts`
4. Update `/src/styles/tokens.css`
5. Run full test suite
6. Visual regression test
7. Update documentation

### Forbidden Practices

❌ **Never**:
- Add new color tokens without design approval
- Hardcode colors (always use tokens)
- Create ad-hoc component variants
- Skip tests for new components
- Use `!important` to override token styles

✅ **Always**:
- Use tokens from design-system
- Test new components
- Document design decisions
- Follow accessibility guidelines
- Maintain backward compatibility

---

## Appendix

### A. Complete Token Reference

See `/docs/design/DESIGN_SYSTEM.md` for full token documentation.

### B. Migration Timeline

| Sub-Phase | Est. Duration | Dependencies |
|-----------|---------------|--------------|
| 4.1 Color Cleanup | 1 hour | None |
| 4.2 Import Migration | 2 hours | 4.1 complete |
| 4.3 Shim Removal | 30 minutes | 4.2 complete |
| 4.4 Tailwind Cleanup | 30 minutes | 4.3 complete |

**Total Estimated Duration**: 4 hours

### C. Related Documentation

- `/docs/design/DESIGN_SYSTEM.md` - Full design system specification
- `/docs/design/DESIGN_MODULE_SPEC.md` - Module architecture
- `/docs/design/STYLE_SPRINT_PLAN.md` - Style sprint details
- `/src/design-system/README.md` - Component library documentation (create if missing)

### D. Contact & Support

**Questions?**
- Design decisions: Claude (UI/UX Architect)
- Implementation issues: Codex (Implementation Agent)
- Blocked on dependencies: Escalate to project owner

---

## Changelog

### 2025-12-04 - Initial Phase 4 Plan
- Complete current state analysis
- Defined 4 sub-phases
- Created surface-by-surface migration guide
- Established guardrails for Codex
- Defined success criteria
- Created testing strategy

### 2025-12-04 - Phase 4 Execution (Codex)
- Migrated remaining legacy surfaces (RoutesRoot, AppErrorBoundary, ReplayPlayer, JournalBadge, App skip link) to Spark tokens
- Repointed all Button/Card/Badge/Input/Tooltip imports to `@/design-system` and deleted shim files
- Replaced legacy emerald/zinc/slate/rose/cyan/amber Tailwind classes repo-wide with Spark semantic tokens
- Removed legacy Tailwind palettes, gradients, and glow utilities; added Spark equivalents where needed
- Ensured alerts CRUD dialogs use Spark `Input` + `Button` APIs and updated tests/code accordingly

---

**End of Phase 4 Migration Plan**

*This document is the single source of truth for completing the Spark Design System migration. All implementation should follow this plan exactly.*

**Ready for Codex Implementation**: ✅ Yes

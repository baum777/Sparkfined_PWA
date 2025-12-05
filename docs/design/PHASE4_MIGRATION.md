# Sparkfined Design System – Phase 4 Migration Plan

**Status:** Planning Phase  
**Created:** 2025-12-05  
**Author:** Background Agent (Analysis)  
**Purpose:** Document current design system state and define strict boundaries for Codex Step 1

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [UI Surface Inventory](#ui-surface-inventory)
4. [Design System Gap Analysis](#design-system-gap-analysis)
5. [Codex Step 1 – Scope Definition](#codex-step-1--scope-definition)
6. [Explicit Boundaries for Step 1](#explicit-boundaries-for-step-1)
7. [Success Criteria](#success-criteria)
8. [Future Steps Preview](#future-steps-preview)

---

## Executive Summary

### Current Situation

The Sparkfined PWA has **comprehensive design documentation** but **incomplete implementation**:

- ✅ **Design Specification Exists**: `DESIGN_SYSTEM.md` (full spec) and `DESIGN_MODULE_SPEC.md` (implementation guide)
- ✅ **Style Sprint Plan**: `STYLE_SPRINT_PLAN.md` with detailed component specs
- ⚠️ **Color System Mismatch**: Design spec calls for cyan "Spark" theme (#00F0FF), but current implementation uses emerald green (#10b981)
- ❌ **No Organized Module**: `src/design-system/` folder does not exist
- ⚠️ **Legacy Components**: Functional UI components in `src/components/ui/` but not aligned to design spec
- ✅ **Token Infrastructure**: Tailwind already wired to CSS variables in `tokens.css`

### Strategic Approach

**Incremental, Non-Breaking Migration**

1. **Step 1 (Codex)**: Build design system foundations WITHOUT touching existing pages
2. **Step 2+**: Gradual surface-by-surface migration with feature teams

---

## Current State Analysis

### 1. Design Documentation

#### Files

| File | Status | Content |
|------|--------|---------|
| `docs/design/DESIGN_SYSTEM.md` | ✅ Complete | Full design specification with "Spark" mystical theme (cyan #00F0FF, Void #0A0A0A) |
| `docs/design/DESIGN_MODULE_SPEC.md` | ✅ Complete | Implementation roadmap for Codex with component APIs, token structure |
| `docs/design/STYLE_SPRINT_PLAN.md` | ✅ Complete | Detailed component specs, layout patterns, interaction states |
| `docs/design/STYLING-UPDATES.md` | ✅ Present | Historical style updates |

#### Key Design Decisions

- **Brand Color**: Cyan "Spark" (#00F0FF) – mystical, alchemical trading interface
- **Dark-First**: Optimized for low-light trading environments
- **Typography**: Space Grotesk (display), Inter (body), JetBrains Mono (data)
- **Spacing**: 8px grid system
- **Mobile Gestures**: Swipe-to-action, pull-to-refresh, drag-reorder
- **Animation**: 60fps, sub-300ms interactions, Framer Motion

### 2. Current Token Implementation

#### Location: `src/styles/tokens.css`

**Current Brand Colors (PRODUCTION):**

```css
--color-brand: 15 179 76;            /* emerald-500 #10b981 */
--color-brand-hover: 5 150 105;      /* emerald-600 #059669 */
--color-accent: 0 255 102;           /* neon green */
```

**Design Spec Target:**

```css
--color-spark: 0 240 255;            /* cyan #00F0FF */
--color-spark-dim: 0 188 212;        /* cyan dim #00BCD4 */
--color-void: 10 10 10;              /* #0A0A0A */
```

**Conclusion**: **COLOR MISMATCH** – Current emerald green vs. target cyan "Spark"

### 3. Tailwind Configuration

#### Location: `tailwind.config.ts`

**Status**: ✅ Already integrated with tokens

- Colors wired via `withAlpha()` helper for CSS variables
- Semantic color mapping exists (`brand`, `accent`, `surface`, `text`, etc.)
- Complete spacing, typography, shadow, animation scales
- **Good foundation** – just needs token values updated

### 4. Existing UI Components

#### Location: `src/components/ui/`

**Components Found:**

- ✅ `Button.tsx`
- ✅ `Card.tsx`
- ✅ `Badge.tsx`
- ✅ `Input.tsx`
- ✅ `Textarea.tsx`
- ✅ `Select.tsx`
- ✅ `Modal/`
- ✅ `Tooltip.tsx`
- ✅ `Toast.tsx`
- ✅ `Skeleton.tsx`
- ✅ `EmptyState.tsx`
- ✅ `ErrorState.tsx`
- ✅ `LoadingSkeleton.tsx`
- ✅ `Collapsible.tsx`
- ✅ `PageTransition.tsx`
- ✅ `FormField.tsx`

**Assessment:**

- ✅ **Functional** – All components work in production
- ⚠️ **Not Design-Spec Compliant** – Use current emerald theme, not Spark cyan
- ⚠️ **Inconsistent Structure** – No standardized variant/size patterns across all components
- ⚠️ **Mixed Animation** – Some use Framer Motion, some don't

**Conclusion**: These are **"Legacy V1"** components – functional shims, not design system.

### 5. Design System Module

#### Location: `src/design-system/`

**Status**: ❌ **DOES NOT EXIST**

Expected structure (per `DESIGN_MODULE_SPEC.md`):

```
src/design-system/
├── tokens/          # Design tokens (colors, typography, spacing, etc.)
├── theme/           # Theme objects
├── components/      # Design system components (NEW implementations)
├── primitives/      # Lower-level UI primitives
├── gestures/        # Mobile gesture hooks
├── utils/           # Utilities (haptic, motion helpers)
└── index.ts         # Public API
```

**This is the PRIMARY GOAL of Codex Step 1.**

---

## UI Surface Inventory

### Surface Categories

| Category | Description | Migration Priority |
|----------|-------------|-------------------|
| **Core Product** | Main trading/journaling features | HIGH |
| **Secondary** | Settings, notifications, tools | MEDIUM |
| **Marketing/Demo** | Landing, showcases | LOW |
| **Experimental** | Beta features, future concepts | DEFERRED |

---

### Core Product Surfaces

| Page | Component Count | Complexity | Legacy Deps | Notes |
|------|----------------|------------|-------------|-------|
| **DashboardPageV2** | ~10 | Medium | DashboardShell, KPI components | Entry point, high visibility |
| **JournalPageV2** | ~15 | High | JournalLayout, List, DetailPanel, Insights | Hero's journey, complex state |
| **AlertsPageV2** | ~12 | High | AlertsLayout, RuleBuilder, Backtest | Rule engine, form-heavy |
| **WatchlistPageV2** | ~8 | Medium | List/Detail pattern | Similar to Alerts |
| **ChartPageV2** | ~6 | High | TradingView integration | Chart-focused, less UI chrome |
| **AnalysisPageV2** | ~10 | Medium | Analysis tools, KPIs | Data-dense |

**Total Core Surfaces:** 6 pages

**Assessment:**

- All use **DashboardShell** (shared layout component)
- All use **V2 suffix** (indicates refactored versions)
- All leverage **Zustand stores** (journalStore, alertsStore, etc.)
- All use **existing `src/components/ui/` components**

---

### Secondary Surfaces

| Page | Component Count | Complexity | Notes |
|------|----------------|------------|-------|
| **SettingsPageV2** | ~8 | Medium | Forms, toggles, wallet connection |
| **SettingsPage** | ~5 | Low | Legacy version, likely deprecated |
| **NotificationsPage** | ~4 | Low | Simple list view |
| **ReplayPage** | ~6 | Medium | Chart replay feature |

**Total Secondary Surfaces:** 4 pages (+ 1 legacy)

---

### Marketing/Demo Surfaces

| Page | Component Count | Complexity | Notes |
|------|----------------|------------|-------|
| **LandingPage** | ~12 | High | Marketing copy, hero, CTAs |
| **StyleShowcasePage** | ~20 | Low | Component gallery |
| **UXShowcasePage** | ~15 | Low | UX pattern demos |
| **IconShowcase** | ~5 | Low | Icon library display |

**Total Marketing Surfaces:** 4 pages

**Assessment:**

- **Low business risk** – Not core product functionality
- **High design impact** – First impression for new users
- **Can wait** – Migrate after core product

---

### Experimental Surfaces

| Page | Component Count | Complexity | Notes |
|------|----------------|------------|-------|
| **OraclePage** | ~8 | Medium | Future feature concept |
| **SignalsPage** | ~6 | Low | Trading signals (beta) |
| **LessonsPage** | ~5 | Low | Educational content |

**Total Experimental Surfaces:** 3 pages

**Assessment:** **Defer migration** – These may change or be removed.

---

### Summary: Total UI Surfaces

- **17 total pages**
- **6 core product pages** (highest priority)
- **4 secondary pages**
- **4 marketing pages**
- **3 experimental pages**

---

## Design System Gap Analysis

### What Exists

| Element | Status | Location |
|---------|--------|----------|
| Design Specification | ✅ Complete | `docs/design/DESIGN_SYSTEM.md` |
| Implementation Guide | ✅ Complete | `docs/design/DESIGN_MODULE_SPEC.md` |
| CSS Tokens | ⚠️ Partial | `src/styles/tokens.css` (wrong colors) |
| Tailwind Config | ✅ Good | `tailwind.config.ts` |
| Legacy Components | ⚠️ Functional | `src/components/ui/` (not spec-compliant) |
| Font Loading | ❌ Missing | Need Space Grotesk, Inter, JetBrains Mono |

### What's Missing

| Element | Priority | Reason |
|---------|----------|--------|
| **`src/design-system/` module** | 🔴 CRITICAL | Core organizational structure |
| **Design tokens (TypeScript)** | 🔴 CRITICAL | Type-safe token imports |
| **Spark color migration** | 🔴 CRITICAL | Brand identity mismatch |
| **Design system components** | 🔴 CRITICAL | Spec-compliant implementations |
| **Font imports** | 🟡 HIGH | Typography missing |
| **Mobile gesture hooks** | 🟡 HIGH | Missing interaction patterns |
| **Animation utilities** | 🟡 HIGH | Inconsistent motion |
| **Haptic feedback** | 🟢 MEDIUM | Nice-to-have |

---

## Codex Step 1 – Scope Definition

### Goal

**Build design system foundations WITHOUT touching existing production pages.**

### Objectives

1. ✅ Create `src/design-system/` module structure
2. ✅ Implement design tokens (colors, typography, spacing, shadows, animation)
3. ✅ Update Tailwind config to use new tokens
4. ✅ Migrate CSS variables to Spark colors
5. ✅ Add font imports (Space Grotesk, Inter, JetBrains Mono)
6. ✅ Implement core components (Button, Card, Badge, Input, Modal)
7. ✅ Create backward-compatibility shims
8. ✅ Write unit tests for all components

### Tasks Breakdown

#### Task 1: Module Structure (30 min)

**Action**: Create folder structure

```bash
src/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   ├── animation.ts
│   └── index.ts
├── theme/
│   ├── sparkTheme.ts
│   └── index.ts
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── Card/
│   ├── Badge/
│   ├── Alert/
│   ├── Modal/
│   ├── Input/
│   └── index.ts
├── utils/
│   ├── cn.ts
│   └── haptic.ts
└── index.ts
```

**Deliverable**: Empty folder structure with placeholder index files

---

#### Task 2: Design Tokens (2 hours)

**Action**: Implement TypeScript token files

**Files to Create:**

1. `src/design-system/tokens/colors.ts`

```typescript
export const colors = {
  // Spark theme (target design)
  void: {
    DEFAULT: '#0A0A0A',
    lighter: '#121212',
    lightest: '#1A1A1A',
  },
  spark: {
    DEFAULT: '#00F0FF',
    dim: '#00BCD4',
    glow: 'rgba(0, 240, 255, 0.25)',
  },
  // ... full palette per DESIGN_MODULE_SPEC.md
}

export const colorsRGB = {
  void: '10, 10, 10',
  spark: '0, 240, 255',
  // ... RGB values for CSS variables
}
```

2. `src/design-system/tokens/typography.ts`
3. `src/design-system/tokens/spacing.ts`
4. `src/design-system/tokens/shadows.ts`
5. `src/design-system/tokens/animation.ts`

**Reference**: Full spec in `DESIGN_MODULE_SPEC.md` lines 162-344

**Deliverable**: 5 token files with full type definitions

---

#### Task 3: Update Tailwind Config (1 hour)

**Action**: Wire design tokens into `tailwind.config.ts`

**Changes:**

```typescript
import { colors } from './src/design-system/tokens/colors'
import { typography } from './src/design-system/tokens/typography'
// ... other imports

export default {
  theme: {
    extend: {
      colors: {
        void: colors.void,
        spark: colors.spark,
        // ... map all tokens
      },
      fontFamily: typography.fontFamily,
      // ... etc
    }
  }
}
```

**Deliverable**: Updated `tailwind.config.ts` with token imports

---

#### Task 4: Update CSS Variables (1 hour)

**Action**: Migrate `src/styles/tokens.css` to Spark colors

**Current (emerald):**

```css
--color-brand: 15 179 76;
```

**Target (spark):**

```css
--color-spark: 0 240 255;
--color-brand: var(--color-spark); /* alias for backward compat */
```

**Strategy**: Use aliases to avoid breaking existing references

**Deliverable**: Updated `tokens.css` with Spark color values

---

#### Task 5: Add Fonts (30 min)

**Action**: Add font imports to `src/styles/fonts.css`

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
```

**Ensure**: Import in `src/styles/index.css`

**Deliverable**: Fonts load correctly (verify in DevTools Network tab)

---

#### Task 6: Core Components (8-10 hours)

**Action**: Implement design system components per spec

**Components to Build:**

1. **Button** – 5 variants (primary, secondary, ghost, danger, success), 4 sizes
2. **Card** – 3 variants (default, interactive, glow), sub-components (Header, Title, Content, Footer)
3. **Badge** – 4 variants (armed, triggered, paused, default), 3 sizes
4. **Alert** – 3 variants (armed, triggered, paused), with actions slot
5. **Modal** – 4 sizes (sm, md, lg, full), backdrop, animations
6. **Input** – 3 sizes (sm, md, lg), error/success states, icon support

**Reference**: Full component APIs in `DESIGN_MODULE_SPEC.md` lines 462-858

**Requirements:**

- ✅ Use design tokens (NO hardcoded colors)
- ✅ Framer Motion for animations
- ✅ Accessible (keyboard nav, ARIA labels, focus states)
- ✅ Unit tests for each component

**Deliverable**: 6 components with tests

---

#### Task 7: Backward Compatibility Shims (1 hour)

**Action**: Create re-exports in `src/components/ui/` to avoid breaking imports

**Example:**

```typescript
// src/components/ui/Button.tsx (updated)
export { Button } from '@/design-system/components/Button'
export type { ButtonProps } from '@/design-system/components/Button'

// TODO: design-system: This is a compatibility shim.
// Migrate imports to @/design-system directly. (Codex step 2+)
```

**Deliverable**: Shim files for all migrated components

---

#### Task 8: Public API (30 min)

**Action**: Create `src/design-system/index.ts` with clean exports

```typescript
// Tokens
export * from './tokens'

// Components
export {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Badge,
  Alert,
  Modal,
  Input,
} from './components'

// Utils
export { cn } from './utils/cn'
export { haptic } from './utils/haptic'
```

**Deliverable**: Clean public API for consumers

---

### Acceptance Criteria (Step 1)

#### Must Have ✅

- [ ] `src/design-system/` folder structure exists
- [ ] All token files implemented (colors, typography, spacing, shadows, animation)
- [ ] `tailwind.config.ts` imports and uses design tokens
- [ ] `src/styles/tokens.css` migrated to Spark colors
- [ ] Fonts load correctly (Space Grotesk, Inter, JetBrains Mono)
- [ ] 6 core components implemented (Button, Card, Badge, Alert, Modal, Input)
- [ ] All components have unit tests
- [ ] All components use design tokens (no hardcoded values)
- [ ] Backward compatibility shims in place
- [ ] `src/design-system/index.ts` public API works
- [ ] **Zero visual regressions** on existing pages
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes

#### Nice to Have 🎁

- [ ] Haptic feedback utilities
- [ ] Motion utilities (Framer Motion helpers)
- [ ] Storybook stories for components
- [ ] Visual regression tests (Percy/Chromatic)

### Step 1 progress snapshot (Codex · 2025-12-05)

- ✅ `src/design-system/` established with token modules, utils barrel, and public API (`src/design-system/index.ts`)
- ✅ Spark/Void token values wired through both TypeScript (`src/design-system/tokens/*`) and CSS (`src/styles/tokens.css`)
- ✅ Tailwind exposes Spark/Void colors, gradients, and glows to unblock DS utility classes (`bg-spark`, `shadow-glow-spark`, etc.)
- ✅ Core components (`Button`, `Card`, `Alert`, `Modal`) implemented under `src/design-system/components/` with matching unit tests
- ✅ Compatibility shims (`src/components/ui/{Button,Card,Alert,Modal}.tsx`) re-export the new implementations for future migrations
- ✅ Fonts updated via `src/styles/fonts.css` + `index.css` (Inter + Space Grotesk + JetBrains Mono)
- ⚠️ Screens/pages remain untouched—consumer migration stays deferred to Step 2+

---

## Explicit Boundaries for Step 1

### ✅ ALLOWED in Step 1

1. **Create** `src/design-system/` folder and all subfolders
2. **Create** new token files (`.ts`, `.tsx`)
3. **Update** `tailwind.config.ts` (add imports, wire tokens)
4. **Update** `src/styles/tokens.css` (change color values)
5. **Update** `src/styles/fonts.css` (add font imports)
6. **Create** new component files in `src/design-system/components/`
7. **Create** unit test files (`.test.tsx`)
8. **Update** `src/components/ui/` files **ONLY** to add re-export shims
9. **Add** harmless `// TODO: design-system: ...` comments in existing components

### ❌ FORBIDDEN in Step 1

1. **DO NOT** change any page files (`src/pages/*.tsx`)
2. **DO NOT** change any existing component logic in `src/components/` (except shims)
3. **DO NOT** change any layout components (`DashboardShell`, `JournalLayout`, etc.)
4. **DO NOT** change any store files (`src/store/*.ts`)
5. **DO NOT** delete any existing files
6. **DO NOT** rename any existing exports
7. **DO NOT** change any existing component props or APIs
8. **DO NOT** perform mass class name replacements across the codebase
9. **DO NOT** migrate any screens to the new design system (that's Step 2+)
10. **DO NOT** change routing (`src/routes/`)

### 🟡 CONDITIONAL (Only if Zero Risk)

1. **MAY** add `// TODO: design-system: candidate for migration` comments
2. **MAY** update import paths in `src/components/ui/` to point to design system (via shims)

---

## Success Criteria

### Functional Success

- ✅ Design system components are fully functional
- ✅ All tests pass (`pnpm test`)
- ✅ No TypeScript errors (`pnpm typecheck`)
- ✅ No ESLint errors (`pnpm lint`)
- ✅ Storybook runs without errors (if applicable)

### Visual Success

- ✅ **Existing pages look identical** – zero visual regressions
- ✅ New components render correctly in isolation (Storybook or test pages)
- ✅ Fonts load on first render (no FOUT/FOIT)
- ✅ Colors match design spec (Spark cyan, Void black)

### Code Quality

- ✅ All components use design tokens (no hardcoded values)
- ✅ All components are accessible (WCAG AA)
- ✅ All components have unit tests (>80% coverage)
- ✅ Code follows existing patterns (`cn()` utility, Framer Motion conventions)
- ✅ JSDoc comments for all public APIs

### Documentation

- ✅ `README.md` in `src/design-system/` with usage guide
- ✅ Component props documented (JSDoc)
- ✅ Usage examples in component files or Storybook

---

## Future Steps Preview

### Step 2: Migrate Dashboard (Core Product)

**Goal**: Migrate `DashboardPageV2` to use new design system

**Scope**:

- Replace legacy Button/Card/Badge with design system versions
- Update KPI components to use new tokens
- Verify no functional regressions
- Update tests

**Duration**: 1-2 days

---

### Step 3: Migrate Journal (Core Product)

**Goal**: Migrate `JournalPageV2` to use new design system

**Scope**:

- Update JournalList, JournalDetailPanel, JournalInsightsPanel
- Migrate journal-specific components
- Update Analytics dashboard
- Hero's journey styling updates

**Duration**: 3-4 days

---

### Step 4: Migrate Alerts (Core Product)

**Goal**: Migrate `AlertsPageV2` to use new design system

**Scope**:

- Update AlertRuleBuilder (form-heavy)
- Migrate Backtest panel
- Update alert cards and status badges

**Duration**: 2-3 days

---

### Step 5: Migrate Secondary Surfaces

**Goal**: Migrate Settings, Watchlist, Chart, Analysis pages

**Duration**: 3-5 days

---

### Step 6: Migrate Marketing Surfaces

**Goal**: Migrate Landing, Showcases

**Duration**: 2-3 days

---

### Step 7: Cleanup Legacy

**Goal**: Remove old `src/components/ui/` components

**Scope**:

- Remove backward compatibility shims
- Update all imports to use `@/design-system`
- Remove legacy token aliases
- Final documentation update

**Duration**: 1 day

---

## Appendix: File Checklist for Codex

### Files to CREATE (Step 1)

```
src/design-system/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── shadows.ts
│   ├── animation.ts
│   └── index.ts
├── theme/
│   ├── sparkTheme.ts
│   └── index.ts
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx
│   ├── Card/
│   │   ├── Card.tsx
│   │   └── Card.test.tsx
│   ├── Badge/
│   │   ├── Badge.tsx
│   │   └── Badge.test.tsx
│   ├── Alert/
│   │   ├── Alert.tsx
│   │   └── Alert.test.tsx
│   ├── Modal/
│   │   ├── Modal.tsx
│   │   └── Modal.test.tsx
│   ├── Input/
│   │   ├── Input.tsx
│   │   └── Input.test.tsx
│   └── index.ts
├── utils/
│   ├── cn.ts
│   └── haptic.ts
├── index.ts
└── README.md
```

### Files to UPDATE (Step 1)

```
tailwind.config.ts                  # Wire design tokens
src/styles/tokens.css               # Migrate to Spark colors
src/styles/fonts.css                # Add font imports
src/styles/index.css                # Ensure fonts.css imported
src/components/ui/Button.tsx        # Add shim re-export
src/components/ui/Card.tsx          # Add shim re-export
src/components/ui/Badge.tsx         # Add shim re-export
src/components/ui/Input.tsx         # Add shim re-export
src/components/ui/Modal.tsx         # Add shim re-export
```

### Files to NEVER TOUCH (Step 1)

```
src/pages/**/*.tsx                  # All pages
src/components/dashboard/**         # Dashboard components
src/components/journal/**           # Journal components
src/components/alerts/**            # Alerts components
src/store/**                        # All stores
src/routes/**                       # Routing
```

---

## Codex Step 1 – Final Checklist

**Before Starting:**

- [ ] Read `docs/design/DESIGN_SYSTEM.md` (design spec)
- [ ] Read `docs/design/DESIGN_MODULE_SPEC.md` (implementation guide)
- [ ] Read this document (`PHASE4_MIGRATION.md`)
- [ ] Understand the "FORBIDDEN" list

**During Development:**

- [ ] Run `pnpm typecheck` after each major change
- [ ] Run `pnpm lint` before committing
- [ ] Run `pnpm test` to ensure no test failures
- [ ] Visually check `DashboardPageV2` (should look identical)
- [ ] Visually check `JournalPageV2` (should look identical)

**Before Marking Step 1 Complete:**

- [ ] All tasks in [Codex Step 1 – Scope Definition](#codex-step-1--scope-definition) completed
- [ ] All [Acceptance Criteria](#acceptance-criteria-step-1) met
- [ ] Zero visual regressions confirmed
- [ ] All tests passing
- [ ] Documentation updated
- [ ] PR submitted with clear description

---

**End of Phase 4 Migration Plan**

*This document defines the boundaries for Codex Step 1. No production code will be changed. Only design system foundations will be built.*

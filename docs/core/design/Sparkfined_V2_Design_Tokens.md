# Sparkfined V2 Design Tokens

**Version:** 1.0
**Date:** 2025-11-20
**Status:** Specification for Implementation
**Author:** Claude 4.5 (UI/UX Architect)

---

## Executive Summary

This document defines the **final design token system** for Sparkfined V2 pages. The goal is to replace all remaining hardcoded colors and ad-hoc spacing with semantic Tailwind tokens, creating a coherent, maintainable visual system.

**Key Findings:**
- ✅ **No hardcoded hex colors** (e.g., `bg-[#...]`) found in V2 pages
- ⚠️ **Opacity-based colors** (e.g., `white/5`, `black/30`) are prevalent and need semantic replacements
- ⚠️ **One gradient** using hardcoded hex values in `DashboardShell.tsx`
- ✅ **Good foundation** exists in `tailwind.config.ts` with semantic tokens
- ✅ **Consistent spacing** patterns across V2 pages

---

## 1. Current Token Inventory

### 1.1 Existing Tokens (from tailwind.config.ts)

The current `tailwind.config.ts` provides:

**Color Tokens:**
```ts
colors: {
  // Brand & Accents
  brand: { DEFAULT: '#0fb34c', hover: '#059669' },
  accent: '#00ff66',

  // Backgrounds
  bg: '#0a0a0a',
  surface: { DEFAULT: '#18181b', hover: '#27272a', '850': '#1c1c1e' },

  // Borders
  border: { DEFAULT: '#27272a', accent: '#0fb34c' },

  // Text
  text: { primary: '#f4f4f5', secondary: '#a1a1aa', tertiary: '#71717a' },

  // Semantic
  success: '#10b981',
  danger: '#f43f5e',
  bull: '#10b981',
  bear: '#f43f5e',
  info: '#06b6d4',
  warn: '#f59e0b',

  // Full Palettes
  zinc: { 50-950 },
  emerald: { 50-950 },
  rose: { 50-950 },
  cyan: { 50-950 },
  amber: { 50-950 },
  slate: { 50-950 },
}
```

**Spacing, Typography, Border Radius:**
- Spacing: 8px grid system (0.5 → 96)
- Border radius: sm (6px), md (8px), lg (12px), xl (16px), 2xl (20px), 3xl (24px)
- Typography: xs → 7xl with line heights

### 1.2 Hardcoded Values Found

#### Background Gradient (1 instance)
**Location:** `src/components/dashboard/DashboardShell.tsx:32`
```tsx
// Current (hardcoded)
className="bg-gradient-to-b from-[#050505] via-[#0b0b13] to-[#050505]"
```

#### Opacity-Based Colors (24+ instances)

**Card Backgrounds:**
- `bg-white/5` — Loading skeletons, KPI tiles
- `bg-black/30` — Card surfaces, table backgrounds
- `bg-black/20` — Empty states, inactive cards
- `bg-black/40` — Error/warning containers

**Card Borders:**
- `border-white/5` — Subtle borders (cards, headers)
- `border-white/10` — Standard borders (tables, badges)
- `border-white/15` — Hover borders

**Hover States:**
- `hover:bg-white/5` — Interactive element hover
- `bg-surface-hover` — Already using token (good!)

**Active/Selected States:**
- `border-emerald-400/60` — Active card border
- `bg-emerald-500/10` — Bull sentiment backgrounds
- `bg-rose-500/10` — Bear sentiment backgrounds
- `bg-amber-500/10` — Warning/armed status
- `bg-sky-500/10` — Info/snoozed status

**Dividers:**
- `divide-white/5` — List dividers

---

## 2. Final Token Schema (Proposal)

### 2.1 Enhanced Color Tokens

Add these tokens to `tailwind.config.ts` to replace opacity-based colors:

```ts
colors: {
  // ... existing tokens ...

  // === BACKGROUNDS (Enhanced) ===
  bg: {
    DEFAULT: '#0a0a0a',           // Main app background
    elevated: '#0b0b13',          // Gradient via point
    surface: '#18181b',           // Card backgrounds (replaces black/30)
    'surface-subtle': '#0f0f12',  // Loading skeletons (replaces black/20)
    overlay: '#050505',           // Modal/dropdown overlays
  },

  // === SURFACE VARIATIONS (New) ===
  surface: {
    DEFAULT: '#18181b',           // Standard cards
    hover: '#27272a',            // Hover state (existing)
    elevated: '#1c1c1e',         // Elevated cards (existing as 850)
    subtle: '#131316',           // Subtle surfaces (replaces black/20)
    skeleton: 'rgba(255,255,255,0.05)',  // Loading skeletons (replaces white/5)
  },

  // === BORDERS (Enhanced) ===
  border: {
    DEFAULT: '#27272a',          // Standard borders
    subtle: 'rgba(255,255,255,0.05)',     // Very subtle (replaces white/5)
    moderate: 'rgba(255,255,255,0.1)',    // Moderate (replaces white/10)
    hover: 'rgba(255,255,255,0.15)',      // Hover state (replaces white/15)
    accent: '#0fb34c',           // Brand accent (existing)
    focus: '#10b981',            // Focus rings
  },

  // === INTERACTIVE STATES (New) ===
  interactive: {
    hover: 'rgba(255,255,255,0.05)',      // Hover overlay (replaces hover:bg-white/5)
    active: 'rgba(255,255,255,0.08)',     // Active/pressed state
    disabled: 'rgba(255,255,255,0.02)',   // Disabled state
  },

  // === SENTIMENT BACKGROUNDS (New) ===
  sentiment: {
    bull: {
      DEFAULT: '#10b981',                 // Solid (existing as bull)
      bg: 'rgba(16,185,129,0.1)',        // Background (replaces emerald-500/10)
      border: 'rgba(16,185,129,0.6)',    // Border (replaces emerald-400/60)
    },
    bear: {
      DEFAULT: '#f43f5e',                 // Solid (existing as bear)
      bg: 'rgba(244,63,94,0.1)',         // Background (replaces rose-500/10)
      border: 'rgba(251,113,133,0.6)',   // Border (replaces rose-400/60)
    },
    neutral: {
      DEFAULT: '#f59e0b',                 // Amber for neutral
      bg: 'rgba(245,158,11,0.1)',        // Background (replaces amber-500/10)
      border: 'rgba(251,191,36,0.6)',    // Border
    },
  },

  // === STATUS BACKGROUNDS (New) ===
  status: {
    armed: {
      bg: 'rgba(245,158,11,0.1)',        // Amber bg
      text: '#fcd34d',                    // Amber-300
    },
    triggered: {
      bg: 'rgba(16,185,129,0.1)',        // Emerald bg
      text: '#6ee7b7',                    // Emerald-300
    },
    snoozed: {
      bg: 'rgba(14,165,233,0.1)',        // Sky bg
      text: '#7dd3fc',                    // Sky-300
    },
  },

  // === TEXT (Existing - keep as is) ===
  text: {
    primary: '#f4f4f5',    // Main text (zinc-100)
    secondary: '#a1a1aa',  // Secondary text (zinc-400)
    tertiary: '#71717a',   // Muted text (zinc-500)
  },
}
```

### 2.2 Background Gradients (New)

Add to `backgroundImage` section:

```ts
backgroundImage: {
  // ... existing ...
  'app-gradient': 'linear-gradient(to bottom, #050505 0%, #0b0b13 50%, #050505 100%)',
  'surface-gradient': 'linear-gradient(135deg, #18181b 0%, #1c1c1e 100%)',
}
```

---

## 3. Token Mapping Table

### 3.1 Background Replacements

| Context | Current Class | New Token Class | Usage |
|---------|--------------|-----------------|-------|
| App background | `from-[#050505] via-[#0b0b13] to-[#050505]` | `bg-app-gradient` | DashboardShell main bg |
| Card surface | `bg-black/30` | `bg-surface` | Cards, tables, panels |
| Subtle surface | `bg-black/20` | `bg-surface-subtle` | Empty states, inactive items |
| Overlay | `bg-black/40` | `bg-surface-elevated` | Modals, error containers |
| Loading skeleton | `bg-white/5` | `bg-surface-skeleton` | Pulse animations |
| Hover overlay | `hover:bg-white/5` | `hover:bg-interactive-hover` | Interactive elements |

### 3.2 Border Replacements

| Context | Current Class | New Token Class | Usage |
|---------|--------------|-----------------|-------|
| Subtle border | `border-white/5` | `border-border-subtle` | Cards, headers, KPI tiles |
| Standard border | `border-white/10` | `border-border-moderate` | Tables, badges, containers |
| Hover border | `hover:border-white/15` | `hover:border-border-hover` | Interactive borders |
| Active border (bull) | `border-emerald-400/60` | `border-sentiment-bull-border` | Selected bull items |
| Active border (bear) | `border-rose-400/60` | `border-sentiment-bear-border` | Selected bear items |
| Dashed empty state | `border-dashed border-white/10` | `border-dashed border-border-moderate` | Empty state containers |

### 3.3 Sentiment/Direction Colors

| Context | Current Class | New Token Class | Usage |
|---------|--------------|-----------------|-------|
| Bull background | `bg-emerald-500/10` | `bg-sentiment-bull-bg` | Long badges, bullish highlights |
| Bull text | `text-emerald-300` | `text-emerald-300` | (Keep - part of palette) |
| Bear background | `bg-rose-500/10` | `bg-sentiment-bear-bg` | Short badges, bearish highlights |
| Bear text | `text-rose-300` | `text-rose-300` | (Keep - part of palette) |
| Neutral background | `bg-amber-500/10` | `bg-sentiment-neutral-bg` | Neutral/flat badges |
| Neutral text | `text-amber-200` | `text-amber-200` | (Keep - part of palette) |

### 3.4 Status Colors (Alerts)

| Context | Current Class | New Token Class | Usage |
|---------|--------------|-----------------|-------|
| Armed status bg | `bg-amber-500/10` | `bg-status-armed-bg` | Armed alert badges |
| Armed status text | `text-amber-300` | `text-status-armed-text` | Armed alert text |
| Triggered status bg | `bg-emerald-500/10` | `bg-status-triggered-bg` | Triggered alert badges |
| Triggered status text | `text-emerald-300` | `text-status-triggered-text` | Triggered alert text |
| Snoozed status bg | `bg-sky-500/10` | `bg-status-snoozed-bg` | Snoozed alert badges |
| Snoozed status text | `text-sky-300` | `text-status-snoozed-text` | Snoozed alert text |

### 3.5 Text Colors (No Changes)

| Context | Current Class | New Token Class | Usage |
|---------|--------------|-----------------|-------|
| Primary text | `text-white`, `text-zinc-100` | `text-text-primary` | Headers, main content |
| Secondary text | `text-zinc-400` | `text-text-secondary` | Descriptions, labels |
| Tertiary text | `text-zinc-500` | `text-text-tertiary` | Muted labels, hints |

### 3.6 Dividers

| Context | Current Class | New Token Class | Usage |
|---------|--------------|-----------------|-------|
| List dividers | `divide-white/5` | `divide-border-subtle` | Watchlist rows, alert lists |

---

## 4. Layout & Rhythm Guidelines

### 4.1 Standard Card Pattern

**Card Wrapper:**
```tsx
<div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3 sm:px-6 sm:py-4">
  {/* Card content */}
</div>
```

**Card with Hover:**
```tsx
<button className="rounded-2xl border border-border-moderate bg-surface hover:bg-interactive-hover transition">
  {/* Interactive card content */}
</button>
```

**Active/Selected Card:**
```tsx
<div className="rounded-2xl border border-sentiment-bull-border bg-interactive-active">
  {/* Active card content */}
</div>
```

### 4.2 Header Pattern (DashboardShell)

**Current:**
```tsx
<header className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
    {/* Header content */}
  </div>
</header>
```

**With Tokens:**
```tsx
<header className="border-b border-border-subtle bg-surface-elevated/60 backdrop-blur-xl">
  <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
    {/* Header content */}
  </div>
</header>
```

### 4.3 KPI Tile Pattern

**Current:**
```tsx
<div className="rounded-2xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur">
  <span className="text-xs uppercase tracking-widest text-zinc-400">{label}</span>
  <span className="text-2xl font-mono font-semibold text-white">{value}</span>
</div>
```

**With Tokens:**
```tsx
<div className="rounded-2xl border border-border-subtle bg-surface-skeleton px-4 py-3 backdrop-blur">
  <span className="text-xs uppercase tracking-widest text-text-secondary">{label}</span>
  <span className="text-2xl font-mono font-semibold text-text-primary">{value}</span>
</div>
```

### 4.4 Table/List Pattern

**Table Wrapper:**
```tsx
<div className="rounded-2xl border border-border-moderate bg-surface">
  <div className="divide-y divide-border-subtle">
    {/* Rows */}
  </div>
</div>
```

**Row (Inactive):**
```tsx
<div className="px-4 py-4 hover:bg-interactive-hover cursor-pointer transition">
  {/* Row content */}
</div>
```

**Row (Active):**
```tsx
<div className="px-4 py-4 border-l-4 border-sentiment-bull-border bg-interactive-active">
  {/* Active row content */}
</div>
```

### 4.5 Empty State Pattern

```tsx
<div className="rounded-2xl border border-dashed border-border-moderate bg-surface-subtle px-6 py-10 text-center">
  <p className="text-base font-semibold text-text-primary">No data yet</p>
  <p className="mt-2 text-sm text-text-secondary">Description of what will appear here.</p>
</div>
```

### 4.6 Loading Skeleton Pattern

```tsx
<div className="space-y-3">
  {Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="h-16 rounded-2xl bg-surface-skeleton animate-pulse" />
  ))}
</div>
```

### 4.7 Badge Pattern

**Direction Badge (Long):**
```tsx
<span className="inline-flex items-center rounded-full bg-sentiment-bull-bg px-3 py-1 text-xs font-semibold text-emerald-200">
  LONG
</span>
```

**Direction Badge (Short):**
```tsx
<span className="inline-flex items-center rounded-full bg-sentiment-bear-bg px-3 py-1 text-xs font-semibold text-rose-200">
  SHORT
</span>
```

**Status Badge (Armed):**
```tsx
<span className="inline-flex items-center rounded-full bg-status-armed-bg px-3 py-1 text-xs font-semibold text-status-armed-text">
  Armed
</span>
```

### 4.8 Spacing Rhythm

**Vertical Spacing:**
- Between major sections: `space-y-6` (24px)
- Between cards in list: `space-y-3` (12px)
- Within card sections: `space-y-2` (8px) or `space-y-3` (12px)

**Horizontal Spacing:**
- Grid gaps (major): `gap-6` (24px)
- Grid gaps (moderate): `gap-4` (16px)
- Inline elements: `gap-2` (8px) or `gap-3` (12px)

**Padding:**
- Cards (mobile): `px-4 py-3` (16px × 12px)
- Cards (desktop): `sm:px-6 sm:py-4` (24px × 16px)
- Page container: `px-4 sm:px-6 lg:px-8` (16px → 24px → 32px)
- Section vertical: `py-10` (40px) for main content areas

**Border Radius:**
- Cards, panels: `rounded-2xl` (20px)
- Badges, pills: `rounded-full`
- Small cards, badges: `rounded-xl` (16px)

---

## 5. Acceptance Criteria for Codex

When implementing this spec, verify:

### 5.1 Color Token Usage

- [ ] **No hardcoded gradients:** `from-[#...]`, `via-[#...]`, `to-[#...]` replaced with `bg-app-gradient`
- [ ] **No opacity-based backgrounds:** All `bg-white/X` and `bg-black/X` replaced with semantic tokens
- [ ] **No opacity-based borders:** All `border-white/X` replaced with `border-border-*` tokens
- [ ] **Consistent sentiment colors:** All bull/bear/neutral use `bg-sentiment-*` tokens
- [ ] **Consistent status colors:** All alert statuses use `bg-status-*` tokens

### 5.2 Component Patterns

- [ ] **All cards** follow standard card pattern (Section 4.1)
- [ ] **All KPI tiles** use consistent structure (Section 4.3)
- [ ] **All tables/lists** use divider pattern (Section 4.4)
- [ ] **All empty states** use dashed border pattern (Section 4.5)
- [ ] **All loading skeletons** use `bg-surface-skeleton` (Section 4.6)
- [ ] **All badges** follow badge patterns (Section 4.7)

### 5.3 Layout Consistency

- [ ] **Spacing rhythm** matches guidelines (Section 4.8)
- [ ] **Border radius** consistent across all V2 pages
- [ ] **Padding** follows mobile-first responsive pattern
- [ ] **Grid gaps** consistent for similar layouts

### 5.4 V2 Pages Checklist

For each page, verify token usage:

- [ ] `DashboardPageV2.tsx` — App gradient, skeleton colors, card backgrounds
- [ ] `JournalPageV2.tsx` — List borders, dividers, active states
- [ ] `WatchlistPageV2.tsx` — Table borders, row hover/active, sentiment badges
- [ ] `AlertsPageV2.tsx` — Status badges, card backgrounds, borders
- [ ] `AnalysisPageV2.tsx` — Stat cards, skeleton states, trend highlights
- [ ] `ChartPageV2.tsx` — Wrapper border and background
- [ ] `SettingsPageV2.tsx` — Wrapper border and background

### 5.5 Core Components Checklist

- [ ] `DashboardShell.tsx` — Header border, background gradient, tab styles
- [ ] `DashboardKpiStrip.tsx` — Tile backgrounds, borders, trend badges
- [ ] `JournalList.tsx` — List item borders, active state, dividers
- [ ] `WatchlistTable.tsx` — Table borders, row states, session badges
- [ ] `AlertsList.tsx` — Card borders, status badges, type badges

### 5.6 Visual Regression Checks

After implementation:

- [ ] **Screenshot comparison:** V2 pages before/after should look nearly identical (only subtle refinements)
- [ ] **Dark mode integrity:** All token changes work in dark mode (no light mode currently)
- [ ] **Hover states:** Interactive elements still show clear hover feedback
- [ ] **Active states:** Selected items remain visually distinct
- [ ] **Loading states:** Skeletons still pulse smoothly
- [ ] **Empty states:** Still clearly communicate "no data" state

---

## 6. Implementation Priority

**Phase 1 (Codex — High Priority):**
1. Update `tailwind.config.ts` with new color tokens (Section 2.1)
2. Add background gradients (Section 2.2)
3. Replace hardcoded gradient in `DashboardShell.tsx`
4. Replace opacity-based colors in all V2 pages (use mapping table)

**Phase 2 (Codex — Medium Priority):**
5. Replace opacity-based colors in core components (DashboardKpiStrip, etc.)
6. Normalize spacing patterns across all V2 pages

**Phase 3 (Future — Low Priority):**
7. Extend token system for future light mode support
8. Add theme variants for "Hero's Journey" theming (if planned)

---

## 7. Open Questions & Future Considerations

### 7.1 Open Questions (to be resolved)

**DT-01:** Should we create a `backdrop-blur` token instead of using `backdrop-blur-xl` directly?
**Recommendation:** Keep as utility class for now, revisit if we add more blur variations.

**DT-02:** Should loading skeleton use `bg-surface-skeleton` or `bg-interactive-hover`?
**Recommendation:** Use `bg-surface-skeleton` to differentiate from hover state.

**DT-03:** Should we add `border-border-active` for selected states or keep using sentiment borders?
**Recommendation:** Keep using sentiment borders (`border-sentiment-bull-border`) for direction-aware active states.

### 7.2 Future Enhancements

**Light Mode:**
When adding light mode, extend tokens with:
```ts
colors: {
  bg: {
    light: '#ffffff',
    dark: '#0a0a0a', // current DEFAULT
  },
  // ... etc.
}
```

**Theming (Hero's Journey):**
If implementing multi-theme support, consider CSS custom properties approach or Tailwind's built-in dark mode variant system extended to multiple themes.

---

## 8. Reference Links

- **Tailwind Config:** `/tailwind.config.ts`
- **V2 Pages:** `/src/pages/*PageV2.tsx`
- **Core Components:** `/src/components/dashboard/`, `/src/components/journal/`, etc.
- **Working Plan:** `/Sparkfined_Working_Plan.md` (Section 5)
- **CLAUDE.md:** Project rules and conventions

---

## Revision History

| Date | Version | Author | Changes |
|------|---------|--------|---------|
| 2025-11-20 | 1.0 | Claude 4.5 | Initial specification created |

---

**Next Steps for Codex:**
1. Review this spec with human stakeholder (if needed)
2. Implement Phase 1 changes (tailwind.config.ts updates + V2 page token replacements)
3. Run visual regression checks
4. Update Section 5A summary in Working Plan
5. Mark Section 5 complete and proceed to Section 6 (if applicable)

# Cursor Rules — Frontend (React + PWA + UI/UX)

> **Source:** `.rulesync/02-frontend-arch.md` + `.rulesync/03-pwa-conventions.md` + `.rulesync/04-ui-ux-components.md`
>
> **Purpose:** React architecture, PWA patterns, and component conventions for UI development.

---

## React Architecture

### 5-Layer Model
```
Layer 5: UI (Pages, Sections, Components)
Layer 4: State & Hooks (Zustand, React-Context, Custom-Hooks)
Layer 3: Persistence (Dexie/IndexedDB)
Layer 2: Backend (Vercel Edge Functions)
Layer 1: External Services (Moralis, DexPaprika, OpenAI)
```

**Rule:** UI-Layer never imports from Backend-Layer directly (use Hooks/State).

### File-Structure
```
src/
  pages/          — Full-page components (Market.tsx, Journal.tsx)
  sections/       — Page-sections (ChartSection, SignalMatrix)
  components/     — Reusable components
    ui/           — Primitives (Button, Input, Card)
  hooks/          — Custom hooks (useTokenData, useAccessGate)
  lib/            — Pure utilities (fetch, format, calculate)
  state/          — React-Context (settings, ai-provider)
  store/          — Zustand stores (accessStore)
  types/          — Type definitions
```

### State-Management Hierarchy
1. **Local-State** (useState) — Component-only (e.g. form-input)
2. **React-Context** — Feature-scoped (e.g. AI-Provider, Settings)
3. **Zustand** — Global-state (e.g. Access-Status, Theme)

---

## PWA Conventions

### Offline-First Features (MUST work offline)
- ✅ Journal (read, write, tag-filter)
- ✅ Board/Dashboard (KPI-tiles with cached-data)
- ✅ Charts (last cached OHLC-data)
- ✅ Watchlist (locally persisted)

### Service-Worker Strategy
- **Precache:** All static-assets (JS, CSS, fonts, icons)
- **Cache-First:** Images, fonts
- **Network-First:** API-calls (with fallback to cache)
- **Stale-While-Revalidate:** OHLC-data

**Config:** `vite.config.ts` (vite-plugin-pwa + Workbox)

### Update-Strategy
- `skipWaiting: true` — Auto-update on new Service-Worker
- Show "Reload to Apply Update" toast-notification

---

## Component Conventions

### Component-Taxonomy
```
Level 1: UI-Primitives (Button, Input, Card)
Level 2: Composed-Components (ChartCard, TokenRow)
Level 3: Sections (ChartSection, SignalMatrix)
Level 4: Pages (MarketPage, JournalPage)
```

### Props-Naming
```tsx
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

// ❌ Avoid
interface ButtonProps {
  type: string;  // Too generic
  loading: boolean;  // Prefer isLoading
  click: Function;  // Prefer onClick with specific signature
}
```

### UX-State-Patterns
```tsx
// Loading-State
if (isLoading) return <Spinner />;

// Error-State
if (error) return <ErrorBanner error={error} onRetry={refetch} />;

// Empty-State
if (data.length === 0) return <EmptyState message="No entries found" />;

// Success-State
return <DataTable data={data} />;
```

### Accessibility-Basics
```tsx
// ✅ Good: Semantic HTML + ARIA
<button
  type="button"
  onClick={handleSave}
  disabled={isLoading}
  aria-label="Save journal entry"
>
  {isLoading ? 'Saving...' : 'Save'}
</button>

// ❌ Avoid: Non-semantic + no ARIA
<div onClick={handleSave}>Save</div>
```

---

## Design-Principles

1. **Dark-Mode-First:** Design for dark-mode (Light-Mode not implemented yet)
2. **Information-Density:** Dense-charts, compact-tables (trading-app style)
3. **Action-Proximity:** Actions near related-data (no modals for simple-actions)
4. **Mobile-First:** Tailwind `sm:`, `md:`, `lg:` breakpoints

### Tailwind-Patterns
```tsx
// Mobile-First Responsive
<div className="flex flex-col md:flex-row gap-4">

// Dark-Mode (always dark, no toggle yet)
<div className="bg-gray-900 text-gray-100">

// Variants with clsx
import clsx from 'clsx';
const buttonClass = clsx(
  'px-4 py-2 rounded',
  variant === 'primary' && 'bg-blue-600 text-white',
  variant === 'secondary' && 'bg-gray-700 text-gray-300'
);
```

---

## Related

- Full rules: `.rulesync/02-frontend-arch.md`, `.rulesync/03-pwa-conventions.md`, `.rulesync/04-ui-ux-components.md`

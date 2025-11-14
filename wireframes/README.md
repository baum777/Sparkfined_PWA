# Sparkfined PWA – Wireframes & High-Fidelity Components

This directory contains the complete UI/UX specifications and high-fidelity React/TSX components for the Sparkfined PWA.

## Directory Structure

```
wireframes/
├── README.md                    # This file
├── global-style.md              # Design system & style guide
├── VARIANT_DECISION.md          # Layout variant comparison & recommendations
│
├── Tab Specifications (Markdown)
├── dashboard.md                 # Dashboard tab spec
├── chart.md                     # Chart/Market tab spec
├── journal.md                   # Journal tab spec
├── alerts.md                    # Alerts tab spec
├── settings.md                  # Settings tab spec
│
├── components/                  # Reference UI components (wireframe prototypes)
│   ├── Button.tsx               # Button (Primary, Secondary, Ghost, Destructive)
│   ├── Card.tsx                 # Card (Default, Elevated, Glass)
│   ├── Badge.tsx                # Badge (Success, Warning, Error, Info, Neutral)
│   └── Input.tsx                # Input with label, error, icons
│
└── pages/                       # Reference page implementations (wireframe prototypes)
    ├── DashboardPage.tsx        # Dashboard (Variant 1: KPI Focus)
    ├── ChartPage.tsx            # Chart (Variant 1: Chart Dominance)
    ├── JournalPage.tsx          # Journal (Variant 1: List + Sidebar)
    ├── AlertsPage.tsx           # Alerts (Variant 1: Tabbed List)
    └── SettingsPage.tsx         # Settings (Variant 1: Single Column)

src/
├── components/ui/               # ✅ IMPLEMENTED Production UI components
│   ├── Button.tsx               # Enhanced with leftIcon/rightIcon, isLoading, destructive variant
│   ├── Card.tsx                 # NEW: Card with variants and sub-components
│   ├── Badge.tsx                # NEW: Badge with 5 semantic variants
│   └── Input.tsx                # Enhanced with label, leftIcon/rightIcon, helperText
│
└── pages/                       # ✅ IMPLEMENTED Production pages (V2 versions)
    ├── DashboardPageV2.tsx      # NEW: Dashboard (Variant 1: KPI Focus)
    ├── ChartPageV2.tsx          # NEW: Chart (Variant 1: Chart Dominance)
    ├── JournalPageV2.tsx        # NEW: Journal (Variant 1: List + Sidebar)
    ├── AlertsPageV2.tsx         # NEW: Alerts (Variant 1: Tabbed List)
    └── SettingsPageV2.tsx       # NEW: Settings (Variant 1: Single Column)
```

---

## Quick Start

### 1. Review Design System

Start with **`global-style.md`** to understand:
- Color palette (dark-mode-first)
- Typography (Inter + JetBrains Mono)
- Spacing & layout system
- Core UI component patterns
- Interaction patterns (hover, focus, loading, error states)

### 2. Review Layout Decisions

Read **`VARIANT_DECISION.md`** for:
- Comparison of 3 layout variants per tab
- Scoring matrix (UX Clarity, Info Density, Mobile Friendliness, etc.)
- Final recommendations (all Variant 1 layouts)
- Implementation roadmap (18-24 days, P0/P1 priorities)

### 3. Explore Tab Specifications

Each tab has a dedicated Markdown spec:
- **Purpose** – Why this tab exists
- **Wireframe** – Text-based layout structure
- **Components** – Detailed component props, state, events
- **Layout Variants** – 3 options with pros/cons
- **Data & Parameters** – Expected data models
- **Interactions & UX Details** – User flows, empty/loading/error states
- **Open Questions** – Unresolved design decisions

### 4. Use High-Fidelity Components

**Reusable UI Components** (`components/`):
- `Button` – 4 variants (primary, secondary, ghost, destructive), 3 sizes, loading state
- `Card` – 3 variants (default, elevated, glass), with header/title/content subcomponents
- `Badge` – 5 variants (success, warning, error, info, neutral)
- `Input` – With label, error, helper text, left/right icons

**Page Components** (`pages/`):
- Fully functional React components with mock data
- Tailwind CSS styling (matches `global-style.md`)
- Responsive design (mobile-first breakpoints)
- Interactive states (hover, focus, loading)

---

## Design System Overview

### Colors

**Backgrounds:**
- App: `#0a0a0a` (near-black)
- Surface 1: `#141414` (zinc-900)
- Surface 2: `#1a1a1a` (zinc-800)

**Primary:**
- Accent: `#3b82f6` (blue-500)
- Hover: `#2563eb` (blue-600)

**Semantic:**
- Success: `#22c55e` (green-500) – Gains, confirmations
- Warning: `#f59e0b` (amber-500) – Alerts, cautions
- Error: `#ef4444` (red-500) – Losses, errors
- Info: `#06b6d4` (cyan-500) – Hints

### Typography

**Font Families:**
- UI: `'Inter', system-ui, sans-serif`
- Data/Numbers: `'JetBrains Mono', monospace`

**Scale:**
- H1 (Page Title): `text-3xl` (30px) `font-bold`
- H2 (Section): `text-2xl` (24px) `font-semibold`
- H3 (Subsection): `text-xl` (20px) `font-semibold`
- H4 (Card Title): `text-lg` (18px) `font-medium`
- Body: `text-sm` (14px) `font-normal`

### Spacing

- xs: `space-2` (8px)
- sm: `space-3` (12px)
- md: `space-4` (16px)
- lg: `space-6` (24px)
- xl: `space-8` (32px)

---

## Component Usage Examples

### Button

```tsx
import { Button } from './components/Button';

// Primary CTA
<Button variant="primary" leftIcon={<PlusIcon />}>
  New Entry
</Button>

// Secondary action
<Button variant="secondary" size="sm">
  Cancel
</Button>

// Destructive action
<Button variant="destructive" isLoading={isDeleting}>
  Delete Account
</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from './components/Card';

<Card variant="elevated">
  <CardHeader>
    <CardTitle>Market Movers</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Content goes here...</p>
  </CardContent>
</Card>
```

### Badge

```tsx
import { Badge } from './components/Badge';

<Badge variant="success">+12.5%</Badge>
<Badge variant="error">-5.3%</Badge>
<Badge variant="neutral">Active</Badge>
```

### Input

```tsx
import { Input } from './components/Input';

<Input
  label="Email Address"
  type="email"
  placeholder="you@example.com"
  error={error}
  helperText="We'll never share your email"
  leftIcon={<EmailIcon />}
/>
```

---

## Recommended Layout Variants

All tabs use **Variant 1** (see `VARIANT_DECISION.md` for rationale):

| Tab | Layout | Key Strength |
|-----|--------|--------------|
| **Dashboard** | KPI Focus | Metrics-first, clear hierarchy |
| **Chart** | Chart Dominance | Max chart space (75vh) |
| **Journal** | List + Sidebar | Filters always visible |
| **Alerts** | Tabbed List | Clear simple/advanced separation |
| **Settings** | Single Column | Easy to scan, standard pattern |

---

## Implementation Status

### ✅ Phase 1: Core UI Components (COMPLETED)
**Location:** `src/components/ui/`

- ✅ **Button.tsx** - Enhanced with:
  - leftIcon/rightIcon props
  - isLoading prop (with loading backward compat)
  - destructive variant (with danger backward compat)
  - Maintains all existing functionality

- ✅ **Card.tsx** - NEW component with:
  - 3 variants: default, elevated, glass
  - Sub-components: CardHeader, CardTitle, CardContent
  - Keyboard navigation support (onClick cards)

- ✅ **Badge.tsx** - NEW component with:
  - 5 semantic variants: success, warning, error, info, neutral
  - Consistent with design system colors

- ✅ **Input.tsx** - Enhanced with:
  - label, helperText props
  - leftIcon/rightIcon props
  - Maintains backward compatibility (hint alias for helperText)
  - Forward ref support

**Backward Compatibility:** All enhancements maintain existing API compatibility. Existing code will continue to work without changes.

### ✅ Phase 2: Page Implementations (COMPLETED)
**Location:** `src/pages/*V2.tsx`

All pages implement **Variant 1** layouts (recommended from VARIANT_DECISION.md):

- ✅ **DashboardPageV2.tsx** (Variant 1: KPI Focus)
  - 4 KPI tiles with real data from `useBoardKPIs` hook
  - Activity feed integrated with `useBoardFeed` hook
  - Market movers section (mock data for now)
  - Quick actions bar with navigation buttons

- ✅ **ChartPageV2.tsx** (Variant 1: Chart Dominance)
  - Token search with autocomplete placeholder
  - Timeframe selector (1m → 1w)
  - Chart canvas placeholder (500px height)
  - Active indicators panel
  - On-chain metrics + quick actions
  - Ready for chart library integration (Lightweight Charts or TradingView)

- ✅ **JournalPageV2.tsx** (Variant 1: List + Sidebar)
  - Integrated with existing `useJournal` hook
  - Sidebar with date filters, tag cloud, stats
  - Entry cards with real journal data
  - Search and tag filtering
  - AI Condense button (stub for now)

- ✅ **AlertsPageV2.tsx** (Variant 1: Tabbed List)
  - Tabbed interface (Price Alerts | Signal Rules)
  - Alerts grouped by status (Active → Triggered → Disabled)
  - Toggle switches for enable/disable
  - Status badges with semantic colors
  - Ready for backend integration

- ✅ **SettingsPageV2.tsx** (Variant 1: Single Column)
  - Wallet connection card (stub handler)
  - AI provider selection integrated with `useAISettings` hook
  - Notifications toggle
  - Auto-sync settings
  - Usage stats with progress bars
  - Danger zone section

### 📋 Phase 3: Integration & Enhancement (NEXT)
- [ ] Add V2 pages to router (keep existing pages for now)
- [ ] Modal, Dropdown, Toggle, Tabs components (if needed)
- [ ] Chart library integration (Lightweight Charts recommended)
- [ ] Alert backend integration
- [ ] AI Condense feature completion
- [ ] Mobile responsive testing

---

## Mobile Considerations

All components are **mobile-first**:
- Tailwind breakpoints: `sm:640px`, `md:768px`, `lg:1024px`
- Touch targets: Minimum 48x48px for buttons/toggles
- Sidebars: Convert to modals/bottom sheets on mobile
- Tables: Horizontal scroll or card layout on mobile

---

## Accessibility (WCAG 2.1 AA)

- **Keyboard Navigation:** Tab order follows visual flow
- **Focus Rings:** 2px blue ring with offset (visible on all interactive elements)
- **Color Contrast:** All text meets 4.5:1 (body) or 3:1 (large text)
- **Screen Readers:** Semantic HTML, aria-labels on icons

---

## Integration with Existing Codebase

### Current Project Structure

```
src/
  pages/          — Existing pages (may need refactoring)
  sections/       — Page sections
  components/     — Existing components
    ui/           — UI primitives (Button, Input, etc.)
  hooks/          — Custom hooks
  lib/            — Utilities
  state/          — React Context
  store/          — Zustand stores
  types/          — Type definitions
```

### Migration Strategy

1. **Copy UI components** from `wireframes/components/` → `src/components/ui/`
2. **Replace existing pages** with `wireframes/pages/` implementations
3. **Update imports** to use new component APIs
4. **Add missing dependencies** (react-icons or lucide-react for icons)
5. **Test on staging** before production deploy

---

## Dependencies

**Required:**
- `react` (18.3+)
- `react-dom`
- `tailwindcss` (4.1+)
- Icon library: `react-icons` or `lucide-react` (replace mock icons)

**Chart Integration (for ChartPage):**
- Option 1: `lightweight-charts` (recommended, faster)
- Option 2: `react-tradingview-widget` (more features, heavier)

---

## Next Steps

1. **Approve Designs:** Review components and provide feedback
2. **Icon Library:** Choose between `react-icons` or `lucide-react`
3. **Chart Library:** Decide on Lightweight Charts vs. TradingView
4. **Start Implementation:** Begin with Dashboard (simplest) or Chart (highest impact)

---

## Support & Questions

For questions or feedback:
- Review `global-style.md` for design system details
- Review `VARIANT_DECISION.md` for layout rationale
- Review individual tab specs (`dashboard.md`, `chart.md`, etc.) for detailed interactions

---

**Last Updated:** 2025-11-14  
**Status:** ✅ Ready for implementation  
**Version:** 1.0.0

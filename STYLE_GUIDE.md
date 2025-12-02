# 🎭 Sparkfined Style Guide: Alchemical Trading Interface

## 🌌 Design Philosophy

**"Where Mystical Alchemy Meets Professional Trading"**

Sparkfined combines the arcane mystery of alchemy with the precision of professional trading tools. The interface should feel powerful, focused, and slightly mystical—not gimmicky or overwhelming.

---

## 🎨 Color Palette

### Primary Colors (The Alchemical Elements)

```css
--color-brand: 57 255 20;      /* Phosphor Green #39FF14 - Success, Wins, Confirmation */
--color-accent: 0 240 255;     /* Electric Cyan #00F0FF - Calls, Insights, Information */
--color-warn: 255 184 0;       /* Alchemical Gold #FFB800 - Warnings, Triggered Alerts */
--color-danger: 255 0 110;     /* Blood Magenta #FF006E - Stop-Loss, Risk, Danger */
```

### Background & Surface

```css
--color-bg: 10 10 10;                /* Deep Black */
--color-surface: 24 24 27;           /* Zinc-900 - Card backgrounds */
--color-surface-elevated: 28 28 30;  /* Zinc-850 - Elevated cards */
```

### Status Colors

```css
--color-status-armed: 0 240 255;     /* Cyan - Ready to trigger */
--color-status-triggered: 255 184 0; /* Gold - Activated */
--color-status-snoozed: 113 113 122; /* Zinc-500 - Paused */
```

---

## ✨ Visual Effects

### Glow Effects (Signature Style)

**Purpose:** Subtle mystical enhancement without being distracting.

```css
/* Hover states */
.shadow-glow-cyan          /* 0 0 16px rgba(0, 240, 255, 0.4) */
.shadow-glow-gold          /* 0 0 18px rgba(255, 184, 0, 0.45) */
.shadow-glow-phosphor      /* 0 0 20px rgba(57, 255, 20, 0.5) */

/* Stronger hover */
.shadow-glow-cyan-hover    /* Brighter cyan glow */
.shadow-glow-gold-hover    /* Brighter gold glow */
```

**Usage:**
- Cards on hover
- Active status indicators
- Primary buttons
- Triggered alerts (pulsing)

---

## 🎯 Component Patterns

### Cards

**Structure:**
```tsx
<div className="group relative overflow-hidden rounded-2xl border border-border-moderate 
                bg-gradient-to-br from-surface to-surface-elevated p-6 
                transition-all hover:border-border-hover hover:shadow-glow-cyan">
  {/* Hover gradient overlay */}
  <div className="pointer-events-none absolute inset-0 
                  bg-gradient-to-br from-accent/5 to-transparent 
                  opacity-0 transition-opacity group-hover:opacity-100" />
  
  {/* Content */}
  <div className="relative">
    {/* Your content here */}
  </div>
</div>
```

**Key Features:**
- Gradient backgrounds (`from-surface to-surface-elevated`)
- Hover glow effect
- Overlay gradient on hover (5% opacity)
- Rounded corners (`rounded-2xl` = 1rem)

---

### Buttons

**Primary Button:**
```tsx
<Button variant="primary">
  {/* Phosphor green background with glow */}
</Button>
```

**States:**
- **Hover:** `scale-[1.02]` + brighter glow
- **Active (pressed):** `scale-95` (0.95x)
- **Disabled:** `opacity-60` + no hover effects

**Arrow Suffix:** Add `→` to CTAs for forward momentum.

---

### Status Badges

**Armed (Cyan):**
```tsx
<span className="badge-alchemical armed">
  ⚡ Armed
</span>
```

**Triggered (Gold):**
```tsx
<span className="badge-alchemical triggered">
  🔥 Triggered
</span>
```

**Visual Features:**
- Border + background matching status color (15% opacity)
- Drop shadow with glow effect
- Pulsing animation for triggered state
- Icons for quick recognition

---

### KPI Cards

**Layout:**
```
┌─────────────────────────────┐
│ [Icon]   LABEL              │
│          Value (2xl mono)   │
│                             │
│          [Status Badge]     │
└─────────────────────────────┘
```

**Features:**
- Icon on the left (10x10 w/ colored background)
- Label: uppercase, tracked, tertiary color
- Value: Large mono font (2xl), bold
- Status indicator: badge or live indicator

---

## 📝 Typography

### Font Stack

```css
--font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Usage Guidelines

| Element | Font | Size | Weight | Transform |
|---------|------|------|--------|-----------|
| Page Title | Sans | 2xl-4xl | Bold (700) | None |
| Section Headers | Sans | lg-xl | Bold (700) | None |
| Card Titles | Sans | base-lg | Semibold (600) | None |
| Labels | Sans | xs | Semibold (600) | Uppercase + tracked |
| Data/Numbers | Mono | 2xl-3xl | Bold (700) | None |
| Body Text | Sans | sm-base | Regular (400) | None |

**Text Colors:**
- Primary: `text-text-primary` (zinc-100)
- Secondary: `text-text-secondary` (zinc-400)
- Tertiary: `text-text-tertiary` (zinc-500)

---

## 🎬 Animations & Micro-Interactions

### Button Press

```css
hover:scale-[1.02]    /* Slight scale up */
active:scale-95       /* Press down */
transition-all duration-150
```

### Card Hover

```css
hover:shadow-glow-cyan
hover:border-border-hover
hover:-translate-y-0.5
transition-all duration-200
```

### Status Pulse (Triggered Alerts)

```css
.status-indicator.triggered {
  animation: status-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Loading (Alchemical Spinner)

Use `.alchemical-loader` class for mystical multi-color spinning border.

---

## 🔍 Empty States

**Pattern:**
```tsx
<div className="empty-state-mystical">
  {/* Icon automatically added via ::before (⚗️) */}
  <p className="text-base font-semibold text-text-primary">
    No insights yet
  </p>
  <p className="text-sm text-text-secondary">
    The oracle awaits your first ritual
  </p>
</div>
```

**Features:**
- Dashed cyan border (subtle)
- Gradient background (cyan → phosphor)
- Floating icon animation
- Mystical but informative copy

---

## 📱 Responsive Design

### Breakpoints

```css
sm:  640px   /* Mobile landscape */
md:  768px   /* Tablet portrait */
lg:  1024px  /* Tablet landscape / Small desktop */
xl:  1280px  /* Desktop */
2xl: 1536px  /* Large desktop */
```

### Mobile-First Approach

1. **Base:** Single column, full width cards
2. **sm:** Two-column grids where appropriate
3. **lg:** Multi-column layouts, sidebars visible
4. **xl:** Max content width, more whitespace

---

## ⚠️ Accessibility

### Focus States

All interactive elements must have visible focus:

```css
.focus-ring-alchemical:focus-visible {
  outline: none;
  box-shadow: 
    0 0 0 2px var(--color-surface),
    0 0 0 4px var(--color-accent),
    0 0 12px rgba(0, 240, 255, 0.5);
}
```

### Color Contrast

- Primary text on background: ≥ 7:1 (AAA)
- Secondary text on background: ≥ 4.5:1 (AA)
- Status colors use borders + backgrounds for clarity

### Motion

Respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🎯 UX Principles

### 1. **Clarity Over Mysticism**

Mystical elements should **enhance**, not obscure:
- ✅ Status icons (⚡🔥) for quick recognition
- ✅ Subtle glow effects on hover
- ❌ Obscure symbols without labels
- ❌ Overpowering animations

### 2. **Information Density**

Professional traders need data:
- Show KPIs without scrolling
- Use grids and compact layouts
- Expand details on hover/click

### 3. **Immediate Feedback**

Every action gets a response:
- Button press → scale animation
- Alert triggered → gold glow + pulse
- Form submit → loading state + success message

### 4. **Progressive Disclosure**

Don't overwhelm new users:
- Onboarding: 3 steps, large icons, minimal text
- Tooltips on first visit
- Advanced features behind "⚙️ Settings"

---

## 🚀 Performance

### Critical Metrics

- **Initial Load:** < 2s
- **Time to Interactive:** < 3s
- **Animations:** 60fps (or disable)

### Optimization Strategies

1. **Lazy load** non-critical images
2. **Code split** by route
3. **Preload** critical fonts
4. **Cache** static assets (PWA)

---

## 📦 Component Checklist

When creating a new component:

- [ ] Uses semantic HTML (`<article>`, `<section>`, etc.)
- [ ] Has `data-testid` for E2E tests
- [ ] Includes focus states for keyboard navigation
- [ ] Works on mobile (responsive classes)
- [ ] Has hover/active states (where applicable)
- [ ] Uses design tokens (no hardcoded colors)
- [ ] Respects dark mode (all colors from tokens)
- [ ] Has accessible contrast ratios
- [ ] Includes loading/error states (if async)

---

## 🎨 Naming Conventions

### CSS Classes

- **Status:** `.status-armed`, `.status-triggered`
- **Glow:** `.shadow-glow-cyan`, `.shadow-glow-gold`
- **Badge:** `.badge-alchemical`, `.badge-alchemical.armed`
- **State:** `.empty-state-mystical`, `.loading-state`

### Component Files

- **Pages:** `DashboardPageV2.tsx`
- **Components:** `AlertsList.tsx`, `KpiCard.tsx`
- **Utils:** `calculateKPIs.ts`, `formatDate.ts`

---

## 🔗 Resources

- [Tailwind Config](./tailwind.config.ts)
- [Design Tokens](./src/styles/tokens.css)
- [Alchemical Styles](./src/styles/alchemical.css)
- [Component Library](./src/components/ui/)

---

## ✨ Final Note

**Sparkfined is a tool for traders who take their craft seriously.**

The design should reflect:
- **Professionalism** — not a toy, not a game
- **Clarity** — information at a glance
- **Focus** — no distractions, pure utility
- **Mystery** — a hint of the arcane, but never obscure

**Your edge is not an indicator. It's discipline. The interface reflects that.**

---

*Last Updated: December 2025*

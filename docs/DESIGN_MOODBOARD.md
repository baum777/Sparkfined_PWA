# 🎨 Sparkfined PWA – Visual Design Moodboard

**Version:** 1.0
**Created:** 2025-11-25
**Purpose:** Visual design reference for Sparkfined – Offline-first Trading Command Center

---

## 🌙 Dark-Mode-First Philosophy

> "Traders work in low-light conditions. Dark mode reduces eye strain during marathon analysis sessions."

**Design Principles:**
- **Dark-Mode-Only** (no light mode yet – see ADR-005)
- **High Contrast** for critical information (prices, PnL, alerts)
- **Subtle Backgrounds** to reduce visual fatigue
- **Information Density** over whitespace (trading-app style)

---

## 🎨 Color Palette

### Core Colors (TailwindCSS Variables)

```css
/* ========== BACKGROUNDS ========== */
--surface-base:        #0a0e1a    /* Main background */
--surface:             #12172a    /* Card backgrounds */
--surface-elevated:    #1a2038    /* Elevated cards, modals */
--surface-hover:       #222848    /* Hover states */
--surface-skeleton:    #2a3350    /* Skeleton loaders */

/* ========== TEXT ========== */
--text-primary:        #e8eaed    /* Main text */
--text-secondary:      #9ca3af    /* Secondary text */
--text-tertiary:       #6b7280    /* Subtle text */

/* ========== BORDERS ========== */
--border:              #2a3350    /* Default borders */
--border-subtle:       #1f2937    /* Subtle borders */
--border-hover:        #374151    /* Hover borders */

/* ========== BRAND / ACCENT ========== */
--brand:               #3b82f6    /* Primary blue (accents, focus) */
--brand-hover:         #2563eb    /* Hover state */
--brand-subtle:        #1e3a8a    /* Background tint */

/* ========== SENTIMENT (TRADING) ========== */
--sentiment-bull:      #10b981    /* Green (positive, long, profit) */
--sentiment-bull-bg:   #064e3b    /* Green background */
--sentiment-bear:      #ef4444    /* Red (negative, short, loss) */
--sentiment-bear-bg:   #7f1d1d    /* Red background */

/* ========== STATUS (ALERTS) ========== */
--status-armed:        #f59e0b    /* Amber (armed alert) */
--status-triggered:    #10b981    /* Green (triggered) */
--status-snoozed:      #6b7280    /* Gray (snoozed) */

/* ========== INTERACTIVE ========== */
--interactive-hover:   #1e293b    /* Hover state for buttons */
--interactive-active:  #0f172a    /* Active/pressed state */
```

---

## 📐 Visual Hierarchy

### Information Layers

```
┌─────────────────────────────────────────────┐
│ Layer 1: CRITICAL                           │
│ → Prices, PnL, Alert Triggers               │
│ → High contrast, large font-size            │
│ → sentiment-bull / sentiment-bear           │
├─────────────────────────────────────────────┤
│ Layer 2: PRIMARY                            │
│ → Titles, Main actions, Entry titles        │
│ → text-primary, medium font-weight          │
├─────────────────────────────────────────────┤
│ Layer 3: SECONDARY                          │
│ → Descriptions, Labels, Metadata            │
│ → text-secondary, smaller font-size         │
├─────────────────────────────────────────────┤
│ Layer 4: TERTIARY                           │
│ → Hints, Timestamps, Subtle info            │
│ → text-tertiary, uppercase tracking-wider   │
└─────────────────────────────────────────────┘
```

---

## 🔤 Typography

### Font Stack

```css
font-family:
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  Roboto,
  "Helvetica Neue",
  Arial,
  sans-serif;

/* Monospace for prices, addresses, numbers */
font-family-mono:
  ui-monospace,
  SFMono-Regular,
  "SF Mono",
  Menlo,
  Consolas,
  "Liberation Mono",
  monospace;
```

### Type Scale

```css
/* ========== HEADINGS ========== */
h1: text-2xl   (24px) font-bold    text-text-primary
h2: text-xl    (20px) font-semibold text-text-primary
h3: text-lg    (18px) font-semibold text-text-primary
h4: text-base  (16px) font-medium  text-text-primary

/* ========== BODY ========== */
Body Large:   text-base (16px) text-text-primary
Body Default: text-sm   (14px) text-text-secondary
Body Small:   text-xs   (12px) text-text-tertiary

/* ========== LABELS ========== */
Label:        text-xs   (12px) uppercase tracking-wider font-medium text-text-tertiary

/* ========== NUMBERS (MONO) ========== */
Price:        text-2xl font-mono font-semibold sentiment-bull/bear
Metric:       text-lg  font-mono font-semibold text-text-primary
Address:      text-sm  font-mono text-text-secondary
```

### Usage Examples

```tsx
// Page Title
<h1 className="text-2xl font-bold text-text-primary">Journal</h1>

// Section Title
<h2 className="text-xl font-semibold text-text-primary">Analytics</h2>

// Card Title
<h3 className="text-lg font-semibold text-text-primary">Setup Breakdown</h3>

// Label (uppercase + tracking)
<p className="text-xs uppercase tracking-wider text-text-tertiary">Win Rate</p>

// Body Text
<p className="text-sm text-text-secondary">Select any entry to review notes</p>

// Price (monospace)
<p className="font-mono text-2xl font-semibold text-sentiment-bull">+$1,234.56</p>

// Wallet Address (monospace)
<p className="font-mono text-sm text-text-secondary">DezXAZ8z7Pnr...</p>
```

---

## 📏 Spacing System

### TailwindCSS Spacing Scale

```css
/* Recommended spacing values for Sparkfined */

/* ========== GAPS (Flex/Grid) ========== */
gap-2  (8px)   → Tight grouping (buttons in a row)
gap-3  (12px)  → Default spacing (list items)
gap-4  (16px)  → Section spacing
gap-6  (24px)  → Large section gaps

/* ========== PADDING ========== */
p-2    (8px)   → Tight padding (small buttons)
p-3    (12px)  → Default padding (cards, inputs)
p-4    (16px)  → Comfortable padding (cards)
p-6    (24px)  → Large padding (modals, dialogs)

/* ========== MARGINS ========== */
mt-2   (8px)   → Tight vertical spacing
mt-4   (16px)  → Default section margin
mt-6   (24px)  → Large section margin
mb-3   (12px)  → Bottom margin for labels

/* ========== SPACE-Y (Vertical Stack) ========== */
space-y-2  (8px)   → Tight vertical stack
space-y-3  (12px)  → Default vertical stack
space-y-4  (16px)  → Comfortable vertical stack
space-y-6  (24px)  → Large vertical stack
```

### Layout Grid

```tsx
// Desktop: 3-column grid with 16px gap
<div className="grid gap-4 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>

// Mobile: 1 column, Desktop: 2 columns
<div className="grid gap-4 sm:grid-cols-2">
  <Card />
  <Card />
</div>

// Split layout (List + Detail)
<div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
  <div>List</div>
  <div>Detail</div>
</div>
```

---

## 🧱 UI Components (Visual Reference)

### Card Component

```tsx
/**
 * VISUAL SPEC:
 * - Background: bg-surface (#12172a)
 * - Border: border-border (#2a3350)
 * - Border-radius: rounded-2xl (16px)
 * - Padding: p-4 (16px)
 * - Backdrop-blur: backdrop-blur (for glassmorphism)
 */

<Card className="p-4">
  <h3 className="text-lg font-semibold text-text-primary">Card Title</h3>
  <p className="mt-2 text-sm text-text-secondary">Card content goes here</p>
</Card>
```

**Visual:**
```
┌─────────────────────────────────────┐
│ Card Title                          │  ← text-lg font-semibold
│                                     │
│ Card content goes here              │  ← text-sm text-secondary
│                                     │
└─────────────────────────────────────┘
  ↑                                   ↑
  border-border                rounded-2xl
  bg-surface (#12172a)
```

---

### Button Variants

```tsx
/**
 * PRIMARY BUTTON
 * - Background: bg-brand (#3b82f6)
 * - Hover: bg-brand-hover (#2563eb)
 * - Text: text-white
 * - Padding: px-4 py-2
 * - Border-radius: rounded-lg
 */

<button className="rounded-lg bg-brand px-4 py-2 font-semibold text-white hover:bg-brand-hover">
  Save Rule
</button>

/**
 * OUTLINE BUTTON
 * - Border: border-border
 * - Background: transparent
 * - Hover: bg-surface-hover
 * - Text: text-text-primary
 */

<button className="rounded-lg border border-border bg-transparent px-4 py-2 text-text-primary hover:bg-surface-hover">
  Cancel
</button>

/**
 * GHOST BUTTON (Icon-only)
 * - No border
 * - Background: transparent
 * - Hover: bg-surface-hover
 */

<button className="rounded-lg p-2 text-text-secondary hover:bg-surface-hover">
  <IconEdit />
</button>
```

**Visual:**
```
┌──────────────┐  ┌──────────────┐  ┌─────┐
│  Save Rule   │  │   Cancel     │  │  ✎  │
└──────────────┘  └──────────────┘  └─────┘
    Primary          Outline         Ghost
```

---

### Input Fields

```tsx
/**
 * TEXT INPUT
 * - Background: bg-surface-elevated (#1a2038)
 * - Border: border-border (#2a3350)
 * - Focus: border-brand + ring-2 ring-brand
 * - Padding: px-3 py-2
 * - Border-radius: rounded-lg
 */

<input
  type="text"
  placeholder="Enter wallet address..."
  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand"
/>

/**
 * TEXTAREA
 * - Same as input, but taller
 */

<textarea
  rows={4}
  placeholder="Add notes..."
  className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand"
/>
```

**Visual:**
```
┌─────────────────────────────────────┐
│ Enter wallet address...             │  ← placeholder: text-secondary
└─────────────────────────────────────┘
  ↑
  border-border → border-brand on focus
```

---

### Badges & Tags

```tsx
/**
 * STATUS BADGE (Alert Status)
 */

// Armed
<span className="rounded-full bg-status-armed/20 px-2 py-0.5 text-xs font-semibold text-status-armed">
  ARMED
</span>

// Triggered
<span className="rounded-full bg-sentiment-bull-bg px-2 py-0.5 text-xs font-semibold text-sentiment-bull">
  TRIGGERED
</span>

/**
 * DIRECTION BADGE (Long/Short)
 */

// Long
<span className="rounded-full bg-sentiment-bull-bg px-2 py-0.5 text-xs font-medium text-sentiment-bull">
  LONG
</span>

// Short
<span className="rounded-full bg-sentiment-bear-bg px-2 py-0.5 text-xs font-medium text-sentiment-bear">
  SHORT
</span>
```

**Visual:**
```
┌──────────┐  ┌────────────┐  ┌──────┐  ┌───────┐
│  ARMED   │  │ TRIGGERED  │  │ LONG │  │ SHORT │
└──────────┘  └────────────┘  └──────┘  └───────┘
   Amber         Green         Green      Red
```

---

### Metric Cards (KPI)

```tsx
/**
 * KPI CARD
 * - Small label (uppercase, tracking-wider)
 * - Large value (text-2xl, font-semibold)
 * - Sentiment color for value
 */

<Card className="p-4">
  <p className="text-xs uppercase tracking-wider text-text-tertiary">Win Rate</p>
  <p className="mt-2 text-2xl font-semibold text-sentiment-bull">68.5%</p>
</Card>
```

**Visual:**
```
┌─────────────────────┐
│ WIN RATE            │  ← text-xs uppercase text-tertiary
│                     │
│ 68.5%               │  ← text-2xl font-semibold sentiment-bull
└─────────────────────┘
```

---

### Tabs

```tsx
/**
 * TABS
 * - Active: text-primary + bottom border (brand)
 * - Inactive: text-secondary + no border
 */

<div className="flex gap-1 border-b border-border-subtle">
  <button className="px-4 py-2.5 text-sm font-medium text-text-primary">
    Entries
    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand" />
  </button>
  <button className="px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary">
    Analytics
  </button>
</div>
```

**Visual:**
```
┌─────────────────────────────────────┐
│ Entries    Analytics                │
│ ━━━━━━━                              │  ← brand underline on active
└─────────────────────────────────────┘
```

---

### Toggle Switch

```tsx
/**
 * TOGGLE (ON/OFF)
 * - ON: bg-sentiment-bull
 * - OFF: bg-border
 * - Handle: white circle
 */

<button className="relative inline-flex h-6 w-11 items-center rounded-full bg-sentiment-bull">
  <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white" />
</button>
```

**Visual:**
```
┌──────────┐  ┌──────────┐
│ ●        │  │        ● │
└──────────┘  └──────────┘
    OFF           ON
   (gray)       (green)
```

---

## 📊 Charts & Data Visualization

### Chart Style Guide

```css
/* ========== CHART COLORS ========== */

/* Candlesticks */
--candle-bull: #10b981  (green)
--candle-bear: #ef4444  (red)

/* Lines */
--line-primary: #3b82f6   (blue)
--line-secondary: #8b5cf6 (purple)
--line-tertiary: #f59e0b  (amber)

/* Grid */
--grid-color: #1f2937     (subtle gray)

/* Background */
--chart-background: #0a0e1a  (dark)
```

### Chart Types

**1. Line Chart (Equity Curve)**
```
Price
  ↑
  │        ╱╲
  │       ╱  ╲      ╱╲
  │      ╱    ╲    ╱  ╲
  │     ╱      ╲  ╱    ╲
  │────╱────────╲╱──────╲────→ Time
  │
  └─────────────────────────
```

**2. Bar Chart (Setup Breakdown)**
```
Win Rate
  100% │
       │
   75% │     ██
       │     ██        ██
   50% │ ██  ██        ██
       │ ██  ██  ██    ██
   25% │ ██  ██  ██    ██
       └──────────────────
        FVG  OB  Liq  Jud
```

**3. Candlestick Chart (OHLC)**
```
Price
  │    │ ││  │
  │    │ │╱  │
  │   ╱│ │   │
  │  ╱ │ │   ╱
  │────│─│──╱───→ Time
  │ Green Red
```

---

## 🎭 Trading-App Inspirations

### Reference Apps

**1. TradingView**
- Dense information layout
- Dark charting interface
- Minimalist sidebar navigation
- Focus on chart + indicators

**2. Binance**
- High information density
- Dark mode optimized
- Clear price hierarchy (large + colored)
- Tabbed interface for multiple views

**3. Bloomberg Terminal**
- Maximum information density
- Professional dark theme
- Color-coded sentiment (green/red)
- Multi-panel layouts

**4. Coinbase Pro**
- Clean dark interface
- Clear visual hierarchy
- Subtle borders & dividers
- Focus on essential data

### Key Takeaways

✅ **Dark backgrounds** reduce eye strain
✅ **High contrast** for critical data (prices, PnL)
✅ **Monospace fonts** for numbers & addresses
✅ **Green/Red sentiment** universally understood
✅ **Dense layouts** maximize screen real estate
✅ **Subtle borders** (not heavy black lines)
✅ **Tabbed interfaces** for feature organization

---

## 🌐 Responsive Design

### Breakpoints

```css
/* Mobile-first approach */

/* Small devices (phones) */
sm:  640px   → 2-column grids, stacked navigation

/* Medium devices (tablets) */
md:  768px   → 3-column grids, side navigation visible

/* Large devices (desktops) */
lg:  1024px  → Full layout, multi-panel views

/* Extra large (wide monitors) */
xl:  1280px  → Maximum width containers
```

### Mobile Optimizations

```tsx
/**
 * MOBILE: Stack vertically
 * DESKTOP: Side-by-side
 */

<div className="flex flex-col gap-4 lg:grid lg:grid-cols-2">
  <div>Panel 1</div>
  <div>Panel 2</div>
</div>

/**
 * MOBILE: Hide sidebar
 * DESKTOP: Show sidebar
 */

<div className="hidden lg:block">
  <Sidebar />
</div>
```

---

## 🎨 Glassmorphism (PWA Touch)

### Frosted Glass Effect

```tsx
/**
 * GLASSMORPHISM CARD
 * - Semi-transparent background
 * - Backdrop blur
 * - Subtle border
 */

<div className="rounded-2xl border border-border bg-surface/80 backdrop-blur-sm p-4">
  <p>This card has a frosted glass effect</p>
</div>
```

**CSS:**
```css
.glass-card {
  background: rgba(18, 23, 42, 0.8);  /* surface with 80% opacity */
  backdrop-filter: blur(8px);
  border: 1px solid rgba(42, 51, 80, 0.5);
}
```

---

## ⚡ Micro-interactions

### Hover States

```css
/* Subtle lift on hover */
.card-hover {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* Border glow on hover */
.border-glow:hover {
  border-color: var(--brand);
  box-shadow: 0 0 0 1px var(--brand);
}
```

### Transitions

```css
/* Smooth transitions for all interactive elements */
transition: all 0.2s ease;

/* Focus ring (keyboard navigation) */
focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none
```

---

## 🎯 Component Examples in Context

### Journal Entry Card

```tsx
<Card className="p-4 hover:border-brand transition">
  {/* Header */}
  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-lg font-semibold text-text-primary">
        SOL Long @ $156.43
      </h3>
      <p className="text-xs text-text-tertiary">
        2025-11-25 · 14:32 UTC
      </p>
    </div>
    <span className="rounded-full bg-sentiment-bull-bg px-2 py-0.5 text-xs font-medium text-sentiment-bull">
      LONG
    </span>
  </div>

  {/* PnL */}
  <div className="mt-4 border-t border-border-subtle pt-3">
    <p className="text-xs uppercase tracking-wider text-text-tertiary">PnL</p>
    <p className="mt-1 font-mono text-2xl font-semibold text-sentiment-bull">
      +$1,234.56
    </p>
  </div>
</Card>
```

**Visual:**
```
┌─────────────────────────────────────────┐
│ SOL Long @ $156.43              [LONG]  │
│ 2025-11-25 · 14:32 UTC                  │
│                                          │
│ ─────────────────────────────────────── │
│ PNL                                      │
│ +$1,234.56                               │
└─────────────────────────────────────────┘
```

---

### Alert Card (Armed)

```tsx
<Card className="border-l-4 border-l-status-armed p-4">
  <div className="flex items-start justify-between">
    <div>
      <h3 className="text-lg font-semibold text-text-primary">
        BTC Above $50k + Volume Spike
      </h3>
      <p className="mt-1 text-sm text-text-secondary">
        Triggers when BTC > $50,000 AND Volume > 150% avg
      </p>
    </div>
    <span className="rounded-full bg-status-armed/20 px-2 py-0.5 text-xs font-semibold text-status-armed">
      ARMED
    </span>
  </div>

  <div className="mt-4 flex items-center gap-4 text-xs text-text-tertiary">
    <span>Last triggered: 2 days ago</span>
    <span>•</span>
    <span>47 triggers (90 days)</span>
  </div>
</Card>
```

**Visual:**
```
┃ BTC Above $50k + Volume Spike    [ARMED]
┃ Triggers when BTC > $50,000 AND Volume...
┃
┃ Last triggered: 2 days ago • 47 triggers
└──────────────────────────────────────────
  ↑
  Amber left border (4px)
```

---

## 🖼️ Real-World Layout Examples

### Journal Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Journal                         [New Entry] [Export]    │ ← Header
├─────────────────────────────────────────────────────────┤
│ [Entries] [Analytics]                                   │ ← Tabs
├────────────────────┬────────────────────────────────────┤
│                    │                                    │
│  Entry List        │  Detail Panel                      │
│                    │                                    │
│  ┌──────────────┐  │  SOL Long @ $156.43       [LONG]  │
│  │ Entry 1      │  │  2025-11-25 · 14:32 UTC           │
│  └──────────────┘  │                                    │
│                    │  PNL: +$1,234.56                   │
│  ┌──────────────┐  │                                    │
│  │ Entry 2      │  │  Notes:                            │
│  └──────────────┘  │  Great entry, caught FVG fill...  │
│                    │                                    │
│  ┌──────────────┐  │  [Edit Notes]                      │
│  │ Entry 3      │  │                                    │
│  └──────────────┘  │                                    │
│                    │                                    │
└────────────────────┴────────────────────────────────────┘
   40% width           60% width
```

---

### Settings Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ Settings                                                │ ← Header
├─────────────────────────────────────────────────────────┤
│ [General] [Wallet & Auto-Journal] [Alerts]              │ ← Tabs
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Connected Wallets                      [+ Connect]     │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ Main Wallet │ │ Main Wallet │ │   Trading   │      │
│  │      1      │ │      2      │ │   Wallet    │      │
│  │             │ │             │ │             │      │
│  │ DezXAZ8z... │ │ (Not conn.) │ │ 3nF8kL2w... │      │
│  │ [✓] Active  │ │             │ │ [✓] Active  │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│  Auto-Journal Settings                                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ Auto-Journal Enabled              [●─────]  ON │   │
│  │ Minimum Trade Size ($)            [  100  ]    │   │
│  │ Auto-Capture Screenshot           [●─────]  ON │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Animation & Motion

### Principles

1. **Subtle, not flashy** – Professional trading app, not a game
2. **Fast transitions** (200ms) – Don't slow down power users
3. **Ease curves** – Natural motion (ease-in-out)
4. **Purpose-driven** – Every animation has a reason

### Examples

```css
/* Fade in (cards, modals) */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Slide up (toasts, notifications) */
@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

/* Pulse (loading states) */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 🚀 Quick Reference Card

```
┌─────────────────────────────────────────────────┐
│ SPARKFINED PWA – DESIGN QUICK REFERENCE         │
├─────────────────────────────────────────────────┤
│                                                 │
│ COLORS                                          │
│  Background:  #0a0e1a (surface-base)            │
│  Surface:     #12172a                           │
│  Text:        #e8eaed (primary)                 │
│  Brand:       #3b82f6 (blue)                    │
│  Bull:        #10b981 (green)                   │
│  Bear:        #ef4444 (red)                     │
│                                                 │
│ TYPOGRAPHY                                      │
│  Heading:     text-2xl font-bold                │
│  Body:        text-sm text-secondary            │
│  Label:       text-xs uppercase tracking-wider  │
│  Price:       text-2xl font-mono font-semibold  │
│                                                 │
│ SPACING                                         │
│  Gap:         gap-4 (16px default)              │
│  Padding:     p-4 (16px default)                │
│  Margin:      mt-4 (16px default)               │
│                                                 │
│ BORDERS                                         │
│  Radius:      rounded-2xl (16px)                │
│  Border:      border-border (#2a3350)           │
│                                                 │
│ COMPONENTS                                      │
│  Card:        bg-surface border rounded-2xl p-4 │
│  Button:      bg-brand px-4 py-2 rounded-lg     │
│  Input:       bg-surface-elevated border px-3   │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## 📸 Visual Inspiration Links

**Trading Apps:**
- TradingView: https://tradingview.com (dark charting)
- Binance: https://binance.com (information density)
- Coinbase Pro: https://pro.coinbase.com (clean dark UI)

**Design Systems:**
- Radix UI Dark Theme: https://radix-ui.com (component patterns)
- Tailwind UI Dark: https://tailwindui.com (layout examples)
- Vercel Design: https://vercel.com (glassmorphism)

**Inspiration:**
- Dribbble "dark trading": https://dribbble.com/search/dark-trading-dashboard
- Awwwards Finance: https://awwwards.com/websites/finance/

---

## ✅ Implementation Checklist

- [ ] Set up TailwindCSS custom colors (tailwind.config.js)
- [ ] Create base components (Card, Button, Input)
- [ ] Implement dark mode palette
- [ ] Add font-family configuration
- [ ] Set up spacing scale
- [ ] Create badge variants
- [ ] Implement glassmorphism effects
- [ ] Add hover/focus states
- [ ] Test responsive breakpoints
- [ ] Ensure WCAG AA contrast (4.5:1 minimum)

---

**End of Design Moodboard**

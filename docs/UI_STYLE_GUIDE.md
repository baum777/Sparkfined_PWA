# Sparkfined PWA — UI Style Guide & Screen Structure
> **Comprehensive UI/UX Documentation**  
> Version: 1.0.0  
> Last Updated: 2025-11-29  
> Status: Production Reference

---

## Table of Contents
1. [Product Vision & Target Audience](#1-product-vision--target-audience)
2. [Design Philosophy](#2-design-philosophy)
3. [Color System](#3-color-system)
4. [Typography](#4-typography)
5. [Spacing & Layout](#5-spacing--layout)
6. [Component Taxonomy](#6-component-taxonomy)
7. [UI Primitives (Design System)](#7-ui-primitives-design-system)
8. [UX State Patterns](#8-ux-state-patterns)
9. [Screen Structure](#9-screen-structure)
10. [Responsive Design](#10-responsive-design)
11. [Motion & Animation](#11-motion--animation)
12. [Accessibility](#12-accessibility)
13. [Component Inventory](#13-component-inventory)

---

## 1. Product Vision & Target Audience

### **1.1 Vision Statement**
Sparkfined is an **offline-first Trading Command Center** for crypto traders, built as a Progressive Web App (PWA). The app emphasizes self-improvement through systematic journaling, AI-powered insights, and technical analysis tools—all accessible without internet connectivity.

### **1.2 Target Audience**

#### **Primary Users**
1. **Day Traders** (40%)
   - Need fast TA, pattern recognition, multi-timeframe confluence
   - Use 24"+ monitors, demand information density
   - Trading sessions: 4-8 hours daily
   - Key needs: Speed, precision, minimal friction

2. **Meme Coin Degens** (30%)
   - Track wallet flows, social sentiment, launch filtering
   - Mobile-first (70% mobile usage)
   - FOMO-driven, need real-time alerts
   - Key needs: Quick insights, social signals, risk management

3. **Self-Improvement Traders** (20%)
   - Systematically document trades, reflect, improve edge
   - Desktop + mobile hybrid usage
   - Journal religiously, track KPIs
   - Key needs: Structured journaling, AI condensation, statistics

4. **DeFi Power Users** (10%)
   - Solana-focused, on-chain data, DEX analytics
   - Technical sophistication, API-savvy
   - Key needs: Advanced charting, custom indicators

#### **Non-Target**
- ❌ Casual investors checking prices once a day
- ❌ Multi-chain traders (we're Solana-first)
- ❌ Users requiring one-click trade execution (we're analysis-focused)
- ❌ Light mode enthusiasts (dark mode only)

### **1.3 Use Cases**

| Use Case | Frequency | Device | Duration | Offline Support |
|----------|-----------|--------|----------|-----------------|
| Quick price check | 50x/day | Mobile 70% | 10s | ✅ Cached |
| Chart analysis | 10x/day | Desktop 90% | 5-15min | ✅ Full |
| Journal entry | 1-3x/day | Desktop 80% | 10-20min | ✅ Full |
| Alert setup | 2x/day | Desktop 70% | 2-5min | ⚠️ Sync later |
| KPI review | 2x/day | Desktop 60% | 2-3min | ✅ Cached |
| AI analysis | 3-5x/day | Desktop 70% | 30s-2min | ❌ Online only |

### **1.4 Devices & Platforms**

#### **Desktop (60% of usage)**
- Primary: 24"+ monitors (1920×1080, 2560×1440)
- Secondary: MacBook (13"-16" Retina)
- Browsers: Chrome (80%), Firefox (15%), Safari (5%)
- Usage Pattern: Extended sessions (2-8 hours)

#### **Mobile (35% of usage)**
- iOS: 70% (iPhone 12+, Safari)
- Android: 30% (Flagship devices, Chrome)
- Screen sizes: 5.5"-6.7"
- Usage Pattern: Quick checks, on-the-go alerts

#### **Tablet (5% of usage)**
- iPad Pro/Air (Safari)
- Usage: Casual analysis, reading mode

### **1.5 Content Types**

1. **Real-Time Market Data**
   - OHLC candlestick charts (1m-1d timeframes)
   - Live prices, 24h volume, market cap
   - 25+ technical indicators (RSI, MACD, Bollinger, Fibonacci)

2. **Trading Journal Entries**
   - Rich text + screenshots (OCR-enabled)
   - Tags (e.g., "Long SOL", "Revenge Trade")
   - Performance metrics (win rate, R-multiple, drawdown)

3. **AI-Generated Insights**
   - Market bullets (3-5 sentence summaries)
   - Trade post-mortems (condensed lessons)
   - Social sentiment analysis (Grok-powered)

4. **Alerts & Signals**
   - Price alerts, volume spikes, trend reversals
   - Confluence rules (AND/OR logic)
   - Alert history with performance tracking

5. **KPIs & Metrics**
   - Net P&L, win rate, Sharpe ratio, max drawdown
   - Streak tracking (journal days, consecutive wins)
   - Session-based performance (London/NY/Asia)

---

## 2. Design Philosophy

### **2.1 Core Principles**

#### **1. Dark-Mode-First**
> **Rationale:** Trading happens at 2 AM. Light mode burns your retinas. Every serious trading platform (TradingView, Binance, Bloomberg Terminal) is dark-first.

- **No light mode toggle** (saves development time, reduces complexity)
- Semantic colors: Green = Bullish/Success, Red = Bearish/Error, Yellow = Warning
- High-contrast text (WCAG AA compliant) for readability
- OLED mode available (pure #000000 background)

#### **2. Information Density**
> **Rationale:** Traders need to see 20+ KPIs, 4 charts, and 10 signals **at a glance**. Minimalist UI wastes screen space.

- **Multi-column layouts** on desktop (3-4 columns)
- **Compact tables** with small font sizes (14px body, 12px labels)
- **Inline actions** instead of modals (e.g., "Delete" button on hover, not a confirmation dialog)
- **KPI strips** with 4-6 metrics per row
- **Small margins** (16px-24px between sections)

#### **3. Action Proximity**
> **Rationale:** When a signal fires, you have 30 seconds to act. Every extra click = lost opportunity.

- **Sticky action bars** (Save, Analyze, Alert) always visible
- **Keyboard shortcuts** for power users (Cmd+S to save journal, Cmd+N for new entry)
- **No unnecessary confirmation dialogs** (unless destructive action like "Delete All")
- **One-click access** to primary actions from any screen

#### **4. Offline-First**
> **Rationale:** Internet fails. APIs go down. Your journal shouldn't depend on Vercel being up.

- **IndexedDB (Dexie)** for local storage (50MB+ capacity)
- **Service Worker** precaches 66 assets (~428 KB)
- **Background Sync** queues actions when offline, syncs when reconnected
- **Visual feedback** for offline/online status (persistent badge)

#### **5. Confluence Over Single Signals**
> **Rationale:** RSI < 30 alone is a weak signal. RSI < 30 + Volume spike + Bullish divergence = high conviction.

- **Visual rule builder** supports AND/OR logic
- **Confluence heatmap** shows where 3+ indicators agree
- **Alert history** tracks which confluence rules actually work
- **Color-coded confidence** (green = 3+ signals, yellow = 2, red = 1)

### **2.2 Brand Identity**

#### **Inspiration**
- **Blade Runner** — Cyberpunk, neon accents, high-tech noir
- **TradingView** — Professional charting, information density
- **Notion** — Clean typography, generous whitespace in cards
- **Bloomberg Terminal** — Data-first, utilitarian, power-user UX

#### **Personality**
- **Tone:** Professional, confident, no-bullshit
- **Voice:** Technical but accessible, crypto-native
- **Emotion:** Focus, precision, mastery (not hype or FOMO)

---

## 3. Color System

### **3.1 Brand Colors**

```css
/* Primary Brand */
--color-brand: #0fb34c;           /* Emerald-500 - Main brand green */
--color-brand-hover: #059669;     /* Emerald-600 - Hover states */
--color-accent: #00ff66;          /* Neon green - Highlights, glows */

/* Background Layers */
--color-bg: #0a0a0a;              /* Zinc-950 - Root background */
--color-bg-elevated: #0b0b13;     /* Slightly lighter for overlays */
--color-surface: #18181b;         /* Zinc-900 - Cards, panels */
--color-surface-subtle: #131316;  /* Darker variant for contrast */
--color-surface-elevated: #1c1c1e; /* Hover states, focus */
--color-surface-hover: #27272a;   /* Zinc-800 - Interactive hover */
```

### **3.2 Text Colors**

```css
/* Typography Hierarchy */
--color-text-primary: #f4f4f5;    /* Zinc-100 - Headings, labels */
--color-text-secondary: #a1a1aa;  /* Zinc-400 - Body text, metadata */
--color-text-tertiary: #71717a;   /* Zinc-500 - Helper text, disabled */
```

### **3.3 Semantic Colors**

```css
/* Trading-Specific */
--color-bull: #10b981;            /* Emerald-500 - Bullish/Long */
--color-bear: #f43f5e;            /* Rose-500 - Bearish/Short */

/* System Feedback */
--color-success: #10b981;         /* Emerald-500 - Success states */
--color-danger: #f43f5e;          /* Rose-500 - Errors, destructive */
--color-warn: #f59e0b;            /* Amber-500 - Warnings, caution */
--color-info: #06b6d4;            /* Cyan-500 - Info, neutral alerts */

/* Sentiment Variants (with backgrounds) */
--sentiment-bull-bg: rgba(16, 185, 129, 0.1);
--sentiment-bull-border: rgba(16, 185, 129, 0.6);

--sentiment-bear-bg: rgba(244, 63, 94, 0.1);
--sentiment-bear-border: rgba(251, 113, 133, 0.6);

--sentiment-neutral-bg: rgba(245, 158, 11, 0.1);
--sentiment-neutral-border: rgba(251, 191, 36, 0.6);
```

### **3.4 Border Colors**

```css
/* Border Hierarchy */
--color-border: #27272a;          /* Zinc-800 - Default borders */
--color-border-subtle: rgba(255, 255, 255, 0.05); /* Barely visible */
--color-border-moderate: rgba(255, 255, 255, 0.1); /* Subtle */
--color-border-hover: rgba(255, 255, 255, 0.15);   /* Interactive */
--color-border-accent: #0fb34c;   /* Brand border for focus */
--color-border-focus: #10b981;    /* Focus rings */
```

### **3.5 Shadow System**

```css
/* Card Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
--shadow-md: 0 4px 8px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08);
--shadow-lg: 0 10px 20px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.12);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.25);

/* Glow Effects (Cyberpunk Accents) */
--glow-accent: 0 0 10px rgba(0, 255, 102, 0.22);
--glow-brand: 0 0 12px rgba(15, 179, 76, 0.18);
--glow-cyan: 0 0 8px rgba(0, 229, 255, 0.2);
--emerald-glow: 0 0 30px rgba(16, 185, 129, 0.3);
--emerald-glow-lg: 0 0 50px rgba(16, 185, 129, 0.5);
```

### **3.6 Color Usage Guidelines**

| Use Case | Color Token | Example |
|----------|-------------|---------|
| **Primary Actions** | `brand`, `brand-hover` | Save Button, Confirm |
| **Bullish Indicators** | `bull`, `sentiment-bull-bg` | Price increase, Long entry |
| **Bearish Indicators** | `bear`, `sentiment-bear-bg` | Price decrease, Short entry |
| **Warnings** | `warn`, `sentiment-neutral-bg` | Low liquidity, Unconfirmed signal |
| **Errors** | `danger`, `rose-500` | API failure, Validation error |
| **Success Feedback** | `success`, `emerald-500` | Trade saved, Alert armed |
| **Neutral Info** | `info`, `cyan-500` | Market closed, Pending sync |
| **Disabled States** | `text-tertiary` | Disabled buttons, locked features |
| **Focus Rings** | `border-focus`, `glow-accent` | Input focus, Keyboard navigation |

---

## 4. Typography

### **4.1 Font Families**

```css
/* Sans-Serif (UI, Headings, Body) */
--font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;

/* Monospace (Prices, Numbers, Code) */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;

/* Display (Large Headers, Marketing) */
--font-display: system-ui, -apple-system, 'Segoe UI', sans-serif;
```

### **4.2 Font Scale**

| Token | Size | Line Height | Use Case |
|-------|------|-------------|----------|
| `text-xs` | 12px (0.75rem) | 1.33 (16px) | Badges, labels, metadata |
| `text-sm` | 14px (0.875rem) | 1.43 (20px) | Body text, table cells |
| `text-base` | 16px (1rem) | 1.5 (24px) | Default body, buttons |
| `text-lg` | 18px (1.125rem) | 1.56 (28px) | Subheadings, card titles |
| `text-xl` | 20px (1.25rem) | 1.4 (28px) | Section headings |
| `text-2xl` | 24px (1.5rem) | 1.33 (32px) | Page titles |
| `text-3xl` | 30px (1.875rem) | 1.25 (37.5px) | Large values (KPIs) |
| `text-4xl` | 36px (2.25rem) | 1.2 (43px) | Hero headings |

### **4.3 Font Weights**

```css
--weight-regular: 400;    /* Body text */
--weight-medium: 500;     /* Emphasized text, labels */
--weight-semibold: 600;   /* Headings, buttons */
--weight-bold: 700;       /* Rarely used (only for extreme emphasis) */
```

### **4.4 Typography Patterns**

#### **Page Titles**
```tsx
<h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
  Dashboard
</h1>
```

#### **Section Headings**
```tsx
<h2 className="text-2xl font-semibold text-text-primary">
  Recent Entries
</h2>
```

#### **Card Titles**
```tsx
<h3 className="text-lg font-semibold text-text-primary">
  KPI Snapshot
</h3>
```

#### **Body Text**
```tsx
<p className="text-sm text-text-secondary">
  Your journal helps you identify patterns and improve your edge.
</p>
```

#### **Labels**
```tsx
<label className="text-xs uppercase tracking-[0.3em] text-text-tertiary">
  Timeframe
</label>
```

#### **Monospace Numbers**
```tsx
<span className="font-mono tabular-nums text-text-primary">
  $42,857.32
</span>
```

---

## 5. Spacing & Layout

### **5.1 Spacing Scale (8px Grid)**

```css
/* Base: 8px increments for consistency */
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### **5.2 Border Radius**

```css
--radius-sm: 6px;     /* Small elements (badges, tags) */
--radius-md: 8px;     /* Buttons, inputs */
--radius-lg: 12px;    /* Cards, panels */
--radius-xl: 16px;    /* Large cards, modals */
--radius-2xl: 20px;   /* Hero cards */
--radius-3xl: 24px;   /* Feature sections */
--radius-full: 9999px; /* Pills, circular avatars */
```

### **5.3 Layout Containers**

```css
/* Max Widths */
--max-w-page: 72rem;  /* 1152px - Main content container */
--max-w-card: 42rem;  /* 672px - Card/form max width */
--max-w-modal: 32rem; /* 512px - Modal dialogs */
```

### **5.4 Layout Patterns**

#### **Page Container**
```tsx
<div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
  {/* Page content */}
</div>
```

#### **Two-Column Layout (Desktop)**
```tsx
<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
  <div>{/* Main content */}</div>
  <div>{/* Sidebar */}</div>
</div>
```

#### **KPI Grid**
```tsx
<div className="grid grid-cols-2 gap-3 md:grid-cols-4">
  {kpis.map(kpi => <KPITile key={kpi.id} {...kpi} />)}
</div>
```

#### **Card Spacing**
```tsx
<div className="space-y-6">
  <Card>{/* Card 1 */}</Card>
  <Card>{/* Card 2 */}</Card>
</div>
```

---

## 6. Component Taxonomy

### **6.1 Hierarchy (4 Levels)**

```
┌─────────────────────────────────────────────────┐
│ Level 1: UI Primitives (src/components/ui/)    │
│   Button, Input, Card, Badge, Modal, Select    │
│   → Reusable, no business logic                 │
├─────────────────────────────────────────────────┤
│ Level 2: Composed Components (src/components/) │
│   KPITile, FeedItem, SignalCard, JournalBadge  │
│   → Domain-specific, uses UI Primitives         │
├─────────────────────────────────────────────────┤
│ Level 3: Layouts (src/components/*/Layout.tsx) │
│   DashboardShell, JournalLayout, AlertsLayout  │
│   → Page structure, orchestrates components     │
├─────────────────────────────────────────────────┤
│ Level 4: Pages (src/pages/)                    │
│   DashboardPageV2, JournalPageV2, AlertsPageV2 │
│   → Route entry points, data fetching           │
└─────────────────────────────────────────────────┘
```

### **6.2 Naming Conventions**

#### **Props Naming**
```tsx
interface ComponentProps {
  // Event handlers: on{Action}
  onClick?: () => void;
  onSave?: (data: T) => void;
  onDelete?: (id: string) => void;
  
  // Boolean props: is{State} / has{Feature} / show{Element}
  isLoading?: boolean;
  hasError?: boolean;
  showActions?: boolean;
  disabled?: boolean; // Exception: standard HTML attribute
  
  // Data props: {noun} (singular/plural)
  user: User;
  entries: Entry[];
  data: KPIData;
  
  // Variant props
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}
```

#### **File Naming**
- **UI Primitives:** PascalCase, no prefix (Button.tsx, Input.tsx)
- **Composed Components:** PascalCase, descriptive (KPITile.tsx, SignalCard.tsx)
- **Layouts:** *Layout.tsx suffix (DashboardShell.tsx, JournalLayout.tsx)
- **Pages:** *PageV2.tsx suffix (DashboardPageV2.tsx, JournalPageV2.tsx)

---

## 7. UI Primitives (Design System)

### **7.1 Button**

**Variants:**
- **Primary:** Brand gradient, for main CTAs
- **Secondary:** Subtle background, border, for secondary actions
- **Ghost:** Transparent, for tertiary actions
- **Outline:** Border only, for cancel/back actions

**Sizes:**
- **sm:** 36px height (h-9), 12px text
- **md:** 44px height (h-11), 14px text (default)
- **lg:** 48px height (h-12), 16px text

**Example:**
```tsx
<Button variant="primary" size="md" onClick={handleSave}>
  Save Entry
</Button>

<Button variant="secondary" size="sm" leftIcon={<RefreshIcon />}>
  Refresh
</Button>

<Button variant="ghost" onClick={onCancel}>
  Cancel
</Button>
```

**States:**
- **Default:** Sharp, clean, with shadow
- **Hover:** Brightness increase, glow effect
- **Active:** Scale(0.98), slight press effect
- **Loading:** Spinner icon, text "Saving..."
- **Disabled:** Opacity 0.6, cursor not-allowed

### **7.2 Input**

**Features:**
- Label (optional)
- Error message (red border, error text)
- Helper text (gray, subtle)
- Left/right icons
- Mono variant (for numbers, prices)

**Example:**
```tsx
<Input
  label="Token Address"
  placeholder="Enter Solana address..."
  error={errors.address}
  helperText="Required for price data"
  leftIcon={<SearchIcon />}
  mono
/>
```

**States:**
- **Default:** Border-moderate, bg-surface-subtle
- **Focus:** Border-brand, ring-2, glow-accent
- **Error:** Border-danger, error message below
- **Disabled:** Opacity 0.5, cursor not-allowed

### **7.3 Card**

**Variants:**
- **default:** Standard card (bg-surface, border-subtle)
- **muted:** Darker background (bg-surface-subtle)
- **interactive:** Hover effects (border-accent, shadow-glow)

**Sub-components:**
- **CardHeader:** Flex header with title
- **CardTitle:** h3, text-lg, font-semibold
- **CardDescription:** text-sm, text-secondary
- **CardContent:** Main body
- **CardFooter:** Actions, flex justify-between

**Example:**
```tsx
<Card variant="interactive" onClick={handleClick}>
  <CardHeader>
    <CardTitle>SOL Daily Bias</CardTitle>
    <CardDescription>High confidence · 4H timeframe</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Market structure shows higher lows...</p>
  </CardContent>
  <CardFooter>
    <Button variant="secondary" size="sm">View Details</Button>
  </CardFooter>
</Card>
```

### **7.4 Badge**

**Variants:**
- **default:** Gray background
- **success:** Green background (bullish)
- **danger:** Red background (bearish)
- **warning:** Yellow background (caution)
- **outline:** Border only, transparent

**Example:**
```tsx
<Badge variant="success">Long</Badge>
<Badge variant="danger">Short</Badge>
<Badge variant="warning">Unconfirmed</Badge>
```

### **7.5 Select (Dropdown)**

**Features:**
- Custom dropdown (not native select)
- Keyboard navigation (Arrow keys, Enter, Escape)
- Checkmark for selected option
- Max-height scroll for many options

**Example:**
```tsx
<Select
  options={[
    { value: '1h', label: '1 Hour' },
    { value: '4h', label: '4 Hour' },
    { value: '1d', label: '1 Day' },
  ]}
  value={timeframe}
  onChange={setTimeframe}
  placeholder="Select timeframe"
/>
```

### **7.6 Modal**

**Features:**
- Focus trap (Tab cycles within modal)
- Escape key closes modal
- Backdrop click closes (optional)
- ARIA attributes (role="dialog", aria-modal)

**Example:**
```tsx
<Modal isOpen={isOpen} onClose={handleClose}>
  <ModalHeader>
    <ModalTitle>Create Alert</ModalTitle>
  </ModalHeader>
  <ModalContent>
    {/* Form fields */}
  </ModalContent>
  <ModalFooter>
    <Button variant="ghost" onClick={handleClose}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>Create</Button>
  </ModalFooter>
</Modal>
```

---

## 8. UX State Patterns

### **8.1 Loading States**

**Pattern:** Skeleton placeholders that match final content shape

```tsx
// Loading: Show skeleton
if (isLoading) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 rounded-2xl" />
      ))}
    </div>
  );
}

// Success: Show actual content
return (
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
    {kpis.map(kpi => <KPITile key={kpi.id} {...kpi} />)}
  </div>
);
```

**Loading Component:**
```tsx
// Shimmer effect, matches layout
<LoadingSkeleton rows={3} />

// Analysis-specific skeleton
<LoadingSkeleton type="analysis" />
```

### **8.2 Error States**

**Pattern:** Error banner with retry action

```tsx
if (error) {
  return (
    <ErrorBanner 
      message={error.message} 
      onRetry={handleRetry} 
    />
  );
}
```

**Error Banner Component:**
```tsx
<div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4">
  <div className="flex items-start gap-3">
    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
    <div>
      <p className="text-sm font-semibold text-red-50">Something went wrong</p>
      <p className="text-red-100/80">{message}</p>
    </div>
    <Button variant="outline" size="sm" onClick={onRetry}>
      Retry
    </Button>
  </div>
</div>
```

### **8.3 Empty States**

**Pattern:** Icon + title + description + CTA

```tsx
if (entries.length === 0) {
  return (
    <EmptyState
      icon={<InboxIcon className="w-24 h-24 text-gray-400" />}
      title="No Journal Entries"
      description="Start documenting your trades to build consistency."
      action={
        <Button variant="primary" onClick={handleCreate}>
          Create First Entry
        </Button>
      }
    />
  );
}
```

### **8.4 Success Feedback**

**Pattern:** Inline success message (future: toast system)

```tsx
// After successful save
{isSaved && (
  <div className="flex items-center gap-2 text-emerald-500">
    <CheckCircleIcon className="w-5 h-5" />
    <span>Trade saved successfully!</span>
  </div>
)}
```

---

## 9. Screen Structure

### **9.1 Page Template (DashboardShell)**

All app pages use the `DashboardShell` wrapper:

```tsx
<DashboardShell
  title="Page Title"
  description="Brief description"
  actions={<HeaderActions />}
  kpiStrip={<KPIStrip />} // Optional
  tabs={tabs} // Optional
  activeTabId={activeTab}
  onTabSelect={setActiveTab}
>
  {/* Page content */}
</DashboardShell>
```

**Shell Structure:**
1. **Header** (border-bottom, backdrop-blur)
   - Brand label ("Sparkfined")
   - Page title (h1, text-3xl)
   - Description (text-sm, text-secondary)
   - Actions (buttons, right-aligned)
   - Tabs (optional, pill-style)

2. **KPI Strip** (optional, border-bottom)
   - 2-6 metric tiles
   - Grid layout (responsive)

3. **Main Content** (max-w-6xl container)
   - Page-specific content
   - Padding: px-4 py-10

### **9.2 App Routes & Screens**

| Route | Page Component | Layout Pattern | Offline Support |
|-------|---------------|----------------|-----------------|
| `/dashboard-v2` | DashboardPageV2 | KPI strip + 2-column grid | ✅ Full |
| `/watchlist-v2` | WatchlistPageV2 | Table + detail panel | ✅ Cached |
| `/analysis-v2` | AnalysisPageV2 | Tabs + insight cards | ⚠️ AI online only |
| `/journal-v2` | JournalPageV2 | List + detail panel | ✅ Full |
| `/alerts-v2` | AlertsPageV2 | List + detail panel | ⚠️ Sync later |
| `/chart-v2` | ChartPageV2 | Full-width canvas | ✅ Cached data |
| `/settings-v2` | SettingsPageV2 | Form layout | ✅ Full |
| `/landing` | LandingPage | Marketing layout | N/A |

### **9.3 Dashboard Page**

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: "Dashboard"                         │
│ Actions: [Quick Actions Dropdown]           │
├─────────────────────────────────────────────┤
│ KPI Strip: [Net P&L] [Win Rate] [Alerts] […]│
├─────────────────────────────────────────────┤
│ Main Content:                                │
│ ┌───────────────────┬──────────────────────┐│
│ │ Insight Teaser    │ Journal Snapshot     ││
│ │ (AI Daily Bias)   │ (3 recent entries)   ││
│ └───────────────────┴──────────────────────┘│
└─────────────────────────────────────────────┘
```

**Components:**
- `DashboardKpiStrip`: 4 KPI tiles
- `InsightTeaser`: AI bias card (bias, confidence, summary)
- `JournalSnapshot`: 3 recent entries with direction badges
- `DashboardQuickActions`: Floating action button dropdown

### **9.4 Journal Page**

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: "Journal"                           │
│ Actions: [New Entry +]                      │
├─────────────────────────────────────────────┤
│ Journey Banner: [Level] [Progress] [Stats] │
├─────────────────────────────────────────────┤
│ Filters: [All] [Long] [Short]               │
├─────────────────────────────────────────────┤
│ Two-Column Layout:                          │
│ ┌────────────────┬──────────────────────┐  │
│ │ Entry List     │ Detail Panel         │  │
│ │ (scrollable)   │ (title, notes, tags) │  │
│ │ - Entry 1      │                      │  │
│ │ - Entry 2 ✓    │ [Edit] [Delete]      │  │
│ │ - Entry 3      │                      │  │
│ └────────────────┴──────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Components:**
- `JournalJourneyBanner`: Progress tracker (Degen → Sensei)
- `JournalList`: Scrollable entry list with direction badges
- `JournalDetailPanel`: Full entry view with inline editing
- `JournalNewEntryDialog`: Modal for creating new entries

### **9.5 Watchlist Page**

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: "Watchlist"                         │
│ Actions: [Live Status] [Sort: Top Movers]  │
├─────────────────────────────────────────────┤
│ Session Filters: [All] [London] [NY] [Asia]│
├─────────────────────────────────────────────┤
│ Two-Column Layout:                          │
│ ┌────────────────┬──────────────────────┐  │
│ │ Asset Table    │ Detail Panel         │  │
│ │ Symbol | Price │ Chart Preview        │  │
│ │ SOL    | $43   │ KPIs + Trend         │  │
│ │ BTC    | $67k  │ [Open Chart] [Replay]│  │
│ └────────────────┴──────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Components:**
- `WatchlistTable`: Sortable table with live prices
- `WatchlistDetailPanel`: Asset details, mini chart, actions
- `LiveStatusBadge`: Real-time connection status

### **9.6 Alerts Page**

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: "Alerts"                            │
│ Actions: [New Alert +]                      │
├─────────────────────────────────────────────┤
│ Status: [All] [Armed] [Triggered] [Snoozed]│
│ Type: [All] [Price] [Volume] [Volatility]  │
├─────────────────────────────────────────────┤
│ Two-Column Layout:                          │
│ ┌────────────────┬──────────────────────┐  │
│ │ Alert List     │ Detail Panel         │  │
│ │ - SOL > $45 🟢 │ Condition Details    │  │
│ │ - BTC < $65k 🔴│ History Chart        │  │
│ └────────────────┴──────────────────────┘  │
└─────────────────────────────────────────────┘
```

**Components:**
- `AlertsList`: Scrollable list with status badges
- `AlertsDetailPanel`: Condition breakdown, history, actions
- `RuleEditor`: Visual rule builder (AND/OR logic)

### **9.7 Analysis Page**

**Layout:**
```
┌─────────────────────────────────────────────┐
│ Header: "Analysis"                          │
│ Tabs: [Overview] [Flow] [Playbook]          │
├─────────────────────────────────────────────┤
│ AI Insight: "Bias remains bullish while..." │
│ Stats: [Bias: Long] [Confidence: 78%] […]  │
├─────────────────────────────────────────────┤
│ Social Trend Card:                          │
│ "SOL showing strength..." [Hype: High]      │
├─────────────────────────────────────────────┤
│ AdvancedInsightCard:                        │
│ - Liquidity zones                           │
│ - Entry/exit levels                         │
│ - Risk management                           │
└─────────────────────────────────────────────┘
```

**Components:**
- `AdvancedInsightCard`: AI-generated market analysis
- `AnalysisSidebarTabs`: Tab switcher (Overview/Flow/Playbook)
- `TrendBadge`: Social sentiment indicators

---

## 10. Responsive Design

### **10.1 Breakpoints (Tailwind)**

```css
/* Mobile First Approach */
sm: 640px   /* Small tablets, large phones (portrait) */
md: 768px   /* Tablets (portrait) */
lg: 1024px  /* Tablets (landscape), small laptops */
xl: 1280px  /* Laptops, desktops */
2xl: 1536px /* Large desktops */
```

### **10.2 Layout Adaptations**

#### **Desktop (lg+)**
- 2-column layouts (list + detail)
- 4-column KPI grids
- Sidebar navigation (hidden for Sparkfined, uses top nav)
- Hover states enabled
- Keyboard shortcuts prominent

#### **Tablet (md-lg)**
- 2-column KPI grids
- Stacked layouts for list + detail
- Touch-friendly (min 44px touch targets)
- Reduced margins (px-4 instead of px-6)

#### **Mobile (sm-)**
- 1-column layouts
- Bottom navigation (fixed, 4 tabs)
- Full-width cards
- Drawer for detail panels
- Increased touch targets (min 48px)
- Reduced font sizes (text-sm instead of text-base)

### **10.3 Responsive Patterns**

#### **Grid Responsiveness**
```tsx
<div className="
  grid grid-cols-1        /* Mobile: 1 column */
  sm:grid-cols-2          /* Small: 2 columns */
  md:grid-cols-3          /* Medium: 3 columns */
  lg:grid-cols-4          /* Large: 4 columns */
  gap-3 sm:gap-4 lg:gap-6
">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>
```

#### **Conditional Rendering**
```tsx
{/* Desktop: Sidebar */}
<div className="hidden lg:block lg:w-64">
  <Sidebar />
</div>

{/* Mobile: Bottom Nav */}
<div className="block lg:hidden">
  <BottomNav />
</div>
```

#### **Typography Scaling**
```tsx
<h1 className="
  text-2xl              /* Mobile: 24px */
  md:text-3xl           /* Tablet: 30px */
  lg:text-4xl           /* Desktop: 36px */
  font-semibold
">
  Dashboard
</h1>
```

---

## 11. Motion & Animation

### **11.1 Duration Scale**

```css
--duration-micro: 75ms;    /* Instant feedback (hover) */
--duration-short: 150ms;   /* Quick transitions (scale, fade) */
--duration-medium: 250ms;  /* Standard transitions (slide) */
--duration-long: 350ms;    /* Complex animations (modal open) */
```

### **11.2 Easing Functions**

```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);        /* Start slow */
--ease-out: cubic-bezier(0, 0, 0.2, 1);       /* End slow */
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);  /* Smooth both */
--ease-soft: cubic-bezier(0.22, 0.61, 0.36, 1); /* Gentle, natural */
```

### **11.3 Animation Utilities**

```css
/* Tailwind Animations */
animate-spin       /* 1s linear infinite (loading spinners) */
animate-pulse      /* 2s ease-in-out infinite (skeleton) */
animate-fade-in    /* 250ms cubic-bezier (content reveal) */
animate-slide-up   /* 250ms cubic-bezier (modals, toasts) */
animate-shimmer    /* 1.5s infinite (skeleton shimmer) */
```

### **11.4 Interaction States**

#### **Hover**
```tsx
className="transition-colors duration-150 hover:bg-surface-hover"
```

#### **Active (Click)**
```tsx
className="transition-transform duration-75 active:scale-98"
```

#### **Focus**
```tsx
className="
  focus-visible:outline-none 
  focus-visible:ring-2 
  focus-visible:ring-brand 
  focus-visible:ring-offset-2
"
```

### **11.5 Page Transitions**

```tsx
// Fade in on mount
<div className="animate-fade-in">
  <PageContent />
</div>

// Slide up (modals)
<Modal className="animate-slide-up">
  <ModalContent />
</Modal>
```

### **11.6 Reduced Motion**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 12. Accessibility

### **12.1 WCAG 2.1 AA Compliance**

**Contrast Ratios:**
- Text on bg: 7:1 (AAA level)
- Large text: 4.5:1 minimum
- UI components: 3:1 minimum

**Color Usage:**
- Never rely on color alone (use icons + text)
- Red/green pairs have text labels ("Bullish", "Bearish")

### **12.2 Keyboard Navigation**

**Focus Management:**
```tsx
// Tab order follows visual order
<button tabIndex={0}>Primary Action</button>
<button tabIndex={0}>Secondary Action</button>

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to content
</a>
```

**Focus Trap (Modals):**
```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef<HTMLDivElement>(null);
  useFocusTrap(modalRef, isOpen);
  
  return (
    <div ref={modalRef} role="dialog" aria-modal="true">
      {children}
    </div>
  );
}
```

**Keyboard Shortcuts:**
- Cmd/Ctrl+N: New journal entry
- Cmd/Ctrl+S: Save current entry
- Escape: Close modal/dialog
- Arrow keys: Navigate lists

### **12.3 ARIA Attributes**

```tsx
// Button with icon only
<button aria-label="Delete entry" onClick={handleDelete}>
  <TrashIcon />
</button>

// Loading state
<div role="status" aria-label="Loading">
  <LoadingSkeleton />
</div>

// Error message
<p role="alert" className="text-danger">
  {errorMessage}
</p>

// Dropdown menu
<button aria-expanded={isOpen} aria-haspopup="listbox">
  Select timeframe
</button>
<div role="listbox">
  <button role="option" aria-selected={isSelected}>1 Hour</button>
</div>
```

### **12.4 Screen Reader Support**

```tsx
// Screen reader only text
<span className="sr-only">
  Current price: $42,857.32
</span>

// Skip decorative icons
<CheckIcon aria-hidden="true" />
<span>Success</span>
```

---

## 13. Component Inventory

### **13.1 UI Primitives (`src/components/ui/`)**

| Component | File | Variants | Key Props |
|-----------|------|----------|-----------|
| Button | Button.tsx | primary, secondary, ghost, outline | variant, size, isLoading, leftIcon, rightIcon |
| Input | Input.tsx | - | label, error, helperText, leftIcon, rightIcon, mono |
| Card | Card.tsx | default, muted, interactive | variant, interactive, onClick |
| Badge | Badge.tsx | default, success, warning, danger, outline | variant |
| Select | Select.tsx | - | options, value, onChange, error |
| Modal | Modal/*.tsx | - | isOpen, onClose, children |
| Textarea | Textarea.tsx | - | label, error, helperText, rows |
| Skeleton | Skeleton.tsx | - | className |
| EmptyState | EmptyState.tsx | - | icon, title, description, action |
| ErrorBanner | ErrorBanner.tsx | - | message, onRetry |
| LoadingSkeleton | LoadingSkeleton.tsx | default, analysis | rows, type |
| TooltipIcon | TooltipIcon.tsx | - | content, icon |
| FormField | FormField.tsx | - | label, error, children |
| StateView | StateView.tsx | - | state (idle/loading/error/empty/success) |

### **13.2 Composed Components**

#### **Dashboard**
- `DashboardShell.tsx`: Page wrapper with header, KPI strip, main content
- `DashboardKpiStrip.tsx`: Grid of 4 KPI tiles
- `DashboardQuickActions.tsx`: Floating action button
- `DashboardMainGrid.tsx`: 2-column layout (primary + secondary)
- `InsightTeaser.tsx`: AI bias card
- `JournalSnapshot.tsx`: 3 recent journal entries

#### **Journal**
- `JournalLayout.tsx`: Two-column wrapper (list + detail)
- `JournalList.tsx`: Scrollable entry list
- `JournalDetailPanel.tsx`: Full entry view with inline editing
- `JournalHeaderActions.tsx`: New entry button
- `JournalNewEntryDialog.tsx`: Modal for creating entries
- `JournalJourneyBanner.tsx`: Progress tracker (Degen → Sensei)
- `JournalInsightCard.tsx`: AI-generated entry summary
- `JournalSocialPreview.tsx`: Share preview

#### **Watchlist**
- `WatchlistLayout.tsx`: Page structure
- `WatchlistTable.tsx`: Asset list with live prices
- `WatchlistDetailPanel.tsx`: Asset details, chart, actions
- `WatchlistHeaderActions.tsx`: Live status, sort controls

#### **Alerts**
- `AlertsLayout.tsx`: Page structure
- `AlertsList.tsx`: Alert list with status badges
- `AlertsDetailPanel.tsx`: Condition details, history
- `AlertsHeaderActions.tsx`: New alert button

#### **Analysis**
- `AnalysisLayout.tsx`: Page structure with tabs
- `AnalysisHeaderActions.tsx`: Refresh, export buttons
- `AnalysisSidebarTabs.tsx`: Tab switcher
- `AdvancedInsightCard.tsx`: AI market analysis

#### **Board Components**
- `KPITile.tsx`: Metric display with sentiment color
- `FeedItem.tsx`: News/event card
- `QuickActionCard.tsx`: Action shortcut
- `Focus.tsx`: Focused view for single metric
- `Overview.tsx`: Multi-metric dashboard

#### **Signals**
- `SignalCard.tsx`: Trading signal display
- `LessonCard.tsx`: Learning module
- `SignalReviewCard.tsx`: Performance review

#### **Layout**
- `AppHeader.tsx`: Top navigation (desktop)
- `BottomNav.tsx`: Bottom navigation (mobile)
- `Sidebar.tsx`: (Future) Left sidebar navigation

#### **Onboarding**
- `WelcomeModal.tsx`: First-time user welcome
- `OnboardingChecklist.tsx`: Task list for new users
- `HintBanner.tsx`: Contextual tips
- `KeyboardShortcuts.tsx`: Shortcut reference

#### **Live**
- `LiveStatusBadge.tsx`: Real-time connection indicator

#### **PWA**
- `UpdateBanner.tsx`: Service Worker update prompt
- `OfflineIndicator.tsx`: Offline status banner
- `DataFreshness.tsx`: Last sync timestamp

---

## Design Tokens Reference

### **Complete Tailwind Config Excerpt**

```typescript
// tailwind.config.ts
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0fb34c', hover: '#059669' },
        accent: '#00ff66',
        bg: { DEFAULT: '#0a0a0a', elevated: '#0b0b13', surface: '#18181b' },
        surface: { DEFAULT: '#18181b', hover: '#27272a', elevated: '#1c1c1e' },
        border: { DEFAULT: '#27272a', subtle: 'rgba(255,255,255,0.05)' },
        text: { primary: '#f4f4f5', secondary: '#a1a1aa', tertiary: '#71717a' },
        sentiment: {
          bull: { DEFAULT: '#10b981', bg: 'rgba(16,185,129,0.1)' },
          bear: { DEFAULT: '#f43f5e', bg: 'rgba(244,63,94,0.1)' },
        },
        success: '#10b981',
        danger: '#f43f5e',
        warn: '#f59e0b',
        info: '#06b6d4',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.33' }],
        sm: ['0.875rem', { lineHeight: '1.43' }],
        base: ['1rem', { lineHeight: '1.5' }],
        lg: ['1.125rem', { lineHeight: '1.56' }],
        xl: ['1.25rem', { lineHeight: '1.4' }],
        '2xl': ['1.5rem', { lineHeight: '1.33' }],
        '3xl': ['1.875rem', { lineHeight: '1.25' }],
        '4xl': ['2.25rem', { lineHeight: '1.2' }],
      },
      borderRadius: {
        sm: '6px', md: '8px', lg: '12px', xl: '16px', '2xl': '20px',
      },
      boxShadow: {
        'card-subtle': '0 1px 3px rgba(0,0,0,0.12)',
        'glow-accent': '0 0 10px rgba(0, 255, 102, 0.22)',
        'emerald-glow': '0 0 30px rgba(16, 185, 129, 0.3)',
      },
      animation: {
        'fade-in': 'fade-in 250ms cubic-bezier(0.4, 0, 0.2, 1) forwards',
        'slide-up': 'slide-up 250ms cubic-bezier(0, 0, 0.2, 1) forwards',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        'fade-in': {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        'slide-up': {
          'from': { opacity: '0', transform: 'translateY(16px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
} satisfies Config;
```

---

## Implementation Checklist

### **For New Components**

- [ ] **Accessibility**
  - [ ] Keyboard navigation (Tab, Enter, Escape)
  - [ ] ARIA attributes (role, aria-label, aria-describedby)
  - [ ] Focus management (focus-visible styles)
  - [ ] Screen reader support (sr-only text where needed)

- [ ] **Responsive**
  - [ ] Mobile-first classes (base → sm → md → lg)
  - [ ] Touch targets ≥44px on mobile
  - [ ] Tested on 3 screen sizes (mobile, tablet, desktop)

- [ ] **States**
  - [ ] Loading (skeleton/spinner)
  - [ ] Error (error banner with retry)
  - [ ] Empty (icon + title + description + CTA)
  - [ ] Success (actual data)

- [ ] **Dark Mode**
  - [ ] All colors use design tokens
  - [ ] High contrast text (WCAG AA)
  - [ ] Visible borders (subtle, not invisible)

- [ ] **Performance**
  - [ ] Lazy-loaded if non-critical (React.lazy)
  - [ ] Memoized if expensive (React.memo, useMemo)
  - [ ] No layout shift (fixed heights for skeletons)

- [ ] **Testing**
  - [ ] Unit tests (Vitest)
  - [ ] E2E tests for critical flows (Playwright)
  - [ ] Visual regression (manual for now)

---

## Related Documentation

- **Architecture:** `docs/core/architecture/01_repo_index.md`
- **Feature Catalog:** `docs/core/architecture/pwa-audit/02_feature_catalog.md`
- **PWA Audit:** `docs/core/architecture/pwa-audit/03_core_flows.md`
- **AI Integration:** `docs/core/ai/README_AI.md`
- **Accessibility:** `AGENT_FILES/.rulesync/07-accessibility.md`
- **Performance:** `AGENT_FILES/.rulesync/08-performance.md`

---

**Maintained by:** Sparkfined Team  
**Last Review:** 2025-11-29  
**Version:** 1.0.0

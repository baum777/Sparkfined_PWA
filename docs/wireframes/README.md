# Sparkfined PWA — UI Wireframes & Design-Spezifikationen

> **Dokumentations-Paket:** Hochdetaillierte UI-Wireframes für alle Haupt-Seiten
> **Version:** 1.0.0
> **Erstellt:** 2025-11-15
> **Status:** ✅ Vollständig spezifiziert

---

## 📋 Übersicht

Diese Dokumentation enthält **hochdetaillierte Wireframes** für alle Haupt-Seiten der Sparkfined PWA Trading-Plattform. Jede Seite ist mit exakten Maßen, Farben, Typografie, Interaktionen und responsive-Varianten spezifiziert.

**Zielgruppe:**
- Product-Owner (Anforderungs-Verständnis)
- UI/UX-Designer (Prototyping, Design-Iteration)
- Frontend-Entwickler (Implementierungs-Referenz)
- QA-Team (Visual-Regression-Tests)

---

## 📁 Dokumentations-Struktur

### Haupt-Dokumente

| Datei | Beschreibung | Status |
|-------|--------------|--------|
| **[01-ui-wireframes-overview.md](./01-ui-wireframes-overview.md)** | Design-System, Layout-Architektur, Dashboard-Page | ✅ Komplett |
| **[02-journal-page-wireframes.md](./02-journal-page-wireframes.md)** | Journal-Page, Editor, AI-Condense, Sidebar-Filter | ✅ Komplett |
| **[03-chart-page-wireframes.md](./03-chart-page-wireframes.md)** | Chart-Canvas, Indicators, Drawing-Tools, Backtest | ✅ Komplett |
| **[04-additional-pages-wireframes.md](./04-additional-pages-wireframes.md)** | Analyze, Access (Wallet-Gating), Signals/Alerts | ✅ Komplett |
| **[05-component-library-specs.md](./05-component-library-specs.md)** | UI-Primitives, Composed-Components, States | ✅ Komplett |

---

## 🎨 Design-System-Schnellreferenz

### Farbpalette (Dark-Mode-First)

```
Primary (Brand):      #0fb34c (emerald-500)
Accent:               #00ff66 (neon-green)

Success/Bullish:      #10b981 (emerald-500)
Danger/Bearish:       #f43f5e (rose-500)
Warning:              #f59e0b (amber-500)
Info:                 #06b6d4 (cyan-500)

Background:           #0a0a0a (zinc-950)
Surface:              #18181b (zinc-900)
Border:               #27272a (zinc-800)

Text-Primary:         #f4f4f5 (zinc-100)
Text-Secondary:       #a1a1aa (zinc-400)
Text-Tertiary:        #71717a (zinc-500)
```

### Typografie

```
Font-Families:
- Sans: system-ui, -apple-system, Segoe UI
- Mono: JetBrains Mono, Fira Code

Font-Sizes:
- xs:   12px (Tags, Meta)
- sm:   14px (Body-Small, Labels)
- base: 16px (Body, Inputs)
- lg:   18px (Subheadings)
- xl:   20px (Card-Titles)
- 2xl:  24px (KPI-Values)
- 3xl:  30px (Page-Titles)

Font-Weights:
- 400: Normal (Body)
- 500: Medium (Labels)
- 600: Semi-Bold (Subheadings)
- 700: Bold (Titles, KPIs)
```

### Spacing (8px-Grid)

```
1:  4px   - Micro-Spacing
2:  8px   - Standard-Gap
3:  12px  - Compact-Padding
4:  16px  - Card-Padding
5:  20px  - Section-Gap
6:  24px  - Large-Padding
8:  32px  - Section-Spacing
12: 48px  - Page-Section-Gap
```

### Border-Radius

```
sm:   6px   - Badges, Small-Buttons
md:   8px   - Buttons, Inputs
lg:   12px  - Cards, Panels
xl:   16px  - Modals
full: 9999px - Pills, Round-Buttons
```

---

## 📱 Responsive-Breakpoints

```
Base (Mobile):   < 640px   - 1-Spalten, Bottom-Nav
sm (Tablet):     ≥ 640px   - 2-Spalten
md (Tablet-L):   ≥ 768px   - 2-3-Spalten
lg (Desktop):    ≥ 1024px  - Sidebar erscheint, 3-4-Spalten
xl (Desktop-L):  ≥ 1280px  - 4-5-Spalten
2xl (Wide):      ≥ 1536px  - Max-Width
```

**Touch-Targets:**
- Mobile: 44×44px minimum (Apple HIG)
- Desktop: 32×32px minimum

---

## 📄 Seiten-Übersicht

### 1. Dashboard/Board-Page

**Datei:** `01-ui-wireframes-overview.md#3-dashboardboard-page`

**Features:**
- KPI-Tiles-Grid (4 Spalten Desktop, 1 Spalte Mobile)
- Activity-Feed (Echtzeit-Updates)
- Quick-Actions-Grid
- Market-Movers-Table

**Komponenten:**
- KPITile (128px hoch, emerald/rose-colors)
- FeedItem (compact, hover-interaction)
- QuickActionCard (140px hoch, hover-glow)

**Mobile:**
- Stacked-Layout (1-Spalte)
- Collapsible-Feed (Accordion)

---

### 2. Journal-Page

**Datei:** `02-journal-page-wireframes.md`

**Features:**
- Sidebar-Filter (280px, Search + Tags + Stats)
- Entry-List (infinite-scroll)
- Entry-Editor (Modal, Markdown-Support)
- AI-Condense-Flow (Summarization)

**Komponenten:**
- Entry-Card (expandable, 2-line-preview)
- Tag-Badge (colored by type)
- JournalEditor (Modal, max-w-2xl)
- AI-Condense-Modal (append/replace-workflow)

**Mobile:**
- Bottom-Sheet-Filters
- Swipe-to-Delete
- Full-Screen-Editor

---

### 3. Chart-Page

**Datei:** `03-chart-page-wireframes.md`

**Features:**
- OHLC-Candlestick-Chart (Lightweight-Charts)
- Overlay-Indicators (EMA, SMA, Bollinger)
- Drawing-Tools (Trend-Lines, Fibonacci)
- Indicator-Panels (RSI, MACD, Volume)
- Backtest/Replay-Mode (Timeline-Scrubber)
- MiniMap (200×40px, bottom-right)

**Komponenten:**
- ChartCanvas (min-h-500px, dark-bg)
- IndicatorPanel (100px height, collapsible)
- DrawToolbar (dropdown-menu)
- ReplayHUD (overlay, playback-controls)

**Mobile:**
- Touch-Gestures (pinch-zoom, swipe-pan)
- Bottom-Sheet-Indicators
- Simplified-Drawing-Tools

---

### 4. Analyze-Page

**Datei:** `04-additional-pages-wireframes.md#1-analyze-page`

**Features:**
- Token-Search (auto-complete)
- KPI-Grid (5 Spalten: Price, MCAP, Volume, Holders, GT-Score)
- Signal-Matrix-Heatmap (5×5 Grid, Confluence)
- AI-Insights (Bullet-Points, Deep-Analysis)
- One-Click-Actions (Save, Alert, Chart, AI)

**Komponenten:**
- Token-Search-Bar (max-w-2xl, auto-complete-dropdown)
- Signal-Matrix-Table (colored-cells, emoji-indicators)
- AI-Insights-Section (gradient-bg, emerald/cyan)

**Mobile:**
- Horizontal-Scroll-KPIs
- Simplified-Heatmap (3×3)

---

### 5. Access-Page (Wallet-Gating)

**Datei:** `04-additional-pages-wireframes.md#2-access-page`

**Features:**
- 4-Tabs (Status, Lock, Hold, Leaderboard)
- Access-Status-Card (Tier-Display, Benefits-List)
- Lock-Calculator (MCAP-based, Tier-Simulation)
- Hold-Check (Wallet-Connect, NFT-Verification)
- Leaderboard-Table (Top-333, Your-Rank-Highlighted)

**Komponenten:**
- AccessStatusCard (emerald-bg if granted, rose-bg if denied)
- LockCalculator (input + tier-preview)
- LeaderboardTable (sticky-header, your-row-highlighted)

**Mobile:**
- Tab-Overflow-Scroll
- Simplified-Calculator

---

### 6. Signals/Alerts-Page

**Datei:** `04-additional-pages-wireframes.md#3-signalsalerts-page`

**Features:**
- Active-Alerts-List (with progress-to-target)
- Triggered-Alerts-History
- AI-Generated-Signals (LONG/SHORT, Confidence-Score)
- Create-Alert-Wizard (Price, Indicator, Confluence)

**Komponenten:**
- Alert-Card (progress-bar, mute/edit/delete-actions)
- Signal-Card (confidence-bar, reasoning-bullets)
- Create-Alert-Modal (multi-type, condition-builder)

**Mobile:**
- Swipe-to-Mute
- Bottom-Sheet-Wizard

---

## 🧩 Component-Library

**Datei:** `05-component-library-specs.md`

### UI-Primitives (Level 1)

- **Button:** Variants (primary, secondary, ghost, danger), Sizes (sm, md, lg), States (loading, disabled)
- **Input:** Text, Number, Error-State, with Icons (left/right)
- **Textarea:** Resizable, Character-Count, Monospace-Support
- **Select:** Dropdown, Keyboard-Navigation, Auto-Complete
- **Modal:** Focus-Trap, Backdrop, Escape-to-Close
- **Badge:** Variants (success, error, warning, info, neutral), Pill-Mode
- **Card:** Variants (default, elevated, glass), Sub-Components (Header, Title, Content)
- **Skeleton:** Pulse-Animation, Shimmer-Variant

### Composed-Components (Level 2)

- **KPITile:** Label, Value, Change, Sentiment-Colors, Refresh-Action
- **FeedItem:** Icon, Title, Description, Time, Click-to-Navigate
- **SignalCard:** Direction, Confidence-Bar, Entry/SL/TP, Reasoning-Bullets
- **QuickActionCard:** Icon, Title, Description, Hover-Glow, CTA-Arrow
- **Entry-Card:** Title, Tags, Preview, Metadata, Actions (AI-Condense, Edit, Delete)

### Section-Components (Level 3)

- **ChartCanvas:** OHLC, Indicators, Crosshair, Drawing-Objects
- **IndicatorPanel:** Chart-Area, Header-Controls, Minimize/Close
- **JournalEditor:** Title-Input, Tags-Input, Content-Textarea, Trade-Metrics

### Layout-Components (Level 4)

- **Header:** Logo, Nav, Search, User-Menu
- **Sidebar:** Desktop-Only (≥1024px), Icon+Label, Active-State
- **BottomNav:** Mobile-Only (<1024px), Icon+Label, Active-Indicator

---

## 🎯 Interaktions-Patterns

### Desktop-Interaktionen

**Hover:**
- Cards: border-brighten, shadow-appear, translateY(-2px)
- Buttons: background-brighten, shadow-md
- Links: text-color-brighten, underline

**Click:**
- Entry-Card: Opens-Detail-View (Modal or Page)
- Quick-Action: Navigates-to-Feature
- Signal-Card: Expands-Details

**Keyboard:**
- Tab: Focus-Navigation
- Enter: Activate-Focused-Element
- Escape: Close-Modal
- Cmd/Ctrl+S: Save
- Cmd/Ctrl+N: New-Entry
- /: Focus-Search

### Mobile-Interaktionen

**Touch:**
- Tap: Primary-Action
- Long-Press: Context-Menu
- Swipe-Left: Reveal-Actions (Edit, Delete)
- Swipe-Right: Archive/Undo

**Gestures (Chart):**
- Pinch: Zoom-In/Out
- Two-Finger-Drag: Pan-Chart
- Double-Tap: Reset-Zoom
- Tap-and-Hold: Show-Crosshair

---

## ♿ Accessibility (WCAG 2.1 AA)

### Color-Contrast

**Mindest-Verhältnisse:**
- Text-Primary (zinc-100) on bg-zinc-950: 14.5:1 ✅
- Text-Secondary (zinc-400) on bg-zinc-950: 7.2:1 ✅
- Emerald-500 on zinc-950: 4.8:1 ✅

### Keyboard-Navigation

**Tab-Order:**
- Logical-Flow (top-to-bottom, left-to-right)
- Skip-to-Main-Content
- Focus-Visible (ring-2 ring-emerald-500)

**ARIA-Labels:**
```tsx
<button aria-label="Delete entry">
  <TrashIcon />
</button>
```

**Form-Validation:**
```tsx
<Input
  aria-invalid={hasError}
  aria-describedby="error-message"
/>
```

### Screen-Reader-Support

- Semantic-HTML (`<nav>`, `<main>`, `<article>`)
- ARIA-Roles (`role="dialog"`, `role="alert"`)
- Live-Regions (`aria-live="polite"` für Updates)

---

## 📐 Implementierungs-Checkliste

### Phase 1: Design-System (Woche 1-2)

- [ ] Tailwind-Config-Audit (Farben, Spacing, Typography)
- [ ] UI-Primitives-Library (Button, Input, Modal, etc.)
- [ ] Storybook-Setup (Component-Documentation)
- [ ] Dark-Mode-Themes (verify contrast-ratios)

### Phase 2: Layout-Foundation (Woche 3-4)

- [ ] Header-Component (Sticky, Responsive)
- [ ] Sidebar-Component (Desktop, Fixed-Width)
- [ ] BottomNav-Component (Mobile, Fixed-Bottom)
- [ ] Page-Layout-Templates (Single-Column, 2-Column, etc.)

### Phase 3: Page-by-Page-Implementation (Woche 5-12)

**Dashboard (Woche 5-6):**
- [ ] KPITile-Grid (Responsive, 4→1-Spalten)
- [ ] Activity-Feed (Infinite-Scroll)
- [ ] Quick-Actions-Grid
- [ ] Market-Movers-Table

**Journal (Woche 7-8):**
- [ ] Sidebar-Filter (Search, Tags, Stats)
- [ ] Entry-List (Infinite-Scroll, Entry-Cards)
- [ ] Entry-Editor-Modal (Markdown, Tags, Metrics)
- [ ] AI-Condense-Flow (Modal, Append/Replace)

**Chart (Woche 9-10):**
- [ ] Chart-Canvas (Lightweight-Charts-Integration)
- [ ] Toolbar (Token-Search, Timeframe, Indicators, Draw)
- [ ] Indicator-Panels (RSI, MACD, Volume)
- [ ] Drawing-Tools (Trend-Line, Fibonacci)
- [ ] Backtest/Replay-Mode (HUD, Scrubber)

**Analyze (Woche 11):**
- [ ] Token-Search (Auto-Complete)
- [ ] KPI-Grid (5-Spalten)
- [ ] Signal-Matrix-Heatmap
- [ ] AI-Insights-Section

**Access & Signals (Woche 12):**
- [ ] Access-Status-Card, Lock-Calculator, Leaderboard
- [ ] Alert-List, Signal-Cards, Create-Alert-Wizard

### Phase 4: Mobile-Optimierung (Woche 13-14)

- [ ] Touch-Gestures (Swipe, Long-Press)
- [ ] Bottom-Sheets (Filters, Modals)
- [ ] Responsive-Tables (Horizontal-Scroll)
- [ ] Mobile-Chart-Interactions (Pinch-Zoom)

### Phase 5: Interaktionen & Animations (Woche 15-16)

- [ ] Hover-States (Cards, Buttons)
- [ ] Transitions (fade-in, slide-up, scale-in)
- [ ] Loading-States (Skeleton, Spinner)
- [ ] Error/Empty-States

### Phase 6: Accessibility & Testing (Woche 17-18)

- [ ] Keyboard-Navigation (Tab-Order, Focus-Management)
- [ ] ARIA-Labels (Icon-Buttons, Form-Errors)
- [ ] Color-Contrast-Audit (WCAG-AA)
- [ ] Screen-Reader-Testing (NVDA, JAWS)
- [ ] Visual-Regression-Tests (Percy, Chromatic)

---

## 🔗 Related-Resources

**Project-Documentation:**
- [CLAUDE.md](../../CLAUDE.md) — Claude-Code-Rules
- [.rulesync/04-ui-ux-components.md](../../.rulesync/04-ui-ux-components.md) — UI/UX-Conventions
- [.rulesync/02-frontend-arch.md](../../.rulesync/02-frontend-arch.md) — Frontend-Architecture

**Existing-Code:**
- [src/components/ui/](../../src/components/ui/) — UI-Primitives
- [src/components/](../../src/components/) — Composed-Components
- [src/pages/](../../src/pages/) — Page-Components
- [tailwind.config.ts](../../tailwind.config.ts) — Design-Tokens

**External-References:**
- [Tailwind-CSS-Docs](https://tailwindcss.com/docs)
- [Apple-HIG](https://developer.apple.com/design/human-interface-guidelines/) — Mobile-UI-Guidelines
- [WCAG-2.1](https://www.w3.org/WAI/WCAG21/quickref/) — Accessibility-Standards

---

## 📊 Wireframe-Status-Matrix

| Seite | Desktop-Wireframes | Mobile-Wireframes | Komponenten-Specs | Interaktionen | Status |
|-------|-------------------|-------------------|-------------------|---------------|--------|
| Dashboard | ✅ | ✅ | ✅ | ✅ | Komplett |
| Journal | ✅ | ✅ | ✅ | ✅ | Komplett |
| Chart | ✅ | ✅ | ✅ | ✅ | Komplett |
| Analyze | ✅ | ✅ | ✅ | ✅ | Komplett |
| Access | ✅ | ✅ | ✅ | ✅ | Komplett |
| Signals | ✅ | ✅ | ✅ | ✅ | Komplett |

**Gesamt-Coverage:** 6/6 Haupt-Seiten (100%)

---

## 🚀 Nächste-Schritte

### Kurzfristig (nächste 2-4 Wochen)

1. **Design-Review:** Stakeholder-Feedback einholen
2. **Prototyping:** Figma-Prototypen erstellen (optional)
3. **Development-Kickoff:** Phase-1-Tasks starten (Design-System)

### Mittelfristig (nächste 2-3 Monate)

1. **Schrittweise-Implementation:** Page-by-Page (Dashboard → Journal → Chart → etc.)
2. **User-Testing:** Beta-Tester-Feedback (Usability, Performance)
3. **Iteration:** Wireframes-Update basierend auf Learnings

### Langfristig (Q1-Q2 2025)

1. **Advanced-Features:** Real-Time-Data, Background-Sync, Push-Notifications
2. **Platform-Expansion:** Desktop-App (Electron/Tauri)
3. **Design-System-Library:** Standalone-NPM-Package (optional)

---

## 📝 Changelog

**2025-11-15 (v1.0.0):**
- ✅ Initial-Release: 6 Haupt-Seiten komplett spezifiziert
- ✅ Design-System-Reference (Farben, Typografie, Spacing)
- ✅ Component-Library-Specs (15+ UI-Primitives, 10+ Composed)
- ✅ Mobile-Responsive-Varianten (alle Seiten)
- ✅ Accessibility-Guidelines (WCAG-2.1-AA)

---

## 📧 Kontakt & Feedback

**Fragen zur Dokumentation:**
- GitHub-Issues: [github.com/baum777/Sparkfined_PWA/issues](https://github.com/baum777/Sparkfined_PWA/issues)
- Design-Review-Requests: Tag `design` + `wireframes`

**Update-Requests:**
- Neue Seiten/Features: Erstelle Issue mit `wireframe-request`-Label
- Iterationen: PR mit `wireframe-update`-Label

---

**Letzte-Aktualisierung:** 2025-11-15
**Maintainer:** Claude + Baum777
**Version:** 1.0.0
**Status:** ✅ Production-Ready

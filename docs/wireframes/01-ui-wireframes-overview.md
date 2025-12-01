# Sparkfined PWA — Hochdetaillierte UI Wireframes

> **Version:** 1.0.0
> **Erstellt:** 2025-11-15
> **Status:** Design-Spezifikation
> **Zielgruppe:** Product-Owner, Designer, Frontend-Entwickler

---

## Inhaltsverzeichnis

1. [Design-System-Übersicht](#1-design-system-übersicht)
2. [Layout-Architektur](#2-layout-architektur)
3. [Dashboard/Board-Page](#3-dashboardboard-page)
4. [Chart-Page](#4-chart-page)
5. [Journal-Page](#5-journal-page)
6. [Analyze-Page](#6-analyze-page)
7. [Access-Page](#7-access-page)
8. [Signals/Alerts-Page](#8-signalsalerts-page)
9. [Component-Spezifikationen](#9-component-spezifikationen)
10. [Mobile-Responsive-Varianten](#10-mobile-responsive-varianten)
11. [User-Flows](#11-user-flows)
12. [Interaktions-Patterns](#12-interaktions-patterns)

---

## 1. Design-System-Übersicht

### 1.1 Farbpalette

#### Brand-Farben
```
Primary (Emerald):    #0fb34c   - Hauptaktionen, CTAs, Erfolg
Primary-Hover:        #059669   - Hover-Zustand
Accent (Neon Green):  #00ff66   - Highlights, Akzente
```

#### Semantische Farben
```
Success/Bullish:  #10b981 (emerald-500)  - Positive Veränderungen
Danger/Bearish:   #f43f5e (rose-500)     - Negative Veränderungen
Warning:          #f59e0b (amber-500)    - Warnungen
Info:             #06b6d4 (cyan-500)     - Informationen
```

#### Hintergrund & Oberflächen (Dark-Mode-First)
```
Background:       #0a0a0a (zinc-950)     - App-Hintergrund
Surface:          #18181b (zinc-900)     - Cards, Panels
Surface-Hover:    #27272a (zinc-800)     - Hover-Zustand
Surface-850:      #1c1c1e                - Zwischenton
Border:           #27272a (zinc-800)     - Standard-Rahmen
Border-Accent:    #0fb34c                - Aktive Elemente
```

#### Text-Hierarchie
```
Text-Primary:     #f4f4f5 (zinc-100)     - Haupttext
Text-Secondary:   #a1a1aa (zinc-400)     - Beschreibungen
Text-Tertiary:    #71717a (zinc-500)     - Meta-Informationen
```

### 1.2 Typografie

#### Font-Families
```
Sans-Serif:  system-ui, -apple-system, Segoe UI
Monospace:   JetBrains Mono, Fira Code
Display:     system-ui (für Headlines)
```

#### Font-Sizes & Line-Heights
```
xs:    0.75rem  (12px)  - Line-Height: 1.33 → 16px - Tags, Labels
sm:    0.875rem (14px)  - Line-Height: 1.43 → 20px - Meta-Text, Captions
base:  1rem     (16px)  - Line-Height: 1.5  → 24px - Body-Text
lg:    1.125rem (18px)  - Line-Height: 1.56 → 28px - Subheadings
xl:    1.25rem  (20px)  - Line-Height: 1.4  → 28px - Card-Headlines
2xl:   1.5rem   (24px)  - Line-Height: 1.33 → 32px - KPI-Values
3xl:   1.875rem (30px)  - Line-Height: 1.25 → 38px - Page-Titles
4xl:   2.25rem  (36px)  - Line-Height: 1.2  → 44px - Hero-Titles
```

#### Font-Weights
```
400:  Normal      - Body-Text
500:  Medium      - Labels, Nav-Items
600:  Semi-Bold   - Subheadings, Buttons
700:  Bold        - Headlines, KPI-Values
```

### 1.3 Spacing (8px-Grid)

#### Basis-Spacing
```
1:   4px    - Icon-Padding, Micro-Spacing
2:   8px    - Standard-Gap zwischen verwandten Elementen
3:   12px   - Inhalts-Padding in kompakten Cards
4:   16px   - Standard-Card-Padding
5:   20px   - Vertikaler Abstand zwischen Sections
6:   24px   - Großzügiger Card-Abstand
8:   32px   - Section-Spacing
12:  48px   - Page-Section-Abstand
16:  64px   - Large-Section-Gaps
```

#### Layout-Spacing
```
px-4:  Horizontal-Padding (Mobile)      → 16px
px-6:  Horizontal-Padding (Tablet)      → 24px
px-8:  Horizontal-Padding (Desktop)     → 32px
pb-24: Bottom-Padding (Mobile-Nav)      → 96px
```

### 1.4 Border-Radius

```
sm:   6px    - Small-Elements (Badges, Small-Buttons)
md:   8px    - Standard-Buttons, Inputs
lg:   12px   - Cards, Modals
xl:   16px   - Large-Cards, Panels
2xl:  20px   - Hero-Sections
full: 9999px - Pills, Round-Buttons
```

### 1.5 Schatten & Glows

#### Box-Shadows
```
card-subtle:     0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)
                 - Subtile Card-Elevation

glow-accent:     0 0 10px rgba(0, 255, 102, 0.22)
                 - Neon-Green-Accent-Glow

emerald-glow:    0 0 30px rgba(16, 185, 129, 0.3)
emerald-glow-lg: 0 0 50px rgba(16, 185, 129, 0.5)
emerald-glow-xl: 0 0 70px rgba(16, 185, 129, 0.6)
                 - Success/Bullish-Glows

rose-glow:       0 0 20px rgba(244, 63, 94, 0.3)
                 - Error/Bearish-Glow
```

### 1.6 Animationen

#### Transitions
```
Duration:
- 75ms:   Micro-Interactions (Hover, Focus)
- 150ms:  Standard-Transitions (Button-Hover)
- 250ms:  Page-Transitions, Modal-Open
- 350ms:  Slide-In-Animations
- 500ms:  Complex-Animations

Timing-Functions:
- soft-out:  cubic-bezier(0, 0, 0.2, 1)    - Standard
- in-out:    cubic-bezier(0.4, 0, 0.2, 1)  - Balanced
- soft:      cubic-bezier(0.22, 0.61, 0.36, 1) - Smooth
```

#### Keyframe-Animations
```
fade-in:        Opacity 0 → 1
slide-up:       translateY(16px) → 0 + Fade
slide-down:     translateY(-16px) → 0 + Fade
slide-in-left:  translateX(-20px) → 0 + Fade
scale-in:       scale(0.95) → 1 + Fade
shimmer:        Loading-Shimmer-Effect
pulse:          Opacity-Pulse für Loading
ticker:         Horizontal-Scroll-Animation
```

### 1.7 Responsive-Breakpoints

```
Base (Mobile):   < 640px   - 1-Spalten-Layout, Bottom-Nav
sm (Tablet):     ≥ 640px   - 2-Spalten-Layout
md (Tablet-L):   ≥ 768px   - 2-3-Spalten-Layout
lg (Desktop):    ≥ 1024px  - 3-4-Spalten-Layout, Sidebar erscheint
xl (Desktop-L):  ≥ 1280px  - 4-5-Spalten-Layout
2xl (Wide):      ≥ 1536px  - Maximale Breite
```

#### Touch-Target-Mindestgröße
```
Mobile:  44×44px (Apple HIG, Material Design)
Desktop: 32×32px (Maus-Interaktion)
```

---

## 2. Layout-Architektur

### 2.1 Desktop-Layout (≥1024px)

```
┌────────────────────────────────────────────────────────────────┐
│  Header (Sticky, h-16, 64px)                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Logo/Title                    [Search]    [User] [🔔]    │   │
│  └─────────────────────────────────────────────────────────┘   │
├───┬────────────────────────────────────────────────────────────┤
│   │                                                            │
│ S │  Main Content Area (role="main")                          │
│ i │  ┌──────────────────────────────────────────────────┐     │
│ d │  │ Page-Specific Content                            │     │
│ e │  │ - Dashboard: KPI-Grid + Feed + Quick-Actions     │     │
│ b │  │ - Chart: Canvas + Toolbar + Indicators           │     │
│ a │  │ - Journal: Sidebar + Editor + List               │     │
│ r │  │                                                   │     │
│   │  │ Padding: px-8 (32px)                             │     │
│ 8 │  │ Bottom-Padding: pb-8 (32px)                      │     │
│ 0 │  └──────────────────────────────────────────────────┘     │
│ p │                                                            │
│ x │                                                            │
│   │                                                            │
└───┴────────────────────────────────────────────────────────────┘
```

**Layout-Details:**
- **Sidebar-Width:** 80px (fixed, left-aligned)
- **Sidebar-Items:** Icon + Label (vertikal zentriert)
- **Main-Content-Offset:** `lg:pl-20` (80px links-versetzt)
- **Header-Height:** 64px (sticky top-0, z-40)
- **Content-Max-Width:** 100% (keine Begrenzung, volle Breite)

### 2.2 Mobile-Layout (<1024px)

```
┌─────────────────────────────┐
│ Header (Sticky, h-14, 56px) │
│ ┌─────────────────────────┐ │
│ │ [←] Title        [🔔]   │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│                             │
│  Main Content               │
│  ┌───────────────────────┐  │
│  │ Page Content          │  │
│  │                       │  │
│  │ Padding: px-4 (16px)  │  │
│  │ pb-24 (96px) für      │  │
│  │ Bottom-Nav-Clearance  │  │
│  └───────────────────────┘  │
│                             │
├─────────────────────────────┤
│ Bottom-Nav (Fixed, h-16)    │
│ ┌─────────────────────────┐ │
│ │ [📊] [📈] [📝] [🔔] [⚙]│ │
│ │ Board Analyze Chart ... │ │
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

**Layout-Details:**
- **Header-Height:** 56px (Mobile), 64px (Desktop)
- **Bottom-Nav-Height:** 64px (fixed bottom-0, z-50)
- **Main-Content-Padding:** px-4 (16px horizontal), pb-24 (96px bottom)
- **Nav-Items:** Icon + Label (5-6 Items, horizontal)

### 2.3 Navigations-Struktur

#### Desktop-Sidebar (≥1024px)
```
┌─────────┐
│  Logo   │ (48×48px, centered)
├─────────┤
│ [📊]    │ Board (Dashboard)
│ Board   │
├─────────┤
│ [🔍]    │ Analyze
│ Analyze │
├─────────┤
│ [📈]    │ Chart
│ Chart   │
├─────────┤
│ [📝]    │ Journal
│ Journal │
├─────────┤
│ [🔔]    │ Alerts
│ Alerts  │
├─────────┤
│         │ (Spacer)
├─────────┤
│ [⚙️]    │ Settings
│ Settings│
└─────────┘
```

**Interaktions-States:**
- **Default:** `bg-transparent`, `text-zinc-400`
- **Hover:** `bg-zinc-800`, `text-zinc-100`
- **Active:** `bg-emerald-500/10`, `border-l-4 border-emerald-500`, `text-emerald-500`
- **Icon-Size:** 24×24px
- **Label:** text-xs (12px), font-medium (500)

#### Mobile-Bottom-Nav (<1024px)
```
┌────────────────────────────────────────────┐
│  [📊]    [🔍]    [📈]    [📝]    [🔔]      │
│  Board   Analyze Chart   Journal Alerts    │
└────────────────────────────────────────────┘
```

**Item-Spacing:**
- **Item-Width:** ~20% (flex-1, equally distributed)
- **Icon-Size:** 24×24px
- **Label:** text-xs (12px), mt-1 (4px gap)
- **Active-Indicator:** Emerald-Color + bottom-border (2px)

---

## 3. Dashboard/Board-Page

### 3.1 Desktop-Layout (1280px+)

```
┌────────────────────────────────────────────────────────────────────────┐
│ Header: "Dashboard" (h2, text-3xl, font-bold, mb-6)                   │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ Section 1: KPI-Grid (grid grid-cols-4 gap-4, mb-8)                    │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│ │ KPI 1    │  │ KPI 2    │  │ KPI 3    │  │ KPI 4    │                │
│ │ Portfolio│  │ 24h P&L  │  │ Win Rate │  │ Signals  │                │
│ │ $45,230  │  │ +$1,234  │  │ 67%      │  │ 12       │                │
│ │ ↑ +2.3%  │  │ ↑ +5.2%  │  │ → 0.0%   │  │ 3 new    │                │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘                │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ Section 2: 2-Column-Layout (grid grid-cols-2 gap-6)                   │
│ ┌────────────────────────────┐  ┌────────────────────────────┐        │
│ │ Activity Feed (Col 1)      │  │ Quick Actions (Col 2)      │        │
│ │ ┌────────────────────────┐ │  │ ┌────────────────────────┐ │        │
│ │ │ [🟢] BTC Alert Triggered│ │  │ │ [+] New Trade Entry   │ │        │
│ │ │ 2 min ago              │ │  │ │ Log your latest trade │ │        │
│ │ ├────────────────────────┤ │  │ ├────────────────────────┤ │        │
│ │ │ [📝] Journal Entry     │ │  │ │ [📊] Run Analysis     │ │        │
│ │ │ 15 min ago             │ │  │ │ Analyze token data    │ │        │
│ │ ├────────────────────────┤ │  │ ├────────────────────────┤ │        │
│ │ │ [🔴] SOL Price Drop    │ │  │ │ [🔔] Set Alert        │ │        │
│ │ │ 1 hour ago             │ │  │ │ Configure price alert │ │        │
│ │ └────────────────────────┘ │  │ └────────────────────────┘ │        │
│ └────────────────────────────┘  └────────────────────────────┘        │
│                                                                        │
├────────────────────────────────────────────────────────────────────────┤
│ Section 3: Market Movers (mb-8)                                       │
│ ┌────────────────────────────────────────────────────────────────┐    │
│ │ Token        Price     24h Change   Volume      GT-Score       │    │
│ ├────────────────────────────────────────────────────────────────┤    │
│ │ SOL          $125.34   ↑ +12.5%     $1.2B       85/100        │    │
│ │ BTC          $65,430   ↓ -2.3%      $28.5B      72/100        │    │
│ │ BONK         $0.00023  ↑ +45.2%     $340M       92/100        │    │
│ └────────────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────────┘
```

### 3.2 KPI-Tile-Spezifikation

```
┌─────────────────────────────────┐
│ Label (h3, text-sm, zinc-400)   │  ← 12px top-padding
│ Portfolio Value                 │
│                                 │
│ Value (p, text-2xl, font-bold)  │  ← 8px gap
│ $45,230                         │  ← emerald-500 (if positive)
│                                 │
│ Change (p, text-sm, zinc-500)   │  ← 4px gap
│ ↑ +2.3% (24h)                   │
│                                 │
│ [🔄] Refresh                    │  ← Top-right corner (absolute)
└─────────────────────────────────┘
```

**Maße & Styling:**
- **Width:** flex-1 (4 Tiles in Row)
- **Height:** min-h-32 (128px)
- **Padding:** p-4 (16px all sides)
- **Background:** bg-zinc-900, border border-zinc-800
- **Border-Radius:** rounded-lg (12px)
- **Hover:** shadow-card-subtle, border-emerald-500/30

**Text-Hierarchie:**
- **Label:** text-sm (14px), font-medium (500), text-zinc-400
- **Value:** text-2xl (24px), font-bold (700), dynamic color
  - Positive: text-emerald-500
  - Negative: text-rose-500
  - Neutral: text-zinc-100
- **Change:** text-sm (14px), text-zinc-500, with arrow icon

**Refresh-Button:**
- **Position:** absolute top-3 right-3
- **Size:** w-8 h-8 (32×32px)
- **Icon:** 16×16px, text-zinc-500
- **Hover:** bg-zinc-800, rounded-md

### 3.3 Activity-Feed-Item-Spezifikation

```
┌────────────────────────────────────────────┐
│ [Icon] Event-Title                    Time │  ← flex justify-between
│        Event-Description                   │  ← text-sm, zinc-500
└────────────────────────────────────────────┘
```

**Maße & Styling:**
- **Padding:** p-3 (12px)
- **Gap:** gap-3 (12px) between icon and text
- **Border-Bottom:** border-b border-zinc-800 (except last)
- **Hover:** bg-zinc-850

**Icon-Varianten:**
- **Alert:** 🟢 (emerald-500), 🔴 (rose-500), 🟡 (amber-500)
- **Journal:** 📝 (zinc-400)
- **Trade:** 💰 (emerald-500)
- **Size:** 20×20px

**Text:**
- **Title:** text-sm (14px), font-medium (500), text-zinc-100
- **Description:** text-xs (12px), text-zinc-500, mt-1
- **Time:** text-xs (12px), text-zinc-500

### 3.4 Quick-Action-Card-Spezifikation

```
┌────────────────────────────────┐
│  [Icon]                        │  ← 48×48px, emerald-500
│                                │
│  Action-Title                  │  ← text-base, font-semibold
│  Action-Description            │  ← text-sm, zinc-500
│                                │
│  [CTA-Arrow →]                 │  ← Bottom-right, emerald-500
└────────────────────────────────┘
```

**Maße & Styling:**
- **Padding:** p-5 (20px)
- **Min-Height:** 140px
- **Background:** bg-zinc-900, border border-zinc-800
- **Border-Radius:** rounded-lg (12px)
- **Hover:** bg-zinc-850, border-emerald-500/50, shadow-emerald-glow

**Icon:**
- **Size:** 48×48px
- **Color:** text-emerald-500
- **Margin-Bottom:** mb-4 (16px)

**Text:**
- **Title:** text-base (16px), font-semibold (600), text-zinc-100
- **Description:** text-sm (14px), text-zinc-500, mt-2

**CTA-Arrow:**
- **Position:** absolute bottom-4 right-4
- **Size:** 20×20px
- **Color:** text-emerald-500
- **Transition:** transform, translateX on hover (4px right)

### 3.5 Mobile-Layout (<768px)

```
┌────────────────────────────┐
│ Header: "Dashboard"        │
├────────────────────────────┤
│ KPI-Grid (1-Spalte)        │
│ ┌────────────────────────┐ │
│ │ KPI 1: Portfolio       │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ KPI 2: 24h P&L         │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ KPI 3: Win Rate        │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ KPI 4: Signals         │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ Quick Actions (1-Spalte)   │
│ ┌────────────────────────┐ │
│ │ [+] New Trade Entry    │ │
│ └────────────────────────┘ │
│ ┌────────────────────────┐ │
│ │ [📊] Run Analysis      │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│ Activity Feed              │
│ (Collapsed by default)     │
└────────────────────────────┘
```

**Responsive-Changes:**
- **KPI-Grid:** `grid-cols-1` (stacked)
- **Gap:** gap-3 (12px) instead of gap-4
- **Activity-Feed:** Optional collapse (Accordion)
- **Market-Movers:** Horizontal-Scroll-Table

---

*Fortsetzung in separaten Dateien für Chart, Journal, Analyze, Access, Signals...*

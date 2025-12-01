# Sparkfined PWA — Design-Tokens & Styleguide
> **Umfassende UI/UX-Spezifikation**  
> Version: 1.0.0  
> Erstellt: 2025-11-29  
> Quellen: Code-Analyse, README, Dokumentation, Tailwind-Config

---

## Inhaltsverzeichnis

1. [Extrahierte UI-/UX-Anforderungen aus dem Repository](#1-extrahierte-uiux-anforderungen-aus-dem-repository)
2. [Design-Tokens & UI-Styleguide (Vorschlag)](#2-design-tokens--ui-styleguide-vorschlag)
3. [Screen-/Layout-Struktur inkl. Wireframe-Beschreibungen](#3-screen-layout-struktur-inkl-wireframe-beschreibungen)

---

## 1. Extrahierte UI-/UX-Anforderungen aus dem Repository

### 1.1 Projektvision & Zielgruppe

**Produkttyp:** Offline-First Trading Command Center (PWA)  
**Kernfokus:** Crypto-Trading-Analyse, Trading-Journal, AI-gestützte Insights

**Primäre Nutzer:**
- **Day Trader (40%)** — Desktop-heavy (24"+ Monitore), benötigen Informationsdichte, 4-8h Sessions
- **Meme Coin Degens (30%)** — Mobile-first, FOMO-getrieben, Real-Time-Alerts
- **Self-Improvement Trader (20%)** — Journal-fokussiert, systematisch, KPI-Tracking
- **DeFi Power User (10%)** — Technisch versiert, Solana-fokussiert

**Nutzungsverteilung:**
- 60% Desktop (Chrome 80%, Firefox 15%, Safari 5%)
- 35% Mobile (iOS 70%, Android 30%)
- 5% Tablet (iPad Pro/Air)

### 1.2 Design-Philosophie (aus Code & Dokumentation)

#### **Kernprinzipien:**

**1. Dark-Mode-First**
- 93% der Beta-Tester bevorzugen Dark Mode
- Kein Light Mode geplant (Trading findet nachts statt, reduziert Eye-Strain)
- OLED-Modus optional (pure #000000 Hintergründe)

**2. Information Density**
- Bloomberg-Terminal-Stil: 20+ KPIs auf einen Blick
- Multi-Column-Layouts (3-4 Spalten auf Desktop)
- Kompakte Tabellen (14px Body, 12px Labels)
- Kleine Margins (16-24px zwischen Sektionen)

**3. Action Proximity**
- Sticky Action Bars (Save, Analyze, Alert immer sichtbar)
- Keyboard Shortcuts (Cmd+S, Cmd+N)
- Keine unnötigen Confirmation-Dialoge (außer destruktive Aktionen)

**4. Offline-First**
- 100% Kern-Features offline nutzbar (Journal, Dashboard, Charts)
- IndexedDB (50MB+), Service Worker (66 Assets, ~428KB)
- Background Sync für API-Calls

**5. Confluence Over Single Signals**
- Visuelle Rule Builder (AND/OR-Logik)
- Confluence Heatmap (zeigt wo 3+ Indikatoren übereinstimmen)

### 1.3 Content-Typen

**1. Real-Time Market Data**
- OHLC-Candlestick-Charts (1m-1d Timeframes)
- Live Preise, 24h Volumen, Market Cap
- 25+ technische Indikatoren (RSI, MACD, Bollinger, Fibonacci)

**2. Trading Journal**
- Rich Text + Screenshots (OCR-enabled)
- Tags (z.B. "Long SOL", "Revenge Trade")
- Performance-Metriken (Win Rate, R-Multiple, Drawdown)

**3. AI-Generated Insights**
- Market Bullets (3-5 Sätze Zusammenfassungen)
- Trade Post-Mortems (kondensierte Learnings)
- Social Sentiment (Grok-powered)

**4. Alerts & Signals**
- Price Alerts, Volume Spikes, Trend Reversals
- Confluence Rules (AND/OR-Logik)
- Alert History mit Performance Tracking

**5. KPIs & Metriken**
- Net P&L, Win Rate, Sharpe Ratio, Max Drawdown
- Streak Tracking (Journal Tage, aufeinanderfolgende Wins)
- Session-basierte Performance (London/NY/Asia)

### 1.4 Geräte & Plattformen

| Device | Auflösung | Browser | Nutzung | Touch |
|--------|-----------|---------|---------|-------|
| Desktop 24"+ | 1920×1080, 2560×1440 | Chrome 80% | 60% | Nein |
| MacBook | 13"-16" Retina | Safari, Chrome | 20% | Trackpad |
| iPhone 12+ | 5.5"-6.7" | Safari | 25% | Ja |
| Android Flagship | 6.0"-6.7" | Chrome | 10% | Ja |
| iPad Pro/Air | 10"-13" | Safari | 5% | Ja |

### 1.5 Use Cases & Nutzungsmuster

| Use Case | Frequenz | Device | Dauer | Offline |
|----------|----------|--------|-------|---------|
| Quick Price Check | 50x/Tag | Mobile 70% | 10s | ✅ Cached |
| Chart-Analyse | 10x/Tag | Desktop 90% | 5-15min | ✅ Full |
| Journal Entry | 1-3x/Tag | Desktop 80% | 10-20min | ✅ Full |
| Alert Setup | 2x/Tag | Desktop 70% | 2-5min | ⚠️ Sync later |
| KPI Review | 2x/Tag | Desktop 60% | 2-3min | ✅ Cached |
| AI Analysis | 3-5x/Tag | Desktop 70% | 30s-2min | ❌ Online only |

### 1.6 Bestehende Komponenten-Struktur (aus Code)

**4-Ebenen-Hierarchie:**

```
Level 1: UI Primitives (src/components/ui/)
├── Button.tsx (primary, secondary, ghost, outline)
├── Input.tsx (label, error, helperText, mono)
├── Card.tsx (default, muted, interactive)
├── Badge.tsx (default, success, warning, danger)
├── Select.tsx (custom dropdown)
├── Modal.tsx (focus trap, ARIA)
├── Skeleton.tsx (loading placeholder)
├── EmptyState.tsx (icon, title, description, CTA)
├── ErrorBanner.tsx (message, retry)
└── 5 weitere...

Level 2: Composed Components (src/components/)
├── dashboard/ (KPITile, InsightTeaser, JournalSnapshot)
├── journal/ (JournalList, JournalDetailPanel, JourneyBanner)
├── watchlist/ (WatchlistTable, WatchlistDetailPanel)
├── alerts/ (AlertsList, AlertsDetailPanel)
└── 6 weitere Kategorien...

Level 3: Layouts
├── DashboardShell.tsx (Header, KPI Strip, Main Content)
├── JournalLayout.tsx (Two-Column: List + Detail)
├── WatchlistLayout.tsx
└── 2 weitere...

Level 4: Pages (src/pages/)
├── DashboardPageV2.tsx
├── JournalPageV2.tsx
├── WatchlistPageV2.tsx
└── 6 weitere...
```

**Gesamt:** ~60 Components (14 Primitives, ~30 Composed, 5 Layouts, 9 Pages)

### 1.7 Routing & Navigation

**Primäre Routes:**
- `/dashboard-v2` — Dashboard (KPI Strip + 2-Column Grid)
- `/watchlist-v2` — Watchlist (Table + Detail Panel)
- `/analysis-v2` — Analysis (Tabs + AI Insight Cards)
- `/journal-v2` — Journal (List + Detail Panel)
- `/alerts-v2` — Alerts (List + Detail Panel)
- `/chart-v2` — Chart (Full-Width Canvas)
- `/settings-v2` — Settings (Form Layout)
- `/landing` — Landing Page (Marketing Layout)

**Navigation:**
- **Desktop:** AppHeader (Top Nav, 5 Items: Dashboard, Watchlist, Analysis, Journal, Alerts)
- **Mobile:** BottomNav (Fixed Bottom, 4 Tabs: Board, Analyze, Journal, Settings)

### 1.8 Accessibility-Anforderungen (aus Code)

- **WCAG 2.1 AA Compliance**
- Kontrast: 7:1 für Text (AAA-Level), 4.5:1 für großen Text
- Keyboard Navigation: Tab, Enter, Escape, Arrow Keys
- Focus Trap in Modals (`useFocusTrap` Hook)
- ARIA-Attribute: `role`, `aria-label`, `aria-describedby`, `aria-expanded`
- Screen Reader Support: `.sr-only` Class
- Reduced Motion Support: `@media (prefers-reduced-motion: reduce)`

---

## 2. Design-Tokens & UI-Styleguide (Vorschlag)

### 2.0 Token-Format & Themes (Canonical Regeln)

- **Farbtokens = RGB-Kanäle**  
  Alle `--color-*` Variablen speichern nur die drei Kanäle (`--color-bg: 10 10 10`). Konsum erfolgt immer über `rgb(var(--color-bg) / alpha)`.  
  Beispiel: `border-color: rgb(var(--color-border) / 0.15);`
- **Dark-Mode-First**  
  `:root` liefert Dark-Defaults und der `ThemeProvider` setzt `data-theme="dark"` initial.  
  `:root[data-theme="light"]` überschreibt dieselben Tokens mit hellen Werten, sobald der User aktiv auf Light umschaltet.
- **OLED-Support**  
  Pure-Black wird nur für Dark Themes erzwungen: `:root:not([data-theme="light"]) body[data-oled="true"] { … }`. Dadurch bleibt Light Mode unverändert, auch wenn OLED aktiviert ist.
- **Tailwind Bindung**  
  `tailwind.config.ts` referenziert identische Tokens via `rgb(var(--token) / <alpha-value>)`. Utilities wie `bg-surface/80` oder `border-border-accent/30` funktionieren damit automatisch für Dark, Light und OLED.
- **Deprecated Tokens**  
  `--space-*` bleiben dokumentiert, sind aber als *@deprecated* markiert (Tailwind Spacing ersetzt sie). Entfernen erst nach vollständiger Migration.

```css
:root {
  --color-brand: 15 179 76;
}

.btn-primary {
  background: linear-gradient(
    135deg,
    rgb(var(--color-brand)) 0%,
    rgb(var(--color-brand-hover)) 100%
  );
}
```

### 2.1 Farb-System (Colors)

#### **2.1.1 Primärfarben (Brand)**

```css
/* Hauptmarke */
--color-brand-primary: #0fb34c;        /* Emerald-500 - Hauptmarkenfarbe */
--color-brand-primary-hover: #059669;  /* Emerald-600 - Hover-States */
--color-brand-accent: #00ff66;         /* Neon Green - Highlights, Glows */

/* Verwendung */
Primäre CTAs (Save, Confirm, Create)
Focus States, Active Borders
Success Feedback
```

#### **2.1.2 Hintergrundfarben (Background)**

```css
/* Background Layers (dunkel → hell) */
--color-bg-root: #0a0a0a;              /* Zinc-950 - Wurzel-Hintergrund */
--color-bg-elevated: #0b0b13;          /* Leicht heller für Overlays */
--color-surface-default: #18181b;      /* Zinc-900 - Cards, Panels */
--color-surface-subtle: #131316;       /* Dunklere Variante für Kontrast */
--color-surface-elevated: #1c1c1e;     /* Zinc-850 - Hover States, Focus */
--color-surface-hover: #27272a;        /* Zinc-800 - Interactive Hover */
--color-surface-skeleton: rgba(255,255,255,0.05); /* Loading Placeholders */

/* Verwendung */
Root: --color-bg-root
Cards/Panels: --color-surface-default
Inputs: --color-surface-subtle
Hover: --color-surface-hover
Modals: --color-surface-elevated
```

#### **2.1.3 Textfarben (Text)**

```css
/* Text Hierarchie (hell → dunkel) */
--color-text-primary: #f4f4f5;         /* Zinc-100 - Headings, Labels */
--color-text-secondary: #a1a1aa;       /* Zinc-400 - Body Text, Metadata */
--color-text-tertiary: #71717a;        /* Zinc-500 - Helper Text, Disabled */

/* Verwendung */
Headings (h1-h3): --color-text-primary
Body Text: --color-text-secondary
Labels, Helper: --color-text-tertiary
Disabled States: --color-text-tertiary + opacity-60
```

#### **2.1.4 Semantische Farben (Status)**

```css
/* Trading-spezifisch */
--color-bull: #10b981;                 /* Emerald-500 - Bullish/Long/Aufwärts */
--color-bear: #f43f5e;                 /* Rose-500 - Bearish/Short/Abwärts */

/* System Feedback */
--color-success: #10b981;              /* Emerald-500 - Erfolg */
--color-danger: #f43f5e;               /* Rose-500 - Fehler, Destruktiv */
--color-warning: #f59e0b;              /* Amber-500 - Warnung, Vorsicht */
--color-info: #06b6d4;                 /* Cyan-500 - Info, Neutral */

/* Sentiment Backgrounds (mit Alpha) */
--color-bull-bg: rgba(16, 185, 129, 0.1);
--color-bull-border: rgba(16, 185, 129, 0.6);

--color-bear-bg: rgba(244, 63, 94, 0.1);
--color-bear-border: rgba(251, 113, 133, 0.6);

--color-neutral-bg: rgba(245, 158, 11, 0.1);
--color-neutral-border: rgba(251, 191, 36, 0.6);

/* Verwendung */
Bullish Indicators: --color-bull (grün)
Bearish Indicators: --color-bear (rot)
Success Messages: --color-success
Error Messages: --color-danger
Warnings: --color-warning
Info Badges: --color-info
```

#### **2.1.5 Borderfarben (Borders)**

```css
/* Border Hierarchie (subtil → stark) */
--color-border-subtle: rgba(255, 255, 255, 0.05);   /* Kaum sichtbar */
--color-border-moderate: rgba(255, 255, 255, 0.1);  /* Subtil */
--color-border-default: #27272a;                    /* Zinc-800 - Standard */
--color-border-hover: rgba(255, 255, 255, 0.15);    /* Interactive */
--color-border-accent: #0fb34c;                     /* Brand - Focus */
--color-border-focus: #10b981;                      /* Focus Rings */

/* Verwendung */
Cards (default): --color-border-subtle
Input (default): --color-border-moderate
Input (focus): --color-border-accent + Ring
Dividers: --color-border-default
```

#### **2.1.6 Schatten (Shadows)**

```css
/* Card Shadows */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
--shadow-md: 0 4px 8px rgba(0,0,0,0.16), 0 2px 4px rgba(0,0,0,0.08);
--shadow-lg: 0 10px 20px rgba(0,0,0,0.20), 0 4px 8px rgba(0,0,0,0.12);
--shadow-xl: 0 20px 25px rgba(0,0,0,0.25);

/* Glow Effects (Cyberpunk-Akzente) */
--glow-accent: 0 0 10px rgba(0, 255, 102, 0.22);
--glow-brand: 0 0 12px rgba(15, 179, 76, 0.18);
--glow-cyan: 0 0 8px rgba(0, 229, 255, 0.2);
--glow-emerald: 0 0 30px rgba(16, 185, 129, 0.3);
--glow-emerald-lg: 0 0 50px rgba(16, 185, 129, 0.5);

/* Verwendung */
Cards: --shadow-sm
Modals: --shadow-lg
Focus States: --glow-accent
Hover (interactive): --glow-brand
```

### 2.2 Typografie (Typography)

#### **2.2.1 Schriftfamilien (Font Families)**

```css
/* Sans-Serif (UI, Headings, Body) */
--font-sans: system-ui, -apple-system, 'Segoe UI', sans-serif;

/* Monospace (Preise, Zahlen, Code) */
--font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', monospace;

/* Display (Große Headings, Marketing) */
--font-display: system-ui, -apple-system, 'Segoe UI', sans-serif;
```

#### **2.2.2 Font Scale (Größen + Zeilenhöhe)**

| Token | Größe | Zeilenhöhe | Verwendung |
|-------|-------|------------|------------|
| `text-xs` | 12px (0.75rem) | 1.33 (16px) | Badges, Labels, Metadata |
| `text-sm` | 14px (0.875rem) | 1.43 (20px) | Body Text, Tabellenzellen |
| `text-base` | 16px (1rem) | 1.5 (24px) | Standard Body, Buttons |
| `text-lg` | 18px (1.125rem) | 1.56 (28px) | Card Titles, Subheadings |
| `text-xl` | 20px (1.25rem) | 1.4 (28px) | Section Headings |
| `text-2xl` | 24px (1.5rem) | 1.33 (32px) | Page Titles |
| `text-3xl` | 30px (1.875rem) | 1.25 (37.5px) | Große KPI-Werte |
| `text-4xl` | 36px (2.25rem) | 1.2 (43px) | Hero Headings |

#### **2.2.3 Font Weights**

```css
--weight-regular: 400;      /* Body Text */
--weight-medium: 500;       /* Emphasized Text, Labels */
--weight-semibold: 600;     /* Headings, Buttons */
--weight-bold: 700;         /* Selten (nur extreme Betonung) */
```

#### **2.2.4 Heading-Hierarchie**

```css
/* h1 - Page Titles */
font-size: text-3xl (30px) / md:text-4xl (36px)
font-weight: semibold (600)
line-height: 1.2
color: text-primary
letter-spacing: -0.025em (tight)

/* h2 - Section Headings */
font-size: text-2xl (24px)
font-weight: semibold (600)
line-height: 1.33
color: text-primary

/* h3 - Card Titles */
font-size: text-lg (18px)
font-weight: semibold (600)
line-height: 1.56
color: text-primary

/* h4 - Subsection Headings */
font-size: text-base (16px)
font-weight: medium (500)
line-height: 1.5
color: text-primary
```

#### **2.2.5 Body Text**

```css
/* Standard Body */
font-size: text-sm (14px) / md:text-base (16px)
font-weight: regular (400)
line-height: 1.5
color: text-secondary

/* Small Text (Labels, Metadata) */
font-size: text-xs (12px)
font-weight: medium (500)
line-height: 1.33
color: text-tertiary
text-transform: uppercase
letter-spacing: 0.3em (tracking-[0.3em])
```

#### **2.2.6 Monospace Numbers (Preise, Zahlen)**

```css
font-family: font-mono
font-variant-numeric: tabular-nums
font-size: text-base (16px) / text-lg (18px)
color: text-primary

/* Beispiel */
<span class="font-mono tabular-nums text-text-primary">
  $42,857.32
</span>
```

### 2.3 Spacing (Abstände)

#### **2.3.1 Spacing Scale (8px Grid)**

```css
/* Base: 8px Inkremente für Konsistenz */
--space-1: 0.25rem;   /* 4px - Feinste Abstände */
--space-2: 0.5rem;    /* 8px - Kleine Gaps */
--space-3: 0.75rem;   /* 12px - Button Padding (vertikal) */
--space-4: 1rem;      /* 16px - Standard Gap, Card Padding */
--space-5: 1.25rem;   /* 20px - Button Padding (horizontal) */
--space-6: 1.5rem;    /* 24px - Section Gaps */
--space-8: 2rem;      /* 32px - Große Gaps */
--space-10: 2.5rem;   /* 40px - Page Padding */
--space-12: 3rem;     /* 48px - Section Separators */
--space-16: 4rem;     /* 64px - Hero Spacing */
--space-20: 5rem;     /* 80px - Extra Large */
--space-24: 6rem;     /* 96px - Maximum */
```

#### **2.3.2 Verwendungs-Guidelines**

```
Inline-Element-Gaps (Buttons, Badges):  space-2 (8px)
Card Padding:                           space-4 (16px) / space-6 (24px)
Section Gaps:                           space-6 (24px)
Page Padding:                           space-4 (16px) / lg:space-8 (32px)
Header Height:                          space-16 (64px) / space-20 (80px)
```

### 2.4 Border Radius

```css
--radius-sm: 6px;      /* Small Elements (Badges, Tags) */
--radius-md: 8px;      /* Buttons, Inputs */
--radius-lg: 12px;     /* Cards, Panels */
--radius-xl: 16px;     /* Large Cards, Modals */
--radius-2xl: 20px;    /* Hero Cards */
--radius-3xl: 24px;    /* Feature Sections */
--radius-full: 9999px; /* Pills, Circular Avatars */
```

**Verwendung:**
- Badges: `radius-sm` (6px)
- Buttons/Inputs: `radius-md` (8px) oder `radius-xl` (16px) für moderne Look
- Cards: `radius-lg` (12px) oder `radius-2xl` (20px) für Trading-App-Feel
- Pills (Filter-Buttons): `radius-full` (9999px)

### 2.5 Grundlegende UI-Komponenten

#### **2.5.1 Button**

**Varianten:**
- **Primary:** Brand Gradient, für Haupt-CTAs
- **Secondary:** Subtiler Hintergrund, Border, für sekundäre Aktionen
- **Ghost:** Transparent, für tertiäre Aktionen
- **Outline:** Nur Border, für Cancel/Back

**Größen:**
- **sm:** 36px Höhe (h-9), 12px Text, px-3 py-1.5
- **md:** 44px Höhe (h-11), 14px Text, px-4 py-2.5 (default)
- **lg:** 48px Höhe (h-12), 16px Text, px-5 py-3

**States:**

| State | Visual | Interaction |
|-------|--------|-------------|
| **Default** | Solid, border-radius-md, shadow-sm | - |
| **Hover** | Brightness +10%, glow-brand | cursor-pointer |
| **Active** | scale(0.98), slight press | transition-transform 75ms |
| **Focus** | ring-2 ring-brand, glow-accent | outline-none |
| **Loading** | Spinner icon links, Text "Saving..." | disabled, cursor-wait |
| **Disabled** | opacity-60, cursor-not-allowed | pointer-events-none |

**Beispiel (Tailwind):**

```tsx
// Primary Button
<button className="
  h-11 px-4 py-2.5 
  bg-brand text-white 
  rounded-xl font-medium 
  shadow-glow-accent 
  hover:bg-brand-hover hover:brightness-110
  active:scale-98
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand
  disabled:opacity-60 disabled:cursor-not-allowed
  transition-all duration-150
">
  Save Entry
</button>

// Secondary Button
<button className="
  h-11 px-4 py-2.5
  bg-surface-subtle text-text-primary
  border border-border-moderate
  rounded-xl font-medium
  hover:bg-surface-hover hover:border-brand
  transition-all duration-150
">
  Cancel
</button>
```

#### **2.5.2 Input (Text Input)**

**Features:**
- Label (optional)
- Error Message (roter Border, Error Text)
- Helper Text (grau, subtil)
- Left/Right Icons
- Mono Variant (für Zahlen, Preise)

**States:**

| State | Visual | Interaction |
|-------|--------|-------------|
| **Default** | bg-surface-subtle, border-moderate | - |
| **Focus** | border-brand, ring-2 ring-brand, glow-accent | outline-none |
| **Error** | border-danger, error text below | aria-invalid="true" |
| **Disabled** | opacity-50, cursor-not-allowed | pointer-events-none |
| **Filled** | text-primary, bg stays same | - |

**Beispiel (Tailwind):**

```tsx
<div className="w-full">
  {/* Label */}
  <label className="mb-2 block text-sm font-medium text-text-secondary">
    Token Address
  </label>
  
  {/* Input */}
  <input
    type="text"
    placeholder="Enter Solana address..."
    className="
      h-12 w-full px-4 
      bg-surface-subtle 
      border border-border-moderate
      rounded-xl 
      text-sm text-text-primary 
      placeholder:text-text-tertiary
      focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/40
      transition-all duration-150
    "
  />
  
  {/* Helper Text */}
  <p className="mt-1 text-xs text-text-tertiary">
    Required for price data
  </p>
  
  {/* Error (wenn vorhanden) */}
  <p className="mt-1 flex items-center gap-1 text-xs text-danger" role="alert">
    <span className="h-1.5 w-1.5 rounded-full bg-danger" />
    Invalid address format
  </p>
</div>
```

#### **2.5.3 Card**

**Varianten:**
- **default:** Standard Card (bg-surface, border-subtle)
- **muted:** Dunklerer Hintergrund (bg-surface-subtle)
- **interactive:** Hover-Effekte (border-accent, shadow-glow)

**States:**

| State | Visual | Interaction |
|-------|--------|-------------|
| **Default** | bg-surface, border-subtle, shadow-sm | - |
| **Hover** (interactive) | border-brand/30, glow-brand, translateY(-2px) | cursor-pointer |
| **Focus** (interactive) | ring-2 ring-brand | outline-none |
| **Active** (interactive) | scale(0.99) | transition 75ms |

**Struktur:**

```tsx
<div className="
  rounded-2xl 
  border border-border-subtle 
  bg-surface 
  p-6 
  shadow-card-subtle
  hover:border-brand/30 hover:shadow-glow-brand hover:-translate-y-0.5
  transition-all duration-220
">
  {/* CardHeader */}
  <div className="mb-4 flex flex-col gap-1">
    <h3 className="text-lg font-semibold text-text-primary">
      SOL Daily Bias
    </h3>
    <p className="text-sm text-text-secondary">
      High confidence · 4H timeframe
    </p>
  </div>
  
  {/* CardContent */}
  <div className="flex flex-col gap-3 text-sm text-text-secondary">
    <p>Market structure shows higher lows...</p>
  </div>
  
  {/* CardFooter */}
  <div className="mt-6 flex items-center justify-between gap-3">
    <button className="...">View Details</button>
  </div>
</div>
```

#### **2.5.4 Badge**

**Varianten:**
- **default:** Grauer Hintergrund
- **success:** Grüner Hintergrund (bullish)
- **danger:** Roter Hintergrund (bearish)
- **warning:** Gelber Hintergrund (caution)
- **outline:** Nur Border, transparent

**Beispiel:**

```tsx
// Success Badge (Bullish)
<span className="
  inline-flex items-center gap-1 
  rounded-full 
  border border-sentiment-bull-border 
  bg-sentiment-bull-bg 
  px-2.5 py-0.5 
  text-[11px] font-semibold uppercase tracking-wide 
  text-sentiment-bull
">
  Long
</span>

// Danger Badge (Bearish)
<span className="
  inline-flex items-center gap-1 
  rounded-full 
  border border-sentiment-bear-border 
  bg-sentiment-bear-bg 
  px-2.5 py-0.5 
  text-[11px] font-semibold uppercase tracking-wide 
  text-sentiment-bear
">
  Short
</span>
```

#### **2.5.5 Select (Dropdown)**

**Features:**
- Custom Dropdown (nicht native select)
- Keyboard Navigation (Arrow Keys, Enter, Escape)
- Checkmark für ausgewählte Option
- Max-Height Scroll für viele Optionen

**States:**

| State | Visual | Interaction |
|-------|--------|-------------|
| **Closed** | border-border-default, chevron-down icon | - |
| **Open** | border-brand, ring-1 ring-brand/50, chevron-up | aria-expanded="true" |
| **Hover (Option)** | bg-surface-hover | cursor-pointer |
| **Selected (Option)** | bg-brand/10, text-brand, checkmark icon | aria-selected="true" |

#### **2.5.6 Modal (Dialog)**

**Features:**
- Focus Trap (Tab cycles innerhalb Modal)
- Escape Key schließt Modal
- Backdrop Click schließt (optional)
- ARIA Attributes (role="dialog", aria-modal)

**Struktur:**

```
┌─────────────────────────────────────────┐
│ Backdrop (bg-black/50, backdrop-blur)   │
│   ┌─────────────────────────────────┐   │
│   │ Modal Container                 │   │
│   │ (bg-surface, rounded-2xl)       │   │
│   │                                 │   │
│   │ ┌─────────────────────────────┐ │   │
│   │ │ Header (border-bottom)      │ │   │
│   │ │ Title + Close Button        │ │   │
│   │ ├─────────────────────────────┤ │   │
│   │ │ Content (scrollable)        │ │   │
│   │ │ Form fields, etc.           │ │   │
│   │ ├─────────────────────────────┤ │   │
│   │ │ Footer (border-top)         │ │   │
│   │ │ Cancel + Confirm Buttons    │ │   │
│   │ └─────────────────────────────┘ │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

#### **2.5.7 Navigation**

**Desktop (AppHeader):**
- Position: sticky top-0
- Height: 64px (space-16)
- Background: bg-surface-elevated/80, backdrop-blur-xl
- Border: border-b border-border-subtle
- Layout: Flex (Logo links, Nav Items rechts)

**Mobile (BottomNav):**
- Position: fixed bottom-0
- Height: 56px (space-14)
- Background: bg-surface/95, backdrop-blur-sm
- Border: border-t border-border-default
- Layout: Grid 4 Columns (Icon + Label pro Item)

**States (Nav Items):**

| State | Visual | Interaction |
|-------|--------|-------------|
| **Default** | text-text-tertiary | hover:text-text-primary |
| **Active** | text-brand, border-t-2 border-brand (mobile) / bg-surface-hover (desktop) | - |
| **Hover** | text-text-primary, bg-surface-hover/50 | cursor-pointer |
| **Focus** | ring-2 ring-brand | outline-none |

#### **2.5.8 Tabelle (Table)**

**Struktur:**

```tsx
<div className="overflow-x-auto rounded-2xl border border-border bg-surface">
  <table className="w-full">
    {/* Header */}
    <thead className="border-b border-border bg-surface-subtle">
      <tr>
        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Symbol
        </th>
        <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
          Price
        </th>
        {/* ... */}
      </tr>
    </thead>
    
    {/* Body */}
    <tbody>
      <tr className="border-b border-border-subtle hover:bg-surface-hover transition-colors">
        <td className="px-4 py-3 text-sm font-medium text-text-primary">
          SOL
        </td>
        <td className="px-4 py-3 text-right font-mono tabular-nums text-text-primary">
          $43.52
        </td>
        {/* ... */}
      </tr>
      {/* ... weitere Rows */}
    </tbody>
  </table>
</div>
```

**States:**

| State | Visual | Interaction |
|-------|--------|-------------|
| **Row Default** | bg-transparent | - |
| **Row Hover** | bg-surface-hover | cursor-pointer (wenn clickable) |
| **Row Active** | bg-brand/10, border-l-2 border-brand | - |
| **Header** | bg-surface-subtle, text-tertiary uppercase | sticky top-0 (optional) |

---

## 3. Screen-/Layout-Struktur inkl. Wireframe-Beschreibungen

### 3.1 Globale Page-Template (DashboardShell)

**Alle App-Seiten nutzen das `DashboardShell` Wrapper:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER (sticky top-0, backdrop-blur)                  │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Brand Label "Sparkfined" (text-xs, uppercase)      │ │
│ │ Page Title (h1, text-3xl-4xl, font-semibold)       │ │
│ │ Description (text-sm, text-secondary)              │ │
│ │ Actions (Buttons, rechts-aligned)                  │ │
│ │ Tabs (optional, pill-style)                        │ │
│ └────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────┤
│ KPI STRIP (optional, border-bottom)                   │
│ ┌────────┬────────┬────────┬────────┬────────┐        │
│ │ KPI 1  │ KPI 2  │ KPI 3  │ KPI 4  │ ...    │        │
│ └────────┴────────┴────────┴────────┴────────┘        │
├────────────────────────────────────────────────────────┤
│ MAIN CONTENT (max-w-6xl container, px-4 py-10)        │
│                                                        │
│ [Page-spezifischer Content]                           │
│                                                        │
└────────────────────────────────────────────────────────┘
```

**Responsive:**
- **Desktop (lg+):** Header 80px Höhe, KPI Strip 2-4 Spalten, Content max-w-6xl
- **Tablet (md):** Header 64px, KPI Strip 2 Spalten, Content px-4
- **Mobile (sm-):** Header 56px, KPI Strip 1 Spalte, Content px-4

### 3.2 Screen 1: Landing Page (`/landing`)

**Ziel:** Marketing, Onboarding, Call-to-Action  
**Zugriff:** Öffentlich (kein Login erforderlich)  
**Layout:** Standalone (kein DashboardShell)

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER (transparent, sticky)                           │
│ Logo (links) | Navigation (Mitte) | CTA Button (rechts)│
├────────────────────────────────────────────────────────┤
│ HERO SECTION (full viewport height)                   │
│                                                        │
│   ┌──────────────────────────────────────────┐        │
│   │ Headline (text-5xl-7xl, gradient)        │        │
│   │ "From Chaos to Mastery"                  │        │
│   │                                           │        │
│   │ Subheadline (text-xl, text-secondary)    │        │
│   │ "Offline-First Trading Command Center"   │        │
│   │                                           │        │
│   │ CTA Buttons (Primary + Secondary)        │        │
│   │ [Get Started] [Watch Demo]               │        │
│   └──────────────────────────────────────────┘        │
│                                                        │
│   Background: Gradient + Noise Texture                │
├────────────────────────────────────────────────────────┤
│ FEATURES SECTION (3-column grid)                      │
│ ┌───────────┬───────────┬───────────┐                │
│ │ Feature 1 │ Feature 2 │ Feature 3 │                │
│ │ Icon      │ Icon      │ Icon      │                │
│ │ Title     │ Title     │ Title     │                │
│ │ Desc      │ Desc      │ Desc      │                │
│ └───────────┴───────────┴───────────┘                │
├────────────────────────────────────────────────────────┤
│ TESTIMONIALS / SOCIAL PROOF                           │
│ [User Quotes, Metrics, Trust Badges]                  │
├────────────────────────────────────────────────────────┤
│ CTA SECTION                                           │
│ "Ready to level up?" + [Start Journaling] Button      │
├────────────────────────────────────────────────────────┤
│ FOOTER (links, social, legal)                         │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- Hero: Large Headline, Gradient Background, CTA Buttons
- Feature Cards: Icon + Title + Description (Grid 3 Columns)
- Testimonial Cards: Quote + Author + Avatar
- Footer: Multi-column links, social icons

**Responsive:**
- **Desktop:** Hero full viewport, 3-column feature grid
- **Tablet:** 2-column feature grid
- **Mobile:** 1-column, stacked layout, Hero 70vh

### 3.3 Screen 2: Dashboard (`/dashboard-v2`)

**Ziel:** Überblick, Quick Actions, KPIs, Recent Activity  
**Zugriff:** Authentifiziert (nach Login)  
**Layout:** DashboardShell + KPI Strip + 2-Column Grid

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER                                                 │
│ Title: "Dashboard" | Actions: [Quick Actions Dropdown]│
├────────────────────────────────────────────────────────┤
│ KPI STRIP (Grid 4 Columns)                            │
│ ┌───────────┬───────────┬───────────┬───────────┐     │
│ │ Net P&L   │ Win Rate  │ Alerts    │ Streak    │     │
│ │ +12.4% ↑  │ 63% →     │ 5 armed   │ 9 days ↑  │     │
│ └───────────┴───────────┴───────────┴───────────┘     │
├────────────────────────────────────────────────────────┤
│ MAIN CONTENT (2-Column Grid)                          │
│                                                        │
│ ┌─────────────────────────┬────────────────────────┐  │
│ │ PRIMARY CARD            │ SECONDARY CARD         │  │
│ │ (1.4fr)                 │ (1fr)                  │  │
│ │                         │                        │  │
│ │ ┌─────────────────────┐ │ ┌──────────────────┐  │  │
│ │ │ Insight Teaser      │ │ │ Journal Snapshot │  │  │
│ │ │ (AI Daily Bias)     │ │ │                  │  │  │
│ │ │                     │ │ │ Entry 1 (Long)   │  │  │
│ │ │ Bias: Bullish       │ │ │ Entry 2 (Short)  │  │  │
│ │ │ Confidence: 78%     │ │ │ Entry 3 (Long)   │  │  │
│ │ │                     │ │ │                  │  │  │
│ │ │ Summary: Market...  │ │ │ [View All →]     │  │  │
│ │ └─────────────────────┘ │ └──────────────────┘  │  │
│ └─────────────────────────┴────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **KPITile** (4x): Label, Value, Trend Icon, Change %
- **InsightTeaser**: AI Bias Card (Bias, Confidence, Summary)
- **JournalSnapshot**: 3 Recent Entries (Direction Badge, Title, Date)
- **QuickActions**: Floating Action Button (FAB) oder Dropdown

**Responsive:**
- **Desktop (lg+):** 2-Column Grid (1.4fr + 1fr), KPI 4 Spalten
- **Tablet (md):** 2-Column Grid (1fr + 1fr), KPI 2 Spalten
- **Mobile (sm-):** Stacked (1 Column), KPI 2 Spalten

### 3.4 Screen 3: Journal (`/journal-v2`)

**Ziel:** Trading-Journal, Entries verwalten, AI-Kondensation  
**Zugriff:** Authentifiziert  
**Layout:** DashboardShell + List + Detail Panel (Two-Column)

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER                                                 │
│ Title: "Journal" | Actions: [New Entry +]             │
│ Description: "12 entries · Focus on clarity..."       │
├────────────────────────────────────────────────────────┤
│ JOURNEY BANNER (optional, wenn Journey Meta vorhanden)│
│ Level: Practitioner | Progress: 65% | Stats: 12 Wins  │
├────────────────────────────────────────────────────────┤
│ FILTERS (Pill-Buttons)                                │
│ [All (12)] [Long (7)] [Short (5)]                     │
├────────────────────────────────────────────────────────┤
│ TWO-COLUMN LAYOUT                                     │
│                                                        │
│ ┌──────────────────────┬───────────────────────────┐  │
│ │ ENTRY LIST (1.4fr)   │ DETAIL PANEL (1fr)        │  │
│ │ (Scrollable)         │                           │  │
│ │                      │ ┌───────────────────────┐ │  │
│ │ ┌──────────────────┐ │ │ Title: Scalped SOL... │ │  │
│ │ │ Entry 1          │ │ │ Direction: Long 🟢    │ │  │
│ │ │ Scalped SOL...   │ │ │ Date: 2025-02-16      │ │  │
│ │ │ Long 🟢 | Feb 16 │ │ │                       │ │  │
│ │ └──────────────────┘ │ │ ┌───────────────────┐ │ │  │
│ │                      │ │ │ Notes (Editable)  │ │  │
│ │ ┌──────────────────┐ │ │ │ Entry broke above │ │  │
│ │ │ Entry 2 (Active) │ │ │ │ $42 with volume...│ │  │
│ │ │ Fade BTC range   │ │ │ │                   │ │  │
│ │ │ Short 🔴 | Feb15 │ │ │ │ [AI Condense]     │ │  │
│ │ └──────────────────┘ │ │ └───────────────────┘ │ │  │
│ │                      │ │                       │ │  │
│ │ ┌──────────────────┐ │ │ Tags: [SOL] [Long]... │ │  │
│ │ │ Entry 3          │ │ │                       │ │  │
│ │ │ ETH trend follow │ │ │ Actions:              │ │  │
│ │ │ Long 🟢 | Feb 14 │ │ │ [Edit] [Delete] [...]│ │  │
│ │ └──────────────────┘ │ └───────────────────────┘ │  │
│ └──────────────────────┴───────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **JournalJourneyBanner**: Progress Tracker (Degen → Sensei)
- **Filter Buttons**: Pill-Style (All/Long/Short)
- **JournalList**: Scrollable Entry List (Title, Direction Badge, Date)
- **JournalDetailPanel**: Full Entry (Title, Notes Textarea, Tags, Actions)
- **JournalNewEntryDialog**: Modal (Title Input, Notes Textarea, Create Button)

**Responsive:**
- **Desktop (lg+):** 2-Column (List 1.4fr, Detail 1fr)
- **Tablet/Mobile:** Stacked, Detail Panel wird Drawer (Full-Screen Overlay)

**States:**
- **Loading:** Skeleton für List Items (3x)
- **Empty:** EmptyState "No Journal Entries" + CTA "Create First Entry"
- **Error:** ErrorBanner "Unable to load entries"

### 3.5 Screen 4: Watchlist (`/watchlist-v2`)

**Ziel:** Asset-Tracking, Live Prices, Quick Chart Access  
**Zugriff:** Authentifiziert  
**Layout:** DashboardShell + Table + Detail Panel

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER                                                 │
│ Title: "Watchlist" | Actions: [Live 🟢] [Sort ↕]      │
│ Description: "8 assets watched · Scan risk..."        │
├────────────────────────────────────────────────────────┤
│ SESSION FILTERS (Pill-Buttons)                        │
│ [All] [London] [NY] [Asia]                            │
├────────────────────────────────────────────────────────┤
│ TWO-COLUMN LAYOUT                                     │
│                                                        │
│ ┌──────────────────────┬───────────────────────────┐  │
│ │ ASSET TABLE (1.4fr)  │ DETAIL PANEL (1fr)        │  │
│ │                      │                           │  │
│ │ Symbol │ Price │ 24h  │ ┌───────────────────────┐ │  │
│ │ ───────┼───────┼──── │ │ Asset: SOL            │ │  │
│ │ SOL    │$43.52 │+3.2%│ │ Price: $43.52         │ │  │
│ │ BTC    │$67.2k │-1.5%│ │ Change: +3.2% 🟢      │ │  │
│ │ ETH    │$3.4k  │+2.1%│ │                       │ │  │
│ │ ...    │ ...   │ ... │ │ ┌───────────────────┐ │ │  │
│ │                      │ │ │ Chart Preview     │ │  │
│ │ (Sortable, clickable)│ │ │ (Mini Candlestick)│ │  │
│ │                      │ │ │                   │ │  │
│ │ Hover: bg-surface-   │ │ └───────────────────┘ │ │  │
│ │        hover         │ │                       │ │  │
│ │ Active: border-l-2   │ │ KPIs: Vol, MCap...    │ │  │
│ │         border-brand │ │                       │ │  │
│ │                      │ │ Actions:              │ │  │
│ │                      │ │ [Open Chart] [Replay] │ │  │
│ └──────────────────────┴───────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **LiveStatusBadge**: Real-Time Connection Indicator
- **Session Filters**: Pill-Buttons (All/London/NY/Asia)
- **WatchlistTable**: Sortable Table (Symbol, Price, 24h Change, Volume)
- **WatchlistDetailPanel**: Asset Details (Chart Preview, KPIs, Actions)

**Responsive:**
- **Desktop:** 2-Column (Table 1.4fr, Detail 1fr)
- **Mobile:** Stacked, Detail Panel wird Drawer

**Table States:**
- **Row Hover:** bg-surface-hover
- **Row Active:** bg-brand/10, border-l-2 border-brand
- **Header:** sticky top-0

### 3.6 Screen 5: Alerts (`/alerts-v2`)

**Ziel:** Alert-Management, Rule Builder, History  
**Zugriff:** Authentifiziert  
**Layout:** DashboardShell + List + Detail Panel

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER                                                 │
│ Title: "Alerts" | Actions: [New Alert +]              │
│ Description: "5 alerts tracked · Stay ahead..."       │
├────────────────────────────────────────────────────────┤
│ FILTERS (Pill-Buttons)                                │
│ Status: [All] [Armed 🟡] [Triggered 🟢] [Snoozed 🔵]  │
│ Type: [All] [Price] [Volume] [Volatility] [Trend]     │
├────────────────────────────────────────────────────────┤
│ TWO-COLUMN LAYOUT                                     │
│                                                        │
│ ┌──────────────────────┬───────────────────────────┐  │
│ │ ALERT LIST (1.4fr)   │ DETAIL PANEL (1fr)        │  │
│ │                      │                           │  │
│ │ ┌──────────────────┐ │ ┌───────────────────────┐ │  │
│ │ │ Alert 1          │ │ │ Alert: SOL > $45      │ │  │
│ │ │ SOL > $45        │ │ │ Status: Armed 🟡      │ │  │
│ │ │ Armed 🟡         │ │ │ Type: Price           │ │  │
│ │ │ Price Alert      │ │ │                       │ │  │
│ │ └──────────────────┘ │ │ Condition:            │ │  │
│ │                      │ │ Price > $45.00        │ │  │
│ │ ┌──────────────────┐ │ │ AND Volume > 10M      │ │  │
│ │ │ Alert 2 (Active) │ │ │                       │ │  │
│ │ │ BTC < $65k       │ │ │ ┌───────────────────┐ │ │  │
│ │ │ Triggered 🟢     │ │ │ │ History Chart     │ │  │
│ │ │ Price Alert      │ │ │ │ (Triggers/Time)   │ │  │
│ │ └──────────────────┘ │ │ └───────────────────┘ │ │  │
│ │                      │ │                       │ │  │
│ │ ┌──────────────────┐ │ │ Actions:              │ │  │
│ │ │ Alert 3          │ │ │ [Edit] [Snooze] [...]│ │  │
│ │ │ ETH vol spike    │ │ └───────────────────────┘ │  │
│ │ │ Armed 🟡         │ │                           │  │
│ │ └──────────────────┘ │                           │  │
│ └──────────────────────┴───────────────────────────┘  │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **Status Filter**: Pill-Buttons (All/Armed/Triggered/Snoozed)
- **Type Filter**: Pill-Buttons (All/Price/Volume/Volatility/Trend)
- **AlertsList**: List Items mit Status Badge
- **AlertsDetailPanel**: Condition Breakdown, History Chart, Actions
- **RuleEditor** (Modal): Visual Rule Builder (AND/OR Logic)

**Responsive:**
- **Desktop:** 2-Column
- **Mobile:** Stacked, Detail Panel wird Drawer

**Status Badges:**
- **Armed:** bg-amber-500/10, text-amber-300, border-amber-500/60
- **Triggered:** bg-emerald-500/10, text-emerald-300, border-emerald-500/60
- **Snoozed:** bg-cyan-500/10, text-cyan-300, border-cyan-500/60

### 3.7 Screen 6: Analysis (`/analysis-v2`)

**Ziel:** AI-Powered Market Analysis, Insights, Playbooks  
**Zugriff:** Authentifiziert  
**Layout:** DashboardShell + Tabs + Insight Cards

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER                                                 │
│ Title: "Analysis" | Actions: [Refresh] [Export]       │
│ Description: "AI-backed market views, flows..."       │
│ Tabs: [Overview] [Flow] [Playbook]                    │
├────────────────────────────────────────────────────────┤
│ MAIN CONTENT (Tab: Overview)                          │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ AI INSIGHT HEADER                                  │ │
│ │ Current AI Insight (text-xs, uppercase)            │ │
│ │                                                    │ │
│ │ Headline (text-2xl, semibold):                     │ │
│ │ "Bias remains bullish while liquidity builds."     │ │
│ │                                                    │ │
│ │ Summary (text-sm, secondary):                      │ │
│ │ "Market structure shows higher lows..."            │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌──────┬──────┬──────┬──────┬──────┐                  │
│ │ Bias │ Conf │ Time │ Price│ 24h  │ (Stats Grid)     │
│ │ Long │ 78%  │ 4H   │ $43  │ +3%  │                  │
│ └──────┴──────┴──────┴──────┴──────┘                  │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ SOCIAL TREND CARD (border-emerald/30, bg-emerald/5)│ │
│ │ "SOL showing strength..." | Hype: High             │ │
│ │ Score: 8.5 | Relevance: 85% | CTA: Buy Dip         │ │
│ │ [View tweet ↗]                                      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ ADVANCED INSIGHT CARD (large)                      │ │
│ │                                                    │ │
│ │ Sections:                                          │ │
│ │ - Liquidity Zones (chart)                          │ │
│ │ - Entry/Exit Levels                                │ │
│ │ - Risk Management                                  │ │
│ │ - Confluence Indicators                            │ │
│ │                                                    │ │
│ │ [Expandable Sections, AI-Generated Content]        │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **Tab Switcher**: Pill-Style (Overview/Flow/Playbook)
- **AI Insight Header**: Headline + Summary + Stats Grid
- **Social Trend Card**: Tweet Snippet, Sentiment Badge, Hype Level
- **AdvancedInsightCard**: Multi-Section AI Analysis (Expandable)

**Responsive:**
- **Desktop:** Stats Grid 5 Spalten, Full-Width Cards
- **Mobile:** Stats Grid 2 Spalten, Stacked Cards

**States:**
- **Loading:** Skeleton für Stats Grid + Insight Card
- **Error:** ErrorBanner "Market snapshot unavailable"
- **Tab Change:** Smooth fade-in animation

### 3.8 Screen 7: Chart (`/chart-v2`)

**Ziel:** Full-Featured Trading Chart, Indicators, Replay  
**Zugriff:** Authentifiziert  
**Layout:** Full-Screen Canvas (kein DashboardShell)

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ CHART HEADER (minimal, semi-transparent)              │
│ Symbol: SOL/USDT | Timeframe: [1h ▼] | [Indicators ▼]│
│ [Back ←] | [Save Snapshot] | [Replay Mode]           │
├────────────────────────────────────────────────────────┤
│                                                        │
│                                                        │
│                                                        │
│         CHART CANVAS (Full-Width, 80vh)               │
│         (Lightweight Charts / TradingView)            │
│                                                        │
│         - OHLC Candlesticks                           │
│         - Volume Bars                                 │
│         - Indicators (RSI, MACD, Bollinger...)        │
│         - Crosshair, Tooltip                          │
│                                                        │
│                                                        │
│                                                        │
├────────────────────────────────────────────────────────┤
│ BOTTOM TOOLBAR (overlay, semi-transparent)            │
│ [Zoom -/+] [Pan] [Indicators] [Drawing Tools] [...]  │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **ChartCanvas**: Lightweight Charts Component (Canvas-Rendered)
- **ChartHeader**: Symbol, Timeframe Selector, Actions
- **IndicatorPanel**: Sidebar (Show/Hide Indicators)
- **DrawingTools**: Trendlines, Fibonacci, Shapes

**Responsive:**
- **Desktop:** Full-Screen, Toolbar Bottom
- **Mobile:** Full-Screen, Toolbar Fixed Bottom, Touch Gestures (Zoom/Pan)

**Keyboard Shortcuts:**
- **Arrow Keys:** Pan Chart
- **+/-:** Zoom In/Out
- **Escape:** Exit Fullscreen / Cancel Drawing

### 3.9 Screen 8: Settings (`/settings-v2`)

**Ziel:** User Preferences, API Keys, Notifications  
**Zugriff:** Authentifiziert  
**Layout:** DashboardShell + Form Layout

**Wireframe:**

```
┌────────────────────────────────────────────────────────┐
│ HEADER                                                 │
│ Title: "Settings" | Actions: [Save Changes]           │
├────────────────────────────────────────────────────────┤
│ MAIN CONTENT (max-w-3xl, centered)                    │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ SECTION: Account                                   │ │
│ │                                                    │ │
│ │ [Input] Display Name                               │ │
│ │ [Input] Email (disabled, read-only)                │ │
│ │ [Button] Change Password                           │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ SECTION: Preferences                               │ │
│ │                                                    │ │
│ │ [Select] Default Timeframe (1h, 4h, 1d...)         │ │
│ │ [Toggle] Enable Notifications                      │ │
│ │ [Toggle] OLED Mode (Pure Black BG)                 │ │
│ │ [Select] Preferred AI Provider (OpenAI, Grok)      │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ SECTION: API Keys (Masked)                         │ │
│ │                                                    │ │
│ │ [Input] Moralis API Key (••••••••)                 │ │
│ │ [Input] OpenAI API Key (••••••••)                  │ │
│ │ [Button] Reveal | [Button] Regenerate              │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ ┌────────────────────────────────────────────────────┐ │
│ │ SECTION: Danger Zone (border-red-500/40)           │ │
│ │                                                    │ │
│ │ [Button Secondary] Export All Data                 │ │
│ │ [Button Danger] Delete Account                     │ │
│ └────────────────────────────────────────────────────┘ │
│                                                        │
│ [Save Changes] (sticky bottom)                        │
└────────────────────────────────────────────────────────┘
```

**Komponenten:**
- **Form Sections**: Card-Style Sections (Account, Preferences, API Keys, Danger Zone)
- **Input Fields**: Label + Input + Helper Text
- **Toggle Switches**: Custom Toggle (On/Off)
- **Danger Zone**: Red Border, Warning Text

**Responsive:**
- **Desktop:** max-w-3xl centered, Sections stacked
- **Mobile:** Full-Width, Sections stacked

**States:**
- **Unsaved Changes:** "Save Changes" Button enabled, sticky
- **Saving:** Button Loading State "Saving..."
- **Saved:** Success Toast "Settings saved"

### 3.10 Responsive Breakpoints & Verhalten

#### **Breakpoint-System (Tailwind)**

```css
/* Mobile First Approach */
sm: 640px   /* Small tablets, large phones (portrait) */
md: 768px   /* Tablets (portrait) */
lg: 1024px  /* Tablets (landscape), small laptops */
xl: 1280px  /* Laptops, desktops */
2xl: 1536px /* Large desktops */
```

#### **Layout-Adaptionen**

**Desktop (lg+):**
- 2-Column Layouts (List + Detail, 1.4fr + 1fr)
- 4-Column KPI Grids
- Top Navigation (AppHeader, 5 Items)
- Hover States aktiviert
- Sidebar (future, aktuell nur Top Nav)

**Tablet (md-lg):**
- 2-Column KPI Grids
- Stacked Layouts für List + Detail (optional)
- Touch-Friendly (min 44px Touch Targets)
- Reduced Margins (px-4 statt px-6)

**Mobile (sm-):**
- 1-Column Layouts (Full-Width Cards)
- Bottom Navigation (Fixed Bottom, 4 Tabs)
- Drawer für Detail Panels (Full-Screen Overlay)
- Increased Touch Targets (min 48px)
- Reduced Font Sizes (text-sm default)

#### **Navigation-Adaptionen**

| Device | Navigation Type | Position | Items | Behavior |
|--------|----------------|----------|-------|----------|
| Desktop (lg+) | AppHeader | Top (sticky) | 5 Tabs | Horizontal Pills |
| Tablet (md) | AppHeader | Top (sticky) | 5 Tabs | Horizontal Pills |
| Mobile (sm-) | BottomNav | Bottom (fixed) | 4 Tabs | Grid 4 Columns |

**Mobile Bottom Nav Items:**
- Board (Home Icon)
- Analyze (BarChart Icon)
- Journal (FileText Icon)
- Settings (Settings Icon)

#### **Grid-Responsiveness (Beispiel KPI Strip)**

```tsx
<div className="
  grid grid-cols-2        /* Mobile: 2 Spalten */
  gap-3                   /* Mobile: 12px Gap */
  md:grid-cols-4          /* Tablet+: 4 Spalten */
  md:gap-4                /* Tablet+: 16px Gap */
  lg:gap-6                /* Desktop: 24px Gap */
">
  {kpis.map(kpi => <KPITile key={kpi.id} {...kpi} />)}
</div>
```

#### **Two-Column → Stacked (Journal, Watchlist, Alerts)**

```tsx
<div className="
  flex flex-col           /* Mobile: Stacked */
  gap-4
  lg:grid                 /* Desktop: Grid */
  lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]
  lg:gap-6
">
  <div>{/* List */}</div>
  <div>{/* Detail */}</div>
</div>
```

#### **Conditional Rendering (Desktop vs Mobile Nav)**

```tsx
{/* Desktop: Top Nav */}
<div className="hidden lg:block">
  <AppHeader />
</div>

{/* Mobile: Bottom Nav */}
<div className="block lg:hidden">
  <BottomNav />
</div>
```

---

## Zusammenfassung

### **Design-Token-Highlights:**

✅ **Farben:** 5 Kategorien (Brand, Background, Text, Semantic, Border) mit 30+ Tokens  
✅ **Typografie:** 3 Font Families, 8 Größen, 4 Weights, definierte Heading-Hierarchie  
✅ **Spacing:** 8px Grid mit 12 Stufen (4px - 96px)  
✅ **Komponenten:** 8 UI Primitives mit vollständigen State-Definitionen  
✅ **Shadows/Radius:** 4 Shadow-Level + 4 Glow-Effekte, 7 Radius-Stufen  

### **Screen-Struktur-Highlights:**

✅ **8 Hauptscreens:** Landing, Dashboard, Journal, Watchlist, Alerts, Analysis, Chart, Settings  
✅ **Konsistentes Layout:** DashboardShell-Template für alle App-Seiten  
✅ **Responsive:** 3 Breakpoints (Mobile, Tablet, Desktop) mit klaren Adaptionen  
✅ **Navigation:** Top Nav (Desktop) + Bottom Nav (Mobile)  
✅ **Pattern:** Two-Column Layouts (List + Detail) für Daten-intensive Screens  

### **Nächste Schritte:**

1. **Design-System implementieren** (UI Primitives in Storybook)
2. **Responsive-Tests** (3 Geräte-Klassen: iPhone 12, iPad Pro, MacBook)
3. **Accessibility-Audit** (WCAG 2.1 AA Compliance, Keyboard Nav)
4. **Performance-Optimierung** (Lazy Loading, Code Splitting)
5. **A/B-Tests** (Information Density vs. Whitespace, KPI-Anordnung)

---

**Erstellt von:** Sparkfined Analysis Agent  
**Datum:** 2025-11-29  
**Quellen:** Code-Analyse (src/), README.md, docs/, tailwind.config.ts  
**Vollständige Style Guide:** `docs/UI_STYLE_GUIDE.md`

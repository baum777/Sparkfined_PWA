# 🎨 Sparkfined PWA – Style Sprint Plan

**Version:** 1.0  
**Erstellt:** 2025-11-25  
**Autor:** Claude (UI/UX & Design-System Architect)  
**Ziel:** Vollständige Style-Spezifikation für Codex-Implementierung

---

## Inhaltsverzeichnis

- [Phase 0 – Design-Grundlagen](#phase-0--design-grundlagen)
- [Phase 1 – Globale UI-Primitives](#phase-1--globale-ui-primitives)
- [Phase 2 – Journal 2.0 Styling](#phase-2--journal-20-styling)
- [Phase 3 – Settings 2.0 Styling](#phase-3--settings-20-styling)
- [Phase 4 – Alerts 2.0 Styling](#phase-4--alerts-20-styling)
- [Phase 5 – States, Feedback & Feel](#phase-5--states-feedback--feel)
- [Phase 6 – Dark Mode & Token-Sauberkeit](#phase-6--dark-mode--token-sauberkeit)
- [Zusammenfassung für Codex](#zusammenfassung-für-codex)

---

## Phase 0 – Design-Grundlagen

### 0.1 Design-Philosophie

**Entscheidung:** Full-Width Trading-App-Stil (wie Binance/TradingView), KEINE zentrierte max-width.

**Rationale:** 
- Trading-Apps maximieren Screen Real Estate für Daten-Density
- Trader nutzen oft Ultra-Wide-Monitore
- Split-Layouts (List/Detail) funktionieren besser ohne künstliche Einschränkung
- PWA-Feeling: App, nicht Website

### 0.2 Page-Layout-Grundregeln

| Property | Desktop (≥1024px) | Tablet (768-1023px) | Mobile (<768px) |
|----------|-------------------|---------------------|-----------------|
| **Page Padding** | `px-6` (24px) | `px-4` (16px) | `px-4` (16px) |
| **Section Gap** | `gap-6` (24px) | `gap-4` (16px) | `gap-4` (16px) |
| **Content Width** | 100% (full-width) | 100% | 100% |
| **Max Container** | keine | keine | keine |

**DashboardShell Spacing:**

```
┌─────────────────────────────────────────────────────────┐
│ Header (h-14, px-6)                                     │
├─────────────────────────────────────────────────────────┤
│ ← px-6 →                                                │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ Page Content                                    │   │
│   │                                                 │   │
│   │ gap-6 zwischen Sections                         │   │
│   │                                                 │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│ ← px-6 →                                    pb-6 ↓      │
└─────────────────────────────────────────────────────────┘
```

### 0.3 Typografie-Hierarchie

| Element | Tailwind Classes | Verwendung |
|---------|------------------|------------|
| **PageTitle** | `text-2xl font-bold text-text-primary` | Einmal pro Page (z.B. "Journal") |
| **SectionTitle** | `text-xl font-semibold text-text-primary` | Hauptabschnitte (z.B. "Analytics") |
| **CardTitle** | `text-lg font-semibold text-text-primary` | Card-Header (z.B. "Setup Breakdown") |
| **Subtitle** | `text-base font-medium text-text-primary` | Sub-Sections, Accordion-Header |
| **Body** | `text-sm text-text-secondary` | Standard-Fließtext |
| **BodySmall** | `text-xs text-text-secondary` | Kompakter Text, Descriptions |
| **Label** | `text-xs uppercase tracking-wider font-medium text-text-tertiary` | KPI-Labels, Form-Labels |
| **Meta** | `text-xs text-text-tertiary` | Timestamps, IDs, Hints |
| **Price/Metric** | `font-mono text-2xl font-semibold` | Große Zahlen (+ sentiment-Farbe) |
| **MetricSmall** | `font-mono text-lg font-semibold` | Mittlere Zahlen |
| **Address** | `font-mono text-sm text-text-secondary` | Wallet-Adressen, Hashes |

### 0.4 Card-Pattern

**Entscheidung:** Zwei Card-Typen – `Standard` und `Subtle`

#### Standard Card (Primary)

```tsx
className="rounded-2xl border border-border bg-surface p-4"
```

| Property | Token/Value |
|----------|-------------|
| Background | `bg-surface` (#12172a) |
| Border | `border-border` (#2a3350) |
| Border-Radius | `rounded-2xl` (16px) |
| Padding | `p-4` (16px) |
| Hover (optional) | `hover:border-border-hover` |

**Einsatz:** KPI-Cards, Journal Entries, Alert-Cards, Forms

#### Subtle Card (Container)

```tsx
className="rounded-xl border border-border-subtle bg-surface-base p-4"
```

| Property | Token/Value |
|----------|-------------|
| Background | `bg-surface-base` (#0a0e1a) |
| Border | `border-border-subtle` (#1f2937) |
| Border-Radius | `rounded-xl` (12px) |
| Padding | `p-4` (16px) |

**Einsatz:** Wrapper für Gruppen, RuleBuilder-Sections, Settings-Panels

#### Elevated Card (Modals, Popovers)

```tsx
className="rounded-2xl border border-border bg-surface-elevated p-6 shadow-lg"
```

| Property | Token/Value |
|----------|-------------|
| Background | `bg-surface-elevated` (#1a2038) |
| Border | `border-border` |
| Shadow | `shadow-lg` |
| Padding | `p-6` (24px) |

**Einsatz:** Modals, Dialogs, Dropdown-Panels

### 0.5 Interaktionszustände

#### Buttons

| State | Primary | Outline | Ghost |
|-------|---------|---------|-------|
| **Default** | `bg-brand text-white` | `border-border bg-transparent text-text-primary` | `bg-transparent text-text-secondary` |
| **Hover** | `bg-brand-hover` | `bg-surface-hover border-border-hover` | `bg-surface-hover text-text-primary` |
| **Active** | `bg-brand-hover scale-[0.98]` | `bg-interactive-active` | `bg-interactive-active` |
| **Disabled** | `bg-brand/50 cursor-not-allowed` | `opacity-50 cursor-not-allowed` | `opacity-50 cursor-not-allowed` |
| **Focus** | `ring-2 ring-brand ring-offset-2 ring-offset-surface-base` | same | same |

#### Tabs

| State | Style |
|-------|-------|
| **Default** | `text-text-secondary` |
| **Hover** | `text-text-primary` |
| **Active** | `text-text-primary` + `border-b-2 border-brand` (underline) |

#### List Items (Journal, Alerts)

| State | Style |
|-------|-------|
| **Default** | `bg-transparent border-transparent` |
| **Hover** | `bg-surface-hover` |
| **Selected** | `bg-brand-subtle border-l-2 border-l-brand` |

---

## Phase 1 – Globale UI-Primitives

### 1.1 Tabs Component

**Entscheidung:** Underline-Tabs für alle Pages (konsistent, platzsparend)

```
┌─────────────────────────────────────────────────────────┐
│ Entries      Analytics      History                     │
│ ━━━━━━━━                                                │ ← 2px brand underline
└─────────────────────────────────────────────────────────┘
```

**Spezifikation:**

| Property | Value |
|----------|-------|
| Container | `flex gap-1 border-b border-border-subtle` |
| Tab Item | `relative px-4 py-2.5 text-sm font-medium transition-colors` |
| Inactive | `text-text-secondary hover:text-text-primary` |
| Active | `text-text-primary` |
| Active Indicator | `absolute bottom-0 left-0 right-0 h-0.5 bg-brand` |

**Do:**
- Tabs für Navigation innerhalb einer Page
- Max 4-5 Tabs pro Row
- Konsistente Reihenfolge (wichtigste zuerst)

**Don't:**
- Keine Icons in Tabs (außer bei Icon-only Mobile)
- Keine Badges/Counts in Tabs (clutter)
- Keine verschachtelten Tabs

### 1.2 Button Component

**Größen:**

| Size | Classes | Verwendung |
|------|---------|------------|
| **sm** | `px-3 py-1.5 text-xs rounded-md` | Inline-Actions, Table-Actions |
| **md** | `px-4 py-2 text-sm rounded-lg` | Standard (Default) |
| **lg** | `px-6 py-2.5 text-base rounded-lg` | CTAs, Hero-Actions |
| **icon** | `p-2 rounded-lg` | Icon-only Buttons |

**Varianten (siehe 0.5):** Primary, Outline, Ghost

**Icon-Buttons:**

```tsx
// Mit Text
<Button><IconPlus className="mr-2 h-4 w-4" /> New Entry</Button>

// Icon-only
<Button variant="ghost" size="icon"><IconEdit className="h-4 w-4" /></Button>
```

**Do:**
- Primary für Haupt-CTAs (1 pro Section max)
- Outline für sekundäre Actions
- Ghost für tertiäre/Icon-Actions
- Konsistente Icon-Größe: `h-4 w-4`

**Don't:**
- Keine roten Buttons außer für destruktive Actions
- Keine Custom-Farben pro Button
- Nicht mehr als 3 Buttons nebeneinander

### 1.3 Input Component

**Spezifikation:**

```tsx
className="w-full rounded-lg border border-border bg-surface-elevated 
           px-3 py-2 text-sm text-text-primary 
           placeholder:text-text-tertiary
           focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none
           disabled:opacity-50 disabled:cursor-not-allowed"
```

| Property | Value |
|----------|-------|
| Height | `py-2` → ~40px |
| Background | `bg-surface-elevated` |
| Border | `border-border` → `border-brand` on focus |
| Radius | `rounded-lg` (8px) |
| Text | `text-sm text-text-primary` |
| Placeholder | `text-text-tertiary` |

**Varianten:**

| Variant | Zusätzliche Classes |
|---------|---------------------|
| **Error** | `border-sentiment-bear focus:border-sentiment-bear focus:ring-sentiment-bear/20` |
| **Success** | `border-sentiment-bull` |
| **With Icon** | `pl-10` (Icon absolute left) |

### 1.4 Select/Dropdown

**Spezifikation:** Gleiches Styling wie Input + Chevron-Icon rechts

```tsx
className="... pr-10" // Platz für Chevron
// Chevron: absolute right-3 h-4 w-4 text-text-tertiary
```

### 1.5 Toggle/Switch

**Spezifikation:**

| State | Track | Thumb |
|-------|-------|-------|
| **OFF** | `bg-border` | `translate-x-1 bg-white` |
| **ON** | `bg-sentiment-bull` | `translate-x-6 bg-white` |

```tsx
// Track
className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"

// Thumb
className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
```

### 1.6 Badge Component

| Variant | Classes | Verwendung |
|---------|---------|------------|
| **Long** | `bg-sentiment-bull-bg text-sentiment-bull` | Trade Direction |
| **Short** | `bg-sentiment-bear-bg text-sentiment-bear` | Trade Direction |
| **Armed** | `bg-status-armed/20 text-status-armed` | Alert Status |
| **Triggered** | `bg-sentiment-bull-bg text-sentiment-bull` | Alert Status |
| **Snoozed** | `bg-surface-hover text-text-tertiary` | Alert Status |
| **Neutral** | `bg-surface-hover text-text-secondary` | Tags, Labels |

**Base Classes:**

```tsx
className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
```

### 1.7 Do/Don't Summary

**DO:**
- Alle interaktiven Elemente: `transition-colors` oder `transition-all duration-200`
- Focus-States für Keyboard-Navigation
- Konsistente Border-Radius: `rounded-lg` (8px) für Controls, `rounded-2xl` (16px) für Cards
- Monospace für alle Zahlen/Preise/Adressen

**DON'T:**
- Keine individuellen Schatten auf Einzelkomponenten (nur Card-Level)
- Keine Gradient-Backgrounds (außer spezielle Highlight-Cases)
- Keine Custom-Farben außerhalb des Token-Systems
- Keine unterschiedlichen Hover-Animationen pro Komponente
- Keine Outline-Focus-Rings ohne `ring-offset` (sonst klebt der Ring)

---

## Phase 2 – Journal 2.0 Styling

### 2.1 Layout-Struktur

**Entscheidung:** List/Detail Split mit 40/60 Ratio (optimiert für Scan + Deep-Dive)

```
┌─────────────────────────────────────────────────────────────────┐
│ Journal                                    [+ New Entry]        │
├─────────────────────────────────────────────────────────────────┤
│ [Entries]  [Analytics]                                          │
├───────────────────────────┬─────────────────────────────────────┤
│                           │                                     │
│  Entry List (40%)         │  Detail Panel (60%)                 │
│                           │                                     │
│  ┌─────────────────────┐  │  ┌─────────────────────────────────┐│
│  │ Entry 1 (selected)  │  │  │ Header + Actions                ││
│  └─────────────────────┘  │  ├─────────────────────────────────┤│
│                           │  │ Chart Area                      ││
│  ┌─────────────────────┐  │  ├─────────────────────────────────┤│
│  │ Entry 2             │  │  │ Notes                           ││
│  └─────────────────────┘  │  ├─────────────────────────────────┤│
│                           │  │ Meta / Tags                     ││
│  ┌─────────────────────┐  │  └─────────────────────────────────┘│
│  │ Entry 3             │  │                                     │
│  └─────────────────────┘  │                                     │
│                           │                                     │
└───────────────────────────┴─────────────────────────────────────┘
```

**Grid-Definition:**

```tsx
// Desktop
className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"

// Mobile: Stack (List collapsed to horizontal scroll or hidden)
className="flex flex-col gap-4 lg:grid ..."
```

**Mobile-Verhalten:**
- List wird zu horizontalem Carousel oder Dropdown-Selector
- Detail-Panel nimmt volle Breite

### 2.2 Journal Header

```
┌─────────────────────────────────────────────────────────────────┐
│ Journal                                    [+ New Entry]        │
│ ↑ PageTitle                                ↑ Primary Button     │
└─────────────────────────────────────────────────────────────────┘
```

**Spezifikation:**

```tsx
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-bold text-text-primary">Journal</h1>
  <Button variant="primary">
    <IconPlus className="mr-2 h-4 w-4" />
    New Entry
  </Button>
</div>
```

### 2.3 JournalList

**List-Item Struktur:**

```
┌─────────────────────────────────────────┐
│ SOL Long @ $156.43              [LONG]  │  ← Title + Badge
│ 2025-11-25 · 14:32 UTC                  │  ← Meta
│ +$1,234.56                              │  ← PnL (sentiment color)
└─────────────────────────────────────────┘
```

**States:**

| State | Classes |
|-------|---------|
| **Default** | `bg-transparent border-l-2 border-l-transparent` |
| **Hover** | `bg-surface-hover` |
| **Selected** | `bg-brand-subtle/50 border-l-2 border-l-brand` |

**Item Classes:**

```tsx
className={cn(
  "p-3 cursor-pointer transition-colors border-l-2",
  isSelected 
    ? "bg-brand-subtle/50 border-l-brand" 
    : "border-l-transparent hover:bg-surface-hover"
)}
```

**Innere Struktur:**

```tsx
<div className="flex items-start justify-between">
  <div>
    <p className="text-sm font-medium text-text-primary">SOL Long @ $156.43</p>
    <p className="mt-0.5 text-xs text-text-tertiary">2025-11-25 · 14:32 UTC</p>
  </div>
  <Badge variant="long">LONG</Badge>
</div>
<p className="mt-2 font-mono text-lg font-semibold text-sentiment-bull">+$1,234.56</p>
```

### 2.4 JournalDetailPanel

**Struktur:**

```
┌─────────────────────────────────────────────────────────────────┐
│ SOL Long @ $156.43                              [LONG]          │
│ 2025-11-25 · 14:32 UTC                                          │
│                                                                 │
│ [📸 Snapshot]  [✏️ Edit]  [🗑️ Delete]           ← Actions       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                                                           │  │
│  │                    Chart Area                             │  │
│  │                    (TradingView)                          │  │
│  │                                                           │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│ Notes                                                           │
│ Great entry, caught FVG fill. Should have held longer...        │
├─────────────────────────────────────────────────────────────────┤
│ ENTRY        EXIT         PNL          SETUP                    │
│ $156.43      $162.87      +$1,234.56   FVG Fill                 │
│ (mono)       (mono)       (green)                               │
├─────────────────────────────────────────────────────────────────┤
│ Tags: #SOL #FVG #Breakout                                       │
└─────────────────────────────────────────────────────────────────┘
```

**Header:**

```tsx
<div className="flex items-start justify-between">
  <div>
    <div className="flex items-center gap-3">
      <h2 className="text-xl font-semibold text-text-primary">SOL Long @ $156.43</h2>
      <Badge variant="long">LONG</Badge>
    </div>
    <p className="mt-1 text-sm text-text-tertiary">2025-11-25 · 14:32 UTC</p>
  </div>
  
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm">
      <IconCamera className="mr-1.5 h-3.5 w-3.5" />
      Snapshot
    </Button>
    <Button variant="ghost" size="icon">
      <IconEdit className="h-4 w-4" />
    </Button>
    <Button variant="ghost" size="icon" className="text-sentiment-bear hover:text-sentiment-bear">
      <IconTrash className="h-4 w-4" />
    </Button>
  </div>
</div>
```

**Snapshot-Button Entscheidung:**

| Property | Value | Rationale |
|----------|-------|-----------|
| **Variante** | `outline` + `size="sm"` | Sekundäre Action, nicht Primary |
| **Icon** | `IconCamera` (Lucide: `Camera`) | Universell verständlich |
| **Label** | "Snapshot" | Kurz, action-oriented |
| **Tooltip** | "Save chart screenshot to entry" | Erklärt Funktion |
| **Funktion** | Speichert TradingView-Screenshot zum Entry | Standard Trading-Journal Feature |

**Chart Area:**

```tsx
<div className="mt-4 overflow-hidden rounded-xl border border-border bg-surface-base">
  {/* TradingView Lightweight Chart */}
  <div className="aspect-[16/9] w-full">
    <TradingViewChart />
  </div>
</div>
```

**Meta-Grid (Entry/Exit/PnL):**

```tsx
<div className="mt-4 grid grid-cols-4 gap-4">
  <div>
    <p className="text-xs uppercase tracking-wider text-text-tertiary">Entry</p>
    <p className="mt-1 font-mono text-base font-medium text-text-primary">$156.43</p>
  </div>
  <div>
    <p className="text-xs uppercase tracking-wider text-text-tertiary">Exit</p>
    <p className="mt-1 font-mono text-base font-medium text-text-primary">$162.87</p>
  </div>
  <div>
    <p className="text-xs uppercase tracking-wider text-text-tertiary">PnL</p>
    <p className="mt-1 font-mono text-base font-medium text-sentiment-bull">+$1,234.56</p>
  </div>
  <div>
    <p className="text-xs uppercase tracking-wider text-text-tertiary">Setup</p>
    <p className="mt-1 text-base font-medium text-text-primary">FVG Fill</p>
  </div>
</div>
```

### 2.5 JournalAnalyticsDashboard

**Entscheidung:** Tab-basiert, nicht Page-Switch (bleibt im Journal-Kontext)

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Analytics                                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ WIN RATE  │ │ TOTAL PNL │ │ AVG WIN   │ │ TRADES    │       │
│  │ 68.5%     │ │ +$12,450  │ │ +$234     │ │ 47        │       │
│  │ ↑ +2.3%   │ │ ↑ +15%    │ │ ↓ -$12    │ │           │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Equity Curve                                    [7D][30D][ALL]│
│  │ ╱╲    ╱╲                                                    ││
│  │╱  ╲  ╱  ╲    ╱                                              ││
│  │    ╲╱    ╲  ╱                                               ││
│  │           ╲╱                                                ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌──────────────────────────┐ ┌────────────────────────────────┐│
│  │ Setup Breakdown          │ │ Perfect Trader Insights        ││
│  │ [Chips: FVG|OB|Liq|All]  │ │                                ││
│  │                          │ │ 💡 Based on your last 30 days: ││
│  │  FVG Fill    ████ 72%    │ │                                ││
│  │  Order Block ███  58%    │ │ • Your FVG setups outperform   ││
│  │  Liquidity   ██   45%    │ │ • Tuesday entries +23% vs avg  ││
│  │                          │ │ • Hold time too short (-$89)   ││
│  └──────────────────────────┘ └────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### KPI-Kacheln

**Layout:** 4-Column Grid (responsive: 2x2 auf Tablet, 1-col auf Mobile)

```tsx
<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <KPICard label="Win Rate" value="68.5%" delta="+2.3%" sentiment="bull" />
  ...
</div>
```

**KPI-Card Struktur:**

```tsx
<Card className="p-4">
  <p className="text-xs uppercase tracking-wider text-text-tertiary">{label}</p>
  <p className="mt-2 font-mono text-2xl font-semibold text-text-primary">{value}</p>
  {delta && (
    <p className={cn(
      "mt-1 text-xs font-medium",
      sentiment === 'bull' ? "text-sentiment-bull" : "text-sentiment-bear"
    )}>
      {sentiment === 'bull' ? '↑' : '↓'} {delta}
    </p>
  )}
</Card>
```

**Typo-Hierarchie:**
1. Label: `text-xs uppercase tracking-wider text-text-tertiary`
2. Value: `font-mono text-2xl font-semibold` (Primary oder sentiment-Farbe)
3. Delta: `text-xs font-medium` + sentiment-Farbe

**Farblogik:**
- Positive Werte: `text-sentiment-bull` (grün)
- Negative Werte: `text-sentiment-bear` (rot)
- Neutrale Werte (z.B. Trade Count): `text-text-primary`

#### Equity Curve

**Container:**

```tsx
<Card className="p-4">
  <div className="flex items-center justify-between">
    <h3 className="text-lg font-semibold text-text-primary">Equity Curve</h3>
    <div className="flex gap-1">
      <Button variant="ghost" size="sm" className="text-xs">7D</Button>
      <Button variant="ghost" size="sm" className="text-xs bg-surface-hover">30D</Button>
      <Button variant="ghost" size="sm" className="text-xs">ALL</Button>
    </div>
  </div>
  <div className="mt-4 h-[200px]">
    <LineChart />
  </div>
</Card>
```

**Chart-Stil:**
- Line Color: `--brand` (#3b82f6)
- Grid: `--grid-color` (#1f2937) – sehr subtle
- Achsen: `text-xs text-text-tertiary`
- Tooltip: Elevated Card Style
- Area Fill: `--brand` mit 10% Opacity

#### Setup Breakdown

**Darstellung:** Chips für Filter + horizontale Balken

```tsx
<Card className="p-4">
  <h3 className="text-lg font-semibold text-text-primary">Setup Breakdown</h3>
  
  {/* Filter Chips */}
  <div className="mt-3 flex flex-wrap gap-2">
    <Chip active>All</Chip>
    <Chip>FVG</Chip>
    <Chip>Order Block</Chip>
    <Chip>Liquidity</Chip>
  </div>
  
  {/* Bars */}
  <div className="mt-4 space-y-3">
    <BreakdownBar label="FVG Fill" value={72} />
    <BreakdownBar label="Order Block" value={58} />
    <BreakdownBar label="Liquidity" value={45} />
  </div>
</Card>
```

**Chip-Styling:**

```tsx
// Inactive
className="px-3 py-1 text-xs font-medium rounded-full bg-surface-hover text-text-secondary"

// Active
className="px-3 py-1 text-xs font-medium rounded-full bg-brand text-white"
```

**Breakdown-Bar:**

```tsx
<div>
  <div className="flex justify-between text-sm">
    <span className="text-text-secondary">{label}</span>
    <span className="font-mono text-text-primary">{value}%</span>
  </div>
  <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-hover">
    <div 
      className="h-full rounded-full bg-brand" 
      style={{ width: `${value}%` }}
    />
  </div>
</div>
```

#### Perfect-Trader-Block

**Entscheidung:** AI-generierter Insight-Block mit klarem "Insight"-Charakter

**Struktur:**

```tsx
<Card className="border-l-4 border-l-brand p-4">
  <div className="flex items-start gap-3">
    <div className="rounded-lg bg-brand-subtle p-2">
      <IconLightbulb className="h-5 w-5 text-brand" />
    </div>
    <div>
      <h3 className="text-base font-semibold text-text-primary">Perfect Trader Insights</h3>
      <p className="mt-0.5 text-xs text-text-tertiary">Based on your last 30 days</p>
    </div>
  </div>
  
  <ul className="mt-4 space-y-2">
    <li className="flex items-start gap-2 text-sm text-text-secondary">
      <IconTrendingUp className="mt-0.5 h-4 w-4 flex-shrink-0 text-sentiment-bull" />
      <span>Your FVG setups outperform by <span className="font-medium text-sentiment-bull">+18%</span></span>
    </li>
    <li className="flex items-start gap-2 text-sm text-text-secondary">
      <IconCalendar className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand" />
      <span>Tuesday entries average <span className="font-medium text-sentiment-bull">+23%</span> vs other days</span>
    </li>
    <li className="flex items-start gap-2 text-sm text-text-secondary">
      <IconClock className="mt-0.5 h-4 w-4 flex-shrink-0 text-status-armed" />
      <span>Holding longer would have added <span className="font-medium text-sentiment-bull">+$89</span> avg</span>
    </li>
  </ul>
</Card>
```

**Styling-Details:**
- Left Border: `border-l-4 border-l-brand` (Insight-Indikator)
- Icon: `IconLightbulb` in brand-subtle Background
- Bullets: Verschiedene Icons je nach Insight-Typ
- Werte: Inline mit sentiment-Farbe

---

## Phase 3 – Settings 2.0 Styling

### 3.1 SettingsPageV2 Layout

**Entscheidung:** Tabs oben (konsistent mit Journal), Single-Column Content

```
┌─────────────────────────────────────────────────────────────────┐
│ Settings                                                        │
├─────────────────────────────────────────────────────────────────┤
│ [General]  [Wallet & Journal]  [Alerts]  [Data]                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Section Content (max-w-2xl für Forms)                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Form/Settings Card                                          ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Content Width:**

```tsx
<div className="mx-auto max-w-2xl">
  {/* Settings Content */}
</div>
```

**Rationale:** Settings-Forms brauchen keine Full-Width, `max-w-2xl` (672px) ist optimal für Lesbarkeit und Form-Usability.

### 3.2 WalletConnectionSection

**Layout:** 3-Column Grid für Wallet-Slots

```
┌─────────────────────────────────────────────────────────────────┐
│ Connected Wallets                              [+ Add Wallet]   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ MAIN WALLET 1   │ │ MAIN WALLET 2   │ │ TRADING WALLET  │   │
│  │                 │ │                 │ │                 │   │
│  │ DezXAZ8z7P...   │ │ Not connected   │ │ 3nF8kL2w9X...   │   │
│  │                 │ │                 │ │                 │   │
│  │ [●] Connected   │ │ [Connect]       │ │ [●] Connected   │   │
│  │                 │ │                 │ │                 │   │
│  │ [Disconnect]    │ │                 │ │ [Disconnect]    │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Slot-Card Styling:**

```tsx
// Connected
<Card className="p-4">
  <p className="text-xs uppercase tracking-wider text-text-tertiary">Main Wallet 1</p>
  <p className="mt-2 font-mono text-sm text-text-primary truncate">DezXAZ8z7Pnr...</p>
  
  <div className="mt-3 flex items-center gap-2">
    <span className="flex items-center gap-1.5 text-xs text-sentiment-bull">
      <span className="h-2 w-2 rounded-full bg-sentiment-bull" />
      Connected
    </span>
  </div>
  
  <Button variant="ghost" size="sm" className="mt-3 w-full text-sentiment-bear">
    Disconnect
  </Button>
</Card>

// Disconnected
<Card className="border-dashed p-4">
  <p className="text-xs uppercase tracking-wider text-text-tertiary">Main Wallet 2</p>
  <p className="mt-2 text-sm text-text-tertiary">Not connected</p>
  
  <Button variant="outline" size="sm" className="mt-4 w-full">
    Connect Wallet
  </Button>
</Card>
```

**Status-Indikatoren:**

| Status | Visual |
|--------|--------|
| Connected | Grüner Dot + "Connected" Text |
| Disconnected | Dashed Border + "Not connected" |
| Connecting | Pulsing Dot + "Connecting..." |

### 3.3 WalletSettingsPanel

**Form-Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Auto-Journal Settings                                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Auto-Journal Enabled                              [●━━━━] ON   │
│  Automatically create journal entries for trades                │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Minimum Trade Size ($)                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 100                                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ⚠️ Trades below this value won't be auto-journaled             │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Auto-Capture Screenshot                           [●━━━━] ON   │
│  Capture TradingView chart on trade entry                       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Form-Row mit Toggle:**

```tsx
<div className="flex items-start justify-between py-4 border-b border-border-subtle">
  <div>
    <p className="text-sm font-medium text-text-primary">Auto-Journal Enabled</p>
    <p className="mt-0.5 text-xs text-text-tertiary">
      Automatically create journal entries for trades
    </p>
  </div>
  <Toggle checked={enabled} onChange={setEnabled} />
</div>
```

**Form-Row mit Input:**

```tsx
<div className="py-4 border-b border-border-subtle">
  <label className="block text-sm font-medium text-text-primary">
    Minimum Trade Size ($)
  </label>
  <Input 
    type="number" 
    value={minSize} 
    onChange={setMinSize}
    className="mt-2"
  />
  <p className="mt-1.5 flex items-center gap-1.5 text-xs text-status-armed">
    <IconAlertTriangle className="h-3.5 w-3.5" />
    Trades below this value won't be auto-journaled
  </p>
</div>
```

**Helper-Text-Pattern:**

| Type | Style |
|------|-------|
| **Info** | `text-xs text-text-tertiary` |
| **Warning** | `text-xs text-status-armed` + Warning-Icon |
| **Error** | `text-xs text-sentiment-bear` + Error-Icon |

---

## Phase 4 – Alerts 2.0 Styling

### 4.1 AlertsPageV2 Layout

**Entscheidung:** Tool-Charakter (mehr Luft als Settings, strukturierte Panels)

```
┌─────────────────────────────────────────────────────────────────┐
│ Alerts                                          [+ New Alert]   │
├─────────────────────────────────────────────────────────────────┤
│ [Builder]  [Active Alerts]  [History]  [Backtest]               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Tab Content                                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Tab-Descriptions (für Tooltips/Onboarding):**

| Tab | Description |
|-----|-------------|
| **Builder** | "Create and edit alert rules" |
| **Active Alerts** | "Monitor your armed alerts" |
| **History** | "Review past alert triggers" |
| **Backtest** | "Test rules against historical data" |

### 4.2 AlertRuleBuilder

**Entscheidung:** Card-basierte Sections (kein Accordion – alles sichtbar für Überblick)

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Create Alert Rule                                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ CONDITIONS                                                  ││
│  │                                                             ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ IF  [BTC ▼] [Price ▼] [> ▼] [$50,000    ]   [✕]    │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                         ┌─────┐                             ││
│  │                         │ AND │                             ││
│  │                         └─────┘                             ││
│  │  ┌─────────────────────────────────────────────────────┐   ││
│  │  │ AND [SOL ▼] [Volume ▼] [> ▼] [150% avg  ]   [✕]    │   ││
│  │  └─────────────────────────────────────────────────────┘   ││
│  │                                                             ││
│  │  [+ Add Condition]  [+ Add Group (OR)]                      ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ TIME RESTRICTIONS (Optional)                                ││
│  │                                                             ││
│  │  Active Hours: [09:00] to [17:00] UTC                       ││
│  │  Active Days:  [●]Mon [●]Tue [●]Wed [●]Thu [●]Fri [ ]Sat... ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ ACTIONS                                                     ││
│  │                                                             ││
│  │  [✓] Push Notification                                      ││
│  │  [✓] Sound Alert                                            ││
│  │  [ ] Create Journal Entry                                   ││
│  │  [ ] Webhook: [https://...]                                 ││
│  │                                                             ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│                              [Cancel]  [Save & Arm]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Section-Card:**

```tsx
<Card className="p-0 overflow-hidden">
  <div className="bg-surface-elevated px-4 py-3 border-b border-border-subtle">
    <h3 className="text-base font-semibold text-text-primary">Conditions</h3>
  </div>
  <div className="p-4">
    {/* Content */}
  </div>
</Card>
```

**Condition-Row:**

```tsx
<div className="flex items-center gap-2 p-3 bg-surface-base rounded-lg border border-border-subtle">
  <span className="text-xs font-medium text-text-tertiary uppercase w-10">IF</span>
  <Select options={assets} className="w-24" />
  <Select options={metrics} className="w-28" />
  <Select options={operators} className="w-16" />
  <Input type="text" className="w-32" />
  <Button variant="ghost" size="icon" className="ml-auto">
    <IconX className="h-4 w-4" />
  </Button>
</div>
```

**AND/OR Connector:**

```tsx
// Zwischen Conditions
<div className="flex justify-center py-2">
  <span className="px-3 py-1 text-xs font-semibold uppercase rounded-full bg-brand-subtle text-brand">
    AND
  </span>
</div>

// OR (für Gruppen)
<span className="... bg-status-armed/20 text-status-armed">OR</span>
```

**Add-Buttons:**

```tsx
<div className="flex gap-2 mt-3">
  <Button variant="ghost" size="sm">
    <IconPlus className="mr-1.5 h-3.5 w-3.5" />
    Add Condition
  </Button>
  <Button variant="ghost" size="sm" className="text-text-tertiary">
    <IconLayers className="mr-1.5 h-3.5 w-3.5" />
    Add Group (OR)
  </Button>
</div>
```

### 4.3 AlertBacktestPanel

**Layout:**

```
┌─────────────────────────────────────────────────────────────────┐
│ Backtest                                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Select Rule: [BTC Above $50k + Volume ▼]                    ││
│  │ Timeframe:   [Last 90 Days ▼]          [▶ Run Backtest]     ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐       │
│  │ TRIGGERS  │ │ HIT RATE  │ │ AVG PNL   │ │ TOTAL PNL │       │
│  │ 47        │ │ 68%       │ │ +$234     │ │ +$10,998  │       │
│  └───────────┘ └───────────┘ └───────────┘ └───────────┘       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │ Trigger History                                             ││
│  ├─────────────────────────────────────────────────────────────┤│
│  │ Date         Asset  Trigger Price  Outcome     PnL         ││
│  │ 2025-11-20   BTC    $51,234        ✓ Win       +$456       ││
│  │ 2025-11-18   BTC    $50,890        ✗ Loss      -$123       ││
│  │ ...                                                         ││
│  └─────────────────────────────────────────────────────────────┘│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Config-Bar:**

```tsx
<Card className="p-4">
  <div className="flex flex-wrap items-end gap-4">
    <div className="flex-1 min-w-[200px]">
      <label className="block text-xs font-medium text-text-tertiary mb-1.5">
        Select Rule
      </label>
      <Select options={rules} />
    </div>
    <div className="w-40">
      <label className="block text-xs font-medium text-text-tertiary mb-1.5">
        Timeframe
      </label>
      <Select options={timeframes} />
    </div>
    <Button variant="primary">
      <IconPlay className="mr-2 h-4 w-4" />
      Run Backtest
    </Button>
  </div>
</Card>
```

**Results-Table:**

```tsx
<Card className="mt-4 overflow-hidden">
  <div className="px-4 py-3 border-b border-border-subtle">
    <h3 className="text-base font-semibold text-text-primary">Trigger History</h3>
  </div>
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead>
        <tr className="border-b border-border-subtle bg-surface-base">
          <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Date
          </th>
          {/* ... */}
        </tr>
      </thead>
      <tbody className="divide-y divide-border-subtle">
        <tr className="hover:bg-surface-hover">
          <td className="px-4 py-3 text-sm text-text-secondary">2025-11-20</td>
          <td className="px-4 py-3 text-sm text-text-primary">BTC</td>
          <td className="px-4 py-3 font-mono text-sm text-text-primary">$51,234</td>
          <td className="px-4 py-3">
            <Badge variant="long">✓ Win</Badge>
          </td>
          <td className="px-4 py-3 font-mono text-sm text-sentiment-bull">+$456</td>
        </tr>
        {/* ... */}
      </tbody>
    </table>
  </div>
</Card>
```

**Empty-State (keine Backtest-Ergebnisse):**

```tsx
<Card className="p-8 text-center">
  <div className="mx-auto w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center">
    <IconFlask className="h-6 w-6 text-text-tertiary" />
  </div>
  <h3 className="mt-4 text-base font-semibold text-text-primary">No backtest results yet</h3>
  <p className="mt-1 text-sm text-text-secondary">
    Select a rule and timeframe, then run a backtest to see historical performance.
  </p>
  <Button variant="outline" className="mt-4">
    <IconPlay className="mr-2 h-4 w-4" />
    Run Your First Backtest
  </Button>
</Card>
```

### 4.4 Alert-History

**Entscheidung:** Table-Darstellung (beste Scanbarkeit für chronologische Daten)

**Minimal sichtbare Spalten:**

| Spalte | Breite | Content |
|--------|--------|---------|
| **Timestamp** | auto | `2025-11-20 14:32` |
| **Rule** | flex-1 | Rule Name (truncated) |
| **Asset** | 80px | `BTC` |
| **Status** | 100px | Badge (Triggered/Snoozed) |
| **PnL** | 100px | `+$456` (sentiment color) |
| **Actions** | 60px | View/Dismiss Icons |

---

## Phase 5 – States, Feedback & Feel

### 5.1 Loading-Patterns

**Entscheidung:** Skeletons für Content, Spinner nur für Actions

#### Skeleton-Loader

```tsx
// Skeleton-Primitive
<div className="animate-pulse rounded bg-surface-skeleton" />

// KPI-Card Skeleton
<Card className="p-4">
  <div className="h-3 w-16 rounded bg-surface-skeleton" />
  <div className="mt-3 h-8 w-24 rounded bg-surface-skeleton" />
</Card>

// List-Item Skeleton
<div className="p-3 space-y-2">
  <div className="h-4 w-3/4 rounded bg-surface-skeleton" />
  <div className="h-3 w-1/2 rounded bg-surface-skeleton" />
</div>
```

**Verwendung:**

| Context | Pattern |
|---------|---------|
| **Journal Analytics Loading** | 4 KPI-Skeletons + Chart-Skeleton |
| **Journal List Loading** | 5 List-Item-Skeletons |
| **Alerts Backtest Running** | Spinner-Button + "Running..." Text |

#### Spinner

```tsx
<svg className="h-4 w-4 animate-spin text-brand" viewBox="0 0 24 24">
  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
</svg>
```

**Verwendung:** Button-Loading-State, Inline-Actions

### 5.2 Empty-State-Patterns

#### Template: No Wallet Connected

```tsx
<Card className="p-8 text-center">
  <div className="mx-auto w-12 h-12 rounded-full bg-brand-subtle flex items-center justify-center">
    <IconWallet className="h-6 w-6 text-brand" />
  </div>
  <h3 className="mt-4 text-base font-semibold text-text-primary">
    No wallet connected
  </h3>
  <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
    Connect your wallet to start tracking trades and building your journal automatically.
  </p>
  <Button variant="primary" className="mt-4">
    Connect Wallet
  </Button>
</Card>
```

#### Template: No Alerts

```tsx
<Card className="p-8 text-center">
  <div className="mx-auto w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center">
    <IconBell className="h-6 w-6 text-text-tertiary" />
  </div>
  <h3 className="mt-4 text-base font-semibold text-text-primary">
    No alerts yet
  </h3>
  <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
    Create your first alert rule to get notified when market conditions match your criteria.
  </p>
  <Button variant="outline" className="mt-4">
    <IconPlus className="mr-2 h-4 w-4" />
    Create Alert
  </Button>
</Card>
```

#### Template: No Journal Entries

```tsx
<Card className="p-8 text-center">
  <div className="mx-auto w-12 h-12 rounded-full bg-surface-hover flex items-center justify-center">
    <IconBook className="h-6 w-6 text-text-tertiary" />
  </div>
  <h3 className="mt-4 text-base font-semibold text-text-primary">
    Your journal is empty
  </h3>
  <p className="mt-1 text-sm text-text-secondary max-w-sm mx-auto">
    Start documenting your trades to track performance and discover patterns.
  </p>
  <Button variant="primary" className="mt-4">
    <IconPlus className="mr-2 h-4 w-4" />
    New Entry
  </Button>
</Card>
```

**Empty-State Elemente:**
1. **Icon:** In subtle Background-Circle (`bg-surface-hover` oder `bg-brand-subtle`)
2. **Title:** `text-base font-semibold text-text-primary`
3. **Description:** `text-sm text-text-secondary max-w-sm mx-auto`
4. **CTA:** Primary oder Outline Button

### 5.3 Feedback (Toasts/Notifications)

**Aktionen mit Toast:**

| Aktion | Toast-Typ | Message |
|--------|-----------|---------|
| Alert gespeichert | Success | "Alert rule saved and armed" |
| Backtest erfolgreich | Success | "Backtest complete: 47 triggers found" |
| Wallet verbunden | Success | "Wallet connected successfully" |
| Wallet getrennt | Info | "Wallet disconnected" |
| Journal Entry erstellt | Success | "Entry added to journal" |
| Error (allgemein) | Error | "[Specific error message]" |

**Toast-Styling:**

```tsx
// Success
<div className="flex items-center gap-3 rounded-lg border border-sentiment-bull/20 bg-sentiment-bull-bg p-4">
  <IconCheck className="h-5 w-5 text-sentiment-bull" />
  <p className="text-sm text-text-primary">{message}</p>
</div>

// Error
<div className="flex items-center gap-3 rounded-lg border border-sentiment-bear/20 bg-sentiment-bear-bg p-4">
  <IconX className="h-5 w-5 text-sentiment-bear" />
  <p className="text-sm text-text-primary">{message}</p>
</div>

// Info
<div className="flex items-center gap-3 rounded-lg border border-border bg-surface-elevated p-4">
  <IconInfo className="h-5 w-5 text-brand" />
  <p className="text-sm text-text-primary">{message}</p>
</div>
```

**Toast-Config:**

| Property | Value |
|----------|-------|
| Position | `bottom-right` |
| Duration | 4000ms (auto-dismiss) |
| Max visible | 3 |
| Animation | `slideUp` + `fadeIn` |

---

## Phase 6 – Dark Mode & Token-Sauberkeit

### 6.1 Token-Mapping Review

Alle Farb-Referenzen in diesem Dokument nutzen die definierten Tokens aus dem Moodboard:

| Token | Hex | Verwendung |
|-------|-----|------------|
| `--surface-base` | #0a0e1a | Page Background |
| `--surface` | #12172a | Card Background |
| `--surface-elevated` | #1a2038 | Modals, Inputs |
| `--surface-hover` | #222848 | Hover States |
| `--surface-skeleton` | #2a3350 | Skeleton Loaders |
| `--text-primary` | #e8eaed | Main Text |
| `--text-secondary` | #9ca3af | Body Text |
| `--text-tertiary` | #6b7280 | Labels, Meta |
| `--border` | #2a3350 | Default Borders |
| `--border-subtle` | #1f2937 | Subtle Borders |
| `--border-hover` | #374151 | Hover Borders |
| `--brand` | #3b82f6 | Primary Accent |
| `--brand-hover` | #2563eb | Hover State |
| `--brand-subtle` | #1e3a8a | Background Tint |
| `--sentiment-bull` | #10b981 | Positive/Green |
| `--sentiment-bull-bg` | #064e3b | Green Background |
| `--sentiment-bear` | #ef4444 | Negative/Red |
| `--sentiment-bear-bg` | #7f1d1d | Red Background |
| `--status-armed` | #f59e0b | Amber (Armed) |
| `--status-triggered` | #10b981 | Green (Triggered) |
| `--status-snoozed` | #6b7280 | Gray (Snoozed) |

### 6.2 Empfohlene neue Tokens

| Token | Hex | Zweck |
|-------|-----|-------|
| `--interactive-active` | #0f172a | Active/Pressed State für Buttons |
| `--chart-grid` | #1f2937 | Chart Grid Lines |
| `--chart-line-primary` | #3b82f6 | Primary Chart Line (= brand) |
| `--chart-line-secondary` | #8b5cf6 | Secondary Chart Line (Purple) |
| `--toast-success-bg` | #064e3b | Toast Success Background |
| `--toast-error-bg` | #7f1d1d | Toast Error Background |

### 6.3 Dark-Mode Vorsichtshinweise

**KPI-Cards:**
- Sentiment-Farben haben genug Kontrast auf `surface`
- Bei negativen Werten: `text-sentiment-bear` (#ef4444) ist gut lesbar
- Keine zusätzlichen Background-Tints für Zahlen nötig

**Tabellen:**
- Alternating Row Colors vermeiden (zu busy)
- Hover-State reicht: `hover:bg-surface-hover`
- Header: `bg-surface-base` (leicht abgesetzt)

**Badges:**
- Immer `/20` Opacity für Backgrounds (z.B. `bg-status-armed/20`)
- Text-Farbe = Vordergrund-Farbe (kein Kontrast-Problem)

**Charts:**
- Grid-Lines sehr subtle: `--chart-grid` (#1f2937)
- Area-Fill mit niedriger Opacity: `fill-brand/10`
- Tooltip: `bg-surface-elevated` mit Border

**Inputs (Focus):**
- Ring-Offset wichtig: `ring-offset-surface-base`
- Sonst "schwebt" der Focus-Ring

---

## Zusammenfassung für Codex

### Prioritäts-Reihenfolge für Implementierung

1. **Tailwind Config** – Alle Tokens als CSS Variables einrichten
2. **Base Primitives** – Button, Input, Card, Badge, Toggle, Tabs
3. **Layout Shell** – DashboardShell mit korrektem Spacing
4. **Journal Page** – List/Detail Layout, Entry-Cards, Detail-Panel
5. **Journal Analytics** – KPI-Cards, Equity Curve, Breakdown-Bars
6. **Settings Page** – Wallet-Cards, Form-Layouts, Toggle-Rows
7. **Alerts Page** – RuleBuilder, Backtest-Panel, History-Table
8. **States & Feedback** – Skeletons, Empty-States, Toasts

### Die 5 wichtigsten Design-Prinzipien für Sparkfined

1. **Information Density First**
   Trading-Apps leben von Daten. Lieber mehr Info pro Screen als Whitespace.

2. **Consistent Token Usage**
   Keine Hex-Codes im Code. Immer Tokens nutzen. Keine Ausnahmen.

3. **Monospace für Zahlen**
   Preise, PnL, Adressen, Metriken = `font-mono`. Immer.

4. **Sentiment = Bull/Bear**
   Grün = positiv/long/profit. Rot = negativ/short/loss. Universell.

5. **Subtle Transitions**
   200ms, ease-in-out. Professionell, nicht verspielt.

### Quick-Reference für Codex

```tsx
// Standard Card
className="rounded-2xl border border-border bg-surface p-4"

// Primary Button
className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"

// Input
className="w-full rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm text-text-primary focus:border-brand focus:ring-2 focus:ring-brand/20"

// Active Tab
className="relative px-4 py-2.5 text-sm font-medium text-text-primary"
// + underline: "absolute bottom-0 left-0 right-0 h-0.5 bg-brand"

// Selected List Item
className="bg-brand-subtle/50 border-l-2 border-l-brand"

// KPI Label
className="text-xs uppercase tracking-wider text-text-tertiary"

// KPI Value
className="font-mono text-2xl font-semibold text-text-primary"

// Positive PnL
className="font-mono text-lg font-semibold text-sentiment-bull"

// Badge
className="rounded-full bg-sentiment-bull-bg px-2 py-0.5 text-xs font-medium text-sentiment-bull"
```

---

**Ende des Style Sprint Plans**

*Erstellt für die Sparkfined PWA v2.0 Implementierung*

# Working Papers: Full PWA Refactor

**Status:** Planning  
**Last Updated:** 2025-12-17  
**Owner:** Codex

---

## 🎯 INDEX – Full Architecture Overview

### Pages & Modules

```
GLOBAL LAYER (Core Infrastructure)
├─ WP-001: Bottom Navigation Bar (PWA Mobile)
├─ WP-002: Theme System (Dark/Light Toggle)
├─ WP-003: Desktop Navigation (Sidebar, Icons, Settings)
└─ WP-004: Header Bar (Alerts + Settings Integration)

DASHBOARD (Analytics & Overview)
├─ WP-010: Typography, Spacing & Global Styles (Dashboard-Context)
├─ WP-011: Hero KPI Bar (Sticky Top, 4–5 Cards)
├─ WP-012: Daily Bias / Market Intel Card
├─ WP-013: Holdings / Wallet Snapshot
├─ WP-014: Trade Log / Recent Entries
├─ WP-015: Recent Journal Entries & Alerts Overview
└─ WP-016: Quick Actions (FAB, Mobile Layout)

JOURNAL (Trade Tracking & Psychology)
├─ WP-030: Foundation (Typography, Spacing, Contrast)
├─ WP-031: Emotional State (Emojis, Sliders, Gradients)
├─ WP-032: Market Context (Accordion, Regime Selector)
├─ WP-033: Trade Thesis (Tags, Screenshot, AI Notes)
├─ WP-034: Mobile Journal (Cards, Touch, Bottom-Sheet)
└─ WP-035: Workflow (Templates, Auto-Save, Forms)



### Execution Order (Recommended)
1. **WP-001 to WP-004** (Global Infrastructure – all pages depend)
2. **WP-010 to WP-016** (Dashboard – uses Global)
3. **WP-030 to WP-035** (Journal – uses Global + WP-010 styles)
4. **WP-050 to WP-056** (Chart – uses Global, can parallel to Journal)
5. **WP-070 to WP-076** (Alerts – uses Global)
6. **WP-090 to WP-097** (Settings – uses Global, lower priority)

**Total Estimated Time:** 60–90h  
**Critical Path:** Global → (Dashboard + Journal) → Chart → Alerts → Settings

---

---

## GLOBAL LAYER – Core Infrastructure

---

## WP-001: Bottom Navigation Bar (Mobile PWA)

**Status:** 🔵 Planned | **Depends On:** —

### Kontext
- Mobile-PWA braucht intuitive Bottom-Navigation
- 5 Tabs: Dashboard, Journal, Chart, Watchlist, Alerts
- Fixed, immer sichtbar auf Mobile (<768px)
- Active-State mit Farbe + Icon-Highlight

### Datei-Targets
```

src/components/MobileNav/BottomNavBar.tsx
src/components/MobileNav/BottomNavBar.css
src/layouts/MainLayout.tsx                  (integrieren)
src/types/navigation.ts                     (Navigation-Types)

```

### Schritt-für-Schritt Plan

1. **BottomNavBar-Komponente:**
   - Position: `fixed bottom-0 left-0 right-0`, z-index 40
   - Layout: Flexbox, 5 gleich breite Items, zentriert
   - Height: 64–72px Mobile, Safe-Area Padding unten
   - Background: #0F0F0F mit Border-Top #2A2A2A

2. **Icons & Labels:**
   - Nutze Lucide React: Home, BookOpen, TrendingUp, Eye, Bell
   - Icon-Größe: 24px
   - Label unter Icon: 10–12px, grau
   - Active: Primary-Farbe (#22C55E), Bold

3. **Interaktivität:**
   - onClick → React Router navigate zu Route
   - Active-Detection: `useLocation()` oder Props
   - Touch-Target: 48×48px mind. pro Item

4. **Desktop Behavior:**
   - Hidden via `hidden md:block` oder `@media (min-width: 768px) { display: none }`

### Checkliste
- [ ] BottomNavBar.tsx mit 5 Items erstellt
- [ ] Icons aus Lucide React
- [ ] Active-State Styling (Farbe, Bold)
- [ ] React Router Integration
- [ ] Safe-Area Padding (iPhone)
- [ ] Mobile-only Display
- [ ] Touch-Target ≥44×44px

### Akzeptanzkriterien
✅ Nav-Bar fixed unten, 5 Items sichtbar  
✅ Active Tab visuell unterscheidbar (Farbe)  
✅ Klick navigiert zu korrekter Page  
✅ Auf Desktop hidden  

### Codex Instructions
```

1. Erstelle src/components/MobileNav/BottomNavBar.tsx mit 5 Lucide-Icons.
2. Position: fixed bottom-0, bg #0F0F0F, border-top #2A2A2A.
3. Flex-Layout: 5 gleich breite Items, 48–56px Touch-Target.
4. Active-State: Primary-Farbe (#22C55E) für Icon + Bold Label.
5. onClick navigiert via useNavigate() zu /dashboard, /journal, /chart, /watchlist, /alerts.
6. Hidden auf Desktop (@media min-width: 768px).
7. Safe-Area Padding: padding-bottom: max(16px, env(safe-area-inset-bottom)).

```

---

## WP-002: Theme System (Dark/Light Toggle)

**Status:** 🔵 Planned | **Depends On:** —

### Kontext
- Global Dark Default, aber Light-Mode Option
- Toggle in Settings + Header-Icon (optional)
- LocalStorage Persistence
- Alle Components nutzen Theme-Kontext

### Datei-Targets
```

src/context/ThemeContext.tsx               (neu)
src/hooks/useTheme.ts                      (neu)
src/styles/theme.css                       (neu)
src/store/userSettings.ts                  (erweitern – theme field)
src/App.tsx                                (integrieren)

```

### Schritt-für-Schritt Plan

1. **ThemeContext & Hook:**
   - Context: `{ theme: 'dark' | 'light', toggleTheme: () => void }`
   - Hook: `useTheme()` → `{ theme, toggleTheme }`
   - Provider: wrap App.tsx

2. **CSS Variablen:**
   - `:root[data-theme="dark"]` → Farben (z. B. `--bg-primary: #0F0F0F`)
   - `:root[data-theme="light"]` → Helle Varianten
   - Alle Components nutzen CSS-Var statt Hard-coded Farben

3. **Persistence:**
   - Speichere in LocalStorage: `userSettings.theme`
   - On App-Start: Lade Preference oder System-Default

4. **Components:**
   - Settings Page: Theme Dropdown (Dark/Light/System)
   - Optional: Toggle-Button im Header-Icon-Bar

### Checkliste
- [ ] ThemeContext + useTheme Hook erstellt
- [ ] CSS-Variablen definiert (Dark + Light)
- [ ] HTML data-theme Attribute set
- [ ] Settings-Dropdown integriert
- [ ] LocalStorage Persistence
- [ ] App startet mit gespeicherter Preference
- [ ] Mobile + Desktop Themeing konsistent

### Akzeptanzkriterien
✅ Dark ist Default  
✅ Light-Mode schaltbar in Settings  
✅ Preference bleibt über Refresh erhalten  
✅ CSS-Variablen konsistent in allen Components  

### Codex Instructions
```

1. Erstelle src/context/ThemeContext.tsx mit useState (dark/light).
2. Exportiere useTheme Hook: { theme, toggleTheme }.
3. Erstelle src/styles/theme.css mit :root[data-theme="dark/light"] CSS-Variablen.
4. In App.tsx: <ThemeProvider> wrapper, set document.documentElement.setAttribute('data-theme', theme).
5. Lade Theme aus userSettings (localStorage) oder System-Preference.
6. Erstelle Toggle in Settings: Dropdown (Dark/Light/System) → toggleTheme().
7. Alle Hard-coded Farben in Components → CSS-Variablen umwandeln.

```

---

## WP-003: Desktop Navigation (Sidebar, Icons, Settings)

**Status:** 🔵 Planned | **Depends On:** WP-002 (Theme)

### Kontext
- Desktop Sidebar (>768px): Links fixed, collapsible
- Icons für: Dashboard, Journal, Chart, Watchlist, Alerts
- Settings-Icon ganz unten (separat)
- Active-State Highlight
- Mobile: Hidden (BottomNavBar stattdessen)

### Datei-Targets
```

src/components/DesktopNav/Sidebar.tsx
src/components/DesktopNav/Sidebar.css
src/layouts/MainLayout.tsx                 (Layout mit Sidebar)

```

### Schritt-für-Schritt Plan

1. **Sidebar Layout:**
   - Position: `fixed left-0 top-0`, width 64–80px, full-height
   - Background: #0F0F0F, border-right #2A2A2A
   - Flex-Column: Items oben, Settings-Icon unten
   - Collapsible (optional): Hamburger-Toggle → expand zu 220px

2. **Nav Items (5):**
   - Dashboard, Journal, Chart, Watchlist, Alerts
   - Icon: 24–28px, grau, auf Hover heller
   - Active: Primary-Farbe + Highlight (linker Border oder Glow)
   - Tooltip: Hover-Popup (z. B. "Dashboard")

3. **Settings Icon:**
   - Ganz unten (vor Footer oder nach Items)
   - Separate visuell (anders styled oder Spacing)
   - Klick → navigiert zu /settings oder öffnet Drawer

4. **Responsive:**
   - Desktop (>768px): Sichtbar
   - Mobile: Hidden

### Checkliste
- [ ] Sidebar.tsx erstellt mit 5 Nav-Items + Settings-Icon
- [ ] Active-State Styling (Farbe, Border/Glow)
- [ ] Icons aus Lucide React
- [ ] Tooltips on Hover
- [ ] Collapsible Toggle (optional)
- [ ] Settings-Icon separat unten platziert
- [ ] Mobile-Hidden via Media Query
- [ ] Routing Integration

### Akzeptanzkriterien
✅ Sidebar fixed links, 64–80px breit  
✅ 5 Nav-Items + Settings-Icon  
✅ Active-Item visuell unterscheidbar  
✅ Klick navigiert korrekt  
✅ Auf Mobile hidden  

### Codex Instructions
```

1. Erstelle src/components/DesktopNav/Sidebar.tsx, fixed left-0, bg #0F0F0F.
2. Layout: Flex-column mit 5 Nav-Items oben, Settings-Icon unten (margin-top: auto).
3. Nutze Lucide Icons (24px), Active-State: Primary-Farbe + border-left oder Glow.
4. Tooltip on Hover (z. B. "Dashboard", "Journal", etc.).
5. onClick navigiert via useNavigate() zu Routes.
6. Hidden auf Mobile (@media max-width: 767px).
7. Collapsible (optional): Toggle-Button → expand zu 220px mit Labels.

```

---

## WP-004: Header Bar (Alerts + Settings Integration)

**Status:** 🔵 Planned | **Depends On:** WP-002 (Theme)

### Kontext
- Top-Bar (Desktop + Mobile): Alerts Icon, Settings Icon, Dark-Mode Toggle
- Sticky, hohe z-index (z-50)
- Alerts Icon: Badge mit Anzahl (z. B. "2")
- Settings: Shortcut zur Settings-Page

### Datei-Targets
```

src/components/Header/TopBar.tsx
src/components/Header/TopBar.css
src/layouts/MainLayout.tsx                 (integrieren)

```

### Schritt-für-Schritt Plan

1. **TopBar Layout:**
   - Position: `sticky top-0`, z-index 50
   - Height: 56–64px
   - Flexbox: Logo/Title links, Icons rechts
   - Background: #0F0F0F, border-bottom #2A2A2A

2. **Right Icons:**
   - Alerts Icon (Bell) + Badge (roter Kreis mit Zahl)
   - Settings Icon (Gear)
   - Dark-Mode Toggle (Sun/Moon Icon, optional)
   - Spacing: 16–24px zwischen Icons

3. **Alerts Badge:**
   - Nur auf Desktop sichtbar (Mobile: Bottom Nav genügt)
   - Badge: roter Kreis, Zahl darin (z. B. "2" = 2 triggered)
   - Klick → navigiere zu /alerts oder zeige Alert-Panel

4. **Interaktivität:**
   - Alerts Icon Klick → /alerts
   - Settings Icon Klick → /settings oder Settings-Drawer
   - Dark-Mode Toggle → `useTheme().toggleTheme()`

### Checkliste
- [ ] TopBar.tsx mit Icons erstellt
- [ ] Alerts Badge mit Zahl
- [ ] Icons aus Lucide React
- [ ] Spacing & Layout
- [ ] Click-Handler für Navigation
- [ ] Desktop + Mobile Responsive
- [ ] Dark-Mode Toggle (optional)

### Akzeptanzkriterien
✅ TopBar sticky, Icons rechts  
✅ Alerts Badge zeigt Zahl  
✅ Klick navigiert korrekt  
✅ Theme-Toggle funktioniert  

### Codex Instructions
```

1. Erstelle src/components/Header/TopBar.tsx, sticky top-0, bg #0F0F0F.
2. Layout: Flex mit Title links, Icons rechts (Alerts, Settings, Theme-Toggle).
3. Alerts Icon: Lucide Bell + rotes Badge mit Zahl (z. B. "2").
4. Settings Icon: Lucide Gear → onClick navigiert zu /settings.
5. Dark-Mode Toggle (optional): Lucide Sun/Moon → useTheme().toggleTheme().
6. Spacing: 16px Gap zwischen Icons, 24px Padding L/R.
7. Mobile: Alerts + Settings Icons hidden (Bottom Nav zeigt sie).

```

---

---

## DASHBOARD – Analytics & Overview

---

## WP-010: Dashboard Foundation (Typography, Spacing, Global Styles)

**Status:** 🔵 Planned | **Depends On:** WP-001 to WP-004

### Kontext
- Dashboard nutzt einheitliche Spacing (24–32px zwischen Sections)
- Alle Text: links-aligned, Headers 20–24px bold, Body 14–16px
- Cards: bg #1E1E1E, rounded-xl, padding 24px
- Interaktivität: Hover-Effekte (scale ~1.05), Tooltips für KPIs

### Datei-Targets
```

src/styles/dashboard.css                   (neu)
src/components/Dashboard/DashboardPage.tsx
src/components/Dashboard/DashboardLayout.tsx

```

### Schritt-für-Schritt Plan

1. **Spacing-System:**
   - Section Gap: 32px vertikal
   - Card Padding: 24px
   - KPI-Cards: 24px Gap horizontal
   - Mobile: Etwas weniger (16–24px)

2. **Typography:**
   - Page Title: 28–32px bold
   - Section Header: 20–24px bold
   - Body: 14–16px, line-height 1.5
   - Label: 12–14px, grau
   - Alle: links-aligned

3. **Card Design:**
   - Background: #1E1E1E
   - Border: #2A2A2A (subtle)
   - Border-Radius: 12–16px
   - Padding: 24px
   - Box-Shadow: 0 2px 8px rgba(0,0,0,0.2)

4. **Hover-Effekte:**
   - Cards: scale 1.02–1.05 + Shadow erhöhen
   - Icons: Opacity/Color-Change
   - Transition: 200ms ease

5. **Responsive:**
   - Desktop: Grid 2 cols (Holdings/Wallet), full-width (KPIs, Daily Bias)
   - Mobile: Full-width stacked, KPIs horizontal scroll

### Checkliste
- [ ] Dashboard CSS-Klassen definiert
- [ ] Spacing-Utilities (gap-section, gap-card, etc.)
- [ ] Typography-Klassen (title, header, body, label)
- [ ] Card-Base Styling
- [ ] Hover-Transitions
- [ ] Responsive Grid/Layout
- [ ] Mobile Breakpoints

### Akzeptanzkriterien
✅ Spacing konsistent 24–32px  
✅ Alle Text left-aligned  
✅ Cards hover-responsiv  
✅ Mobile vollständig responsive  

### Codex Instructions
```

1. Erstelle src/styles/dashboard.css mit Spacing-Klassen
   (gap-section: 32px, card-padding: 24px, etc.).
2. Definiere Typography-Klassen: title, section-header, body, label.
3. Card-Base: bg #1E1E1E, border #2A2A2A, padding 24px, radius 12px.
4. Hover: scale 1.05, Shadow erhöhen, Transition 200ms.
5. Responsive Grid: Desktop 2-col (Grid), Mobile full-width stacked.
6. KPI-Horizontal-Scroll: overflow-x auto, gap 24px.

```

---

## WP-011: Hero KPI Bar (Sticky Top, 4–5 Cards)

**Status:** 🔵 Planned | **Depends On:** WP-010

### Kontext
- Top der Dashboard: Sticky, horizontale KPI-Cards
- 4–5 Cards: Net P&L, Win Rate, Journal Streak, Alerts Armed, Avg R:R
- Größe: 240×100px Desktop, responsive Mobile
- Hover: Scale ~1.05 + Tooltip

### Datei-Targets
```

src/components/Dashboard/KPIBar.tsx
src/components/Dashboard/KPICard.tsx
src/components/Dashboard/KPITooltip.tsx    (optional)

```

### Schritt-für-Schritt Plan

1. **KPI Bar Container:**
   - Position: `sticky top-[64px]` (unter Header)
   - Height: 120px Desktop, 100px Mobile
   - Padding: 32px L/R, 24px T/B
   - Background: #0F0F0F mit Border-Bottom
   - Flexbox: horizontal, wrap, gap 24px

2. **KPI Card Design:**
   - Size: 240×100px (Desktop), responsive smaller Mobile
   - bg #1E1E1E, border #2A2A2A, radius 12px
   - Padding: 16px
   - Content Layout:
     - Icon (20–24px) + Label (12px grau) oben links
     - Große Zahl (28–32px bold) mittig/unten
     - Sparkline oder Pfeil-Icon (grün/rot) rechts
   - Hover: scale 1.05, Shadow erhöhen

3. **Data Binding:**
   - Props: `{ icon, label, value, change, sparklineData, tooltip }`
   - Tooltip: Hover-text z. B. "Last 30 Days"

4. **KPI Set (4–5):**
   - Net P&L (USD, grün/rot je Vorzeichen)
   - Win Rate (%, 0–100)
   - Journal Streak (days, Nummer)
   - Alerts Armed (count)
   - Avg R:R (ratio, z. B. 1.5:1)

### Checkliste
- [ ] KPIBar.tsx mit Container-Layout
- [ ] KPICard.tsx mit Icon, Label, Value, Sparkline
- [ ] 4–5 KPI-Instanzen definiert
- [ ] Hover-Scale + Tooltip
- [ ] Responsive: Desktop & Mobile Sizes
- [ ] Sticky Positioning unter Header
- [ ] Data-Props korrekt strukturiert

### Akzeptanzkriterien
✅ 4–5 KPI-Cards horizontal sichtbar  
✅ Hover: scale + Tooltip  
✅ Sticky, bleibt beim Scrollen sichtbar  
✅ Mobile responsive  

### Codex Instructions
```

1. Erstelle src/components/Dashboard/KPIBar.tsx, sticky top-[64px],
   flex horizontal, gap 24px, bg #0F0F0F.
2. Erstelle src/components/Dashboard/KPICard.tsx (240×100px):
   - Layout: Icon+Label oben, große Zahl mittig, Sparkline/Pfeil rechts.
   - Hover: scale 1.05, Shadow +=1px.
   - Props: icon, label, value, change%, sparklineData, tooltip.
3. 4–5 Instanzen: Net P&L, Win Rate, Journal Streak, Alerts Armed, Avg R:R.
4. Tooltip on Hover: "Last 30 Days" (optional, z. B. mit Recharts Mini-Sparkline).
5. Mobile: Smaller Card-Size, ggfs. 2-row wrap auf sehr kleinen Screens.

```

---

## WP-012: Daily Bias / Market Intel Card

**Status:** 🔵 Planned | **Depends On:** WP-010

### Kontext
- Full-Width Card unter KPI-Bar
- Zeigt aggregierte Bias aus Onchain + Crypto-Twitter Sentiment
- Content: Header, Bias-Tag, 3–5 Bullet Points, Footer-Buttons + optional Chart-Snapshot
- Update-Button: Refresh Sentiment

### Datei-Targets
```

src/components/Dashboard/DailyBiasCard.tsx
src/components/Dashboard/BiasTag.tsx       (badge component)
src/api/marketIntelligence.ts              (data fetching)

```

### Schritt-für-Schritt Plan

1. **Card Layout:**
   - Padding: 24px, rounded-xl, bg #1E1E1E
   - Header: "Daily Bias / Market Intel" + Update-Button (Lucide RotateCw)
   - Content: Bias-Tag + 3–5 Bullets + optional Mini-Chart
   - Footer: 2 Buttons (View Full Analysis, Update Sentiment)

2. **Bias-Tag:**
   - Pills: "Bullish", "Bearish", "Neutral"
   - Farbe je Bias: Grün, Rot, Grau
   - Icon optional

3. **Content (Bullets):**
   - Kurze Insights (z. B. "SOL above $210 support", "BTC funding rates cooling")
   - Timestamp: Wann zuletzt geupdatet

4. **Optional: Chart Snapshot:**
   - Mini-1D-Chart-Preview (z. B. TradingView Lightweight Chart)
   - Oder Screenshot/Image von aktuellem State

5. **Buttons:**
   - "View Full Analysis": Navigiert zu Detail-Seite oder Modal
   - "Update Sentiment": Trigged Refresh API-Call

### Checkliste
- [ ] DailyBiasCard.tsx erstellt
- [ ] Bias-Tag Component mit Farben
- [ ] 3–5 Bullet-Content
- [ ] Update-Button mit Loading-State
- [ ] Footer-Buttons integriert
- [ ] Optional: Mini-Chart/Snapshot
- [ ] Responsive Design

### Akzeptanzkriterien
✅ Card Full-Width unter KPI-Bar  
✅ Bias-Tag visuell unterscheidbar  
✅ Buttons funktionieren  
✅ Update-Refresh zeigt Loading-State  

### Codex Instructions
```

1. Erstelle src/components/Dashboard/DailyBiasCard.tsx, full-width, padding 24px.
2. Header: Titel + Lucide RotateCw-Button (Update).
3. Bias-Tag: Pills (Bullish/Bearish/Neutral) mit Farben (Grün/Rot/Grau).
4. Content: 3–5 Bullet-Insights + Timestamp "Updated at HH:MM".
5. Optional: Mini-Chart oder Image-Placeholder.
6. Footer: 2 Buttons (View Analysis, Update) mit Click-Handler.
7. Update-Button: Loading-State, dann Refresh Data (API-Call).

```

---

## WP-013: Holdings / Wallet Snapshot

**Status:** 🔵 Planned | **Depends On:** WP-010

### Kontext
- Grid: 2 cols Desktop, 1 col Mobile
- Wallet Connected: Tabelle mit Symbol, Amount, Value, Change%
- Wallet Not Connected: Placeholder + CTA
- Row Hover: Highlight
- Farben: Grün (positive), Rot (negative Change)

### Datei-Targets
```

src/components/Dashboard/HoldingsCard.tsx
src/components/Dashboard/WalletSnapshot.tsx
src/api/wallet.ts                          (fetch holdings)

```

### Schritt-für-Schritt Plan

1. **Card Layout:**
   - Padding: 24px, rounded-xl, bg #1E1E1E
   - Header: "Holdings / Wallet Snapshot" + Connect-Button (falls nicht connected)
   - Body: Tabelle oder Scrollable List

2. **Wallet Connected – Tabelle:**
   - Columns: Symbol | Amount | Value ($) | Change (%) | Action
   - Row Height: 20px Spacing, Hover: bg #2A2A2A
   - Farben: Green (+), Red (−)
   - Klick Row → Watchlist oder Detail-View

3. **Wallet Not Connected:**
   - Placeholder Image/Icon
   - Text: "Connect wallet to see your holdings"
   - Button: "Connect Wallet" → navigiert zu Settings oder WalletModal

4. **Responsive:**
   - Desktop: 2-col Grid (oder Full-Width, je Layout)
   - Mobile: 1-col, stacked

### Checkliste
- [ ] HoldingsCard.tsx mit Tabelle erstellt
- [ ] Wallet-Status Check (connected/not connected)
- [ ] Tabelle: Symbol, Amount, Value, Change%
- [ ] Row Hover-Effect
- [ ] Farben: Green/Red basierend auf Change
- [ ] Connect-CTA für Not Connected
- [ ] Responsive Grid Layout

### Akzeptanzkriterien
✅ Tabelle zeigt Holdings wenn Connected  
✅ Placeholder + CTA wenn Not Connected  
✅ Row Hover sichtbar  
✅ Responsive Layout  

### Codex Instructions
```

1. Erstelle src/components/Dashboard/HoldingsCard.tsx, bg #1E1E1E, padding 24px.
2. Tabelle (falls Connected): Symbol | Amount | Value | Change% | Action.
3. Row-Hover: bg #2A2A2A, Cursor pointer.
4. Farben: Green (#22C55E) für +Change, Red (#EF4444) für −Change.
5. Klick Row: Kann detail view öffnen oder Watchlist navigieren.
6. Not Connected: Placeholder + Button "Connect Wallet" → WalletModal/Settings.
7. Responsive: Desktop 2-col, Mobile 1-col.

```

---

## WP-014: Trade Log / Recent Entries

**Status:** 🔵 Planned | **Depends On:** WP-010

### Kontext
- Card: Recent Trades (letzte 10–20 Einträge)
- Mini-Cards mit Symbol, Entry/Exit, P&L, Status
- Left Border: grün (profit) oder rot (loss)
- Click → Journal Detail-View
- Pagination/Load More: >10 Einträge

### Datei-Targets
```

src/components/Dashboard/TradeLogCard.tsx
src/components/Dashboard/TradeLogEntry.tsx
src/api/journalEntries.ts                  (fetch recent trades)

```

### Schritt-für-Schritt Plan

1. **Card Layout:**
   - Padding: 24px, rounded-xl, bg #1E1E1E
   - Header: "Recent Trades" + Button "Log Entry"
   - Body: Liste von Mini-Cards, scrollbar bei Overflow

2. **Mini-Card Design:**
   - Left Border: 4px (grün = profit, rot = loss)
   - Content: Symbol/Pair | Entry Price | Exit/Current | P&L $$$
   - Secondary: Date, Status (Open/Closed)
   - Hover: scale 1.02, Cursor pointer
   - Klick → /journal/:id

3. **Empty State:**
   - Icon + Text: "No trades logged yet"
   - Button: "Mark Entry" → Öffnet Journal New Trade Modal

4. **Pagination:**
   - Show first 10, dann "Load More" Button
   - Oder Infinite Scroll

### Checkliste
- [ ] TradeLogCard.tsx mit Header + Body
- [ ] TradeLogEntry.tsx Mini-Card
- [ ] Left-Border Styling (grün/rot)
- [ ] Hover-Effect + Click Handler
- [ ] Empty State
- [ ] Pagination / Load More
- [ ] Date + Status Display

### Akzeptanzkriterien
✅ Recent Trades angezeigt  
✅ Left Border grün/rot  
✅ Klick navigiert zu Journal Detail  
✅ Empty State informativ  

### Codex Instructions
```

1. Erstelle src/components/Dashboard/TradeLogCard.tsx mit Header + Body.
2. Erstelle src/components/Dashboard/TradeLogEntry.tsx (Mini-Card):
   - Left Border 4px: grün (#22C55E) für profit, rot (#EF4444) für loss.
   - Content: Symbol | Entry | Exit | P&L | Date | Status.
3. Hover: scale 1.02, cursor pointer, onClick navigiert zu /journal/:id.
4. Empty State: Icon + "No trades yet" + Button "Mark Entry".
5. Pagination: Show 10, dann "Load More" Button.
6. Fetch data via journalEntries API.

```

---

## WP-015: Recent Journal Entries & Alerts Overview

**Status:** 🔵 Planned | **Depends On:** WP-010

### Kontext
- Bottom Dashboard Section
- 2 Bereiche: Recent Journal Entries (3–5 Cards) + Alerts Overview
- Journal Entries: Horizontal Scroll auf Mobile, Grid auf Desktop
- Alerts: Stats + Link zu /alerts

### Datei-Targets
```

src/components/Dashboard/RecentEntriesSection.tsx
src/components/Dashboard/AlertsOverviewWidget.tsx

```

### Schritt-für-Schritt Plan

1. **Recent Journal Entries:**
   - Layout: Grid 3–4 cols Desktop, horizontal scroll Mobile
   - Cards: Thumbnail, Title, Date, Quick Preview (first 50 chars)
   - Klick → /journal/:id
   - "View All" Button → /journal

2. **Alerts Overview:**
   - Stats: "6 Armed · 2 Triggered · 1 Paused"
   - Icons: Farbig je Status
   - Button: "View All Alerts" → /alerts

3. **Responsive:**
   - Desktop: Nebeneinander oder Untereinander (je Space)
   - Mobile: Stacked, Journal Scroll horizontal

### Checkliste
- [ ] RecentEntriesSection.tsx
- [ ] AlertsOverviewWidget.tsx
- [ ] Grid Layout (Desktop) + Scroll (Mobile)
- [ ] Journal Entry Cards mit Klick
- [ ] Alerts Stats Display
- [ ] "View All" Buttons

### Akzeptanzkriterien
✅ 3–5 Recent Journal Entries sichtbar  
✅ Mobile: Horizontal Scroll  
✅ Alerts Stats angezeigt  
✅ "View All" navigiert korrekt  

### Codex Instructions
```

1. Erstelle src/components/Dashboard/RecentEntriesSection.tsx.
2. Journal Entries: Grid 3–4 cols Desktop, scroll Mobile, onClick → /journal/:id.
3. Erstelle src/components/Dashboard/AlertsOverviewWidget.tsx.
4. Alerts Stats: Badge/Stat "6 Armed · 2 Triggered · 1 Paused" mit Icons.
5. Button "View All Alerts" → /alerts.
6. Responsive: Mobile stacked, Desktop side-by-side oder untereinander.

```

---

## WP-016: Quick Actions (FAB, Mobile Layout)

**Status:** 🔵 Planned | **Depends On:** WP-010 to WP-015

### Kontext
- Floating Action Button (FAB): Unten rechts
- Aktionen: + Log Entry (Journal), + Alert
- Mobile: Mini-FAB-Menu mit 2 Items
- Desktop: Optional (oder Static Buttons)

### Datei-Targets
```

src/components/Dashboard/FAB.tsx
src/components/Dashboard/FABMenu.tsx

```

### Schritt-für-Schritt Plan

1. **FAB Container:**
   - Position: `fixed bottom-20 right-6` (oder Bottom-Safe-Area)
   - Size: 56×56px (standard)
   - Background: Primary (#22C55E)
   - Icon: + (Plus)
   - Hover: Scale 1.1, Shadow erhöhen
   - Click → Toggle Menu

2. **FAB Menu (on Click):**
   - 2 Items: "Log Entry" (Journal), "Create Alert"
   - Layout: Vertical stack above FAB
   - Icons: BookOpen, Bell
   - Labels: Hover-Tooltip oder always show
   - Each Click: Execute Action (open Modal) + close Menu

3. **Actions:**
   - Log Entry: Opens NewTradeModal (from Journal)
   - Create Alert: Opens NewAlertModal (from Alerts)

### Checkliste
- [ ] FAB.tsx mit Plus-Icon
- [ ] FAB Menu mit 2 Items
- [ ] Toggle on FAB Click
- [ ] Actions (navigate/open Modals)
- [ ] Mobile: Visible & Accessible
- [ ] Desktop: Optional oder Hidden

### Akzeptanzkriterien
✅ FAB unten rechts sichtbar  
✅ Click öffnet Menu  
✅ Menu Items navigieren korrekt  
✅ Mobile-friendly  

### Codex Instructions
```

1. Erstelle src/components/Dashboard/FAB.tsx, fixed bottom-20 right-6.
2. Plus-Icon, bg Primary (#22C55E), size 56×56px.
3. onClick toggle FABMenu visibility.
4. Erstelle src/components/Dashboard/FABMenu.tsx:
   - 2 Items: "Log Entry" (BookOpen), "Create Alert" (Bell).
   - Vertical layout above FAB, mit Labels/Tooltips.
5. "Log Entry" opens NewTradeModal.
6. "Create Alert" opens NewAlertModal.
7. Menu closes nach Action oder outside-click.

```

---

---

## JOURNAL – Trade Tracking & Psychology

*(Note: WP-030 bis WP-035 – referenziert auf die ursprüngliche Taskliste)*

---

## WP-030: Foundation – Typography, Spacing & Contrast

**Status:** 🔵 Planned | **Depends On:** WP-010

### Kontext
- Konsistente Typography mit Dashboard (aber Journal-spezifisch)
- Spacing: mind. 16–24px zwischen Cards/Sections
- Kontrast: WCAG-AA (#FFFFFF auf #121212)

### Datei-Targets
```

src/styles/journal.css
src/components/Journal/JournalCard.tsx
src/components/Journal/JournalForm.tsx

```

### Schritt-für-Schritt Plan
*(identisch zu ursprünglichem WP-001)*

1. Typography: Body 14–16px, Headers 18–20px, Sans-serif
2. Spacing: 16–24px Gap, 24px Padding in Cards
3. Kontrast: WCAG-AA verifizieren
4. Alle Texte links-aligned

### Checkliste
- [ ] Typography definiert
- [ ] Spacing-Klassen
- [ ] Kontrast-Check
- [ ] Components aktualisiert

### Akzeptanzkriterien
✅ Spacing einheitlich  
✅ Alle Text links-aligned  
✅ WCAG-AA Kontrast  

### Codex Instructions
```

1. Erstelle src/styles/journal.css mit Body 14–16px, Headers 18–20px.
2. Spacing-Klassen: gap-base (16px), gap-lg (24px), padding-card (24px).
3. Alle Texte text-align: left.
4. WCAG-AA Kontrast testen.

```

---

## WP-031: Emotional State – Emojis, Sliders & Gradients

**Status:** 🔵 Planned | **Depends On:** WP-030

### Kontext
- Dropdown → 3–5 klickbare Emojis (customizable)
- Confidence Slider 0–100% mit Gradient (Rot → Gelb → Grün)
- Optional: Conviction/Pattern-Quality Slider (hidden by default, toggle)
- All sliders: einheitlicher Style

### Datei-Targets
```

src/components/Journal/EmojiSelector.tsx
src/components/common/GradientSlider.tsx
src/components/Journal/EmotionalStateCard.tsx

```

### Schritt-für-Schritt Plan
*(identisch zu ursprünglichem WP-003)*

1. EmojiSelector: 3–5 Buttons, custom via Settings
2. GradientSlider: linear-gradient(90deg, #FF4444, #FFFF00, #00FF00)
3. Confidence: immer sichtbar
4. Conviction/Pattern: Optional toggle

### Checkliste
- [ ] EmojiSelector.tsx
- [ ] GradientSlider.tsx
- [ ] Confidence immer sichtbar
- [ ] Optional Sliders togglebar
- [ ] User-Emojis gespeichert

### Akzeptanzkriterien
✅ Emojis anklickbar  
✅ Slider mit Gradient  
✅ Optional Sliders funktionieren  

### Codex Instructions
```

1. Erstelle EmojiSelector mit 3–5 Buttons (customizable).
2. Erstelle GradientSlider mit Rot→Gelb→Grün Gradient.
3. Confidence Slider immer sichtbar.
4. Toggle Button für Conviction/Pattern Quality (default hidden).
5. User-Emojis aus Settings laden.

```

---

## WP-032: Market Context – Accordion Refactor

**Status:** 🔵 Planned | **Depends On:** WP-030

### Kontext
- Accordion mit flexibler Höhe
- Desktop: Dropdown für Current Market Regime
- Mobile: Horizontale Toggle-Buttons für Regimes

### Datei-Targets
```

src/components/Journal/MarketContextAccordion.tsx
src/components/Journal/MarketRegimeSelector.tsx

```

### Schritt-für-Schritt Plan
*(identisch zu ursprünglichem WP-004)*

1. Accordion: Header schmal, Body flex, variable Höhe
2. Desktop: Dropdown
3. Mobile: Horizontal Buttons

### Checkliste
- [ ] Accordion refactored
- [ ] Desktop Dropdown
- [ ] Mobile Buttons
- [ ] Responsive Toggle

### Akzeptanzkriterien
✅ Accordion öffnet/schließt  
✅ Desktop Dropdown  
✅ Mobile Buttons  

### Codex Instructions
```

1. Refaktoriere Accordion: Header schmal, Body flex, variable height.
2. Desktop: Dropdown für Market Regime.
3. Mobile: Horizontal toggle buttons für Regimes.
4. Media Query: @media max-width: 768px.

```

---

## WP-033: Trade Thesis – Tags & AI Features

**Status:** 🔵 Planned | **Depends On:** WP-030

### Kontext
- Tags für Psychologie/Journaling (Autocomplete)
- "Chart Screenshot" Button
- "Generate Notes" Button (AI)

### Datei-Targets
```

src/components/Journal/TradeTthesisCard.tsx
src/components/Journal/TagInput.tsx
src/components/Journal/AINotesGenerator.tsx

```

### Schritt-für-Schritt Plan
*(identisch zu ursprünglichem WP-005)*

1. TagInput mit Autocomplete + Chips
2. Screenshot Button mit Loading
3. AI Generator mit Modal/Output

### Checkliste
- [ ] TagInput.tsx
- [ ] Screenshot Button
- [ ] AI Generator
- [ ] Error Handling

### Akzeptanzkriterien
✅ Tags eingeben/entfernen  
✅ Screenshot Loading  
✅ AI Notes anzeigen  

### Codex Instructions
```

1. Erstelle TagInput mit Autocomplete + Chips.
2. Screenshot Button mit Loading/Error States.
3. AI Generator: Button → Modal/Output.
4. Tags im Schema speichern.

```

---

## WP-034: Mobile Journal – Cards, Touch, Bottom-Sheet

**Status:** 🔵 Planned | **Depends On:** WP-030, WP-031

### Kontext
- Full-Width Cards, Spacing 16px
- Large Slider Thumbs (≥32px)
- Bottom-Sheet für Templates
- Auto-Apply Templates

### Datei-Targets
```

src/components/Journal/JournalCard.tsx
src/components/Journal/TemplateBottomSheet.tsx
src/components/common/BottomSheet.tsx

```

### Schritt-für-Schritt Plan
*(identisch zu ursprünglichem WP-006)*

1. Full-Width Cards: 100% − 16px
2. Slider: Thumb ≥32px, Height ≥24px
3. Bottom-Sheet: Drag-Handle, smooth animation
4. Auto-Apply: Kein extra Button

### Checkliste
- [ ] Full-Width Cards
- [ ] Large Sliders
- [ ] BottomSheet.tsx
- [ ] Auto-Apply
- [ ] Smooth Scroll

### Akzeptanzkriterien
✅ Cards Full-Width  
✅ Slider Touch-friendly  
✅ Bottom-Sheet smooth  
✅ Auto-Apply funktioniert  

### Codex Instructions
```

1. Refaktoriere Cards: width 100% − 16px, gap 16px.
2. Sliders: Thumb ≥32px, Height ≥24px.
3. Erstelle BottomSheet.tsx mit Drag-Handle.
4. TemplateBottomSheet: List + Auto-Apply on Select.

```

---

## WP-035: Journal Workflow – Templates, Auto-Save, Forms

**Status:** 🔵 Planned | **Depends On:** WP-030, WP-031, WP-033, WP-034

### Kontext
- Auto-Save alle 30s mit UI-Feedback
- Required Fields: Sternchen + rote Border
- New Trade Modal mit Template-Selection
- Textfield Autocomplete (Psychologie + Charts)

### Datei-Targets
```

src/hooks/useAutoSave.ts
src/components/Journal/NewTradeModal.tsx
src/components/Journal/TextfieldWithAutocomplete.tsx
src/components/Journal/JournalForm.tsx

```

### Schritt-für-Schritt Plan
*(identisch zu ursprünglichem WP-007)*

1. useAutoSave: 30s Interval, "Saved at" UI
2. Form Validation: Required, Errors
3. NewTradeModal: Template Selection + Pre-Fill
4. Autocomplete: @ Trigger oder Character-based

### Checkliste
- [ ] useAutoSave Hook
- [ ] Form Validation
- [ ] NewTradeModal
- [ ] Autocomplete
- [ ] Draft Persistence

### Akzeptanzkriterien
✅ Auto-Save alle 30s  
✅ Required Fields validiert  
✅ Modal + Template Pre-Fill  
✅ Autocomplete zeigt Vorschläge  

### Codex Instructions
```

1. Erstelle useAutoSave Hook: 30s Interval, "Saved at" UI.
2. Form Validation: Required (*), rote Borders, Error-Messages.
3. NewTradeModal: Template Selector + Pre-Fill.
4. TextfieldWithAutocomplete: @ Trigger oder character-based.
5. Drafts in State/Storage speichern.

```

---

---

## CHART – Advanced Visualization & Replay

---

## WP-050: Chart Foundation – Layout, Sidebar, Top-Bar

**Status:** 🔵 Planned | **Depends On:** WP-002, WP-003

### Kontext
- Layout: Sidebar (left), Main (center), Toolbar (right), Bottom Panel
- Top-Bar sticky: Timeframe Toggle, Refresh, Replay, Export
- Full-height Chart Area
- Responsive: Mobile collapsible Sidebar/Toolbar

### Datei-Targets
```

src/components/Chart/ChartLayout.tsx
src/components/Chart/ChartSidebar.tsx
src/components/Chart/ChartTopBar.tsx
src/components/Chart/ChartToolbar.tsx
src/components/Chart/ChartBottomPanel.tsx

```

### Schritt-für-Schritt Plan

1. **ChartLayout:**
   - Flex: Sidebar (left, width 240px) + Main (flex 1) + Toolbar (right, width 200px)
   - Top-Bar: sticky, full-width, height 56px
   - Bottom-Panel: sticky bottom, collapsible, height 120–200px
   - Mobile: Sidebar/Toolbar hidden, use Hamburger/Bottom-Sheet

2. **Top-Bar:**
   - Left: Timeframe Toggle (1H, 4H, 1D, etc.)
   - Center: Title "SOL/USDC · 1h – Live"
   - Right: Refresh, Replay, Export buttons

3. **Sidebar (left):**
   - Symbol Search/Selection
   - Favorites / Watchlist
   - Indicators List (expandable)
   - Collapsible on Mobile

4. **Toolbar (right):**
   - Indicators Section (add, edit, delete)
   - Drawings Tools
   - Alerts Manager
   - Auto-collapse Toggle (Mobile)

5. **Bottom-Panel:**
   - 2 Cards: Grok Pulse + Journal Notes
   - Collapsible Accordion
   - Sticky Bottom


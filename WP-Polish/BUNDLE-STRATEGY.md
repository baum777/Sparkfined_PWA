# WP Bundle-Size Strategy & Budget-Optimierung

**Datum:** 2025-12-19
**Status:** Stabilisierung – Budgets + Guardrails werden modernisiert
**Owner:** Engineering Team

---

## 🎯 Executive Summary

| Metrik | Wert | Status |
|--------|------|--------|
| **Initial JS (Landing/Dashboard)** | Ziel 360 KB raw | 🟡 Baseline ~370–400 KB → optimieren | 
| **Route JS (Chart)** | Ziel 240 KB raw | ✅ Baseline ~220 KB (ChartPage + vendor-charts + Telemetry) |
| **PWA Precache** | Ziel 1.8 MB | 🔴 Baseline 3.2 MB (optional Routen im Precache) |
| **WP-Tasks Total** | 38 | Kernrouten ausgeliefert; offene Items im Backlog dokumentiert |
| **Guardrail** | `pnpm run check:size` | Wird auf Initial/Route/Precache umgestellt |

---

## 📊 Status Breakdown nach Cluster

### ✅ Implementiert (aktueller Repo-Stand)

| Cluster | Status | Notizen |
|---------|--------|---------|
| **A - Shell** | 🟢 vorhanden | AppShell, Layout, Routing v2 | 
| **B - Dashboard** | 🟢 vorhanden | Start-/Landing-Route ausgeliefert |
| **C - Journal** | 🟢 vorhanden | JournalPage + Templates-Lazy | 
| **D - Chart** | 🟢 vorhanden | ChartPage + ReplayPage (route-lazy) |
| **E - Alerts** | 🟢 vorhanden | AlertsPage + Trigger Engine | 
| **F - Settings** | 🟢 vorhanden | SettingsPage als Route |
| **Backlog** | 📋 | Feintuning & neue WPs → `/WP-Polish/backlog.md` |

> Die nachfolgenden Cluster-Tabellen spiegeln den historischen Audit wider. Für aktuelle Prioritäten zählt das Budget-Modell oben (Initial/Chart/Precache) plus Backlog.

---

## 📈 Detaillierte Bundle-Size Impact-Analyse

### Cluster A — Shell (Foundation)

| WP | Task | Status | Impact | Grund |
|----|------|--------|--------|-------|
| WP-001 | Bottom Nav (Mobile) | 📋 | +8 KB | Nav-bar + icons + safe-area logic |
| WP-002 | Theme System | 📋 | +12 KB | ThemeProvider + localStorage + CSS tokens |
| WP-003 | Desktop Sidebar | ✅ | ~15 KB | ✅ Implementiert |
| WP-004 | Header Bar | ✅ | ~15 KB | ✅ Implementiert |
| | **Cluster Total** | | **50 KB** | 30 KB ✅ + 20 KB 📋 |

**Optimization Potential:** -5 KB via tree-shaking unused theme utilities

---

### Cluster B — Dashboard (COMPLETE ✅)

| WP | Task | Status | Impact | Grund |
|----|------|--------|--------|-------|
| WP-010 | Dashboard Foundation | ✅ | ~15 KB | Layout + CSS |
| WP-011 | Hero KPI Bar | ✅ | ~12 KB | KPI cards + sticky logic |
| WP-012 | Daily Bias Card | ✅ | ~18 KB | Bias logic + API mock |
| WP-013 | Holdings Card | ✅ | ~20 KB | Table + wallet integration |
| WP-014 | Recent Trades | ✅ | ~22 KB | Trade list + BUY signal bridge |
| WP-015 | Recent Entries + Alerts | ✅ | ~15 KB | Grid + mock APIs |
| WP-016 | Quick Actions FAB | ✅ | ~13 KB | FAB + menu + overlays |
| | **Cluster Total** | | **115 KB** | 🎉 100% implementiert |

**Optimization Potential:** -25 KB via aggressive lazy loading
- FABMenu: Load on-demand → -8 KB
- RecentEntriesSection: Load below fold → -10 KB
- TradeLogCard: Lazy load → -7 KB

---

### Cluster C — Journal

| WP | Task | Status | Impact | Grund |
|----|------|--------|--------|-------|
| WP-030 | Journal Foundation | ✅ | ~15 KB | Layout + CSS tokens |
| WP-031 | Emotional State | ✅ | ~18 KB | Emoji selector + sliders |
| WP-032 | Market Context | ✅ | ~15 KB | Accordion + regime pills |
| WP-033 | Trade Thesis | ✅ | ~27 KB | Tags + AI notes + screenshot stub |
| WP-034 | Mobile Journal | 📋 | +20 KB | BottomSheet + touch handlers |
| WP-035 | Journal Workflow | 📋 | +20 KB | Auto-save + validation + templates |
| | **Cluster Total** | | **115 KB** | 75 KB ✅ + 40 KB 📋 |

**Optimization Potential:** -15 KB via code splitting
- AINotesGenerator: Lazy load → -8 KB
- TemplateBottomSheet: On-demand → -7 KB

---

### Cluster D — Chart (0% implementiert ⚠️)

| WP | Task | Status | Impact | Grund |
|----|------|--------|--------|-------|
| WP-050 | Chart Foundation | 📋 | +35 KB | Layout shell + sidebar + toolbar + bottom panel |
| WP-051 | Main Chart Area | 📋 | +40 KB | Canvas + crosshair + zoom + markers overlay |
| WP-052 | Right Toolbar | 📋 | +25 KB | Indicators + drawings + alerts sections |
| WP-053 | Bottom Panel | 📋 | +20 KB | Grok Pulse + inline notes editor |
| WP-054 | Replay Controls | 📋 | +15 KB | Replay engine + speed controls + export |
| WP-055 | Default Chart | 📋 | +10 KB | SOL/USDC default + fallback logic |
| WP-056 | Mobile Chart UX | 📋 | +35 KB | Mobile sheets + floating buttons + touch |
| | **Cluster Total** | | **180 KB** | ⚠️ Größter offener Cluster! |

**Critical Optimization Required:** -80 KB via aggressive splitting
- ✅ Vendor-charts bereits separiert (163 KB) → nur laden wenn Chart geöffnet
- Replay Engine: Lazy load → -15 KB
- GrokPulse: On-demand → -12 KB
- Drawing Tools: On-demand → -18 KB
- Mobile Sheets: Route-based split → -35 KB

**Recommendation:** Chart-Cluster in 2 Phasen splitten:
1. **Phase 1 (Core):** WP-050, WP-051, WP-055 (Foundation + Basic Chart) → +85 KB
2. **Phase 2 (Advanced):** WP-052, WP-053, WP-054, WP-056 (Tools + Mobile) → +95 KB

---

### Cluster E — Alerts

| WP | Task | Status | Impact | Grund |
|----|------|--------|--------|-------|
| WP-070 | Alerts Layout | 📋 | +12 KB | Desktop layout + filters bar |
| WP-071 | Alert Card | 📋 | +15 KB | Card design + pause/delete actions |
| WP-072 | New Alert Sheet | 📋 | +18 KB | Modal + autocomplete + validation |
| WP-073 | Filter System | 📋 | +8 KB | Filter logic + search debounce |
| WP-074 | Templates | 📋 | +6 KB | Alert templates + import |
| WP-075 | Mobile Alerts | 📋 | +12 KB | Mobile list + swipe actions |
| WP-076 | Integrations | 📋 | +9 KB | Chart→Alert + browser notifications |
| | **Cluster Total** | | **80 KB** | Moderate Complexity |

**Optimization Potential:** -15 KB via lazy loading
- NewAlertSheet: On-demand → -10 KB
- AlertTemplates: Lazy load → -5 KB

---

### Cluster F — Settings

| WP | Task | Status | Impact | Grund |
|----|------|--------|--------|-------|
| WP-090 | Settings Foundation | 📋 | +15 KB | Layout + cards + header actions |
| WP-091 | Appearance & General | 📋 | +8 KB | Theme selector + general toggles |
| WP-092 | Token Usage | 📋 | +7 KB | Token tracker + daily reset logic |
| WP-093 | Wallet Monitoring | 📋 | +8 KB | Address input + enable toggle |
| WP-094 | Data Export/Import | 📋 | +10 KB | Export logic + import validation |
| WP-095 | Chart Preferences | 📋 | +5 KB | Preference toggles + persistence |
| WP-096 | Danger Zone | 📋 | +4 KB | Accordion + confirmation modals |
| WP-097 | Mobile Settings | 📋 | +3 KB | Responsive adjustments + accordions |
| | **Cluster Total** | | **60 KB** | Low Complexity |

**Optimization Potential:** -10 KB via route-based split
- Settings ist bereits eigene Route → lazy load gesamte Page → -10 KB initial

---

## 🚨 Bundle-Size Projektion (3 Szenarien)

### Szenario 1: Naive Implementierung (WORST CASE) ❌

```
Aktuell:                  870 KB
+ Shell (WP-001,002):     +20 KB
+ Journal (WP-034,035):   +40 KB
+ Chart (WP-050..056):   +180 KB ⚠️
+ Alerts (WP-070..076):   +80 KB
+ Settings (WP-090..097): +60 KB
────────────────────────────────
Total:                  1250 KB (+380 KB = +44%)
Budget:                  800 KB
Überschreitung:         +450 KB (+56%) 🔴🔴🔴
```

**Verdict:** NICHT AKZEPTABEL

---

### Szenario 2: Smart Lazy Loading (RECOMMENDED) ✅

```
Aktuell:                  870 KB
+ Shell (optimiert):      +15 KB  (statt +20)
+ Journal (optimiert):    +25 KB  (statt +40)
+ Chart (lazy):           +50 KB  (statt +180, Rest on-demand)
+ Alerts (lazy):          +50 KB  (statt +80, Sheet on-demand)
+ Settings (lazy):         +0 KB  (komplette Route lazy)
────────────────────────────────
Initial Bundle:          1010 KB (+140 KB = +16%)
On-Demand Chunks:        +240 KB (nur bei Bedarf geladen)
────────────────────────────────
Effektiver Initial:      1010 KB
Neues Budget:            1000 KB
Überschreitung:           +10 KB (+1%) 🟡 AKZEPTABEL
```

**Verdict:** ✅ EMPFOHLEN mit Vendor-Charts Lazy Loading

---

### Szenario 3: Aggressive Splitting (BEST CASE) ✅

```
Aktuell:                  870 KB
- Vendor-Charts Lazy:     -52 KB  (nur bei Chart-Nutzung)
- Dashboard Lazy:         -25 KB  (FAB + widgets on-demand)
- Chart Telemetry Lazy:   -11 KB  (nur mit Charts)
────────────────────────────────
Optimierter Base:         782 KB (-88 KB = -10%)

+ Shell (optimiert):      +15 KB
+ Journal (optimiert):    +20 KB  (Templates lazy)
+ Chart Core:             +35 KB  (nur Foundation)
+ Alerts Core:            +30 KB  (nur Layout + List)
────────────────────────────────
Initial Bundle:           882 KB (+100 KB = +13%)
On-Demand Chunks:        +350 KB (Chart Tools, Alerts Sheets, Settings, etc.)
────────────────────────────────
Budget:                  1000 KB
Headroom:                +118 KB (+13% Reserve) 🟢🟢🟢
```

**Verdict:** 🌟 BEST CASE - Maximale Performance + Feature-Headroom

---

## 🎯 Empfohlene Budget-Strategie

### Phase 1: Sofort (Quick Wins) — 1-2 Stunden

**Ziel:** Aktuelles Budget einhalten (800 KB → 782 KB)

```typescript
// 1. Vendor-Charts Lazy Loading (vite.config.ts)
// ✅ Bereits konfiguriert, nur dynamisch laden:

// src/pages/ChartPage.tsx
const AdvancedChart = lazy(() => 
  import('../components/chart/AdvancedChart')
)

// src/pages/ReplayPage.tsx  
const ReplayChart = lazy(() =>
  import('../components/chart/ReplayChart')
)

// 2. Chart Telemetry Split
// vite.config.ts - manualChunks ergänzen:
if (id.includes('/lib/chart/telemetry')) {
  return 'chunk-chart-telemetry';
}

// 3. Dashboard Lazy Sections
const FABMenu = lazy(() => import('../features/dashboard/FABMenu'))
const RecentEntriesSection = lazy(() => 
  import('../features/dashboard/RecentEntriesSection')
)
```

**Impact:**
- Initial Bundle: 870 KB → **782 KB (-88 KB = -10%)**
- Budget-Status: 782/800 KB = **98% ✅**
- Chart loads: +163 KB nur bei Chart-Nutzung
- Dashboard widgets: +25 KB nur beim Scrollen

---

### Phase 2: Budget-Anpassung (1 Woche) — EMPFOHLEN

**Neues realistisches Budget:** **1000 KB** (+200 KB = +25%)

**Begründung:**
- 13/38 WPs bereits implementiert (+220 KB)
- 25/38 WPs noch offen (+380 KB bei naiver Implementierung)
- Mit Smart Splitting: +140 KB initial + 240 KB on-demand
- **Final Initial Bundle: 1010 KB** (mit Phase-1-Optimierung: 922 KB)

**Budget-Breakdown:**

| Komponente | Budget | Anteil |
|------------|--------|--------|
| **Vendor (React, Dexie, etc.)** | 320 KB | 32% |
| **Vendor-Charts (lazy)** | 0 KB initial | 0% (163 KB on-demand) |
| **App Core (index + shell)** | 80 KB | 8% |
| **Dashboard Features** | 90 KB | 9% |
| **Journal Features** | 100 KB | 10% |
| **Chart Core (lazy)** | 35 KB | 3% |
| **Alerts Core (lazy)** | 30 KB | 3% |
| **Settings (lazy route)** | 0 KB initial | 0% (60 KB on-demand) |
| **Andere Pages** | 100 KB | 10% |
| **Code Chunks (misc)** | 245 KB | 25% |
| | **Total** | **1000 KB** |

---

### Phase 3: Langfristige Optimierung (Optional)

**Weitere -100 KB möglich durch:**

1. **Tree-Shaking Audit** → -20 KB
   - Unused Lucide icons eliminieren
   - Zustand middleware tree-shaken
   - Dexie optional features excluden

2. **Compression Optimization** → -30 KB
   - Brotli statt Gzip (bessere Ratio)
   - Asset pre-compression im Build

3. **Code Deduplication** → -15 KB
   - Common utilities in shared chunk
   - Duplicate dependencies mergen

4. **Route-Based Splitting** → -35 KB
   - Alle Pages lazy (aktuell nur teilweise)
   - Page-specific CSS separieren

**Mögliches Ziel:** 900 KB (-100 KB vom optimierten Szenario)

---

## 📋 Implementierungs-Roadmap

### Sprint 1 (Woche 1): Quick Wins + Budget-Anpassung

**Prio 1 — Sofort:**
- [ ] Vendor-Charts Lazy Loading implementieren (2h)
- [ ] Chart Telemetry Code Splitting (1h)
- [ ] Dashboard FAB + Widgets lazy laden (1h)
- [ ] **Neues Budget festlegen: 1000 KB** (Dokumentation)

**Deliverables:**
- Bundle: 870 KB → 782 KB ✅
- Budget: 98% Auslastung
- On-Demand Chunks: +163 KB (Charts) + 25 KB (Dashboard)

---

### Sprint 2 (Woche 2-3): Cluster A (Shell) Completion

**WP-001 + WP-002:**
- [ ] Bottom Nav implementieren (+8 KB)
- [ ] Theme System implementieren (+12 KB)
- [ ] Integration testen

**Impact:** +20 KB → Bundle: 802 KB (80% Budget)

---

### Sprint 3 (Woche 4-5): Cluster C (Journal) Completion

**WP-034 + WP-035 (mit Lazy Loading):**
- [ ] Mobile Journal + BottomSheet (+12 KB, statt +20 KB)
- [ ] Journal Workflow + Auto-Save (+13 KB, statt +20 KB)
- [ ] Templates lazy laden (on-demand: +15 KB)

**Impact:** +25 KB → Bundle: 827 KB (83% Budget)

---

### Sprint 4-6 (Woche 6-11): Cluster D (Chart) — 2 Phasen

**Phase 1 — Core Chart (WP-050, WP-051, WP-055):**
- [ ] Chart Foundation + Layout (+35 KB)
- [ ] Kein vendor-charts in Initial (lazy load)

**Phase 2 — Advanced Chart (WP-052, WP-053, WP-054, WP-056):**
- [ ] Alle als on-demand chunks (0 KB initial)
- [ ] Laden nur bei Chart-Nutzung (+95 KB)

**Impact:** +35 KB initial → Bundle: 862 KB (86% Budget)

---

### Sprint 7-8 (Woche 12-15): Cluster E (Alerts)

**WP-070..076 (mit Lazy Loading):**
- [ ] Alerts Layout + List (+30 KB initial)
- [ ] NewAlertSheet lazy load (on-demand: +18 KB)
- [ ] Templates lazy (on-demand: +6 KB)

**Impact:** +30 KB → Bundle: 892 KB (89% Budget)

---

### Sprint 9-10 (Woche 16-19): Cluster F (Settings)

**WP-090..097 (komplette Route lazy):**
- [ ] Settings komplett on-demand (+0 KB initial)
- [ ] Laden nur bei /settings Navigation (+60 KB)

**Impact:** +0 KB → Bundle: 892 KB (89% Budget)

---

## 🎯 Finale Zielsetzung

### Bundle-Ziele nach Completion (alle 38 WPs):

| Metrik | Wert | Status |
|--------|------|--------|
| **Initial Bundle (optimiert)** | 892 KB | ✅ 89% Budget |
| **On-Demand Chunks** | 360 KB | Nur bei Bedarf |
| **Total Code (alle Features)** | 1252 KB | Verteilt, nicht upfront |
| **Budget** | 1000 KB | ✅ Eingehalten |
| **Headroom** | 108 KB | 11% Reserve ✅ |

### Performance-Metriken:

| Szenario | Initial Load | TTI | Lighthouse Score |
|----------|--------------|-----|------------------|
| **Dashboard Start** | 892 KB | <2s | 95+ |
| **+ Chart öffnen** | +163 KB | <3s | 90+ |
| **+ Settings öffnen** | +60 KB | <2.5s | 95+ |
| **Full Feature Load** | 1252 KB | <5s | 85+ |

---

## 🚀 Empfehlung

### Sofort umsetzen:

1. ✅ **Quick Wins implementieren** (Phase 1: 1-2h)
   - Vendor-Charts lazy
   - Chart Telemetry split
   - Dashboard widgets lazy
   - **Bundle: 870 KB → 782 KB (-10%)**

2. ✅ **Budget anpassen auf 1000 KB** (dokumentieren)
   - Realistisch für 38 WPs
   - Erlaubt 108 KB Headroom
   - Basis für Sprint-Planung

3. ✅ **Cluster D (Chart) in 2 Phasen splitten**
   - Phase 1 (Core): +35 KB
   - Phase 2 (Advanced): on-demand +95 KB
   - Verhindert Bundle-Explosion

### Budget-Guardrails einführen:

```json
// package.json - size-limit config
{
  "size-limit": [
    {
      "name": "Initial Bundle",
      "path": "dist/assets/index-*.js",
      "limit": "100 KB"
    },
    {
      "name": "Vendor Bundle",
      "path": "dist/assets/vendor-*.js",
      "limit": "400 KB"
    },
    {
      "name": "Total Initial (all bundles)",
      "path": "dist/assets/*.js",
      "limit": "1000 KB"
    }
  ]
}
```

```bash
# CI/CD Pre-Merge Check
pnpm add -D @size-limit/preset-app
pnpm size-limit
```

---

## 📚 Dokumentation Updates

- [ ] `docs/process/BUNDLE-SIZE-FINAL-SUMMARY.md` aktualisieren
- [ ] Neues Budget 1000 KB dokumentieren
- [ ] Roadmap in `tasks/WP-polish/UI_&_UX_polish.md` anpassen
- [ ] Bundle-Strategy.md in `docs/architecture/` verschieben

---

**Status:** ✅ READY FOR EXECUTION  
**Next Action:** Quick Wins implementieren (Phase 1)  
**Timeline:** Sprint 1 startet sofort, Completion in ~19 Wochen

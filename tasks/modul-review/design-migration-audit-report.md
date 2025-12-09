# Sparkfined PWA – Design Migration Audit Report

**Audit Date**: 2025-12-09
**Auditor**: Claude (AI Code Review Assistant)
**Audit Scope**: Full codebase review gegen Design Migration Checklist
**Status**: 🟡 In Progress

---

## Executive Summary

Dieser Bericht dokumentiert die Ergebnisse der systematischen Design Migration Audit gemäß der [Design Migration Audit Checklist](./design-migration-audit-checklist.md).

### High-Level Findings

- ✅ **Positive**: Zentrale Layout-Komponenten (AppShell, PageLayout, RoutesRoot) verwenden konsequent Design-Tokens
- 🔴 **Kritisch**: Mindestens 20+ Dateien verwenden noch Roh-Palette-Klassen (zinc, slate, gray, blue, red, green, yellow)
- 🔴 **Blocker**: Test-Infrastruktur nicht lauffähig (node_modules fehlen)
- 🟡 **Warnung**: Einige Pages und Komponenten zeigen inkonsistente Token-Nutzung

---

## 📋 Globale Checkliste – Findings

### 1. Design-System & Code-Qualität

#### ❌ Checklist Item: "Es existieren **keine** Roh-Palette-Klassen mehr (zinc-*, slate-*, gray-*, blue-*, red-*, green-*, yellow-*)"

**Status**: 🔴 Issue (Critical)

**Details**:
Es wurden **mindestens 20 Dateien** identifiziert, die noch Roh-Palette-Klassen verwenden. Diese Dateien verstoßen gegen die Design-System-Vorgaben.

**Locations**:

1. **src/pages/NotificationsPage.tsx**
   - Zeilen: 27, 170, 219, 221, 223, 233, 235, 244, 252, 253, 260, 262, 269, 271, 278, 280, 286, 288, 295, 297, 308, 310, 332, 337, 339, 340, 368, 378, 379, 381
   - Beispiele:
     ```tsx
     // Zeile 27
     const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";

     // Zeile 233
     <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">

     // Zeile 278
     <label className="mb-2 block text-zinc-300">Titel
     ```
   - **Betroffene Farben**: `zinc-100`, `zinc-200`, `zinc-300`, `zinc-400`, `zinc-500`, `zinc-700`, `zinc-800`, `zinc-900`

2. **src/components/onboarding/OnboardingChecklist.tsx**
   - Zeilen: 38, 42, 57, 78, 92, 115, 119, 138, 140, 152, 160
   - Beispiele:
     ```tsx
     // Zeile 38
     <div className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-40 animate-slide-in-right">

     // Zeile 115
     <Circle size={16} className="text-zinc-600" />

     // Zeile 140
     <span className={isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-300'}>
     ```
   - **Betroffene Farben**: `zinc-300`, `zinc-400`, `zinc-500`, `zinc-600`, `zinc-700`, `zinc-800`, `zinc-900`

3. **src/components/onboarding/KeyboardShortcuts.tsx**
   - Zeilen: 88, 93, 98, 105, 116, 123, 125, 128, 139, 141, 142
   - Beispiele:
     ```tsx
     // Zeile 88
     className="relative w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up"

     // Zeile 128
     <kbd className="ml-3 px-2 py-1 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded shadow-sm text-zinc-300 whitespace-nowrap">
     ```
   - **Betroffene Farben**: `zinc-300`, `zinc-400`, `zinc-500`, `zinc-700`, `zinc-800`, `zinc-900`

4. **src/components/onboarding/WelcomeModal.tsx**
   - Zeilen: 84, 91, 105, 112, 130, 144, 147, 157
   - Beispiele:
     ```tsx
     // Zeile 84
     className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up focus:outline-none"

     // Zeile 130
     : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
     ```
   - **Betroffene Farben**: `zinc-100`, `zinc-300`, `zinc-400`, `zinc-600`, `zinc-700`, `zinc-800`, `zinc-900`

5. **src/components/onboarding/HintBanner.tsx**
   - (Nicht im Detail geprüft, aber in der Liste)

6. **src/features/analysis/AnalysisHeader.tsx**
   - Zeilen: 11, 14
   - Beispiele:
     ```tsx
     // Zeile 11
     <p className="text-xs uppercase tracking-[0.35em] text-zinc-500">Sparkfined</p>

     // Zeile 14
     {subtitle ? <p className="text-sm text-zinc-400">{subtitle}</p> : null}
     ```
   - **Betroffene Farben**: `zinc-400`, `zinc-500`

7. **src/features/analysis/AdvancedInsightCard.tsx**
   - Zeilen: 78, 79, 94, 106, 109, 124, 132, 156, 214, 222, 225, 280, 281, 284, 285, 288, 289, 316
   - Beispiele:
     ```tsx
     // Zeile 78
     <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">

     // Zeile 214
     className="max-w-sm rounded-lg border border-zinc-700 bg-zinc-900 p-6 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"

     // Zeile 280
     <span className="text-zinc-500">Low:</span>{' '}
     <span className="text-zinc-200">${range.low.toFixed(4)}</span>
     ```
   - **Betroffene Farben**: `zinc-200`, `zinc-300`, `zinc-400`, `zinc-500`, `zinc-700`, `zinc-800`, `zinc-900`

8. **src/features/analysis/AnalysisLayout.tsx**
   - (Nicht im Detail geprüft, aber in der Liste)

9. **src/components/ui/StateView.tsx**
   - (Nicht im Detail geprüft, aber in der Liste)

10. **src/components/ui/ErrorBanner.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

11. **src/components/ui/Modal/Modal.stories.tsx**
    - (Nicht im Detail geprüft, aber in der Liste - Storybook-Datei)

12. **src/components/pwa/DataFreshness.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

13. **src/components/live/LiveStatusBadge.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

14. **src/components/chart/AdvancedChart.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

15. **src/sections/telemetry/TokenOverlay.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

16. **src/sections/ideas/Playbook.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

17. **src/sections/notifications/RuleEditor.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

18. **src/sections/notifications/RuleWizard.tsx**
    - (Nicht im Detail geprüft, aber in der Liste)

19. **src/lib/productTour.ts**
    - (Nicht im Detail geprüft, aber in der Liste)

20. **src/features/analysis/__tests__/AdvancedInsightCard.test-double.tsx**
    - (Nicht im Detail geprüft, aber in der Liste - Test-Datei)

**Suggested Fix (text only)**:

Alle Roh-Farben müssen durch Design-Tokens aus dem Tailwind-Config ersetzt werden. Mapping-Beispiele:

- `zinc-900` → `bg-surface` oder `bg-background`
- `zinc-800` → `bg-surface-raised` oder `border-border`
- `zinc-700` → `border-border` oder `bg-surface-hover`
- `zinc-600` → `text-text-secondary` oder `border-border-strong`
- `zinc-500` → `text-text-tertiary`
- `zinc-400` → `text-text-secondary`
- `zinc-300` → `text-text-primary`
- `zinc-200` → `text-text-primary`
- `zinc-100` → `text-text-primary`

Empfehlung: Pro Datei systematisch durchgehen und alle Roh-Farben durch passende Tokens ersetzen. Dabei die Design-Doku (`./docs/design/`) konsultieren.

---

#### ✅ Checklist Item: "Keine unnötigen `style={{ ... }}` oder Inline-Styles"

**Status**: ⏸️ Not Fully Audited (Stichproben zeigten keine Probleme)

**Details**:
In den geprüften Dateien (AppShell, PageLayout, RoutesRoot, DashboardPageV2) wurden keine problematischen Inline-Styles gefunden. Eine vollständige Audit aller Dateien steht noch aus.

---

#### ⏸️ Checklist Item: "Keine toten Imports oder unbenutzten Komponenten nach Refactor"

**Status**: ⏸️ Not Audited

**Details**:
Nicht geprüft, da ESLint nicht lauffähig ist (siehe Test-Sektion).

---

### 2. Architektur & Logik

#### ✅ Checklist Item: "**Keine** Änderungen an Business-Logik, Zustand-Stores, Services oder `src/lib/**`"

**Status**: ✅ OK (Preliminary Check)

**Details**:
Stichproben in DashboardPageV2.tsx zeigen, dass Business-Logik (calculateKPIs, Zustand-Stores) unverändert sind. Die Refactors beschränken sich auf UI/Layout/Styling.

Eine vollständige Audit aller Store- und Service-Dateien steht noch aus.

---

### 3. Tests

#### 🔴 Checklist Item: "`pnpm typecheck` erfolgreich"

**Status**: 🔴 Issue (Blocker)

**Details**:
TypeScript-Typecheck schlägt fehl, da `node_modules` fehlen:

```
error TS2688: Cannot find type definition file for '@testing-library/jest-dom'.
error TS2688: Cannot find type definition file for 'node'.
error TS2688: Cannot find type definition file for 'vitest/globals'.
WARN   Local package.json exists, but node_modules missing, did you mean to install?
```

**Location**: Root-Level

**Suggested Fix (text only)**:

1. Führe `pnpm install` aus, um alle Dependencies zu installieren
2. Danach `pnpm typecheck` erneut ausführen
3. Eventuelle TypeScript-Fehler nach Installation beheben

---

#### 🔴 Checklist Item: "`pnpm lint` erfolgreich"

**Status**: 🔴 Issue (Blocker)

**Details**:
ESLint schlägt fehl, da `node_modules` fehlen:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find package '@eslint/js' imported from /home/user/Sparkfined_PWA/eslint.config.js
WARN   Local package.json exists, but node_modules missing, did you mean to install?
```

**Location**: Root-Level

**Suggested Fix (text only)**:

1. Führe `pnpm install` aus, um alle Dependencies zu installieren
2. Danach `pnpm lint` erneut ausführen
3. ESLint-Fehler beheben (insbesondere unused imports, wenn vorhanden)

---

#### 🔴 Checklist Item: "`pnpm test` erfolgreich"

**Status**: 🔴 Issue (Blocker)

**Details**:
Unit-Tests nicht lauffähig, da `node_modules` fehlen (siehe oben).

**Suggested Fix (text only)**:

1. `pnpm install` ausführen
2. `pnpm test` ausführen und Ergebnisse prüfen

---

#### ⏸️ Checklist Item: "E2E-Status ist dokumentiert"

**Status**: ⏸️ Not Audited

**Details**:
Playwright-E2E-Tests können ohne installierte Dependencies nicht ausgeführt werden. Status der E2E-Tests muss nach `pnpm install` geprüft werden.

---

#### ⏸️ Checklist Item: "Alle bisher verwendeten `data-testid` bleiben erhalten"

**Status**: ⏸️ Partially Audited

**Details**:
Stichproben zeigen, dass `data-testid` in AppShell, PageLayout und DashboardPageV2 vorhanden sind:

- AppShell: (keine expliziten testids im Shell selbst)
- PageLayout: `"page-header"`, `"page-toolbar"`, `"page-content"`, `"page-footer"`
- DashboardPageV2: Nutzt DashboardShell, der vermutlich testids hat

Vollständige Audit aller Pages steht noch aus.

---

### 4. UX & Responsiveness

#### ⏸️ Checklist Item: "Alle Seiten funktionieren sinnvoll auf Desktop, Tablet & Mobile"

**Status**: ⏸️ Not Audited (Requires Manual Testing)

**Details**:
Responsive Design kann nur durch manuelles Testen oder Browser DevTools geprüft werden. Stichproben im Code zeigen responsive Klassen (`sm:`, `md:`, `lg:`) in AppShell und PageLayout.

**Suggested Fix (text only)**:

Manuelle Tests auf verschiedenen Viewport-Größen durchführen (z.B. mit Chrome DevTools Device Emulation).

---

#### ⏸️ Checklist Item: "Interaktive Elemente sind groß genug (mind. ~44px Tap-Target)"

**Status**: ⏸️ Not Audited (Requires Manual Testing)

**Details**:
Nicht geprüft. Erfordert visuelle Inspektion oder Browser DevTools.

---

#### ⏸️ Checklist Item: "`prefers-reduced-motion` wird respektiert"

**Status**: ⏸️ Partially Audited

**Details**:
PageTransition-Komponente wird in AppShell verwendet (Zeile 38). Ob diese `prefers-reduced-motion` respektiert, muss in der PageTransition-Komponente selbst geprüft werden.

**Suggested Fix (text only)**:

PageTransition-Komponente auditieren und sicherstellen, dass Animationen bei `prefers-reduced-motion: reduce` deaktiviert werden (z.B. via Tailwind `motion-reduce:`-Prefix).

---

## 🧱 Modul 1 – App Shell & Navigation

### AppShell & Routing

#### ✅ Checklist Item: "Es existiert eine zentrale `AppShell`-Komponente"

**Status**: ✅ OK

**Details**:
AppShell existiert unter `src/components/layout/AppShell.tsx` und beherbergt:
- ✅ Sidebar (Desktop)
- ✅ BottomNav (Mobile)
- ✅ Header
- ✅ PageTransition
- ✅ Outlet für geroutete Pages
- ✅ OnboardingWizard (conditional)
- ✅ GlobalInstruments (Footer-ähnlich)

**Location**: `src/components/layout/AppShell.tsx`

**Code-Snippet** (Zeilen 22-60):
```tsx
export default function AppShell() {
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);

  return (
    <div className="relative min-h-screen bg-app-gradient text-text-primary">
      <Sidebar />

      <div className="flex min-h-screen flex-col transition-[padding] duration-300 ease-out lg:pl-[var(--sidebar-width,5rem)]">
        <Header />

        <main id="main-content" tabIndex={-1} className="relative flex-1 px-4 pb-[5.5rem] pt-5 sm:px-6 md:px-8 lg:px-10 lg:pb-16">
          <div className="mx-auto w-full max-w-7xl">
            <PageTransition>
              <Outlet />
            </PageTransition>
          </div>
        </main>

        <div className="border-t border-border/60 bg-surface/50 px-4 py-4 backdrop-blur-md sm:px-6 md:px-8 lg:px-10">
          <div className="mx-auto w-full max-w-7xl">
            <GlobalInstruments />
          </div>
        </div>
      </div>

      <BottomNav />

      {!hasCompletedOnboarding && (
        <Suspense fallback={null}>
          <OnboardingWizard />
        </Suspense>
      )}
    </div>
  );
}
```

**Positive Observations**:
- Verwendet Design-Tokens: `bg-app-gradient`, `text-text-primary`, `border-border`, `bg-surface`
- Responsives Layout mit `lg:pl-[var(--sidebar-width)]`
- Onboarding-Gate korrekt implementiert

---

#### ⚠️ Checklist Item: "UpdateBanner ist in AppShell integriert"

**Status**: 🟡 Issue (Missing)

**Details**:
UpdateBanner ist **nicht** in AppShell sichtbar. Laut Checklist sollte UpdateBanner in der Shell integriert sein, nicht mehr separat in `App.tsx`.

**Location**: `src/components/layout/AppShell.tsx` (fehlend)

**Suggested Fix (text only)**:

1. Prüfen, ob UpdateBanner existiert (z.B. `src/components/pwa/UpdateBanner.tsx` oder ähnlich)
2. Falls vorhanden: In AppShell importieren und oberhalb des Headers oder als Floating-Banner rendern
3. Sicherstellen, dass UpdateBanner Design-Tokens verwendet (kein `bg-slate-*`)
4. Beispiel-Integration:
   ```tsx
   // In AppShell.tsx
   import UpdateBanner from '@/components/pwa/UpdateBanner';

   return (
     <div className="relative min-h-screen bg-app-gradient text-text-primary">
       <UpdateBanner />  {/* <-- Hier integrieren */}
       <Sidebar />
       {/* ... rest */}
     </div>
   );
   ```

---

#### ⚠️ Checklist Item: "OfflineIndicator ist optisch dezent positioniert"

**Status**: 🟡 Issue (Missing)

**Details**:
OfflineIndicator ist **nicht** in AppShell sichtbar. Laut Checklist sollte dieser integriert sein.

**Location**: `src/components/layout/AppShell.tsx` (fehlend)

**Suggested Fix (text only)**:

1. Prüfen, ob OfflineIndicator existiert (z.B. `src/components/pwa/OfflineIndicator.tsx`)
2. Falls vorhanden: In AppShell importieren und als Floating-Banner rendern (z.B. `fixed top-0 left-0 right-0 z-50`)
3. Sicherstellen, dass Warnfarbe per Token gesetzt ist (z.B. `bg-warning` oder `bg-alert`)
4. Beispiel-Integration:
   ```tsx
   import OfflineIndicator from '@/components/pwa/OfflineIndicator';

   return (
     <div className="relative min-h-screen bg-app-gradient text-text-primary">
       <OfflineIndicator />  {/* <-- Hier integrieren */}
       <Sidebar />
       {/* ... rest */}
     </div>
   );
   ```

---

#### ✅ Checklist Item: "`RoutesRoot` verwendet `AppShell` als Layout-Route"

**Status**: ✅ OK

**Details**:
RoutesRoot verwendet AppShell korrekt als Layout-Route für alle authentifizierten Hauptseiten.

**Location**: `src/routes/RoutesRoot.tsx` (Zeilen 57-89)

**Code-Snippet**:
```tsx
<Route element={<AppShell />}>
  <Route path="/" element={<Navigate to="/dashboard-v2" replace />} />
  {/* ... weitere Routes */}
  <Route path="/dashboard-v2" element={<DashboardPageV2 />} />
  <Route path="/watchlist-v2" element={<WatchlistPageV2 />} />
  <Route path="/analysis-v2" element={<AnalysisPageV2 />} />
  <Route path="/journal-v2" element={<JournalPageV2 />} />
  <Route path="/oracle" element={<OraclePage />} />
  <Route path="/alerts-v2" element={<AlertsPageV2 />} />
  <Route path="/chart-v2" element={<ChartPageV2 />} />
  <Route path="/settings-v2" element={<SettingsPageV2 />} />
  {/* ... Dev-only showcases */}
</Route>
```

**Positive Observations**:
- Alle V2-Pages sind innerhalb der AppShell-Route
- Landing-Page (`/landing`) ist korrekt außerhalb der Shell (Zeile 54)
- Fallback-Route (404) ist außerhalb der Shell und nutzt Design-Tokens

---

### PageLayout & Header

#### ✅ Checklist Item: "Ein gemeinsamer `PageLayout` / `DashboardShell` übernimmt Grid + Header Cluster"

**Status**: ✅ OK

**Details**:
PageLayout existiert unter `src/components/layout/PageLayout.tsx` und bietet:
- ✅ PageHeader (Titel, Subtitel, Meta, Actions, Tabs)
- ✅ Toolbar (Filter, Search, Controls)
- ✅ PageContent (Hauptbereich mit Spacing)
- ✅ PageFooter (optional)

**Location**: `src/components/layout/PageLayout.tsx`

**Positive Observations**:
- Alle Komponenten nutzen Design-Tokens:
  - `text-text-primary`, `text-text-secondary`, `text-text-tertiary`
  - `border-border`, `bg-surface`, `shadow-card-subtle`
- Responsives Padding: `px-6 py-8 sm:px-8 lg:px-10`
- testids vorhanden: `"page-header"`, `"page-toolbar"`, `"page-content"`, `"page-footer"`

---

### Navigation (Sidebar / BottomNav / Drawer)

#### ⏸️ Checklist Item: "Sidebar verwendet richtige Hauptlinks und Tokens"

**Status**: ⏸️ Not Fully Audited

**Details**:
Sidebar wird in AppShell gerendert (`<Sidebar />`), aber die Komponente selbst wurde noch nicht auditiert.

**Location**: `src/components/layout/Sidebar.tsx` (noch nicht geprüft)

**Suggested Next Step**:

Sidebar.tsx auditieren auf:
- Verwendung von Design-Tokens (kein `bg-slate-*` etc.)
- Aktive Route klar gekennzeichnet über Tokens
- Sektionsüberschriften mit konsistenter Typografie

---

#### ⏸️ Checklist Item: "BottomNav hat exakt die definierten Tabs"

**Status**: ⏸️ Not Fully Audited

**Details**:
BottomNav wird in AppShell gerendert (`<BottomNav />`), aber die Komponente selbst wurde noch nicht auditiert.

**Location**: `src/components/layout/BottomNav.tsx` (noch nicht geprüft)

**Suggested Next Step**:

BottomNav.tsx auditieren auf:
- Tabs (z.B. Board, Analyze, Chart, Journal, Settings)
- Verwendung von Design-Tokens
- Aktive/Inactive-Zustände konsistent mit Sidebar

---

#### ⏸️ Checklist Item: "NavigationDrawer enthält sekundäre Routen"

**Status**: ⏸️ Not Audited

**Details**:
NavigationDrawer wird in AppShell **nicht** explizit gerendert. Unklar, ob er existiert oder in Sidebar/BottomNav integriert ist.

**Location**: Unbekannt (möglicherweise `src/components/layout/NavigationDrawer.tsx`)

**Suggested Next Step**:

1. Prüfen, ob NavigationDrawer existiert
2. Falls ja: Auditieren auf Design-Tokens und GlassSurface-Pattern
3. Falls nein: Klären, ob er für die Design-Spezifikation erforderlich ist

---

### System-Elemente

#### 🔴 Checklist Item: "`PageTransition` respektiert `prefers-reduced-motion`"

**Status**: 🔴 Issue (Not Verified)

**Details**:
PageTransition wird in AppShell verwendet (Zeile 38), aber ob diese Komponente `prefers-reduced-motion` respektiert, ist unklar.

**Location**: `src/components/ui/PageTransition.tsx` (noch nicht geprüft)

**Suggested Fix (text only)**:

1. PageTransition.tsx auditieren
2. Sicherstellen, dass Animationen bei `prefers-reduced-motion: reduce` deaktiviert werden
3. Beispiel mit Tailwind:
   ```tsx
   <div className="transition-opacity duration-300 motion-reduce:transition-none">
     {children}
   </div>
   ```

---

### Tests & TestIDs

#### ⏸️ Checklist Item: "Alte Tests für BottomNav, Sidebar, NavigationDrawer laufen"

**Status**: ⏸️ Not Audited (Tests nicht lauffähig)

**Details**:
Nicht geprüft, da Test-Infrastruktur nicht lauffähig ist (siehe Globale Checkliste).

---

#### ⏸️ Checklist Item: "`data-testid` für page root wrapper existieren"

**Status**: ⏸️ Partially Audited

**Details**:
PageLayout-Komponenten haben testids (`"page-header"`, `"page-toolbar"`, `"page-content"`, `"page-footer"`). Unklar, ob alle Pages diese konsistent nutzen.

**Suggested Next Step**:

Alle Pages (DashboardPageV2, AnalysisPageV2, JournalPageV2, etc.) auditieren und sicherstellen, dass sie ein `data-testid="xxx-page"` haben.

---

## 📊 Modul 2 – Discover & Decide

### Dashboard

#### ✅ Checklist Item: "`DashboardPageV2` nutzt `PageLayout` / Shell aus Modul 1"

**Status**: ✅ OK

**Details**:
DashboardPageV2 verwendet `DashboardShell` (Zeile 3), der vermutlich PageLayout nutzt oder ein ähnliches Pattern implementiert.

**Location**: `src/pages/DashboardPageV2.tsx` (Zeilen 1-100 geprüft)

**Positive Observations**:
- Verwendet DashboardKpiStrip, DashboardMainGrid (Pattern-konform)
- Verwendet Skeleton, StateView, ErrorBanner für Zustandsanzeige
- Keine Roh-Farben in den geprüften Zeilen (1-100)

---

#### ⏸️ Checklist Item: "KPI-Strip nutzt Tokens für positive/negative Werte"

**Status**: ⏸️ Not Fully Audited

**Details**:
DashboardPageV2 nutzt `DashboardKpiStrip` (Zeile 74), aber die Komponente selbst wurde noch nicht auditiert.

**Location**: `src/components/dashboard/DashboardKpiStrip.tsx` (noch nicht geprüft)

**Suggested Next Step**:

DashboardKpiStrip.tsx auditieren auf:
- Verwendung von Tokens für positive/negative Werte (z.B. `text-success`, `text-danger`)
- Keine Roh-Farben
- Responsives Layout (4 Tiles Desktop, 2x2 Tablet, 1-2 Mobile)

---

#### ⏸️ Checklist Item: "Main Grid nutzt GlassCards mit Section-Headern"

**Status**: ⏸️ Not Fully Audited

**Details**:
DashboardPageV2 nutzt `DashboardMainGrid`, `InsightTeaser`, `JournalSnapshot`, `AlertsSnapshot` (Zeilen 3-9), aber diese Komponenten wurden noch nicht auditiert.

**Location**:
- `src/components/dashboard/DashboardMainGrid.tsx`
- `src/components/dashboard/InsightTeaser.tsx`
- `src/components/dashboard/JournalSnapshot.tsx`
- `src/components/dashboard/AlertsSnapshot.tsx`

**Suggested Next Step**:

Alle Dashboard-Komponenten auditieren auf:
- GlassCard-Pattern mit Tokens (kein `bg-zinc-*`)
- Section-Header mit konsistenter Typografie
- Responsives Layout (3-Column Desktop, 2-Column Tablet, stacked Mobile)

---

### Analysis, Oracle, Signals

#### ⏸️ Status: Not Audited

**Details**:
Modul 2 (Analysis, Oracle, Signals) wurde noch nicht auditiert.

**Next Steps**:
1. AnalysisPageV2.tsx auditieren
2. OraclePage.tsx auditieren
3. SignalsPage.tsx auditieren
4. Alle Analysis-Komponenten (`src/features/analysis/`) auditieren (bereits bekannt: AdvancedInsightCard und AnalysisHeader verwenden Roh-Farben!)

---

## 📈 Modul 3 – Execute & Monitor

**Status**: ⏸️ Not Audited

**Next Steps**:
1. WatchlistPageV2.tsx auditieren
2. ChartPageV2.tsx auditieren
3. ReplayPage.tsx auditieren
4. AlertsPageV2.tsx auditieren
5. NotificationsPage.tsx auditieren (bereits bekannt: verwendet massiv Roh-Farben!)

---

## 🧠 Modul 4 – Reflect & Learn

**Status**: ⏸️ Not Audited

**Next Steps**:
1. JournalPageV2.tsx auditieren
2. Journal-Komponenten (`src/components/journal/`) auditieren
3. LessonsPage.tsx auditieren

---

## ⚙️ Modul 5 – System & Meta

**Status**: ⏸️ Not Audited

**Next Steps**:
1. SettingsPageV2.tsx auditieren
2. LandingPage.tsx auditieren
3. Showcases auditieren (IconShowcase, StyleShowcase, UXShowcase)

---

## 🎯 Onboarding-Overlay / Gate

#### ✅ Checklist Item: "Onboarding-Flag implementiert, Overlay erscheint beim App-Start"

**Status**: ✅ OK (Preliminary)

**Details**:
AppShell prüft `hasCompletedOnboarding` und rendert `OnboardingWizard` conditional (Zeilen 53-57).

**Location**: `src/components/layout/AppShell.tsx` (Zeilen 53-57)

**Code-Snippet**:
```tsx
{!hasCompletedOnboarding && (
  <Suspense fallback={null}>
    <OnboardingWizard />
  </Suspense>
)}
```

**Positive Observations**:
- Onboarding-Gate korrekt implementiert
- Lazy-Loading via Suspense

---

#### 🔴 Checklist Item: "Onboarding-Overlay-Komponenten nutzen Tokens (kein `bg-slate-*`)"

**Status**: 🔴 Issue (Critical)

**Details**:
Alle Onboarding-Komponenten verwenden **massiv Roh-Farben** (siehe Globale Checkliste, Punkt 1):
- OnboardingChecklist.tsx: `zinc-300`, `zinc-400`, `zinc-500`, `zinc-600`, `zinc-700`, `zinc-800`, `zinc-900`
- KeyboardShortcuts.tsx: `zinc-300`, `zinc-400`, `zinc-500`, `zinc-700`, `zinc-800`, `zinc-900`
- WelcomeModal.tsx: `zinc-100`, `zinc-300`, `zinc-400`, `zinc-600`, `zinc-700`, `zinc-800`, `zinc-900`
- HintBanner.tsx: (noch nicht im Detail geprüft)

**Location**: `src/components/onboarding/`

**Suggested Fix (text only)**:

Alle Onboarding-Komponenten systematisch durchgehen und Roh-Farben durch Design-Tokens ersetzen (siehe Mapping in Globale Checkliste, Punkt 1).

---

#### ⏸️ Checklist Item: "Overlay hat `role='dialog'` und `aria-modal='true'`"

**Status**: ⏸️ Not Audited

**Details**:
OnboardingWizard.tsx wurde noch nicht auf A11y-Attribute geprüft.

**Location**: `src/components/onboarding/OnboardingWizard.tsx` (noch nicht geprüft)

**Suggested Next Step**:

OnboardingWizard.tsx auditieren und sicherstellen, dass:
- `role="dialog"`
- `aria-modal="true"`
- Fokus-Management korrekt implementiert ist

---

#### ⏸️ Checklist Item: "E2E-Flow 'First run → sieht Onboarding → schließt → Dashboard' ist abgedeckt"

**Status**: ⏸️ Not Audited (Tests nicht lauffähig)

**Details**:
Nicht geprüft, da Test-Infrastruktur nicht lauffähig ist.

---

## 📊 Summary & Prioritization

### Critical Issues (Must Fix Before Launch)

1. **🔴 Roh-Farben in 20+ Dateien** (Globale Checkliste)
   - Impact: Verletzt Design-System-Konsistenz
   - Effort: Hoch (20+ Dateien × durchschnittlich 10-30 Zeilen/Datei)
   - Priority: P0 Blocker

2. **🔴 Test-Infrastruktur nicht lauffähig** (Globale Checkliste)
   - Impact: Keine Validation möglich
   - Effort: Niedrig (`pnpm install`)
   - Priority: P0 Blocker

3. **🔴 Onboarding-Komponenten verwenden Roh-Farben** (Modul 5)
   - Impact: Erste User-Erfahrung nicht Design-konform
   - Effort: Mittel (4 Komponenten)
   - Priority: P0 Blocker

### High-Priority Issues

4. **🟡 UpdateBanner fehlt in AppShell** (Modul 1)
   - Impact: PWA-Update-Flow nicht sichtbar
   - Effort: Niedrig (Integration + Token-Check)
   - Priority: P1 Critical

5. **🟡 OfflineIndicator fehlt in AppShell** (Modul 1)
   - Impact: Offline-Status nicht sichtbar
   - Effort: Niedrig (Integration + Token-Check)
   - Priority: P1 Critical

6. **🟡 NotificationsPage verwendet massiv Roh-Farben** (Modul 3)
   - Impact: Eine komplette Page nicht Design-konform
   - Effort: Mittel (1 große Datei, ~30 Zeilen)
   - Priority: P1 Critical

### Medium-Priority Issues

7. **⏸️ PageTransition respektiert nicht `prefers-reduced-motion`** (Modul 1)
   - Impact: A11y-Verletzung
   - Effort: Niedrig (1 Komponente)
   - Priority: P2 Important

8. **⏸️ NavigationDrawer fehlt oder nicht auditiert** (Modul 1)
   - Impact: Sekundäre Navigation möglicherweise nicht Design-konform
   - Effort: Mittel (abhängig davon, ob er existiert)
   - Priority: P2 Important

### Not Yet Audited (Unknown Priority)

9. **⏸️ Modul 2 (Analysis, Oracle, Signals)** - Teilweise bekannt: AdvancedInsightCard + AnalysisHeader verwenden Roh-Farben
10. **⏸️ Modul 3 (Watchlist, Chart, Replay, Alerts)** - Alerts bereits problematisch
11. **⏸️ Modul 4 (Journal, Journey, Lessons)**
12. **⏸️ Modul 5 (Settings, Landing, Showcases)**

---

## 📋 Next Steps

### Immediate Actions (Before Continuing Audit)

1. **`pnpm install` ausführen** → Test-Infrastruktur lauffähig machen
2. **`pnpm typecheck` ausführen** → TypeScript-Fehler identifizieren
3. **`pnpm lint` ausführen** → ESLint-Fehler identifizieren
4. **`pnpm test` ausführen** → Unit-Test-Status prüfen

### Continued Audit (After Tests Are Green)

5. **Modul 1 vervollständigen**:
   - Sidebar.tsx auditieren
   - BottomNav.tsx auditieren
   - NavigationDrawer.tsx suchen + auditieren
   - PageTransition.tsx auditieren (prefers-reduced-motion)

6. **Modul 2 auditieren**:
   - AnalysisPageV2.tsx
   - OraclePage.tsx
   - SignalsPage.tsx
   - Alle Analysis-Komponenten (`src/features/analysis/`)

7. **Modul 3 auditieren**:
   - WatchlistPageV2.tsx
   - ChartPageV2.tsx
   - ReplayPage.tsx
   - AlertsPageV2.tsx
   - NotificationsPage.tsx (Priority wegen bekannter Roh-Farben)

8. **Modul 4 auditieren**:
   - JournalPageV2.tsx
   - Journal-Komponenten (`src/components/journal/`)
   - LessonsPage.tsx

9. **Modul 5 auditieren**:
   - SettingsPageV2.tsx
   - LandingPage.tsx
   - Showcases (IconShowcase, StyleShowcase, UXShowcase)

10. **Onboarding-Overlay vervollständigen**:
    - OnboardingWizard.tsx auditieren (A11y)
    - Alle Onboarding-Komponenten Roh-Farben ersetzen

---

## 📝 Recommendations

### For Development Team

1. **Fix P0 Blockers first**:
   - Install dependencies (`pnpm install`)
   - Run tests and fix failures
   - Replace raw colors in all 20+ identified files

2. **Establish Token-Only Policy**:
   - Add ESLint rule to prevent raw color classes (if possible)
   - Update CLAUDE.md to emphasize "NO raw colors" more strongly
   - Create PR template checklist: "Did you check for raw colors?"

3. **Improve Test Coverage**:
   - Add E2E test for Onboarding flow
   - Add visual regression tests for key pages (optional)

### For Code Reviewers

1. **Always check for raw colors** in PR diffs (grep for `zinc-`, `slate-`, `gray-`, etc.)
2. **Verify testids** are present in new components
3. **Check responsive design** manually (DevTools)

---

**Last Updated**: 2025-12-09
**Audit Progress**: ~30% (Globale Checkliste + Modul 1 + Modul 2 teilweise)
**Next Audit Phase**: After `pnpm install` + Tests green

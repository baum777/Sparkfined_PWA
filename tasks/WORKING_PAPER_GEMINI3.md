# Working Paper / Mission Briefing für Gemini 3

**Status**: Ready for Execution
**Target Agent**: Gemini 3 (AI Developer)
**Project**: Sparkfined PWA
**Date**: 29.12.2025

---

## 1. Mission Overview

Deine Aufgabe ist es, die UI/UX der Sparkfined PWA basierend auf der neuen Architektur (`docs/UI_UX_ARCHITECTURE.md`) vollständig zu überarbeiten und fertigzustellen. Ein kritischer Aspekt ist dabei die Einbeziehung des Backends (Data Layer), um eine robuste, zukunftssichere Anwendung zu gewährleisten.

Aktuell basiert die App auf einer rudimentären `localStorage` Implementierung. Diese muss professionalisiert und abstrahiert werden, um "Backend-Ready" zu sein (vorbereitet für Supabase Sync).

---

## 2. Referenz-Dokumente (MUSS GELESEN WERDEN)

*   `docs/UI_UX_ARCHITECTURE.md` - Die visuelle Bibel und UX-Vorgabe.
*   `docs/TECHNICAL_SYSTEM_DOCUMENTATION.md` - Der aktuelle technische Stand und Datenflüsse.
*   `src/integrations/supabase/client.ts` - Vorhandener Supabase Client (zu nutzen/beachten).

---

## 3. Technische Vorgaben (Backend & Data Layer)

Das "Backend" ist in diesem Kontext als **abstrakte Data-Service-Schicht** zu verstehen, die aktuell lokal persistiert, aber asynchrone Schnittstellen für eine echte Remote-DB (Supabase) bereitstellt.

### 3.1 Data Service Pattern (Required)

Ersetze direkte `localStorage` Aufrufe in Komponenten durch typisierte Services.

**Ziel-Architektur:**
```typescript
// features/journal/services/tradeService.ts
export interface ITradeService {
  getAll(): Promise<Trade[]>;
  create(trade: NewTrade): Promise<Trade>;
  update(id: string, data: Partial<Trade>): Promise<Trade>;
  delete(id: string): Promise<void>;
}

// Implementierung (vorerst LocalStorage, aber Async!)
export const localTradeService: ITradeService = {
  getAll: async () => { ... }, // Simulate Network Delay optional
  // ...
};
```

### 3.2 State Management Refactoring
*   Refactore `useTradesStore` (und andere Stores), um diese Services zu nutzen.
*   Nutze `React Query` (TanStack Query) oder `swr` für Data Fetching, anstatt rohe `useEffect` Hooks, falls externe Datenanbindung (Supabase) aktiviert wird. Falls rein lokal: Bleibe bei `useSyncExternalStore`, aber kapsele die Logik sauberer.

---

## 4. UI/UX Implementierungs-Guide

### 4.1 Design System & Theme
*   **Mode**: Erzwinge Dark Mode als Default, biete Toggle in Settings.
*   **Colors**: Nutze die definierten semantischen Farben (Green/Red/Zinc) aus `tailwind.config.ts`.
*   **Typography**: Inter für UI, Monospace für Zahlen.

### 4.2 Navigation & Shell (Prio 1)
*   Implementiere die **Tab-Architektur** für `Settings` und `Journal` (siehe `UI_UX_ARCHITECTURE.md`).
*   Baue die **Responsive Navigation**:
    *   Desktop: Collapsible Sidebar.
    *   Mobile: Fixed Bottom Bar + Drawer Menu.

### 4.3 Key Components (Prio 2)
*   **Dashboard**: Implementiere das "Bento Grid" Layout.
*   **Journal**:
    *   Trenne `Quick Add` (Modal) von `Detailed Review` (Page/Drawer).
    *   Implementiere Filter-Tabs (All, Long, Short).
*   **Charts**: Stelle sicher, dass Recharts responsive sind.

---

## 5. Ausführungsplan (Execution Roadmap)

Arbeite diese Schritte sequenziell ab:

### Phase 1: Foundation & Data Layer
1.  **Refactor Stores**: Baue `src/services/` Ordner auf und extrahiere die `localStorage` Logik in asynchrone Services (`TradeService`, `SettingsService`).
2.  **Types**: Stelle sicher, dass alle Entitäten (`Trade`, `Alert`, `WatchlistItem`) in `src/types/` oder Feature-Ordnern sauber definiert sind (Zod Schemas!).

### Phase 2: Navigation & Shell Overhaul
1.  Überarbeite `AppShell.tsx`: Implementiere das responsive Layout strikt nach Design-Vorgabe.
2.  Implementiere `MobileBottomNav.tsx` und `AppSidebar.tsx` neu/final.

### Phase 3: Feature UI Polish
1.  **Journal**: Baue die Tab-Ansicht (`List` | `Analytics`) in `Journal.tsx`.
2.  **Settings**: Erstelle die Tab-Struktur für Einstellungen.
3.  **Onboarding**: Implementiere den `SetupCompleteness` Wizard als Modal beim ersten Start.

### Phase 4: Backend Integration Check
1.  Prüfe, ob Supabase Credentials (`.env`) vorhanden sind.
2.  Falls ja: Erweitere den `TradeService` um Supabase-Calls.
3.  Falls nein: Stelle sicher, dass der Code "Supabase-Ready" ist (Interfaces nutzen).

---

## 6. Definition of Done

*   [ ] App läuft fehlerfrei im Dev-Mode.
*   [ ] Keine Linter-Errors (`npm run lint`).
*   [ ] Mobile View ist vollständig nutzbar (kein horizontales Scrollen, Buttons erreichbar).
*   [ ] Daten werden persistiert (Reload-Test).
*   [ ] Code ist modular (Services getrennt von UI).

**Starten Sie mit Phase 1.**

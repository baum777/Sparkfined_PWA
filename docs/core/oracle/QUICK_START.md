# Oracle Subsystem – Quick Start Guide

## 🎯 Was ist das Oracle Subsystem?

Ein **tägliches Meta-Shift-Radar** das via Grok drei AI-Prompts orchestriert, um Crypto-Meta-Verschiebungen vorherzusagen. Trader erhalten täglich um **09:00 UTC** einen strukturierten Report mit:

- **7-Parameter Score** (0-7): Liquidität, Volumen, Social Momentum, etc.
- **Themen-Orakel**: Gaming, RWA, AI Agents, DePIN, etc. mit Meta-Wahrscheinlichkeiten
- **Frühe Alpha-CAs**: Contract Addresses mit Early-Signal-Potenzial

---

## 📋 Implementierungsreihenfolge

### ✅ Phase 1: Foundation (2-3 Tage)
**Was:** Datenbank, Service Layer, API Endpoint

**Dateien:**
```bash
src/lib/db.ts                    # Oracle-Tabelle hinzufügen (DB_VERSION 5)
src/types/oracle.ts              # TypeScript Interfaces
src/lib/OracleService.ts         # Dexie CRUD-Funktionen
api/oracle/index.ts              # Edge Function (Grok-Orchestration)
vercel.json                      # Cron-Config (09:00 UTC)
```

**Befehle zum Testen:**
```bash
pnpm typecheck                   # TypeScript validieren
pnpm test src/lib/OracleService  # Unit tests
```

---

### ✅ Phase 2: State Management (1 Tag)
**Was:** Zustand Store nach journalStore-Pattern

**Dateien:**
```bash
src/store/oracleStore.ts         # Zustand Store
```

**Store Interface:**
```typescript
interface OracleState {
  entries: OracleEntry[];
  activeEntry?: OracleEntry;
  isLoading: boolean;
  error: string | null;

  loadTodayEntry: () => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  refreshReport: () => Promise<void>;
  loadHistory: (days: number) => Promise<void>;
}
```

---

### ✅ Phase 3: UI Components (2-3 Tage)
**Was:** Oracle Page + Komponenten

**Dateien:**
```bash
src/pages/OraclePageV2.tsx                    # Haupt-Page
src/components/oracle/OracleReportViewer.tsx  # Report-Anzeige
src/components/oracle/OracleScoreCard.tsx     # Score 0-7 Display
src/components/oracle/OracleThemeBadge.tsx    # Theme Badge
src/components/oracle/OracleScoreChart.tsx    # 30-Tage-Chart
src/components/oracle/OracleThemeFilter.tsx   # Theme-Filter
```

**E2E Tests:**
```bash
tests/e2e/oracle/oracle.flows.spec.ts         # Playwright Tests
```

---

### ✅ Phase 4: Navigation (1 Tag)
**Was:** Sidebar + Routing Integration

**Dateien:**
```bash
src/lib/icons.ts                 # Oracle Icon (Sparkles/Eye)
src/components/layout/Sidebar.tsx # Nav Item hinzufügen
src/routes/RoutesRoot.tsx        # /oracle Route
```

**Änderungen:**
```typescript
// In Sidebar.tsx
const primaryNavItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/chart-v2', label: 'Chart', Icon: TrendingUp },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/oracle', label: 'Oracle', Icon: Sparkles }, // NEU
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
];
```

---

### ✅ Phase 5: Gamification (1-2 Tage)
**Was:** XP, Streaks, Journal-Integration

**Features:**
- 50 XP beim "Mark as Read"
- Oracle-Streak-Tracking
- "Oracle Master" Badge (21 Tage)
- Auto Journal Entry

**Trigger:**
```typescript
// In OraclePageV2.tsx
const handleMarkAsRead = async () => {
  await OracleService.markAsRead(activeEntry.id);

  // XP Grant
  journalStore.addXP(50, 'oracle-read');

  // Streak
  journalStore.streaks.oracle += 1;

  // Badge Check
  if (journalStore.streaks.oracle >= 21) {
    journalStore.addBadge('oracle-master');
  }

  // Journal Entry
  await createAutoJournalEntry(activeEntry);
};
```

---

### ✅ Phase 6: Notifications (1 Tag)
**Was:** Web Notification API für Score ≥ 6

**Implementation:**
```typescript
// In OraclePageV2.tsx
useEffect(() => {
  if (todayEntry?.score >= 6 && !todayEntry.notified) {
    Notification.requestPermission().then(perm => {
      if (perm === 'granted') {
        new Notification('⚡ Meta-Shift Alert!', {
          body: `Score: ${todayEntry.score}/7 · ${todayEntry.topTheme}`,
          icon: '/icon-192.png',
        });
        OracleService.updateEntry(todayEntry.id, { notified: true });
      }
    });
  }
}, [todayEntry]);
```

---

### ✅ Phase 7: Analytics (1-2 Tage)
**Was:** 30-Tage-Chart + Theme-Filter

**Chart:**
- X-Axis: Datum
- Y-Axis: Score (0-7)
- Farben: Nach Theme segmentiert
- Tooltip: Datum, Score, Theme, "View Report"

**Filter:**
```typescript
const themes: OracleTheme[] = [
  'All', 'Gaming', 'RWA', 'AI Agents', 'DePIN',
  'Privacy/ZK', 'Collectibles/TCG', 'Stablecoin Yield'
];
```

---

### ✅ Phase 8: Dokumentation & Testing (1-2 Tage)
**Was:** Docs + vollständige Test-Suite

**Dokumente:**
```bash
docs/core/oracle/INTEGRATION_CONCEPT.md   # ✅ Fertig
docs/core/oracle/DOMAIN_RULES.md          # TODO
docs/core/oracle/API_SPEC.md              # TODO
```

**Tests:**
```bash
pnpm test                        # Unit Tests
pnpm test:e2e                    # E2E Tests
```

---

## 🗂️ Datenbank-Schema

### Oracle Table (DB_VERSION 5)

```typescript
interface OracleEntry {
  id?: number;            // Auto-increment
  date: string;           // YYYY-MM-DD (unique)
  score: number;          // 0-7
  topTheme: OracleTheme;  // Gaming, RWA, etc.
  fullReport: string;     // Kompletter Grok-Report
  read: boolean;          // XP-Guard
  notified: boolean;      // Notification-Guard
  createdAt: number;      // Unix timestamp
}

// Indexes:
// - date (unique)
// - score
// - topTheme
// - createdAt
```

---

## 🔌 API Endpoint

### GET /api/oracle

**Cron:** Täglich 09:00 UTC
**Runtime:** Edge
**Timeout:** 30s (für 3x Grok-Calls)

**Response:**
```json
{
  "success": true,
  "data": {
    "report": "SCORE: 6/7\n\nNEXT META PROBABILITIES:\n- Gaming: 72%\n...",
    "score": 6,
    "theme": "Gaming"
  }
}
```

**Error Handling:**
```json
{
  "success": false,
  "error": "Grok API unavailable",
  "fallback": {
    "report": "[Last cached report from yesterday]",
    "score": 3,
    "theme": "Other"
  }
}
```

---

## 🎮 Gamification Flow

```mermaid
graph TD
    A[User öffnet /oracle] --> B{Heute gelesen?}
    B -->|Nein| C[Zeige Report]
    B -->|Ja| D[Zeige "Already Read"]
    C --> E[User klickt "Mark as Read"]
    E --> F[Prüfe read=false]
    F --> G[Grant 50 XP]
    G --> H[Increment oracle streak]
    H --> I{Streak >= 21?}
    I -->|Ja| J[Unlock "Oracle Master" Badge]
    I -->|Nein| K[Continue]
    J --> L[Create Journal Entry]
    K --> L
    L --> M[Set read=true]
```

---

## 🚦 Integration Checklist

### Data Layer
- [ ] Dexie Schema mit `oracle` Tabelle
- [ ] OracleService.ts mit CRUD-Funktionen
- [ ] TypeScript Types in oracle.ts

### Backend
- [ ] Edge Function `/api/oracle` (Grok-Orchestration)
- [ ] Vercel Cron-Config (09:00 UTC)
- [ ] Error Handling + Fallback-Logik

### State Management
- [ ] oracleStore.ts (Zustand)
- [ ] Integration mit journalStore (XP/Streaks)

### UI
- [ ] OraclePageV2.tsx (Haupt-Page)
- [ ] 6 Oracle-Komponenten (ReportViewer, ScoreCard, etc.)
- [ ] Responsive Design (Mobile + Desktop)

### Navigation
- [ ] Sidebar Nav Item
- [ ] Route in RoutesRoot.tsx
- [ ] Icon Export in icons.ts

### Features
- [ ] "Mark as Read" Flow (XP + Streak + Journal)
- [ ] Web Notifications (Score ≥ 6)
- [ ] 30-Tage-Chart mit Theme-Filter
- [ ] Offline Fallback

### Testing
- [ ] Unit Tests für OracleService + Store
- [ ] E2E Tests für alle Flows
- [ ] Performance Tests (Chart, API)

### Documentation
- [ ] DOMAIN_RULES.md
- [ ] API_SPEC.md
- [ ] Update CLAUDE.md

---

## 🛠️ Entwickler-Befehle

```bash
# Development
pnpm dev                         # Dev Server starten

# Type Checking
pnpm typecheck                   # TypeScript prüfen

# Testing
pnpm test                        # Unit Tests (Vitest)
pnpm test:e2e                    # E2E Tests (Playwright)
pnpm test:e2e:ui                 # E2E mit UI

# Linting
pnpm lint                        # ESLint prüfen
pnpm format                      # Prettier formatieren

# Build
pnpm build                       # Production Build
pnpm preview                     # Build-Vorschau
```

---

## 📚 Nächste Schritte

1. **Starten mit Phase 1**: Datenbank-Schema und OracleService implementieren
2. **API-Endpoint bauen**: `/api/oracle` mit Grok-Integration
3. **Store erstellen**: oracleStore.ts nach journalStore-Pattern
4. **UI implementieren**: OraclePageV2 + Komponenten
5. **Navigation integrieren**: Sidebar + Routes
6. **Features hinzufügen**: XP, Streaks, Notifications
7. **Tests schreiben**: Unit + E2E Coverage
8. **Dokumentieren**: Domain Rules + API Spec

---

**Status:** Planning Complete ✅
**Next Action:** Begin Phase 1 Implementation
**Estimated Total Time:** 10-15 Tage (abhängig von Team-Größe)

# 📋 Sparkfined PWA - Task Management

**Erstellt**: 2025-12-05
**Basierend auf**: Vollständige Codebase-Analyse & Bestandsaufnahme

---

## 🎯 Übersicht

Dieses Verzeichnis enthält **alle strukturierten Tasks** für die Sparkfined PWA, organisiert nach **Priorität und Dringlichkeit**.

**Gesamtstatus**:
- ✅ **Vollständig**: 70% (P0/P1/Push/AI-Cost-Guards/Journals durch Tests abgedeckt)
- 🟡 **In Arbeit**: 20% (Live-Provider-E2E, Monitoring-Dashboards)
- 🔴 **Nicht gestartet**: 10% (Docs-Ergänzungen/Sentry-Rollout)

---

## 📂 Ordnerstruktur

```
tasks/
├── P0-blocker/          # 🔴 KRITISCH - Vor Launch beheben
│   ├── 01-journal-crud-tests.md
│   ├── 02-api-contract-tests.md
│   ├── 03-ai-cost-guards-testing.md
│   ├── 04-push-notifications-testing.md
│   └── 05-e2e-test-stabilization.md
│
├── P1-critical/         # 🟠 WICHTIG - Für Beta Launch
│   ├── 01-replay-ohlc-live-integration.md
│   ├── 02-chart-snapshot-capture.md
│   ├── 03-export-pipeline.md
│   ├── 04-provider-muxing-swr-cache.md
│   └── 05-signal-matrix-completion.md
│
├── P2-important/        # 🟡 Feature Completion
│   ├── 01-wallet-transaction-monitor.md
│   ├── 02-setup-detector-data-fetching.md
│   └── 03-ai-cache-layer-completion.md
│
├── P3-performance/      # 🟢 Performance & Optimization
│   ├── 01-bundle-optimization.md
│   ├── 02-web-vitals-tracking.md
│   └── 03-image-optimization.md
│
├── P4-monitoring/       # 🔵 Monitoring & Observability
│   ├── 01-sentry-setup.md
│   ├── 02-cost-tracking-dashboard.md
│   └── 03-api-uptime-monitoring.md
│
├── P5-documentation/    # 🔷 Documentation
│   ├── 01-env-variables-documentation.md
│   ├── 02-api-openapi-spec.md
│   └── 03-contributing-guide.md
│
└── README.md            # 👈 Dieses Dokument
```

---

## 🚨 P0-BLOCKER (Kritisch)

**Deadline**: Vor R0 Launch (Woche 1-2)
**Status**: 🔴 5 Tasks, alle kritisch

| Task | Aufwand | Status | Owner |
|------|---------|--------|-------|
| [Journal CRUD Tests](./P0-blocker/01-journal-crud-tests.md) | 1-2 Tage | 🟢 DONE (Vitest Suite aktiv) | Dev Team |
| [API Contract Tests](./P0-blocker/02-api-contract-tests.md) | 2-3 Tage | 🟢 DONE (Journal/Rules/Ideas Contracts) | Backend |
| [AI Cost Guards Testing](./P0-blocker/03-ai-cost-guards-testing.md) | 1 Tag | 🟢 DONE (Budget Guards getestet) | Backend |
| [Push Notifications Testing](./P0-blocker/04-push-notifications-testing.md) | 1 Tag | 🟡 PARTIAL (Send-Endpoint E2E offen) | Frontend+Backend |
| [E2E Test Stabilization](./P0-blocker/05-e2e-test-stabilization.md) | 2 Tage | 🟢 DONE (Flows stabilisiert, Live-Daten-E2E offen) | QA |

**Gesamt**: ~8-10 Tage (parallelisierbar)

**Impact**:
- ❌ OHNE FIX: Keine Production Deployment möglich
- ❌ OHNE FIX: Technische Schuld eskaliert
- ❌ OHNE FIX: Datenverlust-Risiko ungetestet

---

## 🟠 P1-CRITICAL (Wichtig)

**Deadline**: R1 Beta Launch (Woche 3-5)
**Status**: 🟡 5 Tasks, teilweise implementiert

| Task | Aufwand | Status | Owner |
|------|---------|--------|-------|
| [Replay OHLC Live-Daten](./P1-critical/01-replay-ohlc-live-integration.md) | 2 Tage | 🟡 50% | Backend+Data |
| [Chart Snapshot Capture](./P1-critical/02-chart-snapshot-capture.md) | 2 Tage | 🟡 30% | Frontend |
| [Export Pipeline](./P1-critical/03-export-pipeline.md) | 1-2 Tage | 🟡 20% | Frontend |
| [Provider Muxing & SWR Cache](./P1-critical/04-provider-muxing-swr-cache.md) | 1-2 Tage | 🟡 60% | Backend |
| [Signal Matrix Completion](./P1-critical/05-signal-matrix-completion.md) | 3 Tage | 🟡 50% | Backend+Data |

**Gesamt**: ~10-12 Tage (parallelisierbar)

**Impact**:
- ⚠️ OHNE FIX: Replay Lab nicht nutzbar
- ⚠️ OHNE FIX: Kein Journal Export (User Lock-In)
- ⚠️ OHNE FIX: Hohe API Costs

---

## 🟡 P2-IMPORTANT (Feature Completion)

**Deadline**: R2 Production Alpha (Woche 6-8)

| Task | Aufwand | Status |
|------|---------|--------|
| [Wallet Transaction Monitor](./P2-important/01-wallet-transaction-monitor.md) | 2-3 Tage | 🔴 TODO |
| [Setup Detector Data Fetching](./P2-important/02-setup-detector-data-fetching.md) | 2 Tage | 🔴 TODO |
| [AI Cache Layer Completion](./P2-important/03-ai-cache-layer-completion.md) | 1-2 Tage | 🔴 TODO |

**Gesamt**: ~6-8 Tage

---

## 🟢 P3-PERFORMANCE (Optimization)

**Deadline**: R1 Beta (Woche 5-6)

| Task | Target | Status |
|------|--------|--------|
| [Bundle Optimization](./P3-performance/01-bundle-optimization.md) | <500 KB | 🔴 TODO |
| [Web Vitals Tracking](./P3-performance/02-web-vitals-tracking.md) | LCP <2s | 🔴 TODO |
| [Image Optimization](./P3-performance/03-image-optimization.md) | WebP | 🔴 TODO |

**Gesamt**: ~4 Tage

---

## 🔵 P4-MONITORING (Observability)

**Deadline**: R2 Production (Woche 6-7)

| Task | Target | Status |
|------|--------|--------|
| [Sentry Setup](./P4-monitoring/01-sentry-setup.md) | <0.1% Error Rate | 🔴 TODO |
| [Cost Tracking Dashboard](./P4-monitoring/02-cost-tracking-dashboard.md) | Budget Alerts | 🔴 TODO |
| [API Uptime Monitoring](./P4-monitoring/03-api-uptime-monitoring.md) | 99.9% Uptime | 🔴 TODO |

**Gesamt**: ~3-4 Tage

---

## 🔷 P5-DOCUMENTATION (Docs)

**Deadline**: R2 Production (Woche 6-9)

| Task | Target | Status |
|------|--------|--------|
| [Environment Variables Docs](./P5-documentation/01-env-variables-documentation.md) | .env.example | 🔴 TODO |
| [API OpenAPI Spec](./P5-documentation/02-api-openapi-spec.md) | Swagger UI | 🔴 TODO |
| [Contributing Guide](./P5-documentation/03-contributing-guide.md) | CONTRIBUTING.md | 🔴 TODO |

**Gesamt**: ~3-4 Tage

---

## 📊 Zeitplan-Übersicht

### **Sprint 1 (Woche 1-2): Stabilisierung**
**Fokus**: P0 Blocker beheben

```
Woche 1:
□ Journal CRUD Tests (2 Tage)
□ API Contract Tests (3 Tage)
□ AI Cost Guards (1 Tag)

Woche 2:
□ Push Notifications Tests (1 Tag)
□ E2E Test Stabilization (2 Tage)
□ Bugfixes & Nacharbeiten (2 Tage)
```

**Definition of Done**:
- ✅ Alle Tests grün
- ✅ `pnpm test` - Keine Skips
- ✅ `pnpm test:e2e` - Alle grün
- ✅ Keine P0 Blocker mehr

---

### **Sprint 2-3 (Woche 3-5): Feature Completion**
**Fokus**: P1 Critical Features

```
Woche 3:
□ Replay OHLC Live-Daten (2 Tage)
□ Provider Muxing & SWR Cache (2 Tage)
□ Chart Snapshot Capture (2 Tage)

Woche 4:
□ Export Pipeline (2 Tage)
□ Signal Matrix Completion (3 Tage)

Woche 5:
□ Bundle Optimization (2 Tage)
□ Web Vitals Tracking (1 Tag)
□ Nacharbeiten & Bugfixes (2 Tage)
```

**Definition of Done**:
- ✅ Alle R1 Features funktional
- ✅ Lighthouse Score >90
- ✅ Bundle Size <500 KB

---

### **Sprint 4-5 (Woche 6-8): Production-Ready**
**Fokus**: P2-P5 Tasks

```
Woche 6:
□ Sentry Setup (1 Tag)
□ Image Optimization (1 Tag)
□ Env Variables Docs (0.5 Tag)
□ Wallet Transaction Monitor (3 Tage)

Woche 7:
□ Setup Detector Data Fetching (2 Tage)
□ AI Cache Layer (2 Tage)
□ Cost Tracking Dashboard (1 Tag)

Woche 8:
□ API Uptime Monitoring (1 Tag)
□ API OpenAPI Spec (2 Tage)
□ Contributing Guide (1 Tag)
□ Final QA & Polish (1 Tag)
```

**Definition of Done**:
- ✅ Production Deployment erfolgreich
- ✅ Error Rate <0.1%
- ✅ LCP <1.5s
- ✅ Dokumentation vollständig

---

## 🎯 Kritischer Pfad (Critical Path)

**Abhängigkeitskette für R0 Launch**:

```
1. Journal CRUD Tests ✅
   ↓
2. API Contract Tests ✅
   ↓
3. E2E Test Stabilization ✅
   ↓
4. R0 LAUNCH READY
```

**Abhängigkeitskette für R1 Beta**:

```
1. Provider Muxing & SWR Cache ✅
   ↓
2. Replay OHLC Live-Daten ✅
   ↓
3. Signal Matrix Completion ✅
   ↓
4. Bundle Optimization ✅
   ↓
5. R1 BETA READY
```

---

## 📈 Fortschritts-Tracking

### Wie man Tasks tracked:

1. **Task öffnen**: Lies die detaillierte Beschreibung
2. **Status aktualisieren**: Markiere Subtasks als erledigt
3. **Tests validieren**: Führe Validation Commands aus
4. **PR erstellen**: Link Task in PR Description
5. **Review**: Code Review durch Tech Lead
6. **Merge**: Nach Approval mergen
7. **Close**: Task als "Completed" markieren

### Task Status-Labels:

- 🔴 **TODO** - Nicht gestartet
- 🟡 **IN PROGRESS** - In Arbeit
- 🟢 **COMPLETED** - Fertig
- ⏸️ **BLOCKED** - Blockiert durch Dependency
- ⚠️ **NEEDS REVIEW** - Wartet auf Code Review

---

## 🛠️ Validation Commands

Jede Task enthält **Validation Commands** am Ende:

```bash
# Example aus Journal CRUD Tests Task
pnpm vitest --run tests/unit/journal.crud.test.ts
pnpm vitest --coverage --testNamePattern="journal"
pnpm lint src/lib/JournalService.ts
pnpm typecheck
```

**Alle Tasks müssen folgende Checks bestehen**:
- ✅ `pnpm typecheck` - TypeScript Compiler
- ✅ `pnpm lint` - ESLint
- ✅ `pnpm test` - Unit Tests
- ✅ `pnpm test:e2e` - E2E Tests (wo applicable)

---

## 🔗 Verwandte Dokumente

- **Roadmap**: `docs/active/Roadmap.md` - High-Level Roadmap (R0→R1→R2)
- **Feature Status**: `docs/active/features/` - Detaillierte Feature Blocker
- **Tickets**: `docs/tickets/` - Domain-spezifische TODOs
- **Architecture**: `docs/architecture/` - System Design Docs

---

## 💡 Wie man neue Tasks hinzufügt

1. **Erstelle Markdown-Datei** im richtigen Prioritäts-Ordner
2. **Verwende Template**:
   ```markdown
   # Task Title

   **Priorität**: 🔴 P0 BLOCKER
   **Aufwand**: X Tage
   **Dringlichkeit**: SOFORT / R0 / R1 / R2
   **Abhängigkeiten**: Task XYZ

   ## Problem
   [Beschreibung des Problems]

   ## Tasks
   - [ ] Subtask 1
   - [ ] Subtask 2

   ## Acceptance Criteria
   ✅ Kriterium 1
   ✅ Kriterium 2

   ## Validation
   ```bash
   # Commands
   ```

   **Owner**: Team/Person
   **Status**: 🔴 TODO
   **Deadline**: Woche X
   ```

3. **Update README.md** (dieses Dokument)
4. **Commit & Push**

---

## 📞 Fragen?

Bei Fragen zu Tasks oder Priorisierung:
- **Tech Lead**: Für technische Clarifications
- **Product Owner**: Für Feature-Priorisierung
- **GitHub Issues**: Für Diskussionen zu spezifischen Tasks

---

## 🎉 Success Metrics

### R0 Launch (Woche 2)
- ✅ Alle P0 Blocker behoben
- ✅ Test Coverage >50%
- ✅ Keine kritischen Bugs

### R1 Beta (Woche 6)
- ✅ Alle P1 Critical Features fertig
- ✅ Lighthouse Score >90
- ✅ Bundle Size <500 KB
- ✅ LCP <2s

### R2 Production (Woche 12)
- ✅ Alle P2-P5 Tasks abgeschlossen
- ✅ Error Rate <0.05%
- ✅ Test Coverage >80%
- ✅ Dokumentation vollständig

---

**Last Updated**: 2025-12-05
**Maintained by**: Sparkfined Dev Team
**Total Tasks**: 23 (5× P0, 5× P1, 3× P2, 3× P3, 3× P4, 3× P5)
**Total Effort**: ~40-50 Tage (parallelisierbar auf 8-12 Wochen)

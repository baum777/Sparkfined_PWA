# 📋 Sparkfined PWA - Task Management

**Erstellt**: 2025-12-09
**Struktur-Update**: v2.0 - Neue Organisation nach Task-Typen

---

## 🎯 Übersicht

Dieses Verzeichnis enthält **alle strukturierten Tasks** für die Sparkfined PWA, organisiert nach **Task-Typ** für bessere Übersichtlichkeit und Wartbarkeit.

---

## 📂 Neue Struktur (seit 2025-12-09)

```
tasks/
├── issues/              # 🐛 Priority-basierte Issues & Tasks
│   ├── P0-blocker/         # 🔴 KRITISCH - Vor Launch beheben
│   ├── P1-critical/        # 🟠 WICHTIG - Für Beta Launch
│   ├── P2-important/       # 🟡 Feature Completion
│   ├── P3-performance/     # 🟢 Performance & Optimization
│   ├── P4-monitoring/      # 🔵 Monitoring & Observability
│   ├── P5-documentation/   # 🔷 Documentation
│   └── README.md           # Detaillierte Issue-Dokumentation
│
├── modul-review/        # 🔍 Modul-Reviews & Refactoring
│   └── (Modul-Review-Dokumentation)
│
└── README.md            # 👈 Dieses Dokument
```

---

## 📁 Ordner-Beschreibungen

### `issues/` - Priority-basierte Issues & Tasks

Enthält alle **konkreten Issues, Bugs und Feature-Tasks**, organisiert nach Priorität (P0-P5).

**Wann hier ablegen?**
- ✅ Konkrete Bugs und Fehler
- ✅ Feature-Implementierungen mit klarem Scope
- ✅ Test-Tasks und Stabilisierung
- ✅ Performance-Optimierungen
- ✅ Monitoring-Setup
- ✅ Dokumentations-Tasks

**Priorisierung**:
- **P0 (Blocker)**: MUSS vor Launch behoben werden
- **P1 (Critical)**: Wichtig für Beta Launch
- **P2 (Important)**: Feature Completion
- **P3 (Performance)**: Optimization
- **P4 (Monitoring)**: Observability
- **P5 (Documentation)**: Docs

**➡️ Mehr Details**: Siehe [`issues/README.md`](./issues/README.md)

---

### `modul-review/` - Modul-Reviews & Refactoring

Enthält **Modul-Reviews, Code-Audits und größere Refactoring-Planungen**.

**Wann hier ablegen?**
- ✅ Modul-spezifische Code-Reviews
- ✅ Architektur-Reviews (z.B. Journal-System, Chart-System)
- ✅ Refactoring-Vorschläge mit Analyse
- ✅ Design-System-Compliance-Audits
- ✅ Codebase-Gesundheits-Reports

**Format**:
- Markdown-Dateien mit Review-Ergebnissen
- Strukturierte Analyse (Zustand, Probleme, Vorschläge)
- Ggf. verlinkte Issues in `issues/` für konkrete Umsetzung

---

## 🚀 Workflow: Issues vs. Modul-Reviews

### Workflow für **Issues** (`tasks/issues/`)

1. **Issue identifizieren** (Bug, Feature, Tech Debt)
2. **Priorität festlegen** (P0-P5)
3. **Task-Datei erstellen** in `issues/PX-category/`
4. **Status tracken** (🔴 TODO → 🟡 IN PROGRESS → 🟢 COMPLETED)
5. **Validation durchführen** (Tests, Linting, TypeCheck)
6. **Issue schließen** nach Merge

**Template**: Siehe `issues/README.md` → "Wie man neue Tasks hinzufügt"

---

### Workflow für **Modul-Reviews** (`tasks/modul-review/`)

1. **Modul auswählen** (z.B. Journal-System, Alert-System)
2. **Review durchführen**:
   - Code-Struktur analysieren
   - Design-System-Compliance prüfen
   - Performance-Patterns bewerten
   - Test-Coverage bewerten
3. **Review-Dokument erstellen** in `modul-review/`
4. **Konkrete Issues ableiten** → in `issues/` ablegen
5. **Follow-Up tracken** über Issue-Links

**Format-Beispiel**:
```markdown
# Modul-Review: Journal-System

**Review-Datum**: 2025-12-09
**Reviewer**: Claude Code
**Modul-Version**: v2.0

## Scope
- JournalPageV2.tsx
- src/store/journalStore.ts
- src/lib/JournalService.ts
- src/components/journal/*

## Findings
### ✅ Positive
- [ Liste positiver Aspekte ]

### ⚠️ Kritisch
- [ Kritische Probleme ]

### 🔧 Verbesserungsvorschläge
- [ Konkrete Vorschläge ]

## Abgeleitete Issues
- [ ] tasks/issues/P1-critical/XX-journal-xyz.md
- [ ] tasks/issues/P2-important/YY-journal-abc.md
```

---

## 📊 Statistiken (aktualisiert 2025-12-11)

### Issues (`tasks/issues/`)
- **P0 Blocker**: 5 Tasks (🟢 5/5 DONE - 100%)
- **P1 Critical**: 5 Tasks (🟡 2/5 DONE, 2/5 IN PROGRESS, 1/5 TODO)
- **P2 Important**: 3 Tasks (🟡 1/3 DONE - AI Cache)
- **P3 Performance**: 3 Tasks (🔴 0/3 TODO)
- **P4 Monitoring**: 3 Tasks (🔴 0/3 TODO)
- **P5 Documentation**: 3 Tasks (🔴 0/3 TODO)

**Gesamt Status**:
- ✅ Completed: 14/25 (56%)
- 🟡 In Progress: 5/25 (20%)
- 🔴 TODO: 6/25 (24%)
- **Effort remaining**: ~35-40 Tage (parallelisierbar)

### Modul-Reviews (`tasks/modul-review/`)
- **Status**: Neu eingerichtet (leer)
- **Geplant**: Journal-System, Chart-System, Alert-System

---

## 🛠️ Commands

### Validation Commands (für Issues)
```bash
# TypeScript-Check
pnpm typecheck

# Linting
pnpm lint

# Unit Tests
pnpm test

# E2E Tests
pnpm test:e2e
```

### Review Commands (für Modul-Reviews)
```bash
# Code-Analyse
pnpm lint --report-unused-disable-directives

# Test-Coverage
pnpm test:coverage

# Bundle-Analyse
pnpm build && pnpm preview
```

---

## 🔗 Verwandte Dokumente

### Innerhalb von `tasks/`
- **Issues README**: [`tasks/issues/README.md`](./issues/README.md) - Detaillierte Issue-Dokumentation
- **Modul-Reviews**: `tasks/modul-review/` - Code-Review-Dokumentation

### Globale Dokumentation
- **Roadmap**: `docs/active/Roadmap.md` - High-Level Roadmap (R0→R1→R2)
- **Feature Status**: `docs/active/features/` - Detaillierte Feature Blocker
- **Architecture**: `docs/architecture/` - System Design Docs
- **Domain Rules**: `.claude/memories/` - AI-Guardrails & Domain-Regeln

---

## 💡 Wie man diese Struktur nutzt

### Als Entwickler
1. **Bug gefunden?** → Erstelle Issue in `issues/P0-blocker/` oder `issues/P1-critical/`
2. **Feature-Idee?** → Erstelle Issue in `issues/P2-important/`
3. **Code riecht komisch?** → Erstelle Modul-Review in `modul-review/`
4. **Refactoring nötig?** → Review in `modul-review/` → Issues in `issues/P2-P3/` ableiten

### Als Tech Lead
1. **Priorisierung**: Sortiere Issues in `issues/P0-P5/`
2. **Code-Audits**: Plane Reviews in `modul-review/`
3. **Sprint-Planning**: Nutze `issues/README.md` → Zeitplan-Übersicht
4. **Fortschritt tracken**: Status-Updates in Issue-Dateien

### Als Product Owner
1. **Feature-Requests**: Prüfe `issues/P1-P2/` für offene Features
2. **Launch-Blocker**: Prüfe `issues/P0-blocker/` für kritische Issues
3. **Roadmap-Alignment**: Nutze `issues/README.md` → Sprint-Übersicht

---

## 📞 Fragen?

Bei Fragen zu dieser neuen Struktur:
- **Task-Priorisierung**: Siehe `issues/README.md`
- **Modul-Review-Prozess**: Siehe `modul-review/README.md` (coming soon)
- **Globale Guardrails**: Siehe `.claude/memories/overview.md`

---

## 📈 Migration-Historie

### v2.0 (2025-12-09)
- ✅ Neue Top-Level-Struktur: `issues/` + `modul-review/`
- ✅ Alle alten P0-P5 Tasks nach `issues/` migriert
- ✅ Neue Ordner für Modul-Reviews eingerichtet

### v1.0 (2025-12-05)
- Initiale Task-Struktur mit P0-P5 direkt in `tasks/`

---

## 📋 Latest Status Update (2025-12-11)

### 🟢 R0 LAUNCH IS READY!
All P0 blockers have been completed:
- ✅ Journal CRUD Tests: 42 tests passing
- ✅ API Contract Tests: 25 tests passing
- ✅ AI Cost Guards: 16 tests passing
- ✅ Push Notifications: 25 tests passing
- ✅ E2E Test Stabilization: Journal + Analyze flows stabilized

### 🟡 Critical Path for R1 Beta
Blocking issues to resolve next:
1. **Export Pipeline** (P1-critical/03): ExportService still throws "Not implemented" - Issue #11
2. **Provider Muxing & SWR Cache** (P1-critical/04): `getTokenSnapshot` unimplemented, needs SWR cache layer
3. **Replay OHLC Integration** (P1-critical/01): 70% done - OHLC Replay Engine works, live data providers needed

See: [`tasks/issues/README.md`](./issues/README.md) for detailed task breakdown

---

**Last Updated**: 2025-12-11 (comprehensive status audit)
**Maintained by**: Sparkfined Dev Team
**Structure Version**: v2.0
**R0 Status**: ✅ LAUNCH READY
**R1 ETA**: Woche 4-5 (Subject to Export Pipeline + Provider Muxing resolution)

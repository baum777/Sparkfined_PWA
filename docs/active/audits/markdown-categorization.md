# Markdown-Dateien Audit & Kategorisierung

**Erstellt:** 2025-11-25
**Branch:** `claude/audit-markdown-files-015YcUygZjwPDHyGS7XbvfKJ`
**Agent:** Claude Code (Repository Auditor)

---

## Executive Summary

**Gesamt-Markdown-Dateien:** ~150+
**Kategorisiert:** 146 Dateien in 4 Kategorien
**Empfehlung:** 13 Dateien für Archivierung, 0 für Löschung (alles hat Wert)

---

## Kategorisierung nach Nutzung & Relevanz

### 🟢 Kategorie 1: AKTUELL / REGULARLY USED

**Definition:** Aktive Dokumente, die täglich/wöchentlich genutzt und aktualisiert werden.

**Anzahl:** 42 Dateien

#### Root-Level (13 Dateien)
| Datei | Größe | Letzte Änderung | Nutzung | Grund |
|-------|-------|-----------------|---------|-------|
| `README.md` | 25 KB | 2025-11-25 | Täglich | Haupt-Projekt-Dokumentation (Hero's Journey) |
| `CLAUDE.md` | 16 KB | 2025-11-24 | Täglich | Claude Code Konfiguration (Auto-generiert) |
| `AGENTS.md` | 15 KB | 2025-11-24 | Täglich | Codex Konfiguration (Auto-generiert) |
| `Sparkfined_Working_Plan.md` | 50 KB | 2025-11-24 | Täglich | Aktiver Working-Plan (Section 7 Grok Pulse) |
| `Sparkfined_Execution_Log.md` | 42 KB | 2025-11-24 | Täglich | Execution-Log (alle Sessions) |
| `UI_ERROR_REPORT.md` | 37 KB | 2025-11-21 | Wöchentlich | UI-Review-Report (23 Fehler dokumentiert) |
| `Sparkfined_Global_Rules.md` | 4 KB | 2025-11-24 | Wöchentlich | Globale Coding-Rules |
| `IMPROVEMENT_ROADMAP.md` | 11 KB | 2025-11-24 | Wöchentlich | Roadmap (R0, R1, R2 Phases) |
| `RISK_REGISTER.md` | 6 KB | 2025-11-24 | Wöchentlich | Risk-Tracking & Mitigation |
| `PR_TEMPLATE.md` | 1 KB | 2025-11-24 | Bei jedem PR | Pull-Request-Template |
| `MARKDOWN_DOCS_REFACTORING_PLAN.md` | 12 KB | 2025-11-24 | Abgeschlossen | Refactoring-Plan (Cleanup #3) |
| `MARKDOWN_DOCS_REFACTORING_SUMMARY.md` | 12 KB | 2025-11-24 | Abgeschlossen | Refactoring-Summary |
| `MIGRATION-PLAN-SERVERLESS-CONSOLIDATION.md` | 25 KB | 2025-11-24 | Aktiv | Serverless-Migration-Plan |

#### .rulesync/ (21 Dateien)
**Alle 21 Dateien sind AKTUELL und Teil des Rulesync-Systems:**

**SYSTEM-Files (11 Dateien):**
- `00-project-core.md` — Vision, Tech-Stack, Domain-Map
- `01-typescript.md` — TypeScript strict-mode, Conventions
- `02-frontend-arch.md` — React-Architecture, 5-Layer-Model
- `03-pwa-conventions.md` — Service-Worker, Offline-Mode
- `04-ui-ux-components.md` — Design-Principles, Component-Taxonomy
- `05-api-integration.md` — Serverless-APIs, fetchWithRetry
- `06-testing-strategy.md` — Test-Pyramid, Vitest, Playwright
- `07-accessibility.md` — WCAG 2.1 AA, Semantic-HTML
- `08-performance.md` — Bundle-Size, Core-Web-Vitals
- `09-security.md` — Secrets-Management, Input-Validation
- `10-deployment.md` — Vercel-Config, CI/CD, Rollback
- `11-ai-integration.md` — Dual-AI-Provider (OpenAI + Grok)

**ITERATIVE-Files (6 Dateien):**
- `_planning.md` — Sprint-Planning & Roadmap
- `_planning-current.md` — Aktueller Sprint
- `_context.md` — Session-Context (allgemein)
- `_context-session.md` — Session-Context (spezifisch)
- `_intentions.md` — Design-Decisions (11 ADRs)
- `_experiments.md` — Tech-Spikes, A/B-Tests
- `_log.md` — Timeline, Releases
- `_agents.md` — Multi-Tool-Routing-Map

**Meta:**
- `README_RULESYNC.md` — Rulesync-Dokumentation

#### .cursor/rules/ (4 Dateien)
- `00-core.md` — Core-Conventions (generated from .rulesync)
- `01-frontend.md` — Frontend-Hints (generated)
- `02-backend.md` — Backend-Hints (generated)
- `03-ops.md` — Ops-Hints (generated)

#### docs/ Active Docs (4 Hauptkategorien)
**docs/README.md** — Navigation-Hub (v4.0, 2025-11-20) ✅

**docs/setup/ (5 Dateien):**
- `environment-and-providers.md` — API-Keys, Env-Vars ✅
- `build-and-deploy.md` — Build-Process, Deployment ✅
- `push-notifications.md` — Web-Push-Setup ✅
- `vercel-deploy-checklist.md` — Pre-Deploy-Checklist ✅
- `env_inventory.md` — Env-Variable-Inventory ✅

---

### 🔵 Kategorie 2: CORE-LOGIK & STRUKTUR

**Definition:** Referenz-Dokumentation für Architektur, Features, Konzepte (nicht täglich geändert, aber essentiell).

**Anzahl:** 38 Dateien

#### docs/pwa-audit/ (7 Dateien)
- `01_repo_index.md` — Repository-Struktur ✅
- `02_feature_catalog.md` — Feature-Katalog ✅
- `03_core_flows.md` — Core-User-Flows ✅
- `04_offline_sync_model.md` — Offline-First-Architecture ✅
- `05_security_privacy.md` — Security & Privacy ✅
- `06_tests_observability_gaps.md` — Testing-Gaps ✅
- `07_future_concepts.md` — Future-Enhancements ✅

#### docs/features/ (3 Dateien)
- `advanced-insight-backend-wiring.md` — Advanced-Insight-Implementation ✅
- `production-ready.md` — Production-Readiness-Checklist ✅
- `next-up.md` — Upcoming-Features (F-02 bis F-07) ✅

#### docs/concepts/ (3 Dateien)
- `ai-roadmap.md` — AI-Feature-Roadmap ✅
- `journal-system.md` — Journal-System-Design ✅
- `signal-orchestrator.md` — Signal-Orchestration-Concept ✅

#### docs/process/ (2 Dateien)
- `product-overview.md` — Product-Vision & Features ✅
- `onboarding-blueprint.md` — User-Onboarding-Strategy ✅

#### docs/design/ (2 Dateien)
- `IMPLEMENTATION_GUIDE.md` — Design-Implementation-Guide ✅
- `LOGO_DESIGN_DOCUMENTATION.md` — Logo-Design-Specs ✅

#### docs/guides/ (1 Datei)
- `access-tabs.md` — Access-Gating-Tabs-Guide ✅

#### docs/ai/ (8 Dateien)
- `README_AI.md` — AI-System-Overview ✅
- `integration-recommendations.md` — AI-Provider-Recommendations ✅
- `advanced-insight-ui-spec-beta-v0.9.md` — Advanced-Insight-UI-Spec ✅
- `layered-analysis-model.md` — L1-L5-Analysis-Model ✅
- `event-catalog-overview.md` — Event-System-Overview ✅
- `ab-testing-plan.md` — A/B-Testing-Strategy ✅
- `ADVANCED_INSIGHT_FILES_MANIFEST.md` — File-Manifest ✅
- `HANDOVER_CODEX_ADVANCED_INSIGHT_UI.md` — Codex-Handover-Checklist ✅

#### docs/lore/ (7 Dateien — Brand & Storytelling)
- `three-pillars.md` — Core-Product-Pillars ✅
- `hero-journey-full.md` — User-Hero-Journey-Narrative ✅
- `onboarding-dialogs.md` — Onboarding-Copy & Dialogs ✅
- `degens-creed.md` — Community-Manifesto ✅
- `community-posts-templates.md` — Social-Media-Templates ✅
- `x-timeline-posts.md` — X/Twitter-Content-Calendar ✅
- `nft-meme-collection-concept.md` — NFT-Collection-Concept ✅

#### docs/ Indexing
- `index.md` — Documentation-Inventory ✅

---

### 🟡 Kategorie 3: ÜBERHOLT MIT RELEVANTEN THEMEN & KONTEXT

**Definition:** Archivierte Dokumente mit wertvollem Kontext, aber nicht mehr aktiv genutzt.

**Anzahl:** 80 Dateien (in `docs/archive/`)

#### docs/archive/ Struktur (gut organisiert!)

**archive/cleanup/ (7 Dateien):**
- `README.md` — Cleanup-Timeline & Guidelines ✅
- `CLEANUP_SUMMARY.md` — Cleanup #1 (2025-11-09) ✅
- `CLEANUP_COMPLETE.md` — Cleanup #1 Completion ✅
- `REPO_CLEANUP_SUMMARY.md` — Cleanup #2 (2025-11-15) ✅
- `REPO_CLEANUP_INVENTORY.md` — Cleanup #2 Inventory ✅
- `REPO_CLEANUP_DECISIONS.md` — Cleanup #2 Decisions ✅
- `VERIFY_RULESYNC.md` — Rulesync-Verification ✅

**archive/features/ (7 Dateien):**
- `README.md` — Feature-Archive-Index ✅
- `ADVANCED_INSIGHT_BACKEND_WIRING_COMPLETE.md` — Backend-Wiring (2025-11-15) ✅
- `ADVANCED_INSIGHT_IMPLEMENTATION_SUMMARY.md` — Frontend-UI (2025-11-15) ✅
- `ADVANCED_INSIGHT_BACKEND_WIRING_SUMMARY_BETA_V09.md` — Wiring-Summary ✅
- `WIRING_SUMMARY.md` — Quick-Wiring-Summary ✅
- `IMPLEMENTATION_SUMMARY.md` — General-Implementation ✅
- `DELIVERABLES_MANIFEST.md` — Deliverables-Checklist ✅

**archive/audits/ (6 Dateien):**
- `REPOSITORY_AUDIT_2025-11-20.md` — Latest-Audit (Health 6.5/10) ✅
- `production-readiness-report.md` — Production-Readiness ✅
- `verifications.md` — Verification-Checklist ✅
- `PERFORMANCE_AUDIT.md` — Performance-Audit ✅
- `PRODUCTION_READINESS_TEST_REPORT.md` — Test-Report ✅
- `TEST_AUDIT_REPORT.md` — Test-Coverage-Audit ✅

**archive/handovers/ (Keine separate Kategorie, in anderen Ordnern)**

**archive/telemetry/ (4 Dateien):**
- `README.md` — Telemetry-Archive-Index ✅
- `DELIVERABLES_CHECKLIST.md` — Telemetry-Deliverables ✅
- `reports/EVENTS_MAPPING.md` — Events-Mapping ✅
- `reports/telemetry_qa_checklist.md` — QA-Checklist ✅
- `reports/summary_findings.md` — Summary-Findings ✅

**archive/phases/ (10 Dateien):**
- `PHASE_4_COMPLETE.md` — Per-Tab-Iteration ✅
- `PHASE_5_COMPLETE.md` — Post-Launch-Polish ✅
- `PHASE_6_COMPLETE.md` — Backend-API-Stubs ✅
- `PHASE_8_COMPLETE.md` — Post-Launch-Quick-Wins ✅
- `PHASE_A_PROGRESS.md` — Foundation ✅
- `PHASE_B_PROGRESS.md` — Board-Layout ✅
- `PHASE_C_PROGRESS.md` — Interaction & States ✅
- `PHASE_D_PROGRESS.md` — Data & API ✅
- `PHASE_E_PROGRESS.md` — Offline & A11y ✅

**archive/deployment/ (2 Dateien):**
- `VERCEL_DEPLOYMENT_CHECKLIST.md` — Vercel-Checklist ✅
- `DEPLOYMENT_READY.md` — Deployment-Ready ✅

**archive/ai-bundles/ (Keine Markdown, nur ZIPs)**

**archive/raw/2025-11-12/ (20+ Dateien):**
Alle alten Docs von 2025-11-12, konsolidiert in aktuelle Docs:
- `PROJEKT_ÜBERSICHT.md` → `docs/process/product-overview.md` ✅
- `JOURNAL_SPECIFICATION.md` → `docs/concepts/journal-system.md` ✅
- `API_KEYS.md` → `docs/setup/environment-and-providers.md` ✅
- `ENVIRONMENT_VARIABLES.md` → `docs/setup/environment-and-providers.md` ✅
- ... (alle 20+ Dateien haben neues Ziel)

**archive/removed/ (1 Datei):**
- `INDEX.md` — Index entfernter Dokumente ✅

**archive/ Root-Level (12 Dateien):**
- `README.md` — Archive-Index ✅
- `BUILD_NOTES.md` — Phase-1-Build-Notes ✅
- `TABS_ORDER.md` — Phase-3-Tabs-Order ✅
- `REPOSITORY_ANALYSE_2025-11-07.md` — Repo-Analyse ✅
- `LANDING_PAGE_CONCEPT.md` — Landing-Page-Concept ✅
- `CRYPTOBER_PRÄSENTATION.md` — Cryptober-Präsentation ✅
- `PWA_LOAD_FAILURE_FINAL.md` — PWA-Load-Failure-Fix ✅
- `PWA_BLACK_SCREEN_FIX.md` — Black-Screen-Fix ✅
- `CRYPTOBER_PRESENTER_GUIDE.md` — Presenter-Guide ✅
- `SCAN.md` — Phase-0-Repo-Scan ✅
- `PWA_CHECKLIST.md` — Phase-2-PWA-Checklist ✅
- `BUILD_FIX_REPORT.md` — Build-Fix-Report ✅
- `BOARD_IMPLEMENTATION_PLAN.md` — Board-Plan (Phase A-D) ✅
- `SOLANA_ADAPTER_MIGRATION.md` — Solana-Adapter-Migration ✅
- `INSTALLATION_COMPLETE.md` — Installation-Complete ✅
- `TABS_MAP.md` — Phase-3-Tabs-Map ✅
- `CHART_A11Y_GUIDELINES.md` — Chart-Accessibility ✅
- `CLEANUP_REPORT_2025-11-09.md` — Cleanup-Report #1 ✅
- `TODO_INDEX.md` — Old-TODO-Index ✅

**docs/README_LEGACY.md:**
- Legacy-README (erbt von altem README, vor Hero's Journey) ✅

**Weitere Archive-Ordner:**
- `docs/archive/v1-migration-backup/` — V1-Legacy-Code-Archive (nicht Markdown)

---

### ⚫ Kategorie 4: OHNE RELEVANZ ODER NUTZEN

**Definition:** Duplikate, temporäre Dateien, oder wirklich obsolete Dokumente.

**Anzahl:** 0 Dateien

**Grund:** Nach Analyse haben alle Markdown-Dateien Wert:
- Root-Level-Dateien sind alle aktiv
- .rulesync ist das aktive Rulesync-System
- docs/ ist gut organisiert und aktuell
- docs/archive/ ist sauber strukturiert und dokumentiert

**Empfehlung:** **Keine Löschungen nötig!**

---

## Detaillierte Empfehlungen

### ✅ Was behalten (alles!)

**Alle 150+ Markdown-Dateien haben einen klaren Zweck:**

1. **Root-Level (13):** Aktive Projektdokumentation
2. **.rulesync/ (21):** Aktives Rulesync-Multi-Tool-Prompt-System
3. **.cursor/ (4):** Generated Tool-Configs
4. **docs/ Active (38):** Core-Dokumentation
5. **docs/archive/ (80):** Wertvoller historischer Kontext

### 📦 Was archivieren (optional)

**13 Dateien könnten in `docs/archive/completed-plans/` verschoben werden:**

| Datei | Grund | Ziel |
|-------|-------|------|
| `MARKDOWN_DOCS_REFACTORING_PLAN.md` | Cleanup #3 abgeschlossen | `docs/archive/cleanup/` |
| `MARKDOWN_DOCS_REFACTORING_SUMMARY.md` | Cleanup #3 abgeschlossen | `docs/archive/cleanup/` |
| `docs/README_LEGACY.md` | Legacy-README (vor Hero's Journey) | `docs/archive/` |
| `docs/CI_FIX_PHASE_1_WORKFLOW.md` | Old CI-Fix (deprecated) | `docs/archive/` |
| `docs/CI_STATUS_NOW.md` | Old CI-Status (deprecated) | `docs/archive/` |
| `docs/CI_FIX_PHASE_3_HEAVY_STEPS.md` | Old CI-Fix (deprecated) | `docs/archive/` |
| `docs/Batch_Zombie_Scan_Report.md` | Old Zombie-Scan (deprecated) | `docs/archive/` |
| `docs/grok-pulse.md` | Old Grok-Pulse-Spec (superseded by Section 7) | `docs/archive/` |
| `docs/PR_RUN_SUMMARY.md` | Old PR-Run-Summary (deprecated) | `docs/archive/` |
| `docs/Active_Branch_Integration_Plan.md` | Old Branch-Plan (deprecated) | `docs/archive/` |
| `docs/TS_FIX_PLAN.md` | Old TS-Fix-Plan (completed) | `docs/archive/` |
| `docs/Branch_Analysis_hardening_F-02.md` | Old Branch-Analysis (deprecated) | `docs/archive/` |
| `docs/live-data-v1.md` | Old Live-Data-Spec (superseded) | `docs/archive/` |

**Empfohlene Struktur:**
```
docs/archive/
  cleanup/          ← Cleanup #1, #2, #3 Docs
  completed-plans/  ← Neue Kategorie für abgeschlossene Pläne
    MARKDOWN_DOCS_REFACTORING_PLAN.md
    MARKDOWN_DOCS_REFACTORING_SUMMARY.md
    TS_FIX_PLAN.md
    ...
  deprecated/       ← Neue Kategorie für alte CI/PR/Branch-Docs
    CI_FIX_PHASE_1_WORKFLOW.md
    CI_STATUS_NOW.md
    ...
```

### 🗑️ Was löschen (nichts!)

**Keine Löschungen empfohlen.**

**Grund:** Alle Dateien haben historischen Wert oder sind Teil der aktiven Dokumentation.

---

## Statistiken

### Datei-Verteilung

| Kategorie | Anzahl | Prozent | Status |
|-----------|--------|---------|--------|
| **Aktuell / Regularly Used** | 42 | 29% | ✅ Täglich/Wöchentlich genutzt |
| **Core-Logik & Struktur** | 38 | 26% | ✅ Referenz-Dokumentation |
| **Überholt mit Kontext** | 80 | 55% | ✅ Archiviert, aber wertvoll |
| **Ohne Relevanz** | 0 | 0% | — |
| **Gesamt** | ~146 | 100% | |

### Größen-Verteilung (Root-Level)

| Datei | Größe | Kategorie |
|-------|-------|-----------|
| `Sparkfined_Working_Plan.md` | 50 KB | Aktuell |
| `Sparkfined_Execution_Log.md` | 42 KB | Aktuell |
| `UI_ERROR_REPORT.md` | 37 KB | Aktuell |
| `README.md` | 25 KB | Aktuell |
| `MIGRATION-PLAN-SERVERLESS-CONSOLIDATION.md` | 25 KB | Aktuell |
| `CLAUDE.md` | 16 KB | Aktuell |
| `AGENTS.md` | 15 KB | Aktuell |

**Durchschnittliche Größe:** 20 KB
**Gesamt-Root-Level:** ~260 KB

### Archiv-Statistiken

**docs/archive/ Dateien:** 80
**Letzte Archive-Aktion:** 2025-11-20 (Cleanup #3)
**Archive-Kategorien:** 8 (cleanup, features, audits, telemetry, phases, deployment, ai-bundles, raw, removed)

---

## Qualitätsbewertung

### 🟢 Sehr gut strukturiert

1. **Root-Level:** Klare Trennung (Working-Docs, Config-Files, Reports)
2. **.rulesync/:** Perfektes Rulesync-System (11 SYSTEM + 6 ITERATIVE)
3. **docs/:** Ausgezeichnete Struktur (setup, process, concepts, features, lore, archive)
4. **docs/archive/:** Sehr gut organisiert (cleanup, features, audits, phases, etc.)

### 🟡 Verbesserungspotenzial

1. **13 Dateien für Archive:** Siehe "Was archivieren" oben
2. **docs/index.md:** Könnte aktualisiert werden (zeigt alte 2025-11-12 Migration)
3. **Naming-Konsistenz:** Einige Dateien haben inkonsistente Naming-Conventions:
   - `MARKDOWN_DOCS_REFACTORING_PLAN.md` (UPPERCASE)
   - `docs/setup/environment-and-providers.md` (lowercase-kebab)
   - `Sparkfined_Working_Plan.md` (PascalCase_Underscore)

### 🔴 Keine kritischen Probleme

**Alle Dokumente sind wertvoll und gut organisiert!**

---

## Aktions-Empfehlungen

### Sofort (Optional)

1. **Archivierung (13 Dateien):**
   ```bash
   # Completed Plans
   mv MARKDOWN_DOCS_REFACTORING_PLAN.md docs/archive/cleanup/
   mv MARKDOWN_DOCS_REFACTORING_SUMMARY.md docs/archive/cleanup/

   # Deprecated Docs
   mkdir -p docs/archive/deprecated
   mv docs/CI_FIX_PHASE_1_WORKFLOW.md docs/archive/deprecated/
   mv docs/CI_STATUS_NOW.md docs/archive/deprecated/
   mv docs/CI_FIX_PHASE_3_HEAVY_STEPS.md docs/archive/deprecated/
   mv docs/Batch_Zombie_Scan_Report.md docs/archive/deprecated/
   mv docs/grok-pulse.md docs/archive/deprecated/
   mv docs/PR_RUN_SUMMARY.md docs/archive/deprecated/
   mv docs/Active_Branch_Integration_Plan.md docs/archive/deprecated/
   mv docs/TS_FIX_PLAN.md docs/archive/deprecated/
   mv docs/Branch_Analysis_hardening_F-02.md docs/archive/deprecated/
   mv docs/live-data-v1.md docs/archive/deprecated/
   mv docs/README_LEGACY.md docs/archive/

   # Update Archive README
   echo "## deprecated/" >> docs/archive/README.md
   echo "Deprecated CI/CD, PR, and branch-specific documentation." >> docs/archive/README.md
   ```

2. **Update docs/archive/README.md:**
   - Füge neue Kategorie `deprecated/` hinzu
   - Update Statistiken (80 → 93 Dateien)

### Kurzfristig (Diese Woche)

1. **Consistency-Check:**
   - Einheitliches Naming-Schema für Root-Level-Dateien etablieren
   - Empfehlung: `UPPERCASE_UNDERSCORE.md` für Pläne/Logs, `kebab-case.md` für Guides

2. **docs/index.md Update:**
   - Aktualisiere mit neuen Kategorisierungen
   - Entferne Referenzen zu 2025-11-12 Migration (bereits abgeschlossen)

### Mittelfristig (Nächster Monat)

1. **README.md Sections:**
   - Erwäge Link zu diesem Audit-Report im README
   - Update Documentation-Sektion mit klarer Struktur-Übersicht

2. **Quarterly Archive Review:**
   - Alle 3 Monate: Review von `docs/archive/` auf obsolete Inhalte
   - Konsolidierung von Phase-Reports (PHASE_4-8 → `PHASES_COMPLETE.md`)

---

## Fazit

**Sparkfined PWA hat eine ausgezeichnete Dokumentations-Struktur!**

✅ **Stärken:**
- Klares Rulesync-Multi-Tool-Prompt-System (.rulesync/)
- Gut organisierte docs/ mit klaren Kategorien
- Hervorragendes Archiv-System (docs/archive/)
- Alle Dokumente haben Wert (keine Blocker-Dateien)

🟡 **Verbesserungspotenzial:**
- 13 Dateien könnten archiviert werden (optional)
- Naming-Konsistenz könnte verbessert werden
- docs/index.md könnte aktualisiert werden

🎯 **Empfehlung:**
- **Keine Löschungen** (alles hat Wert)
- **Optional:** 13 Dateien in `docs/archive/deprecated/` verschieben
- **Weiter so!** Die Dokumentation ist vorbildlich organisiert

---

**Ende des Audits**

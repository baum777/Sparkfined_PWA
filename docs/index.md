---
title: "Dokumentationsinventar"
summary: "Zuordnung der Alt-Dokumente zu den vier Zielkategorien inkl. neuer Pfade."
sources:
  - docs/pwa-audit/meta/categorization.csv
  - docs/process/product-overview.md
  - docs/process/onboarding-blueprint.md
  - docs/concepts/journal-system.md
  - docs/concepts/signal-orchestrator.md
  - docs/concepts/ai-roadmap.md
  - docs/guides/access-tabs.md
  - docs/setup/environment-and-providers.md
  - docs/setup/build-and-deploy.md
---

| Original | Kategorie | Kurzbeschreibung | Aktion | Neuer Pfad |
| --- | --- | --- | --- | --- |
| `docs/archive/raw/2025-11-12/PROJEKT_ÜBERSICHT.md`, `docs/archive/raw/2025-11-12/REPO_STRUKTURPLAN_2025.md` | Process | Projektvision, Feature-Matrix, Architektur-Layer | Inhalte konsolidiert | `docs/process/product-overview.md` |
| `docs/archive/raw/2025-11-12/ONBOARDING_STRATEGY.md`, `docs/archive/raw/2025-11-12/ONBOARDING_IMPLEMENTATION_COMPLETE.md`, `docs/archive/raw/2025-11-12/ONBOARDING_QUICK_START.md` | Process | Persona-basierte Einführung, Komponenten & Snippets | Inhalte konsolidiert | `docs/process/onboarding-blueprint.md` |
| `docs/archive/raw/2025-11-12/JOURNAL_SPECIFICATION.md` | Concepts | Journal-Datenmodell & Komponenten | Zusammengefasst | `docs/concepts/journal-system.md` |
| `docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_INTEGRATION.md`, `docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_USE_CASE.md`, `docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_EXAMPLE.json`, `docs/archive/raw/2025-11-12/SIGNAL_UI_INTEGRATION.md` | Concepts | Signal-Pipeline, Action Graph, UI | Inhalte konsolidiert | `docs/concepts/signal-orchestrator.md` |
| `docs/archive/raw/2025-11-12/CORTEX_INTEGRATION_PLAN.md`, `docs/archive/raw/2025-11-12/ENV_USAGE_OVERVIEW.md` | Concepts | AI- & Cortex-Features, Env-Verwendung | Zusammengefasst | `docs/concepts/ai-roadmap.md` |
| `docs/archive/raw/2025-11-12/ACCESS_PAGE_TAB_IMPROVEMENTS.md` | Guides | Access-Tab UX & Tests | Inhalte konsolidiert | `docs/guides/access-tabs.md` |
| `docs/archive/raw/2025-11-12/API_KEYS.md`, `docs/archive/raw/2025-11-12/ENVIRONMENT_VARIABLES.md`, `docs/archive/raw/2025-11-12/SETUP_DEXPAPRIKA_MORALIS.md`, `docs/archive/raw/2025-11-12/DEXPAPRIKA_MORALIS_CHECKLIST.md` | Setup | Environment & Datenprovider | Inhalte konsolidiert | `docs/setup/environment-and-providers.md` |
| `docs/archive/raw/2025-11-12/BUILD_SCRIPTS_EXPLAINED.md`, `docs/archive/raw/2025-11-12/DEPLOY_GUIDE.md`, `docs/archive/raw/2025-11-12/DEPLOY_CHECKLIST.md` | Setup | Build-/Deploy-Skripte & QA | Inhalte konsolidiert | `docs/setup/build-and-deploy.md` |
| `docs/pwa-audit/*` | Process | Audit-Artefakte (Inventar, Features, Flows etc.) | Neu erstellt | `docs/pwa-audit/` |

Archivierte Originale liegen unter `docs/archive/raw/2025-11-12/`. Weitere unveränderte Dateien (z. B. `docs/README.md`, `docs/lore/`) behalten ihren bestehenden Platz und sind für zukünftige Konsolidierung markiert (`Kategorie E`).


---

## 📦 Neue Ergänzungen (2025-12-03)

### Rulesync & AI Agent Setup
- **`.rulesync/rules/overview.md`** - Globale AI-Guardrails und Projektübersicht
- **`.rulesync/rules/journal-system.md`** - Journal-Domain spezifische Regeln
- **`.rulesync/.aiignore`** - AI-Kontext Ausschluss-Muster
- **`.rulesync/HANDOVER.md`** - Setup-Anleitung für Rulesync
- **`rulesync.jsonc`** - Rulesync Hauptkonfiguration

### Aus Root verschobene Dokumente
| Original (Root) | Neue Location | Kategorie |
|-----------------|---------------|-----------|
| `BUNDLE-OPTIMIZATION-PLAN.md` | `docs/process/` | Process |
| `BUNDLE-OPTIMIZATION-RESULT.md` | `docs/process/` | Process |
| `BUNDLE-SIZE-FINAL-SUMMARY.md` | `docs/process/` | Process |
| `STYLING-UPDATES.md` | `docs/design/` | Design |
| `UX-IMPROVEMENTS-SUMMARY.md` | `docs/design/` | Design |
| `UX-TEST-STATUS.md` | `docs/qa/` | QA |
| `sparkfined-style-guide.html` | `docs/design/` | Design |

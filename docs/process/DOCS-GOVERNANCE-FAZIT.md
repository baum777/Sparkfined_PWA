# Sparkfined Dokumentations-Governance – Fazit & Handlungsempfehlungen

**Datum:** 2025-12-04  
**Erstellt von:** Claude (Background Agent)  
**Kontext:** Prüfung der vorgeschlagenen 7×7-Regelwerk gegen aktuellen Repository-Status

---

## 🎯 Zusammenfassung in 3 Sätzen

1. **Root ist sauber ✅** – Nur `README.md`, `AGENTS.md`, `CLAUDE.md` im Root (wie gefordert)
2. **`/docs` ist überfüllt ❌** – 16 Ordner statt max. 7, mehrere Ordner mit >7 Dateien
3. **Governance-Fundament existiert ⚠️** – `.rulesync/rules/` enthält Regeln, aber `rulesync.jsonc` fehlen Enforcement-Mechanismen

---

## ✅ Was funktioniert bereits

### 1. Root-Level Disziplin (100% compliant)

```
/workspace/
  ├── README.md   ✅ (550 Zeilen, umfassende Projekt-Doku)
  ├── AGENTS.md   ✅ (237 Zeilen, AI-Guardrails)
  └── CLAUDE.md   ✅ (241 Zeilen, Claude-Instruktionen)
```

**Bewertung:** Keine weiteren `.md`-Dateien im Root → **perfekt**.

### 2. Umfassende Dokumentation

- **157 Markdown-Dateien** insgesamt
- Alle wichtigen Domains abgedeckt (Architecture, Concepts, Process, Guides, etc.)
- Klare Trennung zwischen Code (`src/`) und Doku (`docs/`)

**Bewertung:** Hohe Abdeckung, aber **zu fragmentiert** (siehe Probleme unten).

### 3. Rulesync-Infrastruktur

- `.rulesync/rules/overview.md` → enthält globale Guardrails
- `.rulesync/rules/journal-system.md` → Domain-spezifische Regeln
- `rulesync.jsonc` → konfiguriert Outputs für Cursor, Claude, Copilot, Cline

**Bewertung:** Fundament steht, aber **Governance-Regeln fehlen im Config**.

---

## ❌ Was noch nicht funktioniert

### 1. 7×7-Regel massiv verletzt (KRITISCH)

**Ist-Zustand:**

| Metrik | Ist | Soll | Status |
|--------|-----|------|--------|
| **Ordner in `/docs`** | 16 | 7 | ❌ 229% überschritten |
| **Root-Dateien in `/docs`** | 21 | 7 | ❌ 300% überschritten |
| **Größter Ordner** | `/docs/design/` (41 Dateien) | ≤7 | ❌ 586% überschritten |

**Konsequenzen:**
- Schwer navigierbar für neue Contributors
- AI-Agents müssen 16 Ordner scannen (statt 7) → höherer Token-Verbrauch
- Unklare Grenzen (z. B. `/docs/design/` vs. `/docs/core/design/`)

### 2. `/docs/design/` ist ein Monolith (KRITISCH)

**Problem:**
- **41 Dateien** in einem Ordner (davon 11 `.tsx`-Komponenten!)
- Mix aus Wireframes, Styleguides, Tokens, Logo-SVGs
- Keine Substruktur

**Beispiele:**
```
/docs/design/
├── STYLING-UPDATES.md
├── UX-IMPROVEMENTS-SUMMARY.md
├── design-system.md
├── wireframes/mobile/*.md (12 Dateien)
├── Sparkfined_V2_Design_Tokens.md
└── *.tsx (11 Komponenten-Beispiele)
```

**Warum das ein Problem ist:**
- Verstößt gegen 7×7-Regel um Faktor 6
- Code (`.tsx`) gehört nicht in `/docs`
- Unübersichtlich für Humans und AI

### 3. Fehlende CHANGELOG.md (HOCH PRIORITÄR)

**Problem:**
- `/docs/CHANGELOG.md` existiert nicht
- Keine Audit-Trail für Doku-Änderungen
- AI-Agents können Doku-Evolution nicht nachvollziehen

**Konsequenz:**
- Unklar, welche Dokumente aktuell vs. veraltet sind
- Schwer, redundante Dokumente zu identifizieren

### 4. `rulesync.jsonc` hat keine Governance-Regeln (MITTEL PRIORITÄR)

**Aktueller Stand:**
```jsonc
{
  "targets": ["cursor", "claudecode", "copilot", "cline"],
  "features": ["rules", "ignore"],
  "outputs": { ... }
}
```

**Was fehlt (aus deinem Blueprint):**
- `global_instructions` Array
- `directories` Object mit Enforcement-Regeln (`enforce_7x7: true`)
- `documentation_change_rules` (z. B. `require_changelog_update: true`)
- `recommended_docs_structure`

**Konsequenz:**
- Regeln sind nur Dokumentation (`.rulesync/rules/overview.md`), nicht Code
- Keine automatische Validierung möglich

---

## 🔧 Vorgeschlagene Lösung: 7-Ordner-Konsolidierung

### Aktuell (16 Ordner) → Soll (7 Ordner)

| Neuer Ordner | Merge von | Inhalt |
|--------------|-----------|--------|
| **01_architecture/** | `architecture/`, `core/architecture/` | System Design, PWA Audit, Chart System |
| **02_concepts/** | `core/concepts/`, `core/ai/`, `events/` | Journal, Oracle, Signal-Orchestrator, AI-Roadmap |
| **03_specs/** | `tickets/`, `bugs/`, `internal/` | Feature-Tickets, Bug-Templates, interne Notizen |
| **04_process/** | `process/`, `active/`, `ci/`, `qa/` | Workflows, CI/CD, QA-Checklists, Execution Logs |
| **05_guides/** | `core/guides/`, `core/setup/` | Setup, Deployment, Access-Tabs, Onboarding |
| **06_decisions/** | `core/lore/`, `handover/`, `metrics/` | Hero's Journey, ADRs, Handover-Docs, Baselines |
| **07_archive/** | `archive/`, `telemetry/`, alte Dateien | Historische Artefakte, obsolete Docs |

### Root-Dateien in `/docs` (21 Dateien)

**Aktuelle Situation:**
- 21 `.md`-Dateien direkt in `/docs/` (z. B. `API_LANDSCAPE.md`, `PITCH_DECK.md`, `UI_STYLE_GUIDE.md`)

**Ziel:**
- Nur 3 Dateien in `/docs/` Root:
  - `README.md` (Doku-Entrypoint)
  - `index.md` (Inventar, existiert bereits)
  - `CHANGELOG.md` (neu erstellen!)

**Aktion:**
- Alle 21 Dateien in 01-06 Ordner verschieben (siehe Mapping unten)

---

## 📋 Konkrete Aktionen (Priority Order)

### 🔴 Sofort (diese Woche)

#### 1. `/docs/CHANGELOG.md` erstellen

**Template:**
```markdown
# Documentation Changelog

## 2025-12-04

### Added
- Created `DOCS-GOVERNANCE-AUDIT.md` and `DOCS-GOVERNANCE-FAZIT.md`
- Established 7×7 governance rules

### Changed
- (to be filled as changes happen)

### Archived
- (to be filled when moving docs to 07_archive)
```

**Warum:** Ohne Changelog keine Governance-Compliance.

#### 2. `/docs/design/` aufspalten

**Aktion:**
```bash
# Wireframes → eigener Ordner (schon teilweise vorhanden)
/docs/design/wireframes/  (behalten, aber auf 7 Dateien reduzieren)

# .tsx-Dateien → raus aus /docs
mv /docs/design/*.tsx /src/examples/ oder /archive/

# Tokens → eigene Datei oder in 02_concepts/
mv /docs/design/Sparkfined_V2_Design_Tokens.md /docs/02_concepts/design-tokens.md

# Styleguides → konsolidieren
Merge: design-system.md + UI_STYLE_GUIDE.md + DESIGN_TOKENS_STYLEGUIDE_DE.md
```

**Ziel:** Max. 7 Dateien in `/docs/design/` (oder Ordner ganz auflösen in 02_concepts/).

#### 3. Root-Dateien verschieben (21 Dateien)

**Mapping:**

| Datei | Neuer Ort |
|-------|-----------|
| `API_LANDSCAPE.md` | `01_architecture/api-landscape.md` |
| `PITCH_DECK.md` | `06_decisions/pitch-deck.md` |
| `UI_STYLE_GUIDE.md` | `02_concepts/ui-style-guide.md` |
| `LINT_RULESYNC_SPARKFINED.md` | `04_process/lint-rulesync.md` |
| `TS_RULESYNC_SPARKFINED.md` | `04_process/ts-rulesync.md` |
| ... | (alle 21 Dateien zuordnen) |

**Ergebnis:** Nur `README.md`, `index.md`, `CHANGELOG.md` in `/docs/` Root.

### 🟡 Kurzfristig (nächste 2 Wochen)

#### 4. 16 Ordner → 7 Ordner konsolidieren

**Vorgehen:**
1. Erstelle neue Ordner: `01_architecture/` bis `07_archive/`
2. Verschiebe Dateien gemäß Mapping-Tabelle oben
3. Update `/docs/index.md` mit neuer Struktur
4. Dokumentiere Migration in `/docs/CHANGELOG.md`

**Zeitaufwand:** ~4-6 Stunden (manuell) oder 30 Min (via Script).

#### 5. `rulesync.jsonc` erweitern

**Fehlende Felder hinzufügen:**
```jsonc
{
  "project": "Sparkfined_PWA",
  "version": 1,
  "meta": { ... },
  "global_instructions": [ ... ],
  "directories": {
    "/": { "allowed_docs": [...], "deny_other_markdown_docs": true },
    "/docs": {
      "enforce_7x7": true,
      "max_subdirectories": 7,
      "max_files_per_directory": 7
    }
  },
  "documentation_change_rules": {
    "require_changelog_update": true,
    "changelog_path": "/docs/CHANGELOG.md"
  }
}
```

**Warum:** Macht Governance programmatisch validierbar.

#### 6. `/docs/archive/` → `/docs/07_archive/` standardisieren

**Aktion:**
```bash
mv /docs/archive /docs/07_archive
mkdir -p /docs/07_archive/2024
mkdir -p /docs/07_archive/2025-Q1
```

**Policy:**
- Obsolete Docs → `/docs/07_archive/YYYY-MM/`
- Füge Header hinzu: `> [ARCHIVED] Merged into: <new-doc-path>`

### 🟢 Mittelfristig (nächster Monat)

#### 7. CI-Checks für 7×7-Regel

**Ziel:** GitHub Action, die bei PR prüft:
- Max. 7 Ordner in `/docs`
- Max. 7 Dateien pro Ordner
- `CHANGELOG.md` wurde updated

**Tool:** Shell-Script oder Python-Script in `.github/workflows/`.

#### 8. Dokumentations-Dashboard (Optional)

**Nice-to-have:**
- Dashboard zeigt: Ordner-Count, Dateien pro Ordner, Violations
- Alert bei 7×7-Verletzung

---

## 🎓 Fazit & Ausblick

### Was haben wir gelernt?

1. **Root-Governance funktioniert** – Sparkfined hat bereits gute Root-Hygiene.
2. **7×7-Regel ist verletzt** – `/docs` ist mit 16 Ordnern und 157+ Dateien überfüllt.
3. **Rulesync ist Foundation, nicht Enforcement** – `.rulesync/rules/` sind Guidelines, kein Code.

### Was ist der nächste Schritt?

**Priorität 1 (sofort):**
- [ ] `/docs/CHANGELOG.md` erstellen
- [ ] `/docs/design/` aufspalten (41 → 7 Dateien)
- [ ] 21 Root-Dateien in 01-06 Ordner verschieben

**Priorität 2 (diese Woche):**
- [ ] 16 Ordner → 7 Ordner konsolidieren
- [ ] `rulesync.jsonc` erweitern mit Governance-Regeln
- [ ] `/docs/index.md` aktualisieren

**Priorität 3 (nächster Monat):**
- [ ] CI-Check für 7×7-Regel
- [ ] Pre-Commit-Hook für `CHANGELOG.md`-Pflicht

### Wer macht was?

| Task | Owner | Deadline |
|------|-------|----------|
| CHANGELOG.md erstellen | Cheikh/Claude | 2025-12-05 |
| `/docs/design/` aufspalten | Claude | 2025-12-05 |
| 16→7 Ordner-Migration | Cheikh | 2025-12-11 |
| `rulesync.jsonc` erweitern | Claude | 2025-12-06 |
| CI-Check implementieren | Cheikh | 2025-12-31 |

---

## 📊 Vorher/Nachher-Vergleich

### Vorher (Ist-Zustand)

```
/docs/ (16 Ordner, 157+ Dateien)
├── active/
├── archive/ (100+ Dateien)
├── architecture/
├── bugs/
├── ci/
├── core/ (7 Subdirs!)
├── design/ (41 Dateien!)
├── events/
├── handover/
├── internal/
├── metrics/
├── process/
├── qa/
├── telemetry/
├── tickets/
├── ui/
└── 21 Root-Dateien (API_LANDSCAPE.md, PITCH_DECK.md, ...)
```

**Probleme:**
- Zu viele Ordner (16 statt 7)
- Unklare Kategorisierung
- Große Ordner mit >7 Dateien

### Nachher (Ziel-Zustand)

```
/docs/ (7 Ordner, max. 7 Dateien pro Ordner)
├── 01_architecture/      (System Design, API Landscape, PWA Audit)
├── 02_concepts/          (Journal, Oracle, Signal-Orchestrator, AI, Design Tokens)
├── 03_specs/             (Tickets, Bugs, Feature Specs)
├── 04_process/           (CI/CD, QA, Workflows, Lint/TS Rules)
├── 05_guides/            (Setup, Deployment, Onboarding)
├── 06_decisions/         (Lore, ADRs, Metrics, Pitch Deck)
├── 07_archive/           (Historische Docs, obsolete Dateien)
├── README.md             (Doku-Entrypoint)
├── index.md              (Inventar)
└── CHANGELOG.md          (Audit-Trail)
```

**Vorteile:**
- Klar strukturiert, leicht navigierbar
- AI-Agents können effizienter scannen
- 7×7-Regel eingehalten
- Changelog ermöglicht Tracking

---

## 🏁 Schlusswort

**Das vorgeschlagene Regelwerk ist exzellent konzipiert**, aber der aktuelle `/docs`-Zustand ist historisch gewachsen und verletzt die 7×7-Regel signifikant.

**Die gute Nachricht:**
- Root ist sauber ✅
- Fundament (Rulesync, AGENTS.md, CLAUDE.md) steht ✅
- Migration ist machbar (4-6 Stunden Aufwand) ✅

**Die Herausforderung:**
- Konsequente Umsetzung erfordert Disziplin
- Alle Contributors müssen 7×7-Regel kennen und respektieren
- Enforcement via CI ist empfohlen (sonst schleichende Re-Fragmentierung)

**Meine Empfehlung:**
1. **Sofort:** CHANGELOG.md + `/docs/design/` Split (1-2 Stunden)
2. **Diese Woche:** 16→7 Ordner-Migration (4-6 Stunden)
3. **Nächste Woche:** CI-Check + Pre-Commit-Hook (2-3 Stunden)

**Danach habt ihr ein zukunftssicheres, KI-optimiertes Dokumentations-System.**

---

**Audit durchgeführt von:** Claude (Sonnet 4.5, Background Agent)  
**Nächster Review:** 2025-12-11 (Follow-up nach 7 Tagen)  
**Status:** 📋 Audit abgeschlossen, 🚀 Handlungsempfehlungen bereit

---

## 📎 Anhänge

### A. Mapping aller 21 Root-Dateien in `/docs`

| Datei | Kategorie | Neuer Pfad |
|-------|-----------|------------|
| `API_LANDSCAPE.md` | Architecture | `01_architecture/api-landscape.md` |
| `LOOP_J3A_INTEGRATION_EXAMPLE.md` | Concepts | `02_concepts/loop-j3a-example.md` |
| `Repo_Branch_Cleanup_Plan.md` | Process | `04_process/repo-branch-cleanup.md` |
| `Branch_Cleanup_Status.md` | Process | `04_process/branch-cleanup-status.md` |
| `UPDATES_2025-12-02.md` | Process | `04_process/updates-2025-12-02.md` |
| `Session_Final_Report_2025-11-23.md` | Process | `04_process/session-report-2025-11-23.md` |
| `HOMEPAGE_CONCEPT_2025.md` | Decisions | `06_decisions/homepage-concept-2025.md` |
| `PITCH_DECK.md` | Decisions | `06_decisions/pitch-deck.md` |
| `UI_ANALYSIS_SUMMARY.md` | Concepts | `02_concepts/ui-analysis-summary.md` |
| `UI_STYLE_GUIDE.md` | Concepts | `02_concepts/ui-style-guide.md` |
| `UX-IMPROVEMENTS.md` | Concepts | `02_concepts/ux-improvements.md` |
| `DESIGN_TOKENS_STYLEGUIDE_DE.md` | Concepts | `02_concepts/design-tokens-de.md` |
| `RESPONSIVE_GUIDELINES.md` | Concepts | `02_concepts/responsive-guidelines.md` |
| `LINT_RULESYNC_SPARKFINED.md` | Process | `04_process/lint-rulesync.md` |
| `TS_RULESYNC_SPARKFINED.md` | Process | `04_process/ts-rulesync.md` |
| `SERVERLESS_REFACTOR_GUIDE_FOR_CODEX.md` | Architecture | `01_architecture/serverless-refactor.md` |
| `design-system.md` | Concepts | `02_concepts/design-system.md` |
| `README.md` (in `/docs`) | Keep | `README.md` (behalten) |
| `index.md` | Keep | `index.md` (behalten) |
| `CHANGELOG.md` | NEW | `CHANGELOG.md` (erstellen!) |

### B. Vorgeschlagener `.rulesync/rules/docs-governance.md`

Optional: Neue Rule-Datei für Doku-Governance.

```markdown
# Documentation Governance Rules

## 7×7 Rule
- Max 7 folders in `/docs`
- Max 7 files per folder

## Root-Level Rules
- Only `README.md`, `AGENTS.md`, `CLAUDE.md` allowed in repo root
- No other `.md` files in root

## Change Tracking
- Every doc change must update `/docs/CHANGELOG.md`
- Include: date, summary, files touched, reason

## Archive Policy
- Obsolete docs → `/docs/07_archive/`
- Never hard-delete documentation
- Add archive header: `> [ARCHIVED] Merged into: <path>`

## Scan Before Create
- Before creating new `.md` in `/docs`, scan for existing related docs
- Prefer extending existing docs over creating new ones
```

---

**Ende des Fazits.** Fragen? → Siehe `/docs/process/DOCS-GOVERNANCE-AUDIT.md` für Details.

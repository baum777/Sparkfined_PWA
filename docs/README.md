# Sparkfined PWA — Documentation

**Version:** 4.1 (Restructured 2025-11-25)
**Purpose:** Centralized documentation hub for developers, AI agents, and contributors.

---

## 📂 Documentation Structure

```
docs/
├── README.md (this file)       — Documentation navigation hub
├── active/                     — Active working documents & current development
├── core/                       — Stable reference documentation
└── archive/                    — Historical documentation & completed work
```

---

## 🟢 Active Documentation

**Purpose:** Current working documents, sprint plans, reports, and ongoing feature development.

**Location:** [`docs/active/`](./active/README.md)

### Key Documents

| Document | Purpose | Update Frequency |
|----------|---------|------------------|
| [Working_Plan.md](./active/Working_Plan.md) | Active sprint plan & sections | Daily |
| [Execution_Log.md](./active/Execution_Log.md) | Session-by-session log (all agents) | Per session |
| [Roadmap.md](./active/Roadmap.md) | Product roadmap (R0, R1, R2) | Weekly |
| [Risk_Register.md](./active/Risk_Register.md) | Risk tracking & mitigation | Weekly |

### Active Subdirectories

- **[features/](./active/features/)** — Current feature specs (next-up, production-ready, advanced-insight)
- **[migrations/](./active/migrations/)** — Ongoing technical migrations (serverless-consolidation)
- **[reports/](./active/reports/)** — Current status reports (ui-errors)
- **[audits/](./active/audits/)** — Active audits (markdown-categorization)

---

## 🔵 Core Documentation

**Purpose:** Stable reference documentation for architecture, setup, concepts, and design.

**Location:** [`docs/core/`](./core/)

### Architecture & System Design

- **[architecture/](./core/architecture/)** — System architecture, features, flows, security
  - Repo index, feature catalog, core flows
  - Offline/sync model, security/privacy
  - Tests & observability gaps, future concepts

### Setup & Deployment

- **[setup/](./core/setup/)** — Environment setup, build process, deployment
  - Environment variables & data providers
  - Build & deploy guide
  - Push notifications setup
  - SEO & sitemap configuration
  - Vercel deployment checklist

### Concepts & Roadmaps

- **[concepts/](./core/concepts/)** — Design concepts & feature roadmaps
  - AI integration roadmap
  - Journal system specification
  - Signal orchestrator concept

### Process & Product

- **[process/](./core/process/)** — Product vision & onboarding
  - Product overview & architecture
  - Onboarding blueprint

### Design System

- **[design/](./core/design/)** — Design implementation & brand assets
  - Implementation guide
  - Logo design documentation
  - Design tokens & section summaries

### Guides & How-Tos

- **[guides/](./core/guides/)** — Practical how-to guides
  - Access tabs guide

### QA & Testing

- **[qa/](./qa/)** — Quality assurance & testing documentation
  - E2E testing guide (Playwright)
  - Manual QA checklist
  - UX test status

### AI Integration

- **[ai/](./core/ai/)** — AI system documentation
  - AI system README
  - Integration recommendations
  - Advanced Insight UI spec (Beta v0.9)
  - Layered analysis model (L1-L5)
  - Event catalog overview
  - A/B testing plan
  - File manifests & handovers

### Brand & Storytelling

- **[lore/](./core/lore/)** — Brand narrative & community content
  - Three Pillars of Sparkfined
  - Hero's Journey narrative
  - Onboarding dialogs
  - The Degen's Creed
  - Community post templates
  - X/Twitter timeline posts
  - NFT/Meme collection concept

---

## ⚫ Archive Documentation

**Purpose:** Historical documentation, completed work, and deprecated docs.

**Location:** [`docs/archive/`](./archive/README.md)

### Archive Categories

- **[cleanup/](./archive/cleanup/)** — Documentation cleanup history
  - Cleanup #1, #2, #3 summaries
  - Rulesync verification
  - Restructuring plans

- **[features/](./archive/features/)** — Completed feature implementations
  - Advanced Insight implementation history
  - Wiring summaries & deliverables

- **[audits/](./archive/audits/)** — Historical audit reports
  - Repository audits
  - Production readiness reports
  - Performance & test audits

- **[telemetry/](./archive/telemetry/)** — Telemetry implementation history
  - Events mapping
  - QA checklists
  - Summary findings

- **[phases/](./archive/phases/)** — Phase completion reports
  - PHASE_4-8 completions
  - PHASE_A-E progress trackers

- **[deployment/](./archive/deployment/)** — Deployment history
  - Vercel deployment checklists
  - Deployment ready reports

- **[deprecated/](./archive/deprecated/)** — Deprecated documentation
  - Old CI/CD workflows
  - Superseded plans & specs
  - Legacy READMEs

- **[raw/](./archive/raw/)** — Raw snapshots by date
  - 2025-11-12 consolidation
  - Historical project overviews

- **[removed/](./archive/removed/)** — Index of removed docs

---

## 🤖 AI Agent Configurations

**Purpose:** Centralized AI tool configurations (Cursor, Claude Code, Codex, Rulesync).

**Location:** [`../AGENT_FILES/`](../AGENT_FILES/README.md)

### Tools

- **[.rulesync/](../AGENT_FILES/.rulesync/)** — Multi-tool prompt system (Source of Truth)
  - 11 SYSTEM files (stable rules)
  - 6 ITERATIVE files (dynamic context)

- **[.cursor/](../AGENT_FILES/.cursor/)** — Cursor IDE rules (auto-generated)
- **[CLAUDE.md](../AGENT_FILES/CLAUDE.md)** — Claude Code config (auto-generated)
- **[AGENTS.md](../AGENT_FILES/AGENTS.md)** — Codex config (auto-generated)
- **[Global_Rules.md](../AGENT_FILES/Global_Rules.md)** — Cross-tool coding rules

---

## 🗺️ Quick Navigation

### For Developers

**Getting Started:**
1. [Environment Setup](./core/setup/environment-and-providers.md)
2. [Build & Deploy](./core/setup/build-and-deploy.md)
3. [Product Overview](./core/process/product-overview.md)

**Development:**
- [Architecture Overview](./core/architecture/01_repo_index.md)
- [Core Flows](./core/architecture/03_core_flows.md)
- [AI Integration](./core/ai/README_AI.md)
- [E2E Testing Guide](./qa/e2e-testing-guide.md)

**Current Work:**
- [Active Sprint Plan](./active/Working_Plan.md)
- [Execution Log](./active/Execution_Log.md)
- [Roadmap](./active/Roadmap.md)

### For AI Agents

**Configuration:**
- [Rulesync System](../AGENT_FILES/.rulesync/README_RULESYNC.md)
- [Claude Code Rules](../AGENT_FILES/CLAUDE.md)
- [Codex Rules](../AGENT_FILES/AGENTS.md)

**Context:**
- [Current Planning](../AGENT_FILES/.rulesync/_planning-current.md)
- [Session Context](../AGENT_FILES/.rulesync/_context-session.md)
- [Design Decisions (ADRs)](../AGENT_FILES/.rulesync/_intentions.md)

### For Contributors

**Understanding the Project:**
1. [Product Overview](./core/process/product-overview.md)
2. [Hero's Journey Narrative](./core/lore/hero-journey-full.md)
3. [Three Pillars](./core/lore/three-pillars.md)

**Contributing:**
- [Onboarding Blueprint](./core/process/onboarding-blueprint.md)
- [Feature Catalog](./core/architecture/02_feature_catalog.md)
- [Next Up Features](./active/features/next-up.md)

---

## 📈 Documentation Lifecycle

### Active → Core → Archive

**Active:**
- Current working documents
- Updated daily/weekly
- Moved to core when stable

**Core:**
- Stable reference documentation
- Updated monthly/quarterly
- Rarely archived (unless superseded)

**Archive:**
- Completed work
- Historical context
- Retained for reference (6 months minimum)

### Automation

**Quarterly Review:**
```bash
# Archive documents older than 6 months
./scripts/archive-old-docs.sh

# Validate all links
./scripts/check-markdown-links.sh
```

---

## 🔗 External Links

- **GitHub Repository:** https://github.com/baum777/Sparkfined_PWA
- **Live Demo:** https://sparkfined-pwa.vercel.app
- **Deployment:** https://vercel.com/baum777/sparkfined-pwa

---

## 📝 Changelog

### v4.1 (2025-11-25) — Documentation Restructuring
- **Added:** `active/`, `core/` subdirectories
- **Moved:** pwa-audit → core/architecture
- **Moved:** features/, setup/, etc. → core/
- **Created:** AGENT_FILES/ for centralized AI configs
- **Result:** Root 90% cleaner (13 → 3 files)

### v4.0 (2025-11-20) — Documentation Consolidation
- Migrated raw/ docs to core/ structure
- Improved navigation with README.md hub

### v3.0 (2025-11-12) — Rulesync Integration
- Added .rulesync/ multi-tool prompt system
- Generated CLAUDE.md, AGENTS.md configs

---

**Last Updated:** 2025-11-25
**Maintained by:** AI Agents (Claude, Codex) + Human Oversight

# Sparkfined PWA — Documentation

**Version:** 4.0 (Reorganized & Cleaned)
**Last Updated:** 2025-11-20
**Status:** ✅ Production-Ready

---

## 📋 Quick Navigation

### 🎯 I want to...

**...understand the project**
→ Start with `/README.md` (project root) for overview

**...set up the development environment**
→ [`setup/environment-and-providers.md`](./setup/environment-and-providers.md)

**...deploy the application**
→ [`setup/build-and-deploy.md`](./setup/build-and-deploy.md)
→ [`setup/vercel-deploy-checklist.md`](./setup/vercel-deploy-checklist.md)

**...understand the architecture**
→ [`pwa-audit/01_repo_index.md`](./pwa-audit/01_repo_index.md)
→ [`pwa-audit/02_feature_catalog.md`](./pwa-audit/02_feature_catalog.md)

**...work with AI features**
→ [`ai/integration-recommendations.md`](./ai/integration-recommendations.md)
→ [`ai/advanced-insight-ui-spec-beta-v0.9.md`](./ai/advanced-insight-ui-spec-beta-v0.9.md)

**...understand onboarding strategy**
→ [`process/onboarding-blueprint.md`](./process/onboarding-blueprint.md)
→ [`lore/onboarding-dialogs.md`](./lore/onboarding-dialogs.md)

**...find historical documentation**
→ [`archive/README.md`](./archive/README.md) (organized by category)

---

## 📁 Documentation Structure

```
docs/
├── README.md                                   ← You are here (Navigation guide)
├── index.md                                    ← Index of all documentation
├── PR_RUN_SUMMARY.md                           ← Pull request summaries
│
├── setup/                                      ← 🔧 Installation & Deployment (5 files)
│   ├── environment-and-providers.md            ← API keys, env vars, providers
│   ├── build-and-deploy.md                     ← Build process & deployment steps
│   ├── push-notifications.md                   ← Web Push setup guide
│   ├── vercel-deploy-checklist.md              ← Pre-deploy verification checklist
│   └── env-inventory.md                        ← Complete env variable inventory
│
├── process/                                    ← 📊 Product & Planning (2 files)
│   ├── product-overview.md                     ← Product vision & features
│   └── onboarding-blueprint.md                 ← User onboarding strategy
│
├── lore/                                       ← 🎭 Brand & Storytelling (7 files)
│   ├── three-pillars.md                        ← Core product pillars
│   ├── hero-journey-full.md                    ← User hero journey narrative
│   ├── onboarding-dialogs.md                   ← Onboarding copy & dialogs
│   ├── degens-creed.md                         ← Community manifesto
│   ├── community-posts-templates.md            ← Social media templates
│   ├── x-timeline-posts.md                     ← X/Twitter content calendar
│   └── nft-meme-collection-concept.md          ← NFT collection concept
│
├── features/                                   ← 🚀 Feature Documentation (3 files)
│   ├── advanced-insight-backend-wiring.md      ← Advanced Insight implementation
│   ├── next-up.md                              ← Upcoming features
│   └── production-ready.md                     ← Production readiness checklist
│
├── concepts/                                   ← 💡 Design Concepts (3 files)
│   ├── ai-roadmap.md                           ← AI feature roadmap
│   ├── journal-system.md                       ← Journal system design
│   └── signal-orchestrator.md                  ← Signal orchestration concept
│
├── design/                                     ← 🎨 Design Documentation (2 files)
│   ├── IMPLEMENTATION_GUIDE.md                 ← Design implementation guide
│   └── LOGO_DESIGN_DOCUMENTATION.md            ← Logo design specs
│
├── guides/                                     ← 📖 User & Developer Guides (1 file)
│   └── access-tabs.md                          ← Access gating tabs guide
│
├── pwa-audit/                                  ← 🔍 Architecture Audit (7 files)
│   ├── 01_repo_index.md                        ← Repository structure overview
│   ├── 02_feature_catalog.md                   ← Complete feature catalog
│   ├── 03_core_flows.md                        ← Core user flows
│   ├── 04_offline_sync_model.md                ← Offline-first architecture
│   ├── 05_security_privacy.md                  ← Security & privacy design
│   ├── 06_tests_observability_gaps.md          ← Testing & observability gaps
│   └── 07_future_concepts.md                   ← Future enhancements
│
├── ai/                                         ← 🤖 AI Integration (8 files)
│   ├── README_AI.md                            ← AI system overview
│   ├── integration-recommendations.md          ← AI provider recommendations
│   ├── advanced-insight-ui-spec-beta-v0.9.md   ← Advanced Insight UI spec
│   ├── layered-analysis-model.md               ← L1-L5 analysis model
│   ├── event-catalog-overview.md               ← Event system overview
│   ├── ab-testing-plan.md                      ← A/B testing strategy
│   ├── ADVANCED_INSIGHT_FILES_MANIFEST.md      ← File manifest
│   └── HANDOVER_CODEX_ADVANCED_INSIGHT_UI.md   ← Codex handover checklist
│
└── archive/                                    ← 📦 Historical Documentation
    ├── README.md                               ← Archive index & navigation
    ├── cleanup/                                ← Cleanup history & reports
    ├── features/                               ← Completed feature implementations
    ├── audits/                                 ← Historical audit reports
    ├── handovers/                              ← Completed handover checklists
    ├── telemetry/                              ← Telemetry reports & findings
    ├── phases/                                 ← Phase completion reports
    ├── deployment/                             ← Legacy deployment docs
    ├── ai-bundles/                             ← AI bundle archives
    └── raw/                                    ← Unsorted historical docs
```

---

## 🔑 Key Documentation Files

### Essential Reading (Start Here)

| File | Purpose | When to Read |
|------|---------|--------------|
| `/README.md` | Project overview, quick start, scripts | First time setup |
| `setup/environment-and-providers.md` | Environment configuration | Before first run |
| `setup/build-and-deploy.md` | Build & deployment process | Before deployment |
| `process/product-overview.md` | Product vision & features | Understanding the product |
| `pwa-audit/01_repo_index.md` | Repository structure | Understanding the codebase |

### Setup & Deployment

| File | Purpose |
|------|---------|
| `setup/environment-and-providers.md` | Complete env var guide, API keys, provider setup |
| `setup/build-and-deploy.md` | Build process, Vercel deployment, CI/CD |
| `setup/push-notifications.md` | Web Push notifications setup (VAPID keys, testing) |
| `setup/vercel-deploy-checklist.md` | Pre-deployment verification checklist |
| `setup/env-inventory.md` | Inventory of all env variables with usage locations |

### Architecture & Features

| File | Purpose |
|------|---------|
| `pwa-audit/01_repo_index.md` | Repository structure and organization |
| `pwa-audit/02_feature_catalog.md` | Complete catalog of implemented features |
| `pwa-audit/03_core_flows.md` | Critical user flows and interactions |
| `pwa-audit/04_offline_sync_model.md` | Offline-first architecture and sync strategy |
| `features/advanced-insight-backend-wiring.md` | Advanced Insight implementation details |

### AI Integration

| File | Purpose |
|------|---------|
| `ai/README_AI.md` | AI system overview and architecture |
| `ai/integration-recommendations.md` | AI provider selection & cost management |
| `ai/advanced-insight-ui-spec-beta-v0.9.md` | Advanced Insight UI specification |
| `ai/layered-analysis-model.md` | L1-L5 analysis model explanation |
| `ai/event-catalog-overview.md` | Event-driven architecture for AI features |

---

## 📊 Documentation Statistics

| Category | Files | Status |
|----------|-------|--------|
| **Setup & Deployment** | 5 | ✅ Current |
| **Process & Product** | 2 | ✅ Current |
| **Lore & Brand** | 7 | ✅ Current |
| **Features** | 3 | ✅ Current |
| **Concepts** | 3 | ✅ Current |
| **Design** | 2 | ✅ Current |
| **Guides** | 1 | ✅ Current |
| **PWA Audit** | 7 | ✅ Current |
| **AI Integration** | 8 | ✅ Current |
| **Archive** | ~60 | 📦 Historical |
| **Total Active** | ~38 | |

---

## 🗂️ Archive Organization

The `archive/` directory contains historical documentation organized by category:

- **cleanup/** — Repository cleanup history & reports (3 cleanup efforts: 2025-11-09, 2025-11-15, 2025-11-20)
- **features/** — Completed feature implementation docs (Advanced Insight Beta v0.9, etc.)
- **audits/** — Historical audit reports (repository audits, performance audits)
- **handovers/** — Completed handover checklists (Codex handovers, quick starts)
- **telemetry/** — Telemetry reports & findings (events mapping, QA checklists)
- **phases/** — Phase completion reports (Phase 4-8, Phase A-E)
- **deployment/** — Legacy deployment documentation
- **ai-bundles/** — Archived AI bundle ZIP files (with extraction notes)
- **raw/** — Unsorted historical documentation (snapshots from 2025-11-12)

**See [`archive/README.md`](./archive/README.md) for complete archive index.**

---

## 🧭 Related Documentation

### Tool Configurations (Root Level)

These files configure AI coding assistants and should not be modified without understanding their purpose:

- `.rulesync/` — **Single Source of Truth** for AI tool prompts (20 files: 11 SYSTEM + 6 ITERATIVE + 3 meta)
- `.cursor/` — Cursor-specific rules (4 files, generated from `.rulesync/`)
- `/CLAUDE.md` — Claude Code configuration (auto-generated from `.rulesync/`)
- `/AGENTS.md` — Codex configuration (auto-generated from `.rulesync/`)

**Rule:** Never edit tool configs directly. Modify `.rulesync/` files and regenerate.

### Active Planning Documents (Root Level)

- `/IMPROVEMENT_ROADMAP.md` — Product roadmap (R0, R1, R2, future phases)
- `/RISK_REGISTER.md` — Risk tracking and mitigation strategies
- `/PR_TEMPLATE.md` — GitHub pull request template

### External Documentation

- **Wireframes:** `../wireframes/` (35 files: mobile, desktop, flows, components)
- **Tests:** `../tests/` (8 files: test docs, checklists, matrices)
- **Tickets:** `../tickets/` (5 files: feature TODOs)
- **Events:** `../events/` (4 files: event definitions for AI)
- **AI Prompts:** `../ai/` (4 files: system prompts, task prompts)

---

## 📝 Documentation Principles

This documentation follows these principles:

1. **Single Source of Truth:** Each concept documented in one canonical location
2. **No Duplication:** Information exists only once (linked, not repeated)
3. **Up-to-Date:** Active docs reflect current codebase state
4. **Historical Preservation:** Old docs archived (in `archive/`), not deleted
5. **Actionable:** Step-by-step guides with actual commands
6. **Searchable:** Clear structure, comprehensive navigation, keywords

---

## 🔄 Documentation Maintenance

### When to Update

- **After feature implementation:** Update feature docs, add to catalog
- **After major refactoring:** Update architecture docs, audit reports
- **After deployment changes:** Update setup/deployment docs
- **Quarterly:** Review and archive outdated documentation

### How to Archive

When documentation becomes outdated or superseded:

1. Move file to appropriate `archive/` subdirectory
2. Update `archive/[category]/README.md` with entry
3. Update links in active documentation (point to archive if needed)
4. Commit with message: `docs: archive [filename] - [reason]`

**See [`archive/cleanup/README.md`](./archive/cleanup/README.md) for cleanup guidelines.**

---

## 📞 Support & Questions

**For Documentation Questions:**
1. Check this README for navigation
2. Search `docs/` for keywords
3. Check `archive/` for historical context
4. Review code comments and inline docs

**For Technical Questions:**
1. Check `/README.md` (project root) for scripts and quick start
2. Review `setup/` docs for environment issues
3. Check `pwa-audit/` for architecture questions
4. Review `ai/` docs for AI integration questions

**For Contributing:**
1. Follow documentation principles above
2. Update this README when adding new top-level sections
3. Keep active docs current, archive outdated content
4. Use clear, actionable language

---

## 🎯 Recent Changes

### 2025-11-20: Major Documentation Restructuring

**Cleanup #3:** Comprehensive markdown documentation refactoring

**Changes:**
- ✅ Reduced root-level .md files from 26 to 7 (-73%)
- ✅ Created organized archive structure (cleanup/, features/, handovers/, telemetry/)
- ✅ Moved 21 temporary summaries to appropriate locations
- ✅ Consolidated Advanced Insight docs (6 files → index)
- ✅ Consolidated cleanup reports (6 files → index)
- ✅ Moved telemetry_output/ to docs/archive/telemetry/
- ✅ Deleted tmp/ directory
- ✅ Rewrote docs/README.md (this file) with current structure

**Result:** Clean, organized documentation structure with proper historical archiving.

**Details:** See [`/MARKDOWN_DOCS_REFACTORING_PLAN.md`](/MARKDOWN_DOCS_REFACTORING_PLAN.md)

---

**Maintained by:** Sparkfined Team
**Documentation Version:** 4.0 (Reorganized 2025-11-20)
**Status:** ✅ Production-Ready | 🚀 Launch-Ready

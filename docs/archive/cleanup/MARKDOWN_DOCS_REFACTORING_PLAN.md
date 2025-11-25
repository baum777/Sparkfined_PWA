# 📋 Markdown Documentation Refactoring Plan

**Date:** 2025-11-20
**Total Files:** 209 *.md files
**Status:** Phase 1 Complete — Analysis & Categorization

---

## Executive Summary

The repository contains **209 Markdown files** across multiple directories. Multiple cleanup efforts have been performed (2025-11-07, 2025-11-09, 2025-11-15), but **new temporary summary documents** have accumulated at the root level since then.

**Goal:** Consolidate documentation into a clean, logical structure under `docs/` with a well-organized `docs/archive/` for historical content.

---

## Phase 1: Inventory & Categorization ✅

### Distribution by Directory

| Directory | Count | Status | Action |
|-----------|-------|--------|--------|
| **docs/** | 93 | Mixed (active + archive) | Reorganize |
| **wireframes/** | 35 | Well-structured | Keep |
| **.rulesync/** | 20 | Tool config | **DO NOT TOUCH** |
| **tests/** | 8 | Well-structured | Keep |
| **tickets/** | 5 | Active TODOs | Keep |
| **telemetry_output/** | 5 | Generated artifacts | Archive |
| **events/** | 4 | Event definitions | Keep |
| **ai/** | 4 | AI prompts | Keep |
| **.cursor/** | 4 | Tool config | **DO NOT TOUCH** |
| **tmp/** | 2 | Temporary files | **DELETE** |
| **summary/** | 1 | Report | Archive |
| **src/**, **public/** | 2 | Code docs | Keep |
| **Root-level** | 26 | Temporary summaries | Archive/Consolidate |

---

## Categorization Matrix

### ✅ KEEP (No Changes Required)

#### Essential Root Files (5)
- `README.md` — Main project README (current, accurate)
- `CLAUDE.md` — Claude Code tool configuration
- `AGENTS.md` — Codex tool configuration
- `IMPROVEMENT_ROADMAP.md` — Active roadmap (R0/R1/R2)
- `PR_TEMPLATE.md` — GitHub PR template

#### Tool Configs (24) — **DO NOT MODIFY**
- `.rulesync/` — 20 files (Single Source of Truth for AI tools)
- `.cursor/` — 4 files (Cursor-specific rules)

#### Well-Structured Directories (62)
- `wireframes/` — 35 files (design documentation, mobile/desktop/flows)
- `tests/` — 8 files (test docs + checklists)
- `tickets/` — 5 files (feature TODOs)
- `events/` — 4 files (event definitions for AI)
- `ai/` — 4 files (AI prompts)
- `src/lib/ai/heuristics/README.md` — Code documentation
- `public/fonts/README.md` — Code documentation
- `docs/setup/` — 3 files (environment, build, push-notifications)
- `docs/process/` — 2 files (product-overview, onboarding-blueprint)

---

### 🔄 ARCHIVE (Move to docs/archive/)

#### Root-Level Temporary Summaries (21 files)

**Implementation Summaries:**
- ✅ `ADVANCED_INSIGHT_BACKEND_WIRING_COMPLETE.md` (2025-11-15)
- ✅ `ADVANCED_INSIGHT_BACKEND_WIRING_SUMMARY_BETA_V09.md`
- ✅ `ADVANCED_INSIGHT_IMPLEMENTATION_SUMMARY.md` (2025-11-15)
- ✅ `WIRING_SUMMARY.md` (2025-11-15)
- ✅ `IMPLEMENTATION_SUMMARY.md`

**Cleanup Reports:**
- ✅ `CLEANUP_SUMMARY.md` (2025-11-09)
- ✅ `CLEANUP_COMPLETE.md`
- ✅ `REPO_CLEANUP_SUMMARY.md` (2025-11-15)
- ✅ `REPO_CLEANUP_INVENTORY.md`
- ✅ `REPO_CLEANUP_DECISIONS.md`

**Audit & Verification:**
- ✅ `REPOSITORY_AUDIT_2025-11-20.md` (**NEW TODAY!**)
- ✅ `verifications.md`
- ✅ `VERIFY_RULESYNC.md`

**Handover & Checklists:**
- ✅ `CODEX_HANDOVER_CHECKLIST.md`
- ✅ `DELIVERABLES_MANIFEST.md`
- ✅ `vercel-deploy-checklist.md`

**Legacy / Duplicates:**
- ✅ `PR_DESCRIPTION.md` (one-time PR description)
- ✅ `QUICK_START_ADVANCED_INSIGHT.md` (superseded by docs)
- ✅ `README_RULESYNC.md` (can be merged into .rulesync/README if needed)
- ✅ `env_inventory.md` (should be in docs/setup/)
- ✅ `RISK_REGISTER.md` (could stay or move to docs/operations/)

**Generated Artifacts:**
- ✅ `telemetry_output/` — 5 files (reports, checklists, mappings)
- ✅ `summary/production-readiness-report.md`

**Temporary Files:**
- ❌ **DELETE:** `tmp/codex_run/` — 2 files (merge_proposal_*.md)

---

### 🔧 CONSOLIDATE

#### 1. Advanced Insight Documentation (3 → 1 file)

**Source Files:**
- `ADVANCED_INSIGHT_BACKEND_WIRING_COMPLETE.md`
- `ADVANCED_INSIGHT_BACKEND_WIRING_SUMMARY_BETA_V09.md`
- `ADVANCED_INSIGHT_IMPLEMENTATION_SUMMARY.md`

**Target:**
- `docs/archive/features/advanced-insight-complete-2025-11-15.md`

**Content:** Merge all three into a single comprehensive document with:
- Implementation summary
- Backend wiring details
- Beta v0.9 status
- Testing checklist
- Next steps

---

#### 2. Cleanup Reports (6 → 1 file)

**Source Files:**
- `CLEANUP_SUMMARY.md` (2025-11-09)
- `CLEANUP_COMPLETE.md`
- `REPO_CLEANUP_SUMMARY.md` (2025-11-15)
- `REPO_CLEANUP_INVENTORY.md`
- `REPO_CLEANUP_DECISIONS.md`
- `VERIFY_RULESYNC.md`

**Target:**
- `docs/archive/cleanup/repository-cleanup-history-2025-11.md`

**Content:** Chronological log of cleanup efforts with decisions and outcomes.

---

#### 3. Audit Reports (3 → 1 file per audit)

**Source Files:**
- `REPOSITORY_AUDIT_2025-11-20.md` (**NEW**)
- `verifications.md`
- `summary/production-readiness-report.md`

**Target:**
- `docs/archive/audits/repository-audit-2025-11-20.md`
- `docs/archive/audits/production-readiness-report.md`
- `docs/archive/audits/verifications.md`

**Action:** Keep separate (each audit is a snapshot in time).

---

#### 4. Update docs/README.md

**Current Status:** Outdated (2025-11-07, shows only 12 active files)

**Action:** Rewrite to reflect current structure:
- Overview of documentation structure
- Navigation guide ("I want to...")
- Link to key documents (setup, deployment, features, architecture)
- Archive explanation
- Last update: 2025-11-20

---

## Phase 2: Implementation Plan

### Target Structure

```
docs/
├── README.md                                   ← UPDATED (navigation guide)
├── index.md                                    ← Keep
├── PR_RUN_SUMMARY.md                           ← Keep
│
├── setup/                                      ← 6 files (expanded)
│   ├── build-and-deploy.md
│   ├── environment-and-providers.md
│   ├── push-notifications.md
│   ├── vercel-deploy-checklist.md             ← MOVED from root
│   ├── env-inventory.md                        ← MOVED from root
│
├── process/                                    ← 2 files
│   ├── product-overview.md
│   ├── onboarding-blueprint.md
│
├── lore/                                       ← 7 files
│
├── features/                                   ← 3 files (active feature docs)
│   ├── advanced-insight-backend-wiring.md
│   ├── next-up.md
│   ├── production-ready.md
│
├── concepts/                                   ← 3 files
├── design/                                     ← 2 files
├── guides/                                     ← 1 file
├── pwa-audit/                                  ← 7 files
│
├── ai/                                         ← 8 files
│   ├── ADVANCED_INSIGHT_FILES_MANIFEST.md
│   ├── HANDOVER_CODEX_ADVANCED_INSIGHT_UI.md
│   ├── ab-testing-plan.md
│   ├── advanced-insight-ui-spec-beta-v0.9.md
│   ├── event-catalog-overview.md
│   ├── integration-recommendations.md
│   ├── layered-analysis-model.md
│   └── README_AI.md
│
└── archive/                                    ← EXPANDED
    ├── README.md                               ← Archive index
    ├── cleanup/                                ← NEW
    │   └── repository-cleanup-history-2025-11.md
    ├── features/                               ← NEW
    │   └── advanced-insight-complete-2025-11-15.md
    ├── audits/                                 ← EXISTING + NEW
    │   ├── repository-audit-2025-11-20.md      ← MOVED from root
    │   ├── production-readiness-report.md      ← MOVED from summary/
    │   ├── verifications.md                    ← MOVED from root
    │   ├── PERFORMANCE_AUDIT.md
    │   ├── PRODUCTION_READINESS_TEST_REPORT.md
    │   └── TEST_AUDIT_REPORT.md
    ├── handovers/                              ← NEW
    │   └── CODEX_HANDOVER_CHECKLIST.md         ← MOVED from root
    ├── telemetry/                              ← NEW
    │   ├── DELIVERABLES_CHECKLIST.md
    │   ├── README.md
    │   └── reports/
    ├── phases/                                 ← EXISTING (9 files)
    ├── deployment/                             ← EXISTING (2 files)
    ├── ai-bundles/                             ← EXISTING (2 files)
    ├── raw/                                    ← EXISTING (15 files)
    └── removed/                                ← EXISTING (1 file)
```

### Root Structure (After Cleanup)

```
/
├── README.md                                   ← Main project README
├── CLAUDE.md                                   ← Tool config
├── AGENTS.md                                   ← Tool config
├── IMPROVEMENT_ROADMAP.md                      ← Active roadmap
├── PR_TEMPLATE.md                              ← GitHub template
├── RISK_REGISTER.md                            ← Could stay or move
│
├── .rulesync/                                  ← 20 files (DO NOT TOUCH)
├── .cursor/                                    ← 4 files (DO NOT TOUCH)
│
├── docs/                                       ← Organized documentation
├── wireframes/                                 ← 35 files (keep)
├── tests/                                      ← 8 files (keep)
├── tickets/                                    ← 5 files (keep)
├── events/                                     ← 4 files (keep)
├── ai/                                         ← 4 files (keep)
├── src/                                        ← Code (with embedded docs)
└── public/                                     ← Assets (with embedded docs)
```

---

## Phase 3: Validation Checklist

### After Consolidation

- [ ] All root-level temporary summaries archived
- [ ] docs/README.md updated with current structure
- [ ] docs/archive/ properly organized by category
- [ ] No broken links in documentation
- [ ] All tool configs (.rulesync/, .cursor/) untouched
- [ ] tmp/ directory removed
- [ ] telemetry_output/ moved to docs/archive/telemetry/
- [ ] No duplicate content across active docs

### Final Checks

- [ ] Run: `find . -name "*.md" -type f | wc -l` → Should still be ~209
- [ ] Run: `find . -maxdepth 1 -name "*.md" -type f | wc -l` → Should be ≤ 6
- [ ] Verify: docs/README.md lists all active documentation
- [ ] Verify: docs/archive/README.md explains archive structure
- [ ] Test: Click-through all links in docs/README.md

---

## Effort Estimate

| Phase | Tasks | Estimated Time |
|-------|-------|----------------|
| **Phase 1** | Inventory + Categorization | ✅ Complete (3h) |
| **Phase 2** | Execute moves + consolidation | 4-6 hours |
| **Phase 3** | Validation + final checks | 1-2 hours |
| **Total** | | ~8-11 hours |

---

## Risk Assessment

### Minimal Risk
- Moving files to archive (reversible)
- Consolidating summaries (originals preserved in git history)
- Updating docs/README.md (can rollback)

### No Risk
- Tool configs (.rulesync/, .cursor/) remain untouched
- Code documentation (src/, public/) stays in place
- Well-structured directories (wireframes/, tests/, tickets/) unchanged

---

## Next Steps

**Phase 2 Actions:**
1. Create new archive subdirectories (cleanup/, features/, handovers/, telemetry/)
2. Move root-level files to appropriate archive locations
3. Consolidate Advanced Insight summaries (3 → 1)
4. Consolidate cleanup reports (6 → 1)
5. Move telemetry_output/ to docs/archive/telemetry/
6. Delete tmp/ directory
7. Update docs/README.md with new structure
8. Create docs/archive/README.md with index

**Phase 3 Actions:**
1. Validate all links in docs/README.md
2. Verify file counts match expectations
3. Test navigation paths
4. Create summary report
5. Commit and push changes

---

**Status:** ✅ Phase 1 Complete — Ready for Phase 2 Execution
**Branch:** `claude/refactor-markdown-docs-01NVzSd9hfk9ELpoSMphruuC`
**Next:** Proceed with Phase 2 file moves and consolidation

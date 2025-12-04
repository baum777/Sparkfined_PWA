# Sparkfined Repository – Documentation Governance Audit

**Date:** 2025-12-04  
**Purpose:** Evaluate current repo structure against proposed 7×7 documentation governance rules  
**Status:** 🔍 Assessment Complete

---

## 📋 Executive Summary

This document audits the Sparkfined repository structure against the proposed documentation governance rules, which establish:
1. **Root-level restrictions** (only README.md, AGENTS.md, CLAUDE.md allowed)
2. **7×7 Rule in `/docs`** (max 7 folders, max 7 files per folder)
3. **`.rulesync` configuration** for AI agent compliance
4. **Archive-first deletion policy** (move to archive, don't hard-delete)

### ✅ Compliance Summary

| Category | Current State | Target State | Status |
|----------|--------------|--------------|--------|
| **Root Cleanliness** | 3 docs (README, AGENTS, CLAUDE) | 3 docs allowed | ✅ **PASS** |
| **7×7 Rule (Folders)** | 16 folders in `/docs` | Max 7 folders | ❌ **FAIL** |
| **7×7 Rule (Files/Folder)** | Many folders exceed 7 files | Max 7 files per folder | ❌ **FAIL** |
| **`.rulesync` Config** | Basic config exists | Full governance rules needed | ⚠️ **PARTIAL** |
| **Archive Folder** | `/docs/archive/` exists | Needs `/docs/07_archive/` structure | ⚠️ **PARTIAL** |
| **CHANGELOG.md** | Does not exist | Required in `/docs/` | ❌ **MISSING** |

---

## 🗂️ Current Repository Structure

### Root Level Documentation ✅

**Current State:**
```
/workspace/
  ├── README.md         ✅ (550 lines, comprehensive project overview)
  ├── AGENTS.md         ✅ (237 lines, AI assistant guardrails)
  └── CLAUDE.md         ✅ (241 lines, Claude-specific instructions)
```

**Assessment:**  
✅ **COMPLIANT** – Root contains only the 3 allowed documentation files.

---

### `/docs` Structure ❌

**Current State:** 16 subdirectories (exceeds 7×7 rule)

```
/docs/
├── active/              # Feature tracking, execution logs, roadmap
├── archive/             # Large archive (100+ files, needs reorganization)
├── architecture/        # System design docs (Chart_System.md)
├── bugs/                # Bug templates, triage, developer notes
├── ci/                  # CI/CD documentation
├── core/                # Domain documentation (7 subdirs: ai, architecture, concepts, design, guides, lore, process, setup)
├── design/              # Design system, wireframes (41 files!)
├── events/              # Event catalog (4 files)
├── handover/            # Legacy handover docs
├── internal/            # Internal notes
├── metrics/             # Performance baselines
├── process/             # Process docs (6 files)
├── qa/                  # QA checklists (3 files)
├── telemetry/           # Telemetry data
├── tickets/             # Feature tickets (6 files)
└── ui/                  # UI primitives guide
```

**Root-level files in `/docs` (not in folders):**
- 21 markdown files directly in `/docs/` (e.g., `API_LANDSCAPE.md`, `DESIGN_TOKENS_STYLEGUIDE_DE.md`, `PITCH_DECK.md`, etc.)

**Assessment:**  
❌ **NON-COMPLIANT** – Structure significantly exceeds 7×7 limits.

---

## 📊 Detailed Folder Analysis

### Folders Exceeding 7 Files

| Folder | File Count | Status | Notes |
|--------|-----------|--------|-------|
| `/docs/design/` | **41 files** | ❌ CRITICAL | Includes 11 `.tsx` files, 30 `.md` files, wireframes |
| `/docs/core/design/` | **10 files** | ❌ HIGH | Logo SVGs + design token docs |
| `/docs/core/ai/` | **7 files** | ⚠️ BORDERLINE | Exactly at limit |
| `/docs/core/lore/` | **6 files** | ✅ OK | Within limit |
| `/docs/active/` | **9 files/folders** | ❌ HIGH | Execution logs, risk register, roadmap |
| `/docs/archive/` | **100+ files** | ❌ CRITICAL | Needs restructuring |

### Recommended Folder Consolidation

**Proposed 7-Folder Structure:**

```
/docs/
├── 01_architecture/     # Merge: architecture/ + core/architecture/
├── 02_concepts/         # Merge: core/concepts/ + core/ai/ + events/
├── 03_specs/            # Merge: tickets/ + bugs/ + internal/
├── 04_process/          # Merge: process/ + active/ + ci/ + qa/
├── 05_guides/           # Merge: core/guides/ + core/setup/
├── 06_decisions/        # Merge: core/lore/ + handover/ + metrics/
└── 07_archive/          # Merge: archive/ + telemetry/ + old docs
```

**Additional Root-Level Files Strategy:**
- Move 21 root-level `.md` files into appropriate folders (01-06)
- Only keep `index.md`, `README.md`, `CHANGELOG.md` at `/docs/` root

---

## 🔧 `.rulesync` Configuration Analysis

### Current Config (`rulesync.jsonc`)

```jsonc
{
  "$schema": "https://raw.githubusercontent.com/dyoshikawa/rulesync/main/docs/rulesync-schema.json",
  "targets": ["cursor", "claudecode", "copilot", "cline"],
  "features": ["rules", "ignore"],
  "baseDirs": ["."],
  "outputs": {
    "cursor": { "path": ".cursorrules" },
    "claudecode": { "path": "CLAUDE.md" },
    "copilot": { "path": ".github/copilot-instructions.md" },
    "cline": { "path": ".clinerules/project.md" }
  },
  "delete": true,
  "verbose": true
}
```

### Current Rule Files

```
.rulesync/
├── .aiignore                        # AI context exclusions
├── HANDOVER.md                      # Rulesync setup guide
└── rules/
    ├── overview.md                  # Global AI guardrails (exists ✅)
    ├── journal-system.md            # Journal domain rules (exists ✅)
    └── playwright-e2e-health.md     # E2E testing rules (exists ✅)
```

### Missing Elements from Proposed Config

❌ **Missing:** Enhanced `rulesync.jsonc` fields:
- `project`, `version`, `meta` fields
- `global_instructions` array
- `directories` object with enforcement rules
- `recommended_docs_structure`
- `documentation_change_rules`

⚠️ **Partial:** Documentation governance is embedded in `.rulesync/rules/overview.md` but not in the config itself.

---

## 📝 Proposed Governance Rules – Compliance Check

### Rule 1: Root Cleanliness ✅

**Rule:** Only `README.md`, `AGENTS.md`, `CLAUDE.md` allowed in root.

**Status:** ✅ **COMPLIANT**

**Evidence:**
```bash
$ find /workspace -maxdepth 1 -name "*.md" | sort
/workspace/AGENTS.md
/workspace/CLAUDE.md
/workspace/README.md
```

### Rule 2: 7×7 Rule in `/docs` ❌

**Rule:** Max 7 folders in `/docs`, max 7 files per folder.

**Status:** ❌ **NON-COMPLIANT**

**Current Violations:**
- **16 folders** in `/docs/` (expected: 7)
- **21 root-level files** in `/docs/` (expected: ≤7)
- `/docs/design/` has **41 files** (expected: ≤7)
- `/docs/archive/` has **100+ files** (needs substructure)

### Rule 3: Archive Instead of Delete ⚠️

**Rule:** Obsolete docs → `/docs/07_archive/`, not hard-deleted.

**Status:** ⚠️ **PARTIAL COMPLIANCE**

**Current State:**
- `/docs/archive/` exists with extensive historical content
- No `/docs/07_archive/` structure yet
- Archive strategy exists but needs standardization

### Rule 4: Documentation Change Tracking ❌

**Rule:** Maintain `/docs/CHANGELOG.md` and `/docs/INDEX.md`.

**Status:** ❌ **NON-COMPLIANT**

**Missing Files:**
- `/docs/CHANGELOG.md` (required, does not exist)
- `/docs/INDEX.md` (exists but needs updating to reflect governance rules)

### Rule 5: Scan Before Create ⚠️

**Rule:** Before creating new docs, scan `/docs` for existing files to extend.

**Status:** ⚠️ **BEHAVIORAL RULE** (cannot audit without workflow observation)

**Notes:**
- Embedded in `.rulesync/rules/overview.md`
- No enforcement mechanism in `rulesync.jsonc`

---

## 🚨 Critical Findings

### 1. Folder Sprawl (High Priority)

**Issue:** 16 folders in `/docs` vs. 7 allowed.

**Impact:**
- Difficult to navigate for new contributors
- Unclear boundaries between categories (e.g., `design/` vs. `core/design/`)
- High cognitive load for AI agents scanning docs

**Recommendation:**
- Consolidate into proposed 7-folder structure (see "Recommended Folder Consolidation" above)
- Move orphaned root-level files into appropriate categories

### 2. `/docs/design/` File Explosion (Critical)

**Issue:** 41 files in a single folder (30 `.md`, 11 `.tsx`).

**Impact:**
- Violates 7×7 rule by 6x
- Mixes code (`.tsx`) with docs (`.md`)
- Contains wireframes, style guides, component examples

**Recommendation:**
- Split into subfolders: `design/wireframes/`, `design/tokens/`, `design/components/`
- Move `.tsx` examples to `/src/` or separate examples repo
- Archive outdated wireframes

### 3. Missing CHANGELOG.md (High Priority)

**Issue:** No documentation changelog to track evolution of `/docs`.

**Impact:**
- No audit trail for doc changes
- AI agents lack context on doc history
- Hard to identify outdated vs. current docs

**Recommendation:**
- Create `/docs/CHANGELOG.md` immediately
- Backfill with recent major changes (last 30 days)
- Enforce via `.rulesync` config

### 4. Incomplete `.rulesync` Config (Medium Priority)

**Issue:** `rulesync.jsonc` lacks governance rules, only has target configs.

**Impact:**
- AI agents follow `.rulesync/rules/overview.md` manually
- No programmatic enforcement of 7×7 rule
- Governance is documentation, not code

**Recommendation:**
- Enhance `rulesync.jsonc` with proposed governance fields (see user's blueprint)
- Add `directories` enforcement rules
- Implement `require_existing_scan` policy

---

## ✅ Strengths of Current Structure

### 1. Clean Root ✅

**Evidence:** Only 3 allowed docs in root, no sprawl.

**Impact:** Easy for humans and AI to find entrypoint documentation.

### 2. Comprehensive Documentation ✅

**Evidence:** 157 markdown files covering all domains.

**Impact:** High documentation coverage (possibly too high → needs consolidation).

### 3. Rulesync Foundation Exists ✅

**Evidence:** `.rulesync/rules/overview.md` contains most governance rules.

**Impact:** AI agents have clear guardrails, just need enforcement mechanism.

### 4. Existing Archive Strategy ⚠️

**Evidence:** `/docs/archive/` with historical docs.

**Impact:** Docs are preserved, but need reorganization into 7×7 structure.

---

## 🎯 Recommendations (Priority Order)

### Immediate (This Week)

1. **Create `/docs/CHANGELOG.md`** ✅ HIGH
   - Add entry for this audit
   - Backfill last 30 days of doc changes
   - Template: date, summary, files touched, reason

2. **Audit and Move Root-Level Files in `/docs`** ✅ HIGH
   - 21 files currently at `/docs/` root
   - Move into appropriate 01-06 folders
   - Keep only: `README.md`, `index.md`, `CHANGELOG.md`

3. **Split `/docs/design/` Folder** ✅ CRITICAL
   - 41 files → multiple subfolders or archive
   - Move `.tsx` files out of docs
   - Archive outdated wireframes

### Short-Term (Next 2 Weeks)

4. **Consolidate to 7-Folder Structure** ⚠️ HIGH
   - Merge 16 folders → 7 (see proposed structure)
   - Update `/docs/index.md` with new structure
   - Document migration in CHANGELOG

5. **Enhance `rulesync.jsonc`** ⚠️ MEDIUM
   - Add governance fields from user's proposed blueprint
   - Add `directories` enforcement rules
   - Add `documentation_change_rules`

6. **Standardize `/docs/07_archive/`** ⚠️ MEDIUM
   - Rename `/docs/archive/` → `/docs/07_archive/`
   - Create subfolders: `2024/`, `2025-Q1/`, etc.
   - Add archive policy to README

### Long-Term (Next Month)

7. **AI Agent Workflow Enforcement** ⚠️ LOW
   - Add pre-commit hooks for doc changes
   - Enforce CHANGELOG updates via CI
   - Add folder count checks to CI

8. **Documentation Metrics Dashboard** 💡 NICE-TO-HAVE
   - Track folder count, file count per folder
   - Alert on 7×7 violations
   - Visualize doc growth over time

---

## 📖 Appendix: Proposed Full `.rulesync` Config

See user's provided blueprint for full JSON structure. Key additions:

```jsonc
{
  "project": "Sparkfined_PWA",
  "version": 1,
  "meta": {
    "description": "Hard rules for repo structure, docs governance (7x7), and AI agent behavior.",
    "owners": ["cheikh"],
    "lastUpdated": "2025-12-04"
  },
  "global_instructions": [
    "Do not create new markdown documents in the repo root...",
    "Respect the 7x7 rule in /docs: max 7 folders, max 7 files per folder..."
  ],
  "directories": {
    "/": {
      "allowed_docs": ["README.md", "AGENTS.md", "CLAUDE.md"],
      "deny_other_markdown_docs": true
    },
    "/docs": {
      "enforce_7x7": true,
      "max_subdirectories": 7,
      "max_files_per_directory": 7,
      "creation_policy": {
        "require_existing_scan": true,
        "prefer_append_over_new_file": true
      }
    }
  }
}
```

---

## 🏁 Conclusion

**Overall Compliance:** ⚠️ **PARTIAL** (2/5 rules fully compliant)

**Key Takeaway:**  
Sparkfined has a **strong documentation foundation** but needs **structural consolidation** to comply with 7×7 governance rules. Root is clean, but `/docs` has sprawled to 16 folders and 157+ files, making it hard to navigate and violating the proposed 7×7 constraint.

**Next Steps:**
1. Create `CHANGELOG.md` (immediate)
2. Consolidate `/docs/design/` (critical)
3. Merge 16 folders → 7 (high priority)
4. Enhance `rulesync.jsonc` (medium priority)

**Owner:** Cheikh (Sparkfined Team)  
**Review Date:** 2025-12-11 (1 week follow-up)

---

**Last Updated:** 2025-12-04  
**Audit By:** Claude (Background Agent)  
**Status:** 🔍 Assessment Complete, 📋 Recommendations Provided

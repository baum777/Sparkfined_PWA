# Repository Cleanup & Integration Decisions

> **Generated:** 2025-11-15  
> **Purpose:** Classification and integration decisions for rules/agents consolidation and AI bundle integration

---

## Phase 1: Classification & Decisions

### 1. Rules & Agents System — ✅ ALREADY COHERENT

**Decision:** Keep existing structure as-is, no changes needed.

**Rationale:**
- `.rulesync/` is already the single source of truth (11 SYSTEM + 6 ITERATIVE files)
- `.cursor/rules/` already generated correctly (4 files)
- `CLAUDE.md` and `AGENTS.md` already generated and aligned
- No `.cursorrules` file (good — not needed)
- No conflicts or duplications detected

**Action:** ✅ **NO CHANGES REQUIRED**

---

### 2. ITERATIVE Planning Files — Consolidate Duplicates

**Current State:**
- `.rulesync/_planning.md` (general planning doc)
- `.rulesync/_planning-current.md` (current sprint details)
- `.rulesync/_context.md` (general context doc)
- `.rulesync/_context-session.md` (current session details)

**Decision:** Keep split structure, but clarify roles in README.

**Rationale:**
- Split between "stable planning" and "current sprint" is intentional
- `_planning.md` = high-level roadmap (quarterly updates)
- `_planning-current.md` = active sprint (weekly/sprint updates)
- `_context.md` = general open questions (monthly updates)
- `_context-session.md` = current working session (daily updates)
- This follows the ITERATIVE pattern: stable vs. dynamic

**Action:** ✅ **KEEP AS-IS**, document pattern in `README_RULESYNC.md`

---

### 3. Type System — Consolidate AI Types

**Current State:**
- `ai/types.ts` — Orchestrator types (Provider, MarketPayload, BulletAnalysis, SocialPost, etc.)
- `tmp/bundles/types/ai_types.ts` — Comprehensive AI types (400+ lines, more detailed)
- `tmp/bundles/types/event_types.ts` — Event catalog types (550+ lines)
- `src/types/` — App types (access, analysis, data, journal, market, signal, teaser, viewState)

**Comparison:**

| Type | `ai/types.ts` | Bundle `ai_types.ts` | Overlap? |
|------|---------------|---------------------|----------|
| `Provider` | ✅ "openai" \| "grok" | ❌ Not defined | Existing is sufficient |
| `MarketPayload` | ✅ Basic structure | ✅ Extended (L1-L5 analysis) | **Merge needed** |
| `SocialPost` | ✅ Basic | ✅ Extended (botScore, author details) | **Merge needed** |
| `BulletAnalysis` | ✅ Simple bullets | ❌ Not directly | Keep existing |
| `SocialAnalysis` | ✅ Thesis/sentiment | ✅ More detailed aggregates | **Merge needed** |
| `OrchestratorResult` | ✅ Market + Social | ❌ Not defined | Keep existing |
| Event Types | ❌ Not in ai/types | ✅ Comprehensive catalog | **New file needed** |

**Decision:**

1. **Create `src/types/ai.ts`** (consolidated AI types)
   - Merge best parts of `ai/types.ts` and bundle `ai_types.ts`
   - Focus on Beta v0.9 scope (no L5 analysis yet, but keep types for future)
   - Remove duplicates, keep consistent naming

2. **Create `src/types/events.ts`** (event catalog)
   - Import bundle `event_types.ts` content
   - Subset to Beta v0.9 events only
   - Mark future events with comments

3. **Update `ai/types.ts`**
   - Rename to `ai/types-legacy.ts` for reference
   - Or remove after migration, keep in git history

4. **Update imports**
   - All files importing from `ai/types` → import from `src/types/ai`
   - Update `src/types/index.ts` to re-export AI types

**Action:** 🔄 **CREATE** `src/types/ai.ts` + `src/types/events.ts`

---

### 4. AI Logic — Integrate Bundle Code

**Current State:**
- `src/lib/ai/teaserAdapter.ts` — Only existing AI logic
- Bundle contains:
  - `botScore.ts` — Bot score heuristic
  - `sanity.ts` — Sanity check placeholder
  - `api/ai/social/grok.ts` — Grok social analysis endpoint
  - Tests: `botScore.test.ts`, `orchestrator.test.ts`

**Decision:**

1. **Create `src/lib/ai/heuristics/`** directory
   - Move `botScore.ts` → `src/lib/ai/heuristics/botScore.ts`
   - Move `sanity.ts` → `src/lib/ai/heuristics/sanity.ts`
   - Export both from `src/lib/ai/heuristics/index.ts`

2. **Create `api/ai/social/grok.ts`** (social analysis endpoint)
   - Already exists in bundle, copy to correct location
   - Update imports to use new type paths

3. **Migrate tests**
   - `botScore.test.ts` → `src/lib/ai/heuristics/__tests__/botScore.test.ts`
   - `orchestrator.test.ts` → `ai/__tests__/orchestrator.test.ts`

4. **Update orchestrator**
   - Review bundle patches (orchestrator.patch, grok_client.patch, openai_client.patch)
   - Apply relevant changes to existing orchestrator
   - Use patches as reference only (don't blindly apply)

**Action:** 🔄 **INTEGRATE** AI logic into `src/lib/ai/` and `api/ai/social/`

---

### 5. Documentation — Organize AI Bundle Docs

**Current State:**
- Bundle docs:
  - `README_Fazit.md` — AI integration recommendations
  - `AB_test_plan.md` — A/B testing plan
  - `LAYERED_ANALYSIS_MODEL.md` — L1-L5 analysis model
  - `JOURNAL_WALLET_LEARNING.md` — Journal + wallet learning
  - `EVENT_CATALOG_OVERVIEW.md` — Event catalog overview

**Decision:**

1. **Create `docs/ai/` directory**
   - Move bundle docs to `docs/ai/`:
     - `README_Fazit.md` → `docs/ai/integration-recommendations.md`
     - `AB_test_plan.md` → `docs/ai/ab-testing-plan.md`
     - `LAYERED_ANALYSIS_MODEL.md` → `docs/ai/layered-analysis-model.md`
     - `JOURNAL_WALLET_LEARNING.md` → `docs/concepts/journal-wallet-learning.md` (already in concepts)
     - `EVENT_CATALOG_OVERVIEW.md` → `docs/ai/event-catalog-overview.md`

2. **Link from `_intentions.md`**
   - Add ADR for AI bundle integration decision
   - Reference new docs in AI-related ADRs

**Action:** 🔄 **CREATE** `docs/ai/` and move bundle docs

---

### 6. ZIP Archives — Archive After Integration

**Decision:**

1. **Create `docs/archive/ai-bundles/`** directory
2. **Move ZIPs**:
   - `sparkfined_ai_patch.zip` → `docs/archive/ai-bundles/sparkfined_ai_patch_2025-11-13.zip`
   - `sparkfined_logic_bundle.zip` → `docs/archive/ai-bundles/sparkfined_logic_bundle_2025-11-14.zip`
3. **Add README**:
   - Create `docs/archive/ai-bundles/README.md` explaining what these bundles were
   - Note: "Integrated into repo on 2025-11-15, see REPO_CLEANUP_SUMMARY.md"

**Action:** 🔄 **ARCHIVE** ZIPs after integration complete

---

### 7. Package Manager — Remove package-lock.json

**Decision:** Remove `package-lock.json` if using pnpm exclusively.

**Rationale:**
- Repo uses `pnpm-lock.yaml` as primary lockfile
- Having both `package-lock.json` and `pnpm-lock.yaml` can cause confusion
- `package-lock.json` may be stale

**Action:** 🔄 **REMOVE** `package-lock.json` (optional cleanup)

---

## Integration Strategy

### Beta v0.9 Scope (Minimal Integration)

**What to integrate now:**
1. ✅ Type definitions (`src/types/ai.ts`, `src/types/events.ts`)
2. ✅ Core heuristics (`botScore`, `sanity`)
3. ✅ Documentation (`docs/ai/`)
4. ✅ Basic tests (`botScore.test.ts`)

**What to defer (Post-Beta):**
1. 🔴 L5 Advanced Analysis (future roadmap)
2. 🔴 Full Event Catalog integration (subset only for Beta)
3. 🔴 Social Analysis API endpoint (Grok) — requires API key setup
4. 🔴 A/B Testing infrastructure (future experiment)
5. 🔴 Journal wallet learning (Q1 2025 feature)

---

## File Mapping Summary

### Types
| Source | Destination | Action |
|--------|-------------|--------|
| `ai/types.ts` | `ai/types-legacy.ts` (reference) | Rename |
| `tmp/bundles/types/ai_types.ts` | `src/types/ai.ts` | Merge with existing |
| `tmp/bundles/types/event_types.ts` | `src/types/events.ts` | Subset for Beta |

### Logic
| Source | Destination | Action |
|--------|-------------|--------|
| `tmp/bundles/sparkfined_ai_patch/src/utils/botScore.ts` | `src/lib/ai/heuristics/botScore.ts` | Move |
| `tmp/bundles/sparkfined_ai_patch/src/sanity.ts` | `src/lib/ai/heuristics/sanity.ts` | Move |
| `tmp/bundles/sparkfined_ai_patch/api/ai/social/grok.ts` | `api/ai/social/grok.ts` | Copy (future) |

### Tests
| Source | Destination | Action |
|--------|-------------|--------|
| `tmp/bundles/sparkfined_ai_patch/tests/botScore.test.ts` | `src/lib/ai/heuristics/__tests__/botScore.test.ts` | Move |
| `tmp/bundles/sparkfined_ai_patch/tests/orchestrator.test.ts` | `ai/__tests__/orchestrator.test.ts` | Review, integrate |

### Docs
| Source | Destination | Action |
|--------|-------------|--------|
| `tmp/bundles/sparkfined_ai_patch/README_Fazit.md` | `docs/ai/integration-recommendations.md` | Move |
| `tmp/bundles/sparkfined_ai_patch/AB_test_plan.md` | `docs/ai/ab-testing-plan.md` | Move |
| `tmp/bundles/docs/LAYERED_ANALYSIS_MODEL.md` | `docs/ai/layered-analysis-model.md` | Move |
| `tmp/bundles/docs/EVENT_CATALOG_OVERVIEW.md` | `docs/ai/event-catalog-overview.md` | Move |

### Archives
| Source | Destination | Action |
|--------|-------------|--------|
| `sparkfined_ai_patch.zip` | `docs/archive/ai-bundles/sparkfined_ai_patch_2025-11-13.zip` | Move |
| `sparkfined_logic_bundle.zip` | `docs/archive/ai-bundles/sparkfined_logic_bundle_2025-11-14.zip` | Move |

---

## Validation Checklist

After integration, verify:

```bash
# Type checks pass
pnpm run typecheck

# Linter passes
pnpm run lint

# Tests pass
pnpm test

# Build succeeds
pnpm run build

# No stale imports
rg "from ['\"]ai/types['\"]" src/
rg "from ['\"].*ai_types['\"]" src/
```

---

**Status:** Phase 1 Complete ✅  
**Next Phase:** Phase 2 (Apply Integration Patches)

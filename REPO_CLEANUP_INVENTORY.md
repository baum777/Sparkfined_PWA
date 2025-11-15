# Repository Cleanup & Integration Inventory

> **Generated:** 2025-11-15  
> **Purpose:** Complete inventory of current repo state for rules/agents consolidation and AI bundle integration

---

## Phase 0: Discovery & Inventory

### 1. Rules & Agents System

#### ✅ `.cursor/rules/` (Cursor-specific hints)
- `00-core.md` — Project core + TypeScript conventions
- `01-frontend.md` — React + PWA + UI/UX
- `02-backend.md` — API + Testing + A11y + Performance
- `03-ops.md` — Security + Deployment + AI

**Status:** ✅ Well-structured, generated from `.rulesync/`

#### ✅ `.rulesync/` (Source of Truth)

**SYSTEM Files (11):**
- `00-project-core.md` — Vision, domain-map, tech-stack
- `01-typescript.md` — TypeScript strict-mode, patterns
- `02-frontend-arch.md` — React architecture, routing
- `03-pwa-conventions.md` — Service-Worker, offline-mode
- `04-ui-ux-components.md` — Component-taxonomy, Tailwind
- `05-api-integration.md` — Serverless-APIs, fetchWithRetry
- `06-testing-strategy.md` — Test-pyramid, Vitest, Playwright
- `07-accessibility.md` — WCAG 2.1 AA, semantic-HTML
- `08-performance.md` — Bundle-size, Core-Web-Vitals
- `09-security.md` — Secrets-management, input-validation
- `10-deployment.md` — Vercel-config, CI/CD, rollback
- `11-ai-integration.md` — Dual-AI-provider, prompt-design

**ITERATIVE Files (6):**
- `_planning.md` / `_planning-current.md` — Sprint, roadmap, backlog
- `_context.md` / `_context-session.md` — Session-focus, open-questions
- `_intentions.md` — Design-decisions, ADRs
- `_experiments.md` — Tech-spikes, A/B-tests
- `_log.md` — Timeline, significant-commits
- `_agents.md` — Multi-tool-routing-map

**Status:** ✅ Complete, well-documented, active

#### ✅ Root-Level Agent Configs
- `AGENTS.md` — Codex instructions (high-level context)
- `CLAUDE.md` — Claude Code instructions (full context)
- `README_RULESYNC.md` — Installation & usage guide
- `VERIFY_RULESYNC.md` — Validation checklist

**Status:** ✅ Generated, aligned with `.rulesync/`

#### ❌ No `.cursorrules` file
**Status:** ✅ Good — not needed, using `.cursor/rules/` instead

---

### 2. AI Bundles & Archives

#### 🔴 Dangling ZIP Archives at Root
- `sparkfined_ai_patch.zip` (151 KB) — AI patch bundle
- `sparkfined_logic_bundle.zip` (162 KB) — Logic bundle

**Status:** 🔴 **NOT INTEGRATED** — Need to extract, review, and integrate relevant parts

**Expected Contents (based on naming and context):**
- `ai_types.ts` — AI-related type definitions
- `event_types.ts` — Event type definitions
- `botScore.ts` — Social bot detection logic
- `sanity.ts` — Data validation/sanity checks
- `grok.ts` — Grok API client
- AI orchestrator tests, documentation, examples

**Current Status:** Files NOT present in repo, only exist inside ZIPs

---

### 3. Current Types & Domain Logic

#### ✅ `src/types/` (9 files)
- `access.ts` — Access gating types
- `analysis.ts` — Analysis result types
- `data.ts` — Market data types
- `index.ts` — Re-exports + AppConfig
- `journal.ts` — Journal entry types
- `market.ts` — Market-specific types
- `signal.ts` — Signal/alert types
- `teaser.ts` — Teaser types
- `viewState.ts` — UI view state types

**Status:** ✅ Well-organized, no obvious duplication yet

#### ✅ `ai/types.ts` (AI Orchestrator Types)
**Existing types:**
- `Provider` — "openai" | "grok"
- `MarketPayload` — Market analysis input
- `BulletAnalysis` — AI analysis output
- `SocialPost`, `SocialPostAssessment`, `SocialAnalysis` — Social sentiment types
- `OrchestratorResult` — Combined analysis result
- `TelemetryEvent` — AI telemetry tracking

**Status:** ✅ Good foundation, likely overlaps with bundle types

#### ⚠️ `src/lib/ai/` (Minimal)
- Only `teaserAdapter.ts` exists

**Status:** 🟡 **INCOMPLETE** — Missing botScore, sanity, grok, orchestrator utilities

#### ❌ No `ai_types.ts` or `event_types.ts` in repo
**Status:** 🔴 **TO BE EXTRACTED** from bundles

---

### 4. Documentation Structure

#### ✅ `docs/` Directory
- `archive/` — Historical docs, audit reports, phase completions
- `concepts/` — AI roadmap, journal system, signal orchestrator
- `features/` — Next-up, production-ready
- `guides/` — Access tabs guide
- `lore/` — Community posts, degens creed, hero journey, NFT concepts
- `process/` — Onboarding blueprint, product overview
- `pwa-audit/` — 7 comprehensive PWA audit docs + metadata
- `setup/` — Build and deploy, environment and providers

**Status:** ✅ Well-organized, no cleanup needed

#### 🟡 Potential AI Bundle Docs Location
- Create `docs/ai/` for AI bundle documentation
- Archive AI patch/bundle ZIPs to `docs/archive/ai-bundles/` after extraction

---

### 5. CI / Build / Workflows

#### ✅ TypeScript Configs
- `tsconfig.json` — Main TS config (strict mode enabled)
- `tsconfig.build.json` — Build-specific config
- `tsconfig.build.tsbuildinfo` — Build cache

**Status:** ✅ Clean, no conflicts

#### ✅ Build & Lint Configs
- `eslint.config.js` — Flat config, pragmatic `any` allowed
- `vite.config.ts` — Vite + PWA config
- `vitest.config.ts` — Vitest unit test config
- `playwright.config.ts` — Playwright E2E config
- `tailwind.config.ts` — Tailwind CSS config
- `postcss.config.cjs` — PostCSS config

**Status:** ✅ Consistent, no cleanup needed

#### ✅ Package Management
- `package.json` — Dependencies and scripts
- `pnpm-lock.yaml` — pnpm lockfile
- `package-lock.json` — npm lockfile (legacy, can be removed if using pnpm exclusively)

**Status:** 🟡 Consider removing `package-lock.json` if pnpm is primary

#### ✅ Patches
- `patches/` directory with 10 patch files
- No stale/conflicting patches detected

**Status:** ✅ Clean

---

## Summary: Key Findings

### 🟢 Already Clean & Coherent
1. **Rules/Agents System** — Single source of truth established (`.rulesync/`)
2. **Generated Configs** — Cursor, Claude, Codex configs already generated and aligned
3. **Type System** — `src/types/` and `ai/types.ts` well-organized
4. **Documentation** — Comprehensive, well-structured
5. **Build System** — Modern, consistent configs

### 🔴 Requires Integration
1. **AI Bundle ZIPs** — Extract, review, integrate into `src/lib/ai/` and `src/types/`
2. **Missing AI Logic** — botScore, sanity, grok not yet in repo
3. **Type Consolidation** — Merge bundle types with existing `ai/types.ts`

### 🟡 Optional Cleanup
1. **Duplicate Planning Files** — `_planning.md` vs `_planning-current.md`, `_context.md` vs `_context-session.md` (decide canonical)
2. **package-lock.json** — Remove if pnpm is exclusive package manager
3. **Archive ZIPs** — Move to `docs/archive/ai-bundles/` after extraction

---

## Next Steps

**Phase 1:** Classification & Decisions
- Extract ZIP contents to temporary location
- Compare bundle types with existing `ai/types.ts`
- Decide canonical type definitions
- Map bundle code to target locations

**Phase 2:** Minimal Integration Patches
- Create consolidated type files (`src/types/ai.ts`, `src/types/events.ts`)
- Integrate AI logic into `src/lib/ai/`
- Update imports across codebase
- Archive ZIPs

**Phase 3:** Validation & Handover
- Run type checks, lint, tests
- Generate summary for Codex
- Create task checklist for remaining work

---

**Status:** Phase 0 Complete ✅  
**Next Phase:** Phase 1 (Classification & Decisions)

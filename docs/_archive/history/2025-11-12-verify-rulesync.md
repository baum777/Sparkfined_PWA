# Rulesync Verification Checklist

> **Purpose:** Validation-checklist for all generated-configs (Cursor, Claude Code, Codex) and `.rulesync/` structure.
>
> **Last-Update:** 2025-11-12

---

## Overview

This checklist validates:
1. **`.rulesync/` Structure** — All SYSTEM + ITERATIVE files present and well-formed
2. **Cursor-Rules** — `.cursor/rules/*.md` generated correctly
3. **Claude-Code-Config** — `CLAUDE.md` comprehensive and accurate
4. **Codex-Instructions** — `AGENTS.md` high-level-context correct
5. **Multi-Tool-Consistency** — Same-task produces consistent-results across tools

---

## 1. `.rulesync/` Structure Validation

### 1.1 SYSTEM-Files Present

**Check:** All 11 SYSTEM-Files exist

```bash
# Run in repo-root
ls -1 .rulesync/*.md | grep -E '^.rulesync/[0-9]{2}-' | wc -l
# Expected: 11
```

**Files:**
- [ ] `.rulesync/00-project-core.md`
- [ ] `.rulesync/01-typescript.md`
- [ ] `.rulesync/02-frontend-arch.md`
- [ ] `.rulesync/03-pwa-conventions.md`
- [ ] `.rulesync/04-ui-ux-components.md`
- [ ] `.rulesync/05-api-integration.md`
- [ ] `.rulesync/06-testing-strategy.md`
- [ ] `.rulesync/07-accessibility.md`
- [ ] `.rulesync/08-performance.md`
- [ ] `.rulesync/09-security.md`
- [ ] `.rulesync/10-deployment.md`
- [ ] `.rulesync/11-ai-integration.md`

---

### 1.2 ITERATIVE-Files Present

**Check:** All 6 ITERATIVE-Files exist

```bash
ls -1 .rulesync/_*.md | wc -l
# Expected: 6
```

**Files:**
- [ ] `.rulesync/_planning.md`
- [ ] `.rulesync/_context.md`
- [ ] `.rulesync/_intentions.md`
- [ ] `.rulesync/_experiments.md`
- [ ] `.rulesync/_log.md`
- [ ] `.rulesync/_agents.md`

---

### 1.3 Frontmatter Valid

**Check:** Each file has valid YAML-frontmatter

**Required-Fields (SYSTEM-Files):**
```yaml
---
mode: SYSTEM
id: "XX-filename"
priority: 1-3
version: "0.1.0"
last_review: "YYYY-MM-DD"
targets: ["cursor", "claudecode", "codex"]  # or subset
globs: ["**/*"]  # or specific-globs
description: "..."
---
```

**Required-Fields (ITERATIVE-Files):**
```yaml
---
mode: ITERATIVE
id: "_filename"
priority: 1-3
version: "0.1.0"
last_update: "YYYY-MM-DD"
targets: ["cursor", "claudecode", "codex"]  # or subset
description: "..."
---
```

**Manual-Check (for each file):**
- [ ] Frontmatter is valid-YAML (no syntax-errors)
- [ ] All required-fields present
- [ ] `targets` field matches expected-tool-targets (see Target-Matrix below)

---

### 1.4 Target-Matrix Correct

**SYSTEM-Files:**

| File | Cursor | Claude Code | Codex | Validation |
|------|--------|-------------|-------|------------|
| 00-project-core | ✅ | ✅ | ✅ | [ ] Correct |
| 01-typescript | ✅ | ✅ | ❌ | [ ] Correct |
| 02-frontend-arch | ✅ | ✅ | ❌ | [ ] Correct |
| 03-pwa-conventions | ✅ | ✅ | ❌ | [ ] Correct |
| 04-ui-ux-components | ✅ | ✅ | ❌ | [ ] Correct |
| 05-api-integration | ✅ | ✅ | ❌ | [ ] Correct |
| 06-testing-strategy | ✅ | ✅ | ❌ | [ ] Correct |
| 07-accessibility | ✅ | ✅ | ❌ | [ ] Correct |
| 08-performance | ✅ | ✅ | ❌ | [ ] Correct |
| 09-security | ✅ | ✅ | ✅ | [ ] Correct |
| 10-deployment | ✅ | ✅ | ✅ | [ ] Correct |
| 11-ai-integration | ✅ | ✅ | ✅ | [ ] Correct |

**ITERATIVE-Files:**

| File | Cursor | Claude Code | Codex | Validation |
|------|--------|-------------|-------|------------|
| _planning | ✅ | ✅ | ✅ | [ ] Correct |
| _context | ✅ | ✅ | ✅ | [ ] Correct |
| _intentions | ✅ | ✅ | ✅ | [ ] Correct |
| _experiments | ✅ | ✅ | ❌ | [ ] Correct |
| _log | ✅ | ✅ | ❌ | [ ] Correct |
| _agents | ✅ | ✅ | ✅ | [ ] Correct |

---

### 1.5 Content-Length Reasonable

**Check:** SYSTEM-Files not excessively-long (recommended: <500 lines)

```bash
# Count lines per SYSTEM-File
wc -l .rulesync/[0-9]*.md

# Expected:
# - 00-project-core:      ~280 lines
# - 01-typescript:        ~320 lines
# - 02-frontend-arch:     ~350 lines
# - 03-pwa-conventions:   ~340 lines
# - 04-ui-ux-components:  ~330 lines
# - 05-api-integration:   ~360 lines
# - 06-testing-strategy:  ~340 lines
# - 07-accessibility:     ~330 lines
# - 08-performance:       ~310 lines
# - 09-security:          ~430 lines
# - 10-deployment:        ~410 lines
# - 11-ai-integration:    ~480 lines
```

**Validation:**
- [ ] All SYSTEM-Files <500 lines (or justified if >500)
- [ ] ITERATIVE-Files reasonable-length (~300-500 lines)

---

### 1.6 Content-Quality

**Manual-Check (sample 3-5 files):**
- [ ] Examples present (Good vs. Avoid patterns)
- [ ] Code-snippets well-formatted (syntax-highlighting)
- [ ] No broken-links (internal `./` or external `https://`)
- [ ] No placeholder-text (e.g. "TODO", "FIXME")
- [ ] Domain-specific (not generic, references Sparkfined-specific concepts)

---

## 2. Cursor-Rules Validation

### 2.1 Files Present

**Check:** All 4 Cursor-Rules-Files exist

```bash
ls -1 .cursor/rules/*.md | wc -l
# Expected: 4
```

**Files:**
- [ ] `.cursor/rules/00-core.md`
- [ ] `.cursor/rules/01-frontend.md`
- [ ] `.cursor/rules/02-backend.md`
- [ ] `.cursor/rules/03-ops.md`

---

### 2.2 Content-Simplified (Not Full SYSTEM-Files)

**Check:** Cursor-Rules are **simplified-hints** (not full-copies of SYSTEM-Files)

**Manual-Check (for each file):**
- [ ] `00-core.md` is shorter than `.rulesync/00-project-core.md` + `01-typescript.md` combined
- [ ] `01-frontend.md` is shorter than `.rulesync/02-03-04.md` combined
- [ ] Examples present, but fewer than SYSTEM-Files
- [ ] High-level-guidelines, not exhaustive-rules

**Expected-Length:**
- `00-core.md`: ~100-150 lines (vs. 600 in SYSTEM-Files)
- `01-frontend.md`: ~150-200 lines (vs. 1000 in SYSTEM-Files)
- `02-backend.md`: ~150-200 lines (vs. 1300 in SYSTEM-Files)
- `03-ops.md`: ~100-150 lines (vs. 1300 in SYSTEM-Files)

---

### 2.3 Cursor-Load-Test

**Manual-Test:**

1. Open Cursor
2. Open Cursor-Chat (CMD+L)
3. Ask: "What are the project-rules?"
4. Verify Cursor lists:
   - Project: Sparkfined PWA
   - Tech-Stack: React, TypeScript, Vite
   - Architecture: 5-Layer-Model
   - Key-Patterns: Result<T,E>, Discriminated-Unions

**Validation:**
- [ ] Cursor responds with project-context (not generic)
- [ ] Cursor references `.cursor/rules/` (implicitly or explicitly)

---

### 2.4 Cursor-Code-Suggestion-Test

**Manual-Test:**

1. Open `src/components/Button.tsx` (or create new-file)
2. Type: `export function Button() {`
3. Press Enter, wait for Cursor-suggestion

**Expected:**
- Cursor suggests TypeScript-types (ButtonProps)
- Cursor suggests accessibility-attributes (aria-label, type="button")
- Cursor follows component-conventions (props-destructuring, children)

**Validation:**
- [ ] Cursor-suggestions follow project-conventions
- [ ] Cursor uses Result<T,E> pattern for error-handling (if applicable)
- [ ] Cursor uses semantic-HTML (button, not div)

---

## 3. Claude-Code-Config Validation

### 3.1 File Present

**Check:** `CLAUDE.md` exists in repo-root

```bash
ls -1 CLAUDE.md | wc -l
# Expected: 1
```

**Validation:**
- [ ] `CLAUDE.md` exists
- [ ] File is ~1000-1500 lines (comprehensive, but not exhaustive)

---

### 3.2 Content-Comprehensive

**Check:** `CLAUDE.md` includes all major-sections

**Manual-Check:**
- [ ] Quick-Reference (Project, Tech-Stack, Use-Claude-For)
- [ ] System-Index (all 11 SYSTEM + 6 ITERATIVE files listed)
- [ ] Core-Concepts (from 00-project-core.md)
- [ ] TypeScript (from 01-typescript.md)
- [ ] React-Architecture (from 02-frontend-arch.md)
- [ ] PWA-Conventions (from 03-pwa-conventions.md)
- [ ] UI/UX (from 04-ui-ux-components.md)
- [ ] API-Integration (from 05-api-integration.md)
- [ ] Testing (from 06-testing-strategy.md)
- [ ] Security (from 09-security.md)
- [ ] Deployment (from 10-deployment.md)
- [ ] AI-Integration (from 11-ai-integration.md)
- [ ] Current-Context (from _context.md)
- [ ] Design-Decisions (from _intentions.md, ADRs)
- [ ] Roadmap (from _planning.md)
- [ ] Usage-Tips (Workflow-Tips for Claude)

---

### 3.3 Claude-Load-Test

**Manual-Test:**

1. Open Claude Code
2. Load `CLAUDE.md` into context (drag-drop or "Add File")
3. Ask: "What is the architecture of Sparkfined PWA?"
4. Verify Claude responds with:
   - 5-Layer-Model
   - React + TypeScript + Vite
   - Offline-First-PWA
   - Zustand for global-state, Dexie for persistence

**Validation:**
- [ ] Claude responds with project-architecture (not generic)
- [ ] Claude references `.rulesync/` or `CLAUDE.md` (implicitly)

---

### 3.4 Claude-Refactor-Plan-Test

**Manual-Test:**

1. Open Claude Code
2. Load Context: `CLAUDE.md` + `src/components/InteractiveChart.tsx`
3. Ask: "Plan refactor of InteractiveChart to use Strategy-Pattern for indicators (step-by-step)"
4. Verify Claude provides:
   - Step 1: Create IndicatorStrategy interface
   - Step 2: Implement concrete-strategies (RSIStrategy, EMAStrategy)
   - Step 3: Update InteractiveChart to use strategy-pattern
   - Step 4: Update tests

**Validation:**
- [ ] Claude provides step-by-step-plan (not immediate-code)
- [ ] Claude follows project-conventions (TypeScript, Result<T,E>, testing)

---

## 4. Codex-Instructions Validation

### 4.1 File Present

**Check:** `AGENTS.md` exists in repo-root

```bash
ls -1 AGENTS.md | wc -l
# Expected: 1
```

**Validation:**
- [ ] `AGENTS.md` exists
- [ ] File is ~800-1000 lines (high-level-context, not full-SYSTEM-Files)

---

### 4.2 Content-High-Level (No Granular-Rules)

**Check:** `AGENTS.md` includes ONLY high-level-context

**Manual-Check:**
- [ ] Project-Overview (Vision, Tech-Stack, Architecture)
- [ ] Current-Focus (from _context.md)
- [ ] Design-Decisions (from _intentions.md, ADRs)
- [ ] Roadmap (from _planning.md)
- [ ] Security (from 09-security.md)
- [ ] Deployment (from 10-deployment.md)
- [ ] AI-Integration (from 11-ai-integration.md)
- [ ] **NOT included:** 01-08 SYSTEM-Files (TypeScript, React, PWA, UI/UX, API, Testing, A11y, Performance)
- [ ] **NOT included:** _experiments.md, _log.md (too detailed)

---

### 4.3 Codex-Load-Test

**Manual-Test:**

1. Open Codex (GitHub, CLI, or API)
2. Codex should auto-load `AGENTS.md` from repo-root
3. Ask: "What is the architecture of Sparkfined PWA?"
4. Verify Codex responds with:
   - 5-Layer-Model
   - React + TypeScript + Vite
   - Offline-First-PWA

**Validation:**
- [ ] Codex responds with project-architecture (not generic)
- [ ] Codex references `AGENTS.md` (implicitly or explicitly)

---

### 4.4 Codex-Security-Scan-Test

**Manual-Test:**

1. Open Codex
2. Ask: "Scan repo for hardcoded-API-keys"
3. Verify Codex:
   - Searches for patterns: `API_KEY=`, `sk-`, `Bearer `
   - Reports findings (if any)
   - Follows security-guidelines from `AGENTS.md` (09-security.md)

**Validation:**
- [ ] Codex scans correctly (no false-positives, no missed-leaks)
- [ ] Codex references security-principles from `AGENTS.md`

---

## 5. Multi-Tool-Consistency Test

### 5.1 Sample-Task: Add RSI-Indicator

**Task:** "Add RSI-indicator to InteractiveChart"

**Test with 3 tools:**

**Cursor:**
1. Open Cursor-Chat (CMD+L)
2. Ask: "Add RSI-indicator to InteractiveChart"
3. Record Cursor's approach

**Claude Code:**
1. Open Claude Code
2. Load Context: `CLAUDE.md` + `src/components/InteractiveChart.tsx`
3. Ask: "Add RSI-indicator to InteractiveChart (step-by-step)"
4. Record Claude's approach

**Codex:**
1. Open Codex
2. Ask: "How should I add RSI-indicator to InteractiveChart?"
3. Record Codex's approach

**Expected-Consistency:**
- [ ] All 3 tools suggest creating `src/lib/indicators/rsi.ts`
- [ ] All 3 tools suggest updating `InteractiveChart.tsx` to call RSI-function
- [ ] All 3 tools suggest adding tests in `tests/indicators/rsi.test.ts`
- [ ] All 3 tools follow Result<T,E>-pattern for error-handling
- [ ] All 3 tools use TypeScript-strict-mode (no `any` without TODO)

**Differences (expected):**
- Cursor: Provides immediate-code (full-implementation)
- Claude Code: Provides step-by-step-plan + code-snippets
- Codex: Provides high-level-approach (no granular-code)

---

### 5.2 Sample-Task: Security-Check

**Task:** "Check for secret-leaks in codebase"

**Test with 3 tools:**

**Cursor:**
1. Ask: "Check for hardcoded-API-keys in codebase"
2. Record Cursor's findings

**Claude Code:**
1. Ask: "Scan codebase for hardcoded-secrets (API-keys, tokens)"
2. Record Claude's findings

**Codex:**
1. Ask: "Scan repo for hardcoded-API-keys"
2. Record Codex's findings

**Expected-Consistency:**
- [ ] All 3 tools search for patterns: `API_KEY=`, `sk-`, `Bearer `
- [ ] All 3 tools reference security-guidelines (never expose secrets in client-bundle)
- [ ] All 3 tools suggest using Serverless-Proxies (api/moralis/[...path].ts)

---

## 6. Overall-Validation

### 6.1 Git-Status-Check

**Check:** All generated-configs are committed to Git

```bash
git status

# Should NOT show:
# - Untracked files in .rulesync/
# - Untracked files in .cursor/rules/
# - Untracked CLAUDE.md or AGENTS.md
```

**Validation:**
- [ ] All `.rulesync/*.md` committed
- [ ] All `.cursor/rules/*.md` committed
- [ ] `CLAUDE.md` committed
- [ ] `AGENTS.md` committed
- [ ] `README_RULESYNC.md` committed
- [ ] `VERIFY_RULESYNC.md` committed

---

### 6.2 Documentation-Links-Valid

**Check:** All internal-links in documentation are valid

**Manual-Check:**
- [ ] `README_RULESYNC.md` links to `.rulesync/`, `.cursor/rules/`, `CLAUDE.md`, `AGENTS.md`, `VERIFY_RULESYNC.md`
- [ ] `CLAUDE.md` references `.rulesync/` files (e.g. "See `.rulesync/00-project-core.md`")
- [ ] `AGENTS.md` references `.rulesync/` files (e.g. "from `_context.md`")
- [ ] No broken-links (404s)

---

### 6.3 No-Sensitive-Data

**Check:** No secrets/API-keys in `.rulesync/` or generated-configs

**Manual-Check:**
- [ ] No `API_KEY=sk-abc123...` in any `.rulesync/*.md`
- [ ] No hardcoded-secrets in `CLAUDE.md`, `AGENTS.md`, `.cursor/rules/*.md`
- [ ] All examples use placeholders (e.g. `MORALIS_API_KEY=YOUR_KEY_HERE`)

---

## 7. Final-Checklist

### Phase 4 Completion

**All Files Generated:**
- [ ] `.rulesync/` (11 SYSTEM + 6 ITERATIVE files) ✅
- [ ] `.cursor/rules/` (4 files) ✅
- [ ] `CLAUDE.md` ✅
- [ ] `AGENTS.md` ✅
- [ ] `README_RULESYNC.md` ✅
- [ ] `VERIFY_RULESYNC.md` ✅

**All Validations Passed:**
- [ ] 1. `.rulesync/` Structure ✅
- [ ] 2. Cursor-Rules ✅
- [ ] 3. Claude-Code-Config ✅
- [ ] 4. Codex-Instructions ✅
- [ ] 5. Multi-Tool-Consistency ✅
- [ ] 6. Overall-Validation ✅

**Ready-for-Production:**
- [ ] All files committed to Git
- [ ] No blockers, no critical-warnings
- [ ] Sample-tasks tested with all 3 tools
- [ ] Documentation complete (README, VERIFY)

---

## Revision-History

- **2025-11-12:** Initial creation, Phase 4 (Validation-checklist for all generated-configs and `.rulesync/` structure)

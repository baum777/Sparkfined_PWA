---
mode: ITERATIVE
id: "_agents"
priority: 1
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Multi-tool routing map: usage patterns, target mappings and tool-specific instructions for Cursor, Claude Code and Codex"
---

# Agents — Multi-Tool Targets & Instructions

> **Purpose:** Defines **how different AI tools are used** in the project (Cursor, Claude Code, Codex) and how rules/targets are mapped to them.
>
> **Update-Frequency:** When tool-usage-patterns change (monthly to quarterly).
>
> **Behaviour:** The model keeps this file as the **routing map for AI tools**, and ensures that instructions here stay aligned with target settings in `.rulesync/`, `.cursor/rules/`, `CLAUDE.md` and Codex-specific instructions.

---

## Tool-Overview

Sparkfined PWA uses **3 AI coding-assistants** with different strengths:

| Tool | Primary-Use | Strengths | Context-Model | Status |
|------|-------------|-----------|---------------|--------|
| **Cursor** | Daily-Coding, Debugging | Fast-Iteration, Inline-Edits, Multi-File-Edits | Full `.rulesync/` (11 SYSTEM + 6 ITERATIVE) | ✅ Primary |
| **Claude Code** | Complex-Refactoring, Architecture-Planning | Long-Context, Deep-Reasoning, Documentation | Full `.rulesync/` (11 SYSTEM + 6 ITERATIVE) | ✅ Secondary |
| **Codex** | High-Level-Reviews, Quick-Fixes, Security-Checks | Fast, Broad-Context, Multi-Repo | Subset: 00, `_planning`, `_context`, `_intentions`, 09, 10, 11 | ✅ Tertiary |

---

## Tool-Usage-Patterns

### Cursor (Primary — Daily-Coding)

**When to Use:**
- ✅ Daily feature-development (new components, pages, hooks)
- ✅ Bug-fixes (inline-edits, multi-file-changes)
- ✅ Testing (write/update Vitest, Playwright tests)
- ✅ Debugging (analyze stack-traces, inspect-state)
- ✅ Quick-refactors (rename-variable, extract-function)

**Workflows:**
1. **Cursor-Chat:** Ask questions, get code-suggestions, debug-errors
2. **Cursor-Composer:** Generate multi-file-changes (new feature, refactor)
3. **Inline-Edits:** CMD+K for quick in-file-edits

**Context:**
- Full `.rulesync/` config (11 SYSTEM + 6 ITERATIVE)
- Cursor-Rules generated to `.cursor/rules/` (simplified hints from SYSTEM-Files)

**Typical-Session:**
```
1. Open Cursor
2. CMD+L → Cursor-Chat: "Add RSI-indicator to InteractiveChart"
3. Cursor suggests changes to `InteractiveChart.tsx` + `src/lib/indicators/rsi.ts`
4. Review + Apply
5. CMD+Shift+T → Run tests
6. Commit
```

---

### Claude Code (Secondary — Complex-Refactoring)

**When to Use:**
- ✅ Large-scale-refactoring (restructure 10+ files)
- ✅ Architecture-planning (design new feature, plan migrations)
- ✅ Documentation-writing (READMEs, ADRs, API-docs)
- ✅ Deep-debugging (complex bugs requiring multi-file-analysis)
- ✅ Code-reviews (review PRs, suggest improvements)

**Workflows:**
1. **Claude-Chat:** Ask architecture-questions, plan refactors
2. **Multi-File-Context:** Load 10-15 files for deep-analysis
3. **Step-by-Step-Planning:** Break down complex tasks into steps
4. **Documentation:** Generate comprehensive docs from code

**Context:**
- Full `.rulesync/` config (11 SYSTEM + 6 ITERATIVE)
- `CLAUDE.md` at repo-root (generated from `.rulesync/`, optimised for Claude)

**Context-Limits:**
- Claude 3.5 Sonnet: ~200K tokens (~150 files)
- Prefer: 10-15 key files per session (better reasoning)
- Use summaries for larger refactors

**Typical-Session:**
```
1. Open Claude Code
2. Load Context: `src/components/InteractiveChart.tsx`, `src/lib/indicators/*.ts`, `02-frontend-arch.md`
3. Ask: "Refactor InteractiveChart to use Strategy-Pattern for indicators"
4. Claude provides step-by-step plan
5. Review plan → Execute via Cursor or manually
6. Update `_intentions.md` with ADR for refactor-decision
```

---

### Codex (Tertiary — High-Level-Reviews)

**When to Use:**
- ✅ High-level-code-reviews (scan repo for patterns, anti-patterns)
- ✅ Security-checks (scan for secret-leaks, unsafe-patterns)
- ✅ Quick-bug-fixes (simple fixes, no deep-context required)
- ✅ Cross-repo-context (compare patterns across multiple-repos)
- ✅ Onboarding-questions (explain repo-structure, get high-level-overview)

**Workflows:**
1. **Codex-Chat:** Ask high-level-questions about repo
2. **Quick-Fixes:** Small edits (typo, import-fix, simple-logic)
3. **Security-Scans:** Check for common vulnerabilities
4. **Pattern-Detection:** Find all instances of anti-pattern

**Context:**
- **Subset of `.rulesync/`** (high-level only, not granular-rules):
  - `00-project-core.md` — Vision, domain-map, tech-stack
  - `_planning.md` — Current sprint, roadmap
  - `_context.md` — Session-focus, open-questions
  - `_intentions.md` — Design-decisions, ADRs
  - `09-security.md` — Security-principles
  - `10-deployment.md` — Deployment-process
  - `11-ai-integration.md` — AI-architecture
- **NOT included:** 01-08 (granular implementation-rules like TypeScript, React-patterns)

**Rationale:**
- Codex excels at broad-context, high-level-reasoning
- Granular-rules (TypeScript-patterns, Component-structure) are better for Cursor/Claude
- Codex gets "what we're building" + "why" + "current-focus", not "how to implement"

**Typical-Session:**
```
1. Open Codex (via GitHub, CLI, or API)
2. Ask: "Scan repo for hardcoded-API-keys or secrets"
3. Codex scans `.rulesync/09-security.md` + codebase
4. Reports findings: "Found hardcoded Moralis-Key in api/data/proxy.ts:12"
5. Fix manually or via Cursor
```

**Codex-Specific-Instructions:**
See `AGENTS.md` (repo-root) for full Codex-instructions (generated in Phase 4).

---

## Target-Mappings (File → Tool)

### How Targets Work

Each `.rulesync/*.md` file has a `targets` field in frontmatter:

```yaml
---
targets: ["cursor", "claudecode", "codex"]
---
```

**Targets:**
- `cursor` → File is relevant for Cursor (included in `.cursor/rules/`)
- `claudecode` → File is relevant for Claude Code (included in `CLAUDE.md`)
- `codex` → File is relevant for Codex (included in `AGENTS.md`)

---

### SYSTEM-Files Target-Matrix

| File | ID | Cursor | Claude Code | Codex | Rationale |
|------|----|----|----|----|-----------|
| `00-project-core.md` | 00 | ✅ | ✅ | ✅ | High-level vision, domain-map — all tools need this |
| `01-typescript.md` | 01 | ✅ | ✅ | ❌ | TypeScript-rules too granular for Codex (Cursor/Claude use daily) |
| `02-frontend-arch.md` | 02 | ✅ | ✅ | ❌ | React-architecture too granular for Codex |
| `03-pwa-conventions.md` | 03 | ✅ | ✅ | ❌ | PWA-implementation-details too granular |
| `04-ui-ux-components.md` | 04 | ✅ | ✅ | ❌ | Component-patterns too granular |
| `05-api-integration.md` | 05 | ✅ | ✅ | ❌ | API-patterns too granular |
| `06-testing-strategy.md` | 06 | ✅ | ✅ | ❌ | Testing-patterns too granular |
| `07-accessibility.md` | 07 | ✅ | ✅ | ❌ | A11y-patterns too granular |
| `08-performance.md` | 08 | ✅ | ✅ | ❌ | Performance-patterns too granular |
| `09-security.md` | 09 | ✅ | ✅ | ✅ | Security-principles relevant for Codex (reviews, scans) |
| `10-deployment.md` | 10 | ✅ | ✅ | ✅ | Deployment-process relevant for Codex (ops-questions) |
| `11-ai-integration.md` | 11 | ✅ | ✅ | ✅ | AI-architecture relevant for Codex (AI-related-questions) |

**Summary:**
- **Cursor:** All 12 files (00-11) — needs full context for daily-coding
- **Claude Code:** All 12 files (00-11) — needs full context for refactoring
- **Codex:** 4 files (00, 09, 10, 11) — high-level context only

---

### ITERATIVE-Files Target-Matrix

| File | Cursor | Claude Code | Codex | Rationale |
|------|--------|-------------|-------|-----------|
| `_planning.md` | ✅ | ✅ | ✅ | All tools need current sprint/roadmap |
| `_context.md` | ✅ | ✅ | ✅ | All tools need session-focus, open-questions |
| `_intentions.md` | ✅ | ✅ | ✅ | All tools need design-decisions, ADRs |
| `_experiments.md` | ✅ | ✅ | ❌ | Experiments too detailed for Codex (Cursor/Claude use for context) |
| `_log.md` | ✅ | ✅ | ❌ | Timeline too detailed for Codex (Cursor/Claude use for history) |
| `_agents.md` | ✅ | ✅ | ✅ | All tools need routing-map (self-referential) |

**Summary:**
- **Cursor:** All 6 ITERATIVE files — needs full dynamic-context
- **Claude Code:** All 6 ITERATIVE files — needs full dynamic-context
- **Codex:** 4 ITERATIVE files (`_planning`, `_context`, `_intentions`, `_agents`) — high-level context only

---

## Tool-Specific-Instructions

### Cursor-Specific

#### Workflow-Tips

**1. Use Cursor-Chat for Questions:**
```
✅ Good: "How is the AI-Orchestrator implemented?"
✅ Good: "Where is the Service-Worker-config?"
✅ Good: "Add RSI-indicator to InteractiveChart"
```

**2. Use Cursor-Composer for Multi-File-Changes:**
```
✅ Good: "Refactor InteractiveChart to use Strategy-Pattern for indicators"
   → Cursor edits: InteractiveChart.tsx, src/lib/indicators/*.ts, tests/InteractiveChart.test.ts
```

**3. Use CMD+K for Inline-Edits:**
```
✅ Good: Select function → CMD+K → "Add JSDoc comment"
✅ Good: Select variable → CMD+K → "Rename to chartData"
```

**4. Run Tests Before Committing:**
```bash
# In Cursor-Terminal
pnpm test              # Vitest unit-tests
pnpm run test:e2e      # Playwright E2E-tests
pnpm run typecheck     # TypeScript check
pnpm run lint          # ESLint
```

#### Cursor-Rules-Location

**Generated in Phase 4:**
- `.cursor/rules/00-core.md` — Project-core + TypeScript
- `.cursor/rules/01-frontend.md` — React + PWA + UI/UX
- `.cursor/rules/02-backend.md` — API + Testing + A11y + Performance
- `.cursor/rules/03-ops.md` — Security + Deployment + AI

**Format:** Simplified "hint-style" rules (not full SYSTEM-Files, but key-takeaways)

---

### Claude-Code-Specific

#### Workflow-Tips

**1. Load Key Files First:**
```
✅ Good: Load 10-15 relevant files before asking complex-questions
✅ Good: Use "Add Context" → Select files by glob (e.g. src/components/**/*.tsx)
```

**2. Ask for Step-by-Step-Plans:**
```
✅ Good: "Plan refactor of InteractiveChart to Strategy-Pattern (step-by-step)"
✅ Good: "Generate migration-plan for LocalStorage → IndexedDB"
```

**3. Use for Documentation:**
```
✅ Good: "Generate README for src/lib/indicators/"
✅ Good: "Write ADR for Zustand vs. Redux decision"
```

**4. Review Output Carefully:**
```
⚠️ Claude sometimes hallucinates file-paths or API-names
⚠️ Always verify suggestions against actual codebase
```

#### Claude-Code-Config-Location

**Generated in Phase 4:**
- `CLAUDE.md` (repo-root) — Full `.rulesync/` config, optimised for Claude's format

**Format:** Markdown with clear sections, examples, and context-notes

---

### Codex-Specific

#### Workflow-Tips

**1. Ask High-Level-Questions:**
```
✅ Good: "What is the architecture of Sparkfined PWA?"
✅ Good: "Where are API-secrets stored?"
✅ Good: "How does the AI-Orchestrator work?"

❌ Avoid: "Refactor InteractiveChart.tsx to use Strategy-Pattern"
   → Too granular, Codex doesn't have 01-08 rules
```

**2. Use for Security-Scans:**
```
✅ Good: "Scan repo for hardcoded-API-keys"
✅ Good: "Check if any VITE_ env-vars expose secrets"
✅ Good: "Find all instances of fetch() without error-handling"
```

**3. Use for Quick-Fixes:**
```
✅ Good: "Fix typo in README.md line 42"
✅ Good: "Add missing import in api/health.ts"

❌ Avoid: Complex-refactors (use Cursor or Claude Code)
```

**4. Use for Onboarding:**
```
✅ Good: "Explain the 5-layer-architecture"
✅ Good: "What is the tech-stack?"
✅ Good: "What are the current sprint-goals?"
```

#### Codex-Config-Location

**Generated in Phase 4:**
- `AGENTS.md` (repo-root) — Codex-specific-instructions + subset of `.rulesync/`

**Format:** Markdown with clear instructions, no JSON (Codex prefers natural-language)

**Content:**
- High-level context from 00, `_planning`, `_context`, `_intentions`
- Security-guidelines from 09
- Deployment-overview from 10
- AI-architecture from 11
- Explicit "NOT included" note for 01-08 (granular-rules)

---

## Context-Size-Guidelines

### Cursor

**Context-Window:** ~20K tokens (~15 files)

**Recommendations:**
- Use Cursor-Composer for multi-file-edits (auto-loads relevant files)
- Use `@filename` to reference specific-files in Cursor-Chat
- Avoid loading entire `docs/` directory (too large)

---

### Claude Code

**Context-Window:** ~200K tokens (~150 files)

**Recommendations:**
- Load 10-15 key-files per session (better reasoning than 100+)
- Use summaries for larger-refactors ("Summarise all components in src/components/")
- Prefer: Load SYSTEM-Files + relevant-code-files (not entire-repo)

---

### Codex

**Context-Window:** ~100K tokens (~80 files)

**Recommendations:**
- Codex auto-loads relevant-context from repo (no manual-file-selection)
- Prefer high-level-questions (Codex scans broad-context)
- Use for: Cross-file-pattern-detection, security-scans, onboarding

---

## Multi-Tool-Workflow (Example)

**Scenario:** Add new "Ichimoku" indicator to InteractiveChart

### Step 1: Planning (Claude Code)
```
1. Open Claude Code
2. Load Context: `02-frontend-arch.md`, `src/components/InteractiveChart.tsx`, `src/lib/indicators/rsi.ts`
3. Ask: "Plan implementation of Ichimoku-indicator (step-by-step)"
4. Claude provides plan:
   - Create `src/lib/indicators/ichimoku.ts`
   - Update `InteractiveChart.tsx` to support new indicator
   - Add tests in `tests/indicators/ichimoku.test.ts`
5. Review plan → Approve
```

### Step 2: Implementation (Cursor)
```
1. Open Cursor
2. CMD+L → Cursor-Composer: "Implement Ichimoku-indicator based on plan in _context.md"
3. Cursor generates:
   - `src/lib/indicators/ichimoku.ts` (Tenkan, Kijun, Senkou-A, Senkou-B, Chikou)
   - Updates `InteractiveChart.tsx` (add Ichimoku-option)
   - Updates `tests/indicators/ichimoku.test.ts`
4. Review changes → Apply
5. Run tests: `pnpm test`
6. Commit: `git commit -m "feat: Add Ichimoku indicator"`
```

### Step 3: Review (Codex)
```
1. Push to GitHub
2. Codex auto-reviews PR:
   - ✅ No hardcoded-values
   - ✅ Tests added
   - ⚠️ Missing JSDoc-comment in ichimoku.ts
3. Fix comment via Cursor
4. Merge PR
```

---

## Notes for AI Agents

**When to Update:**
- Tool-usage-patterns change (new tool added, workflow-changed)
- Target-mappings change (file should go to different tool)
- Tool-specific-instructions need updates (new workflow discovered)

**What to Keep Aligned:**
- `.rulesync/` frontmatter `targets` field
- `.cursor/rules/` (generated from SYSTEM-Files)
- `CLAUDE.md` (generated from SYSTEM-Files)
- `AGENTS.md` (generated from SYSTEM-Files subset)

**What Not to Document Here:**
- Individual-commits (use `_log.md`)
- Detailed-tool-usage-logs (use `_context.md`)
- Tool-bugs/issues (use issue-tracker)

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 ITERATIVE-Q&A (Multi-Tool-Routing-Map, Target-Mappings, Tool-Specific-Instructions)

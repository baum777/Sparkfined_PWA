# Rulesync — Multi-Tool Prompt System

> **Auto-Generated Documentation** (Phase 4 — Multi-Tool-Prompt-System)
>
> **Purpose:** Unified prompt-system for 3 AI-tools (Cursor, Claude Code, Codex) with single-source-of-truth in `.rulesync/`.
>
> **Last-Update:** 2025-11-12

---

## Overview

This repository uses **Rulesync** to manage AI-coding-assistant-prompts for 3 tools:

1. **Cursor** (Primary) — Daily-coding, debugging, testing
2. **Claude Code** (Secondary) — Complex-refactoring, architecture-planning, documentation
3. **Codex** (Tertiary) — High-level-reviews, security-checks, quick-fixes

**Single-Source-of-Truth:** All rules are defined in `.rulesync/` (Markdown), then **generated** to tool-specific-configs:

```
.rulesync/                   — Source (11 SYSTEM + 6 ITERATIVE files)
  ├─ 00-project-core.md
  ├─ 01-typescript.md
  ├─ ...
  ├─ 11-ai-integration.md
  ├─ _planning.md
  ├─ _context.md
  ├─ ...
  └─ _agents.md

↓ Rulesync generates ↓

.cursor/rules/               — Cursor-specific hints (4 files)
  ├─ 00-core.md
  ├─ 01-frontend.md
  ├─ 02-backend.md
  └─ 03-ops.md

CLAUDE.md                    — Claude Code config (1 file, full context)

AGENTS.md                    — Codex instructions (1 file, high-level context)
```

---

## Structure

### SYSTEM-Files (Stable, Canonical Rules)

| ID | File | Priority | Targets | Topics |
|----|------|----------|---------|--------|
| 00 | `project-core.md` | 1 | cursor, claudecode, codex | Vision, domain-map, tech-stack, system-index |
| 01 | `typescript.md` | 1 | cursor, claudecode | TypeScript strict-mode, patterns, conventions |
| 02 | `frontend-arch.md` | 1 | cursor, claudecode | React architecture, routing, state-management |
| 03 | `pwa-conventions.md` | 2 | cursor, claudecode | Service-Worker, offline-mode, caching |
| 04 | `ui-ux-components.md` | 2 | cursor, claudecode | Component-taxonomy, design-principles, Tailwind |
| 05 | `api-integration.md` | 2 | cursor, claudecode | Serverless-APIs, fetchWithRetry, Result<T,E> |
| 06 | `testing-strategy.md` | 3 | cursor, claudecode | Test-pyramid, Vitest, Playwright, coverage |
| 07 | `accessibility.md` | 3 | cursor, claudecode | WCAG 2.1 AA, semantic-HTML, keyboard-nav |
| 08 | `performance.md` | 3 | cursor, claudecode | Bundle-size, Core-Web-Vitals, optimisations |
| 09 | `security.md` | 2 | cursor, claudecode, codex | Secrets-management, input-validation, HTTPS |
| 10 | `deployment.md` | 2 | cursor, claudecode, codex | Vercel-config, CI/CD, rollback, health-checks |
| 11 | `ai-integration.md` | 2 | cursor, claudecode, codex | Dual-AI-provider, prompt-design, cost-management |

**Total:** 11 files, ~4080 lines

---

### ITERATIVE-Files (Dynamic, Updated Frequently)

| File | Priority | Targets | Purpose |
|------|----------|---------|---------|
| `_planning.md` | 1 | cursor, claudecode, codex | Current sprint, roadmap, backlog, releases |
| `_context.md` | 1 | cursor, claudecode, codex | Session-focus, open-questions, blockers |
| `_intentions.md` | 2 | cursor, claudecode, codex | Design-decisions, ADRs (Mini-ADR-format) |
| `_experiments.md` | 3 | cursor, claudecode | Tech-spikes, A/B-tests, prototypes |
| `_log.md` | 3 | cursor, claudecode | Timeline, significant-commits, releases |
| `_agents.md` | 1 | cursor, claudecode, codex | Multi-tool-routing-map (Cursor, Claude Code, Codex) |

**Total:** 6 files, ~2720 lines

---

## Installation

### Prerequisites

- Node.js 18+ (for Rulesync CLI, if available)
- pnpm 8+ (or npm/yarn)
- Cursor, Claude Code, or Codex installed

### Step 1: Clone Repository

```bash
git clone https://github.com/sparkfined/app.git
cd app
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Verify Rulesync Structure

```bash
# Check if .rulesync/ exists
ls -la .rulesync/

# Should see:
# - 00-project-core.md
# - 01-typescript.md
# - ...
# - 11-ai-integration.md
# - _planning.md
# - _context.md
# - ...
# - _agents.md
```

### Step 4: Generate Tool-Configs (Manual, if Rulesync CLI not available)

**Currently:** Tool-configs are **already generated** in this repository:
- `.cursor/rules/*.md` ✅
- `CLAUDE.md` ✅
- `AGENTS.md` ✅

**If you modify `.rulesync/` files:**
- Manually update `.cursor/rules/*.md` (simplified-hints from SYSTEM-Files)
- Manually update `CLAUDE.md` (full-context, optimised-format)
- Manually update `AGENTS.md` (high-level-context, no 01-08)

**Future:** Rulesync CLI will auto-generate configs via `pnpm run rulesync:generate`.

---

## Usage

### Cursor

**Cursor** automatically loads rules from `.cursor/rules/*.md`.

**How to Use:**
1. Open repository in Cursor
2. Cursor-Chat (CMD+L) → Ask questions, get code-suggestions
3. Cursor-Composer → Generate multi-file-changes
4. Cursor reads `.cursor/rules/` for context

**Example:**
```
CMD+L → "Add RSI-indicator to InteractiveChart"
Cursor suggests changes based on:
  - .cursor/rules/00-core.md (TypeScript-conventions)
  - .cursor/rules/01-frontend.md (React-patterns)
  - .cursor/rules/02-backend.md (Testing-conventions)
```

---

### Claude Code

**Claude Code** reads `CLAUDE.md` for full-context.

**How to Use:**
1. Open repository in Claude Code (or load `CLAUDE.md` manually)
2. Load 10-15 relevant files for deep-analysis
3. Ask for step-by-step-plans, refactors, or documentation
4. Claude reads `CLAUDE.md` for context

**Example:**
```
Load Context:
  - .rulesync/02-frontend-arch.md
  - src/components/InteractiveChart.tsx
  - src/lib/indicators/*.ts

Ask: "Plan refactor of InteractiveChart to Strategy-Pattern (step-by-step)"

Claude provides:
  1. Create IndicatorStrategy interface
  2. Implement RSIStrategy, EMAStrategy, etc.
  3. Update InteractiveChart to use strategy-pattern
  4. Update tests
```

---

### Codex

**Codex** reads `AGENTS.md` for high-level-context.

**How to Use:**
1. Codex auto-loads `AGENTS.md` from repo-root
2. Ask high-level-questions or request security-scans
3. Codex provides broad-context-reviews, no granular-implementation

**Example:**
```
Ask: "Scan repo for hardcoded-API-keys"

Codex:
  - Reads AGENTS.md (security-principles from 09-security.md)
  - Scans *.ts files for patterns: API_KEY=, sk-, Bearer
  - Reports: "Found hardcoded-key in api/data/proxy.ts:12"
```

---

## Maintenance

### When to Update SYSTEM-Files

**SYSTEM-Files** are **stable** and change **rarely** (monthly to quarterly):

- New architecture-pattern adopted (e.g. switch from Zustand to Jotai)
- New tech-stack-choice (e.g. add Supabase)
- Breaking-changes in conventions (e.g. enable TypeScript-strict-mode)

**Update-Process:**
1. Edit `.rulesync/XX-filename.md`
2. Regenerate tool-configs (manual or via `pnpm run rulesync:generate`)
3. Commit changes to Git

---

### When to Update ITERATIVE-Files

**ITERATIVE-Files** are **dynamic** and change **frequently** (daily to weekly):

- `_planning.md` → Start of new sprint, feature-prioritisation-changes
- `_context.md` → Per working-session (multiple times per day)
- `_intentions.md` → When important-decisions are made (weekly to monthly)
- `_experiments.md` → When starting/completing-experiments (weekly to monthly)
- `_log.md` → After significant-events (daily to weekly)
- `_agents.md` → When tool-usage-patterns change (monthly to quarterly)

**Update-Process:**
1. Edit `.rulesync/_filename.md` directly
2. Commit changes to Git (tool-configs auto-read from `.rulesync/`)

---

### Version-Control

**All `.rulesync/` files are committed to Git:**
- ✅ `00-11` SYSTEM-Files
- ✅ `_*` ITERATIVE-Files
- ✅ `.cursor/rules/*.md` (generated, but committed for convenience)
- ✅ `CLAUDE.md` (generated, but committed)
- ✅ `AGENTS.md` (generated, but committed)

**Rationale:** AI-tools read from local-files, so configs must be in Git.

---

## Validation

### Pre-Commit-Checklist

Before committing changes to `.rulesync/`:

```bash
# 1. Check Markdown-Syntax (no broken-links, headers)
pnpm run lint:md  # (if available, or use markdownlint-cli)

# 2. Check Frontmatter (YAML-valid, required-fields present)
# Manual: Open each file, verify frontmatter

# 3. Check Content-Length (SYSTEM-Files <500 lines recommended)
wc -l .rulesync/*.md

# 4. Regenerate Tool-Configs (manual or via CLI)
pnpm run rulesync:generate  # (if available)

# 5. Test with Cursor/Claude/Codex
# Open Cursor → Ask test-question → Verify context is correct
```

---

### VERIFY-Checklist

See `VERIFY_RULESYNC.md` for full-validation-checklist.

---

## Troubleshooting

### Cursor Not Loading Rules

**Issue:** Cursor-Chat doesn't seem to use `.cursor/rules/`.

**Solution:**
1. Check if `.cursor/rules/*.md` exists
2. Restart Cursor (CMD+Q, reopen)
3. Check Cursor-Settings → Rules → Ensure custom-rules enabled
4. Try CMD+L → Ask "What are the Cursor-Rules?" (Cursor should list them)

---

### Claude Code Not Reading CLAUDE.md

**Issue:** Claude Code doesn't seem to use `CLAUDE.md`.

**Solution:**
1. Check if `CLAUDE.md` exists in repo-root
2. Manually add `CLAUDE.md` to Claude-Chat-Context (drag-drop or "Add File")
3. Ask "What are the project-rules?" (Claude should summarise `CLAUDE.md`)

---

### Codex Not Understanding Context

**Issue:** Codex gives generic-answers, seems to ignore `AGENTS.md`.

**Solution:**
1. Check if `AGENTS.md` exists in repo-root
2. Codex auto-loads from repo-root, but may need explicit-prompt:
   - Ask: "Read AGENTS.md and explain the project-architecture"
3. If Codex still ignores: Paste key-sections of `AGENTS.md` into prompt

---

## FAQ

### Why Rulesync instead of `.cursorrules` / `CLAUDE.md` directly?

**Problem:** Maintaining 3 separate-configs (Cursor, Claude, Codex) leads to drift and inconsistency.

**Solution:** Single-Source-of-Truth (`.rulesync/`) + generated-configs for each tool.

**Benefits:**
- ✅ Consistency across tools
- ✅ Easier maintenance (edit once, generate for all)
- ✅ Version-control-friendly (track changes in `.rulesync/`)

---

### Why 11 SYSTEM-Files instead of 1 big file?

**Rationale:**
- Each file has clear-responsibility (TypeScript, React, PWA, Testing, etc.)
- Easier to navigate (jump to relevant-file, not scroll through 5000-line-doc)
- Easier to maintain (small-files, targeted-updates)
- Easier for AI-tools to load (selective-context, not full-5000-lines)

---

### Why 6 ITERATIVE-Files?

**Rationale:**
- SYSTEM-Files are stable (monthly-updates), ITERATIVE-Files are dynamic (daily-updates)
- Separating planning, context, decisions, experiments, log allows focused-updates
- AI-tools can load only relevant-ITERATIVE-files (e.g. Claude loads `_planning` + `_context` for session-context)

---

### Can I use Rulesync for my own project?

**Yes!** Rulesync-structure is project-agnostic:

1. Copy `.rulesync/` structure (11 SYSTEM + 6 ITERATIVE templates)
2. Adapt content to your project (tech-stack, architecture, conventions)
3. Generate tool-configs (manual or via Rulesync-CLI, if available)
4. Commit to Git, share with team

**Future:** Rulesync-CLI will support `rulesync init` (scaffolds `.rulesync/` structure for new-projects).

---

## Related-Files

- `.rulesync/` — Source-of-Truth (11 SYSTEM + 6 ITERATIVE files)
- `.cursor/rules/` — Cursor-specific hints (4 files)
- `CLAUDE.md` — Claude Code config (1 file)
- `AGENTS.md` — Codex instructions (1 file)
- `VERIFY_RULESYNC.md` — Validation-checklist

---

## Revision-History

- **2025-11-12:** Initial creation, Phase 4 (Installation, Usage, Maintenance-Guide for Rulesync-based multi-tool-prompt-system)

# Cursor Rules — Overview

> **Auto-Generated from `.rulesync/`** (Phase 4 — Multi-Tool-Prompt-System)  
> **Last-Update:** 2025-11-13

---

## What's This?

This directory contains **simplified, hint-style rules** for Cursor and Claude Code, generated from the canonical source of truth in `.rulesync/`.

---

## Rule Files

| File | Purpose | Source | Target Tools |
|------|---------|--------|--------------|
| `00-core.md` | Project core + TypeScript conventions | `.rulesync/00-project-core.md` + `01-typescript.md` | Cursor, Claude Code |
| `01-frontend.md` | React + PWA + UI/UX patterns | `.rulesync/02-frontend-arch.md` + `03-pwa-conventions.md` + `04-ui-ux-components.md` | Cursor, Claude Code |
| `02-backend.md` | API + Testing + A11y + Performance | `.rulesync/05-api-integration.md` + `06-testing-strategy.md` + `07-accessibility.md` + `08-performance.md` | Cursor, Claude Code |
| `03-ops.md` | Security + Deployment + AI | `.rulesync/09-security.md` + `10-deployment.md` + `11-ai-integration.md` | Cursor, Claude Code |
| **`claude-ui-vite.md`** | **Vite UI Agent (Claude-specific)** | Custom rule for UI workflow | **Claude Code** |

---

## Special Rule: Claude UI Agent

**File:** `claude-ui-vite.md`

**Purpose:** Dedicated UI-coding workflow for Claude Code when implementing React components from wireframes.

**Scope:**
- `src/components/**/*.{tsx,jsx}`
- `src/pages/**/*.{tsx,jsx}`
- `src/sections/**/*.{tsx,jsx}`

**Workflow:**
1. Read wireframe spec from `wireframes/mobile/*.md` or `wireframes/desktop/*.md`
2. Generate 3 responsive variants (Mobile 375px, Tablet 768px, Desktop 1024px+)
3. Follow component taxonomy (4 levels: Primitives → Composed → Sections → Pages)
4. Ensure WCAG 2.1 AA compliance
5. Update wireframe with change review

**When to Use:**
- ✅ Implementing new pages/sections from wireframes
- ✅ Creating component variations (mobile/tablet/desktop)
- ✅ Complex UI refactoring (10+ components)
- ✅ Design system updates

**When NOT to Use:**
- ❌ Quick component fixes (use Cursor)
- ❌ Business logic / hooks (use Cursor)
- ❌ API / backend work (use Cursor)

---

## Source of Truth

**All rules derive from:** `.rulesync/` (11 SYSTEM + 6 ITERATIVE files)

**Rule Targets (Tools):**
- **Cursor:** All rules (00-03) + Claude UI Agent
- **Claude Code:** All rules (00-03) + Claude UI Agent (dedicated workflow)
- **Codex:** High-level only (00, _planning, _context, _intentions, 09, 10, 11)

**Multi-Tool Routing Map:** `.rulesync/_agents.md`

---

## How Rules Are Generated

```
.rulesync/00-project-core.md       ┐
.rulesync/01-typescript.md         ├──> .cursor/rules/00-core.md
                                   ┘

.rulesync/02-frontend-arch.md      ┐
.rulesync/03-pwa-conventions.md    ├──> .cursor/rules/01-frontend.md
.rulesync/04-ui-ux-components.md   ┘

.rulesync/05-api-integration.md    ┐
.rulesync/06-testing-strategy.md   │
.rulesync/07-accessibility.md      ├──> .cursor/rules/02-backend.md
.rulesync/08-performance.md        ┘

.rulesync/09-security.md           ┐
.rulesync/10-deployment.md         ├──> .cursor/rules/03-ops.md
.rulesync/11-ai-integration.md     ┘

(Custom UI Workflow)               ──> .cursor/rules/claude-ui-vite.md
```

---

## Usage

### For Cursor

Cursor automatically loads all `.md` files in this directory. No manual configuration needed.

**Tips:**
- Use `CMD+L` for Cursor Chat (ask questions, get suggestions)
- Use `CMD+Shift+L` for Cursor Composer (multi-file changes)
- Use `CMD+K` for inline edits

### For Claude Code

Claude Code reads:
1. `CLAUDE.md` at repo root (full `.rulesync/` config)
2. This directory's rules (when working on specific domains)
3. **`claude-ui-vite.md`** when implementing UI from wireframes

**Tips:**
- Load 10-15 relevant files before asking complex questions
- Ask for step-by-step plans for refactors
- Use for documentation generation

---

## Maintenance

**When to Update:**
- When SYSTEM files in `.rulesync/` change
- When new design patterns emerge
- When tool-usage-patterns change

**How to Update:**
- Edit `.rulesync/` files (source of truth)
- Regenerate these files from `.rulesync/` (manual or scripted)
- Validate references, patterns, examples

**DO NOT:**
- Edit these files directly (they'll be overwritten)
- Duplicate rules between files (use references)
- Add granular implementation details (keep hint-style)

---

## Related

**Full Context:**
- `.rulesync/` — 11 SYSTEM + 6 ITERATIVE files (canonical source)
- `.rulesync/_agents.md` — Multi-tool routing map
- `CLAUDE.md` — Full config for Claude Code (repo root)
- `AGENTS.md` — Codex-specific instructions (repo root)

**Wireframes (for UI work):**
- `wireframes/mobile/*.md` — Mobile page specs
- `wireframes/desktop/*.md` — Desktop wireframes
- `wireframes/components/INTERACTION-SPECS.md` — Component interaction details

---

## Revision History

- **2025-11-13:** Added `claude-ui-vite.md` (Vite UI Agent for Claude Code)
- **2025-11-12:** Initial creation, Phase 4 (4 consolidated rule files: 00-03)

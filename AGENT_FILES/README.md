# AGENT_FILES — AI Tool Configurations

**Purpose:** Centralized configuration files for all AI development tools (Cursor, Claude Code, Codex, Rulesync).

**Last Updated:** 2025-11-25

---

## 📂 Structure

```
AGENT_FILES/
├── README.md (this file)
├── .rulesync/              — Rulesync Multi-Tool Prompt System (Source of Truth)
│   ├── 00-11: SYSTEM files (stable, canonical rules)
│   ├── _*: ITERATIVE files (dynamic, updated frequently)
│   └── README_RULESYNC.md
├── .cursor/                — Cursor IDE Rules (generated from .rulesync)
│   └── rules/
│       ├── 00-core.md
│       ├── 01-frontend.md
│       ├── 02-backend.md
│       └── 03-ops.md
├── CLAUDE.md               — Claude Code Configuration (generated from .rulesync)
├── AGENTS.md               — Codex Configuration (generated from .rulesync)
└── Global_Rules.md         — Global Coding Rules (cross-tool)
```

---

## 🤖 AI Tools Overview

### 1. Rulesync (.rulesync/)
**Source of Truth** for all AI tool configurations.

**SYSTEM Files (11):**
- Stable, canonical rules for project core, TypeScript, frontend, PWA, UI/UX, API, testing, accessibility, performance, security, deployment, AI integration

**ITERATIVE Files (6):**
- Dynamic files updated frequently: planning, context, intentions, experiments, log, agents

**Usage:**
```bash
# Read all SYSTEM files for project understanding
cat .rulesync/00-project-core.md

# Check current sprint
cat .rulesync/_planning-current.md
```

### 2. Cursor (.cursor/)
**Auto-generated** from .rulesync/ for Cursor IDE.

**Configuration:**
```json
// .cursor/settings.json
{
  "cursor.rules.path": "AGENT_FILES/.cursor/rules"
}
```

### 3. Claude Code (CLAUDE.md)
**Auto-generated** from .rulesync/ for Claude Code (Anthropic CLI).

**Usage:**
- Claude Code automatically loads CLAUDE.md when present in project root
- After restructuring: Load via `AGENT_FILES/CLAUDE.md` or use symlink

### 4. Codex (AGENTS.md)
**Auto-generated** from .rulesync/ for Codex (GitHub Copilot Agent).

**Usage:**
- Codex automatically loads AGENTS.md when present in project root
- After restructuring: Load via `AGENT_FILES/AGENTS.md` or use symlink

---

## 🔧 Backward Compatibility

**Symlinks (Transition Phase: 3-6 months):**

```bash
# Root-level symlinks for backward compatibility
ln -s AGENT_FILES/.rulesync .rulesync
ln -s AGENT_FILES/.cursor .cursor
ln -s AGENT_FILES/CLAUDE.md CLAUDE.md
ln -s AGENT_FILES/AGENTS.md AGENTS.md
```

**After 3-6 months:**
- Remove symlinks
- Update tool configs to use `AGENT_FILES/` directly

---

## 📝 Maintenance

### Updating Configurations

**All changes should be made in .rulesync/ (Source of Truth):**

```bash
# Edit SYSTEM file
vim AGENT_FILES/.rulesync/02-frontend-arch.md

# Regenerate tool-specific configs
./scripts/generate-agent-configs.sh  # (if exists)
```

### Adding New Tools

When adding a new AI tool:

1. Create tool-specific config in `AGENT_FILES/`
2. Document in this README
3. Update `.rulesync/_agents.md` if needed

---

## 🔗 Related Documentation

- [Rulesync System Documentation](AGENT_FILES/.rulesync/README_RULESYNC.md)
- [Project Documentation](../docs/README.md)
- [Active Working Documents](../docs/active/README.md)

---

**Note:** This directory was created during the 2025-11-25 documentation restructuring to centralize all AI tool configurations.

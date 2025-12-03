# 🚀 Rulesync Setup Complete – Handover Notes

## ✅ What Was Created

### 1. **Rulesync Configuration** (`rulesync.jsonc`)
- Targets: Cursor, Claude Code, Copilot, Cline
- Features enabled: `rules`, `ignore`
- Outputs configured for all 4 tools

### 2. **AI Ignore Patterns** (`.rulesync/.aiignore`)
- Excludes: node_modules, dist, coverage, test artifacts
- Preserves: source code, tests, docs
- Prevents: Heavy/generated files from AI context

### 3. **Global Overview Rule** (`.rulesync/rules/overview.md`)
Contains:
- ✅ Project overview and tech stack
- ✅ Hard AI guardrails (no CLI execution, no config weakening, etc.)
- ✅ Documentation management rules (your 4 user-defined rules)
- ✅ Change workflow for AI agents
- ✅ Design system constraints
- ✅ Testing guidelines
- ✅ Project structure reference

### 4. **Journal Domain Rule** (`.rulesync/rules/journal-system.md`)
Contains:
- ✅ Journal system architecture
- ✅ Domain-specific guardrails
- ✅ Testing patterns and common pitfalls
- ✅ Integration points with Chart/AI systems
- ✅ Component structure and patterns

---

## 🎯 How to Use This Setup

### Step 1: Generate Tool-Specific Rules
Run this command to generate `CLAUDE.md`, `.cursorrules`, etc:
```bash
npx rulesync generate
```

**Expected output:**
```
✓ Generated: CLAUDE.md
✓ Generated: .cursorrules
✓ Generated: .github/copilot-instructions.md
✓ Generated: .clinerules/project.md
```

### Step 2: Verify Generated Files
```bash
ls -lh CLAUDE.md .cursorrules
```

Both files should now exist and contain consolidated rules from:
- `overview.md` (global rules)
- `journal-system.md` (domain-specific)

### Step 3: Test Your Setup
With Cursor or Claude Code, try asking:
- "What are the AI guardrails for this project?"
- "How should I add a new Journal feature?"
- "What's the testing strategy for E2E tests?"

The AI should now reference the rules and follow the guidelines.

---

## 🔄 Updating Rules

### To modify existing rules:
1. Edit files in `.rulesync/rules/`:
   - `overview.md` for global changes
   - `journal-system.md` for journal-specific changes
2. Run `npx rulesync generate` to update tool configs
3. Commit both the rule source AND generated outputs

### To add new domain rules:
1. Create `.rulesync/rules/new-domain.md`
2. Use YAML frontmatter to specify `targets` and `globs`
3. Run `npx rulesync generate`

Example:
```markdown
---
targets: ["*"]
description: "Market orchestrator domain rules"
globs:
  - "src/lib/data/marketOrchestrator.ts"
  - "src/lib/adapters/**/*.ts"
---

# Market Orchestrator Rules
...
```

---

## 🧪 Validation Checklist

Before committing, verify:

- [ ] `npx rulesync generate` runs without errors
- [ ] `CLAUDE.md` and `.cursorrules` are created
- [ ] File paths in `globs` match actual repo structure
- [ ] No broken links in documentation references
- [ ] TypeScript compiles: `pnpm typecheck`
- [ ] Linting passes: `pnpm lint`
- [ ] Tests pass: `pnpm test`

---

## 📦 Files Created (Summary)

```
├── rulesync.jsonc                       # Main config
├── .rulesync/
│   ├── .aiignore                        # Context exclusions
│   ├── HANDOVER.md                      # This file
│   └── rules/
│       ├── overview.md                  # Global guardrails
│       └── journal-system.md            # Journal domain

Generated (after running `npx rulesync generate`):
├── CLAUDE.md                            # Claude Code rules
├── .cursorrules                         # Cursor rules
├── .github/copilot-instructions.md      # Copilot rules
└── .clinerules/project.md               # Cline rules
```

---

## 🚨 Important Notes

### 1. **User-Defined Documentation Rules**
These are embedded in `overview.md` → "Documentation Management Rules":
1. No unnecessary `.md` files (only create when truly needed)
2. Root cleanliness (only `README.md` in root, rest in `/docs/`)
3. No duplicates (check `/docs/` before creating new files)
4. Track changes (document every change in `/docs/`)

**AI assistants will follow these rules automatically after generation.**

### 2. **Do NOT Edit Generated Files Directly**
- `CLAUDE.md`, `.cursorrules`, etc. are **outputs**
- Edit sources in `.rulesync/rules/` instead
- Re-run `npx rulesync generate` to update

### 3. **Version Control**
Commit both:
- ✅ `.rulesync/` (source rules)
- ✅ `CLAUDE.md`, `.cursorrules` (generated outputs)

This ensures team members and CI have consistent rules.

---

## 🎓 Next Steps

1. **Run generation**: `npx rulesync generate`
2. **Clean up repo**: Move root `.md` files to `/docs/` (see below)
3. **Test with AI**: Ask your assistant about project rules
4. **Expand rules**: Add domain rules for Market, CI, Design System as needed

---

## 🧹 Root Cleanup (To Do)

These files should move to `/docs/`:
```
./BUNDLE-OPTIMIZATION-PLAN.md         → docs/process/
./BUNDLE-OPTIMIZATION-RESULT.md       → docs/process/
./BUNDLE-SIZE-FINAL-SUMMARY.md        → docs/process/
./STYLING-UPDATES.md                  → docs/design/
./UX-IMPROVEMENTS-SUMMARY.md          → docs/design/
./UX-TEST-STATUS.md                   → docs/qa/
./sparkfined-style-guide.html         → docs/design/
```

Commands:
```bash
# Create target directories if needed
mkdir -p docs/process docs/design docs/qa

# Move files
git mv BUNDLE-OPTIMIZATION-PLAN.md docs/process/
git mv BUNDLE-OPTIMIZATION-RESULT.md docs/process/
git mv BUNDLE-SIZE-FINAL-SUMMARY.md docs/process/
git mv STYLING-UPDATES.md docs/design/
git mv UX-IMPROVEMENTS-SUMMARY.md docs/design/
git mv UX-TEST-STATUS.md docs/qa/
git mv sparkfined-style-guide.html docs/design/

# Update docs/index.md to reflect new locations
```

---

## 📞 Support

- **Rulesync docs**: https://github.com/dyoshikawa/rulesync
- **Issues**: Check `.rulesync/rules/` for syntax errors
- **Team questions**: Refer to this HANDOVER.md

---

**Setup completed**: 2025-12-03
**Next action**: Run `npx rulesync generate`
**Maintained by**: Sparkfined Team

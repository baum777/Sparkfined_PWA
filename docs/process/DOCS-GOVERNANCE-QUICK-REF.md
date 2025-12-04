# Documentation Governance - Quick Reference Card

**Purpose:** One-page cheat sheet for contributors  
**Last Updated:** 2025-12-04

---

## 🚨 Hard Rules (Never Break These)

### 1. Root-Level Documentation

✅ **ALLOWED in `/workspace/` root:**
- `README.md`
- `AGENTS.md`
- `CLAUDE.md`

❌ **FORBIDDEN:**
- Any other `.md` files in root
- No exceptions

### 2. 7×7 Rule in `/docs`

✅ **MUST obey:**
- Maximum 7 folders in `/docs`
- Maximum 7 files per folder

❌ **VIOLATIONS:**
- Creating 8th folder
- Adding 8th file to any folder
- Nesting folders >1 level (except in `core/`)

### 3. Archive, Don't Delete

✅ **CORRECT:**
```bash
mv docs/old-feature.md docs/07_archive/2025-12/old-feature.md
# Add header: > [ARCHIVED] Merged into: docs/02_concepts/new-feature.md
```

❌ **WRONG:**
```bash
rm docs/old-feature.md  # ← NEVER DO THIS
```

### 4. Always Update CHANGELOG

✅ **REQUIRED for every doc change:**
```markdown
## YYYY-MM-DD
### Added / Changed / Archived
- Describe what changed
### Context
- Explain why
```

❌ **FORBIDDEN:**
- Committing doc changes without updating `/docs/CHANGELOG.md`

---

## 📂 Target Folder Structure

```
/docs/
├── 01_architecture/    # System design, API landscape, PWA audit
├── 02_concepts/        # Domain concepts (Journal, Oracle, AI, Design)
├── 03_specs/           # Feature specs, bugs, tickets
├── 04_process/         # CI/CD, QA, workflows, governance
├── 05_guides/          # Setup, deployment, onboarding
├── 06_decisions/       # ADRs, lore, metrics, pitch deck
├── 07_archive/         # Historical docs (organized by date)
├── README.md           # Docs entrypoint
├── index.md            # Inventory of all docs
└── CHANGELOG.md        # Track all changes
```

---

## 🛠️ Workflow: Creating a New Document

### Step 1: Check Before Create

```bash
# Search for existing related docs
grep -r "keyword" docs/

# Or use file search
find docs/ -name "*keyword*.md"
```

**Question:** Can I extend an existing doc instead?

- ✅ YES → Update existing doc, add section
- ❌ NO → Proceed to Step 2

### Step 2: Find the Right Folder

| Content Type | Target Folder |
|--------------|---------------|
| Architecture diagrams, system design | `01_architecture/` |
| Domain concepts, business logic | `02_concepts/` |
| Feature specs, bug templates | `03_specs/` |
| Process docs, CI/CD, QA | `04_process/` |
| How-to guides, setup instructions | `05_guides/` |
| Design decisions, ADRs, lore | `06_decisions/` |
| Obsolete/merged docs | `07_archive/` |

### Step 3: Check File Count

```bash
# Count files in target folder
ls -1 docs/01_architecture/ | wc -l

# If result is 7 → STOP, cannot add more!
# Options:
# - Merge with existing file
# - Archive an old file first
# - Choose different folder
```

### Step 4: Create & Document

```bash
# Create the file
vim docs/02_concepts/new-feature.md

# Update CHANGELOG
vim docs/CHANGELOG.md
# Add entry with date, summary, reason

# Commit with proper message
git add docs/02_concepts/new-feature.md docs/CHANGELOG.md
git commit -m "[docs] Add new-feature concept

- What: Created new-feature.md in 02_concepts/
- Why: Document XYZ functionality for contributors
- Checked: Scanned concepts/ folder, no existing related doc
- Updated: CHANGELOG.md
"
```

---

## 🔄 Workflow: Updating an Existing Document

### Simple Updates (typos, small edits)

```bash
# Make changes
vim docs/02_concepts/journal-system.md

# Commit (no CHANGELOG needed for typos)
git commit -m "[docs] Fix typo in journal-system.md"
```

### Significant Updates (new sections, major rewrites)

```bash
# Make changes
vim docs/02_concepts/journal-system.md

# Update CHANGELOG
vim docs/CHANGELOG.md
# Add entry:
## 2025-12-04
### Changed
- Updated `journal-system.md` with new scoring rules
### Context
- Added section on XP calculation for AI-powered entries

# Commit
git commit -m "[docs] Update journal-system with XP rules

- What: Added XP calculation section
- Why: Clarify scoring for AI-powered journal entries
- Updated: CHANGELOG.md
"
```

---

## 📦 Workflow: Archiving a Document

### When to Archive

✅ **ARCHIVE when:**
- Document is obsolete (superseded by newer doc)
- Content was merged into another doc
- Feature was removed from codebase

❌ **DON'T ARCHIVE when:**
- Just needs updating (update it instead!)
- Temporarily not relevant (might be needed later)

### How to Archive

```bash
# 1. Create dated archive folder if needed
mkdir -p docs/07_archive/2025-12

# 2. Move file
mv docs/02_concepts/old-feature.md docs/07_archive/2025-12/old-feature.md

# 3. Add archive header to file
echo "> [ARCHIVED] This document was archived on 2025-12-04 because it was merged into: docs/02_concepts/new-feature.md" | cat - docs/07_archive/2025-12/old-feature.md > temp && mv temp docs/07_archive/2025-12/old-feature.md

# 4. Update CHANGELOG
vim docs/CHANGELOG.md
# Add entry:
## 2025-12-04
### Archived
- Moved `old-feature.md` to `07_archive/2025-12/`
### Context
- Content was merged into `new-feature.md`

# 5. Commit
git commit -m "[docs] Archive old-feature.md

- What: Moved old-feature.md to archive
- Why: Content merged into new-feature.md
- Updated: CHANGELOG.md
"
```

---

## 🚫 Common Mistakes & Fixes

### Mistake 1: Creating New Doc Without Scanning

❌ **Wrong:**
```bash
# Just create new file without checking
vim docs/02_concepts/trading-psychology.md
```

✅ **Right:**
```bash
# First, search for related docs
grep -r "psychology\|emotion\|behavior" docs/

# Found `journal-system.md` with emotion tracking section!
# Extend that file instead of creating new one
vim docs/02_concepts/journal-system.md
# Add "Trading Psychology" section
```

### Mistake 2: Hard-Deleting Old Docs

❌ **Wrong:**
```bash
git rm docs/old-api-design.md
```

✅ **Right:**
```bash
mv docs/old-api-design.md docs/07_archive/2025-12/old-api-design.md
# Add archive header, update CHANGELOG
```

### Mistake 3: Forgetting CHANGELOG

❌ **Wrong:**
```bash
git add docs/new-feature.md
git commit -m "Add new feature doc"
```

✅ **Right:**
```bash
# Update CHANGELOG first!
vim docs/CHANGELOG.md

git add docs/new-feature.md docs/CHANGELOG.md
git commit -m "[docs] Add new-feature doc

- What: Created new-feature.md
- Why: Document XYZ for contributors
- Updated: CHANGELOG.md
"
```

### Mistake 4: Exceeding 7×7 Limit

❌ **Wrong:**
```bash
# Folder already has 7 files, adding 8th
vim docs/02_concepts/eighth-file.md
```

✅ **Right (Option A - Merge):**
```bash
# Merge new content into existing file
vim docs/02_concepts/existing-file.md
# Add new section instead of new file
```

✅ **Right (Option B - Archive):**
```bash
# Archive an old file first
mv docs/02_concepts/old-file.md docs/07_archive/2025-12/old-file.md
# Now you have space for new file
vim docs/02_concepts/new-file.md
```

---

## 🎯 Quick Decision Tree

```
Need to document something?
│
├─ Is it conceptual/how-to/architectural?
│  ├─ YES → Proceed
│  └─ NO → Maybe it belongs in code comments?
│
├─ Does a related doc already exist?
│  ├─ YES → Extend that doc (don't create new)
│  └─ NO → Proceed
│
├─ Which folder does it belong in? (See table above)
│
├─ Does that folder already have 7 files?
│  ├─ YES → Merge with existing or archive old file first
│  └─ NO → Proceed
│
├─ Create the file
│
├─ Update CHANGELOG.md
│
└─ Commit with [docs] prefix
```

---

## 📋 Pre-Commit Checklist

Before committing doc changes, verify:

- [ ] File is in correct folder (01-07)
- [ ] Folder has ≤7 files
- [ ] Scanned for existing related docs (didn't create duplicate)
- [ ] Updated `/docs/CHANGELOG.md` (if significant change)
- [ ] Used `[docs]` prefix in commit message
- [ ] Commit message explains what/why/which-docs-checked

---

## 🆘 When in Doubt

### Ask yourself:

1. **Can I extend an existing doc instead of creating new?**
   - If YES → extend
   - If NO → proceed

2. **Is this truly documentation or just a note?**
   - Documentation → lives in `/docs`
   - Note → maybe belongs in issue/PR description

3. **Will this be useful in 6 months?**
   - If YES → document it
   - If NO → maybe it's not worth documenting

### Get help:

- Read full audit: `docs/process/DOCS-GOVERNANCE-AUDIT.md`
- Read German summary: `docs/process/DOCS-GOVERNANCE-FAZIT.md`
- Check CHANGELOG: `docs/CHANGELOG.md`
- Ask in Discord/team chat

---

## 🎓 Remember

> "The best documentation is the one you can actually find."

- **7×7 rule** keeps docs scannable
- **CHANGELOG** tracks evolution
- **Archive, don't delete** preserves history
- **Scan before create** avoids fragmentation

---

**Last Updated:** 2025-12-04  
**Maintained By:** Sparkfined Team  
**For Questions:** See `docs/process/DOCS-GOVERNANCE-SUMMARY.md`

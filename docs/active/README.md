# Active Documentation — Working Documents

**Purpose:** Current working documents, active plans, reports, and ongoing feature development.

**Last Updated:** 2025-11-25

---

## 📂 Structure

```
docs/active/
├── README.md (this file)
├── Working_Plan.md         — Active sprint plan & sections (from Sparkfined_Working_Plan.md)
├── Execution_Log.md        — Session-by-session execution log (from Sparkfined_Execution_Log.md)
├── Roadmap.md              — Product roadmap & improvement phases (from IMPROVEMENT_ROADMAP.md)
├── Risk_Register.md        — Risk tracking & mitigation (from RISK_REGISTER.md)
├── features/               — Active feature specifications & development
│   ├── next-up.md
│   ├── production-ready.md
│   └── advanced-insight-backend-wiring.md
├── migrations/             — Ongoing migrations & consolidations
│   └── serverless-consolidation.md
├── reports/                — Current status reports & error tracking
│   └── ui-errors.md
└── audits/                 — Active audit reports & analysis
    └── markdown-categorization.md
```

---

## 📋 Key Documents

### Working Documents

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `Working_Plan.md` | Active sprint plan, section-by-section progress | Daily |
| `Execution_Log.md` | Session log (Codex, Claude, all agents) | Per session |
| `Roadmap.md` | Product roadmap (R0, R1, R2 phases) | Weekly |
| `Risk_Register.md` | Risk tracking & mitigation strategies | Weekly |

### Features

**Active feature development specs:**
- `next-up.md` — Upcoming features (F-02 to F-07)
- `production-ready.md` — Production readiness checklist
- `advanced-insight-backend-wiring.md` — Advanced Insight implementation

### Migrations

**Ongoing technical migrations:**
- `serverless-consolidation.md` — Serverless API consolidation plan

### Reports

**Current status reports:**
- `ui-errors.md` — UI/UX error tracking & fixes (23 errors cataloged)

### Audits

**Active audit reports:**
- `markdown-categorization.md` — Markdown documentation audit & categorization

---

## 🔄 Lifecycle Management

### When to Add Documents

**Add to `docs/active/` when:**
- Creating a new sprint plan or working document
- Starting a new feature implementation
- Beginning a technical migration
- Generating a new audit or report

### When to Archive

**Move to `docs/archive/` when:**
- Sprint/section is completed → `docs/archive/cleanup/`
- Feature is shipped → `docs/archive/features/`
- Migration is completed → `docs/archive/deprecated/`
- Report is older than 6 months → `docs/archive/audits/`

**Automated archiving script:**
```bash
# Archive a completed document
./scripts/archive-doc.sh docs/active/old-plan.md cleanup
```

---

## 📊 Current Status (as of 2025-11-25)

### Active Sprint
**S0 — Foundation Cleanup** (2025-11-12 → 2025-11-26)
- See: `Working_Plan.md` Section 7 (Grok Pulse Engine)

### Active Features
- F-02: Market Analyze (High Priority)
- F-04: Journal Workspace (High Priority)
- F-05: Signal Matrix (Medium Priority)

### Active Migrations
- Serverless API Consolidation (In Progress)

### Recent Reports
- UI Error Report (2025-11-21) — 23 errors identified
- Markdown Categorization Audit (2025-11-25) — 150+ files categorized

---

## 🔗 Related Documentation

- [Core Documentation](../core/README.md) — Stable reference docs
- [Archive](../archive/README.md) — Historical documentation
- [Agent Files](../../AGENT_FILES/README.md) — AI tool configurations

---

**Note:** This directory was created during the 2025-11-25 documentation restructuring to separate active working documents from stable reference documentation.

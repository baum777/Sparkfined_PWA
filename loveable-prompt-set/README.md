# Loveable Prompt Set — Token-Efficient 1-Prompt-Per-Tab

**Generated**: 2025-12-26  
**Source**: `./loveable-finishing/**`  
**Format**: Consolidated V0/V1/V2 prompts into single atomic prompts per tab

---

## Primary Tabs

| Tab | File | Route | Description |
|-----|------|-------|-------------|
| **Alerts** | [alerts.md](./alerts.md) | `/alerts` | Alert creation, filtering, templates with actionable empty states |
| **Dashboard** | [dashboard.md](./dashboard.md) | `/dashboard` | KPI overview, insights, alerts snapshot with Hero's Journey guidance |
| **Journal** | [journal.md](./journal.md) | `/journal` | Trading journal with required-field UX, templates, AI notes transparency |
| **Chart** | [chart.md](./chart.md) | `/chart` | Chart analysis workspace with tools guidance and adaptive cues |
| **Watchlist** | [watchlist.md](./watchlist.md) | `/watchlist` | Asset tracking with trend indicators and URL persistence |
| **Settings** | [settings.md](./settings.md) | `/settings` | Configuration with setup completeness tracking and safe destructive actions |

## Secondary Tabs

| Tab | File | Route | Description |
|-----|------|-------|-------------|
| **Signals** | [signals.md](./signals.md) | `/signals` | Signal review with visible feedback and chart integration |
| **Oracle** | [oracle.md](./oracle.md) | `/oracle` | Daily insights with calm reward messaging and takeaways |
| **Replay** | [replay.md](./replay.md) | `/replay` | Chart replay with accessible controls and progress tracking |
| **Lessons** | [lessons.md](./lessons.md) | `/lessons` | Learning library with unlock paths and drill actions |
| **Showcase** | [showcase.md](./showcase.md) | `/icons`, `/styles`, `/ux` | Dev-only UI showcase with consistent layout |

---

## Usage Instructions

### For Loveable (or any no-code/AI builder)

1. **One tab at a time**: Open the relevant `.md` file for the tab you're working on
2. **Use the Allowed paths section**: These are the ONLY files you should modify
3. **Follow the Do section**: These are the approved changes to implement
4. **Respect the Guardrails**: Critical constraints that prevent breakage
5. **Check the Done when section**: Acceptance criteria for completion
6. **Output format**: List touched files + short change summary only

### Key Principles

- **Conversion-first**: Every change should guide users toward successful task completion
- **Minimal diff**: Only change what's needed for the polish improvements
- **Stable selectors**: Never rename/remove `data-testid` attributes used by E2E tests
- **No scope creep**: Avoid refactors, new dependencies, or config changes
- **Token-efficient**: Prompts are concise (150-300 words) with no duplication

---

## Template Structure

Each prompt follows this format:

```markdown
---
TAB: <Tab Name>
Allowed paths (strict):
- <path1>
- <path2>

Goal (conversion first):
- <one sentence>

Do:
1) IF you find instability/a11y gaps blocking polish: apply minimal stabilization only where needed.
2) Apply these approved polish changes (minimal diff):
   - <bullet1>
   - <bullet2>

Guardrails:
- Keep data-testid stable (never rename/remove).
- No unrelated refactors, no new deps, no config changes unless explicitly required.

Done when:
- <acceptance bullet 1>
- <acceptance bullet 2>

Output:
- Touched files list + short change summary (no long explanation).
---
```

See [_template.md](./_template.md) for the full template.

---

## Source Materials

- **Cluster Map**: `./loveable-finishing/00-cluster-map/README.md`
- **Original Prompts**: `./loveable-finishing/10-tabs/tabs/*/02-loveable-prompts.md`
- **Polish Suggestions**: `./loveable-finishing/10-tabs/tabs/*/01-polish-suggestions.md`
- **Current UI Analysis**: `./loveable-finishing/10-tabs/tabs/*/00-current-ui.md`

---

## Notes

1. **Consolidated Format**: Each `.md` file combines V0 (stabilization), V1 (polish), and V2 (micro-upgrade) into a single atomic prompt
2. **No Tests in Allowed Paths**: Test files are only included where explicitly mentioned in source prompts (e.g., Settings export E2E)
3. **Path Validation**: All paths are verified against the cluster map and original source prompts
4. **Global Rules**: Repeated across all prompts: stable `data-testid`, no new timers/polling, no config weakening, minimal diff
5. **Hero's Journey Integration**: Most tabs include "degen → mastery" progression cues where appropriate

---

**Maintained by**: Sparkfined Team  
**Last updated**: 2025-12-26

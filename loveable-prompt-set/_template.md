---
TAB: <Tab Name>
Allowed paths (strict):
- <path1>
- <path2>
- <path3>

Goal (conversion first):
<One sentence describing the primary user-facing outcome and conversion goal>

Do:
1) IF you find instability/a11y gaps blocking polish: apply minimal stabilization only where needed.
2) Apply these approved polish changes (minimal diff):
   - <Specific change 1 with clear acceptance criteria>
   - <Specific change 2 with clear acceptance criteria>
   - <Specific change 3 with clear acceptance criteria>
   - <Specific change 4 with clear acceptance criteria (optional)>
   - <Specific change 5 with clear acceptance criteria (optional)>
   - <Specific change 6 with clear acceptance criteria (optional)>

Guardrails:
- Keep data-testid stable (never rename/remove): <list critical selectors if applicable>
- No unrelated refactors, no new deps, no config changes unless explicitly required.
- <Tab-specific guardrail 1 (e.g., no URL loops, no new timers, no global styling)>
- <Tab-specific guardrail 2 (e.g., preserve existing behavior, no new network calls)>

Done when:
- <Acceptance criterion 1 — user-facing outcome>
- <Acceptance criterion 2 — technical constraint satisfied>
- <Acceptance criterion 3 — test/E2E validation passes>
- <Acceptance criterion 4 (optional)>

Output:
- Touched files list + short change summary (no long explanation).
---

## Template Usage Guidelines

### Allowed paths (strict)
- **MUST** be minimal and explicit
- Only include files that will be directly modified
- Use glob patterns (`*`) only when all files in directory may be touched
- Include test files ONLY if they need selector updates (prefer not to)

### Goal (conversion first)
- Single sentence, max 25 words
- Focus on user outcome, not technical implementation
- Should answer: "What does the user get from these changes?"

### Do section
- **Step 1**: Always identical — minimal stabilization if needed
- **Step 2**: List 3-6 specific approved changes
- Each bullet should be:
  - Actionable (clear what to implement)
  - Measurable (clear when it's done)
  - Minimal (smallest possible change for the outcome)

### Guardrails
- **First line**: Always include `data-testid` stability rule
- **Second line**: Always include "no unrelated refactors" rule
- **Next 1-3 lines**: Tab-specific constraints (e.g., no URL loops, no new timers)
- Keep under 4 lines total

### Done when
- List 2-4 acceptance criteria
- Mix user-facing outcomes with technical validations
- Should be verifiable (not subjective like "looks good")

### Output
- Always identical — this reminds the AI to be concise

---

## Design Principles

1. **Token efficiency**: Aim for 150-300 words per prompt
2. **No duplication**: Global rules stated once, not repeated in every bullet
3. **Atomic changes**: Each prompt is self-contained and implementable
4. **Conversion-focused**: Every change should reduce friction or increase clarity
5. **Test-friendly**: Preserve existing selectors and E2E flows

---

## Examples of Good vs. Bad Bullets

### ❌ Bad (vague, too broad)
- "Improve the empty state experience"
- "Make filters better"
- "Polish the UI"

### ✅ Good (specific, measurable)
- "Replace text-only empty state with actionable CTA: 'Create alert' (primary), 'Go to Chart' (secondary)"
- "Add visible active-filter chips + one-click 'Clear' + subtle results count"
- "Add compact 'degen → mastery' progress cue near sticky action bar (Step 1/3: State → Thesis → Review)"

---

**Template Version**: 1.0  
**Compatible with**: Loveable, Claude, Cursor Agent, any LLM-based code generator

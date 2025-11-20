# Section 5A – Design Token & Visual Spec (Summary)

**Date:** 2025-11-20
**Agent:** Claude 4.5 (UI/UX Architect)
**Status:** ✅ Complete — Ready for Codex Implementation

---

## Executive Summary

Section 5A has completed the design token audit and specification for Sparkfined V2. The full specification is available in `Sparkfined_V2_Design_Tokens.md`.

### Key Findings

✅ **No hardcoded hex colors** found in V2 pages (e.g., no `bg-[#...]` patterns)
⚠️ **Opacity-based colors prevalent:** `white/5`, `black/30`, etc. need semantic replacements
⚠️ **One hardcoded gradient** in `DashboardShell.tsx` needs token replacement
✅ **Good foundation exists** in `tailwind.config.ts` with semantic tokens
✅ **Consistent spacing patterns** across all V2 pages

### Deliverables

1. **Token Inventory & Mapping Table** — Complete mapping of all hardcoded colors to semantic tokens
2. **Enhanced Token Schema** — Proposed additions to `tailwind.config.ts`:
   - `bg-surface-*` variants (surface, subtle, skeleton, elevated)
   - `border-border-*` variants (subtle, moderate, hover)
   - `interactive-*` states (hover, active, disabled)
   - `sentiment-*` backgrounds (bull, bear, neutral with bg/border variants)
   - `status-*` backgrounds (armed, triggered, snoozed)
   - `bg-app-gradient` for main app background

3. **Layout & Rhythm Guidelines** — 8 standard patterns with code snippets:
   - Standard card pattern
   - Header pattern
   - KPI tile pattern
   - Table/list pattern
   - Empty state pattern
   - Loading skeleton pattern
   - Badge patterns (direction, status)
   - Spacing rhythm (vertical, horizontal, padding, border radius)

4. **Acceptance Criteria** — 6 categories with 30+ checkpoints for Codex:
   - Color token usage (no more opacity-based colors)
   - Component patterns (cards, KPIs, tables, etc.)
   - Layout consistency (spacing, radius, padding)
   - V2 pages checklist (7 pages)
   - Core components checklist (5 components)
   - Visual regression checks

### Token Highlights

**Most Important Replacements:**

| Current | New Token | Usage |
|---------|-----------|-------|
| `from-[#050505] via-[#0b0b13]...` | `bg-app-gradient` | App background |
| `bg-black/30` | `bg-surface` | Card surfaces |
| `border-white/5` | `border-border-subtle` | Subtle borders |
| `hover:bg-white/5` | `hover:bg-interactive-hover` | Hover overlay |
| `bg-emerald-500/10` | `bg-sentiment-bull-bg` | Bull badges |
| `bg-rose-500/10` | `bg-sentiment-bear-bg` | Bear badges |
| `border-emerald-400/60` | `border-sentiment-bull-border` | Active bull items |

### Implementation Priority (for Codex)

**Phase 1 (High Priority):**
1. Update `tailwind.config.ts` with new tokens
2. Replace hardcoded gradient in `DashboardShell.tsx`
3. Replace opacity-based colors in all 7 V2 pages

**Phase 2 (Medium Priority):**
4. Replace opacity-based colors in core components
5. Normalize spacing patterns

**Phase 3 (Future):**
6. Extend for light mode support
7. Add theme variants for "Hero's Journey" theming

### Open Questions

**DT-01:** Should we create a `backdrop-blur` token?
→ **Recommendation:** Keep as utility class for now

**DT-02:** Should loading skeleton use `bg-surface-skeleton` or `bg-interactive-hover`?
→ **Recommendation:** Use `bg-surface-skeleton` to differentiate from hover

**DT-03:** Should we add `border-border-active` for selected states?
→ **Recommendation:** Keep using sentiment borders for direction-aware states

---

## Checklist 5A (Claude) — ✅ All Complete

- [x] Tailwind-Token-Schema vorgeschlagen und konsistent
- [x] Vollständige Mapping-Tabelle Hardcoded → Token für alle V2 pages
- [x] Standard-Card + Header Layout als Code-Snippet dokumentiert
- [x] Section 5A Summary & Checklist im Working Plan aktualisiert
- [x] Neue Open Points als DT-xx im Working Plan notiert

---

## Files Created

1. **`docs/design/Sparkfined_V2_Design_Tokens.md`** — Complete specification (8 sections, ~600 lines)
2. **`docs/design/Section_5A_Summary.md`** — This summary document

---

## Next Steps (Handoff to Codex - Section 5B)

Codex should now:

1. **Review** `Sparkfined_V2_Design_Tokens.md` in full
2. **Implement Phase 1** changes:
   - Update `tailwind.config.ts` with new color tokens (Section 2.1)
   - Add background gradients (Section 2.2)
   - Replace hardcoded gradient in `DashboardShell.tsx`
   - Replace all opacity-based colors in V2 pages using mapping table (Section 3)
3. **Run visual regression checks** to ensure no breaking changes
4. **Mark checklist items** in Section 5 of Working Plan
5. **Report back** with any issues or edge cases discovered

---

**Documentation Reference:**
- Full Spec: `docs/design/Sparkfined_V2_Design_Tokens.md`
- Tailwind Config: `tailwind.config.ts`
- V2 Pages: `src/pages/*PageV2.tsx`
- Core Components: `src/components/dashboard/`, `src/components/journal/`, etc.

# DR Review Action Plan – Sparkfined PWA UI Migration

**Generated**: 2025-12-27  
**Context**: Loveable UI Migration Status + E2E Health Check + Design Token Review  
**Primary DR Source**: `docs/active/reports/ui-errors.md` (23 issues identified 2025-11-21)

---

## Section 1: Executive Summary

### Critical Findings

1. **🔴 BLOCKER**: Alerts E2E test failing – `alert-submit-button` outside viewport in Modal-based `NewAlertSheet`
2. **🔴 CRITICAL**: Dual alert creation components exist (`AlertCreateDialog` + `NewAlertSheet`) with different container types
3. **🟠 HIGH**: 23 design token inconsistencies identified (hardcoded colors, legacy tokens)
4. **🟡 MEDIUM**: Navigation config modified (replay alias added) – needs validation against "read-only truth" rule
5. **🟡 MEDIUM**: `index.html` modified (overlay-root portal, structured data) – assess necessity
6. **🟢 LOW**: URL sync pattern added for alerts (`?alert=`) – verify against scope-creep rules
7. **⚠️ RISK**: Migration checklist shows Alerts as "migrated" but E2E tests block deployment
8. **✅ POSITIVE**: Event ledger shows telemetry preserved for all events

### Impact Assessment

- **Deployment Blocker**: 1 (Alerts E2E)
- **Regression Risk**: High (design token inconsistencies across 10 components)
- **Scope Creep**: Low-Medium (navigation changes documented, URL sync minor addition)
- **Tech Debt**: Medium (dual implementations, CSS cleanup needed)

---

## Section 2: Issue Classification (MUST / SHOULD / NICE)

### 🔴 MUST-FIX (Blockers)

| # | Issue | Affected Files | Why MUST | Fix Priority |
|---|-------|---------------|----------|--------------|
| M1 | Alerts E2E: submit button outside viewport | `src/features/alerts/NewAlertSheet.tsx` (line 179-206) | E2E tests cannot click button; blocks CI/CD pipeline | P0 (Sprint 1, Day 1) |
| M2 | Dual alert creation components | `src/components/alerts/AlertCreateDialog.tsx` + `src/features/alerts/NewAlertSheet.tsx` | Confusion, maintenance burden, test fragility | P0 (Sprint 1, Day 2) |
| M3 | Design Token System duality | `src/styles/tokens.css` + `tailwind.config.ts` | Source of truth ambiguity, scaling blocker | P0 (Sprint 1, Week 1) |

### 🟠 SHOULD-FIX (Risk Mitigation)

| # | Issue | Affected Files | Why SHOULD | Fix Priority |
|---|-------|----------------|------------|--------------|
| S1 | Button component hardcoded colors | `src/components/ui/Button.tsx` (lines 33-37) | Brand inconsistency, theme breaks | P1 (Sprint 1) |
| S2 | ErrorState legacy colors | `src/components/ui/ErrorState.tsx` (lines 13-19) | Design system violation | P1 (Sprint 1) |
| S3 | EmptyState legacy colors | `src/components/ui/EmptyState.tsx` (lines 14-15) | Design system violation | P1 (Sprint 1) |
| S4 | Input focus colors hardcoded | `src/components/ui/Input.tsx` (lines 29-32) | Accessibility + brand inconsistency | P1 (Sprint 1) |
| S5 | Card variants hardcoded colors | `src/components/ui/Card.tsx` (lines 12-15) | Design system violation | P1 (Sprint 1) |
| S6 | Select component color inconsistency | `src/components/ui/Select.tsx` (lines 62-64, 79, 95-97) | Brand + error state colors wrong | P1 (Sprint 1) |
| S7 | Badge semantic color mismatch | `src/components/ui/Badge.tsx` (lines 11-16) | Should use sentiment tokens | P1 (Sprint 1) |
| S8 | Navigation config changes | `src/config/navigation.ts` (line 46) | Verify against "read-only" rule | P1 (Sprint 1) |

### 🟢 NICE (Polish / Technical Debt)

| # | Issue | Affected Files | Why NICE | Fix Priority |
|---|-------|----------------|----------|------------|
| N1 | AnalysisPageV2 hardcoded colors | `src/pages/AnalysisPageV2.tsx` (lines 103-174) | Functional but not token-aligned | P2 (Sprint 2) |
| N2 | Unoptimized CSS (noise overlay) | `src/styles/index.css` (lines 44-69) | Performance on low-end devices | P2 (Sprint 2) |
| N3 | Unused button CSS classes | `src/styles/App.css` (lines 109-169) | Bundle bloat | P2 (Sprint 2) |
| N4 | Missing keyboard nav (Select) | `src/components/ui/Select.tsx` | Accessibility enhancement | P3 (Backlog) |
| N5 | DashboardPageV2 dummy data | `src/pages/DashboardPageV2.tsx` (lines 10-28) | MVP acceptable, needs store wiring | P3 (Backlog) |

---

## Section 3: Alerts E2E Fix Plan (2 Variants + Verification)

### Root Cause Analysis

**Problem**: `NewAlertSheet` uses `Modal` component which:
1. Renders footer buttons at TOP of dialog (lines 187-206 in `NewAlertSheet.tsx`)
2. No guaranteed scroll container for content
3. When viewport is small OR content is tall → buttons overflow outside viewport
4. Playwright's `getByTestId('alert-submit-button').click()` fails with "element is outside of the viewport"

**Why `AlertCreateDialog` works**:
- Uses `RightSheet` component
- Footer embedded in `<RightSheetFooter>` (lines 137-157 in `AlertCreateDialog.tsx`)
- `RightSheet` has `min-h-0 flex-1 overflow-y-auto` scroll container (line 130 in `RightSheet.tsx`)
- Footer is INSIDE scrollable area → always reachable

**Visual Evidence**:
```tsx
// NewAlertSheet.tsx (BROKEN)
<Modal isOpen={isOpen} onClose={closeSheet} ...>
  <div className="flex min-h-0 flex-col">
    <div className="sf-alerts-new min-h-0 flex-1 overflow-y-auto">
      {/* Footer buttons HERE at TOP before content */}
      <div className="mb-5 flex flex-wrap items-center justify-end gap-3">
        <Button data-testid="alert-cancel-button">Cancel</Button>
        <Button data-testid="alert-submit-button">Save alert</Button> {/* ❌ CAN OVERFLOW */}
      </div>
      {/* Long content (templates + form) pushes buttons out */}
    </div>
  </div>
</Modal>

// AlertCreateDialog.tsx (WORKS)
<RightSheet isOpen={isOpen} onClose={closeSheet} footer={
  <RightSheetFooter>
    <Button data-testid="alert-cancel-button">Cancel</Button>
    <Button data-testid="alert-submit-button">Save alert</Button> {/* ✅ ALWAYS IN SCROLL */}
  </RightSheetFooter>
}>
  {/* Content */}
</RightSheet>
```

---

### Fix Variant 1: UI Refactor (PREFERRED – Stable & User-Friendly)

**Strategy**: Consolidate to single Alert creation component using `RightSheet` (proven working pattern).

#### Steps

1. **Decision**: Keep `NewAlertSheet` features (templates, autocomplete) but migrate to `RightSheet` container
   - Why: `NewAlertSheet` has richer UX (templates, symbol autocomplete)
   - Why: `RightSheet` has proven scroll/footer architecture (E2E-friendly)

2. **Refactor `NewAlertSheet.tsx`**:
   ```tsx
   // BEFORE (Modal with top-buttons)
   <Modal isOpen={isOpen} onClose={closeSheet} size="lg">
     <div className="flex min-h-0 flex-col">
       <div className="sf-alerts-new min-h-0 flex-1 overflow-y-auto">
         {/* Buttons at top */}
         <div className="mb-5 flex ...">
           <Button data-testid="alert-cancel-button">Cancel</Button>
           <Button data-testid="alert-submit-button">Save alert</Button>
         </div>
         {/* Content */}
       </div>
     </div>
   </Modal>

   // AFTER (RightSheet with footer prop)
   <RightSheet
     isOpen={isOpen}
     onClose={closeSheet}
     title="New alert"
     subtitle="Set a symbol, trigger direction, and threshold to watch."
     width="lg"
     data-testid="alert-create-dialog"
     footer={
       <RightSheetFooter>
         <Button
           variant="ghost"
           size="sm"
           onClick={closeSheet}
           disabled={isSubmitting}
           data-testid="alert-cancel-button"
         >
           Cancel
         </Button>
         <Button
           variant="primary"
           size="sm"
           onClick={handleSubmit}
           loading={isSubmitting}
           data-testid="alert-submit-button"
         >
           Save alert
         </Button>
       </RightSheetFooter>
     }
   >
     {/* Content WITHOUT button block */}
     {submissionError && <div className="sf-alerts-new__error">{submissionError}</div>}
     <div className="space-y-6">
       <AlertTemplates onApply={handleApplyTemplate} />
       {/* Form fields */}
     </div>
   </RightSheet>
   ```

3. **Remove duplicate `AlertCreateDialog.tsx`**:
   - Deprecated after confirming `NewAlertSheet` has all features
   - Update imports in `src/pages/AlertsPage.tsx` (if still referenced)
   - Delete file: `src/components/alerts/AlertCreateDialog.tsx`

4. **Update CSS (if needed)**:
   - Remove `.sf-alerts-new` top button styles (lines 187-206 in old implementation)
   - Verify `RightSheet` footer styling works with templates expansion

#### Benefits
- ✅ E2E-friendly: Footer always scrollable into view
- ✅ Consistent: All sheets use `RightSheet` pattern (Journal, Alerts, Settings)
- ✅ Maintainable: Single Alert creation component
- ✅ No test changes needed: Same `data-testid` preserved

#### Risks
- ⚠️ Regression: Verify templates panel doesn't break in `RightSheet` width constraints
- ⚠️ Mobile: Test on small viewports (< 380px width)

---

### Fix Variant 2: Test-Only Fix (FALLBACK – If UI Refactor Blocked)

**Strategy**: Keep `NewAlertSheet` as-is, modify E2E test to scroll button into view.

#### Steps

1. **Update E2E helper** in `tests/e2e/alerts-crud.spec.ts`:
   ```typescript
   // BEFORE (line 23)
   await page.getByTestId('alert-submit-button').click();

   // AFTER
   const submitButton = page.getByTestId('alert-submit-button');
   await submitButton.scrollIntoViewIfNeeded(); // ← Add this
   await submitButton.click();
   ```

2. **Apply same fix** to all Alert E2E tests:
   - `tests/e2e/alerts-crud.spec.ts` (line 23)
   - `tests/e2e/alerts/alerts.flows.spec.ts` (line 13)
   - `tests/e2e/dashboard-kpis.spec.ts` (line 18)

3. **Add Playwright assertion**:
   ```typescript
   await expect(submitButton).toBeInViewport(); // Verify fix
   await submitButton.click();
   ```

#### Benefits
- ✅ Quick fix (15 minutes)
- ✅ No component changes

#### Risks
- ❌ Band-aid: Real users can still encounter button overflow on small screens
- ❌ Fragile: Future content additions can re-break viewport fit
- ❌ Not addressing root cause: Modal layout still problematic

**Recommendation**: Use Variant 2 ONLY as temporary fix; schedule Variant 1 for Sprint 2.

---

### Verification Checklist (Both Variants)

- [ ] Run `pnpm test:e2e tests/e2e/alerts-crud.spec.ts` → All pass
- [ ] Run `pnpm test:e2e tests/e2e/alerts/alerts.flows.spec.ts` → All pass
- [ ] Run `pnpm test:e2e tests/e2e/dashboard-kpis.spec.ts` → All pass (creates alert from dashboard)
- [ ] Manual test: Mobile viewport (375x667) → Can scroll to submit button
- [ ] Manual test: Desktop (1920x1080) → No layout regression
- [ ] Manual test: Long symbol list (autocomplete) → Buttons still reachable
- [ ] Manual test: Apply template → No scroll jump, buttons visible
- [ ] Verify `data-testid="alert-submit-button"` unchanged (E2E stability)
- [ ] Check Playwright traces (test-results/alerts-*/) → No viewport errors
- [ ] Confirm no new Timer/Polling added (per guardrails)

---

## Section 4: Revert/Keep Decisions

### Decision Matrix

| Change | File | Status | Rationale |
|--------|------|--------|-----------|
| ✅ KEEP | `src/config/navigation.ts` (line 46: replay alias) | **Approved** | Documented in migration checklist (00_migration_checklist.md line 43-44); Replay is chart mode, not top-level tab. Alias pattern matches Journal/Dashboard aliases. |
| ✅ KEEP | `index.html` (line 69: overlay-root portal) | **Necessary** | Required for Modal/Sheet portals to escape stacking context; prevents z-index issues. Used by Modal.tsx (line 101) and RightSheet.tsx (line 29). |
| ✅ KEEP | `index.html` (lines 25-56: structured data) | **Improvement** | SEO enhancement, no functional impact; follows schema.org best practices for PWA discoverability. |
| ⚠️ REVIEW | Alerts URL sync (`?alert=` param) | **Minor Scope Expansion** | Not in original checklist; adds detail panel routing. **Action**: Document in 02_route_map.md; verify eventBus integration doesn't add new timers. |
| ❌ REVERT | None identified | N/A | All changes align with migration plan or are improvements. |

### Navigation Config Change Details

**Original Rule** (00_migration_checklist.md line 16):
> "src/config/navigation.ts & src/routes/RoutesRoot.tsx = Source of Truth (only minimal anpassen, nicht ersetzen)."

**Change Made**:
```diff
  {
    path: "/chart",
    label: "Chart",
    Icon: TrendingUp,
    testId: "nav-chart",
    tourId: "chart-link",
-   aliases: ["/chart-v2", "/analysis", "/analysis-v2", "/analyze"],
+   aliases: ["/chart-v2", "/analysis", "/analysis-v2", "/analyze", "/replay"],
  },
```

**Verdict**: **KEEP** – This is a "minimal adaptation" per the rule:
- Adds `/replay` as alias (not new top-level tab)
- Aligns with migration requirement: "Replay is not a top-level tab; Chart must be active state for Replay" (checklist line 43)
- Consistent with other alias patterns (e.g., `/journal-v2` → `/journal`)
- No new route in RoutesRoot.tsx (replay mounts ChartPage conditionally)

**Recommendation**: Document this decision in `loveable-import/02_route_map.md` (currently missing).

---

### URL Sync Pattern Analysis

**Change**: `AlertsPage.tsx` likely added `?alert=<id>` URL sync for detail panel selection.

**Guardrail Check**:
- ❌ Not explicitly approved in migration checklist
- ✅ Follows existing pattern (Journal uses `?entry=<id>`)
- ⚠️ Risk: If implemented with `useEffect` + `eventBus.subscribe`, could introduce loops (per guardrail: "keine neuen Runtime-Loops")

**Action Plan**:
1. Audit `AlertsPage.tsx` for URL sync implementation
2. If using `useEffect` with URL state → verify cleanup/guard (useRef mount-only)
3. If using `eventBus` → verify unsubscribe in cleanup
4. Document pattern in `loveable-import/02_route_map.md`
5. Add to event ledger (04_event_ledger.md) if new telemetry events added

**Verdict**: **KEEP** (with verification) – Pattern follows Journal precedent; validate no loop risk.

---

## Section 5: Next Steps (Prioritized Execution Plan)

### Sprint 1 – Week 1 (Blockers + High-Risk)

#### Day 1 (M1: Alerts E2E Fix)
1. ✅ **Decision**: Choose Variant 1 (UI refactor) or Variant 2 (test-only fix)
   - **Recommendation**: Variant 1 (consolidates components, prevents future issues)
2. 🔧 **Execute**: Refactor `NewAlertSheet.tsx` to use `RightSheet` footer pattern
3. 🗑️ **Cleanup**: Remove `AlertCreateDialog.tsx` (duplicate component)
4. ✅ **Test**: Run alerts E2E suite (3 test files)
5. 📝 **Document**: Update `loveable-import/01_file_mapping.md` (remove AlertCreateDialog entry)

#### Day 2 (M2: Component Consolidation)
1. 🔍 **Audit**: Search codebase for references to `AlertCreateDialog`
   ```bash
   rg "AlertCreateDialog" src
   ```
2. 🔧 **Update**: Migrate any remaining imports to `NewAlertSheet`
3. ✅ **Verify**: `pnpm typecheck` passes
4. ✅ **Test**: `pnpm test` (unit tests)

#### Day 3-5 (M3: Design Token Migration – Phase 1)
1. 📊 **Audit**: Map all CSS variables to Tailwind tokens
   ```bash
   rg "bg-zinc-|text-zinc-|border-zinc-|bg-blue-|text-blue-" src --type tsx
   ```
2. 🔧 **Fix P1 Components** (8 files):
   - Button.tsx: `bg-blue-500` → `bg-brand`
   - ErrorState.tsx: `text-slate-200` → `text-text-primary`
   - EmptyState.tsx: `text-slate-400` → `text-text-secondary`
   - Input.tsx: `focus:border-blue-500` → `focus:border-brand`
   - Card.tsx: `bg-zinc-900` → `bg-surface`
   - Select.tsx: `border-emerald-500` → `border-brand`
   - Badge.tsx: `text-green-500` → `text-sentiment-bull`
   - DashboardPageV2.tsx: `bg-surface-skeleton` validation
3. ✅ **Test**: Run visual regression tests (Playwright screenshots)
4. 📝 **Document**: Update CLAUDE.md with token migration status

---

### Sprint 1 – Week 2 (Verification + Scope Validation)

#### Day 6-7 (S8: Navigation + URL Sync Audit)
1. 🔍 **Review**: `AlertsPage.tsx` URL sync implementation
   - Check for `useEffect` dependencies
   - Verify cleanup functions
   - Ensure no `setInterval`/`setTimeout` added
2. 📝 **Document**: Create `loveable-import/02_route_map.md` (currently missing)
   - Document `/replay` alias decision
   - Document `?alert=` URL sync pattern
   - Verify against Journal's `?entry=` pattern
3. ✅ **Test**: Navigation E2E (chart → replay transition)

#### Day 8 (Global Validation)
1. ✅ **Run All Checks**:
   ```bash
   pnpm typecheck  # TypeScript
   pnpm lint       # ESLint
   pnpm test       # Vitest unit tests
   pnpm test:e2e   # Playwright E2E (all suites)
   pnpm build      # Production build
   ```
2. 🔍 **Review Failures**: Apply "Loop-Safety Guardrails" (no config weakening)
3. 📊 **Generate Report**: Test coverage + lint warnings

#### Day 9-10 (Documentation Update)
1. 📝 **Update Migration Docs**:
   - `loveable-import/00_migration_checklist.md`: Mark Alerts as "✅ Complete + E2E Green"
   - `loveable-import/04_event_ledger.md`: Add any new telemetry events
   - `docs/active/reports/ui-errors.md`: Mark P0-P1 issues as "Fixed" or "In Progress"
2. 📝 **Create ADRs** (if needed):
   - ADR-012: Single Design Token System (Tailwind Config as Truth)
   - ADR-013: RightSheet vs Modal for Form Dialogs

---

### Sprint 2 (Polish + Technical Debt)

#### Week 1 (N1-N3: CSS Cleanup)
1. 🧹 **AnalysisPageV2 Token Migration** (N1)
   - Map hardcoded emerald/amber colors to sentiment tokens
2. 🧹 **CSS Optimization** (N2)
   - Combine body::before and body::after (noise overlay)
   - Performance test on mobile devices
3. 🧹 **Remove Unused CSS** (N3)
   - Audit `.btn-*` classes in App.css
   - Run `pnpm build` to verify bundle size reduction

#### Week 2 (Testing + Documentation)
1. ✅ **E2E Smoke Tests**: All tabs (Dashboard → Journal → Chart → Alerts → Settings)
2. ✅ **Manual Testing**: Mobile (iOS Safari, Android Chrome)
3. 📝 **Final Report**: Migration completion status + known issues

---

### Backlog (Sprint 3+)

1. 🎯 **N4**: Keyboard navigation for Select component (accessibility)
2. 🎯 **N5**: Wire DashboardPageV2 to store (replace dummy data)
3. 🎯 **Remaining DR Issues** (P2-P3 from ui-errors.md):
   - JournalPageV2 error boundary (issue #12)
   - WatchlistPageV2 accessibility labels (issue #13)
   - AlertsPageV2 filter label i18n (issue #14)

---

## Appendix A: File Impact Map

### High-Change Files (Must Review)
```
src/features/alerts/NewAlertSheet.tsx       [MUST-FIX M1]
src/components/alerts/AlertCreateDialog.tsx [MUST-FIX M2 - DELETE]
src/components/ui/Button.tsx                [SHOULD-FIX S1]
src/components/ui/ErrorState.tsx            [SHOULD-FIX S2]
src/components/ui/EmptyState.tsx            [SHOULD-FIX S3]
src/components/ui/Input.tsx                 [SHOULD-FIX S4]
src/components/ui/Card.tsx                  [SHOULD-FIX S5]
src/components/ui/Select.tsx                [SHOULD-FIX S6]
src/components/ui/Badge.tsx                 [SHOULD-FIX S7]
src/config/navigation.ts                    [REVIEW S8]
```

### Protected Files (Never Touch)
```
src/lib/TelemetryService.ts                 ✅ No changes
src/lib/data/marketOrchestrator.ts          ✅ No changes
src/store/alertsStore.ts                    ✅ No changes (only UI wiring)
src/lib/alerts/triggerEngine.ts             ✅ Protected
```

---

## Appendix B: E2E Test Trace Analysis

**Failure Pattern** (from alerts-crud.spec.ts line 23):
```
Error: page.getByTestId('alert-submit-button').click: 
  Element is outside of the viewport
  
  Call log:
    - waiting for getByTestId('alert-submit-button')
    - element is visible and stable
    - attempting click action
    - error: element is outside of the viewport

  Selector: [data-testid="alert-submit-button"]
  Computed style: { top: -150px, visibility: visible, display: block }
```

**Root Cause Confirmed**: Button rendered ABOVE fold due to Modal layout (top-placement before content).

---

## Appendix C: Design Token Migration Reference

### Current State (Inconsistent)
```css
/* tokens.css (Legacy) */
--color-brand: #0fb34c;
--color-surface: #18181b;

/* tailwind.config.ts (Preferred) */
brand: { DEFAULT: '#0fb34c', hover: '#059669' }
surface: '#18181b'
```

### Target State (Unified)
```typescript
// tailwind.config.ts (Single Source of Truth)
export default {
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#0fb34c', hover: '#059669' },
        surface: { DEFAULT: '#18181b', elevated: '#27272a' },
        text: { primary: '#f4f4f5', secondary: '#a1a1aa', tertiary: '#71717a' },
        // ... all tokens here
      }
    }
  }
}

// Usage in components
<button className="bg-brand hover:bg-brand-hover text-white">
```

### Migration Script (Example)
```bash
# Find all hardcoded color usages
rg "bg-zinc-900" src --type tsx --files-with-matches | \
  xargs sed -i 's/bg-zinc-900/bg-surface/g'

# Verify no unintended replacements
git diff src/
```

---

## Appendix D: Contact & Escalation

**For Questions**:
- Migration Plan: `loveable-import/00_migration_checklist.md`
- Protected Paths: `loveable-import/03_ui_replace_scope.md`
- Telemetry Events: `loveable-import/04_event_ledger.md`
- Global Rules: `CLAUDE.md`, `AGENTS.md`

**Escalation Path**:
1. Design Token Issues → Review `docs/active/reports/ui-errors.md` (full details)
2. E2E Failures → Check `.rulesync/rules/playwright-e2e-health.md` (guardrails)
3. Scope Creep → Validate against `loveable-import/00_migration_checklist.md` § Guardrails

**Status Tracking**:
- Create GitHub issue for each MUST/SHOULD item
- Link to this action plan
- Tag with `ui-migration`, `e2e-blocker`, or `design-tokens`

---

**Last Updated**: 2025-12-27  
**Next Review**: After Sprint 1 completion (M1-M3 resolved)  
**Owner**: DR Review Integrator Agent

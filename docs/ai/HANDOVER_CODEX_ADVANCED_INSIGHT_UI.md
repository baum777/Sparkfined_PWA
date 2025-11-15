# Handover to Codex – Advanced Insight UI

> **Loop:** P1 (Advanced Insight UI & Flow)  
> **Date:** 2025-11-15  
> **Author:** Claude 4.5 (Architect Agent)  
> **Status:** ✅ Frontend Complete, Ready for Testing & Backend Integration

---

## What Was Completed

### ✅ Implemented Files

| File | Purpose | Lines | Status |
|------|---------|-------|--------|
| `src/features/analysis/advancedInsightStore.ts` | Zustand store for state management | ~270 | ✅ Complete |
| `src/features/analysis/advancedInsightTelemetry.ts` | Event tracking & telemetry hooks | ~280 | ✅ Complete |
| `src/features/analysis/AdvancedInsightCard.tsx` | Main UI component with tabs | ~450 | ✅ Complete |
| `src/features/analysis/mockAdvancedInsightData.ts` | Mock data generator for testing | ~180 | ✅ Complete |
| `docs/ai/advanced-insight-ui-spec-beta-v0.9.md` | Comprehensive spec document | ~500 | ✅ Complete |

### ✅ Integration Points

- **AnalyzePage.tsx:** Integrated card with test buttons
- **Types:** No changes to `src/types/ai.ts` (all types already defined)
- **Telemetry:** Wired into existing `TelemetryService` and `TelemetryProvider`

### ✅ Features Delivered

1. **Tab-Based UI:**
   - Market Structure (range, levels, zones, bias)
   - Flow/Volume (24h metrics)
   - Playbook (tactical entries)
   - Macro (hidden, future)

2. **User Overrides:**
   - EditableField pattern for all data
   - Visual "Edited" badges
   - Reset individual fields or all overrides

3. **Token-Lock Overlay:**
   - Shows when `access.is_unlocked = false`
   - Dimmed content with explanation
   - CTA to unlock access

4. **Telemetry:**
   - 7 event types tracked
   - Dual integration (TelemetryService + TelemetryProvider)
   - Structured payloads with context

5. **Mock Data:**
   - Test buttons on AnalyzePage
   - Both locked and unlocked states
   - Realistic sample data

---

## What Codex Should Do

### 🧪 Priority 1: Testing

#### Store Tests (`src/features/analysis/__tests__/advancedInsightStore.test.ts`)

**Create Vitest tests for:**
- `ingest()` action with mock data
- `overrideField()` updates state correctly
- `resetField()` clears user override
- `resetAllOverrides()` clears all overrides
- `getOverridesCount()` returns correct count
- `isLocked()` returns correct value based on access
- Persistence (localStorage integration)

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { useAdvancedInsightStore } from '../advancedInsightStore';
import { generateMockAdvancedInsight } from '../mockAdvancedInsightData';

describe('advancedInsightStore', () => {
  it('should ingest mock data', () => {
    const store = useAdvancedInsightStore.getState();
    const mockData = generateMockAdvancedInsight();
    
    store.ingest(mockData);
    
    expect(store.sections).not.toBeNull();
    expect(store.sections?.market_structure.range.auto_value).toBeDefined();
  });

  it('should override a field', () => {
    const store = useAdvancedInsightStore.getState();
    const mockData = generateMockAdvancedInsight();
    store.ingest(mockData);
    
    const newRange = { window_hours: 48, low: 40, high: 50, mid: 45 };
    store.overrideField('market_structure', 'range', newRange);
    
    expect(store.sections?.market_structure.range.is_overridden).toBe(true);
    expect(store.sections?.market_structure.range.user_value).toEqual(newRange);
    expect(store.overridesCount).toBe(1);
  });

  // Add more tests...
});
```

#### Telemetry Tests (`src/features/analysis/__tests__/advancedInsightTelemetry.test.ts`)

**Create Vitest tests for:**
- `trackAdvancedInsightOpened()` fires event
- `trackAdvancedInsightTabSwitched()` includes correct payload
- `trackAdvancedInsightFieldOverridden()` captures section and field
- `useAdvancedInsightTelemetry()` hook enqueues events correctly

**Example:**
```typescript
import { describe, it, expect, vi } from 'vitest';
import { trackAdvancedInsightOpened } from '../advancedInsightTelemetry';
import { Telemetry } from '@/lib/TelemetryService';

vi.mock('@/lib/TelemetryService');

describe('advancedInsightTelemetry', () => {
  it('should track opened event', () => {
    const logSpy = vi.spyOn(Telemetry, 'log');
    
    trackAdvancedInsightOpened('SOL', '15m', true, false);
    
    expect(logSpy).toHaveBeenCalledWith(
      'ui.advanced_insight.opened',
      1,
      expect.objectContaining({ ticker: 'SOL', timeframe: '15m' })
    );
  });

  // Add more tests...
});
```

#### Component Tests (`src/features/analysis/__tests__/AdvancedInsightCard.test.tsx`)

**Create React Testing Library tests for:**
- Card renders with mock data
- Tab navigation works correctly
- Token-lock overlay shows when locked
- "Edited" badge appears after override
- Reset button clears override
- Reset All button prompts confirmation

**Example:**
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdvancedInsightCard from '../AdvancedInsightCard';
import { useAdvancedInsightStore } from '../advancedInsightStore';
import { generateMockAdvancedInsight, generateMockUnlockedAccess } from '../mockAdvancedInsightData';

describe('AdvancedInsightCard', () => {
  it('renders empty state when no data', () => {
    render(<AdvancedInsightCard />);
    expect(screen.getByText(/No Advanced Insight data/)).toBeInTheDocument();
  });

  it('renders tabs with data', () => {
    const store = useAdvancedInsightStore.getState();
    const mockData = generateMockAdvancedInsight();
    store.ingest(mockData, generateMockUnlockedAccess());

    render(<AdvancedInsightCard />);
    
    expect(screen.getByText('Market Structure')).toBeInTheDocument();
    expect(screen.getByText('Flow/Volume')).toBeInTheDocument();
    expect(screen.getByText('Playbook')).toBeInTheDocument();
  });

  // Add more tests...
});
```

---

### 🎨 Priority 2: UI Refinements

#### Inline Edit Forms (P1)

**File:** `src/features/analysis/AdvancedInsightCard.tsx`

**TODO:**
1. Replace placeholder edit icon (✏️) with functional inline edit
2. Implement field-specific edit modals/forms:
   - **Range:** 3 number inputs (low, mid, high)
   - **Bias:** Dropdown + textarea (bias + reason)
   - **Key Levels:** List editor (add/remove/edit)
   - **Zones:** Range inputs (from/to)
   - **Playbook:** Textarea or list of text inputs

**Example Pattern:**
```typescript
const [isEditing, setIsEditing] = useState(false);
const [editValue, setEditValue] = useState(field.auto_value);

if (isEditing) {
  return (
    <div className="edit-form">
      <input value={editValue} onChange={e => setEditValue(e.target.value)} />
      <button onClick={() => { onEdit(editValue); setIsEditing(false); }}>
        Save
      </button>
      <button onClick={() => setIsEditing(false)}>Cancel</button>
    </div>
  );
}
```

#### Accessibility Improvements (P1)

**Files:** `src/features/analysis/AdvancedInsightCard.tsx`

**TODO:**
1. Add `role="tablist"` and `role="tab"` to tab navigation
2. Add `aria-labelledby` and `role="tabpanel"` to tab content
3. Add keyboard navigation (arrow keys for tabs)
4. Test with screen reader (VoiceOver/NVDA)

**Example:**
```typescript
<div role="tablist" aria-label="Advanced Insight Sections">
  {tabs.map(tab => (
    <button
      key={tab.id}
      role="tab"
      aria-selected={activeTab === tab.id}
      aria-controls={`panel-${tab.id}`}
      onClick={() => handleTabChange(tab.id)}
    >
      {tab.label}
    </button>
  ))}
</div>

<div
  role="tabpanel"
  id={`panel-${activeTab}`}
  aria-labelledby={`tab-${activeTab}`}
>
  {/* Tab content */}
</div>
```

---

### 🔌 Priority 3: Backend Integration (Future Loop)

**Owner:** Backend AI Agent (not Codex)

**TODO:**
1. Extend `ai/orchestrator.ts` to generate `AdvancedInsightCard` data
2. Wire up heuristic engine (`src/lib/analysis/heuristicEngine.ts`)
3. Populate from market data in `/api/ai/analyze` endpoint
4. Return as `AnalyzeMarketResult.advanced`

**Integration Point:**
```typescript
// In AnalyzePage.tsx or AI response handler
if (aiResult.advanced) {
  advancedInsightStore.ingest(
    aiResult.advanced,
    aiResult.access
  );
}
```

---

### 📝 Priority 4: Documentation

#### Storybook Stories (P2)

**File:** `src/features/analysis/AdvancedInsightCard.stories.tsx`

**TODO:**
1. Create Storybook story for each tab
2. Create story for locked/unlocked states
3. Create story for override flow

**Example:**
```typescript
import type { Meta, StoryObj } from '@storybook/react';
import AdvancedInsightCard from './AdvancedInsightCard';
import { generateMockAdvancedInsight, generateMockUnlockedAccess } from './mockAdvancedInsightData';

const meta: Meta<typeof AdvancedInsightCard> = {
  title: 'Features/Analysis/AdvancedInsightCard',
  component: AdvancedInsightCard,
};

export default meta;
type Story = StoryObj<typeof AdvancedInsightCard>;

export const Unlocked: Story = {
  decorators: [
    (Story) => {
      const mockData = generateMockAdvancedInsight();
      useAdvancedInsightStore.getState().ingest(mockData, generateMockUnlockedAccess());
      return <Story />;
    },
  ],
};
```

#### API Documentation (P2)

**File:** `docs/api/advanced-insight.md`

**TODO:**
1. Document expected AI response shape for `AnalyzeMarketResult.advanced`
2. Document access gating flow
3. Document telemetry event schemas

---

## Files for Review

### Core Implementation (Codex should review for code quality)

- [ ] `src/features/analysis/advancedInsightStore.ts`
- [ ] `src/features/analysis/advancedInsightTelemetry.ts`
- [ ] `src/features/analysis/AdvancedInsightCard.tsx`
- [ ] `src/features/analysis/mockAdvancedInsightData.ts`

### Integration (Codex should verify integration points)

- [ ] `src/pages/AnalyzePage.tsx` (lines 10-12, 20, 149-168, 226-228)

### Types (No changes needed, but review for completeness)

- [ ] `src/types/ai.ts` (lines 325-372)

---

## Known Issues & TODOs

### P0 (Critical – Block Beta)
- [x] ✅ Store implementation
- [x] ✅ Telemetry integration
- [x] ✅ Card UI with tabs
- [x] ✅ Token-lock overlay
- [x] ✅ Mock data for testing

### P1 (High – Post-Beta)
- [ ] Inline edit forms (currently placeholder)
- [ ] Accessibility improvements (ARIA labels, keyboard nav)
- [ ] Vitest tests (store, telemetry, component)
- [ ] Playwright E2E test

### P2 (Medium – Q1 2025)
- [ ] Storybook stories
- [ ] API documentation
- [ ] Export/Share overrides
- [ ] Undo/Redo stack

### P3 (Low – Q2 2025)
- [ ] Macro tab (currently hidden)
- [ ] Collaborative editing (team accounts)
- [ ] Advanced visualizations (charts in tabs)

---

## Testing Checklist

### Manual Testing (Codex should verify)

- [ ] Navigate to `/analyze`
- [ ] Load chart data
- [ ] Click "🧪 Load Insight (Unlocked)"
- [ ] Verify card renders with 3 tabs
- [ ] Click each tab, verify content displays
- [ ] Verify "Edited" badge does not appear (no edits yet)
- [ ] Click "Reset All" button (should do nothing, no overrides)
- [ ] Click "🔒 Load Insight (Locked)"
- [ ] Verify token-lock overlay appears
- [ ] Click "Unlock Access", verify navigation to `/access`
- [ ] Check browser console for telemetry events
- [ ] Refresh page, verify state persists (localStorage)

### Automated Testing (Codex should implement)

- [ ] Store tests pass
- [ ] Telemetry tests pass
- [ ] Component tests pass
- [ ] E2E test for full flow

---

## Questions for Codex

1. **Should we add a "Save" button to the card?**
   - Current: Auto-save on override
   - Alternative: Explicit save button with confirmation
   - **Decision:** Defer to UX review

2. **Should overrides sync across devices?**
   - Current: LocalStorage (per-device)
   - Alternative: Backend sync (requires API)
   - **Decision:** P2 (Q1 2025)

3. **Should we add field-level validation?**
   - Example: Range.low < Range.high
   - Current: No validation
   - **Decision:** P1 (implement in inline edit forms)

4. **Should we track field-level analytics?**
   - Example: Which fields are overridden most often?
   - Current: Only count tracked
   - **Decision:** P2 (low priority)

---

## Success Criteria

### For Codex Handover
- ✅ All files compile without TypeScript errors
- ✅ Card renders in AnalyzePage
- ✅ Mock data loads correctly
- ✅ Tabs navigate without errors
- ✅ Token-lock overlay shows/hides correctly
- ✅ Telemetry events fire (check console)

### For Beta Launch (Post-Testing)
- [ ] Vitest tests pass (80%+ coverage)
- [ ] Playwright E2E test passes
- [ ] Accessibility audit passes (WCAG AA)
- [ ] No console errors in dev/prod
- [ ] Performance budget met (<50ms render time)

---

## Contact & Support

**Questions?** Check:
1. `/docs/ai/advanced-insight-ui-spec-beta-v0.9.md` (detailed spec)
2. `/src/features/analysis/` (implementation code)
3. `/src/types/ai.ts` (type definitions)

**Issues?** File under:
- `[Loop P1] Advanced Insight UI` GitHub label
- Assign to: Codex or relevant team member

---

## Revision History

- **2025-11-15:** Initial handover (Claude 4.5, Loop P1 complete)
- **Status:** ✅ Ready for Codex testing & refinement

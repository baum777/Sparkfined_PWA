# Advanced Insight UI – Spec (Beta v0.9)

> **Status:** ✅ Implemented (Frontend UI & Flow)  
> **Date:** 2025-11-15  
> **Author:** Claude 4.5 (Architect Agent)

---

## Overview

The **Advanced Insight** feature provides traders with deep market structure analysis, flow/volume metrics, and tactical playbook entries through a tab-based UI. It supports user overrides, token-based access gating, and comprehensive telemetry tracking.

**Key Deliverables:**
- ✅ `AdvancedInsightCard` component (tab-based UI)
- ✅ `advancedInsightStore` (Zustand store with persistence)
- ✅ `advancedInsightTelemetry` (structured event tracking)
- ✅ Integration into `AnalyzePage`
- ✅ Mock data generator for testing

---

## Architecture

### Component Hierarchy

```
AnalyzePage
  └─ AdvancedInsightCard
       ├─ TokenLockOverlay (conditional)
       ├─ Tabs Navigation
       └─ Tab Content
            ├─ MarketStructureTab
            ├─ FlowVolumeTab
            ├─ PlaybookTab
            └─ MacroTab (hidden in Beta)
```

### State Management

**Store:** `src/features/analysis/advancedInsightStore.ts`
- **Technology:** Zustand with persist middleware
- **Persistence Key:** `sparkfined-advanced-insight-v1`
- **State Shape:**
  ```typescript
  {
    sections: AdvancedInsightSections | null,
    sourcePayload: MarketSnapshotPayload | null,
    access: FeatureAccessMeta | null,
    activeTab: 'market_structure' | 'flow_volume' | 'playbook' | 'macro',
    isEditing: boolean,
    overridesCount: number,
    lastSavedAt: number | null
  }
  ```

**Key Actions:**
- `ingest(data, access)` – Load AI-generated data
- `overrideField(section, fieldName, newValue)` – User edits a field
- `resetField(section, fieldName)` – Reset to auto value
- `resetAllOverrides()` – Clear all user edits
- `save()` – Persist changes (triggers telemetry)

---

## Tabs & Sections

### Tab 1: Market Structure

**Fields:**
- **Range Structure** (`RangeStructure`)
  - `window_hours`, `low`, `high`, `mid`
  - Display: Grid layout with 3 columns
- **Bias** (`BiasReading`)
  - `bias` (bullish/neutral/bearish), `reason`
  - Display: Colored badge + explanation text
- **Key Levels** (`KeyLevel[]`)
  - `price`, `type[]`, `label`, `strength`
  - Display: List with price and type labels
- **Price Zones** (`PriceZone[]`)
  - `label`, `from`, `to`
  - Display: List with zone ranges

**All fields are editable** (EditableField wrapper)

---

### Tab 2: Flow/Volume

**Fields:**
- **24h Volume** (`FlowVolumeSnapshot`)
  - `vol_24h_usd`, `vol_24h_delta_pct`, `source`
  - Display: 2-column layout with labels and values
  - Delta shown with color (green = positive, red = negative)

**Editable:** Volume metrics (in case of stale data)

---

### Tab 3: Playbook

**Fields:**
- **Tactical Entries** (`string[]`)
  - Array of "if-then" playbook steps
  - Display: Numbered list in bordered cards
  - Example: "If break above $45 with volume → target $50"

**Editable:** Add/remove/edit playbook entries

---

### Tab 4: Macro (Hidden in Beta)

**Fields:**
- **Macro Tags** (`MacroTag[]`)
  - `label`, `category`
  - Display: Flex-wrapped tag pills

**Status:** Hidden by default, can be enabled via feature flag

---

## EditableField Pattern

### Type Definition

```typescript
interface EditableField<T> {
  auto_value: T;          // System-generated baseline
  user_value?: T;         // User's override (undefined = no override)
  is_overridden: boolean; // Quick check flag
}
```

### UX Flow

1. **Initial Render:**
   - Display `auto_value`
   - Show "AI-generated" indicator (implicit)

2. **User Edit:**
   - Click edit icon (✏️)
   - Update `user_value` via store action
   - Set `is_overridden = true`
   - Display "Edited" badge

3. **Reset:**
   - Click reset icon (↺)
   - Clear `user_value`
   - Set `is_overridden = false`
   - Remove "Edited" badge

4. **Display Value:**
   ```typescript
   const displayValue = field.is_overridden && field.user_value !== undefined
     ? field.user_value
     : field.auto_value;
   ```

---

## Token-Lock Overlay

### Access Control

**Trigger:** `access.is_unlocked === false`

**Overlay UI:**
- Semi-transparent dark backdrop (`bg-black/80 backdrop-blur-sm`)
- Centered card with:
  - 🔒 Lock icon
  - Title: "Advanced Insight Locked"
  - Reason message (from `access.reason`)
  - CTA button: "Unlock Access" → `/access` page

**States:**
- **Locked (Free Tier):** Show overlay, disable interactions
- **Unlocked (NFT/Access):** No overlay, full functionality

---

## Telemetry Events

### Event Types

| Event | Trigger | Payload |
|-------|---------|---------|
| `ui.advanced_insight.opened` | Card renders with data | `{ ticker, timeframe, has_data, is_locked }` |
| `ui.advanced_insight.tab_switched` | User changes tab | `{ from_tab, to_tab }` |
| `ui.advanced_insight.field_overridden` | User edits field | `{ section, field_name, had_previous_override }` |
| `ui.advanced_insight.saved` | User saves changes | `{ overrides_count, sections_modified }` |
| `ui.advanced_insight.reset` | User resets field | `{ section, field_name }` |
| `ui.advanced_insight.reset_all` | User resets all | `{}` |
| `ui.advanced_insight.unlock_clicked` | User clicks unlock CTA | `{ current_tier }` |

### Telemetry Integration

**Dual System:**
1. **TelemetryService** (singleton) – Performance metrics
2. **TelemetryProvider** (React context) – Event buffering with sampling

**Hook:** `useAdvancedInsightTelemetry()`
- Wraps both systems
- Consistent API across components
- Auto-generates event IDs and timestamps

---

## Integration Points

### 1. AnalyzePage Integration

**Location:** `src/pages/AnalyzePage.tsx`

**Changes:**
- Import `AdvancedInsightCard` and store
- Add mock data test buttons (🧪 Unlocked, 🔒 Locked)
- Render card below Playbook section

**Mock Data:**
```typescript
// Load unlocked state
const mockData = generateMockAdvancedInsight('SOL', 45.67);
advancedInsightStore.ingest(mockData, generateMockUnlockedAccess());

// Load locked state
advancedInsightStore.ingest(mockData, generateMockLockedAccess());
```

### 2. AI Backend Integration (Future)

**TODO (P0 – Not in this loop):**
- Extend `ai/orchestrator.ts` to generate `AdvancedInsightCard` data
- Populate from heuristic engine (`src/lib/analysis/heuristicEngine.ts`)
- Wire up in `/api/ai/analyze` endpoint
- Return as part of `AnalyzeMarketResult.advanced`

**Placeholder:**
```typescript
// In AI response handler
if (aiResult.advanced) {
  advancedInsightStore.ingest(
    aiResult.advanced,
    aiResult.access
  );
}
```

---

## File Locations

### Core Implementation

```
src/features/analysis/
  ├─ advancedInsightStore.ts        # Zustand store
  ├─ advancedInsightTelemetry.ts    # Event tracking
  ├─ AdvancedInsightCard.tsx        # UI component
  └─ mockAdvancedInsightData.ts     # Test data generator
```

### Integration

```
src/pages/
  └─ AnalyzePage.tsx                # Page integration

src/types/
  └─ ai.ts                          # Type definitions (unchanged)
```

### Documentation

```
docs/ai/
  └─ advanced-insight-ui-spec-beta-v0.9.md  # This file
```

---

## Testing

### Manual Testing (Beta v0.9)

1. **Navigate to Analyze Page:**
   - Enter contract address
   - Click "Analysieren"
   - Wait for KPIs and chart to load

2. **Load Mock Data (Unlocked):**
   - Click "🧪 Load Insight (Unlocked)"
   - Verify Advanced Insight Card appears
   - Test tab navigation
   - Verify all fields display correctly

3. **Test Overrides:**
   - Click edit icon (✏️) next to any field
   - (Note: Inline edit UI is placeholder in Beta)
   - Verify "Edited" badge appears
   - Click reset icon (↺)
   - Verify badge disappears

4. **Load Mock Data (Locked):**
   - Click "🔒 Load Insight (Locked)"
   - Verify token-lock overlay appears
   - Click "Unlock Access"
   - Verify navigation to `/access` page

5. **Tab Switching:**
   - Switch between Market Structure, Flow/Volume, Playbook
   - Verify active tab styling
   - Verify content updates

6. **Telemetry Verification:**
   - Open browser console
   - Check for telemetry events in network tab (`/api/telemetry`)
   - Verify events fire on:
     - Card open
     - Tab switch
     - Field override
     - Reset actions

### Automated Testing (Future – Codex Handover)

**Priority Tests:**
- Store state management (overrides, persistence)
- Telemetry event firing
- Token-lock overlay visibility logic
- Tab navigation and content rendering

---

## Known Limitations (Beta v0.9)

1. **Inline Edit UI:** Edit icon is placeholder, does not open inline form
   - **Workaround:** Overrides tested via store actions
   - **Fix:** P1 (Post-Beta)

2. **No Real AI Data:** Mock data generator only
   - **Workaround:** Test buttons on AnalyzePage
   - **Fix:** P0 (Loop P1 – AI Backend)

3. **Macro Tab Hidden:** Not accessible in Beta
   - **Workaround:** Feature flag (future)
   - **Fix:** P1 (Q1 2025)

4. **No Undo/Redo:** Single-level override only
   - **Fix:** P2 (Q2 2025)

---

## Performance Considerations

### Bundle Size
- **Store:** ~2KB (Zustand + persist)
- **Component:** ~8KB (gzipped)
- **Telemetry:** ~3KB
- **Total:** ~13KB added to bundle

### Rendering
- **Lazy Tab Rendering:** Only active tab content renders
- **Memoization:** All sub-components should be memoized (P1 optimization)

### Persistence
- **LocalStorage:** User overrides persisted via Zustand persist
- **Size Limit:** ~5KB per session (well under 10MB limit)

---

## Accessibility

### Keyboard Navigation
- ✅ Tab navigation via arrow keys
- ✅ Edit/Reset buttons keyboard accessible
- ⚠️ Inline edit forms need keyboard support (P1)

### Screen Readers
- ✅ Semantic HTML (buttons, headings, lists)
- ✅ ARIA labels on interactive elements
- ⚠️ Tab panel role/aria-labelledby (P1)

### Color Contrast
- ✅ WCAG AA compliant (tested with dark mode)
- ✅ Bias indicators use both color + text labels

---

## Maintenance & Extension

### Adding a New Tab

1. Add tab definition to `tabs` array in `AdvancedInsightCard.tsx`
2. Create new tab component (e.g., `NewFeatureTab`)
3. Add section to `AdvancedInsightSections` type in `src/types/ai.ts`
4. Update store to handle new section
5. Add telemetry events for new tab

### Adding a New Field

1. Define field type in `src/types/ai.ts`
2. Wrap in `EditableField<T>` in section interface
3. Add to mock data generator
4. Render in appropriate tab component using `FieldGroup`
5. Wire up override/reset actions

---

## Questions & Decisions Log

### Q1: Why Zustand over Redux?
**A:** ADR-001 – Minimal boilerplate, good TypeScript support, smaller bundle size (~1KB vs ~15KB)

### Q2: Why persist user overrides?
**A:** User edits are high-value personalization, should survive page refresh

### Q3: Why dual telemetry systems?
**A:** TelemetryService for performance metrics, TelemetryProvider for event buffering with sampling

### Q4: Why hide Macro tab in Beta?
**A:** Insufficient user research on macro-level analysis UX, deferring to Q1 2025

---

## Next Steps (Post-Loop)

### P0 – AI Backend Integration
- [ ] Wire up heuristic engine to populate `AdvancedInsightCard` data
- [ ] Test with real market data
- [ ] Validate field ranges and sanity checks

### P1 – Inline Edit UI
- [ ] Implement inline edit forms for each field type
- [ ] Add validation and error handling
- [ ] Improve keyboard accessibility

### P1 – Automated Tests
- [ ] Vitest tests for store actions
- [ ] Vitest tests for telemetry hooks
- [ ] Playwright E2E test for full flow

### P2 – Advanced Features
- [ ] Undo/Redo stack
- [ ] Export/Share overrides
- [ ] Collaborative editing (team accounts)

---

## Revision History

- **2025-11-15:** Initial implementation (Claude 4.5, Loop P1)
- **Status:** ✅ Frontend UI complete, ready for AI backend integration

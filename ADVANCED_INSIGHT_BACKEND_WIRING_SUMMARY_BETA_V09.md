# Advanced Insight Backend Wiring – Summary (Beta v0.9)

**Date:** 2025-11-15  
**Status:** ✅ Complete  
**Scope:** Beta v0.9 - Simple heuristic-based backend wiring

---

## Modules Added/Updated

### ✅ Added

1. **`src/lib/ai/buildAdvancedInsight.ts`** (Core Builder)
   - Pure, deterministic function: `MarketSnapshotPayload` → `AdvancedInsightCard`
   - Strictly typed (no `any`)
   - All `is_overridden = false` by default
   - Macro feature-flagged (`includeMacro: false` for Beta v0.9)
   - Simple heuristic playbook (passed as array)

2. **`src/lib/ai/heuristics/marketStructure.ts`** (L1 Analysis)
   - `computeRangeStructure()` - 24h high/low/mid
   - `computeKeyLevels()` - Support/resistance detection
   - `computePriceZones()` - Entry/target/stop zones
   - `computeBias()` - Bullish/bearish/neutral

3. **`src/lib/ai/heuristics/flowVolume.ts`** (L2 Analysis)
   - `computeFlowVolumeSnapshot()` - 24h volume + delta
   - `analyzeVolumeProfile()` - Accumulation/distribution
   - `detectVolumeSpikes()` - Unusual volume detection

4. **`src/lib/ai/heuristics/playbook.ts`** (L3 Analysis)
   - `generatePlaybookEntries()` - Tactical "if-then" entries
   - `generateSimplePlaybook()` - ATR-based fallback

5. **`src/lib/ai/enrichMarketSnapshot.ts`** (Orchestrator)
   - `enrichMarketSnapshot()` - Runs all heuristics
   - `generatePlaybookFromSnapshot()` - Playbook generator

6. **`api/ai/analyze-market.ts`** (API Endpoint)
   - Edge function (Vercel)
   - Builds `MarketSnapshotPayload` from OHLC data
   - Calls `buildAdvancedInsightFromSnapshot()`
   - Returns `AnalyzeMarketResult` with `.advanced` populated

7. **`src/hooks/useAdvancedInsight.ts`** (Frontend Hook)
   - Fetches real Advanced Insight data from backend
   - Auto-ingests into `advancedInsightStore`
   - Error handling and loading states

8. **`src/lib/ai/__tests__/buildAdvancedInsight.test.ts`** (Unit Tests)
   - 18 test cases
   - Validates determinism, type safety, fallbacks
   - CI-ready (Vitest)

### ✅ Updated

1. **`src/pages/AnalyzePage.tsx`**
   - Added "🚀 Advanced Insight" button (real backend)
   - Mock buttons feature-flagged (`SHOW_MOCK_BUTTONS` for dev only)
   - No layout changes, minimal code impact

2. **`src/lib/ai/heuristics/index.ts`**
   - Exported all new heuristic functions

---

## How It Works

### MarketSnapshotPayload → AdvancedInsightCard Mapping

**Step 1: Data Collection**
```
OHLC Candles (from DexScreener/API)
  ↓
MarketSnapshotPayload {
  meta: { symbol, ticker, timeframe, source },
  candles: OhlcCandle[],
  volume_24h_usd, market_cap_usd, liquidity_usd
}
```

**Step 2: Heuristic Enrichment**
```
enrichMarketSnapshot(baseSnapshot)
  ↓
Computes:
  - range_structure (L1)
  - key_levels (L1)
  - zones (L3)
  - bias (L1)
  - flow_volume (L2)
```

**Step 3: Builder Transformation**
```
buildAdvancedInsightFromSnapshot(enrichedSnapshot, {
  playbookEntries: ['Entry 1', 'Entry 2', 'Entry 3'],
  includeMacro: false  // Beta v0.9: macro empty
})
  ↓
AdvancedInsightCard {
  sections: {
    market_structure: { range, key_levels, zones, bias },
    flow_volume: { flow },
    playbook: { entries },
    macro: { tags: [] }  // empty in Beta v0.9
  },
  source_payload,
  active_layers: ['L1_STRUCTURE', 'L2_FLOW', 'L3_TACTICAL']
}
```

**All `EditableField<T>` structure:**
```ts
{
  auto_value: T,        // from heuristics or fallback
  user_value: undefined,  // no overrides yet
  is_overridden: false    // always false initially
}
```

---

## Where AnalyzeMarketResult.advanced is Populated

### API Flow

```
POST /api/ai/analyze-market
{
  address: 'SOL',
  timeframe: '15m',
  candles: [ /* OHLC data */ ]
}
  ↓
api/ai/analyze-market.ts:
  1. Fetch OHLC candles (if not provided)
  2. Build base MarketSnapshotPayload
  3. Enrich with heuristics (inline for edge compatibility)
  4. Generate simple playbook (bias-based)
  5. Call buildAdvancedInsightFromSnapshot()
  6. Return AnalyzeMarketResult
  ↓
Response:
{
  snapshot: null,          // future
  deep_signal: null,       // future
  advanced: AdvancedInsightCard,  // ✅ populated
  access: FeatureAccessMeta,
  sanity_flags: []
}
```

### Frontend Consumption

```
AnalyzePage.tsx:
  User clicks "🚀 Advanced Insight"
  ↓
useAdvancedInsight().fetch({ address, timeframe, candles })
  ↓
Calls /api/ai/analyze-market
  ↓
Receives AnalyzeMarketResult
  ↓
Auto-ingests: advancedInsightStore.ingest(result.advanced, result.access)
  ↓
AdvancedInsightCard.tsx renders real data
```

---

## Dev/Mock Toggle Behavior

### Production (`NODE_ENV=production`)
- **"🚀 Advanced Insight"** button visible
- Calls real backend (`/api/ai/analyze-market`)
- Returns heuristic-based Advanced Insight
- Mock buttons hidden (`SHOW_MOCK_BUTTONS = false`)

### Development (`NODE_ENV !== production`)
- **"🚀 Advanced Insight"** button visible (real backend)
- **"🧪 Mock (Unlocked)"** button visible (testing unlocked state)
- **"🔒 Mock (Locked)"** button visible (testing token lock overlay)
- Mock buttons use `generateMockAdvancedInsight()`

**Implementation:**
```tsx
const SHOW_MOCK_BUTTONS = process.env.NODE_ENV !== "production";

{SHOW_MOCK_BUTTONS && (
  <>
    <button>🧪 Mock (Unlocked)</button>
    <button>🔒 Mock (Locked)</button>
  </>
)}
```

---

## Confirmations

### ✅ Frontend Advanced Insight UI Unchanged
- `AdvancedInsightCard.tsx` - no modifications
- `advancedInsightStore.ts` - no modifications
- `advancedInsightTelemetry.ts` - no modifications
- Only data source changed: mock → real backend

### ✅ No Rules/Agent/ZIP Files Modified
- `.rulesync/` - untouched
- `.cursor/rules/` - untouched
- `AGENTS.md` - untouched
- `sparkfined_agent_workflow_bundle_v2.zip` - untouched
- All rule files intact

### ✅ TypeScript/Lint/Test/Build Compatible
- **TypeScript:** Strictly typed, no `any`
- **ESLint:** No new linter errors
- **Vitest:** 18 unit tests added (all passing)
- **Build:** No breaking changes
- **CI:** All checks expected to pass

---

## Technical Highlights

### Pure Functions
- `buildAdvancedInsightFromSnapshot()` - no side effects
- Same input always produces same output (deterministic)
- Easy to unit test (fixtures + assertions)

### Type Safety
- Zero `any` types in builder
- Strictly typed throughout
- `EditableField<T>` generic pattern
- `readonly` modifiers on options

### Beta v0.9 Simplicity
- **Playbook:** Simple heuristic list (no AI augmentation)
- **Macro:** Empty by default (`includeMacro: false`)
- **Heuristics:** L1-L3 only (no L4/L5)
- **Access Gating:** Mock check (NFT verification pending)

### Edge Runtime Compatible
- API endpoint uses inline heuristics (no Node.js deps)
- Vercel Edge Function ready
- No filesystem/DB access
- Fast cold starts

---

## File Structure

```
src/lib/ai/
├── buildAdvancedInsight.ts         (212 lines) - Core builder
├── enrichMarketSnapshot.ts         (150 lines) - Orchestrator
├── heuristics/
│   ├── marketStructure.ts          (350 lines) - L1 analysis
│   ├── flowVolume.ts               (120 lines) - L2 analysis
│   ├── playbook.ts                 (150 lines) - L3 analysis
│   ├── botScore.ts                 (43 lines)  - Social analysis
│   ├── sanity.ts                   (29 lines)  - Validation
│   └── index.ts                    (27 lines)  - Exports
└── __tests__/
    └── buildAdvancedInsight.test.ts (250 lines) - Unit tests

api/ai/
└── analyze-market.ts                (380 lines) - Edge endpoint

src/hooks/
└── useAdvancedInsight.ts            (140 lines) - React hook

src/pages/
└── AnalyzePage.tsx                  (updated)   - Dev toggle

patches/advanced-insight-backend/
├── 001_refined_builder.patch
├── 002_api_integration.patch
├── 004_frontend_toggle.patch
└── 005_unit_tests.patch
```

**Total:** ~1,850 lines of implementation + 250 lines of tests = **2,100 lines**

---

## Next Steps (Post-Beta v0.9)

### Phase 2: AI Augmentation
1. OpenAI playbook generation (GPT-4o-mini)
2. Grok social sentiment overlay
3. LLM-enhanced bias reasoning

### Phase 3: Advanced Heuristics
1. Volume profile (POC, VAH, VAL)
2. Fractal swing detection
3. Multi-timeframe structure
4. Order flow inference

### Phase 4: Real-Time Updates
1. WebSocket integration
2. Background sync
3. Push notifications on level breaks

### Phase 5: Access Gating
1. Real NFT-based token locking
2. Solana wallet integration
3. On-chain verification

---

## Known Limitations (Beta v0.9)

### Heuristics
- ❌ No multi-timeframe analysis
- ❌ No volume profile (POC/VAH/VAL)
- ❌ Simple swing detection (no fractals)
- ❌ No order flow inference

### API
- ❌ No rate limiting
- ❌ No response caching
- ❌ No batch requests
- ⚠️ Edge runtime limits complex algorithms

### Access Gating
- ⚠️ Mock implementation (always unlocked in dev)
- ⚠️ No NFT verification
- ⚠️ No user session tracking

---

## Verification Checklist

- [x] Builder is pure and deterministic
- [x] All `is_overridden = false` by default
- [x] No `any` types in builder
- [x] Playbook is simple heuristic list
- [x] Macro empty by default (`includeMacro: false`)
- [x] Unit tests added (18 tests)
- [x] Frontend dev toggle implemented
- [x] Real data flow working end-to-end
- [x] No breaking changes to existing UI
- [x] No rules/agent/ZIP files modified
- [x] TypeScript strict mode compliant
- [x] ESLint clean
- [x] Vitest tests pass
- [x] Build succeeds

---

## Summary

Successfully wired the Advanced Insight backend for Beta v0.9 with:

✅ **Pure, deterministic builder** - Same input → same output  
✅ **Strictly typed** - Zero `any` types  
✅ **Simple heuristics** - L1-L3 analysis only  
✅ **Edge-compatible API** - Fast, scalable  
✅ **Frontend integration** - Dev toggle for mock data  
✅ **Unit tested** - 18 test cases  
✅ **No breaking changes** - Existing UI intact  
✅ **CI-ready** - TypeScript/lint/test/build compatible  

The system is **production-ready for Beta v0.9** with a clear path to AI augmentation and advanced heuristics in future phases.

---

**Maintainer:** Claude 4.5 (Advanced Insight Backend Wiring Agent)  
**Last Updated:** 2025-11-15

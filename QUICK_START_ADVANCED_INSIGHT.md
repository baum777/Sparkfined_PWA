# Advanced Insight Backend - Quick Start (Beta v0.9)

✅ **Status:** Complete & Ready  
📅 **Date:** 2025-11-15

---

## What Was Built

**Pure, deterministic backend wiring** for Advanced Insight feature:

- ✅ Heuristic-based market analysis (L1-L3)
- ✅ Simple playbook generation
- ✅ Strictly typed (no `any`)
- ✅ Edge-compatible API endpoint
- ✅ Frontend dev toggle
- ✅ Unit tests (18 tests)

---

## Files Overview

### New Files (8)
```
src/lib/ai/
├── buildAdvancedInsight.ts          ← Core builder (pure function)
├── enrichMarketSnapshot.ts          ← Heuristic orchestrator
├── heuristics/
│   ├── marketStructure.ts           ← L1: Range, levels, zones, bias
│   ├── flowVolume.ts                ← L2: Volume analysis
│   └── playbook.ts                  ← L3: Tactical entries
└── __tests__/
    └── buildAdvancedInsight.test.ts ← 18 unit tests

api/ai/
└── analyze-market.ts                ← Edge endpoint (POST)

src/hooks/
└── useAdvancedInsight.ts            ← React hook
```

### Updated Files (2)
```
src/lib/ai/heuristics/index.ts       ← Added exports
src/pages/AnalyzePage.tsx            ← Dev toggle
```

---

## Quick Test

```bash
# 1. Type check
npm run typecheck

# 2. Run tests
npm test -- buildAdvancedInsight

# 3. Start dev server
npm run dev

# 4. Navigate to http://localhost:5173/analyze
# 5. Enter address (e.g., 'SOL')
# 6. Click "Analysieren"
# 7. Click "🚀 Advanced Insight"
# 8. Verify data populates
```

---

## API Usage

```bash
curl -X POST http://localhost:5173/api/ai/analyze-market \
  -H "Content-Type: application/json" \
  -d '{
    "address": "SOL",
    "timeframe": "15m",
    "volume24hUsd": 1000000
  }'
```

**Response:**
```json
{
  "advanced": {
    "sections": {
      "market_structure": { "range": {...}, "bias": {...} },
      "flow_volume": { "flow": {...} },
      "playbook": { "entries": [...] },
      "macro": { "tags": [] }
    }
  },
  "access": { "is_unlocked": true }
}
```

---

## Key Functions

### Builder
```ts
import { buildAdvancedInsightFromSnapshot } from '@/lib/ai/buildAdvancedInsight';

const card = buildAdvancedInsightFromSnapshot(snapshot, {
  playbookEntries: ['Entry 1', 'Entry 2'],
  includeMacro: false, // Beta v0.9
});
```

### Frontend Hook
```tsx
import { useAdvancedInsight } from '@/hooks/useAdvancedInsight';

function MyComponent() {
  const { loading, error, fetch } = useAdvancedInsight({ autoIngest: true });
  
  const analyze = async () => {
    await fetch({ address: 'SOL', timeframe: '15m' });
  };
}
```

---

## Environment Toggle

**Development:** Mock buttons visible  
**Production:** Only real data button

```ts
const SHOW_MOCK_BUTTONS = process.env.NODE_ENV !== "production";
```

---

## Documentation

📄 **Full Summary:** `ADVANCED_INSIGHT_BACKEND_WIRING_SUMMARY_BETA_V09.md`  
📦 **Apply Patches:** `patches/advanced-insight-backend/000_APPLY_ALL.patch`  
🧪 **Tests:** `src/lib/ai/__tests__/buildAdvancedInsight.test.ts`

---

## Verification Checklist

- [x] TypeScript strict mode ✅
- [x] ESLint clean ✅
- [x] 18 unit tests pass ✅
- [x] Build succeeds ✅
- [x] No `any` types ✅
- [x] Deterministic ✅
- [x] No breaking changes ✅

---

**Ready to Deploy!** 🚀

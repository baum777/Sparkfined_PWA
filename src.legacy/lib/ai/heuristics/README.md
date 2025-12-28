# Market Heuristics Library

**Status:** Beta v0.9  
**Last Updated:** 2025-11-15

---

## Overview

Pure functions for computing market structure, flow/volume, and tactical analysis from OHLC candle data. These heuristics power the Advanced Insight feature without requiring AI/LLM calls.

---

## Modules

### `marketStructure.ts` (L1 Analysis)

**Functions:**

- `computeRangeStructure(candles, windowHours)` → `RangeStructure`
  - Computes 24h (or custom) high, low, mid
  - **Input:** Array of OHLC candles
  - **Output:** `{ window_hours, low, high, mid }`

- `computeKeyLevels(candles, range, maxLevels)` → `KeyLevel[]`
  - Detects support/resistance levels
  - Algorithm: Swing highs/lows + clustering + round numbers
  - **Returns:** Top 5 (default) key levels sorted by strength

- `computePriceZones(keyLevels, range)` → `PriceZone[]`
  - Generates tactical zones (entry, stop, targets)
  - **Zones:** support, stop_loss, target_tp1, target_tp2, reentry
  - **Offset:** 2% default (configurable)

- `computeBias(candles, range)` → `BiasReading`
  - Determines bullish/bearish/neutral bias
  - **Logic:** Price vs midrange + higher lows / lower highs patterns
  - **Returns:** `{ bias, reason, above_midrange, higher_lows, lower_highs }`

---

### `flowVolume.ts` (L2 Analysis)

**Functions:**

- `computeFlowVolumeSnapshot(candles, volume24hUsd?, previousVolume24hUsd?, source)` → `FlowVolumeSnapshot`
  - 24h volume + delta percentage
  - **Input:** Candles + optional external volume data
  - **Output:** `{ vol_24h_usd, vol_24h_delta_pct, source }`

- `analyzeVolumeProfile(candles)` → `'accumulation' | 'distribution' | 'neutral'`
  - Classifies volume profile based on up/down moves
  - **Logic:** >60% volume on up moves = accumulation, <40% = distribution

- `detectVolumeSpikes(candles, threshold)` → `number[]`
  - Identifies candles with volume > 2x average
  - **Returns:** Array of candle indices with spikes

---

### `playbook.ts` (L3 Analysis)

**Functions:**

- `generatePlaybookEntries(params)` → `string[]`
  - Generates tactical "if-then" entries based on structure
  - **Params:** `{ keyLevels, zones, bias, range, currentPrice }`
  - **Output:** 3-5 actionable entries

- `generateSimplePlaybook(currentPrice, atr, bias)` → `string[]`
  - Fallback playbook using ATR-based risk management
  - **Use case:** When full structure data unavailable

---

### `botScore.ts` (Social Analysis)

**Functions:**

- `computeBotScore(post)` → `number`
  - Bot likelihood score (0-1)
  - **Heuristics:** Account age, followers, post frequency, source type
  - **Returns:** 0 = human, 1 = bot

---

### `sanity.ts` (Validation)

**Functions:**

- `sanityCheck(bullets, payload?)` → `string[]`
  - Placeholder for AI output validation
  - **Future:** Validate RSI ranges, price values, contradictions
  - **Current:** Pass-through (no validation)

---

## Usage Examples

### Example 1: Compute Full Market Structure

```ts
import {
  computeRangeStructure,
  computeKeyLevels,
  computePriceZones,
  computeBias,
} from '@/lib/ai/heuristics';

const candles: OhlcCandle[] = [ /* ... */ ];

// Step 1: Range
const range = computeRangeStructure(candles, 24);
// { window_hours: 24, low: 42.5, high: 48.3, mid: 45.4 }

// Step 2: Key Levels
const levels = computeKeyLevels(candles, range, 5);
// [
//   { price: 48.3, type: ['resistance'], label: '24h High', strength: 'medium' },
//   { price: 42.5, type: ['support'], label: '24h Low', strength: 'medium' },
//   ...
// ]

// Step 3: Price Zones
const zones = computePriceZones(levels, range);
// [
//   { label: 'support', from: 41.65, to: 43.35, source_level: 42.5, ... },
//   { label: 'target_tp1', from: 47.33, to: 49.27, source_level: 48.3, ... },
//   ...
// ]

// Step 4: Bias
const bias = computeBias(candles, range);
// { bias: 'bullish', reason: 'Price above midrange (+3.2%)', ... }
```

---

### Example 2: Generate Playbook

```ts
import { generatePlaybookEntries } from '@/lib/ai/heuristics';

const playbook = generatePlaybookEntries({
  keyLevels: levels,
  zones: zones,
  bias: bias,
  range: range,
  currentPrice: 46.8,
});

// [
//   "If price breaks above $48.30 with volume → target $50.72",
//   "On pullback to $42.50 → look for long entry with tight stop",
//   "Stop loss: clean break below $41.65 → bias shifts bearish"
// ]
```

---

### Example 3: Volume Analysis

```ts
import {
  computeFlowVolumeSnapshot,
  analyzeVolumeProfile,
  detectVolumeSpikes,
} from '@/lib/ai/heuristics';

const flowVolume = computeFlowVolumeSnapshot(
  candles,
  1234567.89, // external 24h volume in USD
  1000000.00, // previous 24h volume
  'DexScreener'
);
// { vol_24h_usd: 1234567.89, vol_24h_delta_pct: 23.46, source: 'DexScreener' }

const profile = analyzeVolumeProfile(candles);
// 'accumulation' | 'distribution' | 'neutral'

const spikes = detectVolumeSpikes(candles, 2.0);
// [12, 34, 56] (indices of candles with >2x average volume)
```

---

## Algorithm Details

### Key Level Detection

**Swing High/Low Detection:**
```ts
for (let i = 1; i < candles.length - 1; i++) {
  const prev = candles[i - 1];
  const curr = candles[i];
  const next = candles[i + 1];
  
  // Swing high: curr.h > prev.h && curr.h > next.h
  // Swing low:  curr.l < prev.l && curr.l < next.l
}
```

**Clustering:**
- Tolerance: 0.5% of range high
- Nearby levels within tolerance are merged
- Strength increases with merges

**Round Numbers:**
- Psychologically significant levels
- E.g., $45.00, $50.00 for prices >$10
- E.g., $0.50, $1.00 for prices <$10

---

### Bias Calculation

**Logic:**
1. Last close vs midrange
   - >2% above mid → bullish
   - <-2% below mid → bearish
   - Otherwise → neutral

2. Pattern detection (last 5 candles)
   - Higher lows → reinforces bullish
   - Lower highs → reinforces bearish

**Reason String:**
- "Higher lows forming, price above midrange (+3.2%)"
- "Lower highs forming, price below midrange (-2.1%)"
- "Price near midrange (+0.5%), no clear pattern"

---

### Playbook Generation

**Bullish Bias Template:**
```
If price breaks above $X with volume → target $Y
On pullback to $Z → look for long entry with tight stop
If price rejects $X → watch for retrace to $W
Stop loss trigger: clean break below $V → bias shifts bearish
```

**Bearish Bias Template:**
```
If price breaks below $X → target $Y
On bounce to $Z → look for short entry or exit longs
Below $X → new low, bias remains bearish
Stop loss for shorts: clean break above $V → bias shifts bullish
```

**Neutral Bias Template:**
```
Range-bound between $X-$Y → fade extremes, take quick profits
Sell near $Y resistance, buy near $X support
Break above $Y → bullish breakout, target $Z
Break below $X → bearish breakdown, target $W
```

---

## Testing

### Unit Tests

**Location:** `__tests__/marketStructure.test.ts`, `__tests__/flowVolume.test.ts`, etc.

**Run:**
```bash
npm test -- src/lib/ai/heuristics
```

**Coverage Target:** 80%+

---

### Test Cases

**computeRangeStructure:**
- ✅ Empty candles → returns zero range
- ✅ Single candle → range = { h, l, mid }
- ✅ Multiple candles → correct high/low/mid

**computeKeyLevels:**
- ✅ No swings → returns empty array
- ✅ Swing highs detected → resistance levels
- ✅ Swing lows detected → support levels
- ✅ Round numbers added → correct labels

**computeBias:**
- ✅ Price > mid + 2% → bullish
- ✅ Price < mid - 2% → bearish
- ✅ Price near mid → neutral
- ✅ Higher lows detected → higher_lows = true

---

## Performance

### Benchmarks (1000 candles)

| Function                  | Time (ms) | Complexity |
|---------------------------|-----------|------------|
| `computeRangeStructure`   | ~1ms      | O(n)       |
| `computeKeyLevels`        | ~5ms      | O(n)       |
| `computePriceZones`       | ~1ms      | O(k)       |
| `computeBias`             | ~2ms      | O(n)       |
| `computeFlowVolumeSnapshot` | ~1ms    | O(n)       |
| **Total**                 | **~10ms** |            |

**Note:** All functions are pure (no side effects) and can be memoized.

---

## Future Enhancements

### Phase 2: Advanced Heuristics

1. **Fractal Swing Points**
   - Multi-timeframe swing detection
   - Bill Williams fractals

2. **Volume Profile**
   - Point of Control (POC)
   - Value Area High/Low (VAH/VAL)

3. **Order Flow Inference**
   - Absorption vs exhaustion
   - Imbalance zones
   - Liquidity sweeps

4. **Pattern Recognition**
   - Head & Shoulders, Double Top/Bottom
   - Triangles, Flags, Wedges
   - Harmonic patterns (Gartley, Butterfly)

---

## Related Files

- [buildAdvancedInsight.ts](../buildAdvancedInsight.ts) - Consumes heuristics
- [enrichMarketSnapshot.ts](../enrichMarketSnapshot.ts) - Orchestrator
- [analyze-market.ts](../../../api/ai/analyze-market.ts) - API endpoint
- [useAdvancedInsight.ts](../../hooks/useAdvancedInsight.ts) - Frontend hook

---

**Maintainer:** Claude 4.5 (Advanced Insight Backend Wiring Agent)

# Codex Handover Checklist

> **Generated:** 2025-11-15  
> **Context:** AI bundle integration and repository cleanup complete  
> **Target:** Codex (GitHub Copilot successor) for remaining coding tasks  
> **Status:** Ready for implementation

---

## Overview

This checklist contains remaining coding tasks after the AI bundle integration and repository cleanup. All tasks are **scoped for Codex** (implementation-focused, no architecture planning).

**Cleanup Complete:**
- ✅ AI types consolidated into `src/types/ai.ts`
- ✅ Bot score logic integrated into `src/lib/ai/heuristics/`
- ✅ Documentation moved to `docs/ai/`
- ✅ ZIP archives moved to `docs/archive/ai-bundles/`

**Your Mission:** Update imports, wire heuristics into pipelines, run validation.

---

## Priority Guide

- **P0** — Critical (Before Beta v0.9 release)
- **P1** — High (Post-Beta, Q1 2025)
- **P2** — Medium (Q1-Q2 2025)
- **P3** — Low (Future enhancements)

---

## P0 Tasks — Critical (Before Beta v0.9)

### Task 1: Update AI Type Imports (1-2 hours)

**Background:** Old imports reference `ai/types.ts` (now `ai/types-legacy.ts`). All code should import from `src/types/ai` or `src/types/index`.

**Files to Update:**
1. `ai/orchestrator.ts`
2. `ai/model_clients/grok.ts`
3. `ai/model_clients/openai.ts`
4. `api/ai/*.ts` (all AI API endpoints)
5. Any components using AI types

**Steps:**

```bash
# Step 1: Find all stale imports
rg "from ['\"]ai/types['\"]" src/ ai/ api/

# Step 2: For each file found, replace:
# OLD: import { Provider, MarketPayload } from 'ai/types';
# NEW: import { Provider, MarketPayload } from '@/types/ai';

# Or use barrel export:
# NEW: import type { Provider, MarketPayload } from '@/types';

# Step 3: Verify no stale imports remain
rg "from ['\"]ai/types['\"]" src/ ai/ api/
# Expected: No results

# Step 4: Type check
pnpm run typecheck
# Expected: Pass
```

**Acceptance Criteria:**
- ✅ No imports from `ai/types.ts` in codebase
- ✅ All AI types imported from `@/types/ai` or `@/types`
- ✅ `pnpm run typecheck` passes

---

### Task 2: Wire `computeBotScore` into Social Analysis (30 min - 1 hour)

**Background:** Bot score logic now available in `src/lib/ai/heuristics/botScore.ts`. Need to integrate into social analysis pipeline.

**File to Update:** `ai/orchestrator.ts` (or wherever social posts are processed)

**Steps:**

```typescript
// 1. Import bot score function
import { computeBotScore } from '@/lib/ai/heuristics';

// 2. In social analysis processing loop:
for (const post of socialPosts) {
  // Compute bot score for each post
  const bot_score = computeBotScore({
    author: {
      age_days: post.author.age_days,
      followers: post.author.followers,
      verified: post.author.verified,
    },
    post_frequency_per_day: post.post_frequency_per_day,
    repeated: post.repeated,
    source_type: post.source_type,
  });

  // Add to post assessment
  const assessment: SocialPostAssessment = {
    id: post.id,
    text_snippet: post.text.substring(0, 100),
    sentiment: /* ... */,
    bot_score, // <-- NEW
    botScore: bot_score, // Alias for backward compatibility
    isLikelyBot: bot_score > 0.7, // Threshold for bot classification
    weight: /* ... */,
    reason_flags: /* ... */,
  };
}

// 3. Update tests to verify bot_score is populated
```

**Acceptance Criteria:**
- ✅ `computeBotScore` called for each social post
- ✅ `bot_score` field populated in `SocialPostAssessment`
- ✅ Tests verify bot score computation
- ✅ No regressions in existing social analysis tests

**Test Command:**
```bash
pnpm test -- orchestrator
# Expected: All tests pass, bot_score present in results
```

---

### Task 3: Wire `sanityCheck` into Analysis Pipeline (30 min)

**Background:** Sanity check function available in `src/lib/ai/heuristics/sanity.ts`. Currently a placeholder (passes through bullets unchanged), but wiring is needed for future enhancements.

**File to Update:** `ai/orchestrator.ts` (after AI bullet generation)

**Steps:**

```typescript
// 1. Import sanity check
import { sanityCheck } from '@/lib/ai/heuristics';

// 2. After AI bullet generation:
const rawBullets = await aiModel.generateBullets(payload);

// Apply sanity check
const sanitizedBullets = sanityCheck(rawBullets, payload);

// 3. Return sanitized bullets in result
const result: BulletAnalysis = {
  provider: 'openai',
  model: 'gpt-4o-mini',
  bullets: sanitizedBullets, // <-- Use sanitized version
  source_trace: { /* ... */ },
  rawText: rawText,
  costUsd: estimatedCost,
};

// 4. Optionally log if bullets were modified
if (rawBullets.length !== sanitizedBullets.length) {
  console.warn('[Sanity] Modified bullets:', {
    before: rawBullets.length,
    after: sanitizedBullets.length,
  });
}
```

**Acceptance Criteria:**
- ✅ `sanityCheck` called after AI bullet generation
- ✅ Sanitized bullets used in final result
- ✅ No regressions in existing tests
- ✅ Logging added for sanity modifications (optional)

**Test Command:**
```bash
pnpm test -- orchestrator
# Expected: All tests pass
```

---

### Task 4: Run Full Validation Suite (15-30 min)

**Background:** After import updates and heuristic wiring, validate entire codebase.

**Steps:**

```bash
# 1. Type check
pnpm run typecheck
# Expected: Pass (no errors)

# 2. Linter
pnpm run lint
# Expected: Pass (pragmatic any allowed)

# 3. Unit tests
pnpm test
# Expected: All pass including new botScore tests

# 4. Build
pnpm run build
# Expected: Success, check bundle size

# 5. Bundle size check
pnpm run check:bundle-size
# Target: <400KB (currently ~428KB)

# 6. Optional: E2E tests
pnpm run test:e2e
# Expected: Critical flows pass (Journal, Market Analyze, Board)
```

**Acceptance Criteria:**
- ✅ All validation commands pass
- ✅ Bundle size ≤428KB (target <400KB for final release)
- ✅ No console errors in dev server

---

## P1 Tasks — High (Post-Beta, Q1 2025)

### Task 5: Implement Grok Social Analysis Endpoint (2-4 hours)

**Background:** Grok social analysis endpoint code exists in bundle archive (`docs/archive/ai-bundles/sparkfined_ai_patch_2025-11-13.zip`). Extract and integrate.

**Steps:**

```bash
# 1. Extract Grok endpoint from archive
cd docs/archive/ai-bundles
unzip -p sparkfined_ai_patch_2025-11-13.zip sparkfined_ai_patch/api/ai/social/grok.ts > /tmp/grok.ts

# 2. Copy to api/ai/social/
mkdir -p api/ai/social
cp /tmp/grok.ts api/ai/social/grok.ts

# 3. Update imports to use new type paths
# OLD: import type { SocialAnalysis } from 'ai/types';
# NEW: import type { SocialAnalysis } from '@/types/ai';

# 4. Add XAI_API_KEY to Vercel environment
# Vercel Dashboard → Project → Settings → Environment Variables
# Add: XAI_API_KEY = xai-...

# 5. Wire into orchestrator
# Update ai/orchestrator.ts to call /api/ai/social/grok when social analysis requested

# 6. Test with curl
curl -X POST http://localhost:5173/api/ai/social/grok \
  -H "Content-Type: application/json" \
  -d '{"query": "SOL", "mode": "newest", "limit": 10}'

# 7. Add tests
# Create api/ai/social/__tests__/grok.test.ts
```

**Acceptance Criteria:**
- ✅ Grok endpoint responds to POST requests
- ✅ Returns `SocialAnalysis` type
- ✅ Bot scores computed for each post
- ✅ Tests cover success and error cases
- ✅ Cost tracking logs Grok API usage

**Estimated Cost:** ~$0.01-0.05 per request (Grok pricing)

---

### Task 6: Create Event Catalog Types (1-2 hours)

**Background:** Full event catalog exists in bundle (`event_types.ts`). Create subset for Beta v0.9.

**Steps:**

```bash
# 1. Extract event types from archive
cd docs/archive/ai-bundles
unzip -p sparkfined_logic_bundle_2025-11-14.zip types/event_types.ts > /tmp/event_types.ts

# 2. Review and subset for Beta v0.9
# Focus on: AI events, market analysis, journal, board, watchlist
# Defer: Replay, learning, gamification, screenshot/OCR

# 3. Create src/types/events.ts
# Copy relevant types from /tmp/event_types.ts
# Keep 50-100 events for Beta (not all 88)

# 4. Update src/types/index.ts to re-export events
export type { AppEventId, EventPayloadMap } from './events';

# 5. Wire telemetry for key events
# Example: Track 'ui.market_snapshot.requested' in Market page
```

**Acceptance Criteria:**
- ✅ `src/types/events.ts` created with Beta v0.9 subset
- ✅ Re-exported from `src/types/index.ts`
- ✅ At least 3 critical events tracked in telemetry
- ✅ Type check passes

**Beta v0.9 Event Subset:**
- AI: `ai.orchestrator.*`, `ai.model.*`, `ai.sanity_check.*`
- UI: `ui.market_snapshot.*`, `ui.snapshot.*`, `ui.journal.*`
- Journal: `journal.entry.*`, `journal.reflect.*`
- Watchlist: `watchlist_add`, `watchlist_remove`, `watchlist_sort_change`
- Board: `dash_*` events

---

### Task 7: Add Telemetry for Cost Tracking (1-2 hours)

**Background:** AI orchestrator should log cost and latency for all AI calls.

**File to Update:** `ai/orchestrator.ts`

**Steps:**

```typescript
// 1. Import telemetry types
import type { TelemetryEvent } from '@/types/ai';

// 2. After each AI call, log telemetry
const telemetryEvent: TelemetryEvent = {
  timestamp: new Date().toISOString(),
  provider: 'openai', // or 'grok'
  model: 'gpt-4o-mini',
  latencyMs: endTime - startTime,
  success: true,
  costUsd: estimatedCost,
  payloadSize: JSON.stringify(payload).length,
  additional: {
    bullets_count: bullets.length,
    sampling_rate: samplingRate,
  },
};

// 3. Store telemetry (options):
// - IndexedDB (offline-capable)
// - POST to /api/telemetry (server-side logging)
// - Console log (dev mode only)

// 4. Add dashboard query
// Create src/hooks/useAiTelemetry.ts to fetch and display costs
```

**Acceptance Criteria:**
- ✅ Telemetry logged for every AI call
- ✅ Cost per request tracked
- ✅ Dashboard shows total daily AI cost
- ✅ Alerts if cost exceeds $100/day (safety limit)

---

## P2 Tasks — Medium (Q1-Q2 2025)

### Task 8: Enhance Sanity Check Logic (2-3 hours)

**Background:** Current `sanityCheck` is a placeholder. Implement validation rules.

**File to Update:** `src/lib/ai/heuristics/sanity.ts`

**Steps:**

```typescript
export function sanityCheck(
  bullets: SanityCheckInputBullets,
  payload?: SanityCheckInputPayload
): SanityCheckOutputBullets {
  const sanitized: string[] = [];
  const flags: string[] = [];

  for (const bullet of bullets) {
    let sanitizedBullet = bullet;

    // Rule 1: Validate RSI values (0-100)
    const rsiMatch = bullet.match(/RSI[:\s]+(\d+\.?\d*)/i);
    if (rsiMatch) {
      const rsiValue = parseFloat(rsiMatch[1]);
      if (rsiValue < 0 || rsiValue > 100) {
        flags.push(`Invalid RSI value: ${rsiValue}`);
        sanitizedBullet = bullet.replace(rsiMatch[0], 'RSI: [invalid]');
      }
    }

    // Rule 2: Validate percentage values (0-100%)
    const pctMatch = bullet.match(/(\d+\.?\d*)%/g);
    if (pctMatch) {
      for (const pct of pctMatch) {
        const value = parseFloat(pct);
        if (value < 0 || value > 100) {
          flags.push(`Suspicious percentage: ${value}%`);
        }
      }
    }

    // Rule 3: Check for contradictions
    if (bullet.toLowerCase().includes('bullish') && bullet.toLowerCase().includes('bearish')) {
      flags.push(`Contradiction detected: ${bullet}`);
    }

    sanitized.push(sanitizedBullet);
  }

  // Log flags if any
  if (flags.length > 0) {
    console.warn('[Sanity] Flags detected:', flags);
  }

  return sanitized;
}
```

**Acceptance Criteria:**
- ✅ RSI validation (0-100)
- ✅ Percentage validation (0-100%)
- ✅ Contradiction detection (bullish + bearish)
- ✅ Tests cover all validation rules
- ✅ Flags logged but don't block AI response

**Test Cases:**
```typescript
// Invalid RSI
sanityCheck(['RSI: 150'], payload); // Should flag

// Suspicious percentage
sanityCheck(['Token up 300%'], payload); // Should flag

// Contradiction
sanityCheck(['Bullish bias but bearish trend'], payload); // Should flag
```

---

### Task 9: Build Advanced Insight Card UI (4-6 hours)

**Background:** Types for `AdvancedInsightCard` exist in `src/types/ai.ts`. Build UI for L1-L3 analysis (structure, flow, tactical zones).

**Files to Create:**
1. `src/components/ai/AdvancedInsightCard.tsx`
2. `src/components/ai/EditableField.tsx`
3. `src/hooks/useAdvancedInsight.ts`

**Steps:**

```typescript
// 1. Create AdvancedInsightCard component
// Display L1 (structure), L2 (flow), L3 (tactical zones)
// Allow user overrides via EditableField

// 2. Wire into Market Analyze page
// Show toggle: "Basic Snapshot" vs "Advanced Insight"

// 3. Token gate: Check access tier
// If tier === 'free', show "Unlock Advanced Insight" prompt

// 4. Persist user overrides to IndexedDB
// Save edits for future reference
```

**Acceptance Criteria:**
- ✅ L1-L3 sections displayed in card
- ✅ User can override auto_value fields
- ✅ Token gating enforced (free tier blocked)
- ✅ Edits persisted to IndexedDB
- ✅ UI matches dark-mode design system

---

### Task 10: Implement L4-L5 Analysis Layers (6-8 hours)

**Background:** L4 (Macro) and L5 (Indicators) types defined but not implemented.

**L4 — Macro Lens:**
- Extract macro levels from narrative (42k, 45k, 68k)
- Tag events (halving, ETF approval, etc.)
- Display in Advanced Insight Card

**L5 — Indicator Status:**
- OCR screenshot for indicator panels
- Extract RSI, Bollinger Bands status
- Display in Advanced Insight Card

**Deferred to Q2 2025** (complex, requires chart image analysis).

---

## P3 Tasks — Low (Future Enhancements)

### Task 11: Journal Wallet Learning Integration (8-10 hours)

**Background:** Types for `WalletTransactionLog`, `TradeEntry`, `LearningMetric` exist. Build auto-logging and learning features.

**Scope:** Q2 2025 roadmap.

---

### Task 12: Gamification (Badges, Streaks) (4-6 hours)

**Background:** Types for `Badge`, `GamificationState` exist.

**Scope:** Q2 2025 roadmap.

---

### Task 13: Screenshot OCR & CA Resolve (6-8 hours)

**Background:** Types for `ScreenshotMeta`, `OcrResult`, `CaResolveResult` exist.

**Scope:** Q2 2025 roadmap.

---

## Validation Commands (Run After Each Task)

```bash
# Quick validation
pnpm run typecheck && pnpm run lint && pnpm test

# Full validation
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
pnpm run check:bundle-size

# Optional: E2E tests
pnpm run test:e2e
```

---

## Resources

- **AI Types:** `src/types/ai.ts`
- **Heuristics:** `src/lib/ai/heuristics/`
- **AI Docs:** `docs/ai/`
- **Bundle Archives:** `docs/archive/ai-bundles/`
- **Cleanup Summary:** `REPO_CLEANUP_SUMMARY.md`
- **Decisions:** `REPO_CLEANUP_DECISIONS.md`

---

## Notes for Codex

**Your Strengths:**
- ✅ Fast import updates (Task 1)
- ✅ Wiring logic into pipelines (Tasks 2-3)
- ✅ Implementing validation rules (Task 8)
- ✅ Building UI components from types (Task 9)

**Defer to Claude Code or Human:**
- ❌ Architecture decisions (already made, see DECISIONS.md)
- ❌ Complex refactoring (use Claude Code)
- ❌ Multi-file large-scale changes (use Claude Code)

**Workflow:**
1. Start with P0 tasks (critical for Beta v0.9)
2. Test after each task (validation commands above)
3. Commit after each task (clear commit messages)
4. Move to P1 tasks after Beta release

---

**Status:** ✅ Checklist Complete  
**Ready for Implementation:** ✅ Yes  
**Estimated Total Time:** 10-15 hours for P0-P1 tasks

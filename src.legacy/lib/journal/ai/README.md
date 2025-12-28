# Journal AI Insights (Loop J3-A)

Core infrastructure for AI-powered behavioral pattern detection in journal entries.

## Overview

This module analyzes multiple journal entries to identify:
- **Behavioral loops** (repeated mistakes, patterns)
- **Timing patterns** (performance by time of day)
- **Risk management** issues (position sizing, stop-loss discipline)
- **Setup discipline** (adherence to trading setups)
- **Emotional patterns** (emotion-driven decisions)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│ UI Layer (Loop J3-B/C, future)                          │
├─────────────────────────────────────────────────────────┤
│ Service Layer (journal-insights-service.ts)             │
│ - getJournalInsightsForEntries()                        │
│ - Orchestrates AI calls                                 │
│ - Parses and validates responses                        │
├─────────────────────────────────────────────────────────┤
│ Prompt Layer (journal-insights-prompt.ts)               │
│ - buildJournalInsightsPrompt()                          │
│ - Serializes entries for AI                             │
├─────────────────────────────────────────────────────────┤
│ AI Client (reuses existing OpenAI/Grok infrastructure)  │
└─────────────────────────────────────────────────────────┘
```

## Usage

### Generate Insights

```typescript
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import type { JournalEntry } from '@/types/journal'

// Get entries (from IndexedDB, Zustand, etc.)
const entries: JournalEntry[] = await getRecentEntries(20)

// Generate insights
const result = await getJournalInsightsForEntries({
  entries,
  maxEntries: 20,
  focusCategories: ['BEHAVIOR_LOOP', 'TIMING'], // Optional
})

// Use insights
result.insights.forEach((insight) => {
  console.log(`[${insight.severity}] ${insight.title}`)
  console.log(`Summary: ${insight.summary}`)
  console.log(`Recommendation: ${insight.recommendation}`)
  console.log(`Evidence: ${insight.evidenceEntries.length} entries`)
})
```

### Build Custom Prompts

```typescript
import { buildJournalInsightsPrompt } from '@/lib/journal/ai'

const { system, user } = buildJournalInsightsPrompt({
  entries,
  maxEntries: 15,
  focusCategories: ['RISK_MANAGEMENT'],
})

// Use with custom AI client
const customResult = await myAIClient.complete(system, user)
```

## Types

### JournalInsight

```typescript
interface JournalInsight {
  id: string                      // Stable hash (category + title)
  category: JournalInsightCategory
  severity: JournalInsightSeverity
  title: string                   // Short label
  summary: string                 // 1–2 sentences
  recommendation: string          // Actionable advice
  evidenceEntries: string[]       // Entry IDs
  confidence?: number             // 0–100
  detectedAt?: number             // Unix timestamp
}
```

### Categories

- `BEHAVIOR_LOOP` — Repeated patterns
- `TIMING` — Time-based patterns
- `RISK_MANAGEMENT` — Position sizing, stop-loss
- `SETUP_DISCIPLINE` — Setup adherence
- `EMOTIONAL_PATTERN` — Emotion-driven decisions
- `OTHER` — Uncategorized

### Severity

- `INFO` — Neutral observation
- `WARNING` — Needs attention
- `CRITICAL` — Urgent issue

## Configuration

Environment variables:
- `OPENAI_API_KEY` — Required for AI calls
- `DEFAULT_UI_MODEL` — Optional, defaults to `gpt-4o-mini`

## Testing

```bash
# Run unit tests
pnpm test tests/unit/journal.journal-insights-prompt.test.ts
pnpm test tests/unit/journal.journal-insights-service.test.ts
```

Tests use mocked AI responses (no real API calls).

## Cost Management

- Default model: `gpt-4o-mini` (~$0.15/1M tokens)
- Estimated cost per analysis: $0.01–0.05 (20 entries)
- Max tokens: 1500 (configurable)

## Future Enhancements (Loop J3-B/C)

- [ ] UI integration (insight cards, coaching dashboard)
- [ ] Persistence (store insights in IndexedDB)
- [ ] Telemetry (track insight generation, user interactions)
- [ ] Multi-provider support (add Grok for crypto-specific insights)
- [ ] Caching (avoid re-analyzing same entries)
- [ ] Batch processing (background job for all users)

## Related Files

- `/workspace/src/types/journalInsights.ts` — Type definitions
- `/workspace/tests/unit/journal.journal-insights-*.test.ts` — Tests
- `/workspace/ai/model_clients/openai_client.ts` — AI client
- `/workspace/LOOP_J3_PLAN.md` — Full loop plan (if exists)

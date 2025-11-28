# Loop J3-A: Journal AI Insight Core — Integration Example

## Overview

This document shows how to integrate the Journal AI Insight Core into the Sparkfined PWA.

Loop J3-A provides:
- Types for behavioral insights
- Prompt builder for AI analysis
- Service for generating insights
- Unit tests (no UI yet)

## Core Components Created

### 1. Types (`src/types/journalInsights.ts`)

```typescript
import type { 
  JournalInsight, 
  JournalInsightCategory, 
  JournalInsightSeverity,
  JournalInsightResult 
} from '@/types/journalInsights'
```

### 2. Prompt Builder (`src/lib/journal/ai/journal-insights-prompt.ts`)

```typescript
import { buildJournalInsightsPrompt } from '@/lib/journal/ai'

const { system, user } = buildJournalInsightsPrompt({
  entries: myEntries,
  maxEntries: 20,
  focusCategories: ['BEHAVIOR_LOOP', 'TIMING'],
})
```

### 3. Service (`src/lib/journal/ai/journal-insights-service.ts`)

```typescript
import { getJournalInsightsForEntries } from '@/lib/journal/ai'

const result = await getJournalInsightsForEntries({
  entries: myEntries,
  maxEntries: 20,
})
```

## Integration Patterns (for Loop J3-B/C)

### Pattern 1: On-Demand Analysis

```typescript
// In a page or component
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import { useJournalStore } from '@/store/journalStore' // Hypothetical

export function JournalInsightsButton() {
  const [insights, setInsights] = useState<JournalInsight[]>([])
  const [loading, setLoading] = useState(false)
  const entries = useJournalStore((state) => state.entries)

  const handleAnalyze = async () => {
    setLoading(true)
    try {
      const result = await getJournalInsightsForEntries({
        entries: entries.slice(-20), // Last 20 entries
      })
      setInsights(result.insights)
    } catch (error) {
      console.error('Failed to generate insights:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button onClick={handleAnalyze} disabled={loading}>
        {loading ? 'Analyzing...' : 'Generate Insights'}
      </button>
      {insights.map((insight) => (
        <InsightCard key={insight.id} insight={insight} />
      ))}
    </div>
  )
}
```

### Pattern 2: Background Processing

```typescript
// In a background worker or cron job
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import { db } from '@/lib/db' // Dexie

export async function generateInsightsForUser(userId: string) {
  // Get recent entries
  const entries = await db.journalEntries
    .where('walletAddress')
    .equals(userId)
    .reverse()
    .limit(30)
    .toArray()

  if (entries.length < 5) {
    console.log('Not enough entries for insights')
    return
  }

  // Generate insights
  const result = await getJournalInsightsForEntries({ entries })

  // Store in IndexedDB
  await db.journalInsights.bulkPut(
    result.insights.map((insight) => ({
      ...insight,
      userId,
      generatedAt: result.generatedAt,
    }))
  )

  console.log(`Generated ${result.insights.length} insights for ${userId}`)
}
```

### Pattern 3: Incremental Updates

```typescript
// Re-generate insights when new entries are added
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import { db } from '@/lib/db'

export async function onNewJournalEntry(entry: JournalEntry) {
  // Save entry
  await db.journalEntries.put(entry)

  // Check if we should re-generate insights
  const entryCount = await db.journalEntries.count()
  
  // Regenerate every 5 entries
  if (entryCount % 5 === 0) {
    const recentEntries = await db.journalEntries
      .reverse()
      .limit(20)
      .toArray()

    const result = await getJournalInsightsForEntries({
      entries: recentEntries,
    })

    // Update insights in DB
    await db.journalInsights.clear()
    await db.journalInsights.bulkPut(result.insights)
  }
}
```

## UI Patterns (for Loop J3-B/C)

### Insight Card Component

```tsx
import type { JournalInsight } from '@/types/journalInsights'

interface InsightCardProps {
  insight: JournalInsight
}

export function InsightCard({ insight }: InsightCardProps) {
  const severityColors = {
    INFO: 'bg-blue-500',
    WARNING: 'bg-yellow-500',
    CRITICAL: 'bg-red-500',
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-800 p-4">
      <div className="flex items-start gap-3">
        <div className={`h-2 w-2 mt-1 rounded-full ${severityColors[insight.severity]}`} />
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{insight.title}</h3>
          <p className="text-sm text-gray-400 mt-1">{insight.summary}</p>
          <div className="mt-3 rounded bg-gray-900 p-3">
            <p className="text-xs text-blue-400 font-medium mb-1">Empfehlung:</p>
            <p className="text-sm">{insight.recommendation}</p>
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
            <span>{insight.category}</span>
            <span>·</span>
            <span>{insight.evidenceEntries.length} Einträge</span>
            {insight.confidence && (
              <>
                <span>·</span>
                <span>{insight.confidence}% Confidence</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Insights Dashboard Section

```tsx
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import type { JournalInsight } from '@/types/journalInsights'

export function JournalInsightsDashboard() {
  const [insights, setInsights] = useState<JournalInsight[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInsights()
  }, [])

  const loadInsights = async () => {
    // Load from cache first (IndexedDB)
    const cachedInsights = await db.journalInsights.toArray()
    
    if (cachedInsights.length > 0) {
      setInsights(cachedInsights)
      setLoading(false)
      return
    }

    // Generate fresh insights
    const entries = await db.journalEntries.reverse().limit(20).toArray()
    const result = await getJournalInsightsForEntries({ entries })
    setInsights(result.insights)
    setLoading(false)
  }

  if (loading) return <Spinner />

  if (insights.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        Noch nicht genug Daten für Insights. Füge mindestens 5 Journal-Einträge hinzu.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Deine Patterns & Coaching</h2>
      <div className="grid gap-4">
        {insights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>
    </div>
  )
}
```

## Cost Management

```typescript
// Estimated cost per analysis
const COST_PER_ANALYSIS = 0.03 // ~$0.03 for 20 entries with gpt-4o-mini

// Throttle insights generation
let lastAnalysisTime = 0
const MIN_ANALYSIS_INTERVAL = 5 * 60 * 1000 // 5 minutes

export async function generateInsightsThrottled(entries: JournalEntry[]) {
  const now = Date.now()
  
  if (now - lastAnalysisTime < MIN_ANALYSIS_INTERVAL) {
    throw new Error('Please wait before generating new insights')
  }

  lastAnalysisTime = now
  return await getJournalInsightsForEntries({ entries })
}
```

## Telemetry

```typescript
import { trackEvent } from '@/lib/telemetry'

export async function generateAndTrackInsights(entries: JournalEntry[]) {
  const startTime = Date.now()

  const result = await getJournalInsightsForEntries({ entries })

  // Track telemetry
  trackEvent({
    kind: 'journal',
    payload: {
      schemaVersion: 1,
      eventType: 'insights_generated',
      entryCount: entries.length,
      insightCount: result.insights.length,
      latencyMs: Date.now() - startTime,
      costUsd: result.costUsd,
      model: result.modelUsed,
    },
  })

  return result
}
```

## Next Steps (Loop J3-B/C)

1. **UI Integration**
   - Create InsightCard component
   - Add insights section to Journal page
   - Add "Analyze" button

2. **Persistence**
   - Add `journalInsights` table to Dexie schema
   - Cache insights locally
   - Implement cache invalidation

3. **Telemetry**
   - Track insight generation events
   - Track user interactions (expand, dismiss)
   - Track evidence entry clicks

4. **Polish**
   - Add loading states
   - Add error boundaries
   - Add empty states
   - Add refresh button

5. **Advanced Features**
   - Multi-provider support (Grok for crypto-specific insights)
   - Insight filtering (by category, severity)
   - Insight history (track changes over time)
   - Coaching dashboard (aggregate insights, progress tracking)

## Testing Checklist

- [x] Unit tests for prompt builder
- [x] Unit tests for AI service (mocked)
- [ ] Integration tests (with real IndexedDB)
- [ ] E2E tests (Playwright, full user flow)
- [ ] Manual testing (smoke test with real entries)

## Related Documents

- `/workspace/src/lib/journal/ai/README.md` — Module documentation
- `/workspace/docs/LOOP_J3_PLAN.md` — Full loop plan (if exists)
- `/workspace/AGENT_FILES/CLAUDE.md` — Claude Code rules

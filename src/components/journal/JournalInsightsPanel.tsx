import React, { useState, useEffect, useMemo } from 'react'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { JournalInsightCard } from '@/components/journal/JournalInsightCard'
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import { 
  buildAnalysisKey, 
  saveInsightsForAnalysisKey, 
  loadLatestInsightsForAnalysisKey,
  recordToInsight 
} from '@/lib/journal/journal-insights-store'
import { sendJournalInsightsGeneratedEvent } from '@/lib/journal/journal-insights-telemetry'
import type { JournalEntry as StoreJournalEntry } from '@/store/journalStore'
import type { JournalEntry as DomainJournalEntry } from '@/types/journal'
import type { JournalInsight } from '@/types/journalInsights'

const FALLBACK_TICKER = 'MANUAL'
const FALLBACK_ADDRESS = 'manual-entry'
const FALLBACK_SETUP: DomainJournalEntry['setup'] = 'custom'
const FALLBACK_EMOTION: DomainJournalEntry['emotion'] = 'custom'
const FALLBACK_STATUS: DomainJournalEntry['status'] = 'active'

function parseStoreDateToTimestamp(date?: string): number {
  if (!date) {
    return Date.now()
  }
  const sanitized = date.replace(/·/g, ' ')
  const parsed = Date.parse(sanitized)
  return Number.isNaN(parsed) ? Date.now() : parsed
}

function deriveTicker(entry: StoreJournalEntry): string {
  if (entry.tags?.length) {
    return entry.tags[0]?.toUpperCase() ?? FALLBACK_TICKER
  }
  const firstToken = entry.title?.trim().split(/\s+/)[0]
  if (firstToken) {
    const sanitized = firstToken.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
    if (sanitized) {
      return sanitized.slice(0, 12)
    }
  }
  return FALLBACK_TICKER
}

function mapStoreEntryToDomain(entry: StoreJournalEntry): DomainJournalEntry {
  const timestamp = parseStoreDateToTimestamp(entry.date)
  // Best-effort mapping: fallback defaults preserve type safety when store data is sparse.
  return {
    id: entry.id,
    timestamp,
    ticker: deriveTicker(entry),
    address: FALLBACK_ADDRESS,
    setup: FALLBACK_SETUP,
    emotion: FALLBACK_EMOTION,
    customTags: entry.tags,
    thesis: entry.notes,
    grokContext: undefined,
    chartSnapshot: undefined,
    outcome: undefined,
    status: FALLBACK_STATUS,
    createdAt: timestamp,
    updatedAt: timestamp,
    markedActiveAt: undefined,
    replaySessionId: undefined,
    walletAddress: undefined,
    journeyMeta: entry.journeyMeta,
  }
}

interface JournalInsightsPanelProps {
  entries: StoreJournalEntry[]
  maxEntries?: number
}

export function JournalInsightsPanel({ entries, maxEntries = 20 }: JournalInsightsPanelProps) {
  const [insights, setInsights] = useState<JournalInsight[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCachedInsights, setHasCachedInsights] = useState(false)

  // Convert store entries to domain entries
  const domainEntries = useMemo(
    () => entries.map(mapStoreEntryToDomain),
    [entries]
  )

  // Calculate analysis key for caching
  const analysisKey = useMemo(
    () => buildAnalysisKey(domainEntries.slice(-maxEntries), maxEntries),
    [domainEntries, maxEntries]
  )

  // Load cached insights on mount or when analysisKey changes
  useEffect(() => {
    let cancelled = false

    async function loadCached() {
      if (!domainEntries.length) return

      try {
        const cached = await loadLatestInsightsForAnalysisKey(analysisKey)
        if (cancelled) return

        if (cached && cached.length > 0) {
          const restored = cached.map(recordToInsight)
          setInsights(restored)
          setHasCachedInsights(true)
          setError(null)
        } else {
          setHasCachedInsights(false)
        }
      } catch (err) {
        console.warn('[JournalInsightsPanel] Failed to load cached insights', err)
        // Don't show error to user - just skip cache
        setHasCachedInsights(false)
      }
    }

    void loadCached()

    return () => {
      cancelled = true
    }
  }, [analysisKey, domainEntries.length])

  const handleGenerateInsights = async () => {
    if (!entries.length) {
      setInsights([])
      setError('No journal entries available for analysis.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const recentDomainEntries = domainEntries.slice(-maxEntries)
      const result = await getJournalInsightsForEntries({
        entries: recentDomainEntries,
        maxEntries,
      })
      
      setInsights(result.insights)
      setHasCachedInsights(true)

      if (result.insights.length > 0) {
        // Save to cache
        await saveInsightsForAnalysisKey(analysisKey, result)
        
        // Send telemetry (fire-and-forget)
        void sendJournalInsightsGeneratedEvent(analysisKey, result)
      } else {
        setError('No meaningful patterns detected yet—log a few more trades.')
      }
    } catch (err) {
      console.warn('[JournalInsightsPanel] Failed to generate insights', err)
      setError('Could not generate insights. Please try again.')
      setInsights(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="space-y-4 rounded-2xl border border-border bg-surface/70 p-4 backdrop-blur"
      data-testid="journal-insights-panel"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-text-tertiary">
            <Badge variant="outline" className="text-[11px]">
              AI Insights
            </Badge>
            <span className="text-text-tertiary">Loop J3 · Behavioral Patterns</span>
          </div>
          <p className="text-sm text-text-secondary">
            Analyze your last {Math.min(entries.length, maxEntries)} trades for loops, timing leaks, and mindset drifts.
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerateInsights}
          isLoading={loading}
          data-testid="journal-insights-generate-button"
        >
          {hasCachedInsights ? 'Regenerate Insights' : 'Generate Insights'}
        </Button>
      </div>

      {error && !loading && <p className="text-sm text-warn">{error}</p>}
      {loading && <p className="text-sm text-text-tertiary">Generating insights…</p>}

      {insights && insights.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {insights.map((insight) => (
            <JournalInsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      {insights && insights.length === 0 && !loading && !error && (
        <p className="text-sm text-text-secondary">
          No insights yet. Add more entries or adjust your notes for richer analysis.
        </p>
      )}
    </section>
  )
}

export default JournalInsightsPanel

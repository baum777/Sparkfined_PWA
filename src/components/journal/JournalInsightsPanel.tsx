import React, { useEffect, useMemo, useState } from 'react'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { JournalInsightCard } from '@/components/journal/JournalInsightCard'
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import {
  buildAnalysisKey,
  loadLatestInsightsForAnalysisKey,
  mapRecordToJournalInsight,
  saveInsightsForAnalysisKey,
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

  const domainEntries = useMemo(
    () => entries.map(mapStoreEntryToDomain),
    [entries]
  )
  const recentEntries = useMemo(
    () => domainEntries.slice(-maxEntries),
    [domainEntries, maxEntries]
  )
  const analysisKey = useMemo(() => {
    if (!recentEntries.length) {
      return null
    }
    return buildAnalysisKey(recentEntries, maxEntries)
  }, [recentEntries, maxEntries])

  useEffect(() => {
    if (!analysisKey) {
      setInsights(null)
      setError(null)
      return
    }

    setInsights(null)
    setError(null)
    let cancelled = false

    async function hydrateFromCache() {
      const cached = await loadLatestInsightsForAnalysisKey(analysisKey)
      if (cancelled) return

      if (cached && cached.length) {
        setInsights(cached.map(mapRecordToJournalInsight))
        setError(null)
      } else {
        setInsights(null)
      }
    }

    void hydrateFromCache()

    return () => {
      cancelled = true
    }
  }, [analysisKey])

  const handleGenerateInsights = async () => {
    if (!recentEntries.length) {
      setInsights([])
      setError('No journal entries available for analysis.')
      return
    }
    if (!analysisKey) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await getJournalInsightsForEntries({
        entries: recentEntries,
        maxEntries,
      })
      setInsights(result.insights)

      if (!result.insights.length) {
        setError('No meaningful patterns detected yet—log a few more trades.')
        return
      }

      const journeyPhase = recentEntries[recentEntries.length - 1]?.journeyMeta?.phase
      void saveInsightsForAnalysisKey(analysisKey, result, {
        journeyPhase,
      })
      void sendJournalInsightsGeneratedEvent(analysisKey, result)
    } catch (err) {
      console.warn('[JournalInsightsPanel] Failed to generate insights', err)
      setError('Could not generate insights. Please try again.')
      setInsights(null)
    } finally {
      setLoading(false)
    }
  }

  const buttonLabel =
    insights && insights.length > 0 ? 'Regenerate Insights' : 'Generate Insights'

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
          {buttonLabel}
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

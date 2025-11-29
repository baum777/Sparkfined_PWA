import React, { useState, useEffect, useMemo } from 'react'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { JournalInsightCard } from '@/components/journal/JournalInsightCard'
import { JournalSocialPreview } from '@/components/journal/JournalSocialPreview'
import { getJournalInsightsForEntries } from '@/lib/journal/ai'
import { mapStoreEntriesToDomain } from '@/lib/journal/journal-mapping'
import { 
  buildAnalysisKey, 
  saveInsightsForAnalysisKey, 
  loadLatestInsightsForAnalysisKey,
  recordToInsight 
} from '@/lib/journal/journal-insights-store'
import { sendJournalInsightsGeneratedEvent } from '@/lib/journal/journal-insights-telemetry'
import { computeSocialStatsFromInsights } from '@/lib/journal/journal-social-analytics'
import type { JournalEntry as StoreJournalEntry } from '@/store/journalStore'
import type { JournalInsight } from '@/types/journalInsights'

interface JournalInsightsPanelProps {
  entries: StoreJournalEntry[]
  maxEntries?: number
}

const NO_INSIGHTS_MESSAGE = 'No meaningful patterns detected yet—log a few more trades.'
const INSIGHT_ENTRY_CAP = 50

export function JournalInsightsPanel({ entries, maxEntries = 20 }: JournalInsightsPanelProps) {
  const cappedMaxEntries = Math.min(maxEntries, INSIGHT_ENTRY_CAP)
  const [insights, setInsights] = useState<JournalInsight[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasCachedInsights, setHasCachedInsights] = useState(false)
  const [cacheNotice, setCacheNotice] = useState<string | null>(null)
  const socialSnapshot = useMemo(
    () => (insights && insights.length > 0 ? computeSocialStatsFromInsights(insights) : null),
    [insights]
  )

  // Convert store entries to domain entries
  const domainEntries = useMemo(
    () => mapStoreEntriesToDomain(entries),
    [entries]
  )

  // Calculate analysis key for caching
  const analysisKey = useMemo(
    () => buildAnalysisKey(domainEntries.slice(-cappedMaxEntries), cappedMaxEntries),
    [domainEntries, cappedMaxEntries]
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
          setCacheNotice(null)
        } else {
          setHasCachedInsights(false)
          setCacheNotice(null)
        }
      } catch (err) {
        console.warn('[JournalInsightsPanel] Failed to load cached insights', err)
        setHasCachedInsights(false)
        setCacheNotice('Local insight cache is currently unavailable. Regenerate to fetch fresh insights.')
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
    setCacheNotice(null)

    try {
      const recentDomainEntries = domainEntries.slice(-cappedMaxEntries)
      const result = await getJournalInsightsForEntries({
        entries: recentDomainEntries,
        maxEntries: cappedMaxEntries,
      })
      
      const nextInsights = result.insights ?? []
      const hasInsights = nextInsights.length > 0
      setInsights(nextInsights)
      setHasCachedInsights(hasInsights)
      setCacheNotice(null)

      if (hasInsights) {
        // Save to cache
        await saveInsightsForAnalysisKey(analysisKey, result)
        
        // Send telemetry (fire-and-forget)
        void sendJournalInsightsGeneratedEvent(analysisKey, result)
      } else {
        // Surface empty state guidance without treating it as an error
        setError(null)
      }
    } catch (err) {
      console.warn('[JournalInsightsPanel] Failed to generate insights', err)
      setError('Unable to generate insights right now. Check your network and try again shortly.')
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
            Analyze your last {Math.min(entries.length, cappedMaxEntries)} trades for loops, timing leaks, and mindset drifts.
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

      {cacheNotice && !loading && (
        <p className="text-xs text-text-tertiary" data-testid="journal-insights-cache-notice">
          {cacheNotice}
        </p>
      )}
      {error && !loading && <p className="text-sm text-warn">{error}</p>}
      {loading && <p className="text-sm text-text-tertiary">Generating insights…</p>}

      {insights && insights.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {insights.map((insight) => (
              <JournalInsightCard key={insight.id} insight={insight} />
            ))}
          </div>

          {socialSnapshot && <JournalSocialPreview snapshot={socialSnapshot} />}
        </>
      )}

      {insights && insights.length === 0 && !loading && !error && (
        <p className="text-sm text-text-secondary">
          {NO_INSIGHTS_MESSAGE}
        </p>
      )}
    </section>
  )
}

export default JournalInsightsPanel

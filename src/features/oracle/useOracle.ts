import { useEffect, useMemo, useState } from 'react'
import { Telemetry } from '@/lib/TelemetryService'
import { useGamificationStore } from '@/store/gamificationStore'
import { useOracleStore } from '@/store/oracleStore'
import type { OracleReport } from '@/types/oracle'
import type { OracleFilter, OracleInsight } from './types'

function reportToInsight(report: OracleReport): OracleInsight {
  const title = `${report.score}/7 → ${report.topTheme}`
  const content = report.fullReport ?? ''

  // Simple, deterministic extraction (no AI). We avoid inventing semantics:
  // - `summary`: first ~160 chars (collapsed whitespace)
  // - `takeaway`: first non-empty line (or fallback)
  const compact = content.replace(/\s+/g, ' ').trim()
  const summary = compact.length > 0 ? `${compact.slice(0, 160)}${compact.length > 160 ? '…' : ''}` : 'No report content yet.'

  const firstLine = content
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0)

  const takeaway = firstLine ?? `Top theme: ${report.topTheme} (${report.score}/7)`

  return {
    id: report.date,
    title,
    summary,
    takeaway,
    theme: report.topTheme,
    content,
    isRead: report.read,
    date: report.date,
    score: report.score,
  }
}

function uniqueByDate(reports: OracleReport[]): OracleReport[] {
  const seen = new Set<string>()
  const out: OracleReport[] = []
  for (const r of reports) {
    if (seen.has(r.date)) continue
    seen.add(r.date)
    out.push(r)
  }
  return out
}

/**
 * Loveable-style Oracle hook backed by Sparkfined `useOracleStore` (protected).
 *
 * IMPORTANT:
 * - Does not use any Loveable business hooks/stores.
 * - Only uses existing Sparkfined Oracle actions (refresh + mark today's as read).
 * - Telemetry event names must match existing ledger (no new names).
 */
export function useOracle() {
  const todayReport = useOracleStore((s) => s.todayReport)
  const reports = useOracleStore((s) => s.reports)
  const isLoading = useOracleStore((s) => s.isLoading)
  const error = useOracleStore((s) => s.error)
  const lastFetchTimestamp = useOracleStore((s) => s.lastFetchTimestamp)
  const loadTodayReport = useOracleStore((s) => s.loadTodayReport)
  const loadHistory = useOracleStore((s) => s.loadHistory)
  const markTodayAsRead = useOracleStore((s) => s.markTodayAsRead)

  const readingStreak = useGamificationStore((s) => s.streaks.oracle)

  const [filter, setFilterState] = useState<OracleFilter>('all')

  // Load today's report and history on mount (same semantics as the legacy OraclePage).
  useEffect(() => {
    let isMounted = true
    const load = async () => {
      if (!isMounted) return
      await Promise.all([loadTodayReport(), loadHistory(30)])
    }
    void load()
    return () => {
      isMounted = false
    }
  }, [loadTodayReport, loadHistory])

  const setFilter = (next: OracleFilter) => {
    setFilterState(next)
    Telemetry.log('ui.oracle.filter_changed', 1, { filter: next })
  }

  const allInsights = useMemo(() => {
    const combined = uniqueByDate([
      ...(todayReport ? [todayReport] : []),
      ...reports,
    ])

    // Newest first (match existing history list ordering)
    combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return combined.map(reportToInsight)
  }, [todayReport, reports])

  const insights = useMemo(() => {
    if (filter === 'all') return allInsights
    if (filter === 'new') return allInsights.filter((i) => !i.isRead)
    return allInsights.filter((i) => i.isRead)
  }, [allInsights, filter])

  const counts = useMemo(() => {
    const all = allInsights.length
    const read = allInsights.filter((i) => i.isRead).length
    const nextNew = allInsights.filter((i) => !i.isRead).length
    return { all, new: nextNew, read }
  }, [allInsights])

  const todayInsight = useMemo(() => {
    if (!todayReport) return null
    return reportToInsight(todayReport)
  }, [todayReport])

  const markAsRead = async (id: string) => {
    // Sparkfined only supports "mark today as read" as a first-class action.
    if (!todayReport) return
    if (todayReport.date !== id) return
    await markTodayAsRead()
  }

  const refresh = async () => {
    await loadTodayReport({ forceRefresh: true })
  }

  return {
    insights,
    filter,
    setFilter,
    counts,
    todayInsight,
    readingStreak,
    markAsRead,
    refresh,
    // Keep legacy state exposed for existing UI blocks (history/chart/theme filter)
    isLoading,
    error,
    lastFetchTimestamp,
    reports,
    todayReport,
  }
}


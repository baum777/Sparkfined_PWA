/**
 * LessonsPage - Trading Lessons Library
 *
 * Displays extracted lessons from trade outcomes:
 * - Top lessons by confidence score
 * - Pattern-based filtering
 * - Win rate & sample size stats
 * - Detailed lesson view with DOs/DONTs
 */

import React, { useMemo, useState } from "react"
import DashboardShell from "@/components/dashboard/DashboardShell"
import { BookOpen } from "@/lib/icons"
import { useLessons } from "@/hooks/useSignals"
import LessonCard from "@/components/signals/LessonCard"
import StateView from "@/components/ui/StateView"
import Button from "@/components/ui/Button"

export default function LessonsPage() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [minScore, setMinScore] = useState(0.5)

  const { lessons, loading, error } = useLessons()

  const filteredLessons = useMemo(
    () =>
      lessons.filter(
        (lesson) =>
          lesson.score >= minScore && (selectedPattern === null || lesson.pattern === selectedPattern),
      ),
    [lessons, minScore, selectedPattern],
  )

  const patterns = useMemo(() => Array.from(new Set(lessons.map((lesson) => lesson.pattern))), [lessons])

  const headerSubtitle = useMemo(() => {
    const total = lessons.length
    const visible = filteredLessons.length
    const minLabel = `${Math.round(minScore * 100)}%`
    const patternLabel = selectedPattern ? selectedPattern : "All patterns"
    return `${visible} / ${total} lessons · ${patternLabel} · min score ${minLabel}`
  }, [filteredLessons.length, lessons.length, minScore, selectedPattern])

  return (
    <DashboardShell title="Learn" description={headerSubtitle}>
      <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="lessons-page">
        {/* Header (Loveable-style layout) */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <BookOpen size={24} aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Learn</h1>
            <p className="text-sm text-text-secondary">{headerSubtitle}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="space-y-3" data-testid="lesson-filters">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/70 bg-surface/60 px-3 py-1 text-xs font-semibold text-text-secondary">
              Min Score: {(minScore * 100).toFixed(0)}%
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={minScore}
              onChange={(event) => setMinScore(parseFloat(event.target.value))}
              className="accent-brand"
              aria-label="Minimum score filter"
              data-testid="lessons-min-score"
            />
            {(selectedPattern !== null || minScore !== 0.5) && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => {
                  setSelectedPattern(null)
                  setMinScore(0.5)
                }}
                data-testid="btn-reset-filters"
              >
                Reset
              </Button>
            )}
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by pattern">
            <Button
              variant={selectedPattern === null ? "primary" : "outline"}
              size="sm"
              className="rounded-full"
              onClick={() => setSelectedPattern(null)}
              data-testid="lessons-filter-all"
            >
              All patterns
            </Button>
            {patterns.map((pattern) => (
              <Button
                key={pattern}
                variant={selectedPattern === pattern ? "primary" : "outline"}
                size="sm"
                className="rounded-full"
                onClick={() => setSelectedPattern(pattern)}
                data-testid={`lessons-filter-${pattern}`}
              >
                {pattern
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </Button>
            ))}
          </div>
        </div>

        {/* Lessons grid */}
        {loading ? (
          <StateView type="loading" description="Loading lessons..." />
        ) : error ? (
          <StateView type="error" description="Failed to load lessons" />
        ) : filteredLessons.length === 0 ? (
          <div
            className="rounded-2xl border border-border/60 bg-surface/60 py-8 text-center text-text-secondary"
            data-testid="lessons-empty-state"
          >
            No lessons match your filters.{" "}
            <button
              type="button"
              onClick={() => {
                setSelectedPattern(null)
                setMinScore(0.5)
              }}
              className="text-brand underline underline-offset-2"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" role="list" aria-label="Lessons">
            {filteredLessons.map((lesson) => (
              <div key={lesson.id} role="listitem">
                <LessonCard lesson={lesson} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

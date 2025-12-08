/**
 * LessonsPage - Trading Lessons Library
 * 
 * Displays extracted lessons from trade outcomes:
 * - Top lessons by confidence score
 * - Pattern-based filtering
 * - Win rate & sample size stats
 * - Detailed lesson view with DOs/DONTs
 */

import { useState } from 'react'
import { BookOpen, TrendingUp, Filter } from '@/lib/icons'
import { useLessons } from '@/hooks/useSignals'
import LessonCard from '@/components/signals/LessonCard'
import StateView from '@/components/ui/StateView'

export default function LessonsPage() {
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null)
  const [minScore, setMinScore] = useState(0.5)

  const { lessons, loading, error } = useLessons()

  // Filter by pattern and min score
  const filteredLessons = lessons.filter(
    (l) =>
      l.score >= minScore &&
      (selectedPattern === null || l.pattern === selectedPattern)
  )

  // Get unique patterns
  const patterns = Array.from(new Set(lessons.map((l) => l.pattern)))

  // Calculate stats
  const stats = {
    total: filteredLessons.length,
    high_score: filteredLessons.filter((l) => l.score >= 0.75).length,
    avg_win_rate:
      filteredLessons.length > 0
        ? filteredLessons.reduce((sum, l) => sum + (l.stats?.win_rate || 0), 0) /
          filteredLessons.length
        : 0,
    total_trades: filteredLessons.reduce(
      (sum, l) => sum + (l.stats?.trades_analyzed || 0),
      0
    ),
  }

  return (
    <div className="min-h-screen bg-bg pb-20 md:pb-8">
      {/* Header */}
      <header className="border-b border-moderate bg-surface p-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-info/10 p-2">
              <BookOpen size={24} className="text-info" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-primary">Trading Lessons</h1>
              <p className="text-sm text-secondary">
                Extracted wisdom from your trades
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4 pb-20 md:pb-6 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">Total</p>
            <p className="text-xl font-semibold text-primary">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">High Score</p>
            <p className="text-xl font-semibold text-success">{stats.high_score}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">Avg WR</p>
            <p className="text-xl font-semibold text-info">
              {(stats.avg_win_rate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">Trades</p>
            <p className="text-xl font-semibold text-primary">{stats.total_trades}</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-2xl border border-info/40 bg-info/10 p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-info mt-0.5" />
            <div>
              <p className="text-sm font-medium text-info">How Lessons Work</p>
              <p className="text-sm text-secondary mt-1">
                Lessons are automatically extracted after accumulating 10+ trades for a
                pattern. They analyze what works, what fails, and provide actionable
                checklists to improve your edge.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {patterns.length > 0 && (
          <div className="rounded-2xl border border-subtle bg-surface p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-secondary" />
              <p className="text-sm font-medium text-secondary">Filters</p>
            </div>

            {/* Pattern Filter */}
            <div>
              <label className="text-xs text-tertiary mb-1 block">Pattern</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPattern(null)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedPattern === null
                      ? 'bg-info text-bg'
                      : 'bg-surface-hover text-secondary hover:bg-surface'
                  }`}
                >
                  All
                </button>
                {patterns.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                      selectedPattern === pattern
                        ? 'bg-info text-bg'
                        : 'bg-surface-hover text-secondary hover:bg-surface'
                    }`}
                  >
                    {pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Threshold */}
            <div>
              <label className="text-xs text-tertiary mb-1 block">
                Min Score: {(minScore * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={minScore}
                onChange={(e) => setMinScore(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Lessons List */}
        {loading ? (
          <StateView type="loading" description="Loading lessons..." />
        ) : error ? (
          <StateView type="error" description="Failed to load lessons" />
        ) : filteredLessons.length === 0 ? (
          <StateView
            type="empty"
            description="No lessons yet. Trade more to accumulate wisdom!"
            icon={<BookOpen size={48} className="text-tertiary" />}
          />
        ) : (
          <div className="space-y-4">
            {filteredLessons.map((lesson) => (
              <LessonCard key={lesson.id} lesson={lesson} />
            ))}
          </div>
        )}

        {/* CTA for empty state */}
        {lessons.length === 0 && !loading && (
          <div className="mt-8 text-center">
            <p className="text-sm text-secondary mb-4">
              Start detecting signals and tracking trades to build your lesson library
            </p>
            <a
              href="/chart-v2"
              className="inline-block rounded-2xl bg-info px-6 py-3 text-sm font-medium text-bg hover:bg-info/80 transition-colors"
            >
              Analyze Your First Chart
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

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
    <div className="min-h-screen bg-void-lighter pb-20 md:pb-8">
      {/* Header */}
      <header className="border-b border-smoke-light bg-smoke p-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-spark/30 p-2">
              <BookOpen size={24} className="text-spark" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-mist">Trading Lessons</h1>
              <p className="text-sm text-ash">
                Extracted wisdom from your trades
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4 pb-20 md:pb-6 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg border border-smoke-light bg-smoke p-3 text-center">
            <p className="text-xs text-ash">Total</p>
            <p className="text-xl font-semibold text-mist">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-smoke-light bg-smoke p-3 text-center">
            <p className="text-xs text-ash">High Score</p>
            <p className="text-xl font-semibold text-spark">{stats.high_score}</p>
          </div>
          <div className="rounded-lg border border-smoke-light bg-smoke p-3 text-center">
            <p className="text-xs text-ash">Avg WR</p>
            <p className="text-xl font-semibold text-spark">
              {(stats.avg_win_rate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded-lg border border-smoke-light bg-smoke p-3 text-center">
            <p className="text-xs text-ash">Trades</p>
            <p className="text-xl font-semibold text-mist">{stats.total_trades}</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-spark/50 bg-spark/20 p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-spark mt-0.5" />
            <div>
              <p className="text-sm font-medium text-spark">How Lessons Work</p>
              <p className="text-sm text-fog mt-1">
                Lessons are automatically extracted after accumulating 10+ trades for a
                pattern. They analyze what works, what fails, and provide actionable
                checklists to improve your edge.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {patterns.length > 0 && (
          <div className="rounded-lg border border-smoke-light bg-smoke p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-ash" />
              <p className="text-sm font-medium text-fog">Filters</p>
            </div>

            {/* Pattern Filter */}
            <div>
              <label className="text-xs text-ash mb-1 block">Pattern</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPattern(null)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedPattern === null
                      ? 'bg-spark text-white'
                      : 'bg-smoke-light text-fog hover:bg-smoke-lighter'
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
                        ? 'bg-spark text-white'
                        : 'bg-smoke-light text-fog hover:bg-smoke-lighter'
                    }`}
                  >
                    {pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Threshold */}
            <div>
              <label className="text-xs text-ash mb-1 block">
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
            icon={<BookOpen size={48} className="text-smoke-lighter" />}
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
            <p className="text-sm text-ash mb-4">
              Start detecting signals and tracking trades to build your lesson library
            </p>
            <a
              href="/chart-v2"
              className="inline-block rounded-lg bg-spark px-6 py-3 text-sm font-medium text-white hover:bg-spark transition-colors"
            >
              Analyze Your First Chart
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

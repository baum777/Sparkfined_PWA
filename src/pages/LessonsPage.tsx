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
import { BookOpen, TrendingUp, Filter } from 'lucide-react'
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
    <div className="min-h-screen bg-zinc-950 pb-20 md:pb-8">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 p-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-950/30 p-2">
              <BookOpen size={24} className="text-cyan-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-zinc-100">Trading Lessons</h1>
              <p className="text-sm text-zinc-500">
                Extracted wisdom from your trades
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
            <p className="text-xs text-zinc-500">Total</p>
            <p className="text-xl font-semibold text-zinc-100">{stats.total}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
            <p className="text-xs text-zinc-500">High Score</p>
            <p className="text-xl font-semibold text-emerald-500">{stats.high_score}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
            <p className="text-xs text-zinc-500">Avg WR</p>
            <p className="text-xl font-semibold text-cyan-500">
              {(stats.avg_win_rate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-3 text-center">
            <p className="text-xs text-zinc-500">Trades</p>
            <p className="text-xl font-semibold text-zinc-100">{stats.total_trades}</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="rounded-lg border border-cyan-800/50 bg-cyan-950/20 p-4">
          <div className="flex items-start gap-3">
            <TrendingUp size={20} className="text-cyan-500 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-cyan-400">How Lessons Work</p>
              <p className="text-sm text-zinc-400 mt-1">
                Lessons are automatically extracted after accumulating 10+ trades for a
                pattern. They analyze what works, what fails, and provide actionable
                checklists to improve your edge.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        {patterns.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-zinc-500" />
              <p className="text-sm font-medium text-zinc-400">Filters</p>
            </div>

            {/* Pattern Filter */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">Pattern</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedPattern(null)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedPattern === null
                      ? 'bg-cyan-600 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
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
                        ? 'bg-cyan-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Threshold */}
            <div>
              <label className="text-xs text-zinc-500 mb-1 block">
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
            <p className="text-sm text-zinc-500 mb-4">
              Start detecting signals and tracking trades to build your lesson library
            </p>
            <a
              href="/chart"
              className="inline-block rounded-lg bg-cyan-600 px-6 py-3 text-sm font-medium text-white hover:bg-cyan-700 transition-colors"
            >
              Analyze Your First Chart
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

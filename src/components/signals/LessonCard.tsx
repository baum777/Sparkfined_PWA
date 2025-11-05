/**
 * LessonCard Component
 * 
 * Displays extracted trading lessons with:
 * - Pattern name & confidence score
 * - Win rate & sample size
 * - When it works / When it fails
 * - Checklist, DOs/DONTs
 * - Next drill suggestion
 * 
 * Used in: LessonsPage, Signal Detail
 */

import { BookOpen, TrendingUp, CheckCircle2, XCircle, Target } from 'lucide-react'
import type { Lesson } from '@/types/signal'

interface LessonCardProps {
  lesson: Lesson
  onClick?: () => void
  compact?: boolean
}

export default function LessonCard({ lesson, onClick, compact = false }: LessonCardProps) {
  // Score styling
  const scoreColor =
    lesson.score >= 0.75
      ? 'text-emerald-500'
      : lesson.score >= 0.6
      ? 'text-amber-500'
      : 'text-zinc-500'

  const scoreBg =
    lesson.score >= 0.75
      ? 'bg-emerald-950/30 border-emerald-800/50'
      : lesson.score >= 0.6
      ? 'bg-amber-950/30 border-amber-800/50'
      : 'bg-zinc-900 border-zinc-800'

  // Pattern display
  const patternDisplay = lesson.pattern
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  // Time ago
  const timeAgo = getTimeAgo(new Date(lesson.updated_at))

  if (compact) {
    return (
      <div
        className={`border ${scoreBg} rounded-lg p-3 transition-all ${
          onClick ? 'cursor-pointer hover:bg-opacity-70 active:scale-[0.98]' : ''
        }`}
        style={{
          borderRadius: 'var(--radius-md)',
          transition: 'all var(--duration-short) var(--ease-in-out)',
        }}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className={scoreColor} />
            <div>
              <p className="text-sm font-semibold text-zinc-100">{patternDisplay}</p>
              {lesson.stats && (
                <p className="text-xs text-zinc-500">
                  {(lesson.stats.win_rate * 100).toFixed(0)}% WR • {lesson.stats.trades_analyzed}{' '}
                  trades
                </p>
              )}
            </div>
          </div>
          <p className={`text-xs font-medium ${scoreColor}`}>
            {(lesson.score * 100).toFixed(0)}%
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`border ${scoreBg} rounded-lg p-4 space-y-4`}
      style={{ borderRadius: 'var(--radius-lg)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-zinc-900/50 p-2">
            <BookOpen size={20} className={scoreColor} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-zinc-100">{patternDisplay}</h3>
            <p className="text-xs text-zinc-500">Updated {timeAgo}</p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xl font-semibold ${scoreColor}`}>
            {(lesson.score * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-zinc-500">Confidence</p>
        </div>
      </div>

      {/* Stats */}
      {lesson.stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded bg-zinc-900/50 p-2 text-center">
            <p className="text-xs text-zinc-500">Win Rate</p>
            <p className="text-sm font-semibold text-emerald-500">
              {(lesson.stats.win_rate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded bg-zinc-900/50 p-2 text-center">
            <p className="text-xs text-zinc-500">Avg R:R</p>
            <p className="text-sm font-semibold text-zinc-300">
              {lesson.stats.avg_rr.toFixed(1)}:1
            </p>
          </div>
          <div className="rounded bg-zinc-900/50 p-2 text-center">
            <p className="text-xs text-zinc-500">Trades</p>
            <p className="text-sm font-semibold text-zinc-300">{lesson.stats.trades_analyzed}</p>
          </div>
        </div>
      )}

      {/* When It Works */}
      <div className="rounded-lg bg-emerald-950/20 border border-emerald-800/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">
            When It Works
          </p>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{lesson.when_it_works}</p>
      </div>

      {/* When It Fails */}
      <div className="rounded-lg bg-rose-950/20 border border-rose-800/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={14} className="text-rose-500" />
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide">
            When It Fails
          </p>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{lesson.when_it_fails}</p>
      </div>

      {/* Checklist */}
      <div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
          📋 Checklist
        </p>
        <ul className="space-y-1">
          {lesson.checklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
              <span className="text-zinc-600">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DOs */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} className="text-emerald-500" />
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wide">DOs</p>
        </div>
        <ul className="space-y-1">
          {lesson.dos.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
              <span className="text-emerald-600">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DONTs */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={14} className="text-rose-500" />
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wide">DON'Ts</p>
        </div>
        <ul className="space-y-1">
          {lesson.donts.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-zinc-300">
              <span className="text-rose-600">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Drill */}
      <div className="rounded-lg bg-cyan-950/20 border border-cyan-800/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-cyan-500" />
          <p className="text-xs font-semibold text-cyan-500 uppercase tracking-wide">
            Next Drill
          </p>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{lesson.next_drill}</p>
      </div>
    </div>
  )
}

// Helper: Time ago formatting
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`
  return `${Math.floor(seconds / 2592000)}mo ago`
}

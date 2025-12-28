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

import { BookOpen, TrendingUp, CheckCircle2, XCircle, Target } from '@/lib/icons'
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
      ? 'text-sentiment-bull'
      : lesson.score >= 0.6
        ? 'text-warn'
        : 'text-text-tertiary'

  const scoreSurface =
    lesson.score >= 0.75
      ? 'border border-sentiment-bull-border bg-sentiment-bull-bg'
      : lesson.score >= 0.6
        ? 'border border-warn/40 bg-warn/10'
        : 'border border-border bg-surface-subtle'

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
        className={`${scoreSurface} rounded-lg p-3 transition-all ${
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
              <p className="text-sm font-semibold text-text-primary">{patternDisplay}</p>
              {lesson.stats && (
                <p className="text-xs text-text-secondary">
                  {(lesson.stats.win_rate * 100).toFixed(0)}% WR • {lesson.stats.trades_analyzed} trades
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
    <div className={`${scoreSurface} rounded-lg p-4 space-y-4`} style={{ borderRadius: 'var(--radius-lg)' }}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-border-subtle bg-surface-subtle p-2">
            <BookOpen size={20} className={scoreColor} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">{patternDisplay}</h3>
            <p className="text-xs text-text-secondary">Updated {timeAgo}</p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xl font-semibold ${scoreColor}`}>
            {(lesson.score * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-text-tertiary">Confidence</p>
        </div>
      </div>

      {/* Stats */}
      {lesson.stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
            <p className="text-xs text-text-tertiary">Win Rate</p>
            <p className="text-sm font-semibold text-sentiment-bull">
              {(lesson.stats.win_rate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
            <p className="text-xs text-text-tertiary">Avg R:R</p>
            <p className="text-sm font-semibold text-text-secondary">
              {lesson.stats.avg_rr.toFixed(1)}:1
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
            <p className="text-xs text-text-tertiary">Trades</p>
            <p className="text-sm font-semibold text-text-secondary">{lesson.stats.trades_analyzed}</p>
          </div>
        </div>
      )}

      {/* When It Works */}
      <div className="rounded-lg border border-sentiment-bull-border bg-sentiment-bull-bg p-3">
        <div className="mb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-sentiment-bull" />
          <p className="text-xs font-semibold uppercase tracking-wide text-sentiment-bull">When It Works</p>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{lesson.when_it_works}</p>
      </div>

      {/* When It Fails */}
      <div className="rounded-lg border border-sentiment-bear-border bg-sentiment-bear-bg p-3">
        <div className="mb-2 flex items-center gap-2">
          <XCircle size={14} className="text-sentiment-bear" />
          <p className="text-xs font-semibold uppercase tracking-wide text-sentiment-bear">When It Fails</p>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{lesson.when_it_fails}</p>
      </div>

      {/* Checklist */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-text-tertiary">📋 Checklist</p>
        <ul className="space-y-1">
          {lesson.checklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-text-tertiary">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DOs */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <CheckCircle2 size={14} className="text-sentiment-bull" />
          <p className="text-xs font-semibold uppercase tracking-wide text-sentiment-bull">DOs</p>
        </div>
        <ul className="space-y-1">
          {lesson.dos.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-sentiment-bull">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DONTs */}
      <div>
        <div className="mb-2 flex items-center gap-2">
          <XCircle size={14} className="text-sentiment-bear" />
          <p className="text-xs font-semibold uppercase tracking-wide text-sentiment-bear">DON'Ts</p>
        </div>
        <ul className="space-y-1">
          {lesson.donts.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-text-secondary">
              <span className="text-sentiment-bear">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Drill */}
      <div className="rounded-lg border border-info/40 bg-info/10 p-3">
        <div className="mb-2 flex items-center gap-2">
          <Target size={14} className="text-info" />
          <p className="text-xs font-semibold uppercase tracking-wide text-info">Next Drill</p>
        </div>
        <p className="text-sm leading-relaxed text-text-secondary">{lesson.next_drill}</p>
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

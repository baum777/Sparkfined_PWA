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
      ? 'text-spark'
      : lesson.score >= 0.6
      ? 'text-gold'
      : 'text-ash'

  const scoreBg =
    lesson.score >= 0.75
      ? 'bg-spark/30 border-spark/50'
      : lesson.score >= 0.6
      ? 'bg-gold/30 border-gold/50'
      : 'bg-smoke border-smoke-light'

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
              <p className="text-sm font-semibold text-mist">{patternDisplay}</p>
              {lesson.stats && (
                <p className="text-xs text-ash">
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
          <div className="rounded-lg bg-smoke/50 p-2">
            <BookOpen size={20} className={scoreColor} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-mist">{patternDisplay}</h3>
            <p className="text-xs text-ash">Updated {timeAgo}</p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xl font-semibold ${scoreColor}`}>
            {(lesson.score * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-ash">Confidence</p>
        </div>
      </div>

      {/* Stats */}
      {lesson.stats && (
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded bg-smoke/50 p-2 text-center">
            <p className="text-xs text-ash">Win Rate</p>
            <p className="text-sm font-semibold text-spark">
              {(lesson.stats.win_rate * 100).toFixed(0)}%
            </p>
          </div>
          <div className="rounded bg-smoke/50 p-2 text-center">
            <p className="text-xs text-ash">Avg R:R</p>
            <p className="text-sm font-semibold text-fog">
              {lesson.stats.avg_rr.toFixed(1)}:1
            </p>
          </div>
          <div className="rounded bg-smoke/50 p-2 text-center">
            <p className="text-xs text-ash">Trades</p>
            <p className="text-sm font-semibold text-fog">{lesson.stats.trades_analyzed}</p>
          </div>
        </div>
      )}

      {/* When It Works */}
      <div className="rounded-lg bg-spark/20 border border-spark/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={14} className="text-spark" />
          <p className="text-xs font-semibold text-spark uppercase tracking-wide">
            When It Works
          </p>
        </div>
        <p className="text-sm leading-relaxed text-fog">{lesson.when_it_works}</p>
      </div>

      {/* When It Fails */}
      <div className="rounded-lg bg-blood/20 border border-blood/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={14} className="text-blood" />
          <p className="text-xs font-semibold text-blood uppercase tracking-wide">
            When It Fails
          </p>
        </div>
        <p className="text-sm leading-relaxed text-fog">{lesson.when_it_fails}</p>
      </div>

      {/* Checklist */}
      <div>
        <p className="text-xs font-semibold text-ash uppercase tracking-wide mb-2">
          📋 Checklist
        </p>
        <ul className="space-y-1">
          {lesson.checklist.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-fog">
              <span className="text-ash">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DOs */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 size={14} className="text-spark" />
          <p className="text-xs font-semibold text-spark uppercase tracking-wide">DOs</p>
        </div>
        <ul className="space-y-1">
          {lesson.dos.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-fog">
              <span className="text-spark">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* DONTs */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <XCircle size={14} className="text-blood" />
          <p className="text-xs font-semibold text-blood uppercase tracking-wide">DON'Ts</p>
        </div>
        <ul className="space-y-1">
          {lesson.donts.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm text-fog">
              <span className="text-blood">✗</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Drill */}
      <div className="rounded-lg bg-spark/20 border border-spark/30 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Target size={14} className="text-spark" />
          <p className="text-xs font-semibold text-spark uppercase tracking-wide">
            Next Drill
          </p>
        </div>
        <p className="text-sm leading-relaxed text-fog">{lesson.next_drill}</p>
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

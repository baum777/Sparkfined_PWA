/**
 * SignalCard Component
 * 
 * Compact card for displaying trading signals
 * Shows: Symbol, Pattern, Confidence, Direction, Thesis
 * 
 * Used in: SignalsPage, Board Feed
 */

import { TrendingUp, TrendingDown, AlertCircle } from '@/lib/icons'
import type { Signal } from '@/types/signal'

interface SignalCardProps {
  signal: Signal
  onClick?: () => void
  compact?: boolean
}

export default function SignalCard({ signal, onClick, compact = false }: SignalCardProps) {
  // Direction styling
  const directionStyles = {
    long: {
      bg: 'bg-spark/30',
      border: 'border-spark/50',
      text: 'text-spark',
      icon: TrendingUp,
    },
    short: {
      bg: 'bg-blood/30',
      border: 'border-blood/50',
      text: 'text-blood',
      icon: TrendingDown,
    },
    neutral: {
      bg: 'bg-smoke',
      border: 'border-smoke-light',
      text: 'text-fog',
      icon: AlertCircle,
    },
  }

  const style = directionStyles[signal.direction]
  const DirectionIcon = style.icon

  // Confidence color
  const confidenceColor =
    signal.confidence >= 0.75
      ? 'text-spark'
      : signal.confidence >= 0.6
      ? 'text-gold'
      : 'text-ash'

  // Pattern display
  const patternDisplay = signal.pattern
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  // Timestamp
  const timeAgo = getTimeAgo(new Date(signal.timestamp_utc))

  return (
    <div
      className={`border ${style.border} ${style.bg} p-3 transition-all md:rounded-lg ${
        onClick ? 'cursor-pointer hover:bg-opacity-70 active:scale-[0.98]' : ''
      }`}
      style={{
        borderRadius: 'var(--radius-md)',
        transition: 'all var(--duration-short) var(--ease-in-out)',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Header: Symbol + Direction + Confidence */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <DirectionIcon size={16} className={style.text} />
          <div>
            <p className="text-sm font-semibold text-mist">
              {signal.market.symbol}
            </p>
            <p className="text-xs text-ash">{signal.market.venue}</p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xs font-medium ${confidenceColor}`}>
            {(signal.confidence * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-ash">{timeAgo}</p>
        </div>
      </div>

      {/* Body: Pattern + Regime */}
      {!compact && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-smoke-light/50 px-2 py-0.5 text-xs font-medium text-fog">
              {patternDisplay}
            </span>
            <span className="text-xs text-ash">
              {signal.regime.trend} / {signal.regime.vol} vol
            </span>
          </div>

          {/* Thesis (truncated) */}
          <p className="text-xs leading-relaxed text-fog line-clamp-2">
            {signal.thesis}
          </p>
        </div>
      )}

      {/* Risk Flags (if any) */}
      {signal.features.risk_flags.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <AlertCircle size={12} className="text-gold" />
          <p className="text-xs text-gold">
            {signal.features.risk_flags.length} risk flag
            {signal.features.risk_flags.length > 1 ? 's' : ''}
          </p>
        </div>
      )}
    </div>
  )
}

// Helper: Time ago formatting
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

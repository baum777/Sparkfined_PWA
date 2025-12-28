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
    surface: 'border border-sentiment-bull-border bg-sentiment-bull-bg',
    accent: 'text-sentiment-bull',
    icon: TrendingUp,
  },
  short: {
    surface: 'border border-sentiment-bear-border bg-sentiment-bear-bg',
    accent: 'text-sentiment-bear',
    icon: TrendingDown,
  },
  neutral: {
    surface: 'border border-border bg-surface-subtle',
    accent: 'text-text-secondary',
    icon: AlertCircle,
  },
}

  const style = directionStyles[signal.direction]
  const DirectionIcon = style.icon

  // Confidence color
  const confidenceColor =
    signal.confidence >= 0.75
      ? 'text-sentiment-bull'
      : signal.confidence >= 0.6
      ? 'text-warn'
      : 'text-text-tertiary'

  // Pattern display
  const patternDisplay = signal.pattern
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  // Timestamp
  const timeAgo = getTimeAgo(new Date(signal.timestamp_utc))

  return (
    <div
      className={`${style.surface} p-3 transition-all md:rounded-lg ${
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
          <DirectionIcon size={16} className={style.accent} />
          <div>
            <p className="text-sm font-semibold text-text-primary">
              {signal.market.symbol}
            </p>
            <p className="text-xs text-text-secondary">{signal.market.venue}</p>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-xs font-medium ${confidenceColor}`}>
            {(signal.confidence * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-text-tertiary">{timeAgo}</p>
        </div>
      </div>

      {/* Body: Pattern + Regime */}
      {!compact && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded bg-surface-subtle px-2 py-0.5 text-xs font-medium text-text-secondary">
              {patternDisplay}
            </span>
            <span className="text-xs text-text-tertiary">
              {signal.regime.trend} / {signal.regime.vol} vol
            </span>
          </div>

          {/* Thesis (truncated) */}
          <p className="text-xs leading-relaxed text-text-secondary line-clamp-2">
            {signal.thesis}
          </p>
        </div>
      )}

      {/* Risk Flags (if any) */}
      {signal.features.risk_flags.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          <AlertCircle size={12} className="text-warn" />
          <p className="text-xs text-warn">
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

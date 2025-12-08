/**
 * SignalReviewCard Component
 * 
 * Full-detail card for reviewing trading signals with trade plans
 * Shows: Signal details, TradePlan, Risk checks, Checklist
 * 
 * Used in: SignalDetailPage, ChartPage (after analysis)
 */

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, XCircle } from '@/lib/icons'
import type { Signal, TradePlan } from '@/types/signal'
import { useState } from 'react'
import Button from '@/components/ui/Button'

interface SignalReviewCardProps {
  signal: Signal
  plan?: TradePlan
  onAccept?: () => void
  onReject?: () => void
}

export default function SignalReviewCard({
  signal,
  plan,
  onAccept,
  onReject,
}: SignalReviewCardProps) {
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({})

  // Direction styling
  const isLong = signal.direction === 'long'
  const directionAccent = isLong ? 'text-sentiment-bull' : 'text-sentiment-bear'
  const directionSurface = isLong
    ? 'border border-sentiment-bull-border bg-sentiment-bull-bg'
    : 'border border-sentiment-bear-border bg-sentiment-bear-bg'
  const DirectionIcon = isLong ? TrendingUp : TrendingDown

  // Confidence styling
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

  // Checklist complete check
  const allChecked = plan
    ? plan.checklist.every((item) => checklistState[item])
    : false

  const toggleCheck = (item: string) => {
    setChecklistState((prev) => ({ ...prev, [item]: !prev[item] }))
  }

  return (
    <div className="space-y-4">
      {/* Signal Header */}
      <div className={`${directionSurface} rounded-3xl p-4`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <DirectionIcon size={24} className={directionAccent} />
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {signal.market.symbol}
              </h3>
              <p className="text-sm text-text-secondary">
                {signal.market.venue} • {patternDisplay}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-xl font-semibold ${confidenceColor}`}>
              {(signal.confidence * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-text-tertiary">Confidence</p>
          </div>
        </div>

        {/* Thesis */}
        <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-subtle p-3">
          <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">
            Thesis
          </p>
          <p className="mt-1 text-sm leading-relaxed text-text-secondary">
            {signal.thesis}
          </p>
        </div>

        {/* Market Context */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
            <p className="text-xs text-text-tertiary">Trend</p>
            <p className="text-sm font-medium text-text-secondary capitalize">
              {signal.regime.trend}
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
            <p className="text-xs text-text-tertiary">Volatility</p>
            <p className="text-sm font-medium text-text-secondary capitalize">
              {signal.regime.vol}
            </p>
          </div>
          <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
            <p className="text-xs text-text-tertiary">Liquidity</p>
            <p className="text-sm font-medium text-text-secondary capitalize">
              {signal.regime.liquidity}
            </p>
          </div>
        </div>

        {/* Risk Flags */}
        {signal.features.risk_flags.length > 0 && (
          <div className="mt-3 rounded-2xl border border-warn/40 bg-warn/10 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-warn" />
              <p className="text-xs font-medium text-warn uppercase tracking-wide">
                Risk Flags
              </p>
            </div>
            <ul className="mt-2 space-y-1">
              {signal.features.risk_flags.map((flag) => (
                <li key={flag} className="text-sm text-warn">
                  • {flag.replace('_', ' ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Trade Plan */}
      {plan && (
        <div className="card rounded-3xl border border-border bg-surface p-4">
          <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide">Trade Plan</h4>

          {/* Entry & Risk */}
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-text-tertiary">Entry Price</p>
                <p className="text-lg font-semibold text-text-primary">
                  ${plan.entry.price.toFixed(2)}
                </p>
                <p className="text-xs text-text-tertiary capitalize">{plan.entry.type}</p>
              </div>
              <div>
                <p className="text-xs text-text-tertiary">Stop Loss</p>
                <p className="text-lg font-semibold text-sentiment-bear">
                  ${plan.risk.stop.toFixed(2)}
                </p>
                <p className="text-xs text-text-tertiary">
                  Risk: ${plan.risk.max_loss_usd?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Position Size */}
            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2">
              <p className="text-xs text-text-tertiary">Position Size</p>
              <p className="text-sm font-medium text-text-secondary">
                {plan.risk.pos_size_units.toFixed(2)} units ({plan.risk.risk_pct_equity.toFixed(1)}% risk)
              </p>
            </div>
          </div>

          {/* Targets */}
          <div className="mt-4">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Take Profit Targets</p>
            <div className="mt-2 space-y-2">
              {plan.targets.map((target) => (
                <div
                  key={target.tp}
                  className="flex items-center justify-between rounded-2xl border border-border-subtle bg-surface-subtle p-2"
                >
                  <span className="text-xs text-text-tertiary">TP{target.tp}</span>
                  <span className="text-sm font-medium text-sentiment-bull">
                    ${target.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    {(target.share * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
              <p className="text-xs text-text-tertiary">R:R</p>
              <p className="text-sm font-semibold text-sentiment-bull">
                {plan.metrics.rr.toFixed(1)}:1
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
              <p className="text-xs text-text-tertiary">Expectancy</p>
              <p className="text-sm font-semibold text-text-secondary">
                {plan.metrics.expectancy.toFixed(2)}
              </p>
            </div>
            <div className="rounded-2xl border border-border-subtle bg-surface-subtle p-2 text-center">
              <p className="text-xs text-text-tertiary">Win Prob</p>
              <p className="text-sm font-semibold text-text-secondary">
                {(plan.metrics.win_prob * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="mt-4">
            <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Pre-Trade Checklist</p>
            <div className="mt-2 space-y-2">
              {plan.checklist.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 rounded-2xl border border-border-subtle bg-surface-subtle p-2 transition hover:border-border hover:bg-surface"
                >
                  <input
                    type="checkbox"
                    checked={checklistState[item] || false}
                    onChange={() => toggleCheck(item)}
                    className="h-4 w-4 rounded border-border bg-surface text-sentiment-bull focus:ring-2 focus:ring-brand focus:ring-offset-0"
                  />
                  <span className="text-sm text-text-secondary">
                    {item.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          {plan.notes && (
            <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-subtle p-3">
              <p className="text-xs font-medium text-text-tertiary uppercase tracking-wide">Notes</p>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">
                {plan.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {(onAccept || onReject) && (
        <div className="flex gap-3">
          {onReject && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onReject}
              className="flex-1"
              leftIcon={<XCircle size={16} />}
            >
              Reject
            </Button>
          )}
          {onAccept && (
            <Button
              variant="primary"
              size="sm"
              onClick={onAccept}
              disabled={plan ? !allChecked : false}
              className="flex-1"
              leftIcon={<CheckCircle2 size={16} />}
            >
              {plan && !allChecked ? 'Complete Checklist' : 'Accept & Execute'}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

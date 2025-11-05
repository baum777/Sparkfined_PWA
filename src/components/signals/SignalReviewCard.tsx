/**
 * SignalReviewCard Component
 * 
 * Full-detail card for reviewing trading signals with trade plans
 * Shows: Signal details, TradePlan, Risk checks, Checklist
 * 
 * Used in: SignalDetailPage, ChartPage (after analysis)
 */

import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, XCircle } from 'lucide-react'
import type { Signal, TradePlan } from '@/types/signal'
import { useState } from 'react'

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
  const directionColor = isLong ? 'text-emerald-500' : 'text-rose-500'
  const directionBg = isLong ? 'bg-emerald-950/30' : 'bg-rose-950/30'
  const directionBorder = isLong ? 'border-emerald-800/50' : 'border-rose-800/50'
  const DirectionIcon = isLong ? TrendingUp : TrendingDown

  // Confidence styling
  const confidenceColor =
    signal.confidence >= 0.75
      ? 'text-emerald-500'
      : signal.confidence >= 0.6
      ? 'text-amber-500'
      : 'text-zinc-500'

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
      <div
        className={`border ${directionBorder} ${directionBg} rounded-lg p-4`}
        style={{ borderRadius: 'var(--radius-md)' }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <DirectionIcon size={24} className={directionColor} />
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">
                {signal.market.symbol}
              </h3>
              <p className="text-sm text-zinc-400">
                {signal.market.venue} • {patternDisplay}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-xl font-semibold ${confidenceColor}`}>
              {(signal.confidence * 100).toFixed(0)}%
            </p>
            <p className="text-xs text-zinc-500">Confidence</p>
          </div>
        </div>

        {/* Thesis */}
        <div className="mt-4 rounded-lg bg-zinc-900/50 p-3">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
            Thesis
          </p>
          <p className="mt-1 text-sm leading-relaxed text-zinc-300">
            {signal.thesis}
          </p>
        </div>

        {/* Market Context */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded bg-zinc-900/50 p-2 text-center">
            <p className="text-xs text-zinc-500">Trend</p>
            <p className="text-sm font-medium text-zinc-300 capitalize">
              {signal.regime.trend}
            </p>
          </div>
          <div className="rounded bg-zinc-900/50 p-2 text-center">
            <p className="text-xs text-zinc-500">Volatility</p>
            <p className="text-sm font-medium text-zinc-300 capitalize">
              {signal.regime.vol}
            </p>
          </div>
          <div className="rounded bg-zinc-900/50 p-2 text-center">
            <p className="text-xs text-zinc-500">Liquidity</p>
            <p className="text-sm font-medium text-zinc-300 capitalize">
              {signal.regime.liquidity}
            </p>
          </div>
        </div>

        {/* Risk Flags */}
        {signal.features.risk_flags.length > 0 && (
          <div className="mt-3 rounded-lg bg-amber-950/30 border border-amber-800/50 p-3">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" />
              <p className="text-xs font-medium text-amber-500 uppercase tracking-wide">
                Risk Flags
              </p>
            </div>
            <ul className="mt-2 space-y-1">
              {signal.features.risk_flags.map((flag) => (
                <li key={flag} className="text-sm text-amber-400">
                  • {flag.replace('_', ' ')}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Trade Plan */}
      {plan && (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <h4 className="text-sm font-semibold text-zinc-100 uppercase tracking-wide">
            Trade Plan
          </h4>

          {/* Entry & Risk */}
          <div className="mt-3 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-zinc-500">Entry Price</p>
                <p className="text-lg font-semibold text-zinc-100">
                  ${plan.entry.price.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500 capitalize">{plan.entry.type}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500">Stop Loss</p>
                <p className="text-lg font-semibold text-rose-500">
                  ${plan.risk.stop.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500">
                  Risk: ${plan.risk.max_loss_usd?.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Position Size */}
            <div className="rounded bg-zinc-800/50 p-2">
              <p className="text-xs text-zinc-500">Position Size</p>
              <p className="text-sm font-medium text-zinc-300">
                {plan.risk.pos_size_units.toFixed(2)} units (
                {plan.risk.risk_pct_equity.toFixed(1)}% risk)
              </p>
            </div>
          </div>

          {/* Targets */}
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Take Profit Targets
            </p>
            <div className="mt-2 space-y-2">
              {plan.targets.map((target) => (
                <div
                  key={target.tp}
                  className="flex items-center justify-between rounded bg-zinc-800/50 p-2"
                >
                  <span className="text-xs text-zinc-500">TP{target.tp}</span>
                  <span className="text-sm font-medium text-emerald-500">
                    ${target.price.toFixed(2)}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {(target.share * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Metrics */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="rounded bg-zinc-800/50 p-2 text-center">
              <p className="text-xs text-zinc-500">R:R</p>
              <p className="text-sm font-semibold text-emerald-500">
                {plan.metrics.rr.toFixed(1)}:1
              </p>
            </div>
            <div className="rounded bg-zinc-800/50 p-2 text-center">
              <p className="text-xs text-zinc-500">Expectancy</p>
              <p className="text-sm font-semibold text-zinc-300">
                {plan.metrics.expectancy.toFixed(2)}
              </p>
            </div>
            <div className="rounded bg-zinc-800/50 p-2 text-center">
              <p className="text-xs text-zinc-500">Win Prob</p>
              <p className="text-sm font-semibold text-zinc-300">
                {(plan.metrics.win_prob * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="mt-4">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Pre-Trade Checklist
            </p>
            <div className="mt-2 space-y-2">
              {plan.checklist.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 rounded bg-zinc-800/30 p-2 cursor-pointer hover:bg-zinc-800/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={checklistState[item] || false}
                    onChange={() => toggleCheck(item)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-300">
                    {item.replace(/_/g, ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Notes */}
          {plan.notes && (
            <div className="mt-4 rounded bg-zinc-800/30 p-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                Notes
              </p>
              <p className="mt-1 text-sm leading-relaxed text-zinc-400">
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
            <button
              onClick={onReject}
              className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 py-3 text-sm font-medium text-zinc-300 transition-colors hover:bg-zinc-800 active:scale-[0.98]"
              style={{
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--duration-short) var(--ease-in-out)',
              }}
            >
              <XCircle size={16} className="inline mr-2" />
              Reject
            </button>
          )}
          {onAccept && (
            <button
              onClick={onAccept}
              disabled={plan ? !allChecked : false}
              className={`flex-1 rounded-lg py-3 text-sm font-medium transition-colors active:scale-[0.98] ${
                plan && !allChecked
                  ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
              style={{
                borderRadius: 'var(--radius-md)',
                transition: 'all var(--duration-short) var(--ease-in-out)',
              }}
            >
              <CheckCircle2 size={16} className="inline mr-2" />
              {plan && !allChecked ? 'Complete Checklist' : 'Accept & Execute'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * SignalsPage - Trading Signals Dashboard
 *
 * Displays all detected signals with filtering and sorting:
 * - Pattern filter (momentum, breakout, etc.)
 * - Direction filter (long/short)
 * - Confidence threshold
 * - Recent signals grid
 * - Quick stats overview
 */

import { useState } from 'react'
import { Filter, AlertCircle } from '@/lib/icons'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { useSignals } from '@/hooks/useSignals'
import SignalCard from '@/components/signals/SignalCard'
import SignalReviewCard from '@/components/signals/SignalReviewCard'
import StateView from '@/components/ui/StateView'
import Button from '@/components/ui/Button'
import type { Signal } from '@/types/signal'

export default function SignalsPage() {
  const [selectedPattern, setSelectedPattern] = useState<Signal['pattern'] | 'all'>('all')
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null)
  const [minConfidence, setMinConfidence] = useState(0.6)

  const { signals, loading, error } = useSignals(
    selectedPattern === 'all' ? undefined : selectedPattern
  )

  const filteredSignals = signals.filter((s) => s.confidence >= minConfidence)

  const selectedSignal = selectedSignalId
    ? signals.find((s) => s.id === selectedSignalId)
    : null

  const stats = {
    total: filteredSignals.length,
    high_confidence: filteredSignals.filter((s) => s.confidence >= 0.75).length,
    long: filteredSignals.filter((s) => s.direction === 'long').length,
    short: filteredSignals.filter((s) => s.direction === 'short').length,
  }

  const headerMeta = `${stats.total} signals · ${(minConfidence * 100).toFixed(0)}% min confidence`
  const statTiles: Array<{ label: string; value: number; tone?: 'positive' | 'negative' | 'neutral' }> = [
    { label: 'Total', value: stats.total, tone: 'neutral' },
    { label: 'High confidence', value: stats.high_confidence, tone: 'positive' },
    { label: 'Long', value: stats.long, tone: 'positive' },
    { label: 'Short', value: stats.short, tone: 'negative' },
  ]

  const statToneClass = (tone: 'positive' | 'negative' | 'neutral' = 'neutral') => {
    if (tone === 'positive') return 'text-sentiment-bull'
    if (tone === 'negative') return 'text-sentiment-bear'
    return 'text-text-primary'
  }

  const patterns: Array<Signal['pattern'] | 'all'> = [
    'all',
    'momentum',
    'breakout',
    'reversal',
    'range-bounce',
    'mean-reversion',
    'continuation',
  ]

  return (
    <div data-testid="signals-page">
      <DashboardShell
        title="Signals"
        description="Live AI and rule-based setups ready for review."
        meta={headerMeta}
        actions={
          <p className="text-xs uppercase tracking-wide text-text-tertiary">
            {filteredSignals.length} matching
          </p>
        }
      >
        <div className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statTiles.map((tile) => (
              <div key={tile.label} className="card rounded-3xl border border-border-subtle bg-surface p-4">
                <p className="text-xs uppercase tracking-wide text-text-tertiary">{tile.label}</p>
                <p className={`mt-2 text-2xl font-semibold ${statToneClass(tile.tone)}`}>{tile.value}</p>
              </div>
            ))}
          </section>

          <section className="grid gap-4 lg:grid-cols-12">
            <div className="card space-y-4 rounded-3xl p-6 lg:col-span-4">
              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <Filter size={16} />
                Filters
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-text-tertiary">Pattern</label>
                <div className="flex flex-wrap gap-2">
                  {patterns.map((pattern) => {
                    const isActive = selectedPattern === pattern
                    return (
                      <Button
                        key={pattern}
                        variant={isActive ? 'primary' : 'ghost'}
                        size="sm"
                        className="capitalize"
                        onClick={() => setSelectedPattern(pattern)}
                      >
                        {pattern === 'all' ? 'All' : pattern.replace('-', ' ')}
                      </Button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs uppercase tracking-wide text-text-tertiary">
                  Min confidence: {(minConfidence * 100).toFixed(0)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minConfidence}
                  onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                  className="w-full accent-brand"
                />
              </div>
            </div>

            <div className="card rounded-3xl p-0 lg:col-span-8">
              <div className="p-6">
                {loading ? (
                  <StateView type="loading" description="Loading signals..." />
                ) : error ? (
                  <StateView type="error" description="Failed to load signals" />
                ) : filteredSignals.length === 0 ? (
                  <StateView
                    type="empty"
                    description="No signals match your filters"
                    icon={<AlertCircle size={48} className="text-text-tertiary" />}
                  />
                ) : (
                  <div className="space-y-3">
                    {filteredSignals.map((signal) => (
                      <SignalCard key={signal.id} signal={signal} onClick={() => setSelectedSignalId(signal.id)} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </DashboardShell>

      {selectedSignal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 md:items-center"
          onClick={() => setSelectedSignalId(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl border border-border bg-bg md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-bg p-4">
              <h2 className="text-lg font-semibold text-text-primary">Signal Details</h2>
              <button
                onClick={() => setSelectedSignalId(null)}
                className="text-text-secondary transition hover:text-text-primary"
              >
                ✕
              </button>
            </div>
            <div className="p-4">
              <SignalReviewCard
                signal={selectedSignal}
                onAccept={() => {
                  console.log('Signal accepted:', selectedSignal.id)
                  setSelectedSignalId(null)
                }}
                onReject={() => {
                  console.log('Signal rejected:', selectedSignal.id)
                  setSelectedSignalId(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

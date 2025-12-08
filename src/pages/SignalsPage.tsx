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
import { TrendingUp, Filter, AlertCircle } from '@/lib/icons'
import { useSignals } from '@/hooks/useSignals'
import SignalCard from '@/components/signals/SignalCard'
import SignalReviewCard from '@/components/signals/SignalReviewCard'
import StateView from '@/components/ui/StateView'
import type { Signal } from '@/types/signal'

export default function SignalsPage() {
  const [selectedPattern, setSelectedPattern] = useState<Signal['pattern'] | 'all'>('all')
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null)
  const [minConfidence, setMinConfidence] = useState(0.6)

  const { signals, loading, error } = useSignals(
    selectedPattern === 'all' ? undefined : selectedPattern
  )

  // Filter by confidence
  const filteredSignals = signals.filter((s) => s.confidence >= minConfidence)

  // Get selected signal details
  const selectedSignal = selectedSignalId
    ? signals.find((s) => s.id === selectedSignalId)
    : null

  // Calculate stats
  const stats = {
    total: filteredSignals.length,
    high_confidence: filteredSignals.filter((s) => s.confidence >= 0.75).length,
    long: filteredSignals.filter((s) => s.direction === 'long').length,
    short: filteredSignals.filter((s) => s.direction === 'short').length,
  }

  // Patterns for filter
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
    <div className="min-h-screen bg-bg pb-20 md:pb-8">
      {/* Header */}
      <header className="border-b border-moderate bg-surface p-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand/10 p-2">
              <TrendingUp size={24} className="text-brand" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-primary">Trading Signals</h1>
              <p className="text-sm text-secondary">
                Detected patterns & trade opportunities
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl p-4 pb-20 md:pb-6 space-y-4">
        {/* Stats Overview */}
        <div className="grid grid-cols-4 gap-2">
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">Total</p>
            <p className="text-xl font-semibold text-primary">{stats.total}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">High Conf.</p>
            <p className="text-xl font-semibold text-success">{stats.high_confidence}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">Long</p>
            <p className="text-xl font-semibold text-sentiment-bull">{stats.long}</p>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-3 text-center">
            <p className="text-xs text-tertiary">Short</p>
            <p className="text-xl font-semibold text-sentiment-bear">{stats.short}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-subtle bg-surface p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-secondary" />
            <p className="text-sm font-medium text-secondary">Filters</p>
          </div>

          {/* Pattern Filter */}
          <div>
            <label className="text-xs text-tertiary mb-1 block">Pattern</label>
            <div className="flex flex-wrap gap-2">
              {patterns.map((pattern) => (
                <button
                  key={pattern}
                  onClick={() => setSelectedPattern(pattern)}
                  className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedPattern === pattern
                      ? 'bg-brand text-bg'
                      : 'bg-surface-hover text-secondary hover:bg-surface'
                  }`}
                >
                  {pattern === 'all' ? 'All' : pattern.replace('-', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Confidence Threshold */}
          <div>
            <label className="text-xs text-tertiary mb-1 block">
              Min Confidence: {(minConfidence * 100).toFixed(0)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={minConfidence}
              onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        {/* Signals List */}
        {loading ? (
          <StateView type="loading" description="Loading signals..." />
        ) : error ? (
          <StateView type="error" description="Failed to load signals" />
        ) : filteredSignals.length === 0 ? (
          <StateView
            type="empty"
            description="No signals match your filters"
            icon={<AlertCircle size={48} className="text-tertiary" />}
          />
        ) : (
          <div className="space-y-3">
            {filteredSignals.map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onClick={() => setSelectedSignalId(signal.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Signal Detail Modal */}
      {selectedSignal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 md:items-center"
          onClick={() => setSelectedSignalId(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-t-2xl bg-bg md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-bg border-b border-subtle p-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-primary">Signal Details</h2>
              <button
                onClick={() => setSelectedSignalId(null)}
                className="text-secondary hover:text-primary"
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

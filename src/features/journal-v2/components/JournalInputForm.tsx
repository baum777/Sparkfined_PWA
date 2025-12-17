import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui'
import { Collapsible } from '@/components/ui/Collapsible'
import type { JournalRawInput, EmotionLabel, MarketContext, TradeContext } from '../types'
import { cn } from '@/lib/ui/cn'

const JournalTemplatesSection = React.lazy(() => import('./JournalTemplatesSection'))
const EmotionalSlider = React.lazy(() =>
  import('@/components/journal/EmotionalSlider').then((mod) => ({ default: mod.EmotionalSlider })),
)

interface JournalInputFormProps {
  onSubmit: (input: JournalRawInput) => Promise<void> | void
  isSubmitting?: boolean
  tradeContext?: TradeContext
  onClearTradeContext?: () => void
}

const emotionOptions: Array<{ value: EmotionLabel; label: string }> = [
  { value: 'calm', label: 'Calm' },
  { value: 'excitement', label: 'Excitement' },
  { value: 'greed', label: 'Greed' },
  { value: 'fear', label: 'Fear' },
  { value: 'anxiety', label: 'Anxiety' },
  { value: 'overconfidence', label: 'Overconfidence' },
]

const contextOptions: Array<{ value: MarketContext; label: string }> = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'mean-reversion', label: 'Mean Reversion' },
  { value: 'chop', label: 'Chop / Range' },
  { value: 'high-vol', label: 'High Volatility' },
  { value: 'low-vol', label: 'Low Volatility' },
  { value: 'trend-up', label: 'Trending Up' },
  { value: 'trend-down', label: 'Trending Down' },
]

const sliderClasses =
  'w-full accent-brand transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus'

function getEmotionalZoneLabel(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  if (clamped <= 20) return 'Sehr unsicher'
  if (clamped <= 40) return 'Unsicher'
  if (clamped <= 60) return 'Neutral'
  if (clamped <= 80) return 'Optimistisch'
  return 'Sehr optimistisch'
}

export function JournalInputForm({ onSubmit, isSubmitting, tradeContext, onClearTradeContext }: JournalInputFormProps) {
  const [emotionalState, setEmotionalState] = useState<EmotionLabel>('calm')
  const [emotionalScore, setEmotionalScore] = useState(50)
  const [conviction, setConviction] = useState(5)
  const [patternQuality, setPatternQuality] = useState(5)
  const [marketContext, setMarketContext] = useState<MarketContext>('chop')
  const [reasoning, setReasoning] = useState('')
  const [expectation, setExpectation] = useState('')
  const [selfReflection, setSelfReflection] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const isSubmittingRef = useRef(false)

  useEffect(() => {
    if (!tradeContext) return

    setReasoning((previous) =>
      previous.trim().length
        ? previous
        : `Auto-captured ${tradeContext.side} ${tradeContext.baseSymbol ?? 'trade'} via ${tradeContext.walletId ?? 'wallet'} (tx ${tradeContext.txHash}).`,
    )
    setExpectation((previous) =>
      previous.trim().length
        ? previous
        : `Journaling on-chain ${tradeContext.side} from ${new Date(tradeContext.timestamp).toUTCString()}.`,
    )
    setSelfReflection((previous) => (previous.trim().length ? previous : 'Note any emotion at entry or sizing decision.'))

    if (tradeContext.side === 'BUY') {
      setConviction((value) => Math.max(value, 6))
    }
  }, [tradeContext])

  const convictionLabel = useMemo(() => {
    if (conviction <= 3) return 'Low'
    if (conviction <= 6) return 'Medium'
    return 'High'
  }, [conviction])

  const patternQualityLabel = useMemo(() => {
    if (patternQuality <= 3) return 'Weak'
    if (patternQuality <= 6) return 'OK'
    return 'Strong'
  }, [patternQuality])

  const emotionalZoneLabel = useMemo(() => getEmotionalZoneLabel(emotionalScore), [emotionalScore])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // Prevent double-submit
    if (isSubmittingRef.current || isSubmitting) return
    isSubmittingRef.current = true

    const createdAt = tradeContext?.timestamp ?? Date.now()

    try {
      await onSubmit({
        emotionalState,
        emotionalScore,
        conviction,
        patternQuality,
        marketContext,
        reasoning,
        expectation,
        selfReflection,
        createdAt,
        tradeContext,
      })
    } finally {
      isSubmittingRef.current = false
    }
  }

  const handleReset = () => {
    setEmotionalState('calm')
    setEmotionalScore(50)
    setConviction(5)
    setPatternQuality(5)
    setMarketContext('chop')
    setReasoning('')
    setExpectation('')
    setSelfReflection('')
    onClearTradeContext?.()
  }

  const canSubmit = !isSubmitting && reasoning.trim().length > 0

  return (
    <Card variant="glass" className="relative border-border/70 shadow-card-subtle" data-testid="journal-v2-form">
      <CardHeader className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Badge variant="brand" className="mb-2 uppercase tracking-wide text-xs">Journal</Badge>
          <CardTitle className="text-xl">Capture your trading state</CardTitle>
          <p className="text-sm text-text-secondary">
            Map emotions, conviction, and context before you enter.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span className="inline-flex h-2 w-2 rounded-full bg-brand" aria-hidden />
          Offline-first
        </div>
      </CardHeader>

      <CardContent className="pb-20">
        {tradeContext ? (
          <div
            className="mb-6 rounded-2xl border border-border/70 bg-surface/60 p-4 shadow-card-subtle"
            data-testid="journal-trade-context"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-text-tertiary">Prefilled from on-chain trade</p>
                <p className="text-sm font-semibold text-text-primary">
                  {tradeContext.baseSymbol ?? 'Asset'} {tradeContext.side}
                </p>
                <p className="text-xs text-text-secondary">
                  {new Intl.DateTimeFormat('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false,
                    timeZone: 'UTC',
                  }).format(tradeContext.timestamp)}{' '}
                  · {tradeContext.txHash.slice(0, 8)}…
                </p>
              </div>
              {onClearTradeContext ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearTradeContext}
                  className={cn('self-start text-text-secondary hover:text-text-primary')}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}

        <form ref={formRef} className="space-y-6" onSubmit={handleSubmit}>
          <React.Suspense fallback={null}>
            <JournalTemplatesSection
              reasoning={reasoning}
              setReasoning={setReasoning}
              expectation={expectation}
              setExpectation={setExpectation}
              selfReflection={selfReflection}
              setSelfReflection={setSelfReflection}
              marketContext={marketContext}
              setMarketContext={setMarketContext}
              emotionalScore={emotionalScore}
              setEmotionalScore={setEmotionalScore}
            />
          </React.Suspense>

          {/* Section 1: State (Required, always visible) */}
          <section className="space-y-4" data-testid="journal-section-state">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">1. Emotional State</h3>
              <Badge variant="warning" className="text-[10px]">Required</Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Current emotion</label>
                <Select
                  value={emotionalState}
                  onChange={(value) => setEmotionalState(value as EmotionLabel)}
                  options={emotionOptions}
                  placeholder="Select your current state"
                  triggerProps={{ 'data-testid': 'journal-v2-emotion' }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium text-text-primary">
                  <span>Emotional position</span>
                  <span className="text-text-secondary">{emotionalZoneLabel}</span>
                </div>
                <React.Suspense
                  fallback={
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={emotionalScore}
                      onChange={(event) => setEmotionalScore(Number(event.target.value))}
                      className={sliderClasses}
                      aria-label="Emotional position (Unsicher bis Optimistisch)"
                      data-testid="journal-v2-emotional-score"
                    />
                  }
                >
                  <EmotionalSlider
                    value={emotionalScore}
                    onChange={setEmotionalScore}
                    ariaLabel="Emotional position (Unsicher bis Optimistisch)"
                    showNeutralMarker
                    data-testid="journal-v2-emotional-score"
                  />
                </React.Suspense>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium text-text-primary">
                  <span>Conviction</span>
                  <span className="text-text-secondary">{convictionLabel}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={conviction}
                  onChange={(event) => setConviction(Number(event.target.value))}
                  className={sliderClasses}
                  data-testid="journal-v2-conviction"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-medium text-text-primary">
                  <span>Pattern quality</span>
                  <span className="text-text-secondary">{patternQualityLabel}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={10}
                  value={patternQuality}
                  onChange={(event) => setPatternQuality(Number(event.target.value))}
                  className={sliderClasses}
                  data-testid="journal-v2-pattern-quality"
                />
              </div>
            </div>
          </section>

          {/* Section 2: Context (Optional, collapsible) */}
          <Collapsible
            title={
              <div className="flex items-center gap-2">
                <span>2. Market Context</span>
                <Badge variant="outline" className="text-[10px]">Optional</Badge>
              </div>
            }
            defaultOpen={false}
            variant="card"
            className="border-border/50"
          >
            <div className="space-y-4" data-testid="journal-section-context">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Current market regime</label>
                <Select
                  value={marketContext}
                  onChange={(value) => setMarketContext(value as MarketContext)}
                  options={contextOptions}
                  placeholder="Where is the market right now?"
                  triggerProps={{ 'data-testid': 'journal-v2-market-context' }}
                />
                <p className="text-xs text-text-tertiary">
                  Helps identify patterns in your performance across different conditions.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Self reflection</label>
                <Textarea
                  value={selfReflection}
                  onChange={(event) => setSelfReflection(event.target.value)}
                  placeholder="What bias or habit should you watch?"
                  data-testid="journal-v2-reflection"
                  rows={2}
                />
              </div>
            </div>
          </Collapsible>

          {/* Section 3: Thesis (Required) */}
          <section className="space-y-4" data-testid="journal-section-thesis">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-text-primary">3. Trade Thesis</h3>
              <Badge variant="warning" className="text-[10px]">Required</Badge>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Reasoning</label>
                <Textarea
                  value={reasoning}
                  onChange={(event) => setReasoning(event.target.value)}
                  placeholder="Setup, catalysts, and risk context. What is your thesis and invalidation?"
                  data-testid="journal-v2-reasoning"
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-text-primary">Expectation</label>
                <Input
                  value={expectation}
                  onChange={(event) => setExpectation(event.target.value)}
                  placeholder="What outcome are you anticipating?"
                  data-testid="journal-v2-expectation"
                />
              </div>
            </div>
          </section>
        </form>
      </CardContent>

      {/* Sticky action bar */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 rounded-b-2xl border-t border-border/70 bg-surface-elevated/95 px-6 py-4 backdrop-blur"
        data-testid="journal-action-bar"
      >
        <p className="hidden text-xs text-text-tertiary sm:block">
          Entries are stored locally with timestamps.
        </p>
        <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isSubmitting}
            data-testid="journal-v2-reset"
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={!canSubmit}
            onClick={() => formRef.current?.requestSubmit()}
            data-testid="journal-v2-submit"
          >
            {isSubmitting ? 'Analyzing…' : 'Run Journal'}
          </Button>
        </div>
      </div>
    </Card>
  )
}

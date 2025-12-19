import React, { useMemo, useState, useEffect, useRef, useImperativeHandle } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui'
import type { JournalRawInput, EmotionLabel, MarketContext, ThesisScreenshotReference, TradeContext } from '../types'
import { cn } from '@/lib/ui/cn'
import { EmotionalStateCard } from '@/features/journal/EmotionalStateCard'
import { MarketContextAccordion } from '@/features/journal/MarketContextAccordion'
import { TradeThesisCard } from '@/features/journal/TradeThesisCard'
import { TagInput } from '@/features/journal/TagInput'
import { AINotesGenerator } from '@/features/journal/AINotesGenerator'
import { applyTemplateToDraft } from '@/components/journal/templates/template-utils'
import type { JournalTemplateFields, TemplateApplyMode } from '@/components/journal/templates/types'

const JournalTemplatesSection = React.lazy(() => import('./JournalTemplatesSection'))

interface JournalInputFormProps {
  onSubmit: (input: JournalRawInput) => Promise<void> | void
  isSubmitting?: boolean
  tradeContext?: TradeContext
  onClearTradeContext?: () => void
}

export interface JournalInputFormHandle {
  applyTemplate: (fields: JournalTemplateFields, mode: TemplateApplyMode) => void
}

function getEmotionalZoneLabel(score: number): string {
  const clamped = Math.max(0, Math.min(100, Math.round(score)))
  if (clamped <= 20) return 'Very uncertain'
  if (clamped <= 40) return 'Uncertain'
  if (clamped <= 60) return 'Neutral'
  if (clamped <= 80) return 'Optimistic'
  return 'Very optimistic'
}

export const JournalInputForm = React.forwardRef<JournalInputFormHandle, JournalInputFormProps>(function JournalInputForm(
  { onSubmit, isSubmitting, tradeContext, onClearTradeContext }: JournalInputFormProps,
  ref,
) {
  const [emotionalState, setEmotionalState] = useState<EmotionLabel>('calm')
  const [emotionalScore, setEmotionalScore] = useState(50)
  const [conviction, setConviction] = useState(5)
  const [patternQuality, setPatternQuality] = useState(5)
  const [marketContext, setMarketContext] = useState<MarketContext>('chop')
  const [reasoning, setReasoning] = useState('')
  const [expectation, setExpectation] = useState('')
  const [thesisTags, setThesisTags] = useState<string[]>([])
  const [thesisScreenshots, setThesisScreenshots] = useState<ThesisScreenshotReference[]>([])
  const [aiNotes, setAiNotes] = useState('')
  const [selfReflection, setSelfReflection] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const isSubmittingRef = useRef(false)

  useImperativeHandle(
    ref,
    () => ({
      applyTemplate: (fields, mode) => {
        const next = applyTemplateToDraft(
          { reasoning, expectation, selfReflection, marketContext, emotionalScore },
          fields,
          mode,
        )
        setReasoning(next.reasoning)
        setExpectation(next.expectation)
        setSelfReflection(next.selfReflection)
        setMarketContext(next.marketContext)
        setEmotionalScore(next.emotionalScore)
      },
    }),
    [emotionalScore, expectation, marketContext, reasoning, selfReflection],
  )

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
      thesisTags,
      thesisScreenshots,
      aiNotes,
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
    setThesisTags([])
    setThesisScreenshots([])
    setAiNotes('')
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

            <EmotionalStateCard
              emotion={emotionalState}
              onEmotionChange={(value) => setEmotionalState(value)}
              confidence={emotionalScore}
              onConfidenceChange={setEmotionalScore}
              confidenceValueText={`${emotionalZoneLabel} confidence`}
              conviction={conviction}
              onConvictionChange={setConviction}
              patternQuality={patternQuality}
              onPatternQualityChange={setPatternQuality}
              showAdvancedDefault={false}
              className="sf-journal-emotional-card"
            />
          </section>

          {/* Section 2: Context (Optional, accordion) */}
          <MarketContextAccordion
            value={marketContext}
            onChange={(value) => setMarketContext(value)}
            defaultOpen={false}
          >
            <div className="space-y-2" data-testid="journal-section-context">
              <label className="text-sm font-medium text-text-primary">Self reflection</label>
              <Textarea
                value={selfReflection}
                onChange={(event) => setSelfReflection(event.target.value)}
                placeholder="What bias or habit should you watch?"
                data-testid="journal-v2-reflection"
                rows={2}
              />
            </div>
          </MarketContextAccordion>

          {/* Section 3: Thesis (Required) */}
          <section className="space-y-4" data-testid="journal-section-thesis">
            <TradeThesisCard
              reasoning={reasoning}
              expectation={expectation}
              onReasoningChange={setReasoning}
              onExpectationChange={setExpectation}
              screenshots={thesisScreenshots}
              onScreenshotAdd={(reference) => setThesisScreenshots((previous) => [...previous, reference])}
              onScreenshotRemove={(id) =>
                setThesisScreenshots((previous) => previous.filter((item) => item.id !== id))
              }
            >
              <TagInput value={thesisTags} onChange={setThesisTags} />
              <AINotesGenerator
                tags={thesisTags}
                thesis={`${reasoning}\n${expectation}`}
                value={aiNotes}
                onChange={setAiNotes}
              />
            </TradeThesisCard>
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
})

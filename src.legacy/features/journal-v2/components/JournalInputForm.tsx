import React, { useMemo, useState, useEffect, useRef, useImperativeHandle } from 'react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui'
import type { JournalRawInput, EmotionLabel, MarketContext, ThesisScreenshotReference, TradeContext } from '../types'
import { cn } from '@/lib/ui/cn'
import { EmotionalStateCard } from '@/features/journal/EmotionalStateCard'
import { MarketContextAccordion } from '@/features/journal/MarketContextAccordion'
import { TradeThesisCard } from '@/features/journal/TradeThesisCard'
import { TagInput } from '@/features/journal/TagInput'
import { AINotesGenerator } from '@/features/journal/AINotesGenerator'
import { useAutoSave } from '@/features/journal/useAutoSave'
import { Telemetry } from '@/lib/TelemetryService'
import { applyTemplateToDraft } from '@/components/journal/templates/template-utils'
import type { JournalTemplateFields, TemplateApplyMode } from '@/components/journal/templates/types'

const JournalTemplatesSection = React.lazy(() => import('./JournalTemplatesSection'))

const JOURNAL_DRAFT_STORAGE_KEY = 'journal-v2-draft'

export type JournalFormDraft = {
  emotionalState: EmotionLabel
  emotionalScore: number
  conviction: number
  patternQuality: number
  marketContext: MarketContext
  reasoning: string
  expectation: string
  thesisTags: string[]
  thesisScreenshots: ThesisScreenshotReference[]
  aiNotes: string
  selfReflection: string
}

type StoredJournalDraft = {
  draft: JournalFormDraft
  savedAt: number
}

const defaultJournalDraft: JournalFormDraft = {
  emotionalState: 'calm',
  emotionalScore: 50,
  conviction: 5,
  patternQuality: 5,
  marketContext: 'chop',
  reasoning: '',
  expectation: '',
  thesisTags: [],
  thesisScreenshots: [],
  aiNotes: '',
  selfReflection: '',
}

function readDraftFromStorage(): StoredJournalDraft | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(JOURNAL_DRAFT_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredJournalDraft
    if (!parsed || typeof parsed !== 'object' || !parsed.draft) return null
    return parsed
  } catch (error) {
    console.warn('Unable to parse journal draft', error)
    return null
  }
}

function clearDraftFromStorage() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(JOURNAL_DRAFT_STORAGE_KEY)
}

interface JournalInputFormProps {
  onSubmit: (input: JournalRawInput) => Promise<void> | void
  isSubmitting?: boolean
  tradeContext?: TradeContext
  onClearTradeContext?: () => void
}

export interface JournalInputFormHandle {
  applyTemplate: (fields: JournalTemplateFields, mode: TemplateApplyMode, templateId?: string) => void
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
  const initialStoredDraftRef = useRef<StoredJournalDraft | null>(readDraftFromStorage())
  const [emotionalState, setEmotionalState] = useState<EmotionLabel>(
    initialStoredDraftRef.current?.draft.emotionalState ?? defaultJournalDraft.emotionalState,
  )
  const [emotionalScore, setEmotionalScore] = useState(
    initialStoredDraftRef.current?.draft.emotionalScore ?? defaultJournalDraft.emotionalScore,
  )
  const [conviction, setConviction] = useState(
    initialStoredDraftRef.current?.draft.conviction ?? defaultJournalDraft.conviction,
  )
  const [patternQuality, setPatternQuality] = useState(
    initialStoredDraftRef.current?.draft.patternQuality ?? defaultJournalDraft.patternQuality,
  )
  const [marketContext, setMarketContext] = useState<MarketContext>(
    initialStoredDraftRef.current?.draft.marketContext ?? defaultJournalDraft.marketContext,
  )
  const [reasoning, setReasoning] = useState(initialStoredDraftRef.current?.draft.reasoning ?? defaultJournalDraft.reasoning)
  const [expectation, setExpectation] = useState(
    initialStoredDraftRef.current?.draft.expectation ?? defaultJournalDraft.expectation,
  )
  const [thesisTags, setThesisTags] = useState<string[]>(
    initialStoredDraftRef.current?.draft.thesisTags ?? defaultJournalDraft.thesisTags,
  )
  const [thesisScreenshots, setThesisScreenshots] = useState<ThesisScreenshotReference[]>(
    initialStoredDraftRef.current?.draft.thesisScreenshots ?? defaultJournalDraft.thesisScreenshots,
  )
  const [aiNotes, setAiNotes] = useState(initialStoredDraftRef.current?.draft.aiNotes ?? defaultJournalDraft.aiNotes)
  const [selfReflection, setSelfReflection] = useState(
    initialStoredDraftRef.current?.draft.selfReflection ?? defaultJournalDraft.selfReflection,
  )
  const [touchedFields, setTouchedFields] = useState<{ reasoning: boolean; expectation: boolean }>({
    reasoning: false,
    expectation: false,
  })
  const templateAppliedRef = useRef(false)
  const [pendingTemplate, setPendingTemplate] = useState<{ fields: JournalTemplateFields; templateId?: string } | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const isSubmittingRef = useRef(false)

  const openTemplateSuggestion = (fields: JournalTemplateFields, templateId?: string) => {
    setPendingTemplate({ fields, templateId })
  }

  const applyTemplate = (fields: JournalTemplateFields, mode: Exclude<TemplateApplyMode, 'suggest'>, templateId?: string) => {
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
    templateAppliedRef.current = true
    setPendingTemplate(null)
    Telemetry.log('ui.journal.template_applied', 1, { templateId, mode })
  }

  useImperativeHandle(
    ref,
    () => ({
      applyTemplate: (fields, mode, templateId) => {
        if (mode === 'suggest') {
          openTemplateSuggestion(fields, templateId)
          return
        }
        applyTemplate(fields, mode, templateId)
      },
    }),
    [applyTemplate, emotionalScore, expectation, marketContext, reasoning, selfReflection],
  )

  const draftState = useMemo<JournalFormDraft>(
    () => ({
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
    }),
    [
      aiNotes,
      conviction,
      emotionalScore,
      emotionalState,
      expectation,
      marketContext,
      patternQuality,
      reasoning,
      selfReflection,
      thesisScreenshots,
      thesisTags,
    ],
  )

  const { lastSavedAt, isSaving, saveNow } = useAutoSave<JournalFormDraft>({
    key: JOURNAL_DRAFT_STORAGE_KEY,
    value: draftState,
    intervalMs: 30_000,
    initialSavedAt: initialStoredDraftRef.current?.savedAt ?? null,
    serialize: (draft, savedAt) => JSON.stringify({ draft, savedAt }),
    diffSerializer: (draft) => JSON.stringify(draft),
  })

  useEffect(() => {
    if (!templateAppliedRef.current) return
    templateAppliedRef.current = false
    void saveNow()
  }, [draftState, saveNow])

  const validationErrors = useMemo(
    () => ({
      reasoning: reasoning.trim().length ? null : 'Reasoning is required',
      expectation: expectation.trim().length ? null : 'Expectation is required',
    }),
    [expectation, reasoning],
  )

  const hasValidationErrors = Object.values(validationErrors).some(Boolean)

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

  const autosaveLabel = useMemo(() => {
    if (isSaving) return 'Saving draft…'
    if (lastSavedAt) {
      return `Saved at ${new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(lastSavedAt)}`
    }
    return 'Draft will auto-save every 30s'
  }, [isSaving, lastSavedAt])

  const markReasoningTouched = () => setTouchedFields((previous) => ({ ...previous, reasoning: true }))
  const markExpectationTouched = () => setTouchedFields((previous) => ({ ...previous, expectation: true }))

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setTouchedFields({ reasoning: true, expectation: true })
    if (hasValidationErrors) {
      return
    }

    // Prevent double-submit
    if (isSubmittingRef.current || isSubmitting) return
    isSubmittingRef.current = true

    const createdAt = tradeContext?.timestamp ?? Date.now()

    try {
      await saveNow()
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
    setEmotionalState(defaultJournalDraft.emotionalState)
    setEmotionalScore(defaultJournalDraft.emotionalScore)
    setConviction(defaultJournalDraft.conviction)
    setPatternQuality(defaultJournalDraft.patternQuality)
    setMarketContext(defaultJournalDraft.marketContext)
    setReasoning(defaultJournalDraft.reasoning)
    setExpectation(defaultJournalDraft.expectation)
    setThesisTags(defaultJournalDraft.thesisTags)
    setThesisScreenshots(defaultJournalDraft.thesisScreenshots)
    setAiNotes(defaultJournalDraft.aiNotes)
    setSelfReflection(defaultJournalDraft.selfReflection)
    onClearTradeContext?.()
    clearDraftFromStorage()
    setTouchedFields({ reasoning: false, expectation: false })
  }

  const canSubmit = !isSubmitting && !hasValidationErrors

  return (
    <Card
      variant="glass"
      className="relative border-border/70 shadow-card-subtle"
      data-testid="journal-v2-form"
      data-autosave-state={isSaving ? 'saving' : 'idle'}
      data-last-saved-at={lastSavedAt ?? undefined}
    >
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
              onTemplateApplied={(templateId, mode) => {
                templateAppliedRef.current = true
                Telemetry.log('ui.journal.template_applied', 1, { templateId, mode })
              }}
              onSuggestTemplate={(fields, templateId) => openTemplateSuggestion(fields, templateId)}
            />
          </React.Suspense>

          {pendingTemplate ? (
            <div
              className="rounded-2xl border border-border/70 bg-surface/60 p-4 shadow-card-subtle"
              data-testid="journal-template-suggestions"
              role="status"
              aria-label="Template suggestions"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-text-tertiary">Template suggestion</p>
                  <p className="text-sm font-semibold text-text-primary">Preview ready</p>
                  <p className="text-xs text-text-secondary">
                    Review then apply as merge or overwrite. This won’t change your draft until you confirm.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => applyTemplate(pendingTemplate.fields, 'fill-empty', pendingTemplate.templateId)}
                    data-testid="journal-template-suggest-merge"
                  >
                    Merge
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => applyTemplate(pendingTemplate.fields, 'overwrite-all', pendingTemplate.templateId)}
                    data-testid="journal-template-suggest-overwrite"
                  >
                    Overwrite
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingTemplate(null)}
                    data-testid="journal-template-suggest-dismiss"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

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
              onReasoningBlur={markReasoningTouched}
              onExpectationBlur={markExpectationTouched}
              reasoningError={touchedFields.reasoning ? validationErrors.reasoning : null}
              expectationError={touchedFields.expectation ? validationErrors.expectation : null}
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
      <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
        <p className="hidden text-xs text-text-tertiary sm:block">
          Entries are stored locally with timestamps.
        </p>
        <p className="text-xs text-text-tertiary" data-testid="journal-autosave-status">
          {autosaveLabel}
        </p>
      </div>
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

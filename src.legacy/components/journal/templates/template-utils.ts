import type { MarketContext } from '@/features/journal-v2/types'
import type { TemplateApplyMode, JournalTemplateFields } from './types'

export type JournalFormDraft = {
  reasoning: string
  expectation: string
  selfReflection: string
  marketContext: MarketContext
  emotionalScore: number
}

function isBlank(value: string | undefined | null): boolean {
  return (value ?? '').trim().length === 0
}

function clampScore(value: number | undefined): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function applyTemplateToDraft(
  draft: JournalFormDraft,
  template: JournalTemplateFields,
  mode: TemplateApplyMode,
): JournalFormDraft {
  const next: JournalFormDraft = { ...draft }

  const thesis = template.thesis
  const plan = template.plan
  const notes = template.notes
  const marketContext = template.marketContext
  const emotionalScore = clampScore(template.emotionalScore)

  const shouldOverwrite = mode === 'overwrite-all'

  if (shouldOverwrite || isBlank(next.reasoning)) {
    if (!isBlank(thesis)) next.reasoning = thesis!.trim()
  }
  if (shouldOverwrite || isBlank(next.expectation)) {
    if (!isBlank(plan)) next.expectation = plan!.trim()
  }
  if (shouldOverwrite || isBlank(next.selfReflection)) {
    if (!isBlank(notes)) next.selfReflection = notes!.trim()
  }

  // For non-string fields, "fill-empty" only applies if user is still on the form defaults.
  if (shouldOverwrite) {
    if (marketContext) next.marketContext = marketContext
    if (typeof emotionalScore === 'number') next.emotionalScore = emotionalScore
  } else {
    if (marketContext && next.marketContext === 'chop') next.marketContext = marketContext
    if (typeof emotionalScore === 'number' && next.emotionalScore === 50) next.emotionalScore = emotionalScore
  }

  return next
}


import type { MarketContext } from '@/features/journal-v2/types'

export type JournalTemplateId = string

export type JournalTemplateKind = 'builtin' | 'custom'

/**
 * Template values map onto the current Journal V2 capture form fields.
 * (We keep this aligned to the existing `JournalRawInput` shape to avoid
 * changing persistence/business logic.)
 */
export type JournalTemplateFields = {
  /** Maps to JournalRawInput.reasoning (textarea) */
  thesis?: string
  /** Maps to JournalRawInput.expectation (input) */
  plan?: string
  /**
   * Maps to JournalRawInput.selfReflection (textarea).
   * We store multiple sections as text (Risk / Invalidation / Bias / Notes).
   */
  notes?: string
  marketContext?: MarketContext
  /** Emotional slider preset (0–100). */
  emotionalScore?: number
}

export type JournalTemplate = {
  id: JournalTemplateId
  kind: JournalTemplateKind
  name: string
  fields: JournalTemplateFields
  createdAt: number
  updatedAt: number
}

export type TemplateApplyMode = 'fill-empty' | 'overwrite-all'


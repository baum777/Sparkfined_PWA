import React, { useMemo, useState } from 'react'
import { JournalTemplatePicker } from '@/components/journal/templates/JournalTemplatePicker'
import { applyTemplateToDraft } from '@/components/journal/templates/template-utils'
import { useJournalTemplates } from '@/components/journal/templates/useJournalTemplates'
import type { MarketContext } from '@/features/journal-v2/types'

type JournalTemplatesSectionProps = {
  reasoning: string
  setReasoning: (value: string) => void
  expectation: string
  setExpectation: (value: string) => void
  selfReflection: string
  setSelfReflection: (value: string) => void
  marketContext: MarketContext
  setMarketContext: (value: MarketContext) => void
  emotionalScore: number
  setEmotionalScore: (value: number) => void
}

export function JournalTemplatesSection({
  reasoning,
  setReasoning,
  expectation,
  setExpectation,
  selfReflection,
  setSelfReflection,
  marketContext,
  setMarketContext,
  emotionalScore,
  setEmotionalScore,
}: JournalTemplatesSectionProps) {
  const templateState = useJournalTemplates()
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('builtin-neutral')

  const selectedTemplate = useMemo(
    () => templateState.templates.find((t) => t.id === selectedTemplateId) ?? templateState.templates[0],
    [selectedTemplateId, templateState.templates],
  )

  const handleApplyTemplate = (mode: 'fill-empty' | 'overwrite-all') => {
    if (!selectedTemplate) return
    const next = applyTemplateToDraft(
      { reasoning, expectation, selfReflection, marketContext, emotionalScore },
      selectedTemplate.fields,
      mode,
    )
    setReasoning(next.reasoning)
    setExpectation(next.expectation)
    setSelfReflection(next.selfReflection)
    setMarketContext(next.marketContext)
    setEmotionalScore(next.emotionalScore)
  }

  return (
    <JournalTemplatePicker
      templates={templateState.templates}
      selectedId={selectedTemplate?.id}
      onSelect={setSelectedTemplateId}
      onApply={handleApplyTemplate}
      onCreate={templateState.createCustomTemplate}
      onUpdate={templateState.updateCustomTemplate}
      onDuplicate={templateState.duplicateAsCustom}
      onDelete={templateState.deleteCustom}
      isLoading={templateState.isLoading}
      error={templateState.error}
    />
  )
}

export default JournalTemplatesSection


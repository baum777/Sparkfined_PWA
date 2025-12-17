import React, { useMemo, useState } from 'react'
import { Button, FormRow, Select } from '@/components/ui'
import type { JournalTemplate, JournalTemplateId, TemplateApplyMode } from './types'
import TemplateManagerSheet from './TemplateManagerSheet'
import type { JournalTemplateFields } from './types'

type JournalTemplatePickerProps = {
  templates: JournalTemplate[]
  selectedId?: JournalTemplateId
  onSelect: (id: JournalTemplateId) => void
  onApply: (mode: TemplateApplyMode) => void
  onCreate: (input: { name: string; fields: JournalTemplateFields }) => Promise<JournalTemplate>
  onUpdate: (template: JournalTemplate) => Promise<void>
  onDuplicate: (template: JournalTemplate) => Promise<JournalTemplate>
  onDelete: (id: JournalTemplateId) => Promise<void>
  isLoading?: boolean
  error?: string | null
  className?: string
}

export function JournalTemplatePicker({
  templates,
  selectedId,
  onSelect,
  onApply,
  onCreate,
  onUpdate,
  onDuplicate,
  onDelete,
  isLoading = false,
  error = null,
  className,
}: JournalTemplatePickerProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? templates[0],
    [selectedId, templates],
  )

  const options = useMemo(
    () => templates.map((t) => ({ value: t.id, label: `${t.name}${t.kind === 'builtin' ? '' : ' (Custom)'}` })),
    [templates],
  )

  return (
    <>
      <FormRow
        className={className}
        label="Templates"
        help="Select a template, then apply it (it won’t overwrite automatically)."
        actions={
          <Button variant="ghost" size="sm" onClick={() => setSheetOpen(true)} data-testid="journal-template-manage">
            Manage
          </Button>
        }
      >
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <Select
              value={selected?.id ?? ''}
              onChange={(value) => onSelect(value)}
              options={options}
              placeholder="Choose a template…"
              triggerProps={{ 'data-testid': 'journal-template-select' }}
              disabled={isLoading || options.length === 0}
            />
            {error ? <p className="mt-2 text-xs text-status-armed-text">{error}</p> : null}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onApply('fill-empty')}
              disabled={!selected}
              data-testid="journal-template-apply"
            >
              Apply template
            </Button>
          </div>
        </div>
      </FormRow>

      <TemplateManagerSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        templates={templates}
        selectedId={selected?.id}
        onSelect={onSelect}
        onApply={onApply}
        onCreate={onCreate}
        onUpdate={onUpdate}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        isLoading={isLoading}
        error={error}
      />
    </>
  )
}

export default JournalTemplatePicker


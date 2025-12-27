import React, { useMemo, useState } from 'react'
import { Button, FormRow, Input, RightSheet, RightSheetFooter, RightSheetSection, Select, Textarea } from '@/components/ui'
import { EmotionalSlider } from '@/components/journal/EmotionalSlider'
import { ModalConfirm } from '@/components/ui/ModalConfirm'
import type { MarketContext } from '@/features/journal-v2/types'
import type { JournalTemplate, JournalTemplateFields, JournalTemplateId, TemplateApplyMode } from './types'
import { Telemetry } from '@/lib/TelemetryService'

const MARKET_CONTEXT_OPTIONS: Array<{ value: MarketContext; label: string }> = [
  { value: 'breakout', label: 'Breakout' },
  { value: 'mean-reversion', label: 'Mean Reversion' },
  { value: 'chop', label: 'Chop / Range' },
  { value: 'high-vol', label: 'High Volatility' },
  { value: 'low-vol', label: 'Low Volatility' },
  { value: 'trend-up', label: 'Trending Up' },
  { value: 'trend-down', label: 'Trending Down' },
]

type TemplateManagerSheetProps = {
  isOpen: boolean
  onClose: () => void
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
}

export function TemplateManagerSheet({
  isOpen,
  onClose,
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
}: TemplateManagerSheetProps) {
  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? templates[0],
    [selectedId, templates],
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  const [draftName, setDraftName] = useState('')
  const [draftFields, setDraftFields] = useState<JournalTemplateFields>({})

  React.useEffect(() => {
    if (!selected) return
    setDraftName(selected.name)
    setDraftFields({ ...selected.fields })
  }, [selected?.id])

  const canEdit = selected?.kind === 'custom'

  const footer = (
    <RightSheetFooter>
      <Button variant="secondary" onClick={onClose}>
        Close
      </Button>
      <Button variant="outline" onClick={() => onApply('suggest')} disabled={!selected}>
        Suggest (preview)
      </Button>
      <Button variant="outline" onClick={() => onApply('fill-empty')} disabled={!selected}>
        Merge (fill empty)
      </Button>
      <Button variant="destructive" onClick={() => onApply('overwrite-all')} disabled={!selected}>
        Overwrite & apply
      </Button>
    </RightSheetFooter>
  )

  const handleCreate = async () => {
    setIsSaving(true)
    try {
      const created = await onCreate({
        name: 'New template',
        fields: {
          thesis: '',
          plan: '',
          notes: '',
          emotionalScore: 50,
        },
      })
      onSelect(created.id)
      Telemetry.log('ui.journal.template_saved', 1, { templateId: created.id, action: 'create' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDuplicate = async () => {
    if (!selected) return
    setIsSaving(true)
    try {
      const duplicated = await onDuplicate(selected)
      onSelect(duplicated.id)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSave = async () => {
    if (!selected || selected.kind !== 'custom') return
    setIsSaving(true)
    try {
      await onUpdate({
        ...selected,
        name: draftName,
        fields: draftFields,
      })
      Telemetry.log('ui.journal.template_saved', 1, { templateId: selected.id, action: 'update' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!selected || selected.kind !== 'custom') return
    setIsDeleting(true)
    try {
      await onDelete(selected.id)
      setConfirmDeleteOpen(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <RightSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Journal templates"
        subtitle="Select a template, then apply it safely to the current form."
        width="md"
        footer={footer}
        data-testid="journal-template-sheet"
      >
        {error ? <p className="mb-4 text-sm text-status-armed-text">{error}</p> : null}

        <RightSheetSection>
          <FormRow
            label="Templates"
            help="Built-ins are read-only. Duplicate them to customize."
            actions={
              <Button variant="primary" size="sm" onClick={handleCreate} isLoading={isSaving} disabled={isLoading}>
                New
              </Button>
            }
          >
            <div className="flex w-full flex-col gap-2">
              {templates.map((t) => {
                const active = t.id === selected?.id
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelect(t.id)}
                    className={[
                      'flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition',
                      active
                        ? 'border-glow-success bg-brand/5'
                        : 'border-border/70 bg-surface/50 hover:bg-interactive-hover',
                    ].join(' ')}
                    data-testid="journal-template-row"
                    data-active={String(active)}
                  >
                    <span className="font-medium text-text-primary">{t.name}</span>
                    <span className="text-xs text-text-tertiary">{t.kind === 'builtin' ? 'Built-in' : 'Custom'}</span>
                  </button>
                )
              })}
            </div>
          </FormRow>
        </RightSheetSection>

        {selected ? (
          <RightSheetSection className="mt-4">
            <FormRow
              label="Template details"
              help={canEdit ? 'Edit fields and Save. Apply is always manual.' : 'This template is read-only.'}
              actions={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleDuplicate} isLoading={isSaving}>
                    Duplicate
                  </Button>
                  {canEdit ? (
                    <>
                      <Button variant="secondary" size="sm" onClick={handleSave} isLoading={isSaving}>
                        Save
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDeleteOpen(true)}
                        disabled={isSaving}
                      >
                        Delete
                      </Button>
                    </>
                  ) : null}
                </div>
              }
            >
              <div className="w-full space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Name</label>
                  <Input
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    disabled={!canEdit}
                    data-testid="template-name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Emotional preset</label>
                  <EmotionalSlider
                    value={draftFields.emotionalScore ?? 50}
                    onChange={(value) => setDraftFields((prev) => ({ ...prev, emotionalScore: value }))}
                    disabled={!canEdit}
                    ariaLabel="Template emotional preset"
                    data-testid="template-emotional-score"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Market context (optional)</label>
                  <Select
                    value={draftFields.marketContext ?? ''}
                    onChange={(value) =>
                      setDraftFields((prev) => ({
                        ...prev,
                        marketContext: value ? (value as MarketContext) : undefined,
                      }))
                    }
                    options={[{ value: '', label: '— (leave unchanged)' }, ...MARKET_CONTEXT_OPTIONS]}
                    placeholder="Leave unchanged"
                    triggerProps={{ 'data-testid': 'template-market-context' }}
                    disabled={!canEdit}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Thesis</label>
                  <Textarea
                    value={draftFields.thesis ?? ''}
                    onChange={(e) => setDraftFields((prev) => ({ ...prev, thesis: e.target.value }))}
                    disabled={!canEdit}
                    rows={4}
                    data-testid="template-thesis"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Plan</label>
                  <Textarea
                    value={draftFields.plan ?? ''}
                    onChange={(e) => setDraftFields((prev) => ({ ...prev, plan: e.target.value }))}
                    disabled={!canEdit}
                    rows={3}
                    data-testid="template-plan"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">Notes / Risk / Invalidation / Bias</label>
                  <Textarea
                    value={draftFields.notes ?? ''}
                    onChange={(e) => setDraftFields((prev) => ({ ...prev, notes: e.target.value }))}
                    disabled={!canEdit}
                    rows={6}
                    data-testid="template-notes"
                  />
                </div>
              </div>
            </FormRow>
          </RightSheetSection>
        ) : null}

        {isLoading ? <p className="mt-4 text-sm text-text-tertiary">Loading templates…</p> : null}
      </RightSheet>

      <ModalConfirm
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete template?"
        description="This will permanently remove the template from this device."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="destructive"
        isConfirmLoading={isDeleting}
        onConfirm={handleDelete}
        data-testid="template-delete-confirm"
      />
    </>
  )
}

export default TemplateManagerSheet


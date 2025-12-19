import React, { useEffect, useMemo, useState } from "react"
import { Button, Badge } from "@/components/ui"
import { cn } from "@/lib/ui/cn"
import BottomSheet from "@/shared/components/BottomSheet"
import { BUILTIN_JOURNAL_TEMPLATES } from "@/components/journal/templates/template-defaults"
import { useJournalTemplates } from "@/components/journal/templates/useJournalTemplates"
import type { JournalTemplate, TemplateApplyMode } from "@/components/journal/templates/types"

interface TemplateBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  onApply: (template: JournalTemplate, mode: TemplateApplyMode) => void
  defaultMode?: TemplateApplyMode
}

function getPreviewText(template: JournalTemplate): string {
  const thesis = template.fields.thesis ?? ""
  const plan = template.fields.plan ?? ""
  const combined = [thesis, plan].filter(Boolean).join(" \u2022 ")
  return combined.slice(0, 160) || "Add a thesis and plan to keep entries consistent."
}

export function TemplateBottomSheet({ isOpen, onClose, onApply, defaultMode = "fill-empty" }: TemplateBottomSheetProps) {
  const { templates, isLoading, error } = useJournalTemplates()
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
  const [applyMode, setApplyMode] = useState<TemplateApplyMode>(defaultMode)

  const list = useMemo(() => (templates.length > 0 ? templates : BUILTIN_JOURNAL_TEMPLATES), [templates])
  const selected = useMemo(
    () => list.find((template) => template.id === selectedId) ?? list[0],
    [list, selectedId],
  )

  useEffect(() => {
    if (!isOpen) return
    if (!selected && list[0]) {
      setSelectedId(list[0].id)
    }
  }, [isOpen, list, selected])

  const handleApply = () => {
    if (!selected) return
    onApply(selected, applyMode)
    onClose()
  }

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Templates"
      subtitle="Pick a trading journal template and auto-fill your draft."
      data-testid="journal-template-sheet"
      size="lg"
      className="journal-template-sheet"
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-sm text-text-secondary">Selection applies instantly to the current draft.</p>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <span className="inline-flex h-2 w-2 rounded-full bg-brand" aria-hidden />
              <span>Tap a template to preview. Apply respects the selected overwrite mode.</span>
            </div>
          </div>
          {error ? (
            <Badge variant="warning" className="text-[11px]">
              {error}
            </Badge>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2" role="group" aria-label="Template apply mode">
          {(
            [
              { value: "fill-empty" as TemplateApplyMode, label: "Fill empty fields", helper: "Keep existing text" },
              { value: "overwrite-all" as TemplateApplyMode, label: "Overwrite all", helper: "Replace current draft" },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setApplyMode(option.value)}
              className={
                "flex min-h-[52px] min-w-[180px] flex-1 items-center justify-between rounded-xl border px-4 py-3 text-left transition" +
                (applyMode === option.value
                  ? " border-brand bg-brand/10 text-text-primary shadow-sm"
                  : " border-border bg-surface text-text-secondary hover:border-border-strong")
              }
              data-testid={`template-apply-mode-${option.value}`}
            >
              <div className="space-y-1">
                <p className="text-sm font-semibold leading-tight">{option.label}</p>
                <p className="text-xs text-text-tertiary">{option.helper}</p>
              </div>
              <span
                className={
                  "ml-3 inline-flex h-5 w-5 items-center justify-center rounded-full border" +
                  (applyMode === option.value ? " border-brand bg-brand/20" : " border-border")
                }
                aria-hidden
              >
                {applyMode === option.value ? <span className="h-2 w-2 rounded-full bg-brand" /> : null}
              </span>
            </button>
          ))}
        </div>

        <div className="space-y-3" role="list" aria-label="Templates">
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-surface/70" />
              ))}
            </div>
          ) : (
            list.map((template) => {
              const isSelected = selected?.id === template.id
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setSelectedId(template.id)}
                  className={cn(
                    "w-full rounded-2xl border px-4 py-4 text-left transition",
                    "min-h-[88px]",
                    isSelected
                      ? "border-brand bg-brand/10 shadow-sm"
                      : "border-border bg-surface hover:border-border-strong",
                  )}
                  data-testid={`journal-template-${template.id}`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-semibold text-text-primary">{template.name}</p>
                        {template.kind === "builtin" ? (
                          <Badge variant="info" className="text-[10px]">Builtin</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Custom</Badge>
                        )}
                      </div>
                      <p className="text-sm text-text-secondary leading-snug">{getPreviewText(template)}</p>
                    </div>
                    {template.fields.emotionalScore ? (
                      <span className="rounded-full bg-surface-elevated px-3 py-1 text-xs text-text-secondary" aria-label="Emotional confidence">
                        Mood {template.fields.emotionalScore}/100
                      </span>
                    ) : null}
                  </div>
                </button>
              )
            })
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={handleApply}
            disabled={!selected}
            data-testid="journal-template-apply"
          >
            Apply template
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={onClose} data-testid="journal-template-cancel">
            Cancel
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}

export default TemplateBottomSheet

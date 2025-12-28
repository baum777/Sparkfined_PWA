import React, { useState } from "react";
import { Button } from "@/components/ui";
import { JournalResultView } from "@/features/journal-v2/components/JournalResultView";
import type { JournalOutput } from "@/features/journal-v2/types";
import TemplateBottomSheet from "@/features/journal/TemplateBottomSheet";
import type { JournalTemplate, TemplateApplyMode } from "@/components/journal/templates/types";
import "./journal.css";

export interface JournalCardProps {
  result: JournalOutput;
  onApplyTemplate?: (template: JournalTemplate, mode: TemplateApplyMode) => void;
}

export function JournalCard({ result, onApplyTemplate }: JournalCardProps) {
  const [isTemplateSheetOpen, setTemplateSheetOpen] = useState(false);

  const handleApplyTemplate = (template: JournalTemplate, mode: TemplateApplyMode) => {
    onApplyTemplate?.(template, mode);
    setTemplateSheetOpen(false);
  };

  return (
    <section className="journal-shell__section" aria-label="Journal insights">
      {onApplyTemplate ? (
        <div className="journal-mobile-actions">
          <div className="space-y-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-card-subtle" aria-label="Template actions">
            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary">Use a template</p>
                <p className="text-xs text-text-secondary">Prefill the form from mobile-friendly templates.</p>
              </div>
              <Button
                type="button"
                variant="primary"
                size="lg"
                onClick={() => setTemplateSheetOpen(true)}
                className="w-full sm:w-auto"
                data-testid="journal-template-trigger"
              >
                Templates
              </Button>
            </div>
          </div>
          <TemplateBottomSheet
            isOpen={isTemplateSheetOpen}
            onClose={() => setTemplateSheetOpen(false)}
            onApply={handleApplyTemplate}
          />
        </div>
      ) : null}

      <JournalResultView result={result} />
    </section>
  );
}

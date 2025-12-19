import React, { useCallback, useRef } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorBanner } from "@/components/ui";
import { ListRow } from "@/components/ui/ListRow";
import { JournalCard } from "@/features/journal/JournalCard";
import { JournalForm } from "@/features/journal/JournalForm";
import type { JournalInputFormHandle } from "@/features/journal-v2/components/JournalInputForm";
import type { JournalTemplate, TemplateApplyMode } from "@/components/journal/templates/types";
import "@/features/journal/journal.css";
import { useJournalV2 } from "@/features/journal-v2/hooks/useJournalV2";
import { useTradeEventJournalBridge } from "@/store/tradeEventJournalBridge";

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

function getScoreBadgeVariant(score: number): 'success' | 'warning' | 'danger' {
  if (score >= 70) return 'success';
  if (score >= 40) return 'warning';
  return 'danger';
}

export default function JournalPage() {
  const { submit, latestResult, history, isSaving, isLoading, error } = useJournalV2();
  const { tradeContext, clearTradeContext } = useTradeEventJournalBridge();
  const formRef = useRef<JournalInputFormHandle>(null);

  const handleSubmit = useCallback(
    async (input: Parameters<typeof submit>[0]) => {
      await submit(input);
      if (tradeContext) {
        clearTradeContext();
      }
    },
    [submit, tradeContext, clearTradeContext],
  );

  const handleTemplateApply = useCallback(
    (template: JournalTemplate, mode: TemplateApplyMode) => {
      formRef.current?.applyTemplate(template.fields, mode);
    },
    [],
  );

  return (
    <DashboardShell
      title="Journal"
      description="Behavioral pipeline with offline persistence and immediate archetype insights."
    >
      <div className="journal-shell" data-testid="journal-page">
        {error ? <ErrorBanner message={error} /> : null}

        <div className="journal-shell__grid">
          <div className="journal-shell__section">
            <JournalForm
              ref={formRef}
              onSubmit={handleSubmit}
              isSubmitting={isSaving}
              tradeContext={tradeContext}
              onClearTradeContext={clearTradeContext}
            />
          </div>

          <div className="space-y-4">
            {latestResult ? (
              <JournalCard result={latestResult} onApplyTemplate={handleTemplateApply} />
            ) : (
              <EmptyState
                illustration="journal"
                title="Run your first journal entry"
                description="Capture your trading state to receive archetype analysis, behavioral insights, and pattern recognition."
                compact
              />
            )}

            <Card variant="glass" data-testid="journal-v2-history">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Recent entries</CardTitle>
                  {history.length > 0 && (
                    <Badge variant="info" className="text-[10px]">
                      {history.length} saved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-14 animate-pulse rounded-xl bg-surface/70" />
                    ))}
                  </div>
                ) : history.length === 0 ? (
                  <EmptyState
                    title="No entries yet"
                    description="Run the journal to build your trading history."
                    compact
                    className="min-h-[160px]"
                  />
                ) : (
                  <div className="space-y-2">
                    {history.slice(0, 5).map((item) => (
                      <ListRow
                        key={item.id}
                        title={
                          <span className="flex items-center gap-2">
                            <span className="text-text-tertiary">#{String(item.id).padStart(3, "0")}</span>
                            <span>{item.output.archetype}</span>
                          </span>
                        }
                        subtitle={formatTimestamp(item.createdAt)}
                        meta={
                          <Badge variant={getScoreBadgeVariant(item.output.score)} className="text-[10px]">
                            {item.output.score}/100
                          </Badge>
                        }
                        data-testid="journal-history-row"
                      />
                    ))}
                    {history.length > 5 && (
                      <p className="pt-1 text-center text-xs text-text-tertiary">
                        +{history.length - 5} more entries
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}

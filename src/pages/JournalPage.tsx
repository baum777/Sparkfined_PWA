import React, { useCallback } from "react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorBanner } from "@/components/ui";
import { JournalInputForm } from "@/features/journal-v2/components/JournalInputForm";
import { JournalResultView } from "@/features/journal-v2/components/JournalResultView";
import { useJournalV2 } from "@/features/journal-v2/hooks/useJournalV2";

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

export default function JournalPage() {
  const { submit, latestResult, history, isSaving, isLoading, error } = useJournalV2();

  const handleSubmit = useCallback(
    async (input: Parameters<typeof submit>[0]) => {
      await submit(input);
    },
    [submit],
  );

  return (
    <DashboardShell
      title="Journal"
      description="Behavioral pipeline with offline persistence and immediate archetype insights."
    >
      <div className="space-y-4" data-testid="journal-page">
        {error ? <ErrorBanner message={error} /> : null}

        <div className="grid gap-6 xl:grid-cols-3 xl:items-start">
          <div className="xl:col-span-2">
            <JournalInputForm onSubmit={handleSubmit} isSubmitting={isSaving} />
          </div>

          <div className="space-y-4">
            {latestResult ? (
              <JournalResultView result={latestResult} />
            ) : (
              <EmptyState
                title="Run your first journal entry"
                description="You will see archetype, score, and insights immediately after submitting the form."
              />
            )}

            <Card variant="glass" data-testid="journal-v2-history">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Recent entries</CardTitle>
                <p className="text-sm text-text-secondary">Stored locally with Dexie for offline review.</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-14 animate-pulse rounded-xl bg-surface/70" />
                    ))}
                  </div>
                ) : latestResult && history.length === 0 ? (
                  <p className="text-sm text-text-secondary">Submit more entries to see your recent history.</p>
                ) : history.length === 0 ? (
                  <EmptyState
                    title="No entries yet"
                    description="Run the journal pipeline to see history and insights."
                  />
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="rounded-2xl border border-border/80 bg-surface/70 p-3">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm font-medium text-text-primary">
                              <span className="text-text-tertiary">#{String(item.id).padStart(3, "0")}</span>
                              <Badge variant="brand">Archetype v{item.version}</Badge>
                            </div>
                            <p className="text-xs text-text-secondary">{formatTimestamp(item.createdAt)}</p>
                          </div>
                          <div className="text-sm text-text-primary">Score: {item.output.score}/100</div>
                        </div>
                      </div>
                    ))}
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

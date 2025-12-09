import React, { useCallback } from 'react'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, ErrorBanner } from '@/components/ui'
import { JournalInputForm } from '../components/JournalInputForm'
import { JournalResultView } from '../components/JournalResultView'
import { useJournalV2 } from '../hooks/useJournalV2'

function formatTimestamp(timestamp: number): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp)
}

export default function JournalV2Page() {
  const { submit, latestResult, history, isSaving, isLoading, error } = useJournalV2()

  const handleSubmit = useCallback(
    async (input: Parameters<typeof submit>[0]) => {
      await submit(input)
    },
    [submit]
  )

  return (
    <DashboardShell
      title="Journal 2.0"
      description="Behavioral pipeline with offline persistence and immediate archetype insights."
    >
      <div className="space-y-4" data-testid="journal-v2-page">
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
                title="Run your first Journal 2.0 entry"
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
                ) : history.length ? (
                  <ul className="space-y-2">
                    {history.map((entry) => (
                      <li
                        key={entry.id ?? entry.createdAt}
                        className="flex items-center justify-between rounded-2xl border border-border/70 bg-surface/60 px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-semibold text-text-primary">{formatTimestamp(entry.createdAt)}</p>
                          <p className="text-xs text-text-secondary line-clamp-2">{entry.raw.reasoning || 'No reasoning saved'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="capitalize text-xs">
                            {entry.raw.emotionalState}
                          </Badge>
                          <span className="text-sm font-semibold text-text-primary">{entry.output.score.toFixed(0)}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-text-secondary">No saved entries yet. Submit to start your history.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  )
}

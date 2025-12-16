import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, EmptyState, ListRow } from '@/components/ui';

interface JournalEntry {
  id: string;
  title: string;
  date: string;
  direction: 'long' | 'short';
}

interface JournalSnapshotProps {
  entries: JournalEntry[];
}

export default function JournalSnapshot({ entries }: JournalSnapshotProps) {
  const navigate = useNavigate();

  const handleNavigate = React.useCallback(() => navigate('/journal'), [navigate]);

  return (
    <div className="rounded-3xl border border-border/70 bg-surface/80 p-4 shadow-card-subtle" data-testid="dashboard-journal-snapshot">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-text-primary">Recent journal entries</h3>
        <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary" onClick={handleNavigate}>
          Open journal
        </Button>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border-moderate bg-surface-subtle/30">
          <EmptyState
            illustration="journal"
            title="No journal entries"
            description="Log a trade or mindset note to build your streaks."
            action={{
              label: "New journal entry",
              onClick: handleNavigate,
            }}
            compact
          />
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => (
            <ListRow
              key={entry.id}
              title={entry.title}
              subtitle={entry.date}
              onPress={handleNavigate}
              actions={
                <>
                  <Badge variant={entry.direction}>{entry.direction === 'long' ? 'Long' : 'Short'}</Badge>
                  <Button variant="ghost" size="sm" onClick={handleNavigate}>
                    Open
                  </Button>
                </>
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

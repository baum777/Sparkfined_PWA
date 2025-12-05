import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/design-system';

interface JournalEntry {
  id: string;
  title: string;
  date: string;
  direction: 'long' | 'short';
}

interface JournalSnapshotProps {
  entries: JournalEntry[];
}

const directionStyles: Record<JournalEntry['direction'], string> = {
  long: 'bg-phosphor/15 text-phosphor border-phosphor/30',
  short: 'bg-blood/15 text-blood border-blood/30',
};

export default function JournalSnapshot({ entries }: JournalSnapshotProps) {
  const navigate = useNavigate();

  const handleNavigate = React.useCallback(() => navigate('/journal-v2'), [navigate]);

  return (
    <Card className="h-full border-smoke-light bg-smoke/70">
      <CardHeader className="mb-2">
        <CardTitle className="text-base">Recent journal entries</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-smoke-light/60 bg-void-lightest/10 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{entry.title}</p>
                <p className="text-xs text-text-secondary">{entry.date}</p>
              </div>
              <Badge
                variant="default"
                size="sm"
                className={directionStyles[entry.direction]}
              >
                {entry.direction === 'long' ? 'Long' : 'Short'}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>

      <div className="mt-2 px-4 pb-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-spark hover:text-spark"
          onClick={handleNavigate}
        >
          Open journal
        </Button>
      </div>
    </Card>
  );
}

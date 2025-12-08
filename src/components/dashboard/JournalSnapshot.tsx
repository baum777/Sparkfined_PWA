import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';

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
  long: 'border border-sentiment-bull-border bg-sentiment-bull-bg text-sentiment-bull',
  short: 'border border-sentiment-bear-border bg-sentiment-bear-bg text-sentiment-bear',
};

export default function JournalSnapshot({ entries }: JournalSnapshotProps) {
  const navigate = useNavigate();

  const handleNavigate = React.useCallback(() => navigate('/journal-v2'), [navigate]);

  return (
    <div className="card rounded-lg p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-text-primary">Recent journal entries</h3>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="card-bordered rounded-lg p-3 hover-lift">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-primary">{entry.title}</p>
                <p className="text-xs text-text-secondary">{entry.date}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${directionStyles[entry.direction]}`}>
                {entry.direction === 'long' ? 'Long' : 'Short'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Button variant="ghost" size="sm" className="text-text-secondary hover:text-text-primary" onClick={handleNavigate}>
          Open journal
        </Button>
      </div>
    </div>
  );
}

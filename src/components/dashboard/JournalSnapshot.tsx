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
    <div className="group relative overflow-hidden rounded-2xl border border-border-moderate bg-gradient-to-br from-surface to-surface-elevated p-6 shadow-sm transition-all hover:border-border-hover hover:shadow-glow-cyan">
      {/* Hover overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div className="relative">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-text-primary">📖 Recent Rituals</h3>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary">
            {entries.length} Entries
          </span>
        </div>
        
        <div className="space-y-3">
          {entries.map((entry, index) => (
            <div 
              key={entry.id} 
              className="group/item rounded-xl border border-border-subtle bg-surface-elevated/50 p-3 transition-all hover:border-border-moderate hover:bg-surface hover:shadow-sm"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-text-primary group-hover/item:text-brand transition-colors">
                    {entry.title}
                  </p>
                  <p className="mt-1 text-xs text-text-tertiary">{entry.date}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${directionStyles[entry.direction]}`}>
                  {entry.direction === 'long' ? '↗ Long' : '↘ Short'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-border-subtle">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-accent hover:text-accent/80 hover:bg-accent/5"
            onClick={handleNavigate}
          >
            Open Full Journal →
          </Button>
        </div>
      </div>
    </div>
  );
}

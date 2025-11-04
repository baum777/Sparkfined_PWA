/**
 * Feed Zone — Activity Stream
 * 
 * Displays recent events:
 * - Alerts triggered
 * - Analyses saved
 * - Exports completed
 * - Errors
 */

import { useState } from 'react';
import FeedItem from './FeedItem';
import StateView from '../ui/StateView';
import { FeedItemSkeleton } from '../ui/Skeleton';

interface FeedEvent {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
}

export default function Feed() {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'journal'>('all');
  const [isLoading, setIsLoading] = useState(false); // For testing: change to true to see loading state
  
  // Mock data (will be replaced with IndexedDB + API)
  const events: FeedEvent[] = [
    { id: '1', type: 'alert', text: 'BTC > $50k erreicht', timestamp: Date.now() - 120000, unread: true },
    { id: '2', type: 'analysis', text: 'SOL 15m → Journal gespeichert', timestamp: Date.now() - 300000, unread: false },
    { id: '3', type: 'export', text: 'CSV exported (247 rows)', timestamp: Date.now() - 600000, unread: false },
  ];

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'journal', label: 'Journal' },
  ];
  
  const handleFeedItemClick = (event: FeedEvent) => {
    // TODO: Navigate based on event type
    console.log('Feed item clicked:', event.id, event.type);
    // Example: if (event.type === 'alert') navigate('/notifications');
  };
  
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold text-zinc-100">Activity</h2>
        
        {/* Filter Chips */}
        <div className="flex gap-2">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`px-2 py-1 text-xs transition-colors ${
                filter === f.id 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              style={{ borderRadius: 'var(--radius-sm)' }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Feed Items */}
      <div className="space-y-0">
        {isLoading ? (
          // Loading state
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </>
        ) : events.length > 0 ? (
          // Data state
          events.map((event) => (
            <FeedItem
              key={event.id}
              id={event.id}
              type={event.type}
              text={event.text}
              timestamp={event.timestamp}
              unread={event.unread}
              onClick={() => handleFeedItemClick(event)}
            />
          ))
        ) : (
          // Empty state
          <StateView
            type="empty"
            title="Keine Aktivität"
            description="Deine letzten Aktionen werden hier angezeigt"
            compact
          />
        )}
      </div>
      
      {/* Load More */}
      {events.length > 0 && (
        <button className="mt-3 w-full py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300">
          Load more
        </button>
      )}
    </div>
  );
}

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
import useBoardFeed from '@/hooks/useBoardFeed';

interface FeedEvent {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
}

export default function Feed() {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'journal'>('all');
  const { 
    data: events, 
    loading, 
    error, 
    hasMore, 
    loadMore, 
    refresh 
  } = useBoardFeed({
    type: filter,
    limit: 20,
    autoRefresh: true,
    refreshInterval: 10000, // 10s
  });

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
        {loading && events.length === 0 ? (
          // Loading state (initial load)
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <FeedItemSkeleton key={i} />
            ))}
          </>
        ) : error ? (
          // Error state
          <StateView
            type="error"
            title="Failed to load feed"
            description={error}
            actionLabel="Retry"
            onAction={refresh}
            compact
          />
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
      {hasMore && events.length > 0 && (
        <button 
          onClick={loadMore}
          disabled={loading}
          className="mt-3 w-full py-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Load more'}
        </button>
      )}
    </div>
  );
}

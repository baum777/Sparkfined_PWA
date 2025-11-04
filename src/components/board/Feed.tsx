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
import { Bell, Save, Download, AlertTriangle } from '@/lib/icons';

interface FeedEvent {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
}

export default function Feed() {
  const [filter, setFilter] = useState<'all' | 'alerts' | 'journal'>('all');
  
  // Mock data (will be replaced with IndexedDB + API)
  const events: FeedEvent[] = [
    { id: '1', type: 'alert', text: 'BTC > $50k erreicht', timestamp: Date.now() - 120000, unread: true },
    { id: '2', type: 'analysis', text: 'SOL 15m → Journal gespeichert', timestamp: Date.now() - 300000, unread: false },
    { id: '3', type: 'export', text: 'CSV exported (247 rows)', timestamp: Date.now() - 600000, unread: false },
  ];
  
  // Icon mapping
  const iconMap = {
    alert: Bell,
    analysis: Save,
    journal: Save,
    export: Download,
    error: AlertTriangle,
  };
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'journal', label: 'Journal' },
  ];
  
  // Relative time helper
  const getRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
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
        {events.length > 0 ? (
          events.map((event) => {
            const Icon = iconMap[event.type];
            const iconColor = event.unread 
              ? event.type === 'error' ? 'text-rose-500' : 'text-emerald-500'
              : 'text-zinc-600';
            
            return (
              <div
                key={event.id}
                className={`flex items-start gap-3 border-b border-zinc-800/50 px-3 py-2 transition-colors cursor-pointer hover:bg-zinc-900/50 ${
                  event.unread ? 'border-l-2 border-l-emerald-500' : ''
                }`}
              >
                <Icon size={20} className={iconColor} />
                <div className="flex-1">
                  <p className={`text-sm line-clamp-2 ${event.unread ? 'text-zinc-200' : 'text-zinc-400'}`}>
                    {event.text}
                  </p>
                </div>
                <span className="font-mono text-xs text-zinc-600">
                  {getRelativeTime(event.timestamp)}
                </span>
              </div>
            );
          })
        ) : (
          <p className="py-8 text-center text-sm text-zinc-500">Keine Aktivität</p>
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

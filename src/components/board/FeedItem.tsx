/**
 * Feed Item Component
 * 
 * Single activity feed entry with:
 * - Icon (type-specific, 20px)
 * - Text (2 lines max, truncate)
 * - Timestamp (relative, mono)
 * - Unread indicator (border-l-2 emerald)
 * - Clickable (hover, navigate)
 */

import { Bell, Save, Download, AlertTriangle, Search, FileText } from '@/lib/icons';

interface FeedItemProps {
  id: string;
  type: 'alert' | 'analysis' | 'journal' | 'export' | 'error';
  text: string;
  timestamp: number;
  unread: boolean;
  onClick?: () => void;
}

export default function FeedItem({
  type,
  text,
  timestamp,
  unread,
  onClick,
}: FeedItemProps) {
  // Icon mapping
  const iconMap = {
    alert: { Icon: Bell, color: 'text-emerald-500' },
    analysis: { Icon: Search, color: 'text-cyan-500' },
    journal: { Icon: FileText, color: 'text-cyan-500' },
    export: { Icon: Download, color: 'text-zinc-400' },
    error: { Icon: AlertTriangle, color: 'text-rose-500' },
  };
  
  const { Icon, color } = iconMap[type];
  
  // Relative time helper
  const getRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };
  
  return (
    <div
      className={`flex items-start gap-3 border-b border-zinc-800/50 px-3 py-2 transition-colors ${
        unread ? 'border-l-2 border-l-emerald-500 pl-2' : ''
      } ${onClick ? 'cursor-pointer hover:bg-zinc-900/50 active:bg-zinc-800' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={`${type}: ${text}, ${getRelativeTime(timestamp)} ago`}
    >
      {/* Icon */}
      <Icon size={20} className={unread ? color : 'text-zinc-600'} />
      
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm line-clamp-2 ${unread ? 'text-zinc-200' : 'text-zinc-400'}`}>
          {text}
        </p>
      </div>
      
      {/* Timestamp */}
      <span className="font-mono text-xs text-zinc-600 flex-shrink-0">
        {getRelativeTime(timestamp)}
      </span>
    </div>
  );
}

/**
 * Usage Example:
 * 
 * <FeedItem
 *   id="evt-1"
 *   type="alert"
 *   text="BTC > $50k erreicht"
 *   timestamp={Date.now() - 120000}
 *   unread={true}
 *   onClick={() => navigate('/notifications')}
 * />
 */

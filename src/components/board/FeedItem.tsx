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

import { Bell, Download, AlertTriangle, Search, FileText } from '@/lib/icons';

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
  // Icon mapping (using semantic design tokens)
  const iconMap = {
    alert: { Icon: Bell, color: 'text-brand' }, // Emerald green for alerts
    analysis: { Icon: Search, color: 'text-info' }, // Cyan for analysis
    journal: { Icon: FileText, color: 'text-info' }, // Cyan for journal
    export: { Icon: Download, color: 'text-tertiary' }, // Gray for exports
    error: { Icon: AlertTriangle, color: 'text-danger' }, // Red for errors
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
      className={`flex items-start gap-3 border-b border-border-subtle px-3 py-2 transition-colors ${
        unread ? 'border-l-2 border-l-brand pl-2' : ''
      } ${onClick ? 'cursor-pointer hover:bg-surface-hover active:bg-surface-elevated' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
      aria-label={`${type}: ${text}, ${getRelativeTime(timestamp)} ago`}
    >
      {/* Icon */}
      <Icon size={20} className={unread ? color : 'text-tertiary'} />
      
      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm line-clamp-2 ${unread ? 'text-primary' : 'text-secondary'}`}>
          {text}
        </p>
      </div>
      
      {/* Timestamp */}
      <span className="font-mono text-xs text-tertiary flex-shrink-0">
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

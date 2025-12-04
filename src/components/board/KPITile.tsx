/**
 * KPI Tile Component
 * 
 * Displays a single KPI metric with:
 * - Value (large, color-coded)
 * - Label (small, ash)
 * - Trend (optional, small text)
 * - Icon (optional, top-left)
 * - Loading/Error states
 * - Interactive (clickable)
 * 
 * Types:
 * - numeric: Today P&L, Sentiment, Risk Score (with trend)
 * - count: Active Alerts, Active Charts, Journal Entries
 * - status: Sync Status (Online/Offline with timestamp)
 * - timestamp: Last Analysis (symbol, timeframe, time)
 */

import { TrendingUp, TrendingDown, Bell, Wifi, Clock } from '@/lib/icons';
import StateView from '../ui/StateView';
import { KPITileSkeleton } from '../ui/Skeleton';

interface KPITileProps {
  type: 'numeric' | 'count' | 'status' | 'timestamp';
  label: string;
  value: string;
  trend?: string;
  direction: 'up' | 'down' | 'neutral';
  loading?: boolean;
  error?: boolean;
  onClick?: () => void;
  icon?: 'trending' | 'bell' | 'wifi' | 'clock';
}

export default function KPITile({
  type: _type,
  label,
  value,
  trend,
  direction,
  loading = false,
  error = false,
  onClick,
  icon,
}: KPITileProps) {
  // Icon mapping
  const iconMap = {
    trending: direction === 'up' ? TrendingUp : TrendingDown,
    bell: Bell,
    wifi: Wifi,
    clock: Clock,
  };
  
  const Icon = icon ? iconMap[icon] : null;
  
  // Color mapping
  const colorMap = {
    up: 'text-spark',
    down: 'text-blood',
    neutral: 'text-mist',
  };
  
  const valueColor = colorMap[direction];
  
  // Loading State
  if (loading) {
    return (
      <div className="border-b border-smoke-light bg-smoke p-3 md:rounded-lg md:border">
        <KPITileSkeleton />
      </div>
    );
  }
  
  // Error State
  if (error) {
    return (
      <div className="border-b border-smoke-light bg-blood/20 p-3 md:rounded-lg md:border md:border-blood/50">
        <StateView
          type="error"
          description="Failed to load"
          actionLabel={onClick ? "Retry" : undefined}
          onAction={onClick}
          compact
        />
      </div>
    );
  }
  
  // Success State
  return (
    <div
      className={`border-b border-smoke-light bg-smoke p-3 transition-all md:rounded-lg md:border ${
        onClick ? 'cursor-pointer hover:bg-smoke-light active:scale-[0.98]' : ''
      }`}
      style={{
        borderRadius: 'var(--radius-md)',
        transition: 'all var(--duration-short) var(--ease-in-out)',
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === 'Enter' && onClick() : undefined}
    >
      {/* Header: Label + Icon */}
      <div className="flex items-start justify-between">
        <p className="text-xs font-medium text-ash">{label}</p>
        {Icon && <Icon size={16} className="text-ash" />}
      </div>
      
      {/* Body: Value + Trend */}
      <div className="mt-2 flex items-end justify-between">
        <p className={`text-2xl font-semibold ${valueColor} break-words`}>
          {value}
        </p>
        {trend && (
          <span className="text-xs text-ash">{trend}</span>
        )}
      </div>
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * // Numeric with trend (Today P&L)
 * <KPITile
 *   type="numeric"
 *   label="Heute P&L"
 *   value="+€247.50"
 *   trend="+12.5%"
 *   direction="up"
 *   icon="trending"
 * />
 * 
 * // Count (Active Alerts)
 * <KPITile
 *   type="count"
 *   label="Active Alerts"
 *   value="3"
 *   direction="neutral"
 *   icon="bell"
 *   onClick={() => navigate('/notifications')}
 * />
 * 
 * // Status (Sync)
 * <KPITile
 *   type="status"
 *   label="Sync Status"
 *   value="Online"
 *   trend="2m ago"
 *   direction="up"
 *   icon="wifi"
 * />
 * 
 * // Loading
 * <KPITile
 *   type="numeric"
 *   label="Sentiment"
 *   value=""
 *   direction="neutral"
 *   loading={true}
 * />
 * 
 * // Error
 * <KPITile
 *   type="numeric"
 *   label="Risk Score"
 *   value=""
 *   direction="neutral"
 *   error={true}
 * />
 */

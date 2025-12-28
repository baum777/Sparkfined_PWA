/**
 * State View Components
 * 
 * Consistent empty/loading/error states for:
 * - Empty lists
 * - Loading data
 * - API errors
 * - Network errors
 * 
 * Usage:
 * - Centered layout
 * - Icon + Text + Optional Action
 * - A11y: aria-live, focus management
 */

import { Loader2, AlertTriangle, FileText, Wifi } from '@/lib/icons';
import Button from './Button';

interface StateViewProps extends React.HTMLAttributes<HTMLDivElement> {
  type: 'loading' | 'empty' | 'error' | 'offline';
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean; // Für kleinere Bereiche (z.B. KPI Tiles)
  icon?: React.ReactNode; // Custom icon override
}

export default function StateView({
  type,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  icon,
  ...htmlProps
}: StateViewProps) {
  const config = {
    loading: {
      Icon: Loader2,
      defaultTitle: 'Loading...',
      defaultDescription: 'Fetching latest data',
      iconColor: 'text-emerald-500',
      animate: true,
    },
    empty: {
      Icon: FileText,
      defaultTitle: 'No data yet',
      defaultDescription: 'Start by analyzing your first token',
      iconColor: 'text-zinc-600',
      animate: false,
    },
    error: {
      Icon: AlertTriangle,
      defaultTitle: 'Something went wrong',
      defaultDescription: 'Unable to load data. Please try again.',
      iconColor: 'text-rose-500',
      animate: false,
    },
    offline: {
      Icon: Wifi,
      defaultTitle: 'Offline',
      defaultDescription: 'Showing cached data. Connect to refresh.',
      iconColor: 'text-amber-500',
      animate: false,
    },
  };
  
  const { Icon, defaultTitle, defaultDescription, iconColor, animate } = config[type];

  return (
    <div
      {...htmlProps}
      className={`flex flex-col items-center justify-center text-center ${
        compact ? 'py-6 px-4' : 'py-12 px-6'
      } ${htmlProps.className || ''}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {/* Icon */}
      {icon ? (
        <div className="mb-3">{icon}</div>
      ) : (
        <Icon
          size={compact ? 32 : 48}
          className={`${iconColor} ${animate ? 'animate-spin' : ''} mb-3`}
        />
      )}
      
      {/* Title */}
      <h3 className={`font-semibold text-zinc-200 ${compact ? 'text-sm' : 'text-base'} mb-1`}>
        {title || defaultTitle}
      </h3>
      
      {/* Description */}
      {(description || defaultDescription) && (
        <p className={`text-zinc-500 ${compact ? 'text-xs' : 'text-sm'} mb-4 max-w-xs`}>
          {description || defaultDescription}
        </p>
      )}
      
      {/* Action Button */}
      {actionLabel && onAction && (
        <Button
          variant={type === 'error' ? 'secondary' : 'primary'}
          size={compact ? 'sm' : 'md'}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

/**
 * Usage Examples:
 * 
 * // Loading state (full screen)
 * <StateView type="loading" />
 * 
 * // Empty state with action
 * <StateView
 *   type="empty"
 *   title="No alerts configured"
 *   description="Set up your first price alert to get started"
 *   actionLabel="Create Alert"
 *   onAction={() => navigate('/alerts/new')}
 * />
 * 
 * // Error state with retry (compact for KPI tile)
 * <StateView
 *   type="error"
 *   description="Failed to load KPI"
 *   actionLabel="Retry"
 *   onAction={refetch}
 *   compact
 * />
 * 
 * // Offline indicator
 * <StateView
 *   type="offline"
 *   description="Last updated 5 minutes ago"
 * />
 */

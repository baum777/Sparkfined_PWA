/**
 * LiveStatusBadge - Shows the status of Live Data v1
 *
 * Displays:
 * - OFF (gray): Live data disabled or not initialized
 * - LIVE (green): Active polling, no errors
 * - DEGRADED (yellow): Active but experiencing errors
 * - PAUSED (info): Paused (tab hidden)
 */

import React from 'react';
import { useLiveDataStore } from '@/store/liveDataStore';
import { Badge, type BadgeVariant } from '@/design-system';

interface LiveStatusBadgeProps {
  showLabel?: boolean;
  className?: string;
}

export function LiveStatusBadge({
  showLabel = true,
  className = '',
}: LiveStatusBadgeProps) {
  const { isEnabled, pollingStatus, errorCount } = useLiveDataStore((state) => ({
    isEnabled: state.isEnabled,
    pollingStatus: state.pollingStatus,
    errorCount: state.errorCount,
  }));

  // Determine status and variant
  let statusText = 'OFF';
  let variant: BadgeVariant = 'default';

  if (!isEnabled) {
    statusText = 'OFF';
    variant = 'default';
  } else if (pollingStatus === 'paused') {
    statusText = 'PAUSED';
    variant = 'outline';
  } else if (pollingStatus === 'error' || errorCount > 10) {
    statusText = 'DEGRADED';
    variant = 'warning';
  } else if (pollingStatus === 'active') {
    statusText = 'LIVE';
    variant = 'success';
  } else {
    statusText = 'IDLE';
    variant = 'default';
  }

  return (
    <Badge variant={variant} className={className}>
      <span className="flex items-center gap-1.5">
        {/* Pulse indicator for active status */}
        {pollingStatus === 'active' && (
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-phosphor opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-phosphor"></span>
          </span>
        )}

        {/* Static dot for other statuses */}
        {pollingStatus !== 'active' && (
          <span className={`inline-flex h-2 w-2 rounded-full ${
            pollingStatus === 'paused' ? 'bg-spark' :
            pollingStatus === 'error' || errorCount > 10 ? 'bg-gold' :
            'bg-ash'
          }`}></span>
        )}

        {showLabel && statusText}
      </span>
    </Badge>
  );
}

export default LiveStatusBadge;

/**
 * DataFreshness Component
 *
 * Displays how long ago data was last updated (e.g., "Updated 3s ago").
 * Automatically updates the display every second.
 *
 * Best Practice (2025): Users should always know when data was last refreshed,
 * especially in offline-first PWAs and real-time trading interfaces.
 *
 * Usage:
 * ```tsx
 * <DataFreshness lastUpdated={Date.now()} />
 * ```
 *
 * @param lastUpdated - Timestamp in milliseconds (Date.now() format)
 */

import { useEffect, useState } from 'react';

interface DataFreshnessProps {
  lastUpdated: number;
  className?: string;
}

export default function DataFreshness({ lastUpdated, className = '' }: DataFreshnessProps) {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastUpdated) / 1000);

      if (seconds < 10) {
        setTimeAgo('just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (seconds < 3600) {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes}m ago`);
      } else if (seconds < 86400) {
        const hours = Math.floor(seconds / 3600);
        setTimeAgo(`${hours}h ago`);
      } else {
        const days = Math.floor(seconds / 86400);
        setTimeAgo(`${days}d ago`);
      }
    };

    updateTimeAgo();

    // Update more frequently for recent data, less frequently for old data
    const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
    const interval = seconds < 60 ? 1000 : seconds < 3600 ? 10000 : 60000;

    const intervalId = setInterval(updateTimeAgo, interval);
    return () => clearInterval(intervalId);
  }, [lastUpdated]);

  return (
    <span className={`text-xs text-zinc-500 ${className}`} title={new Date(lastUpdated).toLocaleString()}>
      Updated {timeAgo}
    </span>
  );
}

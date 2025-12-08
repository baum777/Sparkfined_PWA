/**
 * OfflineIndicator Component
 *
 * Displays a banner at the top of the screen when the user is offline.
 * Uses amber/yellow color scheme to indicate warning state.
 * Automatically hides when connection is restored.
 *
 * Features:
 * - Sticky top positioning (z-50)
 * - Backdrop blur for modern glassmorphism effect
 * - Informative message about cached data
 * - Icon for visual clarity
 *
 * @see useOnlineStatus hook
 */

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { WifiOff } from '@/lib/icons';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  // Don't render anything when online
  if (isOnline) return null;

  return (
    <div className="pointer-events-none fixed top-4 left-0 right-0 z-toast px-4 sm:px-6">
      <div
        className="pointer-events-auto mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-border/70 bg-surface/90 px-4 py-3 text-text-primary shadow-card-subtle backdrop-blur-xl"
        role="status"
        aria-live="polite"
        aria-label="Offline mode active"
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-warn/10 text-warn">
          <WifiOff className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold tracking-wide text-text-primary">Offline Mode</p>
          <p className="text-xs text-text-secondary">
            Showing cached data. Changes sync automatically once you reconnect.
          </p>
        </div>
      </div>
    </div>
  );
}

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
import { WifiOff } from 'lucide-react';

export default function OfflineIndicator() {
  const isOnline = useOnlineStatus();

  // Don't render anything when online
  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500/90 backdrop-blur-sm border-b border-amber-600 px-4 py-2 lg:pl-24"
      role="status"
      aria-live="polite"
      aria-label="Offline mode active"
    >
      <div className="max-w-7xl mx-auto flex items-center gap-3">
        <WifiOff className="w-5 h-5 text-white flex-shrink-0" aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            📡 Offline Mode
          </p>
          <p className="text-xs text-amber-100 hidden sm:block">
            Showing cached data. Changes will sync when online.
          </p>
        </div>
      </div>
    </div>
  );
}

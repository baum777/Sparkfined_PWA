/**
 * Hook for tracking first-time actions with toast notifications
 * 
 * Usage:
 * const { trackAction } = useFirstTimeActions();
 * trackAction('chart-created', '🎉 Nice! Your first chart is ready.');
 */

export function useFirstTimeActions() {
  const trackAction = (key: string, message: string, _featureId?: string) => {
    // Check if action was already tracked
    const storageKey = `first:${key}`;
    const alreadyTracked = localStorage.getItem(storageKey);

    if (!alreadyTracked) {
      // Mark as tracked
      localStorage.setItem(storageKey, Date.now().toString());

      // Show toast notification (you can integrate with your toast library)
      console.log('[First Time Action]:', message);
      
      // Return true to indicate this was the first time
      return true;
    }

    return false;
  };

  const hasPerformedAction = (key: string): boolean => {
    return !!localStorage.getItem(`first:${key}`);
  };

  const resetAction = (key: string) => {
    localStorage.removeItem(`first:${key}`);
  };

  return {
    trackAction,
    hasPerformedAction,
    resetAction,
  };
}

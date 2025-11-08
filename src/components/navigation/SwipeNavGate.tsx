/**
 * Swipe Navigation Gate Component
 * 
 * Ensures useSwipeNavigation hook runs ONLY within Router context.
 * Must be mounted inside <BrowserRouter> to prevent crashes.
 * 
 * Architecture:
 * - Renders nothing (null)
 * - Executes swipe navigation hook for entire app
 * - Safe: Router context guaranteed to exist
 */

import useSwipeNavigation from '@/hooks/useSwipeNavigation'

export function SwipeNavGate() {
  // Hook now runs safely within Router context
  useSwipeNavigation({ enabled: true })
  
  return null
}

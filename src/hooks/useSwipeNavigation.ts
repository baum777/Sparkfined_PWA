/**
 * Swipe Navigation Hook
 * 
 * Features:
 * - Edge-swipe detection (left/right, from screen edge ~50px)
 * - Navigate between routes (forward/back)
 * - Prevents conflict with chart gestures (only from edges)
 * - Touch-only (no mouse)
 * - Threshold: 100px horizontal movement
 * - Vertical scroll tolerance: 30px
 * 
 * Usage:
 * useSwipeNavigation({ enabled: true });
 */

import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface SwipeNavigationOptions {
  enabled?: boolean;
  edgeThreshold?: number; // Distance from screen edge to trigger (default: 50px)
  swipeThreshold?: number; // Minimum horizontal movement (default: 100px)
  verticalTolerance?: number; // Max vertical movement (default: 30px)
}

export default function useSwipeNavigation({
  enabled = true,
  edgeThreshold = 50,
  swipeThreshold = 100,
  verticalTolerance = 30,
}: SwipeNavigationOptions = {}) {
  const navigate = useNavigate();
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  
  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;
    
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (!touch) return;
      
      // Only trigger from screen edges
      const isFromLeftEdge = touch.clientX < edgeThreshold;
      const isFromRightEdge = touch.clientX > window.innerWidth - edgeThreshold;
      
      if (!isFromLeftEdge && !isFromRightEdge) return;
      
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };
    
    const handleTouchEnd = (e: TouchEvent) => {
      const touchStart = touchStartRef.current;
      if (!touchStart) return;
      
      const touch = e.changedTouches[0];
      if (!touch) return;
      
      const deltaX = touch.clientX - touchStart.x;
      const deltaY = touch.clientY - touchStart.y;
      const duration = Date.now() - touchStart.time;
      
      // Swipe validation:
      // 1. Horizontal movement >= threshold
      // 2. Vertical movement <= tolerance (prevent vertical scroll conflict)
      // 3. Duration < 500ms (fast swipe)
      const isValidSwipe =
        Math.abs(deltaX) >= swipeThreshold &&
        Math.abs(deltaY) <= verticalTolerance &&
        duration < 500;
      
      if (isValidSwipe) {
        if (deltaX > 0) {
          // Swipe right → Go back
          navigate(-1);
        } else {
          // Swipe left → Go forward
          navigate(1);
        }
      }
      
      touchStartRef.current = null;
    };
    
    const handleTouchCancel = () => {
      touchStartRef.current = null;
    };
    
    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });
    document.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchCancel);
    };
  }, [enabled, navigate, edgeThreshold, swipeThreshold, verticalTolerance]);
}

/**
 * Usage Example:
 * 
 * // In App.tsx or Layout component:
 * function App() {
 *   useSwipeNavigation({ enabled: true });
 *   return <Routes>...</Routes>;
 * }
 * 
 * // Disable in specific pages (e.g., Chart page with pan/zoom):
 * function ChartPage() {
 *   useSwipeNavigation({ enabled: false });
 *   return <div>...</div>;
 * }
 */

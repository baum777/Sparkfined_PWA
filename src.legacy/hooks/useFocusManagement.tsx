import { useEffect, useRef, useCallback } from 'react';

// Hook to trap focus within a container (for modals)
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element when trap is activated
    firstElement?.focus();

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    return () => container.removeEventListener('keydown', handleTabKey);
  }, [isActive]);

  return containerRef;
}

// Hook to restore focus after component unmounts
export function useRestoreFocus() {
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocusedElement.current = document.activeElement as HTMLElement;

    return () => {
      // Restore focus when unmounting
      previouslyFocusedElement.current?.focus();
    };
  }, []);
}

// Hook to manage focus on first render
export function useAutoFocus(shouldFocus = true) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    if (shouldFocus && ref.current) {
      // Small delay to ensure element is ready
      setTimeout(() => ref.current?.focus(), 100);
    }
  }, [shouldFocus]);

  return ref;
}

// Hook to detect if user is using keyboard navigation
export function useKeyboardNavigation() {
  const updateKeyboardUser = useCallback((value: boolean) => {
    document.body.classList.toggle('keyboard-user', value);
  }, []);

  useEffect(() => {
    const handleMouseDown = () => updateKeyboardUser(false);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') updateKeyboardUser(true);
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [updateKeyboardUser]);
}

// Hook to scroll element into view and focus it
export function useScrollToFocus() {
  const ref = useRef<HTMLElement>(null);

  const scrollAndFocus = useCallback(() => {
    if (ref.current) {
      ref.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
      setTimeout(() => ref.current?.focus(), 300);
    }
  }, []);

  return { ref, scrollAndFocus };
}

// Skip to content link for accessibility
export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="
        sr-only focus:not-sr-only
        focus:fixed focus:top-4 focus:left-4 focus:z-50
        focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2
        focus:text-bg focus:shadow-lg
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand
      "
    >
      Skip to main content
    </a>
  );
}

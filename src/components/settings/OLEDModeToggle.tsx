/**
 * OLED Mode Toggle Component
 * 
 * Enables pure black backgrounds for OLED displays.
 * 
 * Benefits:
 * - 20-30% battery savings on OLED screens
 * - Reduces screen burn-in risk
 * - Less eye strain during long trading sessions
 * 
 * @example
 * ```tsx
 * <OLEDModeToggle />
 * ```
 */

import { useState, useEffect } from 'react';

export function OLEDModeToggle() {
  const [isOLED, setIsOLED] = useState(() => {
    // Read from localStorage on mount
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('oled-mode') === 'true';
  });

  useEffect(() => {
    // Apply to DOM
    if (typeof document !== 'undefined') {
      document.body.dataset.oled = isOLED ? 'true' : 'false';
    }
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('oled-mode', isOLED ? 'true' : 'false');
    }
  }, [isOLED]);

  // Initialize on mount
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const savedValue = localStorage.getItem('oled-mode') === 'true';
      document.body.dataset.oled = savedValue ? 'true' : 'false';
    }
  }, []);

  const handleToggle = () => {
    setIsOLED(!isOLED);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-subtle bg-surface p-4">
      <div className="flex-1">
        <label 
          htmlFor="oled-mode-toggle"
          className="text-sm font-medium text-primary cursor-pointer"
        >
          OLED Mode
        </label>
        <p className="mt-1 text-xs text-tertiary leading-relaxed">
          Pure black backgrounds for OLED displays. Saves battery and reduces eye strain.
        </p>
      </div>

      <button
        id="oled-mode-toggle"
        type="button"
        role="switch"
        aria-checked={isOLED}
        aria-label={`OLED Mode ${isOLED ? 'enabled' : 'disabled'}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={`
          relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
          border-2 border-transparent transition-colors duration-200 ease-in-out
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg
          ${isOLED ? 'bg-brand' : 'bg-surface-hover'}
        `}
      >
        <span className="sr-only">Toggle OLED Mode</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-5 w-5 transform rounded-full
            bg-white shadow ring-0 transition duration-200 ease-in-out
            ${isOLED ? 'translate-x-5' : 'translate-x-0'}
          `}
        />
      </button>
    </div>
  );
}

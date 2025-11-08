/**
 * Boot Guard - Early Error Capture System
 * Captures errors BEFORE React hydration/boot
 * 
 * Install this FIRST in main.tsx before any other imports
 * Provides better error messages for boot-time crashes
 */

export interface BootError {
  type: 'error' | 'unhandledrejection';
  message: string;
  stack?: string;
  timestamp: number;
  url: string;
  userAgent: string;
}

/**
 * Install Boot Guard - Captures errors before React boots
 * Call this FIRST in main.tsx before any other code
 */
export function installBootguard() {
  if (typeof window === 'undefined') return;
  
  // Prevent double installation
  if ((window as any).__bootguard_installed) return;
  (window as any).__bootguard_installed = true;
  
  const captureError = (type: 'error' | 'unhandledrejection', payload: any) => {
    const msg = payload?.message ?? payload?.reason?.message ?? String(payload);
    const stack = payload?.stack ?? payload?.reason?.stack;
    
    const bootError: BootError = {
      type,
      message: msg,
      stack,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    // Log to console (visible in DevTools)
    console.error(`[boot:${type}]`, msg, stack);
    
    // Store in localStorage for post-mortem analysis
    try {
      localStorage.setItem('diag:last-boot', JSON.stringify(bootError));
      
      // Keep boot error history (last 5)
      const historyKey = 'diag:boot-history';
      const history = JSON.parse(localStorage.getItem(historyKey) || '[]') as BootError[];
      history.unshift(bootError);
      localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 5)));
    } catch (e) {
      // Storage might be full/blocked, continue anyway
    }
  };
  
  // Capture window errors
  window.addEventListener('error', (event: ErrorEvent) => {
    captureError('error', event.error ?? {
      message: event.message,
      stack: `${event.filename}:${event.lineno}:${event.colno}`,
    });
  });
  
  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    captureError('unhandledrejection', event.reason);
  });
  
  if (import.meta.env.DEV) {
    console.log('[bootguard] Boot guard installed ✅');
  }
}

/**
 * Get stored boot errors (for debugging)
 */
export function getBootErrors(): {
  lastBoot?: BootError;
  bootHistory: BootError[];
} {
  try {
    return {
      lastBoot: JSON.parse(localStorage.getItem('diag:last-boot') || 'null'),
      bootHistory: JSON.parse(localStorage.getItem('diag:boot-history') || '[]'),
    };
  } catch {
    return { bootHistory: [] };
  }
}

/**
 * Clear stored boot errors
 */
export function clearBootErrors() {
  try {
    localStorage.removeItem('diag:last-boot');
    localStorage.removeItem('diag:boot-history');
    console.log('[bootguard] Boot errors cleared');
  } catch {
    // Storage might be blocked
  }
}

/**
 * Safe wrapper for code that might throw during boot
 * Returns fallback value on error
 */
export function safe<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.warn('[bootguard] Safe wrapper caught error:', error);
    return fallback;
  }
}

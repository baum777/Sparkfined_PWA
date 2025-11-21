/**
 * Global Crash Report & Telemetry Module
 * Captures unhandled errors, promise rejections, and runtime crashes
 * Provides detailed diagnostics for PWA load failures
 * 
 * Usage: Call installGlobalErrorHooks() in main.tsx before React render
 */

export interface ErrorReport {
  type: 'error' | 'unhandledrejection' | 'securitypolicyviolation';
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  timestamp: number;
  userAgent: string;
  url: string;
}

/**
 * Safely log error with localStorage fallback
 */
function logError(type: string, payload: ErrorReport) {
  try {
    console.error(`[${type}]`, payload);
  } catch {
    // Console might be blocked (CSP), continue anyway
  }
  
  try {
    const key = `diag:last-${type}`;
    localStorage.setItem(key, JSON.stringify(payload));
    
    // Keep history (last 5 errors)
    const historyKey = `diag:history-${type}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]') as ErrorReport[];
    history.unshift(payload);
    localStorage.setItem(historyKey, JSON.stringify(history.slice(0, 5)));
  } catch {
    // Storage might be full or blocked, continue anyway
  }
}

/**
 * Install global error hooks for crash detection
 * Call this in main.tsx BEFORE ReactDOM.createRoot()
 */
export function installGlobalErrorHooks() {
  if (typeof window === 'undefined') return;
  
  // Prevent double-installation
  if ((window as any).__crashReportInstalled) return;
  (window as any).__crashReportInstalled = true;
  
  // Global error handler
  window.addEventListener('error', (event: ErrorEvent) => {
    const report: ErrorReport = {
      type: 'error',
      message: event.message,
      stack: event.error?.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    logError('error', report);
  });
  
  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const report: ErrorReport = {
      type: 'unhandledrejection',
      message: reason?.message ?? String(reason),
      stack: reason?.stack,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };
    
    logError('unhandledrejection', report);
  });
  
  // CSP violations (useful for diagnosing blocked resources)
  if ('SecurityPolicyViolationEvent' in window) {
    window.addEventListener('securitypolicyviolation', (event: SecurityPolicyViolationEvent) => {
      const report: ErrorReport = {
        type: 'securitypolicyviolation',
        message: `CSP violation: ${event.violatedDirective} - ${event.blockedURI}`,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      };
      
      logError('securitypolicyviolation', report);
    });
  }
  
  // Log installation success (preview only)
  if ((import.meta as any).env?.VERCEL_ENV === 'preview') {
    console.log('[crash-report] Global error hooks installed ✅');
  }
}

/**
 * Get stored error reports (for debugging)
 */
export function getStoredErrors(): {
  lastError?: ErrorReport;
  lastRejection?: ErrorReport;
  errorHistory: ErrorReport[];
  rejectionHistory: ErrorReport[];
} {
  try {
    return {
      lastError: JSON.parse(localStorage.getItem('diag:last-error') || 'null'),
      lastRejection: JSON.parse(localStorage.getItem('diag:last-unhandledrejection') || 'null'),
      errorHistory: JSON.parse(localStorage.getItem('diag:history-error') || '[]'),
      rejectionHistory: JSON.parse(localStorage.getItem('diag:history-unhandledrejection') || '[]'),
    };
  } catch {
    return {
      errorHistory: [],
      rejectionHistory: [],
    };
  }
}

/**
 * Clear all stored error reports
 */
export function clearStoredErrors() {
  try {
    localStorage.removeItem('diag:last-error');
    localStorage.removeItem('diag:last-unhandledrejection');
    localStorage.removeItem('diag:history-error');
    localStorage.removeItem('diag:history-unhandledrejection');
    console.log('[crash-report] Cleared all stored errors');
  } catch {
    // Storage might be blocked
  }
}

/**
 * Export error report as JSON for debugging
 */
export function exportErrorReport(): string {
  const errors = getStoredErrors();
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: window.location.href,
    screen: {
      width: screen.width,
      height: screen.height,
      devicePixelRatio: window.devicePixelRatio,
    },
    connection: (navigator as any).connection ? {
      effectiveType: (navigator as any).connection.effectiveType,
      downlink: (navigator as any).connection.downlink,
      rtt: (navigator as any).connection.rtt,
    } : null,
    serviceWorker: 'serviceWorker' in navigator ? {
      controller: !!navigator.serviceWorker.controller,
    } : null,
    errors,
  };
  
  return JSON.stringify(report, null, 2);
}

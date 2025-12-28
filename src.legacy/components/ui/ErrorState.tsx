import React from 'react';

interface ErrorStateProps {
  title?: string;
  message: string;
  error?: Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  variant?: 'error' | 'warning' | 'offline';
  showDetails?: boolean;
}

export function ErrorState({ 
  title,
  message, 
  error,
  onRetry,
  onDismiss,
  variant = 'error',
  showDetails = false
}: ErrorStateProps) {
  const [showErrorDetails, setShowErrorDetails] = React.useState(false);
  
  const variantStyles = {
    error: {
      bg: 'bg-sentiment-bear-bg/20',
      border: 'border-sentiment-bear-border',
      text: 'text-sentiment-bear',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    warning: {
      bg: 'bg-sentiment-neutral-bg/20',
      border: 'border-sentiment-neutral-border',
      text: 'text-sentiment-neutral',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    offline: {
      bg: 'bg-surface-elevated',
      border: 'border-border-moderate',
      text: 'text-text-secondary',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
        </svg>
      ),
    },
  };
  
  const style = variantStyles[variant];
  const defaultTitle = variant === 'error' ? 'Something went wrong' : variant === 'warning' ? 'Warning' : 'You\'re offline';
  
  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-6 space-y-4`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${style.text}`}>
          {style.icon}
        </div>
        <div className="flex-1 space-y-1">
          <h3 className={`text-lg font-semibold ${style.text}`}>
            {title || defaultTitle}
          </h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {message}
          </p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 rounded-full p-1 hover:bg-surface-hover transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Error Details (Expandable) */}
      {error && showDetails && (
        <div className="space-y-2">
          <button
            onClick={() => setShowErrorDetails(!showErrorDetails)}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors flex items-center gap-1"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showErrorDetails ? 'rotate-90' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Technical Details
          </button>
          {showErrorDetails && (
            <div className="rounded-lg bg-surface-elevated border border-border p-3 font-mono text-xs text-text-secondary overflow-x-auto">
              <div className="space-y-1">
                <p><span className="text-text-tertiary">Error:</span> {error.name}</p>
                <p><span className="text-text-tertiary">Message:</span> {error.message}</p>
                {error.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-text-tertiary hover:text-text-secondary">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </details>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {onRetry && (
        <div className="flex gap-2 pt-2">
          <button onClick={onRetry} className="btn btn-sm btn-secondary">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

// Inline Error (smaller, for forms)
export function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-lg bg-sentiment-bear-bg/20 border border-sentiment-bear-border">
      <svg className="w-5 h-5 text-sentiment-bear flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-sentiment-bear">{message}</p>
    </div>
  );
}

// Banner Error (top of page)
export function ErrorBanner({ 
  message, 
  onRetry, 
  onDismiss 
}: { 
  message: string; 
  onRetry?: () => void; 
  onDismiss?: () => void; 
}) {
  return (
    <div className="glass-heavy border-sentiment-bear-border border rounded-2xl p-4 flex items-center gap-4">
      <svg className="w-6 h-6 text-sentiment-bear flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="flex-1 text-sm font-medium text-text-primary">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-sm btn-outline">
          Retry
        </button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-full p-1 hover:bg-surface-hover transition-colors"
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

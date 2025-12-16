import React from 'react'
import { logError } from '@/lib/log-error'

type AppErrorBoundaryProps = { children: React.ReactNode }
type AppErrorBoundaryState = { 
  hasError: boolean
  error?: Error
  errorInfo?: React.ErrorInfo
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  override state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error }
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    // Store error info for display
    this.setState({ errorInfo: info })
    
    // Only log verbose info in Vercel preview
    if ((import.meta as any).env?.VERCEL_ENV === 'preview') {
      logError('AppErrorBoundary', error, info?.componentStack)
    }
  }
  
  /**
   * Hard reset: Clear SW, caches, storage, and reload
   */
  hardReset = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => reg.unregister())
      })
    }
    if ('caches' in window) {
      caches.keys().then(keys => {
        keys.forEach(k => caches.delete(k))
      })
    }
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <main role="main" aria-label="Error" className="min-h-screen bg-bg text-primary flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-brand mb-4">Something went wrong</h1>
            <p className="text-secondary mb-6">Try reloading the page. Diagnostics are collected in preview mode.</p>
            
            <div className="flex gap-4 justify-center mb-6">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-brand hover:bg-brand-hover text-bg rounded-lg font-medium transition-colors"
              >
                Reload
              </button>
              <button 
                onClick={this.hardReset}
                className="px-6 py-3 bg-warn hover:bg-warn/90 text-bg rounded-lg font-medium transition-colors"
              >
                Hard Reset (Cache/SW)
              </button>
            </div>
            
            {(this.state.error || this.state.errorInfo) && (
              <details className="mt-6 text-left bg-surface rounded-lg p-4">
                <summary className="cursor-pointer text-sm text-secondary hover:text-primary mb-2">
                  Show error details
                </summary>
                <div className="mt-2 space-y-4">
                  {this.state.error && (
                    <div>
                      <h3 className="text-danger font-semibold mb-2">Error:</h3>
                      <pre className="p-3 bg-bg rounded text-xs overflow-auto text-danger/80 whitespace-pre-wrap">
                        {String(this.state.error?.message ?? this.state.error ?? 'Unknown error')}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <h3 className="text-warn font-semibold mb-2">Component Stack:</h3>
                      <pre className="p-3 bg-bg rounded text-xs overflow-auto text-warn/80 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}
          </div>
        </main>
      )
    }
    return this.props.children
  }
}

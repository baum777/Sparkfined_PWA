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
        <main role="main" aria-label="Error" className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-emerald-400 mb-4">Es gab einen Fehler beim Laden</h1>
            <p className="text-slate-300 mb-6">Versuchen Sie, die Seite neu zu laden. Diagnosen werden in der Preview gesammelt.</p>
            
            <div className="flex gap-4 justify-center mb-6">
              <button 
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Neu laden
              </button>
              <button 
                onClick={this.hardReset}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              >
                Hard Reset (Cache/SW)
              </button>
            </div>
            
            {(this.state.error || this.state.errorInfo) && (
              <details className="mt-6 text-left bg-slate-900 rounded-lg p-4">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 mb-2">
                  Fehlerdetails anzeigen
                </summary>
                <div className="mt-2 space-y-4">
                  {this.state.error && (
                    <div>
                      <h3 className="text-red-400 font-semibold mb-2">Error:</h3>
                      <pre className="p-3 bg-slate-950 rounded text-xs overflow-auto text-red-300 whitespace-pre-wrap">
                        {String(this.state.error?.message ?? this.state.error ?? 'Unknown error')}
                      </pre>
                    </div>
                  )}
                  {this.state.errorInfo && (
                    <div>
                      <h3 className="text-yellow-400 font-semibold mb-2">Component Stack:</h3>
                      <pre className="p-3 bg-slate-950 rounded text-xs overflow-auto text-yellow-300 whitespace-pre-wrap">
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

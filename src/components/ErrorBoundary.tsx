import React, { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced error logging
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Log to console with more details
    console.group('🚨 React Error Boundary')
    console.error('Error:', error)
    console.error('Error Message:', error.message)
    console.error('Error Stack:', error.stack)
    console.error('Component Stack:', errorInfo.componentStack)
    console.groupEnd()

    // Store error info for display
    this.setState({ errorInfo })

    // Try to send to error tracking service (if configured)
    if (import.meta.env.PROD && typeof window !== 'undefined') {
      // You can add Sentry or other error tracking here
      // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
    }
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-emerald-400 mb-4">
                Etwas ist schiefgelaufen
              </h1>
              <p className="text-slate-300 mb-6">
                Die App ist auf einen Fehler gestoßen. Bitte laden Sie die Seite neu.
              </p>
            </div>
            
            <div className="flex gap-4 justify-center mb-6">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
              >
                Seite neu laden
              </button>
              <button
                onClick={() => {
                  // Clear service worker and cache
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => {
                      regs.forEach(reg => reg.unregister())
                    })
                  }
                  if ('caches' in window) {
                    caches.keys().then(keys => {
                      keys.forEach(key => caches.delete(key))
                    })
                  }
                  localStorage.clear()
                  window.location.reload()
                }}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
              >
                Cache löschen & Neuladen
              </button>
              <a
                href="/debug-blackscreen.html"
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors inline-block"
              >
                Debug Tool
              </a>
            </div>

            {(this.state.error || this.state.errorInfo) && (
              <details className="mt-6 text-left bg-slate-900 rounded-lg p-4">
                <summary className="cursor-pointer text-sm text-slate-400 hover:text-slate-300 mb-2">
                  Fehlerdetails anzeigen {import.meta.env.DEV ? '(Dev Mode)' : ''}
                </summary>
                <div className="mt-2 space-y-4">
                  {this.state.error && (
                    <div>
                      <h3 className="text-red-400 font-semibold mb-2">Error:</h3>
                      <pre className="p-3 bg-slate-950 rounded text-xs overflow-auto text-red-300">
                        {this.state.error.toString()}
                        {this.state.error.stack && `\n\nStack:\n${this.state.error.stack}`}
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
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

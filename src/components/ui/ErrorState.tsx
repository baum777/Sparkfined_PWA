import { AlertTriangle } from '@/lib/icons'

interface ErrorStateProps {
  error: Error | string
  onRetry?: () => void
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error.message

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <AlertTriangle className="w-16 h-16 text-danger mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h3>
      <p className="text-text-secondary mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-brand hover:bg-brand-hover text-text-primary rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

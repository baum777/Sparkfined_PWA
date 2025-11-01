import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface ErrorStateProps {
  error: Error | string
  onRetry?: () => void
}

export default function ErrorState({ error, onRetry }: ErrorStateProps) {
  const message = typeof error === 'string' ? error : error.message

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-slate-200 mb-2">Something went wrong</h3>
      <p className="text-slate-400 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

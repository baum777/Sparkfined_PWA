import { ReactNode } from 'react'
import { ViewState } from '@/types/viewState'
import Button from '@/components/ui/Button'

interface ViewStateHandlerProps {
  state: ViewState
  error?: string
  emptyContent: ReactNode
  loadingContent?: ReactNode
  errorContent?: ReactNode
  resultContent: ReactNode
}

export default function ViewStateHandler({
  state,
  error,
  emptyContent,
  loadingContent,
  errorContent,
  resultContent,
}: ViewStateHandlerProps) {
  switch (state) {
    case 'loading':
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          {loadingContent || (
            <>
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-600 dark:text-slate-400">Loading...</p>
            </>
          )}
        </div>
      )

    case 'error':
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          {errorContent || (
            <>
              <div className="text-6xl">⚠️</div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  Something went wrong
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {error || 'An unexpected error occurred'}
                </p>
              </div>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Try Again
              </Button>
            </>
          )}
        </div>
      )

    case 'empty':
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">{emptyContent}</div>
      )

    case 'result':
      return <>{resultContent}</>

    default:
      return null
  }
}

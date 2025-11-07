import React from 'react'
import { logError } from '@/lib/log-error'

type AppErrorBoundaryProps = { children: React.ReactNode }
type AppErrorBoundaryState = { hasError: boolean }

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  override state: AppErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true }
  }

  override componentDidCatch(error: unknown, info: React.ErrorInfo): void {
    // Only log verbose info in Vercel preview
    if ((import.meta as any).env?.VERCEL_ENV === 'preview') {
      logError('AppErrorBoundary', error, info?.componentStack)
    }
  }

  override render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <main role="main" aria-label="Error">
          <h1>Something went wrong</h1>
          <p>Try reload. Diagnostics are collected in preview.</p>
        </main>
      )
    }
    return this.props.children
  }
}

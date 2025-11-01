import { useState } from 'react'
import FeedbackModal from './FeedbackModal'
import MetricsPanel from './MetricsPanel'

interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Sparkfined' }: HeaderProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isMetricsOpen, setIsMetricsOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Share feedback"
              title="Share Feedback"
            >
              💬
            </button>
            <button
              onClick={() => setIsMetricsOpen(true)}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="View metrics"
              title="Metrics & Export"
            >
              📊
            </button>
            <button
              onClick={() => document.documentElement.classList.toggle('dark')}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <span className="dark:hidden">🌙</span>
              <span className="hidden dark:inline">☀️</span>
            </button>
          </div>
        </div>
      </header>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <MetricsPanel isOpen={isMetricsOpen} onClose={() => setIsMetricsOpen(false)} />
    </>
  )
}

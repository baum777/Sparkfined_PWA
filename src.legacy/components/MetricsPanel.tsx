import { useEffect, useRef, useState, useId } from 'react'
import type { MouseEvent } from 'react'
import {
  getAllMetrics,
  getAllFeedback,
  exportMetricsAndFeedbackJSON,
  exportMetricsAndFeedbackCSV,
  downloadJSON,
  downloadCSV,
  markFeedbackExported,
  type MetricEntry,
  type FeedbackEntry,
} from '@/lib/db'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import Button from '@/components/ui/Button'

interface MetricsPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function MetricsPanel({ isOpen, onClose }: MetricsPanelProps) {
  const [metrics, setMetrics] = useState<MetricEntry[]>([])
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const headingId = useId()
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  })
  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  useEffect(() => {
    if (isOpen) {
      loadData()
    }
  }, [isOpen])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [metricsData, feedbackData] = await Promise.all([
        getAllMetrics(),
        getAllFeedback(),
      ])
      setMetrics(metricsData)
      setFeedback(feedbackData)
    } catch (error) {
      console.error('Failed to load metrics/feedback:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportJSON = async () => {
    const json = exportMetricsAndFeedbackJSON(metrics, feedback)
    const filename = `sparkfined-feedback-${new Date().toISOString().slice(0, 10)}.json`
    downloadJSON(json, filename)

    // Mark feedback as exported
    const feedbackIds = feedback.map((f) => f.id!).filter(Boolean)
    if (feedbackIds.length > 0) {
      await markFeedbackExported(feedbackIds)
      await loadData() // Reload to show updated status
    }
  }

  const handleExportCSV = async () => {
    const csv = exportMetricsAndFeedbackCSV(metrics, feedback)
    const filename = `sparkfined-feedback-${new Date().toISOString().slice(0, 10)}.csv`
    downloadCSV(csv, filename)

    // Mark feedback as exported
    const feedbackIds = feedback.map((f) => f.id!).filter(Boolean)
    if (feedbackIds.length > 0) {
      await markFeedbackExported(feedbackIds)
      await loadData() // Reload to show updated status
    }
  }

  const handleCopyJSON = async () => {
    const json = exportMetricsAndFeedbackJSON(metrics, feedback)
    await navigator.clipboard.writeText(json)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!isOpen) return null

  const queuedFeedback = feedback.filter((f) => f.status === 'queued')
  const totalEvents = metrics.reduce((sum, m) => sum + m.count, 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onMouseDown={handleOverlayMouseDown}
      data-testid="modal-overlay"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-h-[90vh] flex flex-col focus:outline-none"
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 id={headingId} className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            📊 Usage Metrics & Feedback
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              Loading data...
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {totalEvents}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Total Events
                  </div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {metrics.length}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Metric Types
                  </div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {queuedFeedback.length}
                  </div>
                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Pending Feedback
                  </div>
                </div>
              </div>

              {/* Metrics Table */}
              {metrics.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Event Counters
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">
                            Event Type
                          </th>
                          <th className="text-right py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">
                            Count
                          </th>
                          <th className="text-right py-2 px-3 text-slate-600 dark:text-slate-400 font-medium">
                            Last Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((metric) => (
                          <tr
                            key={metric.eventType}
                            className="border-b border-slate-100 dark:border-slate-800 last:border-0"
                          >
                            <td className="py-2 px-3 text-slate-700 dark:text-slate-300 font-mono text-xs">
                              {metric.eventType}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                              {metric.count}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600 dark:text-slate-400 text-xs">
                              {new Date(metric.lastUpdated).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Feedback List */}
              {feedback.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Feedback Items ({feedback.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {feedback.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                                {item.type}
                              </span>
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 dark:text-slate-300">
                              {item.text}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.status === 'exported'
                                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                : 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Privacy Notice */}
              <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg">
                🔒 <strong>Privacy Guarantee:</strong> All data is stored locally on your device.
                No personally identifiable information (PII) is collected. Exported files contain
                only anonymous usage counts and feedback text you've provided.
              </div>
            </>
          )}
        </div>

        {/* Footer - Export Actions */}
        <div className="border-t border-slate-200 dark:border-slate-700 p-4 space-y-2">
          <div className="flex gap-2">
            <Button onClick={handleExportJSON} className="flex-1">
              📥 Export JSON
            </Button>
            <Button variant="outline" onClick={handleExportCSV} className="flex-1">
              📥 Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJSON}
              title="Copy JSON to clipboard"
              aria-label="Copy JSON to clipboard"
              className="px-4"
            >
              {copied ? '✓' : '📋'}
            </Button>
          </div>
          <p className="text-xs text-center text-slate-500 dark:text-slate-400">
            Export your data to share with the community or keep as a backup
          </p>
        </div>
      </div>
    </div>
  )
}

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
import { Button } from '@/design-system'

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
        className="relative w-full max-w-2xl bg-white dark:bg-smoke-light rounded-xl shadow-2xl max-h-[90vh] flex flex-col focus:outline-none"
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-mist dark:border-smoke-lighter">
          <h2 id={headingId} className="text-lg font-semibold text-smoke dark:text-mist">
            📊 Usage Metrics & Feedback
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="text-fog hover:text-fog dark:hover:text-fog transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-8 text-ash dark:text-fog">
              Loading data...
            </div>
          ) : (
            <>
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="card text-center">
                  <div className="text-2xl font-bold text-spark dark:text-spark">
                    {totalEvents}
                  </div>
                  <div className="text-xs text-fog dark:text-fog mt-1">
                    Total Events
                  </div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-phosphor dark:text-phosphor">
                    {metrics.length}
                  </div>
                  <div className="text-xs text-fog dark:text-fog mt-1">
                    Metric Types
                  </div>
                </div>
                <div className="card text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {queuedFeedback.length}
                  </div>
                  <div className="text-xs text-fog dark:text-fog mt-1">
                    Pending Feedback
                  </div>
                </div>
              </div>

              {/* Metrics Table */}
              {metrics.length > 0 && (
                <div className="card">
                  <h3 className="font-semibold text-smoke dark:text-mist mb-3">
                    Event Counters
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-mist dark:border-smoke-lighter">
                          <th className="text-left py-2 px-3 text-fog dark:text-fog font-medium">
                            Event Type
                          </th>
                          <th className="text-right py-2 px-3 text-fog dark:text-fog font-medium">
                            Count
                          </th>
                          <th className="text-right py-2 px-3 text-fog dark:text-fog font-medium">
                            Last Updated
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {metrics.map((metric) => (
                          <tr
                            key={metric.eventType}
                            className="border-b border-mist dark:border-smoke-light last:border-0"
                          >
                            <td className="py-2 px-3 text-smoke-lighter dark:text-fog font-mono text-xs">
                              {metric.eventType}
                            </td>
                            <td className="py-2 px-3 text-right font-semibold text-smoke dark:text-mist">
                              {metric.count}
                            </td>
                            <td className="py-2 px-3 text-right text-fog dark:text-fog text-xs">
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
                  <h3 className="font-semibold text-smoke dark:text-mist mb-3">
                    Feedback Items ({feedback.length})
                  </h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {feedback.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-lg bg-void dark:bg-smoke border border-mist dark:border-smoke-lighter"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-spark dark:bg-void-lighter text-void-lighter dark:text-spark">
                                {item.type}
                              </span>
                              <span className="text-xs text-ash dark:text-fog">
                                {new Date(item.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-smoke-lighter dark:text-fog">
                              {item.text}
                            </p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded ${
                              item.status === 'exported'
                                ? 'bg-phosphor dark:bg-phosphor text-phosphor dark:text-phosphor'
                                : 'bg-gold dark:bg-gold text-gold dark:text-gold'
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
              <div className="text-xs text-ash dark:text-fog bg-mist dark:bg-smoke p-3 rounded-lg">
                🔒 <strong>Privacy Guarantee:</strong> All data is stored locally on your device.
                No personally identifiable information (PII) is collected. Exported files contain
                only anonymous usage counts and feedback text you've provided.
              </div>
            </>
          )}
        </div>

        {/* Footer - Export Actions */}
        <div className="border-t border-mist dark:border-smoke-lighter p-4 space-y-2">
          <div className="flex gap-2">
            <Button onClick={handleExportJSON} className="flex-1">
              📥 Export JSON
            </Button>
            <Button variant="secondary" onClick={handleExportCSV} className="flex-1">
              📥 Export CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopyJSON}
              title="Copy JSON to clipboard"
              aria-label="Copy JSON to clipboard"
              className="px-4"
            >
              {copied ? '✓' : '📋'}
            </Button>
          </div>
          <p className="text-xs text-center text-ash dark:text-fog">
            Export your data to share with the community or keep as a backup
          </p>
        </div>
      </div>
    </div>
  )
}

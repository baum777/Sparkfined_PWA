import { useState, useEffect, useCallback, useMemo, useRef, useId } from 'react'
import type { MouseEvent } from 'react'
import { getEventsBySession } from '@/lib/db'
import type { SessionEvent } from '@/lib/db'
import { useFocusTrap } from '@/hooks/useFocusTrap'

interface ReplayModalProps {
  isOpen: boolean
  onClose: () => void
  sessionId: string
  tradeId?: number
}

export default function ReplayModal({ isOpen, onClose, sessionId }: ReplayModalProps) {
  const [events, setEvents] = useState<SessionEvent[]>([])
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
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

  // Memoize sorted events to avoid re-sorting
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.timestamp - b.timestamp)
  }, [events])

  const loadEvents = useCallback(async () => {
    if (!sessionId) return
    
    setIsLoading(true)
    try {
      // Use requestIdleCallback for non-blocking load if available
      const loadTask = async () => {
        const sessionEvents = await getEventsBySession(sessionId)
        setEvents(sessionEvents)
        setIsLoading(false)
      }
      
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => loadTask())
      } else {
        await loadTask()
      }
    } catch (error) {
      console.error('Failed to load events:', error)
      setIsLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    if (isOpen && sessionId && !mounted) {
      setMounted(true)
      loadEvents()
    }
    
    // Reset when closed
    if (!isOpen) {
      setMounted(false)
      setSelectedEventIndex(null)
    }
  }, [isOpen, sessionId, loadEvents, mounted])

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const formatEventType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getEventIcon = (type: string) => {
    if (type.includes('screenshot')) return '📸'
    if (type.includes('save') || type.includes('trade')) return '💾'
    if (type.includes('analyze')) return '📊'
    if (type.includes('session')) return '🔄'
    return '▪️'
  }

  if (!isOpen) return null

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/70 p-4 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        onMouseDown={handleOverlayMouseDown}
        data-testid="modal-overlay"
      >
        <div
          ref={modalRef}
          tabIndex={-1}
          className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-border-moderate bg-surface text-text-primary shadow-xl focus:outline-none"
          data-testid="modal-content"
        >
        {/* Header */}
        <div className="border-b border-border-moderate p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 id={headingId} className="text-2xl font-bold text-text-primary">
                Session Replay
              </h2>
              <p className="mt-1 text-sm text-text-secondary">
                Preview Mode - Static Timeline
              </p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="text-2xl leading-none text-text-secondary transition-colors hover:bg-interactive-hover hover:text-text-primary rounded-lg p-2"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Event List - Sidebar */}
          <div className="w-full md:w-80 overflow-y-auto border-b border-border md:border-b-0 md:border-r">
            {isLoading ? (
              <div className="p-8 text-center text-text-secondary">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2" />
                <p>Loading events...</p>
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="p-8 text-center text-text-secondary">
                No events recorded for this session
              </div>
            ) : (
              <div className="divide-y divide-border-subtle">
                {sortedEvents.map((event, index) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventIndex(index)}
                    className={`w-full p-4 text-left transition-colors hover:bg-interactive-hover ${
                      selectedEventIndex === index
                        ? 'border-l-4 border-brand bg-accent/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getEventIcon(event.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium text-text-primary">
                          {formatEventType(event.type)}
                        </div>
                        <div className="mt-1 text-xs text-text-secondary">
                          {formatTime(event.timestamp)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Main content area - Timeline/Details */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedEventIndex !== null && sortedEvents[selectedEventIndex] ? (
              <div className="space-y-4">
                <div className="card">
                  <h3 className="mb-4 text-lg font-semibold text-text-primary">
                    Event Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Type:</span>
                      <span className="font-medium text-text-primary">
                        {formatEventType(sortedEvents[selectedEventIndex].type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Time:</span>
                      <span className="font-medium text-text-primary">
                        {new Date(sortedEvents[selectedEventIndex].timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Session:</span>
                      <span className="font-mono text-xs text-text-primary">
                        {sortedEvents[selectedEventIndex].sessionId.slice(0, 20)}...
                      </span>
                    </div>
                  </div>

                  {sortedEvents[selectedEventIndex].data && (
                    <div className="mt-4 border-t border-border pt-4">
                      <div className="mb-2 text-sm text-text-secondary">
                        Event Data:
                      </div>
                      <pre className="overflow-x-auto rounded-lg bg-surface-subtle p-3 text-xs text-text-primary">
                        {JSON.stringify(sortedEvents[selectedEventIndex].data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Timeline visualization */}
                <div className="card">
                  <h3 className="mb-3 text-sm font-semibold text-text-primary">
                    Session Timeline
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                    {sortedEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className={`relative pl-10 pb-4 ${
                          index === selectedEventIndex ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <div
                          className={`absolute left-2.5 h-3 w-3 rounded-full ${
                            index === selectedEventIndex
                              ? 'bg-brand ring-4 ring-brand/20'
                              : 'bg-border'
                          }`}
                        />
                        <div className="text-xs text-text-secondary">
                          {formatTime(event.timestamp)}
                        </div>
                        <div className="text-sm font-medium text-text-primary">
                          {formatEventType(event.type)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div className="space-y-4">
                  <div className="text-6xl">🎬</div>
                  <h3 className="text-xl font-semibold text-text-primary">
                    Select an Event
                  </h3>
                  <p className="max-w-sm text-text-secondary">
                    Click on an event in the sidebar to view details and position in the timeline
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-surface-subtle p-4">
          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>{sortedEvents.length} events recorded</span>
            <span className="text-xs text-text-tertiary">Static preview • No scrubbing yet</span>
          </div>
        </div>
      </div>
    </div>
  )
}

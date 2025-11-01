import { useState, useEffect, useCallback, useMemo } from 'react'
import { getEventsBySession } from '@/lib/db'
import type { SessionEvent } from '@/lib/db'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Session Replay
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Preview Mode - Static Timeline
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Event List - Sidebar */}
          <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-700 overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mb-2" />
                <p>Loading events...</p>
              </div>
            ) : sortedEvents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                No events recorded for this session
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-700">
                {sortedEvents.map((event, index) => (
                  <button
                    key={event.id}
                    onClick={() => setSelectedEventIndex(index)}
                    className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${
                      selectedEventIndex === index
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{getEventIcon(event.type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                          {formatEventType(event.type)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
          <div className="flex-1 p-6 overflow-y-auto">
            {selectedEventIndex !== null && sortedEvents[selectedEventIndex] ? (
              <div className="space-y-4">
                <div className="card">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">
                    Event Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Type:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatEventType(sortedEvents[selectedEventIndex].type)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Time:</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {new Date(sortedEvents[selectedEventIndex].timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Session:</span>
                      <span className="font-mono text-xs text-slate-900 dark:text-slate-100">
                        {sortedEvents[selectedEventIndex].sessionId.slice(0, 20)}...
                      </span>
                    </div>
                  </div>

                  {sortedEvents[selectedEventIndex].data && (
                    <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                        Event Data:
                      </div>
                      <pre className="text-xs bg-slate-100 dark:bg-slate-900 p-3 rounded-lg overflow-x-auto">
                        {JSON.stringify(sortedEvents[selectedEventIndex].data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>

                {/* Timeline visualization */}
                <div className="card">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">
                    Session Timeline
                  </h3>
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                    {sortedEvents.map((event, index) => (
                      <div
                        key={event.id}
                        className={`relative pl-10 pb-4 ${
                          index === selectedEventIndex ? 'opacity-100' : 'opacity-40'
                        }`}
                      >
                        <div
                          className={`absolute left-2.5 w-3 h-3 rounded-full ${
                            index === selectedEventIndex
                              ? 'bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-900'
                              : 'bg-slate-300 dark:bg-slate-600'
                          }`}
                        />
                        <div className="text-xs text-slate-600 dark:text-slate-400">
                          {formatTime(event.timestamp)}
                        </div>
                        <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
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
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    Select an Event
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                    Click on an event in the sidebar to view details and position in the timeline
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
            <span>{sortedEvents.length} events recorded</span>
            <span className="text-xs">Static preview • No scrubbing yet</span>
          </div>
        </div>
      </div>
    </div>
  )
}

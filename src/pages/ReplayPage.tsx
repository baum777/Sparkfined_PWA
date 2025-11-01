import { useState, useEffect } from 'react'
import ReplayModal from '@/components/ReplayModal'
import { getAllEvents, initDB } from '@/lib/db'
import type { SessionEvent } from '@/lib/db'

export default function ReplayPage() {
  const [sessions, setSessions] = useState<{ sessionId: string; count: number; firstEvent: number; lastEvent: number }[]>([])
  const [isReplayOpen, setIsReplayOpen] = useState(false)
  const [selectedSessionId, setSelectedSessionId] = useState('')

  useEffect(() => {
    initDB().then(loadSessions)
  }, [])

  const loadSessions = async () => {
    try {
      const events = await getAllEvents()
      
      // Group events by session
      const sessionMap = new Map<string, SessionEvent[]>()
      events.forEach((event) => {
        const existing = sessionMap.get(event.sessionId) || []
        existing.push(event)
        sessionMap.set(event.sessionId, existing)
      })

      // Convert to array with metadata
      const sessionList = Array.from(sessionMap.entries()).map(([sessionId, events]) => ({
        sessionId,
        count: events.length,
        firstEvent: Math.min(...events.map((e) => e.timestamp)),
        lastEvent: Math.max(...events.map((e) => e.timestamp)),
      }))

      // Sort by most recent first
      sessionList.sort((a, b) => b.lastEvent - a.lastEvent)
      setSessions(sessionList)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    }
  }

  const openReplay = (sessionId: string) => {
    setSelectedSessionId(sessionId)
    setIsReplayOpen(true)
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const formatDuration = (start: number, end: number) => {
    const durationMs = end - start
    const minutes = Math.floor(durationMs / 60000)
    const seconds = Math.floor((durationMs % 60000) / 1000)
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  if (sessions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-12rem)] px-4">
        <div className="text-center space-y-6 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-xl bg-surface border border-border-accent/20 mb-2">
            <svg className="w-10 h-10 text-brand" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
          </div>
          <div className="space-y-3">
            <h2 className="text-display-sm font-display font-bold text-text-primary">Session Replay</h2>
            <p className="text-text-secondary max-w-md mx-auto leading-relaxed">
              No recorded sessions yet. <span className="text-brand font-medium">Watch your analysis journey.</span>
            </p>
          </div>
          <div className="mt-4 p-4 bg-brand/10 border border-brand/20 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-text-secondary">
              <strong className="text-brand">Preview Mode:</strong> Static timeline viewer.
              Full playback controls coming soon.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-display-sm font-display font-bold text-text-primary">
              Session Replay
            </h2>
            <p className="text-sm text-text-secondary mt-1">
              Review your analysis sessions and learning moments
            </p>
          </div>
          <button
            onClick={loadSessions}
            className="btn-ghost text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        <div className="p-4 bg-brand/10 rounded-lg border border-brand/20">
          <div className="flex items-start gap-3">
            <span className="text-2xl">⚡</span>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-brand mb-1">
                Static Preview Mode
              </h3>
              <p className="text-sm text-text-secondary">
                Proof-of-concept timeline viewer. Full replay features (scrubbing, 
                playback controls, chart snapshots) coming in future phases.
              </p>
            </div>
          </div>
        </div>

        <div className="text-sm font-mono text-text-tertiary mb-4">
          {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sessions.map((session) => (
            <div
              key={session.sessionId}
              className="card-interactive"
              onClick={() => openReplay(session.sessionId)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎬</span>
                  <div>
                    <h3 className="font-display font-semibold text-text-primary">
                      Session
                    </h3>
                    <div className="text-xs text-text-tertiary font-mono">
                      {session.sessionId.slice(0, 20)}...
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 text-xs font-mono rounded-md border bg-cyan/10 border-cyan text-cyan">
                  {session.count} events
                </span>
              </div>

              <div className="space-y-2 text-sm font-mono text-text-secondary">
                <div className="flex justify-between">
                  <span>Started</span>
                  <span className="font-medium text-text-primary">{formatDate(session.firstEvent)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration</span>
                  <span className="font-medium text-text-primary">
                    {formatDuration(session.firstEvent, session.lastEvent)}
                  </span>
                </div>
              </div>

              <button className="btn-primary w-full mt-4">
                Watch Replay →
              </button>
            </div>
          ))}
        </div>
      </div>

      <ReplayModal
        isOpen={isReplayOpen}
        onClose={() => setIsReplayOpen(false)}
        sessionId={selectedSessionId}
      />
    </>
  )
}

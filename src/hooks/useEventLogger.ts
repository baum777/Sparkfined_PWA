// Event logging hook for tracking user actions
import { useCallback, useEffect } from 'react'
import { logEvent, getSessionId, startNewSession, incrementMetric } from '@/lib/db'
import { ENV } from '@/config/env'

// Key event types for Beta telemetry
export const EventTypes = {
  // Upload & Input (A1)
  UPLOAD_OK: 'upload_ok',
  PASTE_CA_OK: 'paste_ca_ok',
  IMAGE_PROCESSED: 'image_processed',
  IMAGE_PROCESSING_ERROR: 'image_processing_error',
  
  // Analysis (A3)
  ANALYSIS_START: 'analysis_start',
  ANALYSIS_DONE: 'analysis_done',
  ANALYSIS_ERROR: 'analysis_error',
  
  // Journal & Trade Management
  SAVE_TRADE_CLICKED: 'save_trade_clicked',
  TRADE_SAVED: 'trade_saved',
  TRADE_DELETED: 'trade_deleted',
  TRADES_EXPORTED: 'trades_exported',
  JOURNAL_LOADED: 'journal_loaded',
  
  // Replay (A4)
  REPLAY_OPEN: 'replay_open',
  REPLAY_OPENED: 'replay_opened',
  
  // Feedback & Export (A5)
  EXPORT_PLAYBOOK: 'export_playbook',
  EXPORT_JSON: 'export_json',
  EXPORT_CSV: 'export_csv',
  
  // Legacy metrics (maintain compatibility)
  DROP_TO_RESULT: 'drop_to_result',
  SAVE_TRADE: 'save_trade',
  OPEN_REPLAY: 'open_replay',
  EXPORT_SHARE: 'export_share',
  SCREENSHOT_DROPPED: 'screenshot_dropped',
  DEMO_MODE_ACTIVATED: 'demo_mode_activated',
} as const

// Key metrics to track for Phase 4
const TRACKED_METRICS = [
  'upload_ok',
  'paste_ca_ok',
  'image_processed',
  'analysis_done',
  'trade_saved',
  'replay_opened',
  'export_playbook',
  'export_json',
  'export_csv',
  // Legacy
  'drop_to_result',
  'save_trade',
  'open_replay',
  'export_share',
  'screenshot_dropped',
  'demo_mode_activated',
]

export function useEventLogger() {
  // Initialize session on mount
  useEffect(() => {
    const sessionId = getSessionId()
    logEvent({
      sessionId,
      type: 'session_start',
      timestamp: Date.now(),
      data: { userAgent: navigator.userAgent },
    })

    return () => {
      logEvent({
        sessionId,
        type: 'session_end',
        timestamp: Date.now(),
      })
    }
  }, [])

  const log = useCallback(async (type: string, data?: Record<string, unknown>) => {
    try {
      // Log detailed event
      await logEvent({
        sessionId: getSessionId(),
        type,
        timestamp: Date.now(),
        data: {
          ...data,
          userAgent: navigator.userAgent,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
        },
      })

      // Increment metric counter if it's a tracked metric
      if (TRACKED_METRICS.includes(type)) {
        await incrementMetric(type)
      }
      
      // Console log in dev mode
      if (ENV.DEV || ENV.ENABLE_DEBUG) {
        console.log(`[📊 Event] ${type}`, data)
      }
    } catch (error) {
      console.warn('Failed to log event:', error)
    }
  }, [])

  const logTiming = useCallback(async (
    label: string, 
    duration: number,
    additionalData?: Record<string, unknown>
  ) => {
    await log('performance_timing', {
      label,
      duration,
      ...additionalData,
    })
  }, [log])

  const logError = useCallback(async (
    error: Error | string,
    context?: Record<string, unknown>
  ) => {
    const errorData = typeof error === 'string' 
      ? { message: error }
      : { 
          message: error.message, 
          stack: error.stack,
          name: error.name 
        }
    
    await log('error_occurred', {
      ...errorData,
      ...context,
    })
  }, [log])

  return { 
    log, 
    logTiming,
    logError,
    sessionId: getSessionId(), 
    startNewSession,
    EventTypes 
  }
}

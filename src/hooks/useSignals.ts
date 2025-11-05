/**
 * Custom Hooks for Signal Orchestrator
 * 
 * Provides React hooks for accessing signal database:
 * - useSignals() - All signals with filtering
 * - useTradePlans() - Trade plans by status
 * - useLessons() - Top lessons sorted by score
 * - useSignalById() - Single signal by ID
 * - usePatternStats() - Performance stats for a pattern
 */

import { useEffect, useState } from 'react'
import type { Signal, TradePlan, Lesson, TradeOutcome } from '@/types/signal'
import {
  getAllSignals,
  getSignalsByPattern,
  getTradePlansByStatus,
  getAllTradePlans,
  getTopLessons,
  getAllLessons,
  getSignalById,
  getTradePlanById,
  getLessonById,
  getPatternStats,
  getAllTradeOutcomes,
} from '@/lib/signalDb'

// ============================================================================
// SIGNALS
// ============================================================================

export function useSignals(pattern?: Signal['pattern']) {
  const [signals, setSignals] = useState<Signal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setLoading(true)
        const data = pattern
          ? await getSignalsByPattern(pattern)
          : await getAllSignals()
        
        // Sort by timestamp descending
        data.sort((a, b) => 
          new Date(b.timestamp_utc).getTime() - new Date(a.timestamp_utc).getTime()
        )
        
        setSignals(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSignals()
  }, [pattern])

  return { signals, loading, error, refetch: () => setLoading(true) }
}

export function useSignalById(id: string | null) {
  const [signal, setSignal] = useState<Signal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setSignal(null)
      setLoading(false)
      return
    }

    const fetchSignal = async () => {
      try {
        setLoading(true)
        const data = await getSignalById(id)
        setSignal(data || null)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchSignal()
  }, [id])

  return { signal, loading, error }
}

// ============================================================================
// TRADE PLANS
// ============================================================================

export function useTradePlans(status?: TradePlan['status']) {
  const [plans, setPlans] = useState<TradePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true)
        const data = status
          ? await getTradePlansByStatus(status)
          : await getAllTradePlans()
        
        // Sort by created_at descending
        data.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        setPlans(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlans()
  }, [status])

  return { plans, loading, error, refetch: () => setLoading(true) }
}

export function useTradePlanById(id: string | null) {
  const [plan, setPlan] = useState<TradePlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setPlan(null)
      setLoading(false)
      return
    }

    const fetchPlan = async () => {
      try {
        setLoading(true)
        const data = await getTradePlanById(id)
        setPlan(data || null)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [id])

  return { plan, loading, error }
}

// ============================================================================
// LESSONS
// ============================================================================

export function useLessons(limit?: number, pattern?: string) {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true)
        const data = limit ? await getTopLessons(limit) : await getAllLessons()
        
        // Filter by pattern if specified
        const filtered = pattern
          ? data.filter((l) => l.pattern === pattern)
          : data
        
        // Sort by score descending
        filtered.sort((a, b) => b.score - a.score)
        
        setLessons(filtered)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchLessons()
  }, [limit, pattern])

  return { lessons, loading, error, refetch: () => setLoading(true) }
}

export function useLessonById(id: string | null) {
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setLesson(null)
      setLoading(false)
      return
    }

    const fetchLesson = async () => {
      try {
        setLoading(true)
        const data = await getLessonById(id)
        setLesson(data || null)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [id])

  return { lesson, loading, error }
}

// ============================================================================
// ANALYTICS
// ============================================================================

export function usePatternStats(pattern: string) {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getPatternStats>> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await getPatternStats(pattern)
        setStats(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [pattern])

  return { stats, loading, error }
}

export function useTradeOutcomes() {
  const [outcomes, setOutcomes] = useState<TradeOutcome[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchOutcomes = async () => {
      try {
        setLoading(true)
        const data = await getAllTradeOutcomes()
        setOutcomes(data)
        setError(null)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchOutcomes()
  }, [])

  return { outcomes, loading, error, refetch: () => setLoading(true) }
}

// ============================================================================
// COMBINED HOOKS
// ============================================================================

/**
 * Get signal with its associated trade plan
 */
export function useSignalWithPlan(signalId: string | null) {
  const { signal, loading: signalLoading } = useSignalById(signalId)
  const [plan, setPlan] = useState<TradePlan | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!signal) {
      setPlan(null)
      setLoading(signalLoading)
      return
    }

    const fetchPlan = async () => {
      try {
        const allPlans = await getAllTradePlans()
        const matchingPlan = allPlans.find((p) => p.signal_id === signal.id)
        setPlan(matchingPlan || null)
      } catch (err) {
        console.error('Error fetching plan:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPlan()
  }, [signal, signalLoading])

  return { signal, plan, loading }
}

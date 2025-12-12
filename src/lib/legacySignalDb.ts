/**
 * Signal Orchestrator Database Layer
 * Extended IndexedDB schema for signals, plans, nodes, and lessons
 *
 * Extends existing db.ts with event-sourced action graph
 *
 * @module lib/signalDb
 */

import type { Signal, TradePlan, ActionNode, Lesson, TradeOutcome } from '@/types/signal'

const DB_NAME = 'sparkfined-signals'
const DB_VERSION = 1

let signalDbInstance: IDBDatabase | null = null

// ============================================================================
// DATABASE INITIALIZATION
// ============================================================================

export async function initSignalDB(): Promise<IDBDatabase> {
  if (signalDbInstance) return signalDbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      signalDbInstance = request.result
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Signals store
      if (!db.objectStoreNames.contains('signals')) {
        const signalStore = db.createObjectStore('signals', { keyPath: 'id' })
        signalStore.createIndex('timestamp_utc', 'timestamp_utc', { unique: false })
        signalStore.createIndex('pattern', 'pattern', { unique: false })
        signalStore.createIndex('direction', 'direction', { unique: false })
        signalStore.createIndex('confidence', 'confidence', { unique: false })
        signalStore.createIndex('market.chain', 'market.chain', { unique: false })
        signalStore.createIndex('market.symbol', 'market.symbol', { unique: false })
      }

      // Trade Plans store
      if (!db.objectStoreNames.contains('trade_plans')) {
        const planStore = db.createObjectStore('trade_plans', { keyPath: 'id' })
        planStore.createIndex('signal_id', 'signal_id', { unique: false })
        planStore.createIndex('status', 'status', { unique: false })
        planStore.createIndex('created_at', 'created_at', { unique: false })
        planStore.createIndex('expires_at', 'expires_at', { unique: false })
      }

      // Action Nodes store (event sourcing)
      if (!db.objectStoreNames.contains('action_nodes')) {
        const nodeStore = db.createObjectStore('action_nodes', { keyPath: 'id' })
        nodeStore.createIndex('type', 'type', { unique: false })
        nodeStore.createIndex('ts_utc', 'ts_utc', { unique: false })
        nodeStore.createIndex('refs.signal_id', 'refs.signal_id', { unique: false })
        nodeStore.createIndex('refs.plan_id', 'refs.plan_id', { unique: false })
        nodeStore.createIndex('refs.prev_node_id', 'refs.prev_node_id', { unique: false })
      }

      // Lessons store
      if (!db.objectStoreNames.contains('lessons')) {
        const lessonStore = db.createObjectStore('lessons', { keyPath: 'id' })
        lessonStore.createIndex('pattern', 'pattern', { unique: false })
        lessonStore.createIndex('score', 'score', { unique: false })
        lessonStore.createIndex('created_at', 'created_at', { unique: false })
        lessonStore.createIndex('updated_at', 'updated_at', { unique: false })
      }

      // Trade Outcomes store
      if (!db.objectStoreNames.contains('trade_outcomes')) {
        const outcomeStore = db.createObjectStore('trade_outcomes', { keyPath: 'plan_id' })
        outcomeStore.createIndex('signal_id', 'signal_id', { unique: false })
        outcomeStore.createIndex('result', 'result', { unique: false })
        outcomeStore.createIndex('exit_reason', 'exit_reason', { unique: false })
      }

      // Edges store (graph connections)
      if (!db.objectStoreNames.contains('edges')) {
        const edgeStore = db.createObjectStore('edges', { autoIncrement: true })
        edgeStore.createIndex('from', 'from', { unique: false })
        edgeStore.createIndex('to', 'to', { unique: false })
        edgeStore.createIndex('type', 'type', { unique: false })
      }
    }
  })
}

// ============================================================================
// SIGNAL OPERATIONS
// ============================================================================

export async function saveSignal(signal: Signal): Promise<void> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['signals'], 'readwrite')
    const store = transaction.objectStore('signals')
    const request = store.put(signal)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getSignalById(id: string): Promise<Signal | undefined> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['signals'], 'readonly')
    const store = transaction.objectStore('signals')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as Signal | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function getAllSignals(): Promise<Signal[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['signals'], 'readonly')
    const store = transaction.objectStore('signals')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as Signal[])
    request.onerror = () => reject(request.error)
  })
}

export async function getSignalsByPattern(pattern: Signal['pattern']): Promise<Signal[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['signals'], 'readonly')
    const store = transaction.objectStore('signals')
    const index = store.index('pattern')
    const request = index.getAll(pattern)

    request.onsuccess = () => resolve(request.result as Signal[])
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// TRADE PLAN OPERATIONS
// ============================================================================

export async function saveTradePlan(plan: TradePlan): Promise<void> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_plans'], 'readwrite')
    const store = transaction.objectStore('trade_plans')
    const request = store.put(plan)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getTradePlanById(id: string): Promise<TradePlan | undefined> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_plans'], 'readonly')
    const store = transaction.objectStore('trade_plans')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as TradePlan | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function getTradePlansByStatus(status: TradePlan['status']): Promise<TradePlan[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_plans'], 'readonly')
    const store = transaction.objectStore('trade_plans')
    const index = store.index('status')
    const request = index.getAll(status)

    request.onsuccess = () => resolve(request.result as TradePlan[])
    request.onerror = () => reject(request.error)
  })
}

export async function getAllTradePlans(): Promise<TradePlan[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_plans'], 'readonly')
    const store = transaction.objectStore('trade_plans')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as TradePlan[])
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// ACTION NODE OPERATIONS (Event Sourcing)
// ============================================================================

export async function saveActionNode(node: ActionNode): Promise<void> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['action_nodes'], 'readwrite')
    const store = transaction.objectStore('action_nodes')
    const request = store.put(node)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getActionNodeById(id: string): Promise<ActionNode | undefined> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['action_nodes'], 'readonly')
    const store = transaction.objectStore('action_nodes')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as ActionNode | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function getActionNodesByType(type: ActionNode['type']): Promise<ActionNode[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['action_nodes'], 'readonly')
    const store = transaction.objectStore('action_nodes')
    const index = store.index('type')
    const request = index.getAll(type)

    request.onsuccess = () => resolve(request.result as ActionNode[])
    request.onerror = () => reject(request.error)
  })
}

export async function getActionNodesBySignal(signalId: string): Promise<ActionNode[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['action_nodes'], 'readonly')
    const store = transaction.objectStore('action_nodes')
    const index = store.index('refs.signal_id')
    const request = index.getAll(signalId)

    request.onsuccess = () => resolve(request.result as ActionNode[])
    request.onerror = () => reject(request.error)
  })
}

export async function getAllActionNodes(): Promise<ActionNode[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['action_nodes'], 'readonly')
    const store = transaction.objectStore('action_nodes')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as ActionNode[])
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// LESSON OPERATIONS
// ============================================================================

export async function saveLesson(lesson: Lesson): Promise<void> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lessons'], 'readwrite')
    const store = transaction.objectStore('lessons')
    const request = store.put(lesson)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getLessonById(id: string): Promise<Lesson | undefined> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lessons'], 'readonly')
    const store = transaction.objectStore('lessons')
    const request = store.get(id)

    request.onsuccess = () => resolve(request.result as Lesson | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function getLessonsByPattern(pattern: string): Promise<Lesson[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lessons'], 'readonly')
    const store = transaction.objectStore('lessons')
    const index = store.index('pattern')
    const request = index.getAll(pattern)

    request.onsuccess = () => resolve(request.result as Lesson[])
    request.onerror = () => reject(request.error)
  })
}

export async function getTopLessons(limit: number = 10): Promise<Lesson[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lessons'], 'readonly')
    const store = transaction.objectStore('lessons')
    const request = store.getAll()

    request.onsuccess = () => {
      const lessons = request.result as Lesson[]
      // Sort by score descending
      lessons.sort((a, b) => b.score - a.score)
      resolve(lessons.slice(0, limit))
    }
    request.onerror = () => reject(request.error)
  })
}

export async function getAllLessons(): Promise<Lesson[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['lessons'], 'readonly')
    const store = transaction.objectStore('lessons')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as Lesson[])
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// TRADE OUTCOME OPERATIONS
// ============================================================================

export async function saveTradeOutcome(outcome: TradeOutcome): Promise<void> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_outcomes'], 'readwrite')
    const store = transaction.objectStore('trade_outcomes')
    const request = store.put(outcome)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getTradeOutcomeByPlan(planId: string): Promise<TradeOutcome | undefined> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_outcomes'], 'readonly')
    const store = transaction.objectStore('trade_outcomes')
    const request = store.get(planId)

    request.onsuccess = () => resolve(request.result as TradeOutcome | undefined)
    request.onerror = () => reject(request.error)
  })
}

export async function getTradeOutcomesBySignal(signalId: string): Promise<TradeOutcome[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_outcomes'], 'readonly')
    const store = transaction.objectStore('trade_outcomes')
    const index = store.index('signal_id')
    const request = index.getAll(signalId)

    request.onsuccess = () => resolve(request.result as TradeOutcome[])
    request.onerror = () => reject(request.error)
  })
}

export async function getAllTradeOutcomes(): Promise<TradeOutcome[]> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['trade_outcomes'], 'readonly')
    const store = transaction.objectStore('trade_outcomes')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result as TradeOutcome[])
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// EDGE OPERATIONS (Graph Connections)
// ============================================================================

export async function saveEdge(
  from: string,
  to: string,
  type: 'CAUSES' | 'FOLLOWS' | 'INVALIDATES' | 'REFINES'
): Promise<void> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['edges'], 'readwrite')
    const store = transaction.objectStore('edges')
    const request = store.add({ from, to, type })

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getEdgesFrom(nodeId: string): Promise<Array<{ from: string; to: string; type: string }>> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['edges'], 'readonly')
    const store = transaction.objectStore('edges')
    const index = store.index('from')
    const request = index.getAll(nodeId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function getEdgesTo(nodeId: string): Promise<Array<{ from: string; to: string; type: string }>> {
  const db = await initSignalDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['edges'], 'readonly')
    const store = transaction.objectStore('edges')
    const index = store.index('to')
    const request = index.getAll(nodeId)

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// ============================================================================
// ANALYTICS & REPORTING
// ============================================================================

/**
 * Get performance statistics for a specific pattern
 */
export async function getPatternStats(pattern: string): Promise<{
  total_signals: number
  total_plans: number
  total_trades: number
  win_rate: number
  avg_rr: number
  avg_pnl: number
}> {
  const signals = await getSignalsByPattern(pattern as Signal['pattern'])
  const outcomes = await getAllTradeOutcomes()
  
  const signalIds = signals.map((s) => s.id)
  const patternOutcomes = outcomes.filter((o) => signalIds.includes(o.signal_id))
  
  const wins = patternOutcomes.filter((o) => o.result === 'win')
  const winRate = patternOutcomes.length > 0 ? wins.length / patternOutcomes.length : 0
  const avgRR = patternOutcomes.length > 0 
    ? patternOutcomes.reduce((sum, o) => sum + o.rr_actual, 0) / patternOutcomes.length 
    : 0
  const avgPnl = patternOutcomes.length > 0
    ? patternOutcomes.reduce((sum, o) => sum + o.pnl_usd, 0) / patternOutcomes.length
    : 0

  return {
    total_signals: signals.length,
    total_plans: patternOutcomes.length,
    total_trades: patternOutcomes.length,
    win_rate: winRate,
    avg_rr: avgRR,
    avg_pnl: avgPnl,
  }
}

/**
 * Export all data for backup/analysis
 */
export async function exportAllData(): Promise<{
  signals: Signal[]
  trade_plans: TradePlan[]
  action_nodes: ActionNode[]
  lessons: Lesson[]
  trade_outcomes: TradeOutcome[]
}> {
  return {
    signals: await getAllSignals(),
    trade_plans: await getAllTradePlans(),
    action_nodes: await getAllActionNodes(),
    lessons: await getAllLessons(),
    trade_outcomes: await getAllTradeOutcomes(),
  }
}

/**
 * Create Lesson API Endpoint
 * 
 * Extracts and saves a lesson from trade outcome
 * 
 * @endpoint POST /api/signals/create-lesson
 * @param {string} plan_id - Trade plan ID
 * @param {TradeOutcome} outcome - Trade outcome data
 * 
 * @returns {Lesson} Created lesson
 */

export const config = { runtime: 'edge' }

import type { TradeOutcome } from '@/types/signal'
import {
  getTradePlanById,
  getSignalById,
  getSignalsByPattern,
  getAllTradeOutcomes,
  saveLesson,
  saveTradeOutcome,
  saveActionNode,
} from '@/lib/signalDb'
import { extractLesson, createActionNode } from '@/lib/signalOrchestrator'

export default async function handler(req: Request) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const body = await req.json()
    const { plan_id, outcome } = body as { plan_id: string; outcome: TradeOutcome }

    if (!plan_id || !outcome) {
      return new Response(JSON.stringify({ error: 'Missing plan_id or outcome' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 1. Fetch trade plan
    const plan = await getTradePlanById(plan_id)
    if (!plan) {
      return new Response(JSON.stringify({ error: 'Trade plan not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 2. Fetch signal
    const signal = await getSignalById(plan.signal_id)
    if (!signal) {
      return new Response(JSON.stringify({ error: 'Signal not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // 3. Save trade outcome
    await saveTradeOutcome(outcome)

    // 4. Get similar outcomes for pattern analysis
    const allOutcomes = await getAllTradeOutcomes()
    const patternSignals = await getSignalsByPattern(signal.pattern)
    const patternSignalIds = patternSignals.map((s) => s.id)
    const similarOutcomes = allOutcomes.filter((o) => patternSignalIds.includes(o.signal_id))

    // 5. Extract lesson
    const lesson = extractLesson(signal, plan, outcome, similarOutcomes)

    // 6. Save lesson
    await saveLesson(lesson)

    // 7. Create action node
    const node = createActionNode(
      'lesson.curated',
      {
        lesson_id: lesson.id,
        pattern: lesson.pattern,
        win_rate: lesson.stats?.win_rate || 0,
      },
      { signal_id: signal.id, plan_id: plan.id },
      [`pattern/${lesson.pattern}`, `lesson/created`],
      lesson.score
    )
    await saveActionNode(node)

    return new Response(JSON.stringify({ lesson }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Failed to create lesson',
        message: error?.message || String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

/**
 * Lesson Generator & Learning Worker
 * 
 * Continuously analyzes trade outcomes and generates lessons
 * Implements the learning layer of the Signal Orchestrator
 * 
 * @module lib/lessonGenerator
 */

import type { Signal, TradePlan, Lesson, TradeOutcome, ActionNode } from '@/types/signal'
import {
  getAllSignals,
  getAllTradePlans,
  getAllTradeOutcomes,
  getTradeOutcomesBySignal,
  saveLesson,
  saveActionNode,
  getSignalsByPattern,
} from './signalDb'
import { extractLesson } from './signalOrchestrator'

// ============================================================================
// LESSON GENERATION
// ============================================================================

/**
 * Generate lessons from all completed trades
 * Should be run periodically (e.g., daily cron)
 */
export async function generateLessonsFromOutcomes(): Promise<Lesson[]> {
  console.log('[LessonGenerator] Starting lesson generation...')
  
  const signals = await getAllSignals()
  const plans = await getAllTradePlans()
  const outcomes = await getAllTradeOutcomes()
  
  console.log(`[LessonGenerator] Analyzing ${signals.length} signals, ${plans.length} plans, ${outcomes.length} outcomes`)
  
  const lessons: Lesson[] = []
  
  // Group outcomes by pattern
  const patternGroups = new Map<string, TradeOutcome[]>()
  
  for (const outcome of outcomes) {
    // Find the signal for this outcome
    const signal = signals.find((s) => s.id === outcome.signal_id)
    if (!signal) continue
    
    const pattern = signal.pattern
    if (!patternGroups.has(pattern)) {
      patternGroups.set(pattern, [])
    }
    patternGroups.get(pattern)!.push(outcome)
  }
  
  // Generate lesson for each pattern with sufficient data
  for (const [pattern, patternOutcomes] of patternGroups.entries()) {
    if (patternOutcomes.length < 3) {
      console.log(`[LessonGenerator] Skipping ${pattern}: only ${patternOutcomes.length} trades (need 3+)`)
      continue
    }
    
    // Get a representative signal and plan
    const representativeOutcome = patternOutcomes[0]
    const signal = signals.find((s) => s.id === representativeOutcome.signal_id)
    const plan = plans.find((p) => p.id === representativeOutcome.plan_id)
    
    if (!signal || !plan) continue
    
    // Extract lesson
    const lesson = extractLesson(signal, plan, representativeOutcome, patternOutcomes)
    
    // Save lesson to DB
    await saveLesson(lesson)
    
    // Create action node for lesson
    const lessonNode: ActionNode = {
      id: `node_${crypto.randomUUID()}`,
      type: 'lesson.curated',
      ts_utc: new Date().toISOString(),
      refs: {
        signal_id: null,
        plan_id: null,
        prev_node_id: null,
      },
      payload: {
        lesson_id: lesson.id,
        pattern: lesson.pattern,
        win_rate: lesson.stats?.win_rate,
        sample_size: lesson.stats?.sample_size,
      },
      tags: ['lesson', `pattern/${lesson.pattern}`, `score/${(lesson.score * 100).toFixed(0)}`],
      confidence: lesson.score,
    }
    
    await saveActionNode(lessonNode)
    
    lessons.push(lesson)
    console.log(`[LessonGenerator] Generated lesson for ${pattern}: ${lesson.stats?.win_rate.toFixed(2)} win rate over ${lesson.stats?.sample_size} trades`)
  }
  
  console.log(`[LessonGenerator] Generated ${lessons.length} lessons`)
  
  return lessons
}

/**
 * Generate lesson for a specific pattern
 */
export async function generateLessonForPattern(pattern: string): Promise<Lesson | null> {
  console.log(`[LessonGenerator] Generating lesson for pattern: ${pattern}`)
  
  const signals = await getSignalsByPattern(pattern as Signal['pattern'])
  if (signals.length === 0) {
    console.log(`[LessonGenerator] No signals found for pattern: ${pattern}`)
    return null
  }
  
  // Get outcomes for these signals
  const allOutcomes: TradeOutcome[] = []
  for (const signal of signals) {
    const signalOutcomes = await getTradeOutcomesBySignal(signal.id)
    allOutcomes.push(...signalOutcomes)
  }
  
  if (allOutcomes.length < 3) {
    console.log(`[LessonGenerator] Insufficient data for ${pattern}: only ${allOutcomes.length} trades`)
    return null
  }
  
  // Get representative signal and plan
  const representativeSignal = signals[0]
  const plans = await getAllTradePlans()
  const representativePlan = plans.find((p) => p.signal_id === representativeSignal.id)
  
  if (!representativePlan) {
    console.log(`[LessonGenerator] No plan found for signal: ${representativeSignal.id}`)
    return null
  }
  
  // Extract lesson
  const lesson = extractLesson(
    representativeSignal,
    representativePlan,
    allOutcomes[0],
    allOutcomes
  )
  
  // Save lesson
  await saveLesson(lesson)
  
  // Create action node
  const lessonNode: ActionNode = {
    id: `node_${crypto.randomUUID()}`,
    type: 'lesson.curated',
    ts_utc: new Date().toISOString(),
    refs: {
      signal_id: null,
      plan_id: null,
      prev_node_id: null,
    },
    payload: {
      lesson_id: lesson.id,
      pattern: lesson.pattern,
      win_rate: lesson.stats?.win_rate,
      sample_size: lesson.stats?.sample_size,
    },
    tags: ['lesson', `pattern/${lesson.pattern}`, `score/${(lesson.score * 100).toFixed(0)}`],
    confidence: lesson.score,
  }
  
  await saveActionNode(lessonNode)
  
  console.log(`[LessonGenerator] Generated lesson for ${pattern}`)
  
  return lesson
}

// ============================================================================
// LESSON REFINEMENT
// ============================================================================

/**
 * Refine existing lesson with new trade data
 */
export async function refineLessonWithNewData(
  lessonId: string,
  newOutcome: TradeOutcome
): Promise<Lesson | null> {
  // TODO: Implement lesson refinement
  // This would update an existing lesson with new trade data
  // For now, just regenerate the lesson for the pattern
  
  const signals = await getAllSignals()
  const signal = signals.find((s) => s.id === newOutcome.signal_id)
  
  if (!signal) return null
  
  return generateLessonForPattern(signal.pattern)
}

// ============================================================================
// LESSON SCORING
// ============================================================================

/**
 * Calculate lesson quality score
 * Higher = more reliable/actionable lesson
 */
export function calculateLessonScore(
  outcomes: TradeOutcome[],
  confidence: number
): number {
  const wins = outcomes.filter((o) => o.result === 'win')
  const winRate = wins.length / outcomes.length
  const sampleSize = outcomes.length
  
  // Base score from win rate
  let score = winRate
  
  // Boost for sample size (more data = more confidence)
  const sampleBoost = Math.min(0.2, (sampleSize / 50) * 0.2) // Max +0.2 at 50+ trades
  score += sampleBoost
  
  // Boost for high confidence
  score *= confidence
  
  // Penalize for low sample size
  if (sampleSize < 10) {
    score *= 0.7
  }
  
  return Math.max(0.1, Math.min(1.0, score))
}

// ============================================================================
// LESSON EXPORT
// ============================================================================

/**
 * Export lessons as markdown report
 */
export async function exportLessonsAsMarkdown(): Promise<string> {
  const { getAllLessons } = await import('./signalDb')
  const lessons = await getAllLessons()
  
  if (lessons.length === 0) {
    return '# Trading Lessons\n\nNo lessons generated yet. Complete some trades to start learning!\n'
  }
  
  // Sort by score descending
  lessons.sort((a, b) => b.score - a.score)
  
  let markdown = '# Trading Lessons\n\n'
  markdown += `Generated: ${new Date().toISOString()}\n\n`
  markdown += `Total lessons: ${lessons.length}\n\n`
  markdown += '---\n\n'
  
  for (const lesson of lessons) {
    markdown += `## ${lesson.pattern}\n\n`
    markdown += `**Score:** ${(lesson.score * 100).toFixed(0)}%\n\n`
    
    if (lesson.stats) {
      markdown += `**Stats:**\n`
      markdown += `- Win Rate: ${(lesson.stats.win_rate * 100).toFixed(0)}%\n`
      markdown += `- Avg R:R: ${lesson.stats.avg_rr.toFixed(2)}\n`
      markdown += `- Sample Size: ${lesson.stats.sample_size}\n\n`
    }
    
    markdown += `### When It Works\n\n${lesson.when_it_works}\n\n`
    markdown += `### When It Fails\n\n${lesson.when_it_fails}\n\n`
    
    markdown += `### Checklist\n\n`
    for (const item of lesson.checklist) {
      markdown += `- [ ] ${item}\n`
    }
    markdown += '\n'
    
    markdown += `### DOs\n\n`
    for (const item of lesson.dos) {
      markdown += `- ✅ ${item}\n`
    }
    markdown += '\n'
    
    markdown += `### DONTs\n\n`
    for (const item of lesson.donts) {
      markdown += `- ❌ ${item}\n`
    }
    markdown += '\n'
    
    markdown += `### Next Drill\n\n${lesson.next_drill}\n\n`
    markdown += '---\n\n'
  }
  
  return markdown
}

// ============================================================================
// WORKER SETUP
// ============================================================================

/**
 * Run lesson generation worker
 * Call this from a cron job or manually
 */
export async function runLessonWorker(): Promise<{
  success: boolean
  lessons_generated: number
  errors: string[]
}> {
  const errors: string[] = []
  
  try {
    const lessons = await generateLessonsFromOutcomes()
    
    return {
      success: true,
      lessons_generated: lessons.length,
      errors,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    errors.push(errorMsg)
    
    return {
      success: false,
      lessons_generated: 0,
      errors,
    }
  }
}

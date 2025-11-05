/**
 * API: Generate Lessons from Trade Outcomes
 * 
 * POST /api/signals/lessons
 * 
 * Analyzes completed trades and generates lessons for continuous learning
 * 
 * @module api/signals/lessons
 */

import type { VercelRequest, VercelResponse } from '@vercel/node'

// ============================================================================
// HANDLER
// ============================================================================

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Run lesson generation worker
    const result = await runLessonWorkerInline()

    if (result.success) {
      return res.status(200).json({
        success: true,
        lessons_generated: result.lessons_generated,
        message: `Generated ${result.lessons_generated} lessons from trade outcomes`,
      })
    } else {
      return res.status(500).json({
        success: false,
        errors: result.errors,
        message: 'Lesson generation failed',
      })
    }

  } catch (error) {
    console.error('[API] Lesson generation error:', error)
    return res.status(500).json({ 
      success: false,
      error: 'Lesson generation failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

// ============================================================================
// INLINE LESSON WORKER (Simplified)
// ============================================================================

async function runLessonWorkerInline(): Promise<{
  success: boolean
  lessons_generated: number
  errors: string[]
}> {
  const errors: string[] = []
  
  try {
    // Note: In a real implementation, this would use the actual lesson generator
    // For now, return a success response
    
    console.log('[LessonWorker] Lesson generation triggered via API')
    
    // In production, you would:
    // 1. Import lesson generator functions
    // 2. Fetch all trade outcomes from DB
    // 3. Group by pattern
    // 4. Extract lessons
    // 5. Save lessons to DB
    
    return {
      success: true,
      lessons_generated: 0, // Placeholder
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

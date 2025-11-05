/**
 * Lessons API Endpoint
 * 
 * Retrieves curated lessons from trade history
 * 
 * @endpoint GET /api/signals/lessons
 * @param {string} pattern - Filter by pattern (optional)
 * @param {number} min_score - Min score threshold (optional)
 * @param {number} limit - Max results (default: 10)
 * 
 * @returns {Lesson[]} Array of lessons
 */

export const config = { runtime: 'edge' }

import type { Lesson } from '@/types/signal'
import { getLessonsByPattern, getTopLessons } from '@/lib/signalDb'

export default async function handler(req: Request) {
  // Only allow GET
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const url = new URL(req.url)
    const pattern = url.searchParams.get('pattern')
    const minScore = Number(url.searchParams.get('min_score') || '0')
    const limit = Number(url.searchParams.get('limit') || '10')

    let lessons: Lesson[]

    // Fetch lessons based on filters
    if (pattern) {
      lessons = await getLessonsByPattern(pattern)
    } else {
      lessons = await getTopLessons(limit)
    }

    // Filter by min_score
    lessons = lessons.filter((l) => l.score >= minScore)

    // Sort by score descending
    lessons.sort((a, b) => b.score - a.score)

    // Limit results
    lessons = lessons.slice(0, limit)

    return new Response(JSON.stringify({ lessons }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch lessons',
        message: error?.message || String(error),
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}

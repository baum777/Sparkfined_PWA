import type { BotScorePostPayload } from '@/types/ai';

/**
 * Compute a bot score (0..1) for a social media post based on heuristics.
 * Higher score = more likely to be a bot.
 * 
 * Heuristics:
 * - New account (<7 days): +0.25
 * - Low followers (<10): +0.15
 * - High posting frequency (>50/day): +0.2
 * - Repeated content: +0.3
 * - API/webhook source (not organic): +0.4
 * - Verified account: -0.3
 * 
 * @param post - Post metadata for bot score computation
 * @returns Bot score between 0 (human) and 1 (bot)
 */
export function computeBotScore(post: BotScorePostPayload): number {
  let score = 0.0;
  const a = post.author || {};
  
  // New account (suspicious)
  if ((a.age_days || 0) < 7) score += 0.25;
  
  // Low follower count (suspicious)
  if ((a.followers || 0) < 10) score += 0.15;
  
  // High posting frequency (bot-like)
  if ((post.post_frequency_per_day || 0) > 50) score += 0.2;
  
  // Repeated content (spam)
  if (post.repeated) score += 0.3;
  
  // API/webhook source (not organic)
  if (post.source_type === 'api' || post.source_type === 'webhook') score += 0.4;
  
  // Verified account (trusted)
  if (a.verified === true) score -= 0.3;
  
  // Clamp to [0, 1]
  return Math.min(Math.max(score, 0), 1);
}

import { describe, test, expect } from 'vitest';
import { computeBotScore } from '../botScore';
import type { BotScorePostPayload } from '@/types/ai';

describe('computeBotScore', () => {
  test('should return 0 for verified established account', () => {
    const post: BotScorePostPayload = {
      author: {
        age_days: 365,
        followers: 1000,
        verified: true,
      },
      post_frequency_per_day: 5,
      repeated: false,
      source_type: 'web',
    };

    const score = computeBotScore(post);
    expect(score).toBeLessThan(0.1); // Very low score for verified human
  });

  test('should return high score for new low-follower API account', () => {
    const post: BotScorePostPayload = {
      author: {
        age_days: 2,
        followers: 5,
        verified: false,
      },
      post_frequency_per_day: 100,
      repeated: true,
      source_type: 'api',
    };

    const score = computeBotScore(post);
    expect(score).toBeGreaterThan(0.8); // High bot score
  });

  test('should handle missing author data gracefully', () => {
    const post: BotScorePostPayload = {
      post_frequency_per_day: 10,
      repeated: false,
      source_type: 'web',
    };

    const score = computeBotScore(post);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  test('should clamp score to [0, 1] range', () => {
    const post: BotScorePostPayload = {
      author: {
        age_days: 1,
        followers: 0,
        verified: false,
      },
      post_frequency_per_day: 200,
      repeated: true,
      source_type: 'webhook',
    };

    const score = computeBotScore(post);
    expect(score).toBe(1); // Should be clamped to 1, not exceed
  });

  test('should reduce score for verified account', () => {
    const postUnverified: BotScorePostPayload = {
      author: {
        age_days: 30,
        followers: 100,
        verified: false,
      },
      post_frequency_per_day: 10,
      repeated: false,
      source_type: 'web',
    };

    const postVerified: BotScorePostPayload = {
      ...postUnverified,
      author: {
        ...postUnverified.author!,
        verified: true,
      },
    };

    const scoreUnverified = computeBotScore(postUnverified);
    const scoreVerified = computeBotScore(postVerified);

    expect(scoreVerified).toBeLessThan(scoreUnverified);
  });
});

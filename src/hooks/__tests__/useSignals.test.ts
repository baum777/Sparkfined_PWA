/**
 * Tests for useSignals Hooks
 *
 * Tests:
 * - useSignals: All signals and pattern filtering
 * - useSignalById: Single signal retrieval
 * - useTradePlans: All plans and status filtering
 * - useTradePlanById: Single plan retrieval
 * - useLessons: All lessons with limit and pattern
 * - useLessonById: Single lesson retrieval
 * - usePatternStats: Pattern analytics
 * - useTradeOutcomes: All trade outcomes
 * - useSignalWithPlan: Combined signal + plan
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  useSignals,
  useSignalById,
  useTradePlans,
  useTradePlanById,
  useLessons,
  useLessonById,
  usePatternStats,
  useTradeOutcomes,
  useSignalWithPlan,
} from '../useSignals';
import * as signalDb from '@/lib/signalDb';

// Mock the signalDb module
vi.mock('@/lib/signalDb');

describe('useSignals Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useSignals', () => {
    it('fetches all signals on mount', async () => {
      const mockSignals = [
        {
          id: '1',
          pattern: 'breakout',
          timestamp_utc: '2024-01-02T00:00:00Z',
          symbol: 'SOL',
        },
        {
          id: '2',
          pattern: 'support',
          timestamp_utc: '2024-01-01T00:00:00Z',
          symbol: 'BONK',
        },
      ];

      vi.mocked(signalDb.getAllSignals).mockResolvedValue(mockSignals as any);

      const { result } = renderHook(() => useSignals());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.signals).toHaveLength(2);
      // Should be sorted by timestamp descending
      expect(result.current.signals[0].id).toBe('1');
      expect(result.current.error).toBe(null);
      expect(signalDb.getAllSignals).toHaveBeenCalledTimes(1);
    });

    it('filters signals by pattern', async () => {
      const mockSignals = [
        {
          id: '1',
          pattern: 'breakout',
          timestamp_utc: '2024-01-01T00:00:00Z',
          symbol: 'SOL',
        },
      ];

      vi.mocked(signalDb.getSignalsByPattern).mockResolvedValue(mockSignals as any);

      const { result } = renderHook(() => useSignals('breakout'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.signals).toHaveLength(1);
      expect(result.current.signals[0].pattern).toBe('breakout');
      expect(signalDb.getSignalsByPattern).toHaveBeenCalledWith('breakout');
    });

    it('handles errors gracefully', async () => {
      const error = new Error('Database error');
      vi.mocked(signalDb.getAllSignals).mockRejectedValue(error);

      const { result } = renderHook(() => useSignals());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.signals).toEqual([]);
    });
  });

  describe('useSignalById', () => {
    it('fetches signal by ID', async () => {
      const mockSignal = {
        id: '1',
        pattern: 'breakout',
        timestamp_utc: '2024-01-01T00:00:00Z',
        symbol: 'SOL',
      };

      vi.mocked(signalDb.getSignalById).mockResolvedValue(mockSignal as any);

      const { result } = renderHook(() => useSignalById('1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.signal).toEqual(mockSignal);
      expect(result.current.error).toBe(null);
      expect(signalDb.getSignalById).toHaveBeenCalledWith('1');
    });

    it('returns null when ID is null', () => {
      const { result } = renderHook(() => useSignalById(null));

      expect(result.current.signal).toBe(null);
      expect(result.current.loading).toBe(false);
      expect(signalDb.getSignalById).not.toHaveBeenCalled();
    });

    it('returns null when signal not found', async () => {
      vi.mocked(signalDb.getSignalById).mockResolvedValue(undefined as any);

      const { result } = renderHook(() => useSignalById('non-existent'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.signal).toBe(null);
    });

    it('handles errors', async () => {
      const error = new Error('Not found');
      vi.mocked(signalDb.getSignalById).mockRejectedValue(error);

      const { result } = renderHook(() => useSignalById('1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useTradePlans', () => {
    it('fetches all trade plans', async () => {
      const mockPlans = [
        {
          id: '1',
          signal_id: 's1',
          status: 'active',
          created_at: '2024-01-02T00:00:00Z',
        },
        {
          id: '2',
          signal_id: 's2',
          status: 'closed',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(signalDb.getAllTradePlans).mockResolvedValue(mockPlans as any);

      const { result } = renderHook(() => useTradePlans());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.plans).toHaveLength(2);
      // Should be sorted by created_at descending
      expect(result.current.plans[0].id).toBe('1');
      expect(signalDb.getAllTradePlans).toHaveBeenCalled();
    });

    it('filters plans by status', async () => {
      const mockPlans = [
        {
          id: '1',
          signal_id: 's1',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(signalDb.getTradePlansByStatus).mockResolvedValue(mockPlans as any);

      const { result } = renderHook(() => useTradePlans('active'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.plans).toHaveLength(1);
      expect(result.current.plans[0].status).toBe('active');
      expect(signalDb.getTradePlansByStatus).toHaveBeenCalledWith('active');
    });

    it('handles errors', async () => {
      const error = new Error('Database error');
      vi.mocked(signalDb.getAllTradePlans).mockRejectedValue(error);

      const { result } = renderHook(() => useTradePlans());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useTradePlanById', () => {
    it('fetches plan by ID', async () => {
      const mockPlan = {
        id: '1',
        signal_id: 's1',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      };

      vi.mocked(signalDb.getTradePlanById).mockResolvedValue(mockPlan as any);

      const { result } = renderHook(() => useTradePlanById('1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.plan).toEqual(mockPlan);
      expect(signalDb.getTradePlanById).toHaveBeenCalledWith('1');
    });

    it('returns null when ID is null', () => {
      const { result } = renderHook(() => useTradePlanById(null));

      expect(result.current.plan).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('useLessons', () => {
    it('fetches all lessons sorted by score', async () => {
      const mockLessons = [
        { id: '1', pattern: 'breakout', score: 100, title: 'Lesson 1' },
        { id: '2', pattern: 'support', score: 90, title: 'Lesson 2' },
        { id: '3', pattern: 'breakout', score: 80, title: 'Lesson 3' },
      ];

      vi.mocked(signalDb.getAllLessons).mockResolvedValue(mockLessons as any);

      const { result } = renderHook(() => useLessons());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lessons).toHaveLength(3);
      // Should be sorted by score descending
      expect(result.current.lessons[0].score).toBe(100);
      expect(result.current.lessons[2].score).toBe(80);
    });

    it('fetches top N lessons', async () => {
      const mockLessons = [
        { id: '1', pattern: 'breakout', score: 100, title: 'Lesson 1' },
        { id: '2', pattern: 'support', score: 90, title: 'Lesson 2' },
      ];

      vi.mocked(signalDb.getTopLessons).mockResolvedValue(mockLessons as any);

      const { result } = renderHook(() => useLessons(5));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(signalDb.getTopLessons).toHaveBeenCalledWith(5);
    });

    it('filters lessons by pattern', async () => {
      const mockLessons = [
        { id: '1', pattern: 'breakout', score: 100, title: 'Lesson 1' },
        { id: '2', pattern: 'support', score: 90, title: 'Lesson 2' },
        { id: '3', pattern: 'breakout', score: 80, title: 'Lesson 3' },
      ];

      vi.mocked(signalDb.getAllLessons).mockResolvedValue(mockLessons as any);

      const { result } = renderHook(() => useLessons(undefined, 'breakout'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lessons).toHaveLength(2);
      expect(result.current.lessons.every((l) => l.pattern === 'breakout')).toBe(true);
    });

    it('handles errors', async () => {
      const error = new Error('Database error');
      vi.mocked(signalDb.getAllLessons).mockRejectedValue(error);

      const { result } = renderHook(() => useLessons());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useLessonById', () => {
    it('fetches lesson by ID', async () => {
      const mockLesson = {
        id: '1',
        pattern: 'breakout',
        score: 100,
        title: 'Lesson 1',
      };

      vi.mocked(signalDb.getLessonById).mockResolvedValue(mockLesson as any);

      const { result } = renderHook(() => useLessonById('1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.lesson).toEqual(mockLesson);
    });

    it('returns null when ID is null', () => {
      const { result } = renderHook(() => useLessonById(null));

      expect(result.current.lesson).toBe(null);
      expect(result.current.loading).toBe(false);
    });
  });

  describe('usePatternStats', () => {
    it('fetches pattern statistics', async () => {
      const mockStats = {
        totalSignals: 10,
        winRate: 70,
        avgPnl: 150,
      };

      vi.mocked(signalDb.getPatternStats).mockResolvedValue(mockStats as any);

      const { result } = renderHook(() => usePatternStats('breakout'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStats);
      expect(signalDb.getPatternStats).toHaveBeenCalledWith('breakout');
    });

    it('handles errors', async () => {
      const error = new Error('Database error');
      vi.mocked(signalDb.getPatternStats).mockRejectedValue(error);

      const { result } = renderHook(() => usePatternStats('breakout'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useTradeOutcomes', () => {
    it('fetches all trade outcomes', async () => {
      const mockOutcomes = [
        { id: '1', pnl: 100, status: 'win' },
        { id: '2', pnl: -50, status: 'loss' },
      ];

      vi.mocked(signalDb.getAllTradeOutcomes).mockResolvedValue(mockOutcomes as any);

      const { result } = renderHook(() => useTradeOutcomes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.outcomes).toEqual(mockOutcomes);
      expect(signalDb.getAllTradeOutcomes).toHaveBeenCalled();
    });

    it('handles errors', async () => {
      const error = new Error('Database error');
      vi.mocked(signalDb.getAllTradeOutcomes).mockRejectedValue(error);

      const { result } = renderHook(() => useTradeOutcomes());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
    });
  });

  describe('useSignalWithPlan', () => {
    it('fetches signal and its associated plan', async () => {
      const mockSignal = {
        id: 's1',
        pattern: 'breakout',
        timestamp_utc: '2024-01-01T00:00:00Z',
        symbol: 'SOL',
      };

      const mockPlans = [
        {
          id: 'p1',
          signal_id: 's1',
          status: 'active',
          created_at: '2024-01-01T00:00:00Z',
        },
        {
          id: 'p2',
          signal_id: 's2',
          status: 'closed',
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      vi.mocked(signalDb.getSignalById).mockResolvedValue(mockSignal as any);
      vi.mocked(signalDb.getAllTradePlans).mockResolvedValue(mockPlans as any);

      const { result } = renderHook(() => useSignalWithPlan('s1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.signal).toEqual(mockSignal);
      expect(result.current.plan).toEqual(mockPlans[0]);
    });

    it('returns null plan when no matching plan found', async () => {
      const mockSignal = {
        id: 's1',
        pattern: 'breakout',
        timestamp_utc: '2024-01-01T00:00:00Z',
        symbol: 'SOL',
      };

      vi.mocked(signalDb.getSignalById).mockResolvedValue(mockSignal as any);
      vi.mocked(signalDb.getAllTradePlans).mockResolvedValue([]);

      const { result } = renderHook(() => useSignalWithPlan('s1'));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.signal).toEqual(mockSignal);
      expect(result.current.plan).toBe(null);
    });

    it('returns null when signal ID is null', () => {
      const { result } = renderHook(() => useSignalWithPlan(null));

      expect(result.current.signal).toBe(null);
      expect(result.current.plan).toBe(null);
    });
  });
});

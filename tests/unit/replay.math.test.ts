/**
 * Alpha Issue 10: Replay v2
 * Tests for replay scrubber math
 */

import { describe, it, expect } from 'vitest';
import { calculateScrubJump, interpolateGhostCursor, calculateZoom } from '@/lib/ReplayService';

describe('Replay Math', () => {
  describe('calculateScrubJump', () => {
    it('jumps 5s for regular arrow keys', () => {
      expect(calculateScrubJump(10, 'left')).toBe(5);
      expect(calculateScrubJump(10, 'right')).toBe(15);
    });

    it('jumps 20s for shift+arrow keys', () => {
      expect(calculateScrubJump(10, 'shift-left')).toBe(0); // Clamped to 0
      expect(calculateScrubJump(10, 'shift-right')).toBe(30);
    });

    it('never goes below 0', () => {
      expect(calculateScrubJump(2, 'left')).toBe(0);
      expect(calculateScrubJump(2, 'shift-left')).toBe(0);
    });
  });

  describe('interpolateGhostCursor', () => {
    it('interpolates between keyframes', () => {
      const keyframes = [
        { time: 0, x: 0, y: 0 },
        { time: 10, x: 100, y: 100 },
      ];

      const pos = interpolateGhostCursor(5, keyframes);
      expect(pos).toEqual({ x: 50, y: 50 });
    });

    it('returns null for empty keyframes', () => {
      expect(interpolateGhostCursor(5, [])).toBeNull();
    });

    it('returns first keyframe before range', () => {
      const keyframes = [
        { time: 10, x: 100, y: 100 },
        { time: 20, x: 200, y: 200 },
      ];

      const pos = interpolateGhostCursor(0, keyframes);
      expect(pos).toEqual({ x: 100, y: 100 });
    });
  });

  describe('calculateZoom', () => {
    it('increases zoom on positive delta', () => {
      const newZoom = calculateZoom(1.0, 100);
      expect(newZoom).toBeGreaterThan(1.0);
    });

    it('decreases zoom on negative delta', () => {
      const newZoom = calculateZoom(1.0, -100);
      expect(newZoom).toBeLessThan(1.0);
    });

    it('clamps zoom between 0.5 and 3.0', () => {
      expect(calculateZoom(1.0, 10000)).toBe(3.0);
      expect(calculateZoom(1.0, -10000)).toBe(0.5);
    });
  });
});

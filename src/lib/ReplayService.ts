/**
 * Alpha Issue 10: Replay v2
 * Service for replay scrubber math and state management
 */

export type ScrubDirection = 'left' | 'right' | 'shift-left' | 'shift-right';

/**
 * Calculate time jump for scrubber navigation
 * - Regular arrows: 5s jump
 * - Shift arrows: 20s jump
 *
 * @param currentTime - Current playback time in seconds
 * @param direction - Scrub direction
 * @returns New time position
 */
export function calculateScrubJump(
  currentTime: number,
  direction: ScrubDirection
): number {
  const isShift = direction.includes('shift');
  const jumpAmount = isShift ? 20 : 5;
  const multiplier = direction.includes('right') ? 1 : -1;

  return Math.max(0, currentTime + jumpAmount * multiplier);
}

/**
 * Interpolate ghost cursor position between keyframes
 * Simple linear interpolation for MVP
 */
export function interpolateGhostCursor(
  time: number,
  keyframes: Array<{ time: number; x: number; y: number }>
): { x: number; y: number } | null {
  if (keyframes.length === 0) return null;

  // If time is before first keyframe, return first keyframe position
  if (time <= keyframes[0].time) {
    return { x: keyframes[0].x, y: keyframes[0].y };
  }

  // If time is after last keyframe, return last keyframe position
  const last = keyframes[keyframes.length - 1];
  if (time >= last.time) {
    return { x: last.x, y: last.y };
  }

  // Find surrounding keyframes
  let before = keyframes[0];
  let after = keyframes[keyframes.length - 1];

  for (let i = 0; i < keyframes.length - 1; i++) {
    if (keyframes[i].time <= time && keyframes[i + 1].time >= time) {
      before = keyframes[i];
      after = keyframes[i + 1];
      break;
    }
  }

  // Linear interpolation
  if (before.time === after.time) return before;

  const t = (time - before.time) / (after.time - before.time);
  return {
    x: before.x + (after.x - before.x) * t,
    y: before.y + (after.y - before.y) * t,
  };
}

/**
 * Handle zoom level for Ctrl+Wheel
 * @param currentZoom - Current zoom level (1.0 = 100%)
 * @param delta - Wheel delta
 * @returns New zoom level (clamped 0.5 - 3.0)
 */
export function calculateZoom(currentZoom: number, delta: number): number {
  const zoomSensitivity = 0.001;
  const newZoom = currentZoom + delta * zoomSensitivity;
  return Math.max(0.5, Math.min(3.0, newZoom));
}

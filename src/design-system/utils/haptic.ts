type HapticPattern = 'soft' | 'success' | 'warning' | 'critical'

const PATTERN_MAP: Record<HapticPattern, number | number[]> = {
  soft: 15,
  success: [20, 35],
  warning: [30, 30, 30],
  critical: [75, 50, 75],
}

function supportsVibration(): navigator is Navigator & { vibrate: (pattern: number | number[]) => boolean } {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

/**
 * Triggers a lightweight vibration pattern where supported.
 * Falls back gracefully on devices without the Vibration API.
 */
export function triggerHaptic(pattern: HapticPattern = 'soft') {
  if (!supportsVibration()) {
    return
  }

  navigator.vibrate(PATTERN_MAP[pattern])
}

type HapticPattern = number | number[]

const vibrate = (pattern: HapticPattern) => {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  navigator.vibrate(pattern)
}

export const haptic = {
  tap: () => vibrate(10),
  impact: () => vibrate(20),
  success: () => vibrate([10, 50, 10]),
  error: () => vibrate([20, 50, 20, 50, 20]),
  warning: () => vibrate([30, 30, 30]),
}

export type HapticController = typeof haptic

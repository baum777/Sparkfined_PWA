import type { EmotionLabel } from '../types/input'

export function normalizeLinear(value: number, max = 10): number {
  return Math.max(0, Math.min(1, value / max))
}

const emotionScale: Record<EmotionLabel, number> = {
  fear: 0.2,
  anxiety: 0.3,
  calm: 0.5,
  greed: 0.7,
  overconfidence: 0.85,
  excitement: 0.8,
}

export function normalizeEmotion(label: EmotionLabel): number {
  return emotionScale[label] ?? 0.5
}

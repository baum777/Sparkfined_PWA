import type { CognitiveBias } from '../types/derived'
import type { JournalRawInput } from '../types/input'
import type { JournalNormalized } from '../types/normalized'

export function detectBias(
  input: JournalRawInput,
  normalized: JournalNormalized
): CognitiveBias[] {
  const biases: CognitiveBias[] = []

  // Keep legacy semantics (~0–10) while storing a continuous 0–100 score.
  const intensity = Math.round(Math.max(0, Math.min(100, input.emotionalScore)) / 10)

  if (intensity > 7 && normalized.conviction < 0.4) {
    biases.push('overconfidence')
  }

  if (input.marketContext === 'trend-down' && input.emotionalState === 'greed') {
    biases.push('loss-aversion')
  }

  if (input.marketContext === 'chop' && input.patternQuality > 7) {
    biases.push('confirmation')
  }

  if (input.emotionalState === 'excitement' && input.patternQuality < 4) {
    biases.push('gambler')
  }

  return biases
}

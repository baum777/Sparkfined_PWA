import type { CognitiveBias } from '../types/derived'
import type { JournalRawInput } from '../types/input'
import type { JournalNormalized } from '../types/normalized'

export function detectBias(
  input: JournalRawInput,
  normalized: JournalNormalized
): CognitiveBias[] {
  const biases: CognitiveBias[] = []

  if (input.emotionIntensity > 7 && normalized.conviction < 0.4) {
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

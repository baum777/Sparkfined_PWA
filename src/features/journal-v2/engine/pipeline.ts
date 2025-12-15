import type { JournalRawInput } from '../types/input'
import type { JournalOutput } from '../types/output'
import type { TradeAction } from '@/types/trade'

import { normalizeEmotion, normalizeLinear } from './normalization'
import { computeScore } from './scoring'
import { detectBias } from './bias'
import { inferArchetype } from './archetype'
import { generateInsights } from './insights'

type NormalizedProfile = {
  conviction: number
  discipline: number
  patternStrength: number
  emotion: number
}

function inferAction(input: JournalRawInput, score: number, normalized: NormalizedProfile): TradeAction {
  const convictionTilt = normalized.conviction >= 0.65
  const weakPattern = normalized.patternStrength < 0.45 || normalized.discipline < 0.45

  if (weakPattern) return 'HOLD'

  if (input.marketContext === 'trend-down') return 'SELL'
  if (input.marketContext === 'trend-up' || input.marketContext === 'breakout') return 'BUY'
  if (input.marketContext === 'chop') return 'HOLD'

  if (score >= 65 && convictionTilt) return 'BUY'
  if (score <= 40 && !convictionTilt) return 'SELL'

  return 'HOLD'
}

function deriveConfidence(score: number, normalized: NormalizedProfile): number {
  const base = Math.max(0, Math.min(100, score))
  const convictionBoost = normalized.conviction * 25
  const patternBoost = normalized.patternStrength * 25
  return Math.min(100, Math.round(base * 0.5 + convictionBoost + patternBoost))
}

export function runJournalPipeline(input: JournalRawInput): JournalOutput {
  const normalized = {
    emotion: normalizeEmotion(input.emotionalState),
    conviction: normalizeLinear(input.conviction),
    clarity: normalizeLinear(7), // TODO: NLP clarity extraction
    discipline: normalizeLinear(6), // TODO: reflection analysis
    patternStrength: normalizeLinear(input.patternQuality),
  }

  const derived = {
    emotionalVolatility: Math.abs(normalized.emotion - normalized.conviction),
    riskAlignment: normalized.conviction * normalized.clarity,
    cognitiveBiasFlags: detectBias(input, normalized),
    decisionQuality: (normalized.clarity + normalized.discipline) / 2,
  }

  const archetype = inferArchetype(normalized, derived, derived.cognitiveBiasFlags)

  const insights = generateInsights(archetype, derived.cognitiveBiasFlags, derived)

  const score = computeScore({
    ...normalized,
    emotionalVolatility: derived.emotionalVolatility,
  })

  const action = inferAction(input, score, normalized)
  const confidence = deriveConfidence(score, normalized)

  return {
    archetype,
    metrics: derived,
    normalized,
    insights,
    recommendations: insights,
    score,
    action,
    confidence,
  }
}

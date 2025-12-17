import { runJournalPipeline } from '../engine'
import type { JournalRawInput, EmotionLabel, MarketContext } from '../types'
import { saveJournalEntries } from '../db'
import { queryEntries } from '@/lib/JournalService'
import type { JournalEntry } from '@/types/journal'

function mapEmotion(emotion?: string): EmotionLabel {
  const value = (emotion ?? '').toLowerCase()
  if (value.includes('greed')) return 'greed'
  if (value.includes('fear')) return 'fear'
  if (value.includes('anx')) return 'anxiety'
  if (value.includes('excit')) return 'excitement'
  if (value.includes('confid')) return 'overconfidence'
  return 'calm'
}

function mapMarketContext(setup?: string): MarketContext {
  const value = (setup ?? '').toLowerCase()
  if (value.includes('breakout')) return 'breakout'
  if (value.includes('trend')) return 'trend-up'
  if (value.includes('reversion')) return 'mean-reversion'
  return 'chop'
}

function mapLegacyToRaw(entry: JournalEntry): JournalRawInput {
  const conviction = entry.status === 'active' ? 6 : 5
  const patternQuality = entry.setup ? 6 : 5
  const intensity = typeof entry.outcome?.pnlPercent === 'number'
    ? Math.min(10, Math.max(0, Math.round(Math.abs(entry.outcome.pnlPercent) / 5)))
    : 5

  return {
    emotionalState: mapEmotion(entry.emotion),
    emotionalScore: intensity * 10,
    conviction,
    patternQuality,
    marketContext: mapMarketContext(entry.setup),
    reasoning: entry.thesis ?? '',
    expectation: entry.customTags?.join(', ') ?? '',
    selfReflection: entry.journeyMeta ? `Phase: ${entry.journeyMeta.phase}` : 'Imported from Journal V1',
    createdAt: entry.timestamp ?? entry.createdAt ?? Date.now(),
  }
}

/**
 * Prepare migration of legacy journal entries into the Journal V2 pipeline.
 * This function is intentionally not invoked automatically; call it from a
 * controlled admin/debug surface to avoid surprise writes.
 */
export async function migrateJournalV1ToV2(): Promise<number> {
  const legacyEntries = await queryEntries({ status: 'all', sortBy: 'timestamp', sortOrder: 'desc' })

  if (!legacyEntries.length) {
    return 0
  }

  const v2Payloads = legacyEntries.map((entry) => {
    const raw = mapLegacyToRaw(entry)
    const output = runJournalPipeline(raw)
    return {
      raw,
      output,
      createdAt: raw.createdAt,
      version: 2,
    }
  })

  await saveJournalEntries(v2Payloads)

  return v2Payloads.length
}

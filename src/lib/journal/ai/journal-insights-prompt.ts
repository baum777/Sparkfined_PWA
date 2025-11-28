/**
 * Journal AI Insights — Prompt Builder (Loop J3-A)
 * 
 * Builds AI prompts for behavioral pattern detection and coaching insights.
 * Focus: Multi-entry analysis, identifying repeated patterns across trades.
 */

import type { JournalEntry } from '@/types/journal'

export interface JournalInsightPromptInput {
  entries: JournalEntry[]
  maxEntries?: number
  focusCategories?: string[] // Optional: focus on specific insight categories
}

export interface JournalInsightPromptPayload {
  system: string
  user: string
}

/**
 * Build a compact, LLM-friendly prompt for journal insights generation.
 * 
 * @param input - Journal entries and configuration
 * @returns System and user prompts for AI analysis
 */
export function buildJournalInsightsPrompt(
  input: JournalInsightPromptInput
): JournalInsightPromptPayload {
  const maxEntries = input.maxEntries ?? 20
  const entries = input.entries.slice(0, maxEntries)

  // System prompt: Define the AI's role and expected output format
  const system = buildSystemPrompt()

  // User prompt: Provide entry data and instructions
  const user = buildUserPrompt(entries, input.focusCategories)

  return { system, user }
}

function buildSystemPrompt(): string {
  return `Du bist ein erfahrener Trading-Coach, der Trader dabei unterstützt, wiederkehrende Verhaltensmuster zu erkennen und ihre Performance systematisch zu verbessern.

**Deine Aufgabe:**
- Analysiere mehrere Journal-Einträge (Trades) eines Traders
- Identifiziere **wiederkehrende Patterns** (Behaviour Loops, Timing, Risk Management, Setup Discipline, Emotions)
- Gib **keine einfache Zusammenfassung**, sondern konkrete Insights mit Coaching-Empfehlungen

**Insight-Kategorien:**
- BEHAVIOR_LOOP: Wiederholte Fehler/Muster (z.B. immer FOMO bei Breakouts)
- TIMING: Zeit-basierte Muster (z.B. schlechtere Performance nach 20 Uhr)
- RISK_MANAGEMENT: Position-Sizing, Stop-Loss-Disziplin
- SETUP_DISCIPLINE: Setup-Adherence, Qualität vs. Quantität
- EMOTIONAL_PATTERN: Emotionsgetriebene Entscheidungen
- OTHER: Sonstige Beobachtungen

**Severity Levels:**
- INFO: Neutrale Beobachtung
- WARNING: Pattern braucht Aufmerksamkeit
- CRITICAL: Dringendes Problem

**Output-Format (JSON):**
\`\`\`json
{
  "insights": [
    {
      "category": "BEHAVIOR_LOOP",
      "severity": "WARNING",
      "title": "FOMO-Breakout Loop",
      "summary": "Du steigst häufig bei Breakouts ein, die bereits +30% gemacht haben (5 von 8 Trades). Das führt zu späten Entries und hohem Drawdown-Risiko.",
      "recommendation": "Warte auf Retest des Breakout-Levels oder steige nur ein, wenn <20% vom letzten Swing-Low entfernt. Nutze Limit-Orders statt Market-Orders.",
      "evidenceEntries": ["entry-id-1", "entry-id-3", "entry-id-7"],
      "confidence": 85
    }
  ]
}
\`\`\`

**Wichtig:**
- Mindestens 2–5 Insights pro Analyse
- Jeder Insight braucht mindestens 2 evidenceEntries (Entry-IDs)
- Recommendations müssen **actionable** sein (konkrete Schritte, keine Plattitüden)
- Nutze Deutsch, sei direkt und konstruktiv (kein Marketing-Sprech)
- Confidence: 0–100 (optional, wie sicher bist du?)
`
}

function buildUserPrompt(entries: JournalEntry[], focusCategories?: string[]): string {
  if (entries.length === 0) {
    return 'Keine Einträge vorhanden. Bitte füge Journal-Einträge hinzu.'
  }

  // Serialize entries in compact, machine-readable format
  const serialized = entries.map((entry, index) => {
    const outcome = entry.outcome
    const pnl = outcome ? `${outcome.pnl > 0 ? '+' : ''}${outcome.pnl.toFixed(2)} USD (${outcome.pnlPercent > 0 ? '+' : ''}${outcome.pnlPercent.toFixed(1)}%)` : 'N/A'
    const journeyPhase = entry.journeyMeta?.phase ?? 'DEGEN'
    const xp = entry.journeyMeta?.xpTotal ?? 0
    const streak = entry.journeyMeta?.streak ?? 0

    return `## Entry ${index + 1} (ID: ${entry.id})
- **Token:** ${entry.ticker} (${entry.address.slice(0, 8)}...)
- **Timestamp:** ${new Date(entry.timestamp).toISOString()}
- **Setup:** ${entry.setup}
- **Emotion:** ${entry.emotion}
- **Status:** ${entry.status}
- **Thesis:** ${entry.thesis ?? 'Keine Notiz'}
- **Outcome:** ${pnl}
- **Journey:** ${journeyPhase} (XP: ${xp}, Streak: ${streak})
- **Tags:** ${entry.customTags?.join(', ') ?? 'Keine'}
`
  }).join('\n')

  let prompt = `Analysiere diese ${entries.length} Journal-Einträge und identifiziere wiederkehrende Patterns:\n\n${serialized}\n\n`

  if (focusCategories && focusCategories.length > 0) {
    prompt += `**Fokus:** Priorisiere Insights aus diesen Kategorien: ${focusCategories.join(', ')}\n\n`
  }

  prompt += `**Instruktionen:**
1. Finde 2–5 Insights (wiederkehrende Patterns, keine einzelnen Trade-Kommentare)
2. Jeder Insight braucht mindestens 2 evidenceEntries
3. Recommendations müssen actionable sein
4. Output: JSON (siehe System-Prompt)

Gib **nur** das JSON zurück, keine zusätzlichen Erklärungen.`

  return prompt
}

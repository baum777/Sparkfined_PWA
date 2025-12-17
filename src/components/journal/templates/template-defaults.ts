import type { JournalTemplate } from './types'

function buildBuiltin(id: string, name: string, fields: JournalTemplate['fields']): JournalTemplate {
  const now = Date.now()
  return {
    id,
    kind: 'builtin',
    name,
    fields,
    createdAt: now,
    updatedAt: now,
  }
}

export const BUILTIN_JOURNAL_TEMPLATES: JournalTemplate[] = [
  buildBuiltin('builtin-unsicher', 'Unsicher', {
    thesis: [
      'These: Ich vermute **[Richtung/Setup]**, aber die Bestätigung fehlt noch.',
      'Ich trade nur, wenn **[Trigger]** passiert.',
    ].join('\n'),
    plan: ['Entry nur bei: **[Level / Signal]**', 'Wenn kein Trigger: **kein Trade**'].join('\n'),
    notes: [
      'Risk / Size:',
      '- Size reduzieren (z. B. 25–50% normal)',
      '- Stop ist klar definiert, kein Nachziehen aus Emotion',
      '',
      'Invalidation:',
      '- Invalid wenn: **[Level bricht] / [Signal negiert]**',
      '',
      'Bias Check:',
      '- Möglicher Bias: FOMO / Bestätigungsfehler / Revenge',
      '',
      'One-line rule:',
      '- Wenn ich zögere → **warte**.',
    ].join('\n'),
    emotionalScore: 25,
  }),
  buildBuiltin('builtin-neutral', 'Neutral', {
    thesis: [
      'These: Setup ist **[A]**, bestätigt durch **[B]**.',
      'Ich erwarte **[Move]** bis **[Target-Zone]**.',
    ].join('\n'),
    plan: ['Entry bei: **[Trigger]**', 'TP/Exit: **[Zone]**, Stop: **[Level]**'].join('\n'),
    notes: ['Ich handle, was ich sehe – nicht was ich hoffe.'].join('\n'),
    emotionalScore: 50,
  }),
  buildBuiltin('builtin-optimistisch', 'Optimistisch', {
    thesis: [
      'These: Momentum spricht für **[Richtung]**, weil **[Signal]**.',
      'Wenn bestätigt, erwarte ich **[Continuation]**.',
    ].join('\n'),
    plan: ['Entry bei Bestätigung: **[Trigger]**', 'Add nur wenn: **[Regel]** (kein Blind-Add)'].join('\n'),
    notes: [
      'Risk / Size:',
      '- Size maximal Standard oder leicht erhöht **nur wenn** Rules erfüllt',
      "- Stop bleibt fix; kein 'ich fühl’s'",
      '',
      'Invalidation:',
      '- Invalid wenn: **[Level]** bricht / **[Momentum kippt]**',
      '',
      'Bias Guard:',
      '- Achte auf Overconfidence / Tunnelblick',
      '',
      'One-line rule:',
      '- Optimismus = Plan + Stop, nicht Hoffnung.',
    ].join('\n'),
    emotionalScore: 75,
  }),
]


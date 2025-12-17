import { describe, expect, it } from 'vitest'
import { applyTemplateToDraft } from '@/components/journal/templates/template-utils'
import { BUILTIN_JOURNAL_TEMPLATES } from '@/components/journal/templates/template-defaults'

describe('journal templates - applyTemplateToDraft', () => {
  it('fills empty fields by default (fill-empty)', () => {
    const t = BUILTIN_JOURNAL_TEMPLATES.find((x) => x.id === 'builtin-unsicher')!
    const next = applyTemplateToDraft(
      {
        reasoning: '',
        expectation: '',
        selfReflection: '',
        marketContext: 'chop',
        emotionalScore: 50,
      },
      t.fields,
      'fill-empty',
    )

    expect(next.reasoning).toContain('These:')
    expect(next.expectation).toContain('Entry nur bei')
    expect(next.selfReflection).toContain('Risk / Size')
    expect(next.emotionalScore).toBe(25)
  })

  it('does not overwrite non-empty fields in fill-empty mode', () => {
    const t = BUILTIN_JOURNAL_TEMPLATES.find((x) => x.id === 'builtin-neutral')!
    const next = applyTemplateToDraft(
      {
        reasoning: 'User thesis',
        expectation: 'User plan',
        selfReflection: 'User notes',
        marketContext: 'trend-up',
        emotionalScore: 80,
      },
      t.fields,
      'fill-empty',
    )

    expect(next.reasoning).toBe('User thesis')
    expect(next.expectation).toBe('User plan')
    expect(next.selfReflection).toBe('User notes')
    expect(next.marketContext).toBe('trend-up')
    expect(next.emotionalScore).toBe(80)
  })

  it('overwrites all fields in overwrite-all mode', () => {
    const t = BUILTIN_JOURNAL_TEMPLATES.find((x) => x.id === 'builtin-optimistisch')!
    const next = applyTemplateToDraft(
      {
        reasoning: 'User thesis',
        expectation: 'User plan',
        selfReflection: 'User notes',
        marketContext: 'chop',
        emotionalScore: 50,
      },
      t.fields,
      'overwrite-all',
    )

    expect(next.reasoning).toContain('Momentum')
    expect(next.expectation).toContain('Entry bei Bestätigung')
    expect(next.selfReflection).toContain('Bias Guard')
    expect(next.emotionalScore).toBe(75)
  })
})


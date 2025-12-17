import { beforeEach, describe, expect, it } from 'vitest'
import { clearAllCustomTemplates, getCustomTemplates, upsertCustomTemplate } from '@/components/journal/templates/template-storage'

describe('journal templates - storage', () => {
  beforeEach(async () => {
    await clearAllCustomTemplates()
  })

  it('creates, saves, and loads custom templates', async () => {
    await upsertCustomTemplate({
      id: 'custom-1',
      name: 'My template',
      fields: {
        thesis: 'T',
        plan: 'P',
        notes: 'N',
        emotionalScore: 42,
      },
      createdAt: 1,
      updatedAt: 2,
    })

    const loaded = await getCustomTemplates()
    expect(loaded).toHaveLength(1)
    expect(loaded[0]?.id).toBe('custom-1')
    expect(loaded[0]?.kind).toBe('custom')
    expect(loaded[0]?.fields.emotionalScore).toBe(42)
  })
})


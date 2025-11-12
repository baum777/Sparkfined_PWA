import { describe, it, expect } from 'vitest'
import draft from '../../fixtures/journal-condense-ai/draft.json'

describe('JCA-SEC-060 — journal payload sanitization', () => {
  it('redacts phone numbers before transmission', () => {
    const unsafeDraft = {
      ...draft,
      body: `${draft.body}\nKontakt: +49 171 1234567`,
    }

    const sanitized = unsafeDraft.body.replace(/\+?\d[\d\s-]{7,}/g, '[redacted-phone]')

    expect(sanitized).not.toContain('+49 171')
    expect(sanitized).toContain('[redacted-phone]')
  })
})

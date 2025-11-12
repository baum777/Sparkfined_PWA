import { describe, it, expect } from 'vitest'
import vars from '../../fixtures/analyze-bullets-ai/sample-vars.json'

describe('ABA-SEC-060 — payload redaction rules', () => {
  it('ensures no raw email addresses reach AI payload', () => {
    const unsafeVars = {
      ...vars,
      analystNotes: 'Kontakt: trader@example.com für Details',
    }

    const sanitized = JSON.stringify(unsafeVars).replace(/[\w.-]+@[\w.-]+/g, '[redacted-email]')

    expect(sanitized).not.toContain('trader@example.com')
    expect(JSON.parse(sanitized).analystNotes).toContain('[redacted-email]')
  })
})

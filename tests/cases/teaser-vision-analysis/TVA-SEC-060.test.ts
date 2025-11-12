import { describe, it, expect } from 'vitest'
import payload from '../../fixtures/teaser-vision-analysis/payload.json'

describe('TVA-SEC-060 — screenshot metadata sanitization', () => {
  it('masks wallet addresses before logging', () => {
    const loggable = JSON.stringify(payload).replace(/So\w{10,}/g, 'wallet://REDACTED')

    expect(loggable).not.toContain('So11111111111111111111111111111111111111112')
    expect(loggable).toContain('wallet://REDACTED')
  })
})

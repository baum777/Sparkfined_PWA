import { describe, expect, it } from 'vitest'
import { formatMoney } from '@/lib/format/money'

describe('formatMoney', () => {
  it('returns placeholder for nullish input', () => {
    expect(formatMoney(null, 'USD')).toBe('—')
    expect(formatMoney(undefined, 'USD')).toBe('—')
  })

  it('formats values with the provided currency', () => {
    const usd = formatMoney(1234.56, 'USD')
    const eur = formatMoney(1234.56, 'EUR')

    expect(usd).not.toBe('—')
    expect(eur).not.toBe('—')
    expect(usd).not.toBe(eur)
  })
})

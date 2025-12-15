export const QUOTE_CURRENCIES = ['USD', 'EUR'] as const
export type QuoteCurrency = (typeof QUOTE_CURRENCIES)[number]

export function isQuoteCurrency(value: unknown): value is QuoteCurrency {
  return typeof value === 'string' && QUOTE_CURRENCIES.includes(value as QuoteCurrency)
}

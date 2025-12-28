import type { QuoteCurrency } from '@/types/currency';

const PLACEHOLDER = '—';

export function formatMoney(value: number | null | undefined, currency: QuoteCurrency): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return PLACEHOLDER;
  }

  const formatter = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency,
    maximumFractionDigits: Math.abs(value) >= 1 ? 2 : 6,
  });

  return formatter.format(value);
}

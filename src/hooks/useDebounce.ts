/**
 * useDebounce Hook
 *
 * Debounces a value by delaying its update until after the specified delay.
 * Essential for search inputs to avoid excessive API calls.
 *
 * Best Practice (2025): Search autocomplete should target <200ms perceived latency.
 * Use 150ms debounce + fast backend (<50ms) to stay under budget.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 150ms for search)
 * @returns Debounced value
 *
 * @example
 * ```tsx
 * const [query, setQuery] = useState('');
 * const debouncedQuery = useDebounce(query, 150);
 *
 * useEffect(() => {
 *   if (debouncedQuery.length >= 2) {
 *     searchTokens(debouncedQuery);
 *   }
 * }, [debouncedQuery]);
 * ```
 */

import { useEffect, useState } from 'react';

export function useDebounce<T>(value: T, delay: number = 150): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timeout to update the debounced value after the delay
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup function: cancel the timeout if value changes before delay
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}

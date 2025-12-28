/**
 * Type assertion utilities for safe null/undefined handling
 * 
 * @module utils/assert
 */

/**
 * Asserts that a value is defined (not null or undefined)
 * @throws {Error} if value is null or undefined
 */
export function assertExists<T>(
  value: T | null | undefined,
  message?: string
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message || 'Value must be defined');
  }
}

/**
 * Type guard to check if value is defined
 * Narrows type from T | null | undefined to T
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Returns value if defined, otherwise returns default
 * Type-safe alternative to ?? for complex scenarios
 */
export function withDefault<T>(
  value: T | null | undefined,
  defaultValue: T
): T {
  return value !== null && value !== undefined ? value : defaultValue;
}

/**
 * Asserts array has at least one element
 * @throws {Error} if array is empty or undefined
 */
export function assertNonEmpty<T>(
  arr: T[] | null | undefined,
  message?: string
): asserts arr is [T, ...T[]] {
  if (!arr || arr.length === 0) {
    throw new Error(message || 'Array must not be empty');
  }
}

/**
 * Type guard for non-empty arrays
 */
export function isNonEmpty<T>(arr: T[] | null | undefined): arr is [T, ...T[]] {
  return Array.isArray(arr) && arr.length > 0;
}

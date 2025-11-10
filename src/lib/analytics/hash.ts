/**
 * FNV-1a 32-bit hash function
 * Used for deterministic user bucketing in telemetry sampling
 *
 * @see https://en.wikipedia.org/wiki/Fowler%E2%80%93Noll%E2%80%93Vo_hash_function
 */
export function fnv32(str: string): number {
  let hash = 2166136261; // FNV offset basis (32-bit)

  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // FNV prime multiply (32-bit)
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }

  return hash >>> 0; // Convert to unsigned 32-bit
}

/**
 * Deterministic user bucketing for sampling
 * Returns a stable bucket number (0-9999) for a given user ID
 *
 * Usage:
 * - 1% sample: userBucket(userId) < 100
 * - 10% sample: userBucket(userId) < 1000
 * - 50% sample: userBucket(userId) < 5000
 *
 * @param userId - User identifier (email, UUID, etc.)
 * @returns Bucket number (0-9999)
 *
 * @example
 * const bucket = userBucket('user-abc-123');
 * const isInSample = bucket < 100; // 1% sample
 */
export function userBucket(userId: string): number {
  return fnv32(userId) % 10000;
}

/**
 * Check if user is in sampling percentage
 *
 * @param userId - User identifier
 * @param percentage - Percentage (0-100)
 * @returns true if user is in sample
 *
 * @example
 * if (isUserInSample('user-123', 1)) {
 *   // User is in 1% sample
 * }
 */
export function isUserInSample(userId: string, percentage: number): boolean {
  if (percentage <= 0) return false;
  if (percentage >= 100) return true;

  const bucket = userBucket(userId);
  const threshold = percentage * 100; // 1% = 100, 10% = 1000

  return bucket < threshold;
}

/**
 * Stable hash for session IDs, device IDs, etc.
 * Uses FNV-1a but returns hex string for readability
 *
 * @param input - String to hash
 * @returns Hex hash string
 */
export function stableHash(input: string): string {
  return fnv32(input).toString(16).padStart(8, '0');
}

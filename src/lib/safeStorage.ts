/**
 * Safe Storage Wrapper
 * Prevents crashes from localStorage access in SSR/private mode
 * Wraps JSON.parse with try/catch for robustness
 */

/**
 * Check if localStorage is available
 * Guards against SSR, private mode, and security restrictions
 */
export function isStorageAvailable(): boolean {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return false;
  }
  
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
}

/**
 * Safe localStorage.getItem with fallback
 */
export function getItem(key: string): string | null {
  if (!isStorageAvailable()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`[safeStorage] getItem failed for key "${key}":`, error);
    return null;
  }
}

/**
 * Safe localStorage.setItem with error handling
 */
export function setItem(key: string, value: string): boolean {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`[safeStorage] setItem failed for key "${key}":`, error);
    return false;
  }
}

/**
 * Safe JSON.parse with fallback
 * Prevents crashes from malformed JSON
 */
export function parseJSON<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  
  try {
    const parsed = JSON.parse(json);
    return parsed !== null && typeof parsed === 'object' 
      ? { ...fallback, ...parsed }
      : fallback;
  } catch (error) {
    console.warn('[safeStorage] JSON.parse failed:', error);
    return fallback;
  }
}

/**
 * Safe getItem + JSON.parse combo
 */
export function getJSON<T>(key: string, fallback: T): T {
  const raw = getItem(key);
  return parseJSON(raw, fallback);
}

/**
 * Safe JSON.stringify + setItem combo
 */
export function setJSON<T>(key: string, value: T): boolean {
  try {
    const json = JSON.stringify(value);
    return setItem(key, json);
  } catch (error) {
    console.warn(`[safeStorage] JSON.stringify failed for key "${key}":`, error);
    return false;
  }
}

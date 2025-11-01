/**
 * Alpha Issue 1: Edge Proxies
 * Timeout wrapper for fetch requests
 */

export class TimeoutError extends Error {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Wrap a fetch request with a timeout
 * @param promise - Promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @returns Promise that rejects on timeout
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new TimeoutError(`Request timed out after ${timeoutMs}ms`, timeoutMs));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]);
}

/**
 * Fetch with timeout and retry logic
 * @param url - URL to fetch
 * @param options - Fetch options
 * @param timeoutMs - Timeout in milliseconds
 * @param retries - Number of retries (default 1)
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 5000,
  retries: number = 1
): Promise<Response> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await withTimeout(fetch(url, options), timeoutMs);
    } catch (error) {
      lastError = error as Error;
      if (attempt < retries) {
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

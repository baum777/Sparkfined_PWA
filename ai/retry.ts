import { RetryOptions } from "./types.js";

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  let attempt = 0;
  let delay = options.baseDelayMs;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt += 1;
      if (attempt > options.retries) {
        throw error;
      }
      const jitter = options.jitter ?? 0;
      const jitterValue = jitter ? (Math.random() * 2 - 1) * jitter * delay : 0;
      const cappedDelay = Math.min(options.maxDelayMs ?? delay, delay);
      const waitMs = Math.max(0, cappedDelay + jitterValue);
      await new Promise((resolve) => setTimeout(resolve, waitMs));
      const nextDelay = delay * 2;
      delay = options.maxDelayMs ? Math.min(options.maxDelayMs, nextDelay) : nextDelay;
    }
  }
}

export function logError(label: string, error: unknown, info?: unknown): void {
  // Keep logging minimal and preview-friendly (no PII)
  // eslint-disable-next-line no-console
  console.error(`[${label}]`, error, info ?? '');
}

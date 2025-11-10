export function logError(label: string, error: unknown, info?: unknown): void {
  // Keep logging minimal and preview-friendly (no PII)
   
  console.error(`[${label}]`, error, info ?? '');
}

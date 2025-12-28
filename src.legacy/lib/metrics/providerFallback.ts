const counters: Record<string, number> = {};

export function incrementFallback(provider: string): void {
  counters[provider] = (counters[provider] || 0) + 1;
}

export function getFallbackCounters(): Record<string, number> {
  return { ...counters };
}

export function resetFallbackCounters(): void {
  for (const key of Object.keys(counters)) {
    delete counters[key];
  }
}

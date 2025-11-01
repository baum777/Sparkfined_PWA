// Näherungsweiser Token-Zähler (OpenAI/Anthropic-ähnlich): 4 chars ≈ 1 token
export function estimateTokens(text: string): number {
  if (!text) return 0;
  const len = text.trim().length;
  return Math.ceil(len / 4);
}

export function summarizeBudget(now: number, avg: number, max: number) {
  const iterationsLeft = Math.max(0, Math.floor((max - now) / Math.max(1, avg)));
  return { now, avg, max, iterationsLeft };
}

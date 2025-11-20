import { ingestGrokData } from './ingestGrokData';
import { sampleGrokTweets } from './fixtures/sampleGrokTweets';

export function ingestSampleGrokTweetsForDev(): void {
  if (!import.meta.env.DEV) return;
  ingestGrokData(sampleGrokTweets);
}

export function registerDevTrendIngest(): void {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return;
  }

  // Expose a manual hook for console usage during development
  (window as any).sparkIngestSampleTrends = ingestSampleGrokTweetsForDev;

  if ((window as any).__SPARKFINED_AUTO_INGEST_TRENDS__) {
    ingestSampleGrokTweetsForDev();
  }
}

import type { GrokTweetPayload } from '@/types/events';

import { useEventBusStore } from '@/store/eventBus';

import { normalizeGrokTweet } from './normalizeSolanaEvent';

export function ingestGrokData(tweets: GrokTweetPayload[]): void {
  if (!Array.isArray(tweets) || !tweets.length) {
    console.warn('[ingestGrokData] no tweets provided – skipping ingestion');
    return;
  }

  const { pushEvent } = useEventBusStore.getState();

  tweets.forEach((tweet) => {
    if (!tweet) {
      console.warn('[ingestGrokData] encountered empty payload, skipping');
      return;
    }

    try {
      const events = normalizeGrokTweet(tweet);
      if (!events.length) {
        return;
      }

      events.forEach((event) => pushEvent(event));
    } catch (error) {
      console.error('[ingestGrokData] failed to normalize tweet', tweet.id, error);
    }
  });
}

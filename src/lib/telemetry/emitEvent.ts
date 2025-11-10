/**
 * Rituals Event Emitter
 * Extends TelemetryService for ritual-specific events
 * Privacy-first: Never sends raw text, only hashes and metadata
 */

import { Telemetry } from '../TelemetryService';
import type { RitualEventMetadata } from '../../components/rituals/types';

/**
 * Ritual event names catalog
 */
export const RitualEvents = {
  MORNING_OPEN: 'ritual.morning_open',
  GOAL_SET: 'ritual.goal_set',
  RITUAL_COMPLETE: 'ritual.complete',
  PRETRADE_OPEN: 'pretrade.open',
  PRETRADE_SUBMIT: 'pretrade.submit',
  TRADE_EXEC: 'trade.exec',
  POSTTRADE_OPEN: 'posttrade.open',
  JOURNAL_CREATE: 'journal.create',
  REPLAY_ATTACH: 'replay.attach',
  SYNC_ERROR: 'sync.error',
} as const;

/**
 * Emit a ritual event with privacy-preserving metadata
 * @param eventName - Event name from RitualEvents
 * @param metadata - Privacy-safe metadata (no raw text)
 */
export function emitRitualEvent(
  eventName: string,
  metadata: RitualEventMetadata = {}
): void {
  // Log to TelemetryService (existing infra)
  Telemetry.log(eventName, 1, metadata as Record<string, unknown>);

  // Also dispatch custom event for React components to listen
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('sparkfined:ritual', {
        detail: {
          event: eventName,
          timestamp: Date.now(),
          metadata,
        },
      })
    );
  }

  // Development logging
  if (import.meta.env.DEV) {
    console.log('[RitualEvent]', eventName, metadata);
  }
}

/**
 * React hook to listen for ritual events
 */
export function useRitualEventListener(
  eventName: string,
  handler: (metadata: RitualEventMetadata) => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const listener = (event: Event) => {
    const customEvent = event as CustomEvent<{
      event: string;
      timestamp: number;
      metadata: RitualEventMetadata;
    }>;

    if (customEvent.detail.event === eventName) {
      handler(customEvent.detail.metadata);
    }
  };

  window.addEventListener('sparkfined:ritual', listener);

  return () => {
    window.removeEventListener('sparkfined:ritual', listener);
  };
}

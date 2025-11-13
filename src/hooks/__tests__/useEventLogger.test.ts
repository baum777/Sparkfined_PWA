/**
 * Tests for useEventLogger Hook
 *
 * Tests:
 * - Session initialization
 * - Event logging
 * - Timing logging
 * - Error logging
 * - Metric incrementing
 * - Session cleanup
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { useEventLogger, EventTypes } from '../useEventLogger';
import * as db from '@/lib/db';

// Mock the db module
vi.mock('@/lib/db');

describe('useEventLogger', () => {
  let mockSessionId: string;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSessionId = 'test-session-123';

    vi.mocked(db.getSessionId).mockReturnValue(mockSessionId);
    vi.mocked(db.logEvent).mockResolvedValue(undefined);
    vi.mocked(db.incrementMetric).mockResolvedValue(undefined);
    vi.mocked(db.startNewSession).mockReturnValue('new-session-456');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs session_start event on mount', async () => {
    renderHook(() => useEventLogger());

    await waitFor(() => {
      expect(db.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: mockSessionId,
          type: 'session_start',
          timestamp: expect.any(Number),
          data: expect.objectContaining({
            userAgent: expect.any(String),
          }),
        })
      );
    });
  });

  it('logs session_end event on unmount', async () => {
    const { unmount } = renderHook(() => useEventLogger());

    // Clear the session_start call
    vi.mocked(db.logEvent).mockClear();

    unmount();

    await waitFor(() => {
      expect(db.logEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: mockSessionId,
          type: 'session_end',
          timestamp: expect.any(Number),
        })
      );
    });
  });

  it('provides session ID', () => {
    const { result } = renderHook(() => useEventLogger());

    expect(result.current.sessionId).toBe(mockSessionId);
  });

  it('provides EventTypes constants', () => {
    const { result } = renderHook(() => useEventLogger());

    expect(result.current.EventTypes).toBeDefined();
    expect(result.current.EventTypes.UPLOAD_OK).toBe('upload_ok');
    expect(result.current.EventTypes.ANALYSIS_DONE).toBe('analysis_done');
  });

  it('logs custom events with data', async () => {
    const { result } = renderHook(() => useEventLogger());

    await result.current.log('test_event', { foo: 'bar', count: 42 });

    await waitFor(() => {
      const calls = vi.mocked(db.logEvent).mock.calls;
      const testEventCall = calls.find((call) => call[0].type === 'test_event');

      expect(testEventCall).toBeDefined();
      expect(testEventCall![0]).toMatchObject({
        sessionId: mockSessionId,
        type: 'test_event',
        timestamp: expect.any(Number),
        data: expect.objectContaining({
          foo: 'bar',
          count: 42,
          userAgent: expect.any(String),
          viewport: expect.any(String),
        }),
      });
    });
  });

  it('increments metrics for tracked events', async () => {
    const { result } = renderHook(() => useEventLogger());

    await result.current.log(EventTypes.UPLOAD_OK, { file: 'test.png' });

    await waitFor(() => {
      expect(db.incrementMetric).toHaveBeenCalledWith('upload_ok');
    });
  });

  it('does not increment metrics for non-tracked events', async () => {
    const { result } = renderHook(() => useEventLogger());

    await result.current.log('custom_event', { data: 'test' });

    await waitFor(() => {
      expect(db.logEvent).toHaveBeenCalled();
    });

    expect(db.incrementMetric).not.toHaveBeenCalled();
  });

  it('logs timing with duration and label', async () => {
    const { result } = renderHook(() => useEventLogger());

    await result.current.logTiming('image_processing', 1234, {
      imageSize: '1920x1080',
    });

    await waitFor(() => {
      const calls = vi.mocked(db.logEvent).mock.calls;
      const timingCall = calls.find((call) => call[0].type === 'performance_timing');

      expect(timingCall).toBeDefined();
      expect(timingCall![0].data).toMatchObject({
        label: 'image_processing',
        duration: 1234,
        imageSize: '1920x1080',
      });
    });
  });

  it('logs errors with message and stack', async () => {
    const { result } = renderHook(() => useEventLogger());

    const error = new Error('Test error');
    error.stack = 'Error: Test error\n  at test.ts:10:5';

    await result.current.logError(error, { context: 'upload' });

    await waitFor(() => {
      const calls = vi.mocked(db.logEvent).mock.calls;
      const errorCall = calls.find((call) => call[0].type === 'error_occurred');

      expect(errorCall).toBeDefined();
      expect(errorCall![0].data).toMatchObject({
        message: 'Test error',
        stack: expect.stringContaining('Error: Test error'),
        name: 'Error',
        context: 'upload',
      });
    });
  });

  it('logs string errors', async () => {
    const { result } = renderHook(() => useEventLogger());

    await result.current.logError('Something went wrong');

    await waitFor(() => {
      const calls = vi.mocked(db.logEvent).mock.calls;
      const errorCall = calls.find((call) => call[0].type === 'error_occurred');

      expect(errorCall).toBeDefined();
      expect(errorCall![0].data).toMatchObject({
        message: 'Something went wrong',
      });
    });
  });

  it('handles logging failures gracefully', async () => {
    vi.mocked(db.logEvent).mockRejectedValueOnce(new Error('Database error'));

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useEventLogger());

    // Should not throw
    await expect(
      result.current.log('test_event', { data: 'test' })
    ).resolves.not.toThrow();

    await waitFor(() => {
      expect(consoleWarn).toHaveBeenCalledWith(
        'Failed to log event:',
        expect.any(Error)
      );
    });

    consoleWarn.mockRestore();
  });

  it('starts a new session', () => {
    const { result } = renderHook(() => useEventLogger());

    const newSessionId = result.current.startNewSession();

    expect(newSessionId).toBe('new-session-456');
    expect(db.startNewSession).toHaveBeenCalled();
  });

  it('includes viewport dimensions in event data', async () => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', { value: 1920, writable: true });
    Object.defineProperty(window, 'innerHeight', { value: 1080, writable: true });

    const { result } = renderHook(() => useEventLogger());

    await result.current.log('test_event');

    await waitFor(() => {
      const calls = vi.mocked(db.logEvent).mock.calls;
      const testEventCall = calls.find((call) => call[0].type === 'test_event');

      expect(testEventCall).toBeDefined();
      expect(testEventCall![0].data).toMatchObject({
        viewport: '1920x1080',
      });
    });
  });

  it('includes user agent in event data', async () => {
    const { result } = renderHook(() => useEventLogger());

    await result.current.log('test_event');

    await waitFor(() => {
      const calls = vi.mocked(db.logEvent).mock.calls;
      const testEventCall = calls.find((call) => call[0].type === 'test_event');

      expect(testEventCall).toBeDefined();
      expect(testEventCall![0].data).toMatchObject({
        userAgent: navigator.userAgent,
      });
    });
  });

  it('tracks all EventTypes constants', () => {
    const { result } = renderHook(() => useEventLogger());

    const expectedTypes = {
      UPLOAD_OK: 'upload_ok',
      PASTE_CA_OK: 'paste_ca_ok',
      IMAGE_PROCESSED: 'image_processed',
      IMAGE_PROCESSING_ERROR: 'image_processing_error',
      ANALYSIS_START: 'analysis_start',
      ANALYSIS_DONE: 'analysis_done',
      ANALYSIS_ERROR: 'analysis_error',
      SAVE_TRADE_CLICKED: 'save_trade_clicked',
      TRADE_SAVED: 'trade_saved',
      TRADE_DELETED: 'trade_deleted',
      TRADES_EXPORTED: 'trades_exported',
      JOURNAL_LOADED: 'journal_loaded',
      REPLAY_OPEN: 'replay_open',
      REPLAY_OPENED: 'replay_opened',
      EXPORT_PLAYBOOK: 'export_playbook',
      EXPORT_JSON: 'export_json',
      EXPORT_CSV: 'export_csv',
      DROP_TO_RESULT: 'drop_to_result',
      SAVE_TRADE: 'save_trade',
      OPEN_REPLAY: 'open_replay',
      EXPORT_SHARE: 'export_share',
      SCREENSHOT_DROPPED: 'screenshot_dropped',
      DEMO_MODE_ACTIVATED: 'demo_mode_activated',
    };

    Object.entries(expectedTypes).forEach(([key, value]) => {
      expect((result.current.EventTypes as any)[key]).toBe(value);
    });
  });
});

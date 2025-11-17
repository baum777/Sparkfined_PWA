/**
 * Alpha Issue 5: OCR Stabilization
 * Tests for OCR parsing and label extraction
 */

import { describe, it } from 'vitest';

describe('OCR Service', () => {
  it.skip('extracts at least one label from sample image', async () => {
    // TODO: Load sample image
    // const text = await performOCR(sampleImage);
    // expect(text).toContain('Support');
  });

  it.skip('extracts numeric SR values', async () => {
    // TODO: Test numeric extraction
  });

  it.skip('handles upside-down/rotated images', async () => {
    // TODO: Test rotation handling
  });

  it.skip('rejects invalid images gracefully', async () => {
    // TODO: Test error handling
  });

  it.skip('meets 3-second p95 latency budget', async () => {
    // TODO: Test performance
  });

  it.skip('matches "Support" and "Resistance" labels case-insensitive', async () => {
    // TODO: Test label matching
  });

  it.skip('extracts numerical values with confidence >80%', async () => {
    // TODO: Test confidence scoring
  });
});

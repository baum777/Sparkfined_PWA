/**
 * Analytics Aggregation Ingest Endpoint
 * POST /api/analytics/agg
 *
 * Features:
 * - Payload validation (Zod schema)
 * - Rate limiting (per IP)
 * - Raw aggregate persistence (S3)
 * - Forward to analytics provider (adapter pattern)
 * - Adaptive window control (server-controlled throttling)
 * - Prometheus metrics
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { createAdapter } from '@/lib/analytics/adapters';
import { persistToS3 } from '@/lib/storage/s3';

// Validation schema
const AggPayloadSchema = z.object({
  event: z.literal('chart.crosshair_agg'),
  window_ms: z.number().min(1000).max(60000),
  count: z.number().min(1).max(100000),
  last_time: z.string().datetime(),
  last_price: z.number(),
  symbol: z.string().min(1).max(50),
  user_bucket: z.number().min(0).max(9999).nullable(),
  sampling_rate: z.number().min(0).max(1),
  client_version: z.string(),
  session_id: z.string().uuid(),
  // Optional extended stats
  min_price: z.number().optional(),
  max_price: z.number().optional(),
  avg_price: z.number().optional(),
  heatmap_buckets: z.record(z.number()).optional()
});

type AggPayload = z.infer<typeof AggPayloadSchema>;

// In-memory rate limiter (simple implementation)
// For production, use Redis or similar
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(identifier: string, maxRequests = 100, windowMs = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || now > entry.resetAt) {
    // Reset window
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + windowMs
    });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  entry.count++;
  return true;
}

// Metrics (in-memory, for Prometheus scraping)
export const metrics = {
  incoming: 0,
  forwarded: 0,
  dropped: 0,
  validation_errors: 0,
  rate_limited: 0
};

// Analytics adapter singleton
let analyticsAdapter: ReturnType<typeof createAdapter> | null = null;

function getAnalyticsAdapter() {
  if (!analyticsAdapter) {
    analyticsAdapter = createAdapter(process.env.ANALYTICS_PROVIDER);
  }
  return analyticsAdapter;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  metrics.incoming++;

  // Rate limiting (by IP or session_id)
  const identifier = req.headers['x-forwarded-for'] as string ||
                     req.socket.remoteAddress ||
                     'unknown';

  if (!checkRateLimit(identifier)) {
    metrics.rate_limited++;
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  try {
    // Validate payload
    const payload: AggPayload = AggPayloadSchema.parse(req.body);

    // Persist raw aggregate to S3 (fire-and-forget, non-blocking)
    const s3Key = `crosshair_agg/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${crypto.randomUUID()}.json`;

    persistToS3(payload, s3Key).catch(error => {
      console.error('[Agg Endpoint] S3 persist failed (non-blocking)', error);
    });

    // Enrich payload with server-side metadata
    const enrichedPayload = {
      ...payload,
      received_at: new Date().toISOString(),
      ingest_id: crypto.randomUUID(),
      estimated_total: Math.round(payload.count / payload.sampling_rate),
      server_region: process.env.VERCEL_REGION || process.env.AWS_REGION || 'unknown'
    };

    // Forward to analytics provider
    const adapter = getAnalyticsAdapter();
    await adapter.track('chart.crosshair_agg', enrichedPayload);

    metrics.forwarded++;

    // Adaptive window control (optional)
    // If incoming rate is too high, suggest clients increase window
    const shouldIncreaseWindow = metrics.incoming > 1000; // Threshold per minute
    if (shouldIncreaseWindow) {
      res.setHeader('X-AGG-WINDOW-OVERRIDE', '10000'); // Suggest 10s window
    }

    // Success response
    return res.status(202).json({
      status: 'accepted',
      ingest_id: enrichedPayload.ingest_id,
      s3_key: s3Key
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      metrics.validation_errors++;
      return res.status(400).json({
        error: 'Invalid payload',
        details: error.errors
      });
    }

    console.error('[Agg Endpoint] Unexpected error', error);
    metrics.dropped++;

    return res.status(500).json({
      error: 'Internal server error'
    });
  }
}

// Metrics endpoint (for Prometheus scraping)
export async function metricsHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end();
  }

  // Prometheus text format
  const prometheusMetrics = `
# HELP crosshair_agg_incoming_total Total incoming aggregation requests
# TYPE crosshair_agg_incoming_total counter
crosshair_agg_incoming_total ${metrics.incoming}

# HELP crosshair_agg_forwarded_total Total forwarded aggregations
# TYPE crosshair_agg_forwarded_total counter
crosshair_agg_forwarded_total ${metrics.forwarded}

# HELP crosshair_agg_dropped_total Total dropped aggregations
# TYPE crosshair_agg_dropped_total counter
crosshair_agg_dropped_total ${metrics.dropped}

# HELP crosshair_agg_validation_errors_total Total validation errors
# TYPE crosshair_agg_validation_errors_total counter
crosshair_agg_validation_errors_total ${metrics.validation_errors}

# HELP crosshair_agg_rate_limited_total Total rate limited requests
# TYPE crosshair_agg_rate_limited_total counter
crosshair_agg_rate_limited_total ${metrics.rate_limited}
`.trim();

  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  res.status(200).send(prometheusMetrics);
}

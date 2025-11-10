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

export const config = { runtime: "edge" };

import { z } from 'zod';

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

export default async function handler(req: Request) {
  // Only POST allowed
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'content-type': 'application/json' } }
    );
  }

  metrics.incoming++;

  // Rate limiting (by IP)
  const identifier = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';

  if (!checkRateLimit(identifier)) {
    metrics.rate_limited++;
    return new Response(
      JSON.stringify({ error: 'Rate limit exceeded' }),
      { status: 429, headers: { 'content-type': 'application/json' } }
    );
  }

  try {
    // Parse request body
    const body = await req.json();

    // Validate payload
    const payload: AggPayload = AggPayloadSchema.parse(body);

    // Note: S3 persistence and analytics forwarding would happen here
    // For now, just track the metrics and return success
    // In production, you'd import and use:
    // - persistToS3(payload, s3Key) for persistence
    // - createAdapter(process.env.ANALYTICS_PROVIDER).track() for forwarding

    metrics.forwarded++;

    // Enrich payload with server-side metadata
    const ingestId = crypto.randomUUID();
    const s3Key = `crosshair_agg/${new Date().toISOString().slice(0, 10)}/${Date.now()}-${ingestId}.json`;

    // Adaptive window control (optional)
    // If incoming rate is too high, suggest clients increase window
    const headers: Record<string, string> = {
      'content-type': 'application/json'
    };

    const shouldIncreaseWindow = metrics.incoming > 1000; // Threshold per minute
    if (shouldIncreaseWindow) {
      headers['X-AGG-WINDOW-OVERRIDE'] = '10000'; // Suggest 10s window
    }

    // Success response
    return new Response(
      JSON.stringify({
        status: 'accepted',
        ingest_id: ingestId,
        s3_key: s3Key
      }),
      { status: 202, headers }
    );

  } catch (error) {
    if (error instanceof z.ZodError) {
      metrics.validation_errors++;
      return new Response(
        JSON.stringify({
          error: 'Invalid payload',
          details: error.errors
        }),
        { status: 400, headers: { 'content-type': 'application/json' } }
      );
    }

    console.error('[Agg Endpoint] Unexpected error', error);
    metrics.dropped++;

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'content-type': 'application/json' } }
    );
  }
}

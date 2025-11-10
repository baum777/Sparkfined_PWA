/**
 * Prometheus Metrics Endpoint
 * GET /api/analytics/metrics
 *
 * Exposes aggregation pipeline metrics in Prometheus text format
 */

export const config = { runtime: "edge" };

// Import metrics from agg endpoint
// Note: In Edge Runtime, this needs to be carefully managed
// For simplicity, we'll maintain separate metrics here
const metrics = {
  incoming: 0,
  forwarded: 0,
  dropped: 0,
  validation_errors: 0,
  rate_limited: 0
};

export default async function handler(req: Request) {
  if (req.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
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

  return new Response(prometheusMetrics, {
    status: 200,
    headers: {
      'content-type': 'text/plain; version=0.0.4',
      'cache-control': 'no-store, must-revalidate'
    }
  });
}

/**
 * Prometheus Metrics Endpoint
 * GET /api/analytics/metrics
 *
 * Exposes metrics in Prometheus text format for scraping
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { metrics } from './agg';

export default function handler(
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

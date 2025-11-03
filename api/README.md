# Sparkfined API - Vercel Edge Functions

Secure API endpoints for Sparkfined PWA Trading Platform.

## Endpoints

### `/api/prices`

Get real-time price data for multiple symbols.

**Method:** `GET` or `POST`

**Query Parameters (GET):**
- `symbols` - Comma-separated list of symbols (e.g., `BTCUSDT,ETHUSDT`)

**Request Body (POST):**
```json
{
  "symbols": ["BTCUSDT", "ETHUSDT"]
}
```

**Response:**
```json
{
  "data": [
    {
      "symbol": "BTCUSDT",
      "price": 45000.50,
      "change24h": 2.45,
      "volume24h": 1234567890,
      "timestamp": 1699000000000
    }
  ],
  "cached": false,
  "timestamp": 1699000000000
}
```

**Features:**
- HMAC signature validation for POST requests
- Rate limiting (100 req/min per client)
- Response caching (60s TTL)
- CORS enabled

**Security Headers (POST):**
- `X-Signature` - HMAC-SHA256 signature of request body
- `X-Client-ID` - Unique client identifier

### `/api/telemetry`

Collect anonymous telemetry events.

**Method:** `POST`

**Request Body:**
```json
{
  "event": "chart_load",
  "properties": {
    "symbol": "BTCUSDT",
    "interval": "1h"
  },
  "timestamp": 1699000000000
}
```

**Response:**
```json
{
  "success": true
}
```

**Features:**
- Privacy-first (no PII collected)
- CORS enabled
- Async processing

### `/api/market/ohlc`

Get OHLC (candlestick) data for charts.

**Method:** `GET`

**Query Parameters:**
- `address` - Token address
- `tf` - Timeframe (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`)

**Response:**
```json
{
  "ts": "2024-11-03T00:00:00.000Z",
  "tf": "15m",
  "ohlc": [
    {
      "t": 1699000000000,
      "o": 45000,
      "h": 45100,
      "l": 44900,
      "c": 45050,
      "v": 1000000
    }
  ]
}
```

## Environment Variables

Required environment variables for production:

```bash
API_SECRET=your-hmac-secret-key-here
UPSTASH_REDIS_URL=https://your-upstash-url.com  # Optional: for distributed caching
UPSTASH_REDIS_TOKEN=your-token                   # Optional: for distributed caching
```

## Local Development

```bash
# Install Vercel CLI
npm i -g vercel

# Run development server
vercel dev

# Test endpoints
curl http://localhost:3000/api/prices?symbols=BTCUSDT
```

## Production Deployment

```bash
# Deploy to Vercel
vercel deploy --prod

# Set environment variables
vercel env add API_SECRET production
```

## Rate Limiting

- **Default:** 100 requests per minute per client
- **Window:** 60 seconds
- **Response:** `429 Too Many Requests` with `retryAfter` header

## Caching Strategy

- **Price data:** 60 seconds TTL
- **Chart data:** 15 minutes TTL (via Workbox in SW)
- **Token metadata:** 24 hours TTL (via Workbox in SW)

## Monitoring

All endpoints log to Vercel's logging system. In production, telemetry events can be forwarded to analytics services (PostHog, Mixpanel, etc.).

## Security

- HMAC signature validation for sensitive operations
- Rate limiting per client ID
- CORS configured for allowed origins
- No sensitive data in responses
- Input validation and sanitization

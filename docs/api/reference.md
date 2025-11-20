# API Reference — Sparkfined PWA

**Last Updated:** 2025-11-20
**Base URL:** Production: `https://sparkfined.vercel.app` | Local: `http://localhost:5173`

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Core Endpoints](#core-endpoints)
  - [Health & Status](#health--status)
  - [Market Data](#market-data)
  - [Board & Dashboard](#board--dashboard)
  - [Journal](#journal)
  - [Alerts & Rules](#alerts--rules)
  - [AI & Analysis](#ai--analysis)
  - [Access Control](#access-control)
  - [Push Notifications](#push-notifications)
- [Data Proxies](#data-proxies)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Overview

Sparkfined PWA uses Vercel serverless functions for all backend operations. All API routes are located in the `/api` directory and follow REST conventions.

### Base Patterns

```
GET    /api/resource        # List/fetch resources
POST   /api/resource        # Create resource
PUT    /api/resource/:id    # Update resource
DELETE /api/resource/:id    # Delete resource
```

### Common Headers

```http
Content-Type: application/json
Authorization: Bearer <token>  # (for protected endpoints)
X-Requested-With: XMLHttpRequest
```

---

## Authentication

Most endpoints are **public** during beta. Protected endpoints require:

```http
Authorization: Bearer <ADMIN_SECRET>
```

**Protected Endpoints:**
- `/api/push/test-send` - Requires `ALERTS_ADMIN_SECRET`
- `/api/journal/export` - Optional authentication (planned)

---

## Core Endpoints

### Health & Status

#### `GET /api/health`

Check API health and uptime.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-11-20T12:34:56.789Z",
  "version": "1.0.0-beta",
  "uptime": 123456
}
```

**Status Codes:**
- `200` - Service operational
- `503` - Service unavailable

---

#### `GET /api/moralis/health`

Check Moralis proxy status.

**Response:**
```json
{
  "status": "ok",
  "proxy": "moralis",
  "ttl": 3600,
  "mocksActive": false,
  "timestamp": "2025-11-20T12:34:56.789Z"
}
```

**Status Codes:**
- `200` - Proxy operational
- `500` - Proxy error (check API key)

---

### Market Data

#### `GET /api/data/ohlc`

Fetch OHLC (Open, High, Low, Close) candlestick data for a token.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `symbol` | string | ✅ | Token symbol (e.g., `SOL`, `ETH`) |
| `interval` | string | ❌ | Candle interval: `1m`, `5m`, `15m`, `1h`, `4h`, `1d` (default: `1h`) |
| `limit` | number | ❌ | Number of candles (default: `100`, max: `1000`) |

**Request:**
```http
GET /api/data/ohlc?symbol=SOL&interval=1h&limit=100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "SOL",
    "interval": "1h",
    "candles": [
      {
        "timestamp": 1700000000000,
        "open": 23.45,
        "high": 23.89,
        "low": 23.12,
        "close": 23.67,
        "volume": 1234567.89
      }
      // ... more candles
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Missing required parameter: symbol"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid parameters
- `500` - Server error

---

#### `GET /api/market/ohlc`

Alternative OHLC endpoint (uses DexPaprika provider).

Same parameters and response as `/api/data/ohlc`.

---

#### `GET /api/dexpaprika/tokens/[address]`

Get token metadata by contract address.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `address` | string | ✅ | Token contract address |

**Request:**
```http
GET /api/dexpaprika/tokens/So11111111111111111111111111111111111111112
```

**Response:**
```json
{
  "success": true,
  "data": {
    "address": "So11111111111111111111111111111111111111112",
    "symbol": "SOL",
    "name": "Wrapped SOL",
    "decimals": 9,
    "logoURI": "https://...",
    "price": 23.45,
    "marketCap": 12345678.90,
    "volume24h": 987654.32
  }
}
```

---

#### `GET /api/mcap`

Get market cap data for multiple tokens.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `addresses` | string | ✅ | Comma-separated token addresses |

**Request:**
```http
GET /api/mcap?addresses=So11...,EPj...
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "address": "So11111111111111111111111111111111111111112",
      "marketCap": 12345678.90,
      "price": 23.45
    }
  ]
}
```

---

### Board & Dashboard

#### `GET /api/board/kpis`

Get dashboard KPI metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalVolume24h": 1234567.89,
    "activeTrades": 42,
    "portfolioValue": 98765.43,
    "pnl24h": 123.45,
    "winRate": 0.68,
    "avgHoldTime": 3600,
    "topGainer": {
      "symbol": "SOL",
      "change": 15.3
    },
    "timestamp": "2025-11-20T12:34:56.789Z"
  }
}
```

---

#### `GET /api/board/feed`

Get activity feed for dashboard.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | ❌ | Number of items (default: `20`, max: `100`) |
| `offset` | number | ❌ | Pagination offset (default: `0`) |

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "feed-123",
        "type": "trade",
        "title": "SOL trade closed",
        "description": "+12.5% profit",
        "timestamp": "2025-11-20T12:34:56.789Z",
        "metadata": {
          "symbol": "SOL",
          "pnl": 123.45
        }
      }
    ],
    "total": 150,
    "hasMore": true
  }
}
```

---

### Journal

#### `GET /api/journal`

List journal entries.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | number | ❌ | Number of entries (default: `50`, max: `200`) |
| `offset` | number | ❌ | Pagination offset (default: `0`) |
| `tags` | string | ❌ | Comma-separated tags filter |
| `search` | string | ❌ | Search in title/content |

**Request:**
```http
GET /api/journal?limit=20&tags=trade,analysis
```

**Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": "journal-123",
        "title": "SOL Analysis",
        "content": "Market showing strong support...",
        "tags": ["trade", "analysis"],
        "createdAt": "2025-11-20T12:00:00.000Z",
        "updatedAt": "2025-11-20T12:30:00.000Z"
      }
    ],
    "total": 150,
    "hasMore": true
  }
}
```

---

#### `POST /api/journal`

Create new journal entry.

**Request Body:**
```json
{
  "title": "Trade Analysis",
  "content": "Entered SOL long position at $23.45...",
  "tags": ["trade", "sol"],
  "metadata": {
    "symbol": "SOL",
    "entryPrice": 23.45
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "journal-456",
    "title": "Trade Analysis",
    "content": "Entered SOL long position...",
    "tags": ["trade", "sol"],
    "createdAt": "2025-11-20T12:34:56.789Z"
  }
}
```

---

#### `GET /api/journal/export`

Export all journal entries.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `format` | string | ❌ | Export format: `json`, `csv`, `markdown` (default: `json`) |

**Response:**
- `200` - File download (Content-Type based on format)
- `401` - Unauthorized (if authentication enabled)

---

### Alerts & Rules

#### `GET /api/rules`

List alert rules.

**Response:**
```json
{
  "success": true,
  "data": {
    "rules": [
      {
        "id": "rule-123",
        "name": "SOL Price Alert",
        "condition": "price > 25",
        "enabled": true,
        "createdAt": "2025-11-20T12:00:00.000Z"
      }
    ]
  }
}
```

---

#### `POST /api/rules/eval`

Evaluate alert rules (manual trigger).

**Request Body:**
```json
{
  "ruleId": "rule-123",
  "data": {
    "symbol": "SOL",
    "price": 25.5
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "triggered": true,
    "message": "SOL price crossed $25",
    "timestamp": "2025-11-20T12:34:56.789Z"
  }
}
```

---

#### `GET /api/rules/eval-cron`

Cron endpoint for periodic rule evaluation (internal use).

**Response:**
```json
{
  "success": true,
  "data": {
    "evaluated": 42,
    "triggered": 3,
    "timestamp": "2025-11-20T12:34:56.789Z"
  }
}
```

---

### AI & Analysis

#### `POST /api/ai/assist`

General AI assistance (OpenAI/Grok).

**Request Body:**
```json
{
  "prompt": "Analyze the current market conditions for SOL",
  "context": {
    "symbol": "SOL",
    "price": 23.45,
    "indicators": {
      "rsi": 68.5,
      "macd": 0.42
    }
  },
  "provider": "openai"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "Based on the current RSI of 68.5...",
    "provider": "openai",
    "tokens": 150,
    "cost": 0.002,
    "timestamp": "2025-11-20T12:34:56.789Z"
  }
}
```

---

#### `POST /api/ai/analyze-market`

Advanced market analysis (Grok-powered).

**Request Body:**
```json
{
  "symbol": "SOL",
  "timeframe": "1h",
  "depth": "advanced"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "symbol": "SOL",
    "sentiment": "bullish",
    "confidence": 0.78,
    "insights": [
      "Strong support at $23.00",
      "RSI indicates overbought conditions"
    ],
    "tradeIdeas": [
      {
        "type": "long",
        "entry": 23.45,
        "target": 25.00,
        "stopLoss": 22.50,
        "confidence": 0.72
      }
    ],
    "timestamp": "2025-11-20T12:34:56.789Z"
  }
}
```

---

#### `POST /api/ai/grok-context`

Get Grok-specific crypto market context.

**Request Body:**
```json
{
  "symbols": ["SOL", "ETH"],
  "includeOnChain": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "context": "Current crypto market analysis...",
    "onChainMetrics": {
      "SOL": {
        "activeAddresses": 1234567,
        "txVolume": 98765432.10
      }
    },
    "timestamp": "2025-11-20T12:34:56.789Z"
  }
}
```

---

### Access Control

#### `POST /api/access/status`

Check user access status (NFT-based gating).

**Request Body:**
```json
{
  "wallet": "7xKXtg..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasAccess": true,
    "tier": "OG",
    "nfts": [
      {
        "mint": "ABC123...",
        "collection": "Sparkfined OG"
      }
    ],
    "expiresAt": null
  }
}
```

**Status Codes:**
- `200` - Access check completed
- `403` - Access denied
- `500` - Verification error

---

### Push Notifications

#### `POST /api/push/subscribe`

Subscribe to push notifications.

**Request Body:**
```json
{
  "subscription": {
    "endpoint": "https://fcm.googleapis.com/...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub-123",
    "createdAt": "2025-11-20T12:34:56.789Z"
  }
}
```

---

#### `POST /api/push/test-send`

Send test push notification (admin only).

**Headers:**
```http
Authorization: Bearer <ALERTS_ADMIN_SECRET>
```

**Request Body:**
```json
{
  "title": "Test Alert",
  "message": "This is a test notification",
  "icon": "/icon-192x192.png",
  "badge": "/badge-72x72.png",
  "data": {
    "url": "/alerts"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": 42,
    "failed": 0,
    "timestamp": "2025-11-20T12:34:56.789Z"
  }
}
```

**Status Codes:**
- `200` - Notification sent
- `401` - Unauthorized
- `500` - Send failed

---

## Data Proxies

### Moralis Proxy

**Pattern:** `/api/moralis/[...path]`

Proxies requests to Moralis API with server-side authentication.

**Example:**
```http
GET /api/moralis/erc20/metadata?addresses=0x...
```

**Automatically adds:**
- `X-API-Key: <MORALIS_API_KEY>` header
- Rate limiting
- Caching (TTL: 1 hour)
- Mock responses (if `DEV_USE_MOCKS=true`)

---

### DexPaprika Proxy

**Pattern:** `/api/dexpaprika/[...path]`

Proxies requests to DexPaprika API.

**Example:**
```http
GET /api/dexpaprika/tokens/So11...
```

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `MISSING_PARAM` | 400 | Required parameter missing |
| `INVALID_PARAM` | 400 | Parameter format invalid |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `SERVER_ERROR` | 500 | Internal server error |
| `SERVICE_UNAVAILABLE` | 503 | External service down |

---

## Rate Limiting

### Current Limits

- **Public endpoints:** 100 requests/minute per IP
- **AI endpoints:** 10 requests/minute per IP
- **Push notifications:** 5 requests/minute per user

### Rate Limit Headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1700000000
```

### Rate Limit Response

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 60
```

```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

---

## Integration Examples

### JavaScript/TypeScript

```typescript
// Using fetch with error handling
async function getOHLCData(symbol: string) {
  const response = await fetch(
    `/api/data/ohlc?symbol=${symbol}&interval=1h&limit=100`
  )

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`)
  }

  const result = await response.json()

  if (!result.success) {
    throw new Error(result.error)
  }

  return result.data
}

// Using with retry
import { fetchWithRetry } from '@/lib/net/fetch'

const data = await fetchWithRetry('/api/data/ohlc?symbol=SOL', {
  retries: 3,
  baseDelay: 1000,
  timeout: 10000
})
```

---

## Additional Resources

- **Integration Patterns:** `docs/api/integration-patterns.md`
- **Environment Variables:** `docs/setup/environment-and-providers.md`
- **Deployment:** `docs/guides/deployment.md`
- **Troubleshooting:** `docs/guides/troubleshooting.md`

---

**Last Updated:** 2025-11-20
**API Version:** 1.0.0-beta
**Maintained by:** Sparkfined Backend Team

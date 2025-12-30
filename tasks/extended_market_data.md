# Sparkfined - Extended Journal System
## Technical Specification v1.0

**Status:** ✅ Ready for Implementation  
**Date:** December 2025  
**Author:** Sparkfined Development Team

---

## 📋 Executive Summary

This document specifies the **Extended Auto-Capture Journal System** for Sparkfined PWA - a comprehensive solution for automatic trade tracking on Solana with intelligent coin grouping, extended market data capture, and user-configurable parameters.

### Key Features

1. **Wallet Integration** - User registers Solana wallet addresses for automatic TX monitoring
2. **Auto-Capture** - Every swap/trade automatically creates journal entries
3. **Coin Grouping** - Same token transactions grouped within 24h window
4. **Full Exit Detection** - Position closure triggers immediate archival to logbook
5. **Extended Parameters** - 15+ configurable market/technical/on-chain metrics
6. **Custom Timeframes** - User-defined price change intervals (15s - 4h)
7. **Three-Stage Lifecycle** - Pending → Archived/Confirmed → Final Journal

---

## 🎯 Core Requirements

### Must-Have (MVP)

- ✅ Solana wallet address registration
- ✅ Automatic TX detection via webhooks
- ✅ 24h pending entry window
- ✅ Full exit = instant archival
- ✅ Core data capture (token, price, volume, timestamp)
- ✅ Extended data toggles in settings
- ✅ Custom price change timeframes
- ✅ IndexedDB persistence
- ✅ Pending entries dashboard
- ✅ Entry logbook (archived)

### Nice-to-Have (Phase 2)

- ⏳ Multi-wallet support (multiple addresses)
- ⏳ Multi-chain support (ETH, Base)
- ⏳ Voice notes integration
- ⏳ Screenshot auto-capture
- ⏳ AI-powered entry suggestions
- ⏳ Social sharing of insights

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   USER INTERFACE                    │
│  Settings | Pending Entries | Logbook | Journal    │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│               ZUSTAND STORE                         │
│  - pendingEntries[]                                 │
│  - archivedEntries[]                                │
│  - confirmedEntries[]                               │
│  - userSettings                                     │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│             INDEXEDDB (Dexie)                       │
│  Tables: pending | archived | confirmed | settings  │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│              API LAYER (Vercel)                     │
│  /api/tx/monitor     - Webhook receiver            │
│  /api/data/market    - Market data fetcher         │
│  /api/data/technical - Indicators calculator       │
│  /api/data/onchain   - On-chain metrics            │
└─────────────────┬───────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────┐
│           EXTERNAL SERVICES                         │
│  Helius | Birdeye | Moralis | Jupiter              │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Data Schema

### Core Entry Data (Always Captured)

```typescript
{
  tokenAddress: string;         // Solana Mint Address
  tokenSymbol: string;           // "BONK", "JUP"
  tokenName: string;             // "Bonk Inu"
  timestamp: number;             // Unix timestamp
  txHash: string;                // Solana signature
  positionSizeUSD: number;       // $50.00
  positionSizeToken: number;     // 2,500,000 BONK
  entryPrice: number;            // $0.00002
  exitPrice?: number;            // $0.000023
  dexUsed: string;               // "Jupiter", "Raydium"
}
```

### Extended Market Data (User-Toggleable)

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `marketCap` | number | Market cap in USD | ✅ ON |
| `marketCapCategory` | enum | Mega\|Large\|Mid\|Small\|Micro\|Nano | ✅ ON |
| `volume24h` | number | 24h trading volume | ✅ ON |
| `volumeToMcapRatio` | number | Volume/MCap percentage | ✅ ON |
| `priceChanges` | object | Custom timeframe changes | ✅ ON |
| `priceATH` | number | All-time high price | ✅ ON |
| `priceDistanceFromATH` | number | % distance from ATH | ✅ ON |
| `tokenAge` | number | Days since launch | ✅ ON |
| `tokenMaturity` | enum | Fresh\|New\|Established\|Mature | ✅ ON |
| `holderCount` | number | Unique holders | ✅ ON |

### Extended Technical Data

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `rsi14` | number | 14-period RSI | ✅ ON |
| `rsiCondition` | enum | Overbought\|Neutral\|Oversold | ✅ ON |
| `macdLine` | number | MACD line value | ✅ ON |
| `macdSignal` | number | MACD signal value | ✅ ON |
| `macdCondition` | enum | Bullish\|Bearish\|Neutral | ✅ ON |
| `volumeSpike` | boolean | >200% avg volume | ✅ ON |
| `volumeSpikePercent` | number | % above avg | ✅ ON |
| `isPriceBreakout` | boolean | >5% above resistance | ✅ ON |

### Extended On-Chain Data (Solana)

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `top10HoldersPercent` | number | % held by top 10 | ✅ ON |
| `whaleConcentration` | enum | Critical\|High\|Medium\|Low | ✅ ON |
| `holderGrowth24h` | number | New holders in 24h | ✅ ON |
| `liquidityPools` | object | Per-DEX liquidity | ✅ ON |
| `slippage` | number | Actual slippage % | ✅ ON |
| `gasUsedSOL` | number | Transaction fee | ✅ ON |
| `priorityFee` | number | Optional priority fee | ✅ ON |
| `txConfirmationTime` | number | Confirmation time (s) | ✅ ON |

---

## 🔄 Entry Lifecycle

### Phase 1: Pending Entry (0-24h)

**Trigger:** New transaction detected on registered wallet

**Logic:**
```
IF existing entry for same token AND <24h old:
  → APPEND transaction to existing entry
  → UPDATE PnL calculations
  → REFRESH market data (optional)
ELSE:
  → CREATE new pending entry
  → FETCH extended data (based on user config)
  → SET expiry = now + 24h
```

**Full Exit Detection:**
```
IF total_sold >= total_bought:
  → ARCHIVE entry immediately
  → SHOW notification: "Position closed: +$X (+Y%)"
  → USER choice: "Add to Journal" | "View Logbook"
```

**Status:** `pending`  
**Storage:** IndexedDB `pendingEntries` table  
**UI:** Pending Entries Dashboard (sorted by time left)

---

### Phase 2: Archived Entry (Logbook)

**Trigger:** Full exit OR 24h expiry

**Archive Reasons:**
- `full_exit` - All tokens sold
- `expired` - 24h window closed without user action
- `manual` - User manually archived

**Logic:**
```
archived_entry = {
  ...pending_entry,
  status: 'archived',
  archivedAt: now,
  archiveReason: reason
}

MOVE from pendingEntries → archivedEntries
DELETE from pendingEntries
```

**Status:** `archived`  
**Storage:** IndexedDB `archivedEntries` table  
**UI:** Entry Logbook (filterable, searchable)

---

### Phase 3: Confirmed Entry (Journal)

**Trigger:** User manually confirms entry (from pending OR archived)

**User Enrichment:**
```
PROMPT Quick Log modal:
  - Emotion tag (FOMO, Setup, Revenge, etc.)
  - Text note (thesis, lesson learned)
  - Voice note (optional)
  - Screenshots (optional)
  - Custom tags
```

**Logic:**
```
confirmed_entry = {
  ...entry,
  ...user_enrichment,
  status: 'confirmed',
  confirmedAt: now
}

ADD to confirmedEntries
DELETE from pendingEntries OR archivedEntries
RECALCULATE stats
```

**Status:** `confirmed`  
**Storage:** IndexedDB `confirmedEntries` table  
**UI:** Main Journal (AI insights, pattern analysis)

---

## ⚙️ Settings Configuration

### Wallet Management

```typescript
interface WalletSettings {
  wallets: [
    {
      address: "7kX9...mR3P",
      chain: "solana",
      label: "Main Wallet",
      isActive: true,
      addedAt: 1733493600000
    }
  ],
  autoTracking: {
    enabled: true,
    minTradeValueUSD: 10,
    excludeTokens: ["NFT_ADDRESS_1", "SPAM_TOKEN_2"]
  }
}
```

### Journal Data Configuration

**UI Location:** Settings → Journal → Extended Data

**Presets:**
- **Minimal** - Core data only (~150 bytes/entry)
- **Default** - All parameters except price changes (~400 bytes/entry)
- **Maximum** - All parameters + all timeframes (~600 bytes/entry)

**Custom Timeframe Input:**
- Format: `{number}{unit}` (e.g., "15s", "3m", "2h")
- Units: `s` (seconds), `m` (minutes), `h` (hours)
- Validation: Regex `/^(\d+)(s|m|h)$/`
- Storage: Array of strings `["15s", "1m", "5m", "1h", "4h"]`

---

## 🔌 API Integration

### Webhook Endpoint: `/api/tx/monitor`

**Purpose:** Receives transaction notifications from Helius

**Flow:**
```
1. Helius detects TX on registered wallet
2. POST /api/tx/monitor with TX data
3. Parse TX (token, type, amount, price)
4. Check for existing pending entry
5. CREATE or APPEND entry
6. Fetch extended data (parallel)
7. Store in IndexedDB
8. Return 200 OK
```

**Payload Example:**
```json
{
  "type": "SWAP",
  "signature": "5Kw9x...",
  "blockTime": 1733493600,
  "source": "Jupiter",
  "swapInfo": {
    "tokenIn": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "tokenOut": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "amountIn": 50.00,
    "amountOut": 2500000000,
    "priceUSD": 0.00002
  }
}
```

---

### Market Data Endpoint: `/api/data/market`

**Purpose:** Fetches extended market data from Birdeye

**Request:**
```json
{
  "tokenAddress": "DezXAZ8z...",
  "config": {
    "captureMarketCap": true,
    "capturePriceChanges": true,
    "customTimeframes": ["5m", "1h", "4h"]
  }
}
```

**Response:**
```json
{
  "marketCap": 1200000000,
  "marketCapCategory": "Large",
  "volume24h": 85000000,
  "volumeToMcapRatio": 7.08,
  "priceChanges": {
    "5m": 2.3,
    "1h": 5.8,
    "4h": -3.2
  },
  "priceATH": 0.00004,
  "priceDistanceFromATH": -42.5,
  "tokenAge": 540,
  "tokenMaturity": "Mature",
  "holderCount": 650000
}
```

---

### Technical Data Endpoint: `/api/data/technical`

**Purpose:** Calculates indicators from OHLCV data

**Dependencies:**
- TradingView Lightweight Charts (for OHLCV)
- Tulip Indicators (or similar library)

**Response:**
```json
{
  "rsi14": 68.2,
  "rsiCondition": "Neutral",
  "macd": {
    "line": 0.000004,
    "signal": 0.000003,
    "histogram": 0.000001,
    "condition": "Bullish"
  },
  "volumeSpike": true,
  "volumeSpikePercent": 340,
  "isPriceBreakout": true
}
```

---

### On-Chain Endpoint: `/api/data/onchain`

**Purpose:** Fetches Solana-specific metrics from Helius

**Response:**
```json
{
  "top10HoldersPercent": 45,
  "whaleConcentration": "Medium",
  "holderGrowth24h": 2500,
  "liquidityPools": {
    "raydium": 25000000,
    "orca": 12000000,
    "meteora": 8000000
  },
  "slippage": 0.8,
  "gasUsedSOL": 0.00012,
  "priorityFee": 0.0001,
  "txConfirmationTime": 1.2
}
```

---

## 🎨 UI Components

### 1. Pending Entries Dashboard

**Location:** New tab or modal  
**Features:**
- Real-time countdown timer (expires in X hours)
- Status indicators (🟢 Active | 🟡 Ready | 🔴 Expired)
- Transaction list per entry
- Unrealized PnL calculation
- Quick actions: "Confirm Entry" | "Archive" | "Delete"

**Sorting:**
- Default: Time left (ascending)
- Options: Symbol | PnL | Created Date

---

### 2. Entry Logbook

**Location:** Separate page or tab  
**Features:**
- Archived entries (expired + full exits)
- Filters: Date range | Reason | Symbol
- Stats: Total archived | Unrealized value
- Recovery: "Add to Journal" button
- Pattern insights: "You forget to log small wins"

---

### 3. Journal Data Settings

**Location:** Settings → Journal  
**Sections:**
1. Wallet Management (add/remove addresses)
2. Auto-Tracking Rules (min value, exclude tokens)
3. Extended Data Toggles (market/technical/onchain)
4. Custom Timeframes (add/remove intervals)
5. Storage Impact Display (~X bytes per entry)

**Presets:** Minimal | Default | Maximum

---

### 4. Quick Log Modal

**Trigger:** User confirms pending/archived entry  
**Fields:**
- Auto-filled: Token, Price, PnL (read-only)
- User inputs:
  - Emotion (emoji buttons)
  - Text note (textarea)
  - Voice note (mic button)
  - Screenshots (upload)
  - Tags (multi-select)

**Actions:** "Save to Journal" | "Skip"

---

## 📈 Performance Considerations

### Storage

**IndexedDB Limits:** ~50MB typical, up to 500MB (browser-dependent)

**Entry Sizes:**
- Minimal: ~150 bytes
- Default: ~400 bytes
- Maximum: ~600 bytes

**Capacity:**
- 10,000 entries @ 400 bytes = 4 MB
- 100,000 entries @ 400 bytes = 40 MB

**Strategy:** Auto-archive entries older than 90 days to reduce active dataset

---

### API Rate Limits

**Birdeye API:** 100 req/min (free tier)  
**Helius Webhooks:** 1000 req/hour (free tier)

**Mitigation:**
- Cache market data for 5 minutes
- Batch fetch for multiple tokens
- Implement exponential backoff

---

### Rendering

**Pending Entries List:**
- Virtual scrolling for >50 entries
- Debounced search (300ms)
- Lazy load extended data on expand

**Journal List:**
- Paginated (50 per page)
- Infinite scroll option
- Skeleton loaders for initial load

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// Example: Entry Lifecycle
describe('handleNewTransaction', () => {
  it('creates new entry for first TX', async () => {
    const tx = mockSolanaTransaction();
    await handleNewTransaction(tx, mockConfig);
    const entries = await db.pendingEntries.toArray();
    expect(entries).toHaveLength(1);
  });

  it('appends to existing entry within 24h', async () => {
    const tx1 = mockBuyTransaction('BONK');
    const tx2 = mockSellTransaction('BONK');
    await handleNewTransaction(tx1, mockConfig);
    await handleNewTransaction(tx2, mockConfig);
    const entries = await db.pendingEntries.toArray();
    expect(entries).toHaveLength(1);
    expect(entries[0].transactions).toHaveLength(2);
  });

  it('archives on full exit', async () => {
    const entry = mockPendingEntry({ 
      transactions: [mockBuy(100), mockSell(100)]
    });
    const isFullExit = await checkIfFullExit(entry.id);
    expect(isFullExit).toBe(true);
  });
});
```

### Integration Tests

- Webhook flow: Helius → API → DB → UI update
- Full exit detection: Buy → Sell → Archive → Notification
- Settings persistence: Toggle → Save → Reload → Verify

### E2E Tests (Playwright)

```typescript
test('User can register wallet and see auto-captured trade', async ({ page }) => {
  await page.goto('/settings/journal');
  await page.fill('[data-testid="wallet-input"]', MOCK_WALLET);
  await page.click('[data-testid="add-wallet"]');
  
  // Simulate webhook
  await mockHeliusWebhook(MOCK_WALLET, MOCK_TX);
  
  await page.goto('/pending-entries');
  await expect(page.locator('[data-testid="entry-card"]')).toBeVisible();
});
```

---

## 🚀 Implementation Roadmap

### Week 1: Core Infrastructure
- [ ] Database schema (Dexie tables)
- [ ] Zustand store setup
- [ ] API endpoints structure
- [ ] Webhook receiver

### Week 2: Entry Logic
- [ ] Transaction parsing
- [ ] Coin matching algorithm
- [ ] Full exit detection
- [ ] Auto-archival cron

### Week 3: UI Components
- [ ] Settings UI
- [ ] Pending Entries Dashboard
- [ ] Entry Logbook
- [ ] Quick Log Modal

### Week 4: Extended Data
- [ ] Market data integration
- [ ] Technical indicators
- [ ] On-chain metrics
- [ ] Custom timeframes

### Week 5: Polish & Testing
- [ ] Unit test coverage (80%+)
- [ ] E2E critical flows
- [ ] Performance optimization
- [ ] Documentation

---

## 🔒 Security Considerations

### Wallet Privacy

- **Never store private keys** - only public addresses
- **No signing capability** - read-only monitoring
- **User controls** - can remove wallet anytime
- **No data sharing** - all data stays in IndexedDB

### API Security

- **Rate limiting** - 100 req/min per user
- **Input validation** - sanitize all webhook data
- **CORS** - restrict to Helius/Birdeye origins
- **No PII** - no email, name, or identifying info

---

## 📚 Dependencies

### Frontend
- `dexie@4.0` - IndexedDB wrapper
- `zustand@4.5` - State management
- `react@18.3` - UI framework
- `date-fns@3.0` - Date utilities

### Backend (Vercel Functions)
- `@solana/web3.js@1.95` - Solana SDK
- `node-fetch@3.3` - HTTP client
- `zod@3.23` - Schema validation

### External APIs
- Helius RPC & Webhooks (Solana)
- Birdeye API (Market data)
- Jupiter API (DEX aggregator data)

---

## 🎯 Success Metrics

### User Experience
- ✅ Entry creation <2 seconds
- ✅ Zero manual data entry required
- ✅ <3 clicks to confirm journal entry
- ✅ 24h retention for pending entries

### Technical Performance
- ✅ API response <500ms (p95)
- ✅ UI render <100ms (p95)
- ✅ Webhook processing <1s
- ✅ Storage <50MB for 10k entries

### Adoption
- 🎯 80% of trades auto-captured
- 🎯 60% of pending entries confirmed
- 🎯 50% of users enable extended data

---

## 📝 Open Questions

1. **Multi-wallet priority:** Should we support multiple wallets in MVP?
2. **Data retention:** How long to keep archived entries? 90 days? Forever?
3. **Export format:** CSV, JSON, or both?
4. **AI insights:** Generate insights from logbook data, not just confirmed journal?
5. **Notification timing:** Push immediately on full exit, or batch daily?

---

## ✅ Sign-Off

**Ready for Development:** ✅  
**Requires Further Discussion:** ⏳ (Open Questions)  
**Blockers:** None

**Next Steps:**
1. Review with team
2. Finalize open questions
3. Begin Week 1 implementation
4. Daily standup sync

---

**Document Version:** 1.0  
**Last Updated:** December 6, 2025  
**Status:** ✅ Approved for Implementation

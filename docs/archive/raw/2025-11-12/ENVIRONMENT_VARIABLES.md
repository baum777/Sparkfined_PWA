# Environment Variables Guide

**Last Updated:** 2025-11-06  
**Status:** Complete reference for all environment variables

---

## 📋 Quick Start

### Minimum Required (MVP)

```bash
# Copy template
cp .env.example .env.local

# Add minimum required:
VITE_APP_VERSION=1.0.0-beta

# Choose ONE data provider:
# Option A: Moralis (recommended)
MORALIS_API_KEY=your_moralis_key
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2

# Option B: DexPaprika
DEXPAPRIKA_API_KEY=your_dexpaprika_key
DEXPAPRIKA_BASE=https://api.dexpaprika.com
```

---

## 🗂️ Environment Variables by Category

### 1. Frontend Required

| Variable | Default | Description | Where to Get |
|----------|---------|-------------|--------------|
| `VITE_APP_VERSION` | `1.0.0-beta` | App version (displayed in settings) | Set manually |

### 2. Data Providers (Critical for Core Functionality)

#### Moralis API
| Variable | Default | Description | Where to Get |
|----------|---------|-------------|--------------|
| `MORALIS_API_KEY` | - | Moralis API key (backend) | [admin.moralis.io](https://admin.moralis.io/) |
| `MORALIS_BASE` | `https://deep-index.moralis.io/api/v2.2` | Moralis base URL (legacy) | - |
| `MORALIS_BASE_URL` | `https://deep-index.moralis.io/api/v2.2` | Moralis base URL override for serverless proxy | Optional |
| `VITE_MORALIS_API_KEY` | - | **Deprecated.** Nicht mehr setzen; verwende `MORALIS_API_KEY` (Server). | Same as above |
| `VITE_MORALIS_BASE` | `https://deep-index.moralis.io/api/v2.2` | Moralis base URL (frontend) | - |
| `MORALIS_WEBHOOK_SECRET` | - | HMAC secret to verify Moralis Streams webhooks | Set manually (deploy env only) |
| `ENABLE_OG_MINT` | `false` | Enables OG lock/mint endpoints when `true` | Set manually |

#### DexPaprika API
| Variable | Default | Description | Where to Get |
|----------|---------|-------------|--------------|
| `DEXPAPRIKA_API_KEY` | - | DexPaprika API key (backend) | Contact DexPaprika |
| `DEXPAPRIKA_BASE` | `https://api.dexpaprika.com` | DexPaprika base URL | - |
| `VITE_DEXPAPRIKA_BASE` | `https://api.dexpaprika.com` | DexPaprika base URL (frontend) | - |
| `DATA_PROXY_SECRET` | - | Shared secret protecting backend data proxy endpoints | Set manually (deploy env only) |

#### Provider Configuration
| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_DATA_PRIMARY` | `dexpaprika` | Primary data provider: `dexpaprika` \| `moralis` \| `mock` |
| `VITE_DATA_SECONDARY` | `moralis` | Secondary fallback: `moralis` \| `none` |
| `VITE_DATA_FALLBACKS` | `dexscreener,pumpfun` | Comma-separated fallback providers |

### 3. AI Features (Optional)

| Variable | Default | Description | Where to Get |
|----------|---------|-------------|--------------|
| `OPENAI_API_KEY` | - | OpenAI API key | [platform.openai.com](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | - | Anthropic/Claude API key | [console.anthropic.com](https://console.anthropic.com/) |
| `XAI_API_KEY` | - | xAI/Grok API key | Contact xAI |
| `AI_MAX_COST_USD` | `0.25` | Max cost per AI call (USD) | Set manually |
| `AI_CACHE_TTL_SEC` | `3600` | AI response cache duration (seconds) | Set manually |
| `AI_PROXY_SECRET` | - | Shared secret to authorize backend AI proxy endpoints | Set manually (deploy env only) |
| `ANALYSIS_AI_PROVIDER` | `none` | AI provider: `none` \| `openai` \| `anthropic` | Set manually |
| `VITE_ENABLE_AI_TEASER` | `false` | Enable AI teaser features | Set manually |

### 4. Blockchain (Solana)

| Variable | Default | Description | Where to Get |
|----------|---------|-------------|--------------|
| `VITE_SOLANA_NETWORK` | `mainnet-beta` | Network: `mainnet-beta` \| `devnet` | Set manually |
| `VITE_SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Solana RPC endpoint | [Helius](https://helius.xyz/), [QuickNode](https://www.quicknode.com/) |
| `SOLANA_RPC_URL` | `https://api.mainnet-beta.solana.com` | Backend RPC URL | Same as above |
| `SOLANA_KEYPAIR_JSON` | - | Server keypair (for signing) | Generate with Solana CLI |

#### Access System
| Variable | Default | Description |
|----------|---------|-------------|
| `ACCESS_OG_SYMBOL` | `OGPASS` | OG token symbol |
| `ACCESS_TOKEN_MINT` | `So111...112` (SOL) | Token mint address |
| `METAPLEX_COLLECTION_MINT` | - | NFT collection mint |

### 5. Push Notifications

| Variable | Description | How to Generate |
|----------|-------------|-----------------|
| `VITE_VAPID_PUBLIC_KEY` | VAPID public key (frontend) | `npx web-push generate-vapid-keys` |
| `VAPID_PUBLIC_KEY` | VAPID public key (backend) | Same command |
| `VAPID_PRIVATE_KEY` | VAPID private key (backend only!) | Same command |
| `VAPID_SUBJECT` | Contact email | Set to `mailto:your-email@example.com` |
| `VAPID_CONTACT` | Alternative contact | Same as subject |
| `ALERTS_ADMIN_SECRET` | Shared secret protecting alerts worker/test-send endpoints | Set manually (deploy env only) |

### 6. Feature Flags

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_ENABLE_DEBUG` | `false` | Enable debug logs in production |
| `VITE_ENABLE_ANALYTICS` | `false` | Enable analytics |
| `VITE_ENABLE_METRICS` | `true` | Enable performance metrics |
| `VITE_ORDERFLOW_PROVIDER` | `none` | Order flow data provider |
| `VITE_WALLETFLOW_PROVIDER` | `none` | Wallet flow data provider |

### 7. Performance Budgets (Advanced)

| Variable | Default (ms) | Description |
|----------|--------------|-------------|
| `PERF_BUDGET_START_MS` | `1000` | App start budget |
| `PERF_BUDGET_API_MEDIAN_MS` | `500` | API call median |
| `PERF_BUDGET_AI_TEASER_P95_MS` | `2000` | AI teaser P95 |
| `PERF_BUDGET_REPLAY_OPEN_P95_MS` | `350` | Replay open P95 |
| `PERF_BUDGET_JOURNAL_SAVE_MS` | `60` | Journal save |
| `PERF_BUDGET_JOURNAL_GRID_MS` | `250` | Journal grid render |
| `PERF_BUDGET_EXPORT_ZIP_P95_MS` | `800` | Export ZIP P95 |

### 8. External APIs (Auto-configured)

| Variable | Default | Description |
|----------|---------|-------------|
| `DEX_API_BASE` | `https://api.dexscreener.com` | DexScreener API |
| `DEX_API_TIMEOUT` | `5000` | DexScreener timeout (ms) |
| `PUMPFUN_API_BASE` | `https://api.pump.fun` | Pump.fun API |
| `PUMPFUN_API_TIMEOUT` | `5000` | Pump.fun timeout (ms) |

---

## 🚀 Deployment Setup

### Vercel Dashboard

1. Go to: Project Settings → Environment Variables
2. Add each variable (see table above)
3. Select environments:
   - ✅ Production
   - ✅ Preview
   - ⚠️ Development (optional)

### Priority for MVP

**Tier 1 (Required):**
```bash
VITE_APP_VERSION=1.0.0-beta
MORALIS_API_KEY=xxx
MORALIS_BASE=https://deep-index.moralis.io/api/v2.2
```

**Tier 2 (Recommended):**
```bash
OPENAI_API_KEY=xxx  # For AI features
VAPID_PUBLIC_KEY=xxx  # For push notifications
VAPID_PRIVATE_KEY=xxx
VITE_VAPID_PUBLIC_KEY=xxx
```

**Tier 3 (Optional):**
```bash
SOLANA_RPC_URL=xxx  # For blockchain features
SOLANA_KEYPAIR_JSON=xxx  # For server-side signing
```

---

## 🔐 Security Best Practices

### Never Commit to Git
- ✅ `.env.local` is in `.gitignore`
- ✅ Never commit API keys
- ✅ Use `.env.example` as template only

### Frontend vs Backend Keys
- **Frontend (`VITE_*`)**: Exposed in browser, public keys only
- **Backend**: Never exposed, all sensitive keys here

### Key Rotation
- Rotate keys every 90 days
- Immediately rotate if compromised
- Use different keys for dev/staging/prod

---

## 🧪 Testing Environment Variables

### Check if Variables are Loaded

```typescript
// Frontend
console.log('App Version:', import.meta.env.VITE_APP_VERSION)
console.log('Moralis Base:', import.meta.env.VITE_MORALIS_BASE)

// Backend (in API routes)
console.log('Moralis Key:', process.env.MORALIS_API_KEY ? '✅ Set' : '❌ Missing')
```

### Health Check Endpoint

```bash
# After deployment, test:
curl https://your-app.vercel.app/api/health

# Should return:
{
  "ok": true,
  "checks": {
    "env": {
      "dexpaprika": true,
      "openai": true,
      "vapid": true
    }
  }
}
```

---

## 📝 Common Issues

### Issue: "MORALIS_API_KEY not configured"

**Solution:**
1. Check `.env.local` has `MORALIS_API_KEY=xxx`
2. For Vercel: Add to Environment Variables in dashboard
3. Redeploy after adding variables

### Issue: "VAPID key format invalid"

**Solution:**
1. Generate new keys: `npx web-push generate-vapid-keys`
2. Copy full key including prefix (e.g., `BNF7...`)
3. Add to both `VITE_VAPID_PUBLIC_KEY` and `VAPID_PUBLIC_KEY`

### Issue: AI features not working

**Solution:**
1. Check `OPENAI_API_KEY` is set
2. Verify key is valid: [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
3. Check API quota/credits

---

## 🔗 External Resources

- **Moralis:** https://admin.moralis.io/
- **OpenAI:** https://platform.openai.com/api-keys
- **Anthropic:** https://console.anthropic.com/
- **Upstash Redis:** https://upstash.com/
- **Sentry:** https://sentry.io/
- **Umami:** https://umami.is/
- **Helius (Solana RPC):** https://helius.xyz/
- **Web Push Testing:** https://web-push-codelab.glitch.me/

---

**Last Updated:** 2025-11-06  
**Template File:** `.env.example` (212 lines)  
**Total Variables:** 60+ environment variables documented

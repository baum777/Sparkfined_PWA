---
mode: SYSTEM
id: "10-deployment"
priority: 2
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
globs: ["vercel.json", "scripts/**/*.sh", "scripts/**/*.mjs", "package.json"]
description: "Deployment process for Vercel, CI/CD checklists, environment setup, and rollback strategies"
---

# 10 – Deployment & Operations

## 1. Deployment-Overview

### Target-Platform

**Vercel** (Production + Preview)

- **Production:** `https://sparkfined.app` (Main-Branch)
- **Preview:** `https://preview-<hash>.vercel.app` (PRs + Feature-Branches)
- **Local-Dev:** `http://localhost:5173` (Vite-Dev-Server)

### Build-System

```bash
# Build-Command (vercel.json)
pnpm run build

# Output-Directory
dist/

# Build-Time: ~30-45s (inkl. TypeScript, Vite, Workbox)
```

### Serverless-APIs

**Vercel Edge-Functions** (Node.js Runtime)

- **Location:** `api/**/*.ts`
- **Runtime:** Node 18
- **Timeout:** 10s (Edge), 30s (Serverless)
- **Memory:** 1024MB

---

## 2. Pre-Deployment-Checklist

**[MUST] Run vor jedem Deployment (Production):**

```bash
# ✅ 1. TypeScript-Check
pnpm run typecheck

# ✅ 2. Linter
pnpm run lint

# ✅ 3. Unit-Tests
pnpm test

# ✅ 4. Build-Test
pnpm run build

# ✅ 5. Bundle-Size-Check
pnpm run check:bundle-size

# ✅ 6. E2E-Tests (optional, lokaler Headless-Run)
pnpm run test:e2e
```

**[SHOULD] Manuelle Checks:**

```markdown
☐ README/CHANGELOG aktualisiert?
☐ Neue Environment-Variables in Vercel konfiguriert?
☐ Breaking-Changes dokumentiert?
☐ API-Endpoints getestet (Postman/Bruno)?
☐ PWA-Manifest aktualisiert (Version, Icons)?
☐ Offline-Fallback aktuell?
```

---

## 3. Vercel-Configuration

### vercel.json

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "devCommand": "pnpm run dev",
  "installCommand": "pnpm install --frozen-lockfile",
  "framework": "vite",
  "regions": ["fra1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    },
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/api/data/:path*",
      "destination": "/api/data/proxy"
    }
  ],
  "redirects": [
    {
      "source": "/docs",
      "destination": "/docs/index.md",
      "permanent": false
    }
  ]
}
```

**Key-Config-Points:**

- **Region:** `fra1` (Frankfurt, niedrigste Latency für EU-User)
- **Security-Headers:** HSTS, nosniff, X-Frame-Options
- **SW-Cache:** Service-Worker immer frisch (max-age=0)
- **Rewrites:** Proxy-Pattern für API-Endpoints

---

## 4. Environment-Variables

### Vercel-Environment-Setup

**[MUST] Konfiguriere Secrets in Vercel-Dashboard**

```bash
# Vercel-Dashboard: Settings → Environment Variables

# === Production ===
MORALIS_API_KEY=sk-prod-abc123...
DEXPAPRIKA_API_KEY=dp-prod-xyz789...
OPENAI_API_KEY=sk-prod-openai...
XAI_API_KEY=xai-prod-grok...
DATA_PROXY_SECRET=prod-secret-random-xyz
AI_PROXY_SECRET=prod-secret-random-abc

# === Preview (PR-Previews) ===
# Verwende gleiche Keys wie Production (oder separate Sandbox-Keys)
MORALIS_API_KEY=sk-preview-...
# ...

# === Development (Lokaler Dev-Server) ===
# .env.local (nicht committed, siehe .gitignore)
```

**Environment-Scopes:**

1. **Production:** Nur Main-Branch-Deployments
2. **Preview:** Alle PRs + Feature-Branches
3. **Development:** Lokaler Dev-Server (`pnpm run dev`)

**[MUST NOT] Expone Secrets im Client**

```bash
# ✅ Good: Server-Side-Only (kein VITE_ Prefix)
MORALIS_API_KEY=sk-abc123...

# ❌ Avoid: Client-Side-Expose (VITE_ Prefix)
VITE_MORALIS_API_KEY=sk-abc123...  # Im Bundle sichtbar!
```

### .env.local Setup (Development)

**[MUST] Erstelle lokale `.env.local` nach `.env.example`**

```bash
# 1. Kopiere Template
cp .env.example .env.local

# 2. Fülle echte Keys ein (siehe Vercel-Dashboard oder Secret-Manager)
# 3. Teste lokalen Dev-Server
pnpm run dev
```

---

## 5. CI/CD-Pipeline

### GitHub-Actions (Geplant)

**[FUTURE]** Automatisches Linting + Testing bei PRs

```yaml
# .github/workflows/ci.yml (geplant)
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'pnpm'

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Typecheck
        run: pnpm run typecheck

      - name: Test
        run: pnpm test

      - name: Build
        run: pnpm run build

      - name: Bundle-Size-Check
        run: pnpm run check:bundle-size
```

### Vercel-Git-Integration

**Auto-Deploy:**

- **Main-Branch:** Automatisches Deployment zu Production (`sparkfined.app`)
- **PRs:** Automatisches Preview-Deployment (`preview-<hash>.vercel.app`)
- **Feature-Branches:** Automatisches Preview-Deployment

**Deploy-Hooks:**

- **Build-Logs:** Vercel-Dashboard → Deployments → Build-Logs
- **Runtime-Logs:** Vercel-Dashboard → Deployments → Functions-Logs

---

## 6. Health-Checks

### API-Health-Endpoint

**[MUST]** Implementiere `/api/health` für Status-Monitoring

```ts
// api/health.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VITE_APP_VERSION || '0.0.0',
    uptime: process.uptime(),
    services: {
      moralis: await checkMoralisHealth(),
      dexpaprika: await checkDexPaprikaHealth(),
      openai: await checkOpenAIHealth(),
    },
  };

  const allHealthy = Object.values(health.services).every(s => s === 'ok');

  return res.status(allHealthy ? 200 : 503).json(health);
}

async function checkMoralisHealth(): Promise<'ok' | 'error'> {
  try {
    const response = await fetch('https://deep-index.moralis.io/api/v2.2/health', {
      headers: { 'X-API-Key': process.env.MORALIS_API_KEY || '' },
      signal: AbortSignal.timeout(5000),
    });
    return response.ok ? 'ok' : 'error';
  } catch {
    return 'error';
  }
}

// ... analog für DexPaprika, OpenAI
```

**Usage:**

```bash
# Manual Health-Check
curl https://sparkfined.app/api/health

# Automated Health-Check (Vercel-Cron oder UptimeRobot)
0 */6 * * * curl https://sparkfined.app/api/health
```

### Frontend-Health-Check

**[SHOULD]** Implementiere `/health.html` für Frontend-Uptime-Monitoring

```html
<!-- public/health.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Sparkfined Health</title>
</head>
<body>
  <h1>✅ Sparkfined PWA is running</h1>
  <p id="status">Loading...</p>

  <script>
    // Check if Service-Worker registriert
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        document.getElementById('status').innerText = 
          regs.length > 0 ? '✅ Service-Worker active' : '⚠️ No Service-Worker';
      });
    } else {
      document.getElementById('status').innerText = '❌ No SW support';
    }
  </script>
</body>
</html>
```

---

## 7. Rollback-Strategy

### Instant-Rollback (Vercel)

**[MUST] Nutze Vercel Instant-Rollback bei kritischen Bugs**

```bash
# 1. Vercel-Dashboard → Deployments
# 2. Wähle letztes stabiles Deployment
# 3. "Promote to Production"
# → Instant-Rollback ohne neuen Build (~5-10 Sekunden)
```

**Alternative: Git-Revert + Re-Deploy**

```bash
# 1. Identifiziere Bad-Commit
git log --oneline

# 2. Revert
git revert <bad-commit-hash>

# 3. Push (triggert Auto-Deploy)
git push origin main
```

### Rollback-Checklist

```markdown
☐ Identifiziere Fehler (Logs, Sentry, User-Reports)
☐ Instant-Rollback via Vercel-Dashboard
☐ Teste Production nach Rollback (Health-Check, Smoke-Test)
☐ Dokumentiere Fehler in Issue/Post-Mortem
☐ Fixe Fehler in Feature-Branch
☐ Test/Lint/Review vor Re-Deploy
```

---

## 8. Database-Migrations (Future)

**[FUTURE]** Wenn Backend-DB eingeführt wird (z.B. Supabase, Neon)

### Migration-Strategy

```bash
# 1. Erstelle Migration-File
pnpm run migration:create add_user_preferences

# 2. Teste Migration lokal
pnpm run migration:up

# 3. Deploy Migration zu Production (BEFORE Code-Deploy)
pnpm run migration:up --env=production

# 4. Deploy neuen Code (nach erfolgreicher Migration)
git push origin main
```

**[MUST] Backward-Compatible-Migrations**

```sql
-- ✅ Good: Backward-Compatible (add column with default)
ALTER TABLE users ADD COLUMN theme VARCHAR(10) DEFAULT 'dark';

-- ❌ Avoid: Breaking-Change (remove column → alte App crasht)
ALTER TABLE users DROP COLUMN legacy_field;
```

---

## 9. Monitoring & Alerts

### Error-Tracking (Geplant)

**[FUTURE]** Sentry für Error-Tracking

```ts
// src/lib/sentry.ts (geplant)
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,  // 10% Performance-Traces
  beforeSend(event) {
    // Redact Sensitive-Data
    if (event.request?.headers?.authorization) {
      delete event.request.headers.authorization;
    }
    return event;
  },
});
```

### Performance-Monitoring

**[SHOULD]** Web-Vitals-Tracking via Vercel-Analytics

```tsx
// src/main.tsx
import { onCLS, onFID, onLCP } from 'web-vitals';

function sendToAnalytics(metric: Metric) {
  console.log('[Vitals]', metric.name, metric.value);

  // In Production: Send to Vercel-Analytics oder Google-Analytics
  if (import.meta.env.PROD) {
    // analytics.track(metric.name, { value: metric.value });
  }
}

onCLS(sendToAnalytics);
onFID(sendToAnalytics);
onLCP(sendToAnalytics);
```

### Uptime-Monitoring

**[SHOULD]** Externe Uptime-Checks (z.B. UptimeRobot, Pingdom)

```bash
# Check-Endpoints
https://sparkfined.app/
https://sparkfined.app/api/health
https://sparkfined.app/health.html

# Alert-Targets
- E-Mail: ops@sparkfined.app
- Slack: #alerts-channel
- SMS: +49-xxx (für Critical)
```

---

## 10. Scripts

### Deployment-Scripts

**scripts/verify-deployment.sh**

```bash
#!/bin/bash
# Smoke-Test nach Deployment

set -e

PROD_URL="https://sparkfined.app"

echo "🔍 Verifying deployment..."

# 1. Health-Check
echo "✅ Checking /api/health..."
curl -f "$PROD_URL/api/health" || exit 1

# 2. Main-Page-Load
echo "✅ Checking main page..."
curl -f "$PROD_URL/" > /dev/null || exit 1

# 3. Service-Worker-Registration
echo "✅ Checking /sw.js..."
curl -f "$PROD_URL/sw.js" > /dev/null || exit 1

echo "✅ Deployment verified!"
```

**scripts/check-env.js**

```js
#!/usr/bin/env node
// Check if all required Env-Variables sind gesetzt

const required = [
  'MORALIS_API_KEY',
  'DEXPAPRIKA_API_KEY',
  'OPENAI_API_KEY',
  'DATA_PROXY_SECRET',
];

const missing = required.filter(key => !process.env[key]);

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:');
  missing.forEach(key => console.error(`   - ${key}`));
  process.exit(1);
}

console.log('✅ All required environment variables are set');
```

**Usage:**

```bash
# Vor Deployment (lokal)
pnpm run check:env
pnpm run verify:api

# Nach Deployment (Production-Check)
./scripts/verify-deployment.sh
```

---

## 11. Examples

### ✅ Good – Deployment-Workflow

```bash
# 1. Feature-Branch erstellen
git checkout -b feat/new-signal-matrix

# 2. Entwicklung + Testing
pnpm run dev
pnpm test
pnpm run lint

# 3. Commit + Push
git commit -m "feat: Add signal matrix component"
git push origin feat/new-signal-matrix

# 4. PR erstellen → Auto-Preview-Deployment
# → https://preview-abc123.vercel.app

# 5. Review + Testing auf Preview
# → Smoke-Test, E2E-Test, Visual-Check

# 6. Merge to Main → Auto-Deploy to Production
git checkout main
git merge feat/new-signal-matrix
git push origin main

# 7. Post-Deploy-Verification
./scripts/verify-deployment.sh
curl https://sparkfined.app/api/health

# 8. Monitor Logs (Vercel-Dashboard → Functions-Logs)
```

### ❌ Avoid – Deployment-Anti-Patterns

```bash
# ❌ Bad: Direct-Push to Main ohne Tests
git commit -m "fix"
git push origin main  # Kein Lint, kein Test → Breaking-Deployment!

# ❌ Bad: Secrets in Code committet
git add .env.local
git commit -m "Add API keys"  # Secret-Leak!

# ❌ Bad: Deployment ohne Health-Check
git push origin main
# ... kein Post-Deploy-Verification → Bug unentdeckt für Stunden

# ❌ Bad: Rollback ohne Dokumentation
# → Instant-Rollback via Vercel, aber kein Issue/Post-Mortem
# → Bug kann wiederkommen im nächsten Deployment
```

---

## Related

- `09-security.md` – Secret-Management, Environment-Variables
- `06-testing-strategy.md` – Pre-Deployment-Tests (Unit, E2E)
- `vercel.json` – Vercel-Configuration
- `scripts/verify-deployment.sh` – Deployment-Verification-Script
- `scripts/check-env.js` – Environment-Validation-Script

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 4 (Vercel-Deployment, CI/CD, Rollback-Strategies)

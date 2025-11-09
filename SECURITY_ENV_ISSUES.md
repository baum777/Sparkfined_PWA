# 🚨 Security Issues: Environment Variables

**Created:** 2025-11-09  
**Status:** Critical - Needs immediate attention  
**Severity:** HIGH - API Keys exposed in frontend bundle

---

## 🔴 Critical Issues

### 1. AI API Keys Exposed in Frontend Bundle

**Files affected:**
- `src/lib/ai/teaserAdapter.ts` (lines 35-37)

**Problem:**
```typescript
// ❌ WRONG - These keys are read in frontend code
const OPENAI_API_KEY = import.meta.env.OPENAI_API_KEY || ''
const GROK_API_KEY = import.meta.env.GROK_API_KEY || ''
const ANTHROPIC_API_KEY = import.meta.env.ANTHROPIC_API_KEY || ''
```

Even without `VITE_` prefix, Vite will bundle any `import.meta.env.*` variables that are set at build time!

**Impact:**
- ⚠️ API keys are visible in browser DevTools
- ⚠️ Keys can be extracted from production bundle
- ⚠️ Risk of unauthorized API usage and billing

**Solution:**
Move AI logic to backend API routes:
- Create `/api/ai/teaser-analysis.ts`
- Read keys from `process.env` in backend
- Frontend calls `/api/ai/teaser-analysis` with payload

---

### 2. Moralis API Key Used Directly in Frontend

**Files affected:**
- `src/lib/adapters/moralisAdapter.ts` (line 30)
- `src/lib/timeframeLogic.ts` (line 21)
- `src/lib/walletMonitor.ts` (line 31)

**Problem:**
```typescript
// ❌ WRONG - API key exposed to browser
apiKey: import.meta.env.VITE_MORALIS_API_KEY || ''
```

**Impact:**
- ⚠️ Anyone can extract Moralis API key from bundle
- ⚠️ Unlimited API calls on your account
- ⚠️ Potential billing fraud

**Solution:**
✅ Backend proxy already exists: `/api/moralis/token/[address].ts`

**Action needed:**
1. Update `moralisAdapter.ts` to call `/api/moralis/token/[address]` instead of direct Moralis API
2. Update `timeframeLogic.ts` to use backend proxy
3. Update `walletMonitor.ts` to use backend proxy
4. Remove `VITE_MORALIS_API_KEY` from all environments

---

### 3. Generic API Key in Frontend Config

**Files affected:**
- `src/lib/config.ts` (line 5)

**Problem:**
```typescript
// ❌ WRONG - Generic API key exposed
apiKey: import.meta.env.VITE_API_KEY || ''
```

**Impact:**
- ⚠️ Unknown usage - needs investigation
- ⚠️ Potentially exposing sensitive credentials

**Solution:**
1. Identify what `VITE_API_KEY` is used for
2. If it's for backend API: use backend auth instead
3. If it's for public APIs: document explicitly
4. If unused: remove completely

---

### 4. Inconsistent AI Provider Variable

**Files affected:**
- `src/lib/config/flags.ts` (line 22) - uses `VITE_ANALYSIS_AI_PROVIDER`
- `src/lib/ai/teaserAdapter.ts` (line 34) - uses `ANALYSIS_AI_PROVIDER` (no VITE_)

**Problem:**
```typescript
// ❌ INCONSISTENT
// flags.ts:
const ai = (import.meta.env.VITE_ANALYSIS_AI_PROVIDER || 'none') as AIProvider

// teaserAdapter.ts:
const AI_PROVIDER = (import.meta.env.ANALYSIS_AI_PROVIDER || 'none') as AIProvider
```

**Impact:**
- 🟡 Configuration may not work as expected
- 🟡 One file reads wrong variable

**Solution:**
Standardize on `VITE_ANALYSIS_AI_PROVIDER` everywhere (or move to backend)

---

### 5. Health Check Uses Wrong Variable

**Files affected:**
- `api/health.ts` (line 10)

**Problem:**
```typescript
// ❌ WRONG - Backend checking for VITE_ variable
vapid: !!process.env.VITE_VAPID_PUBLIC_KEY
```

**Impact:**
- 🟡 Health check will always report `vapid: false`
- 🟡 False negative in monitoring

**Solution:**
```typescript
// ✅ CORRECT
vapid: !!process.env.VAPID_PUBLIC_KEY
```

---

## 🟡 Medium Priority Issues

### 6. DexPaprika API Key May Be Exposed

**Status:** Needs investigation

DexPaprika adapter is used in frontend, but currently uses public base URL only.
Verify that no API key is being passed from frontend.

---

## ✅ What's Already Good

1. ✅ Backend proxies exist for Moralis and DexPaprika
2. ✅ Backend AI assist endpoint exists (`/api/ai/assist.ts`)
3. ✅ Proper separation of VAPID keys (public in frontend, private in backend)
4. ✅ Redis/Upstash keys only in backend
5. ✅ Webhook secrets only in backend

---

## 🛠️ Action Plan

### Phase 1: Immediate (Blocking for Production)

1. **Update moralisAdapter.ts**
   - Change to use `/api/moralis/token/[address]` proxy
   - Remove `VITE_MORALIS_API_KEY` dependency
   
2. **Update timeframeLogic.ts**
   - Use backend proxy for Moralis calls
   
3. **Update walletMonitor.ts**
   - Use backend proxy for Moralis calls

4. **Fix health.ts**
   - Change `VITE_VAPID_PUBLIC_KEY` → `VAPID_PUBLIC_KEY`

5. **Remove from Vercel Environment Variables:**
   - `VITE_MORALIS_API_KEY`
   - `VITE_API_KEY` (if unused)

### Phase 2: High Priority

1. **Move AI logic to backend**
   - Create `/api/ai/teaser-analysis.ts`
   - Move all AI key reads to backend
   - Update `teaserAdapter.ts` to call backend API

2. **Standardize AI provider variable**
   - Use `VITE_ANALYSIS_AI_PROVIDER` consistently
   - Or move to backend config entirely

### Phase 3: Nice to Have

1. **Audit all `import.meta.env` usage**
   - Ensure no secrets are read
   - Document purpose of each variable

2. **Add E2E tests**
   - Test that proxies work correctly
   - Verify no keys in bundle

3. **Add bundle analysis**
   - Check for leaked secrets in production build
   - Add to CI/CD pipeline

---

## 🔍 How to Verify

### Check Production Bundle for Secrets

```bash
# Build production bundle
npm run build

# Search for potential secrets
grep -r "sk-" dist/
grep -r "API_KEY" dist/
grep -r "Bearer" dist/

# Check bundle size and content
ls -lh dist/assets/*.js
```

### Test Backend Proxies

```bash
# Test Moralis proxy
curl https://your-app.vercel.app/api/moralis/token/YOUR_TOKEN_ADDRESS

# Should return without exposing API key in request
```

---

## 📊 Summary

- **Critical Issues:** 5
- **Medium Issues:** 1
- **Estimated Fix Time:** 4-6 hours
- **Risk Level:** HIGH
- **Production Ready:** ❌ No (after fixes: ✅ Yes)

---

**Next Steps:**
1. Review this document
2. Prioritize Phase 1 fixes
3. Test in preview environment
4. Deploy to production

**Last Updated:** 2025-11-09

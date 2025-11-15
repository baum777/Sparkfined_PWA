# Patches Directory

This directory contains patch files from various sources. **Not all patches are applicable to this project.**

---

## ⚠️ IMPORTANT: Project Framework

**Sparkfined PWA uses:** Vite + React (SPA)  
**NOT:** Next.js

---

## Patch Status

| File | Status | Reason |
|------|--------|--------|
| `001_middleware_whitelist.patch.NEXTJS_ONLY` | ❌ **INVALID** | Next.js middleware - not compatible with Vite |
| `002_vercel_rewrites.patch` | ✅ Valid | Vercel rewrites (framework-agnostic) |
| `003_manifest_add.patch` | ✅ Valid | PWA manifest (framework-agnostic) |
| `004_ci_manifest_check.patch` | ✅ Valid | CI check (framework-agnostic) |
| `01_docs_consolidation.patch` | ✅ Valid | Documentation |
| `add-gpt-system-prompt.patch` | ✅ Valid | AI prompts |
| `api-rules-contract.patch` | ✅ Valid | API contracts |
| `journal-crud-tests.patch` | ✅ Valid | Tests |
| `replay-ohlc.patch` | ✅ Valid | Feature patches |

---

## Invalid Patches

### 001_middleware_whitelist.patch.NEXTJS_ONLY

**Reason:** This patch adds Next.js middleware (`middleware.ts` at root), which requires:
- `next/server` module
- Next.js framework
- Next.js routing system

**This project uses Vite + React**, which has no concept of root-level middleware.

**If you need middleware logic:**

1. **Vite Middleware** (vite.config.ts):
   ```ts
   export default defineConfig({
     plugins: [
       {
         name: 'custom-middleware',
         configureServer(server) {
           server.middlewares.use((req, res, next) => {
             // Custom logic here
             next();
           });
         },
       },
     ],
   });
   ```

2. **Vercel Edge Middleware** (vercel.json):
   ```json
   {
     "rewrites": [
       { "source": "/api/:path*", "destination": "/api/:path*" }
     ],
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Custom-Header", "value": "value" }
         ]
       }
     ]
   }
   ```

3. **React Router Guards** (src/routes/index.tsx):
   ```tsx
   function ProtectedRoute({ children }: { children: React.ReactNode }) {
     const isAuthenticated = useAuthStatus();
     if (!isAuthenticated) {
       return <Navigate to="/login" />;
     }
     return <>{children}</>;
   }
   ```

---

## How to Apply Patches

**Valid patches** can be applied with:

```bash
# Git apply
git apply patches/002_vercel_rewrites.patch

# Or manually merge
patch -p1 < patches/002_vercel_rewrites.patch
```

**Invalid patches** should NOT be applied.

---

## Maintenance

**When adding new patches:**
1. Verify framework compatibility (Vite + React, NOT Next.js)
2. Test in local environment before committing
3. Update this README with patch status
4. Mark invalid patches with `.INVALID` or `.NEXTJS_ONLY` suffix

---

## Related

- Project framework: `.rulesync/00-project-core.md` (Vite + React)
- Deployment: `vercel.json` (Vercel config)
- Routing: `src/routes/index.tsx` (React Router)

---

**Last Updated:** 2025-11-13

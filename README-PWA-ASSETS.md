
# Sparkfined PWA Asset Pack

This folder contains production-ready assets for your PWA:

- `public/manifest.webmanifest`
- `public/offline.html`
- `public/robots.txt`
- `public/icons/*` (full icon set, maskable)
- `favicon.ico`
- `vercel.json` (SPA rewrite + security headers)

## How to integrate (Vite + React)

1. Place **`public/*`** into your project's `public/` directory.
2. Add `<link rel="manifest" href="/manifest.webmanifest">` to `index.html`.
3. Ensure a service worker is registered via **vite-plugin-pwa**:
   - `pnpm add -D vite-plugin-pwa workbox-build`
   - See the Vite config snippet in ChatGPT's message.
4. Build & deploy to Vercel.
5. In Chrome DevTools → Application → Manifest, verify `Install` is available.


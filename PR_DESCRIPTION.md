## Summary
- allow public assets (manifest, favicon, `_next` bundles) to bypass Vercel SSO using `protectionBypass`
- add explicit rewrites for static asset families so SPA catch-all no longer steals those requests
- document and automate a smoke check that verifies manifest reachability both locally and in CI

## Testing
- `pnpm run smoke:manifest` *(requires `DEPLOY_URL` to be exported in the shell)*
- `curl -I https://<preview-url>/manifest.webmanifest`
- `curl -I https://<preview-url>/_next/static/chunks/webpack.js`

## Deployment
- add the `DEPLOY_URL` GitHub Actions secret for the new workflow
- optionally set `STATIC_SAMPLE` if your static chunk path differs from `_next/static/chunks/webpack.js`

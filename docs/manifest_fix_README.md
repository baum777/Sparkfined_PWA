# Manifest & Static Asset Access Notes

## Summary

Live deployments behind Vercel SSO were returning `401` HTML for public assets such as `/manifest.webmanifest`. The fix uses Vercel's `protectionBypass` configuration together with explicit rewrites so that browser boot files skip SSO while application routes stay protected.

## Changes

- Added `protectionBypass` entries in `vercel.json` for:
  - `/manifest.webmanifest`, `/favicon.ico`, `/robots.txt`
  - `/_next/static/*`, `/_next/image/*`
  - `/static/*`, `/public/*`
- Declared explicit rewrites to re-serve the same asset path before the SPA catch-all rewrite.
- Introduced CI smoke coverage (`ci-manifest-check.yml`) plus a local helper script to detect regressions.

## Operational Guidance

1. Whenever SSO is toggled, verify that `curl -I "$DEPLOY_URL/manifest.webmanifest"` returns `200` and omits `_vercel_sso_nonce`.
2. If the build emits assets under a different prefix (for example `/_astro/`), update both the `protectionBypass` list and the workflow's `STATIC_SAMPLE`.
3. Review access logs after deployment for unexpected hits on bypassed paths to ensure no sensitive resources leaked.

## Future Considerations

- If the project migrates to Next.js middleware, implement the same whitelist logic there to short-circuit auth earlier at the edge.
- Add automated probes for `robots.txt` and other marketing assets as they are added to the public directory.

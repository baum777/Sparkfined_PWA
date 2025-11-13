# Manifest & Static Asset Smoke Test

This repository includes the workflow `.github/workflows/ci-manifest-check.yml` to ensure the public manifest and bundled static assets stay reachable without authentication on Vercel.

To enable the job:

1. In GitHub, go to `Settings → Secrets and variables → Actions`.
2. Add a repository secret named `DEPLOY_URL` that points to the production or preview deployment you want to probe (for example `https://sparkfined.vercel.app`).
3. Optionally set `STATIC_SAMPLE` in the workflow environment if your build serves a different static asset path than the default `_next/static/chunks/webpack.js`.

The job exits with failure when:

- `manifest.webmanifest` returns a non-200 status code,
- the manifest response includes a `Set-Cookie: _vercel_sso_nonce` header, or
- the sampled static asset path is blocked.

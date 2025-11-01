# scripts/verify_all.ps1
<#
.SYNOPSIS
  Full local verification helper for Sparkfined deploys.
.DESCRIPTION
  Uses verify_api.mjs and optional Playwright / Lighthouse runs.
.PARAMETER Url
  Deployment URL to verify (Preview or Prod). Alternativ: set $env:VERIFY_BASE_URL.
.PARAMETER RunE2E
  If set to 1, run Playwright smoke tests (requires Playwright installed).
.PARAMETER RunLH
  If set to 1, run LHCI autorun (requires lhci installed).
.EXAMPLE
  .\scripts\verify_all.ps1 -Url "https://my-preview.vercel.app" -RunE2E 1
#>

param(
  [string]$Url = $env:VERIFY_BASE_URL,
  [int]$RunE2E = 0,
  [int]$RunLH = 0
)

if (-not $Url) {
  Write-Error "Please provide -Url or set VERIFY_BASE_URL env var."
  exit 2
}

Write-Host "`n=== Sparkfined Deploy Verification ===`n"
Write-Host "Target URL: $Url`n"

# Ensure corepack/pnpm version
Write-Host "1) Ensure corepack & pnpm (9.12.2 recommended)"
corepack enable
corepack prepare pnpm@9.12.2 --activate
Write-Host "pnpm version: $(pnpm -v)`n"

# Install deps (try frozen-lockfile then fallback)
Write-Host "2) Installing dependencies (frozen-lockfile preferred)..."
$installExit = 0
pnpm install --frozen-lockfile
$installExit = $LASTEXITCODE
if ($installExit -ne 0) {
  Write-Warning "pnpm install --frozen-lockfile failed (code $installExit). Falling back to pnpm install (non-frozen)."
  pnpm install
  if ($LASTEXITCODE -ne 0) {
    Write-Error "pnpm install failed. Resolve lockfile issues before continuing."
    exit 3
  } else {
    Write-Warning "Installed without frozen-lockfile. Consider committing updated pnpm-lock.yaml to PR."
  }
} else {
  Write-Host "Dependencies installed (frozen)."
}

# Optional build check
Write-Host "`n3) Running local typecheck & build (smoke)"
pnpm run typecheck
if ($LASTEXITCODE -ne 0) {
  Write-Error "Typecheck failed. Fix TypeScript errors first."
  exit 4
}

pnpm build
if ($LASTEXITCODE -ne 0) {
  Write-Error "Build failed. Inspect logs."
  exit 5
}
Write-Host "Build OK.`n"

# Run verify_api.mjs
Write-Host "4) Running API & headers verification"
$env:VERIFY_BASE_URL = $Url
# skip MCAP if not desired: set $env:SKIP_MCAP = "1" if needed (uncomment next line)
# $env:SKIP_MCAP = "1"

node .\scripts\verify_api.mjs
if ($LASTEXITCODE -ne 0) {
  Write-Error "verify_api.mjs failed. See output above."
  exit 6
}
Write-Host "verify_api.mjs PASSED.`n"

# Optional: Playwright E2E
if ($RunE2E -eq 1) {
  Write-Host "5) Running Playwright smoke tests (ensure playwright installed)..."
  if (-not (Test-Path ".\tests\e2e\deploy.spec.ts")) {
    Write-Warning "E2E tests not found (tests/e2e/deploy.spec.ts). Skipping."
  } else {
    pnpm dlx playwright install --with-deps
    pnpm run verify:e2e
    if ($LASTEXITCODE -ne 0) {
      Write-Error "Playwright tests failed."
      exit 7
    }
    Write-Host "Playwright smoke PASSED.`n"
  }
}

# Optional: Lighthouse
if ($RunLH -eq 1) {
  Write-Host "6) Running LHCI quick audit (local)..."
  pnpm run verify:lh
  if ($LASTEXITCODE -ne 0) {
    Write-Warning "LHCI run returned non-zero (check LH output)."
  } else {
    Write-Host "LHCI run completed."
  }
}

Write-Host "`n=== ALL CHECKS PASSED — ready to merge if everything is green ===`n"
exit 0

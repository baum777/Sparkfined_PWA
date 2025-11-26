#!/usr/bin/env node
import fs from 'fs'
import path from 'path'
import { gzipSync } from 'zlib'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.join(__dirname, '..', 'dist', 'assets')
const TOTAL_BUDGET = 950 // KB (uncompressed), aligns with CI-Hardening plan
const TOP_N = 5

export const LIMITS = {
  'vendor-react': 115,
  'vendor-router': 40,
  'vendor-state': 20,
  'vendor-icons': 40,
  'vendor-workbox': 20,
  vendor: 120,
  index: 35,
  chartLinks: 15,
  chartTelemetry: 20,
  'vendor-ocr': 180,
  'vendor-onboarding': 90,
}

export const OPTIONAL_PATTERNS = new Set([
  'vendor-workbox',
  'vendor-icons',
  'vendor-router',
  'vendor-state',
  'vendor-ocr',
  'vendor-onboarding',
  'chartLinks',
  'chartTelemetry',
  'analyze',
])

const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

function formatKB(value) {
  return Math.round(value)
}

function gzipSizeKB(filePath) {
  const buffer = fs.readFileSync(filePath)
  const gzipped = gzipSync(buffer)
  return gzipped.length / 1024
}

function collectAssets() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`${RED}Error: dist/assets directory not found. Run 'pnpm build' first.${RESET}`)
    process.exit(1)
  }

  return fs
    .readdirSync(DIST_DIR)
    .filter((f) => f.endsWith('.js'))
    .map((file) => {
      const filePath = path.join(DIST_DIR, file)
      const stats = fs.statSync(filePath)
      return {
        file,
        path: filePath,
        sizeKB: stats.size / 1024,
        gzipKB: gzipSizeKB(filePath),
      }
    })
}

function reportTopBundles(bundles) {
  const sorted = [...bundles].sort((a, b) => b.gzipKB - a.gzipKB).slice(0, TOP_N)
  console.log(`${BOLD}Top ${TOP_N} bundles (by gzip size):${RESET}`)
  for (const bundle of sorted) {
    console.log(`  • ${bundle.file} → ${formatKB(bundle.gzipKB)}KB gzip / ${formatKB(bundle.sizeKB)}KB raw`)
  }
  console.log()
}

function checkBundleSizes() {
  const bundles = collectAssets()
  const matchedFiles = new Set()

  console.log(`${BOLD}📦 Bundle Size Check${RESET}\n`)
  console.log(`Checking ${bundles.length} JavaScript files in dist/assets/\n`)

  const failures = []
  const warnings = []
  const passes = []
  const missing = []

  for (const [pattern, threshold] of Object.entries(LIMITS)) {
    const matchingBundles = bundles.filter((bundle) => {
      const matches = bundle.file.includes(pattern)
      if (!matches) return false
      if (pattern === 'vendor' && matchedFiles.has(bundle.file)) return false
      return true
    })

    if (matchingBundles.length === 0) {
      if (OPTIONAL_PATTERNS.has(pattern)) {
        warnings.push(`${YELLOW}⚠️  Optional chunk missing: ${pattern} (expected only if feature is enabled)${RESET}`)
      } else {
        missing.push(`${RED}✗ Required chunk pattern not found: ${pattern}${RESET}`)
      }
      continue
    }

    for (const bundle of matchingBundles) {
      matchedFiles.add(bundle.file)
      const percent = Math.round((bundle.gzipKB / threshold) * 100)
      const details = {
        file: bundle.file,
        gzipKB: formatKB(bundle.gzipKB),
        rawKB: formatKB(bundle.sizeKB),
        threshold,
        percent,
      }

      if (bundle.gzipKB > threshold) {
        failures.push(details)
      } else if (percent >= 90) {
        warnings.push(details)
      } else {
        passes.push(details)
      }
    }
  }

  if (passes.length > 0) {
    console.log(`${GREEN}${BOLD}✓ Passed (${passes.length})${RESET}`)
    for (const p of passes) {
      console.log(`  ${GREEN}✓${RESET} ${p.file}: ${p.gzipKB}KB gzip / ${p.threshold}KB limit (${p.percent}%)`)
    }
    console.log()
  }

  if (warnings.length > 0) {
    console.log(`${YELLOW}${BOLD}⚠ Warnings (${warnings.length})${RESET}`)
    for (const w of warnings) {
      if (typeof w === 'string') {
        console.log(`  ${w}`)
        continue
      }
      console.log(
        `  ${YELLOW}⚠${RESET} ${w.file}: ${w.gzipKB}KB gzip / ${w.threshold}KB limit (${w.percent}%) - approaching limit`
      )
    }
    console.log()
  }

  if (missing.length > 0) {
    console.log(`${RED}${BOLD}Missing required patterns (${missing.length})${RESET}`)
    missing.forEach((msg) => console.log(`  ${msg}`))
    console.log()
  }

  if (failures.length > 0) {
    console.log(`${RED}${BOLD}✗ Failures (${failures.length})${RESET}`)
    for (const f of failures) {
      console.log(`  ${RED}✗${RESET} ${f.file}: ${f.gzipKB}KB gzip / ${f.threshold}KB limit (${f.percent}%)`)
    }
    console.log()
    reportTopBundles(bundles)
    console.log(`${RED}${BOLD}Bundle size check failed!${RESET}`)
    console.log(`${RED}Tip: Run 'pnpm analyze' to see what's causing bundle bloat.${RESET}\n`)
    process.exit(1)
  }

  const totalKB = bundles.reduce((acc, bundle) => acc + bundle.sizeKB, 0)
  const totalPercent = Math.round((totalKB / TOTAL_BUDGET) * 100)

  console.log(`${BOLD}📊 Total Bundle Size${RESET}`)
  if (totalKB > TOTAL_BUDGET) {
    console.log(`  ${RED}✗${RESET} Total: ${formatKB(totalKB)}KB / ${TOTAL_BUDGET}KB (${totalPercent}%) - EXCEEDS BUDGET`)
    reportTopBundles(bundles)
    process.exit(1)
  } else if (totalPercent >= 90) {
    console.log(`  ${YELLOW}⚠${RESET} Total: ${formatKB(totalKB)}KB / ${TOTAL_BUDGET}KB (${totalPercent}%) - approaching limit`)
  } else {
    console.log(`  ${GREEN}✓${RESET} Total: ${formatKB(totalKB)}KB / ${TOTAL_BUDGET}KB (${totalPercent}%)`)
  }

  console.log()
  reportTopBundles(bundles)
  console.log(`${GREEN}${BOLD}✓ All bundles within size limits!${RESET}\n`)
  process.exit(0)
}

checkBundleSizes()

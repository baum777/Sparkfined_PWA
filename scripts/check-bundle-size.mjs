#!/usr/bin/env node
/**
 * Bundle Size Check Script
 * Verifies that bundle sizes are within defined thresholds
 * Exit code 1 if any bundle exceeds threshold
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DIST_DIR = path.join(__dirname, '..', 'dist', 'assets')
const INDEX_HTML = path.join(__dirname, '..', 'dist', 'index.html')
const SW_FILE = path.join(__dirname, '..', 'dist', 'sw.js')

// Size thresholds (in KB, gzipped approximation)
// IMPORTANT: Order matters - more specific patterns first!
// Updated 2025-12-06: Optimized vendor splitting + improved code splitting
const THRESHOLDS = {
  // === VENDOR CHUNKS ===

  // React + ReactDOM + Scheduler + React-Router
  // Current: ~55KB gzipped, allow headroom for React 19
  'vendor-react': 115,

  // Dexie (IndexedDB wrapper)
  // Current: ~27KB gzipped, Dexie is ~26KB - cannot reduce
  'vendor-dexie': 30,

  // Lucide Icons - Isolated for better caching
  // Estimated: ~15KB gzipped (tree-shaken)
  'vendor-icons': 20,

  // Charting stack (lightweight-charts + fancy-canvas)
  // Heavy but lazy-loaded; keep headroom for visual features without blocking main shell
  'vendor-charts': 60,

  // Zustand (State management)
  // Estimated: ~3KB gzipped
  'vendor-state': 5,

  // Tesseract.js (OCR) - Heavy library, isolated for lazy loading
  // Used only in SettingsPage (OCR scan feature)
  // Estimated: 25-30KB gzipped (lazy-loaded)
  'vendor-ocr': 35,

  // Driver.js (Onboarding tour) - Isolated for lazy loading
  // Used only when user starts onboarding
  // Estimated: 15-20KB gzipped (lazy-loaded)
  'vendor-onboarding': 25,

  // === APP CHUNKS ===

  // Main app shell (routing, layout, offline chrome, dashboard tiles)
  // Current: ~23KB gzipped, reduced after deferring imports
  index: 30,

  // Analysis Page (token research + AI affordances)
  // Current: ~8KB gzipped
  // FIXED: Pattern was 'analyze', actual chunk is 'AnalysisPage'
  AnalysisPage: 15,

  // Chart-related app code (not the library itself!)
  // Current: ~6KB (chartTelemetry) + 0.3KB (chartLinks)
  chartTelemetry: 15,
  chartLinks: 5,

  // AI-related code (OpenAI SDK, AI insights service, prompt builders)
  // Lazy-loaded when AI features are used (Journal insights, Analysis AI features)
  // Current: ~19KB gzipped (includes OpenAI SDK ~15KB + our AI wrappers)
  'chunk-ai': 25,

  // Journal components chunk (form inputs, panels, dialogs)
  // Lazy-loaded with JournalPage
  // Current: ~9KB gzipped
  'chunk-journal-components': 12,
}

// Chunks that may not exist in all builds (don't fail if missing)
const OPTIONAL_CHUNKS = [
  'vendor-ocr', // Only if OCR feature is imported
  'vendor-onboarding', // Only if onboarding tour is imported
  'vendor-icons', // Icons chunk (may be bundled differently)
  'vendor-state', // State management chunk (may be bundled differently)
  'chartLinks', // Only if chart links exist
  'chunk-chart', // App code split (may be bundled with page)
  'chunk-analyze', // App code split (may be bundled with page)
  'chunk-signals', // App code split (may be bundled with page)
]

const INITIAL_BUDGET_KB = 360 // Landing/Dashboard initial payload (raw KB)
const CHART_ROUTE_BUDGET_KB = 240 // Chart route payload (raw KB)
const PRECACHE_BUDGET_KB = 1800 // PWA precache payload (raw KB)

const INITIAL_PATTERNS = [
  'index-',
  'vendor-react',
  'vendor-dexie',
  'vendor-icons',
  'DashboardPage',
  'DashboardShell',
  'AlertCreateDialog',
  'tradeEventJournalBridge',
  'connectedWallets',
  'moralisProxy',
]

const CHART_PATTERNS = ['ChartPage', 'vendor-charts', 'chartTelemetry', 'chartLinks', 'ReplayPage']

// ANSI color codes
const RED = '\x1b[31m'
const GREEN = '\x1b[32m'
const YELLOW = '\x1b[33m'
const BLUE = '\x1b[34m'
const RESET = '\x1b[0m'
const BOLD = '\x1b[1m'

function getGzipSize(filePath) {
  try {
    const stats = fs.statSync(filePath)
    // Estimate gzip size as ~30% of uncompressed (rough approximation)
    // For accurate size, would need to actually gzip the file
    return Math.round((stats.size * 0.3) / 1024) // Convert to KB
  } catch (error) {
    return 0
  }
}

function getRawSizeKB(filePath) {
  try {
    const stats = fs.statSync(filePath)
    return Math.round(stats.size / 1024)
  } catch (error) {
    return 0
  }
}

function getModulePreloadAssets() {
  if (!fs.existsSync(INDEX_HTML)) return []
  const html = fs.readFileSync(INDEX_HTML, 'utf8')
  const regex = /rel="modulepreload"[^>]*href="\/?([^"?#]+)"/g
  const assets = new Set()
  let match
  while ((match = regex.exec(html))) {
    const cleaned = match[1].replace(/^\//, '')
    if (cleaned.endsWith('.js')) assets.add(path.basename(cleaned))
  }
  return Array.from(assets)
}

function collectByPatterns(files, patterns) {
  return files.filter((f) => patterns.some((pattern) => f.includes(pattern)))
}

function readPrecacheEntries() {
  if (!fs.existsSync(SW_FILE)) return []
  const sw = fs.readFileSync(SW_FILE, 'utf8')
  const match =
    sw.match(/self.__WB_MANIFEST\s*=\s*(\[[^;]+\])/) ||
    sw.match(/precacheAndRoute\((\[[^)]*\])/)
  if (!match) return []
  try {
    const normalized = match[1]
      .replace(/([{,])url:/g, '$1"url":')
      .replace(/([{,])revision:/g, '$1"revision":')
    return JSON.parse(normalized)
  } catch (error) {
    console.warn(`${YELLOW}⚠️  Failed to parse precache manifest: ${error}${RESET}`)
    return []
  }
}

function sumSizes(files) {
  return files.reduce((total, file) => total + getRawSizeKB(path.join(DIST_DIR, file)), 0)
}

function logBudget(label, sizeKB, budgetKB) {
  const percent = budgetKB === 0 ? 0 : Math.round((sizeKB / budgetKB) * 100)
  const icon = sizeKB > budgetKB ? `${RED}✗${RESET}` : sizeKB > budgetKB * 0.9 ? `${YELLOW}⚠${RESET}` : `${GREEN}✓${RESET}`
  console.log(`  ${icon} ${label}: ${sizeKB}KB / ${budgetKB}KB (${percent}%)`)
  return sizeKB > budgetKB
}

function checkBundleSizes() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`${RED}Error: dist/assets directory not found. Run 'pnpm build' first.${RESET}`)
    process.exit(1)
  }

  const files = fs.readdirSync(DIST_DIR).filter((f) => f.endsWith('.js'))

  let failures = []
  let warnings = []
  let passes = []

  console.log(`${BOLD}📦 Bundle Size Check${RESET}\n`)
  console.log(`Checking ${files.length} JavaScript files in dist/assets/\n`)

  // Track which files have been checked to avoid duplicates
  const checkedFiles = new Set()

  for (const [pattern, threshold] of Object.entries(THRESHOLDS)) {
    const matchingFiles = files.filter((f) => f.includes(pattern) && !checkedFiles.has(f))

    if (matchingFiles.length === 0) {
      // Check if this is an optional chunk
      if (OPTIONAL_CHUNKS.includes(pattern)) {
        console.log(`${BLUE}ℹ️  Optional chunk "${pattern}" not found (this is OK)${RESET}`)
        continue
      }

      // Required chunk missing - warning (not hard fail yet)
      warnings.push(`${YELLOW}⚠️  No files found matching pattern "${pattern}"${RESET}`)
      continue
    }

    for (const file of matchingFiles) {
      checkedFiles.add(file)
      const filePath = path.join(DIST_DIR, file)
      const sizeKB = getGzipSize(filePath)
      const percentOfThreshold = Math.round((sizeKB / threshold) * 100)

      const result = {
        file,
        sizeKB,
        threshold,
        percentOfThreshold,
        pattern,
      }

      if (sizeKB > threshold) {
        failures.push(result)
      } else if (percentOfThreshold > 90) {
        warnings.push(result)
      } else {
        passes.push(result)
      }
    }
  }

  // Print results
  if (passes.length > 0) {
    console.log(`${GREEN}${BOLD}✓ Passed (${passes.length})${RESET}`)
    for (const p of passes) {
      console.log(`  ${GREEN}✓${RESET} ${p.file}: ${p.sizeKB}KB / ${p.threshold}KB (${p.percentOfThreshold}%)`)
    }
    console.log()
  }

  if (warnings.length > 0) {
    console.log(`${YELLOW}${BOLD}⚠ Warnings (${warnings.length})${RESET}`)
    for (const w of warnings) {
      if (typeof w === 'string') {
        console.log(`  ${w}`)
      } else {
        console.log(`  ${YELLOW}⚠${RESET} ${w.file}: ${w.sizeKB}KB / ${w.threshold}KB (${w.percentOfThreshold}%) - approaching limit`)
      }
    }
    console.log()
  }

  if (failures.length > 0) {
    console.log(`${RED}${BOLD}✗ Failures (${failures.length})${RESET}`)
    for (const f of failures) {
      console.log(`  ${RED}✗${RESET} ${f.file}: ${f.sizeKB}KB / ${f.threshold}KB (${f.percentOfThreshold}%) - EXCEEDS THRESHOLD`)
    }
    console.log()
    console.log(`${RED}${BOLD}Bundle size check failed!${RESET}`)
    console.log(`${RED}Tip: Run 'pnpm analyze' to see what's causing bundle bloat.${RESET}\n`)
    process.exit(1)
  }

  // --- Budget checks (raw KB) ---
  console.log(`${BOLD}📊 Budget Checks${RESET}`)
  const preloadAssets = getModulePreloadAssets()
  const initialAssets = new Set([
    ...preloadAssets,
    ...collectByPatterns(files, INITIAL_PATTERNS),
  ])
  const initialSizeKB = sumSizes(Array.from(initialAssets))

  const chartAssets = collectByPatterns(files, CHART_PATTERNS)
  const chartSizeKB = sumSizes(chartAssets)

  const precacheEntries = readPrecacheEntries()
  const precacheSizeKB = precacheEntries.reduce((total, entry) => {
    const url = entry.url?.replace(/^\//, '')
    if (!url) return total
    const fileName = path.basename(url)
    const filePath = path.join(DIST_DIR, fileName)
    if (!fs.existsSync(filePath)) return total
    return total + getRawSizeKB(filePath)
  }, 0)

  const budgetFailures = []
  if (logBudget('Initial JS (landing)', initialSizeKB, INITIAL_BUDGET_KB)) {
    budgetFailures.push('initial')
  }
  if (logBudget('Route JS (chart)', chartSizeKB, CHART_ROUTE_BUDGET_KB)) {
    budgetFailures.push('chart')
  }
  if (logBudget('PWA Precache (raw)', precacheSizeKB, PRECACHE_BUDGET_KB)) {
    budgetFailures.push('precache')
  }

  if (budgetFailures.length > 0) {
    console.log()
    console.log(`${RED}${BOLD}Budget check failed for: ${budgetFailures.join(', ')}${RESET}`)
    process.exit(1)
  }

  console.log(`\n${GREEN}${BOLD}✓ All bundles within size limits!${RESET}\n`)
  process.exit(0)
}

checkBundleSizes()

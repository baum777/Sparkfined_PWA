#!/usr/bin/env node
/**
 * Bundle Size Check Script
 * Verifies that bundle sizes are within defined thresholds
 * Exit code 1 if any bundle exceeds threshold
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist', 'assets');

// Size thresholds (in KB, gzipped)
// IMPORTANT: Order matters - more specific patterns first!
// Updated 2025-11-26: Granular vendor splitting (ocr, onboarding) + optional chunks
const THRESHOLDS = {
  // === VENDOR CHUNKS ===
  
  // React + ReactDOM + Scheduler + React-Router
  // Current: ~55KB gzipped, allow headroom for React 19
  'vendor-react': 115,

  // Dexie (IndexedDB wrapper)
  // Current: ~27KB gzipped, Dexie is ~26KB - cannot reduce
  'vendor-dexie': 30,
  
  // Generic vendor (Zustand, Lucide-Icons, etc.)
  // Current: ~50KB gzipped (stable, Tesseract/Driver.js already lazy-loaded)
  // Includes: Zustand (~3KB), Lucide-React (~15KB), misc utilities
  'vendor': 56,
  
  // Tesseract.js (OCR) - NEW, isolated for lazy loading
  // Estimated: 25-30KB gzipped (lazy-loaded)
  'vendor-ocr': 35,
  
  // Driver.js (Onboarding tour) - NEW, isolated for lazy loading
  // Estimated: 15-20KB gzipped (lazy-loaded)
  'vendor-onboarding': 25,
  
  // === APP CHUNKS ===
  
  // Main app shell (routing, layout, offline chrome, dashboard tiles)
  // Current: ~23KB gzipped
  'index': 35,
  
  // Analysis Page (token research + AI affordances)
  // Current: ~8KB gzipped
  // FIXED: Pattern was 'analyze', actual chunk is 'AnalysisPageV2'
  'AnalysisPageV2': 15,
  
  // Chart-related app code (not the library itself!)
  // Current: ~6KB (chartTelemetry) + 0.3KB (chartLinks)
  'chartTelemetry': 15,
  'chartLinks': 5,
};

// Chunks that may not exist in all builds (don't fail if missing)
const OPTIONAL_CHUNKS = [
  'vendor-ocr',         // Only if OCR feature is imported
  'vendor-onboarding',  // Only if onboarding tour is imported
  'chartLinks',         // Only if chart links exist
  'chunk-chart',        // App code split (may be bundled with page)
  'chunk-analyze',      // App code split (may be bundled with page)
  'chunk-signals',      // App code split (may be bundled with page)
];

// Global JS budget (uncompressed) for initial + critical chunks.
// Updated 2025-11-26: Guardrail mode (current ~703KB + ~12% headroom)
const TOTAL_BUDGET_KB = 800;

// ANSI color codes
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';

function getGzipSize(filePath) {
  try {
    const stats = fs.statSync(filePath);
    // Estimate gzip size as ~30% of uncompressed (rough approximation)
    // For accurate size, would need to actually gzip the file
    return Math.round(stats.size * 0.3 / 1024); // Convert to KB
  } catch (error) {
    return 0;
  }
}

function checkBundleSizes() {
  if (!fs.existsSync(DIST_DIR)) {
    console.error(`${RED}Error: dist/assets directory not found. Run 'pnpm build' first.${RESET}`);
    process.exit(1);
  }

  const files = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.js'));
  
  let failures = [];
  let warnings = [];
  let passes = [];

  console.log(`${BOLD}📦 Bundle Size Check${RESET}\n`);
  console.log(`Checking ${files.length} JavaScript files in dist/assets/\n`);

  // Track which files have been checked to avoid duplicates
  const checkedFiles = new Set();

  for (const [pattern, threshold] of Object.entries(THRESHOLDS)) {
    const matchingFiles = files.filter(f => f.includes(pattern) && !checkedFiles.has(f));
    
    if (matchingFiles.length === 0) {
      // Check if this is an optional chunk
      if (OPTIONAL_CHUNKS.includes(pattern)) {
        console.log(`${BLUE}ℹ️  Optional chunk "${pattern}" not found (this is OK)${RESET}`);
        continue;
      }
      
      // Required chunk missing - warning (not hard fail yet)
      warnings.push(`${YELLOW}⚠️  No files found matching pattern "${pattern}"${RESET}`);
      continue;
    }

    for (const file of matchingFiles) {
      checkedFiles.add(file);
      const filePath = path.join(DIST_DIR, file);
      const sizeKB = getGzipSize(filePath);
      const percentOfThreshold = Math.round((sizeKB / threshold) * 100);

      const result = {
        file,
        sizeKB,
        threshold,
        percentOfThreshold,
        pattern
      };

      if (sizeKB > threshold) {
        failures.push(result);
      } else if (percentOfThreshold > 90) {
        warnings.push(result);
      } else {
        passes.push(result);
      }
    }
  }

  // Print results
  if (passes.length > 0) {
    console.log(`${GREEN}${BOLD}✓ Passed (${passes.length})${RESET}`);
    for (const p of passes) {
      console.log(`  ${GREEN}✓${RESET} ${p.file}: ${p.sizeKB}KB / ${p.threshold}KB (${p.percentOfThreshold}%)`);
    }
    console.log();
  }

  if (warnings.length > 0) {
    console.log(`${YELLOW}${BOLD}⚠ Warnings (${warnings.length})${RESET}`);
    for (const w of warnings) {
      if (typeof w === 'string') {
        console.log(`  ${w}`);
      } else {
        console.log(`  ${YELLOW}⚠${RESET} ${w.file}: ${w.sizeKB}KB / ${w.threshold}KB (${w.percentOfThreshold}%) - approaching limit`);
      }
    }
    console.log();
  }

  if (failures.length > 0) {
    console.log(`${RED}${BOLD}✗ Failures (${failures.length})${RESET}`);
    for (const f of failures) {
      console.log(`  ${RED}✗${RESET} ${f.file}: ${f.sizeKB}KB / ${f.threshold}KB (${f.percentOfThreshold}%) - EXCEEDS THRESHOLD`);
    }
    console.log();
    console.log(`${RED}${BOLD}Bundle size check failed!${RESET}`);
    console.log(`${RED}Tip: Run 'pnpm analyze' to see what's causing bundle bloat.${RESET}\n`);
    process.exit(1);
  }

  // Check total bundle size (uncompressed)
  console.log(`${BOLD}📊 Total Bundle Size${RESET}`);
  let totalSizeKB = 0;
  for (const file of files) {
    const filePath = path.join(DIST_DIR, file);
    const stats = fs.statSync(filePath);
    totalSizeKB += Math.round(stats.size / 1024);
  }

  const totalPercent = Math.round((totalSizeKB / TOTAL_BUDGET_KB) * 100);

  if (totalSizeKB > TOTAL_BUDGET_KB) {
    console.log(`  ${RED}✗${RESET} Total: ${totalSizeKB}KB / ${TOTAL_BUDGET_KB}KB (${totalPercent}%) - EXCEEDS BUDGET`);
    console.log(`\n${RED}${BOLD}Total bundle size exceeds budget!${RESET}`);
    console.log(`${RED}Tip: Run 'pnpm analyze' to identify large dependencies.${RESET}\n`);
    process.exit(1);
  } else if (totalPercent > 90) {
    console.log(`  ${YELLOW}⚠${RESET} Total: ${totalSizeKB}KB / ${TOTAL_BUDGET_KB}KB (${totalPercent}%) - approaching limit`);
  } else {
    console.log(`  ${GREEN}✓${RESET} Total: ${totalSizeKB}KB / ${TOTAL_BUDGET_KB}KB (${totalPercent}%)`);
  }

  console.log(`\n${GREEN}${BOLD}✓ All bundles within size limits!${RESET}\n`);
  process.exit(0);
}

checkBundleSizes();

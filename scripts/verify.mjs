#!/usr/bin/env node

/**
 * Lightweight post-deploy verification.
 *
 * Usage:
 *   VERIFY_BASE=https://preview-or-prod.example.com \
 *   VITE_APP_VERSION=1.0.0 \
 *   VITE_MORALIS_API_KEY=demo \
 *   pnpm run verify
 */

import { exec as _exec } from 'node:child_process'
import { promisify } from 'node:util'

const exec = promisify(_exec)

const rawBase = process.env.VERIFY_BASE?.trim()
if (!rawBase) {
  console.error('❌ VERIFY_BASE is required, e.g. https://sparkfined.vercel.app')
  process.exit(1)
}

const BASE = rawBase.replace(/\/+$/, '')

const heading = (title) => console.log(`\n# ${title}`)
let hasFailures = false

async function run(cmd, { required = true } = {}) {
  console.log(`\n$ ${cmd}`)
  try {
    const { stdout, stderr } = await exec(cmd)
    if (stdout) process.stdout.write(stdout)
    if (stderr) process.stderr.write(stderr)
    return true
  } catch (error) {
    const output = error.stdout || error.stderr || error.message
    if (output) process.stderr.write(String(output))
    if (required) {
      hasFailures = true
    }
    return false
  }
}

// 1) Router package versions
heading('Router versions (react-router-dom / react-router)')
await run('pnpm ls react-router-dom react-router --depth 0', { required: false })

// 2) Manifest availability & MIME type
heading('Manifest reachable with correct MIME type')
try {
  const response = await fetch(`${BASE}/manifest.webmanifest`, { redirect: 'manual' })
  console.log('HTTP Status:', response.status)
  const contentType = response.headers.get('content-type') || ''
  console.log('Content-Type:', contentType || '(none)')

  if (response.status !== 200) {
    console.error('❌ manifest.webmanifest did not return HTTP 200')
    hasFailures = true
  }
  if (!contentType.includes('application/manifest+json')) {
    console.error('❌ manifest content-type is not application/manifest+json')
    hasFailures = true
  }
} catch (error) {
  console.error('❌ Failed to fetch manifest:', error.message)
  hasFailures = true
}

// 3) Build gate simulation (optional if env vars are provided)
heading('Build gate simulation (prebuild)')
const { VITE_APP_VERSION, VITE_MORALIS_API_KEY } = process.env
if (!VITE_APP_VERSION || !VITE_MORALIS_API_KEY) {
  console.warn('⚠️ Set VITE_APP_VERSION and VITE_MORALIS_API_KEY to fully exercise the build gate.')
} else {
  await run('pnpm build')
}

console.log(`\n${hasFailures ? '❌ VERIFY FAILED' : '✅ VERIFY PASSED'}`)
process.exit(hasFailures ? 1 : 0)


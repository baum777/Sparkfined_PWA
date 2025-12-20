#!/usr/bin/env node
/*
 * Environment configuration validator
 * Ensures server-only secrets are available before builds run.
 */

import { loadEnv } from 'vite'

const REQUIRED_SERVER_VARS = ['MORALIS_API_KEY']
const DISALLOWED_CLIENT_PREFIX = 'VITE_MORALIS_API_KEY'

const isCI = process.env.CI === 'true'
const nodeEnv = process.env.NODE_ENV || 'development'
const mode = process.env.MODE || nodeEnv
const isProd = nodeEnv === 'production'
const strictMode = isCI || isProd

const loadedEnv = loadEnv(mode, process.cwd(), '')
for (const [key, value] of Object.entries(loadedEnv)) {
  if (!process.env[key] && value) {
    process.env[key] = value
  }
}

const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key])
const leaked = Object.keys(process.env).filter(
  (key) => key.startsWith(DISALLOWED_CLIENT_PREFIX) && process.env[key]
)

if (leaked.length > 0) {
  console.error(
    `[security] Remove client-prefixed Moralis secrets before building: ${leaked.join(
      ', '
    )} (server-only MORALIS_API_KEY is required).`
  )
  process.exit(2)
}

if (missing.length > 0) {
  const message = `Missing required server env vars: ${missing.join(', ')}`
  if (strictMode) {
    console.error(`[env] ${message} — failing build (CI/production context detected).`)
    process.exit(2)
  } else {
    console.log('[env] Optional server env vars not set for local build; continuing without warnings.')
  }
} else {
  console.log('[env] All required server env vars present.')
}

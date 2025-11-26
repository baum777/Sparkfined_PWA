#!/usr/bin/env node
/*
 * Environment configuration validator
 * Ensures server-only secrets are available before builds run.
 */

const REQUIRED_SERVER_VARS = ['MORALIS_API_KEY']
const DISALLOWED_CLIENT_PREFIX = 'VITE_MORALIS_API_KEY'

const isCI = process.env.CI === 'true'
const nodeEnv = process.env.NODE_ENV || 'development'
const isProd = nodeEnv === 'production'
const strictMode = isCI || isProd

const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key])
const leaked = Object.keys(process.env).filter((key) => key.startsWith(DISALLOWED_CLIENT_PREFIX) && process.env[key])

if (leaked.length > 0) {
  console.error(
    `[security] Remove client-prefixed Moralis secrets: ${leaked.join(
      ', '
    )}. Use MORALIS_API_KEY as a server-side GitHub Action secret instead.`
  )
  process.exit(2)
}

if (missing.length > 0) {
  const message = `Missing required server env vars: ${missing.join(', ')}`
  if (strictMode) {
    console.error(
      `[env] ${message}. In CI set MORALIS_API_KEY (server secret) and delete any VITE_MORALIS_API_KEY GitHub Secret to avoid client exposure.`
    )
    process.exit(2)
  } else {
    console.warn(`[env] ${message}. Local build will continue, but Moralis-backed endpoints will fail at runtime.`)
    console.warn('Set MORALIS_API_KEY in .env.local; never expose VITE_MORALIS_API_KEY in client configs or GitHub Secrets.')
  }
} else {
  console.log('[env] All required server env vars present.')
}

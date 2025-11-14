#!/usr/bin/env node
/*
 * Environment configuration validator
 * Ensures server-only secrets are available before builds run.
 */

const REQUIRED_SERVER_VARS = ['MORALIS_API_KEY']
const DISALLOWED_CLIENT_VARS = ['VITE_MORALIS_API_KEY']

const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key])
const leaked = DISALLOWED_CLIENT_VARS.filter((key) => process.env[key])
const isCiLike = process.env.CI === 'true' || process.env.VERCEL === '1'

if (missing.length > 0) {
  const message = `Missing required server env vars: ${missing.join(', ')}`
  if (isCiLike) {
    console.error(message)
  } else {
    console.warn(`${message}. Skipping hard failure locally (set these in .env).`)
  }
}

if (leaked.length > 0) {
  console.error(
    `Remove client-prefixed secrets before building: ${leaked.join(', ')} (use MORALIS_API_KEY instead)`
  )
}

const shouldFail =
  leaked.length > 0 ||
  (missing.length > 0 && isCiLike)

if (shouldFail) {
  process.exitCode = 2
} else {
  console.log('Environment validation passed.')
}

#!/usr/bin/env node
/*
 * Environment configuration validator
 * Ensures server-only secrets are available before builds run.
 */

const REQUIRED_SERVER_VARS = ['MORALIS_API_KEY']
const DISALLOWED_CLIENT_VARS = ['VITE_MORALIS_API_KEY']

const missing = REQUIRED_SERVER_VARS.filter((key) => !process.env[key])
const leaked = DISALLOWED_CLIENT_VARS.filter((key) => process.env[key])

if (missing.length > 0) {
  console.error(`Missing required server env vars: ${missing.join(', ')}`)
}

if (leaked.length > 0) {
  console.error(
    `Remove client-prefixed secrets before building: ${leaked.join(', ')} (use MORALIS_API_KEY instead)`
  )
}

if (missing.length > 0 || leaked.length > 0) {
  process.exitCode = 2
} else {
  console.log('All required server env vars present.')
}

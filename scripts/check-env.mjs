#!/usr/bin/env node

/**
 * Simple env guard to fail fast when required build variables are missing.
 * Extend the `required` array as new critical variables are introduced.
 */

const required = ['VITE_APP_VERSION', 'VITE_MORALIS_API_KEY']

const missing = required.filter((key) => {
  const value = process.env[key]
  return !value || String(value).trim().length === 0
})

if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing.join(', '))
  process.exit(1)
}

console.log('✅ Environment variables check passed')

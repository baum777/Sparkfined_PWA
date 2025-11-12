#!/usr/bin/env bash
set -euo pipefail

BASE_URL=${1:-http://localhost:3000}

echo "Checking health: ${BASE_URL}/api/health"
curl -sf "${BASE_URL}/api/health" >/dev/null || {
  echo 'Health check failed'
  exit 2
}

echo "Checking Moralis proxy health: ${BASE_URL}/api/moralis/health"
if [ "${DEV_USE_MOCKS:-false}" = "true" ]; then
  echo 'DEV_USE_MOCKS=true → skipping live Moralis call'
else
  curl -sf "${BASE_URL}/api/moralis/health" >/dev/null || {
    echo 'Moralis proxy health check failed'
    exit 3
  }
fi

echo 'Smoke checks passed'

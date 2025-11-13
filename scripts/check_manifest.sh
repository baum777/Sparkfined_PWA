#!/usr/bin/env bash

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Usage: $0 <deploy-url>"
  exit 1
fi

url="${1%/}"

manifest_status=$(curl -s -o /dev/null -w "%{http_code}" "$url/manifest.webmanifest")
echo "manifest status: $manifest_status"

if [ "$manifest_status" != "200" ]; then
  echo "manifest.webmanifest not reachable (status $manifest_status)"
  exit 1
fi

static_sample="${2:-_next/static/chunks/webpack.js}"
static_status=$(curl -s -o /dev/null -w "%{http_code}" "$url/${static_sample#/}")
echo "static sample ($static_sample) status: $static_status"

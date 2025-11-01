#!/bin/bash
# API Health Check Script for Sparkfined Access MVP
# Usage: ./scripts/api-health-check.sh https://sparkfined-xyz.vercel.app

set -e

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get base URL from argument or default to localhost
BASE_URL="${1:-http://localhost:5173}"

echo "🔍 Sparkfined API Health Check"
echo "================================"
echo "Base URL: $BASE_URL"
echo ""

# Test wallet (devnet)
TEST_WALLET="HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH"

# Function to test endpoint
test_endpoint() {
  local name="$1"
  local method="$2"
  local endpoint="$3"
  local data="$4"
  local expected_status="$5"
  
  echo -n "Testing $name... "
  
  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" \
      -H "Content-Type: application/json" \
      -d "$data" \
      "$BASE_URL$endpoint")
  fi
  
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)
  
  if [ "$status_code" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (HTTP $status_code)"
    echo "  Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body)"
  else
    echo -e "${RED}✗ FAIL${NC} (Expected $expected_status, got $status_code)"
    echo "  Response: $(echo $body | jq -c '.' 2>/dev/null || echo $body)"
    return 1
  fi
}

echo "📡 Testing API Endpoints"
echo "-------------------------"

# Test 1: Access Status
test_endpoint \
  "Access Status (GET)" \
  "GET" \
  "/api/access/status?wallet=$TEST_WALLET" \
  "" \
  "200"

echo ""

# Test 2: Lock Registration (will create lock)
test_endpoint \
  "Lock Registration (POST)" \
  "POST" \
  "/api/access/lock" \
  "{\"wallet\":\"$TEST_WALLET\",\"amount\":4620000}" \
  "200"

echo ""

# Test 3: Access Status Again (should show lock)
echo "Re-testing Access Status (should have lock now)..."
test_endpoint \
  "Access Status After Lock (GET)" \
  "GET" \
  "/api/access/status?wallet=$TEST_WALLET" \
  "" \
  "200"

echo ""
echo "================================"
echo -e "${GREEN}✓ All tests passed!${NC}"
echo ""
echo "💡 Next steps:"
echo "1. Check if rank was assigned correctly"
echo "2. Test NFT mint (if rank ≤ 333)"
echo "3. Verify status updates in UI (/access)"

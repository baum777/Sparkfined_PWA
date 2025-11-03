#!/bin/bash
# Vercel Production Health Check Script
# Usage: ./scripts/vercel-health-check.sh [DEPLOYMENT_URL]

DEPLOYMENT_URL="${1:-http://localhost:4173}"
BOLD='\033[1m'
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BOLD}=== Vercel Deployment Health Check ===${NC}\n"
echo -e "Target: ${DEPLOYMENT_URL}\n"

# Function to test endpoint
test_endpoint() {
    local name=$1
    local path=$2
    local expected_status=${3:-200}
    
    echo -n "Testing ${name}... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}${path}")
    
    if [ "$response" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ OK${NC} (HTTP $response)"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $response, expected $expected_status)"
        return 1
    fi
}

# Function to test API with JSON response
test_api_json() {
    local name=$1
    local path=$2
    
    echo -n "Testing ${name}... "
    
    response=$(curl -s "${DEPLOYMENT_URL}${path}")
    http_code=$(curl -s -o /dev/null -w "%{http_code}" "${DEPLOYMENT_URL}${path}")
    
    if [ "$http_code" -eq 200 ]; then
        if echo "$response" | jq empty 2>/dev/null; then
            echo -e "${GREEN}✓ OK${NC} (Valid JSON)"
            echo "$response" | jq '.' | head -10
            return 0
        else
            echo -e "${YELLOW}⚠ WARNING${NC} (Invalid JSON response)"
            return 1
        fi
    else
        echo -e "${RED}✗ FAILED${NC} (HTTP $http_code)"
        return 1
    fi
}

echo -e "${BOLD}1. Frontend Routes${NC}"
test_endpoint "Homepage" "/" 200
test_endpoint "Chart Page" "/chart" 200
test_endpoint "Journal Page" "/journal" 200
test_endpoint "Analyze Page" "/analyze" 200
test_endpoint "Notifications Page" "/notifications" 200
echo ""

echo -e "${BOLD}2. API Health Endpoints${NC}"
test_api_json "Health Check" "/api/health"
echo ""

echo -e "${BOLD}3. Critical API Endpoints${NC}"
test_endpoint "OHLC API" "/api/data/ohlc?address=test&tf=15m" 200
test_endpoint "Prices API" "/api/prices" 200
test_endpoint "Rules API (GET)" "/api/rules" 200
test_endpoint "Journal API (GET)" "/api/journal" 200
echo ""

echo -e "${BOLD}4. Static Assets${NC}"
test_endpoint "Manifest" "/manifest.webmanifest" 200
test_endpoint "Service Worker" "/sw.js" 200
echo ""

echo -e "${BOLD}5. Environment Check${NC}"
echo "Checking environment variables via health endpoint..."
health_response=$(curl -s "${DEPLOYMENT_URL}/api/health")

if echo "$health_response" | jq empty 2>/dev/null; then
    env_checks=$(echo "$health_response" | jq -r '.checks.env')
    
    echo -e "\nEnvironment Variables:"
    echo "$env_checks" | jq -r 'to_entries[] | "  \(.key): \(if .value then "✓" else "✗" end)"'
    
    all_ok=$(echo "$env_checks" | jq -r 'all')
    if [ "$all_ok" = "true" ]; then
        echo -e "\n${GREEN}All environment variables configured!${NC}"
    else
        echo -e "\n${YELLOW}⚠ Some environment variables missing!${NC}"
    fi
else
    echo -e "${RED}✗ Could not parse health response${NC}"
fi

echo -e "\n${BOLD}=== Health Check Complete ===${NC}"
echo -e "\nTo deploy to Vercel:"
echo -e "  ${BOLD}vercel --prod${NC}"
echo -e "\nTo view logs:"
echo -e "  ${BOLD}vercel logs [deployment-url]${NC}"

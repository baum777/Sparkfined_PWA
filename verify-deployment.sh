#!/bin/bash
# Sparkfined Beta Deployment Verification Script
# Run this after deploying to production

echo "🔍 Sparkfined Beta Deployment Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASS="${GREEN}✅ PASS${NC}"
FAIL="${RED}❌ FAIL${NC}"
WARN="${YELLOW}⚠️  WARN${NC}"

# Check if URL is provided
if [ -z "$1" ]; then
    echo "Usage: $0 <deployment-url>"
    echo "Example: $0 https://sparkfined-ta-pwa.vercel.app"
    exit 1
fi

URL=$1
echo "Testing: $URL"
echo ""

# Test 1: Root route
echo -n "1. Root route (/) loads... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "$PASS (HTTP $HTTP_CODE)"
else
    echo -e "$FAIL (HTTP $HTTP_CODE)"
fi

# Test 2: Journal route
echo -n "2. Journal route (/journal) loads... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/journal")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "$PASS (HTTP $HTTP_CODE)"
else
    echo -e "$FAIL (HTTP $HTTP_CODE)"
fi

# Test 3: Replay route
echo -n "3. Replay route (/replay) loads... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/replay")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "$PASS (HTTP $HTTP_CODE)"
else
    echo -e "$FAIL (HTTP $HTTP_CODE)"
fi

# Test 4: PWA Manifest
echo -n "4. PWA manifest available... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/manifest.webmanifest")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "$PASS (HTTP $HTTP_CODE)"
else
    echo -e "$FAIL (HTTP $HTTP_CODE)"
fi

# Test 5: Service Worker
echo -n "5. Service worker available... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/sw.js")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "$PASS (HTTP $HTTP_CODE)"
else
    echo -e "$FAIL (HTTP $HTTP_CODE)"
fi

# Test 6: Assets (check main bundle)
echo -n "6. Main bundle loads... "
BUNDLE=$(curl -s "$URL/" | grep -oP 'assets/index-[^"]+\.js' | head -1)
if [ -n "$BUNDLE" ]; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/$BUNDLE")
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "$PASS (HTTP $HTTP_CODE)"
    else
        echo -e "$FAIL (HTTP $HTTP_CODE)"
    fi
else
    echo -e "$FAIL (Bundle not found in HTML)"
fi

# Test 7: Favicon
echo -n "7. Favicon available... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/favicon.ico")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "$PASS (HTTP $HTTP_CODE)"
else
    echo -e "$WARN (HTTP $HTTP_CODE - Not critical)"
fi

echo ""
echo "=========================================="
echo "📋 Manual Tests Required:"
echo ""
echo "1. Open $URL in browser"
echo "2. Test image upload (drag & drop, paste)"
echo "3. Test CA input (paste EVM/Solana address)"
echo "4. Check loading skeleton appears < 200ms"
echo "5. Open /journal and verify it loads"
echo "6. Open /replay and verify < 400ms load time"
echo "7. Test PWA install (Add to Home Screen)"
echo "8. Test offline mode (DevTools > Network > Offline)"
echo "9. Test feedback export (JSON + CSV)"
echo "10. Check MetricsPanel shows events"
echo ""
echo "=========================================="
echo "✅ Automated checks complete!"
echo ""

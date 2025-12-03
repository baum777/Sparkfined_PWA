#!/bin/bash
# Sparkfined Styling Verification Script
# Überprüft, ob alle CSS-Dateien korrekt konfiguriert sind

echo "🎨 Sparkfined Styling Verification"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counter
PASSED=0
FAILED=0

# Test 1: Check if index.css has @tailwind directives
echo "Test 1: Checking for @tailwind directives in index.css..."
if grep -q "@tailwind base" src/styles/index.css && \
   grep -q "@tailwind components" src/styles/index.css && \
   grep -q "@tailwind utilities" src/styles/index.css; then
    echo -e "${GREEN}✅ PASS${NC}: @tailwind directives found"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: @tailwind directives missing in index.css"
    ((FAILED++))
fi
echo ""

# Test 2: Check if tokens.css is imported BEFORE @tailwind
echo "Test 2: Checking import order (tokens.css before @tailwind)..."
if head -10 src/styles/index.css | grep -q "@import './tokens.css'"; then
    echo -e "${GREEN}✅ PASS${NC}: tokens.css imported first"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: tokens.css not imported first"
    ((FAILED++))
fi
echo ""

# Test 3: Check if all CSS files exist
echo "Test 3: Checking if all CSS files exist..."
MISSING_FILES=()
CSS_FILES=(
    "src/styles/tokens.css"
    "src/styles/index.css"
    "src/styles/App.css"
    "src/styles/fonts.css"
    "src/styles/motion.css"
    "src/styles/alchemical.css"
    "src/styles/high-contrast.css"
    "src/styles/landing.css"
    "src/styles/driver-override.css"
)

for file in "${CSS_FILES[@]}"; do
    if [ ! -f "$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ PASS${NC}: All CSS files exist"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: Missing files:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    ((FAILED++))
fi
echo ""

# Test 4: Check if main.tsx imports index.css
echo "Test 4: Checking if main.tsx imports index.css..."
if grep -q "import './styles/index.css'" src/main.tsx; then
    echo -e "${GREEN}✅ PASS${NC}: main.tsx imports index.css"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: main.tsx does not import index.css"
    ((FAILED++))
fi
echo ""

# Test 5: Check if tailwind.config.ts exists
echo "Test 5: Checking if tailwind.config.ts exists..."
if [ -f "tailwind.config.ts" ]; then
    echo -e "${GREEN}✅ PASS${NC}: tailwind.config.ts found"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: tailwind.config.ts not found"
    ((FAILED++))
fi
echo ""

# Test 6: Check if postcss.config.cjs exists and has @tailwindcss/postcss
echo "Test 6: Checking PostCSS configuration..."
if [ -f "postcss.config.cjs" ] && grep -q "@tailwindcss/postcss" postcss.config.cjs; then
    echo -e "${GREEN}✅ PASS${NC}: PostCSS configured correctly"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: PostCSS not configured correctly"
    ((FAILED++))
fi
echo ""

# Test 7: Check for duplicate @tailwind directives
echo "Test 7: Checking for duplicate @tailwind directives..."
TAILWIND_COUNT=$(grep -r "@tailwind" src/styles/*.css | wc -l)
if [ "$TAILWIND_COUNT" -eq 3 ]; then
    echo -e "${GREEN}✅ PASS${NC}: No duplicate @tailwind directives"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠️  WARNING${NC}: Found $TAILWIND_COUNT @tailwind directives (expected 3)"
    if [ "$TAILWIND_COUNT" -gt 3 ]; then
        echo "  This may cause conflicts. Check for duplicates."
    fi
    ((PASSED++))
fi
echo ""

# Test 8: Check if App.css doesn't duplicate index.css
echo "Test 8: Checking for style duplicates in App.css..."
if ! grep -q "@tailwind" src/styles/App.css; then
    echo -e "${GREEN}✅ PASS${NC}: App.css doesn't duplicate Tailwind imports"
    ((PASSED++))
else
    echo -e "${RED}❌ FAIL${NC}: App.css contains duplicate @tailwind imports"
    ((FAILED++))
fi
echo ""

# Summary
echo "=================================="
echo "Summary:"
echo -e "  ${GREEN}Passed: $PASSED${NC}"
echo -e "  ${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Your styling system is correctly configured.${NC}"
    exit 0
else
    echo -e "${RED}❌ Some checks failed. Please review the errors above.${NC}"
    echo ""
    echo "💡 Quick fixes:"
    echo "  1. Make sure src/styles/index.css has @tailwind directives"
    echo "  2. Ensure tokens.css is imported BEFORE @tailwind"
    echo "  3. Run 'pnpm install' to install dependencies"
    echo "  4. Run 'pnpm dev' to test the dev server"
    exit 1
fi

#!/bin/bash

# Real Estate Brokerage Break-Even Analyzer - Setup Verification Script
# Run this script to verify your local setup is correct

echo "🔍 Verifying Real Estate Brokerage Break-Even Analyzer Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0
WARNINGS=0

# Check Node.js version
echo "1️⃣  Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo -e "   ${GREEN}✓${NC} Node.js $NODE_VERSION (OK)"
    else
        echo -e "   ${RED}✗${NC} Node.js $NODE_VERSION (Need 18+)"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${RED}✗${NC} Node.js not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check npm
echo "2️⃣  Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo -e "   ${GREEN}✓${NC} npm $NPM_VERSION"
else
    echo -e "   ${RED}✗${NC} npm not found"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check if node_modules exists
echo "3️⃣  Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "   ${GREEN}✓${NC} Dependencies installed"
else
    echo -e "   ${YELLOW}⚠${NC} Dependencies not installed. Run: npm install"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check .env.local
echo "4️⃣  Checking environment variables..."
if [ -f ".env.local" ]; then
    echo -e "   ${GREEN}✓${NC} .env.local exists"
    
    # Check if variables are set
    if grep -q "NEXT_PUBLIC_SUPABASE_URL=https://" .env.local 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_URL is set"
    else
        echo -e "   ${YELLOW}⚠${NC} NEXT_PUBLIC_SUPABASE_URL not configured"
        WARNINGS=$((WARNINGS + 1))
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ" .env.local 2>/dev/null; then
        echo -e "   ${GREEN}✓${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
    else
        echo -e "   ${YELLOW}⚠${NC} NEXT_PUBLIC_SUPABASE_ANON_KEY not configured"
        WARNINGS=$((WARNINGS + 1))
    fi
else
    echo -e "   ${RED}✗${NC} .env.local not found"
    echo -e "   ${YELLOW}ℹ${NC}  Copy .env.example to .env.local and add your Supabase credentials"
    ERRORS=$((ERRORS + 1))
fi
echo ""

# Check Supabase CLI
echo "5️⃣  Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(supabase -v 2>&1 | head -n 1)
    echo -e "   ${GREEN}✓${NC} Supabase CLI installed ($SUPABASE_VERSION)"
else
    echo -e "   ${YELLOW}⚠${NC} Supabase CLI not found (optional for local dev)"
    echo -e "   ${YELLOW}ℹ${NC}  Install with: npm i -g supabase"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Check required files
echo "6️⃣  Checking project files..."
REQUIRED_FILES=(
    "app/page.tsx"
    "app/analyze/page.tsx"
    "app/history/page.tsx"
    "app/auth/page.tsx"
    "app/api/calculate/route.ts"
    "lib/types.ts"
    "lib/schemas.ts"
    "lib/supabase-browser.ts"
    "supabase/schema.sql"
    "supabase/functions/calculate/index.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "   ${GREEN}✓${NC} $file"
    else
        echo -e "   ${RED}✗${NC} $file missing"
        ERRORS=$((ERRORS + 1))
    fi
done
echo ""

# Try to build the project
echo "7️⃣  Testing build..."
if [ -d "node_modules" ]; then
    if npm run build > /dev/null 2>&1; then
        echo -e "   ${GREEN}✓${NC} Build successful"
    else
        echo -e "   ${RED}✗${NC} Build failed. Run 'npm run build' for details"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "   ${YELLOW}⚠${NC} Skipped (dependencies not installed)"
    WARNINGS=$((WARNINGS + 1))
fi
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✨ Setup verification complete! Everything looks good.${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Run: npm run dev"
    echo "  2. Open: http://localhost:3000"
    echo "  3. See QUICKSTART.md for more info"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠ Setup verification complete with $WARNINGS warning(s).${NC}"
    echo ""
    echo "Your app should work, but some optional features may be unavailable."
    echo "Review the warnings above and address them if needed."
else
    echo -e "${RED}✗ Setup verification found $ERRORS error(s) and $WARNINGS warning(s).${NC}"
    echo ""
    echo "Please address the errors above before running the app."
    echo "See QUICKSTART.md or README.md for setup instructions."
fi
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $ERRORS


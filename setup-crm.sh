#!/bin/bash

# =====================================================
# CRM Module Setup Script
# =====================================================

echo "🚀 Setting up CRM Module for Brokerage Management..."
echo ""

# Step 1: Install dependencies
echo "📦 Installing required dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Step 2: Check for Supabase CLI
echo "🔍 Checking for Supabase CLI..."
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. Please install it:"
    echo "   brew install supabase/tap/supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    echo ""
    echo "After installing, run this script again."
    exit 1
fi

echo "✅ Supabase CLI found"
echo ""

# Step 3: Database setup
echo "📊 Setting up database schema..."
echo ""
echo "Please run the following SQL in your Supabase Dashboard:"
echo "   1. Go to SQL Editor"
echo "   2. Copy contents of: supabase/crm-schema.sql"
echo "   3. Paste and execute"
echo ""
read -p "Press Enter after you've completed the database setup..."

# Step 4: Edge Function deployment
echo ""
echo "☁️  Deploying Edge Function..."
echo ""
echo "To deploy the calculate_agent_scores function:"
echo "   supabase functions deploy calculate_agent_scores"
echo ""
echo "Don't forget to set environment variables in Supabase Dashboard:"
echo "   - SUPABASE_URL"
echo "   - SUPABASE_SERVICE_ROLE_KEY"
echo ""
read -p "Press Enter after you've deployed the Edge Function..."

# Step 5: Verification
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Navigate to: http://localhost:3000/crm/settings"
echo "   3. Configure your KPI settings"
echo "   4. Add your first agent at: /crm/sales"
echo "   5. Start logging performance at: /crm/logs"
echo ""
echo "📖 Documentation:"
echo "   - Full docs: CRM_MODULE_DOCUMENTATION.md"
echo "   - Quick start: CRM_QUICKSTART.md"
echo ""
echo "🎉 Happy tracking!"


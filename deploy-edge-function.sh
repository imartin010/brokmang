#!/bin/bash

# =====================================================
# Deploy Edge Function - generate_report
# Run this after removing organizations
# =====================================================

echo "🚀 Deploying generate_report Edge Function..."
echo ""

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Installing..."
    npm install -g supabase
fi

echo "📝 Make sure you're logged in to Supabase CLI..."
npx supabase login

echo ""
echo "🔗 Linking to project (if not already linked)..."
echo "ℹ️  If already linked, this will be skipped."
read -p "Enter your Supabase project ref (or press Enter to skip): " PROJECT_REF

if [ ! -z "$PROJECT_REF" ]; then
    npx supabase link --project-ref "$PROJECT_REF"
fi

echo ""
echo "🚀 Deploying generate_report function..."
npx supabase functions deploy generate_report --no-verify-jwt

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to localhost:3000/reports"
echo "2. Try generating a report"
echo "3. Check browser console if you see errors"
echo ""
echo "🔍 To view deployment logs:"
echo "   Supabase Dashboard → Edge Functions → generate_report → Logs"


/**
 * Check subscription status for a user
 * Usage: npx tsx scripts/check-subscription.ts <user_id>
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve } from "path";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSubscription(userId: string) {
  console.log(`\n🔍 Checking subscription for user: ${userId}\n`);

  // Get ALL subscriptions for this user
  const { data: allSubs, error: allError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (allError) {
    console.error("❌ Error fetching subscriptions:", allError);
    return;
  }

  console.log(`📊 Found ${allSubs?.length || 0} subscription(s) for this user\n`);

  if (!allSubs || allSubs.length === 0) {
    console.log("⚠️  No subscriptions found for this user");
    return;
  }

  // Show all subscriptions
  allSubs.forEach((sub, index) => {
    console.log(`\n${index + 1}. Subscription ID: ${sub.id}`);
    console.log(`   Status: ${sub.status}`);
    console.log(`   User Type: ${sub.user_type}`);
    console.log(`   Amount: ${sub.amount_egp} EGP`);
    console.log(`   Start Date: ${sub.start_date || 'Not set'}`);
    console.log(`   End Date: ${sub.end_date || 'Not set'}`);
    
    if (sub.end_date) {
      const endDate = new Date(sub.end_date);
      const now = new Date();
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`   Days Remaining: ${daysRemaining} days`);
      console.log(`   Is Expired: ${daysRemaining < 0 ? 'Yes' : 'No'}`);
    }
    
    console.log(`   Created At: ${sub.created_at}`);
    console.log(`   Validated By: ${sub.validated_by || 'Not validated'}`);
    console.log(`   Validated At: ${sub.validated_at || 'Not validated'}`);
  });

  // Check for active subscription
  const { data: active } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .eq("status", "active")
    .gt("end_date", new Date().toISOString())
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  console.log(`\n✅ Active Subscription: ${active ? 'YES' : 'NO'}`);
  if (active) {
    const daysRemaining = Math.ceil(
      (new Date(active.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    console.log(`   Days Remaining: ${daysRemaining} days\n`);
  } else {
    console.log("\n⚠️  No active subscription found. Reasons:");
    const activeSubs = allSubs.filter(s => s.status === 'active');
    if (activeSubs.length > 0) {
      console.log("   - Found active subscriptions but end_date has passed");
      activeSubs.forEach(sub => {
        if (sub.end_date) {
          const endDate = new Date(sub.end_date);
          const now = new Date();
          console.log(`     * End date: ${sub.end_date} (expired: ${endDate < now ? 'Yes' : 'No'})`);
        }
      });
    } else {
      const pendingSubs = allSubs.filter(s => s.status === 'pending_payment');
      if (pendingSubs.length > 0) {
        console.log(`   - Found ${pendingSubs.length} subscription(s) with status 'pending_payment'`);
        console.log("     These need to be validated by an admin");
      }
      
      const expiredSubs = allSubs.filter(s => s.status === 'expired');
      if (expiredSubs.length > 0) {
        console.log(`   - Found ${expiredSubs.length} expired subscription(s)`);
      }
      
      if (allSubs.length > 0 && !activeSubs.length && !pendingSubs.length && !expiredSubs.length) {
        console.log(`   - Status of subscriptions: ${allSubs.map(s => s.status).join(', ')}`);
      }
    }
  }
}

// Get user ID from command line or use default
const userId = process.argv[2] || "4c4a72b9-7ded-4d33-b7ed-0ee9b87a1778";

checkSubscription(userId).catch(console.error);


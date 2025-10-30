/**
 * API Route: Subscription Cron Job
 * Runs daily to:
 * 1. Send renewal reminders (5 days before expiry)
 * 2. Disable expired subscriptions (after 31 days)
 * 
 * Setup: Add to Vercel Cron Jobs or call via external cron
 * Recommended: Run daily at midnight
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Verify cron secret to prevent unauthorized access
const CRON_SECRET = process.env.CRON_SECRET || "change-me-in-production";

export async function GET(req: NextRequest) {
  try {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const results = {
      reminders_sent: 0,
      subscriptions_expired: 0,
      errors: [] as string[],
    };

    // =====================================================
    // 1. Send Renewal Reminders (5 days before expiry)
    // =====================================================

    const fiveDaysFromNow = new Date();
    fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

    const { data: expiringSubscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .eq("renewal_reminder_sent", false)
      .gte("end_date", new Date().toISOString())
      .lte("end_date", fiveDaysFromNow.toISOString());

    if (expiringSubscriptions) {
      for (const subscription of expiringSubscriptions) {
        try {
          const daysRemaining = Math.ceil(
            (new Date(subscription.end_date).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          );

          const amount = subscription.user_type === "ceo" ? 100 : 50;

          // Create notification
          await supabase.from("notifications").insert({
            org_id: subscription.org_id,
            user_id: subscription.user_id,
            type: "subscription_expiring_soon",
            title: `⏰ AI Subscription Expiring in ${daysRemaining} Days`,
            message: `Your AI features will expire soon. Renew now for ${amount} EGP/month to keep access.`,
            action_url: "/subscription",
            metadata: {
              subscription_id: subscription.id,
              days_remaining: daysRemaining,
              end_date: subscription.end_date,
              amount,
            },
          });

          // Mark reminder as sent
          await supabase
            .from("subscriptions")
            .update({ renewal_reminder_sent: true })
            .eq("id", subscription.id);

          results.reminders_sent++;
        } catch (error: any) {
          results.errors.push(`Reminder failed for ${subscription.id}: ${error.message}`);
        }
      }
    }

    // =====================================================
    // 2. Disable Expired Subscriptions
    // =====================================================

    const { data: expiredSubscriptions } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("status", "active")
      .lt("end_date", new Date().toISOString());

    if (expiredSubscriptions) {
      for (const subscription of expiredSubscriptions) {
        try {
          // Update subscription status to expired
          await supabase
            .from("subscriptions")
            .update({ status: "expired" })
            .eq("id", subscription.id);

          // Notify user - AI disabled
          await supabase.from("notifications").insert({
            org_id: subscription.org_id,
            user_id: subscription.user_id,
            type: "subscription_expired",
            title: "🔒 AI Features Disabled",
            message: "Your AI subscription has expired. Renew now to regain access to Smart Insights.",
            action_url: "/subscription",
            metadata: {
              subscription_id: subscription.id,
              expired_at: subscription.end_date,
            },
          });

          // Mark expiry notification as sent
          await supabase
            .from("subscriptions")
            .update({ expiry_notif_sent: true })
            .eq("id", subscription.id);

          results.subscriptions_expired++;
        } catch (error: any) {
          results.errors.push(`Expiry failed for ${subscription.id}: ${error.message}`);
        }
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (error: any) {
    console.error("Error in subscription cron:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(req: NextRequest) {
  return GET(req);
}


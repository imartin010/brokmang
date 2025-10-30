/**
 * API Route: Check Subscription Status
 * Returns whether user has active AI subscription
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const user_id = searchParams.get("user_id");

    if (!user_id) {
      return NextResponse.json(
        { error: "user_id is required" },
        { status: 400 }
      );
    }

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "active")
      .gt("end_date", new Date().toISOString())
      .order("end_date", { ascending: false })
      .limit(1)
      .maybeSingle();
    
    // If table doesn't exist, return no subscription
    if (subError && subError.code === 'PGRST116') {
      return NextResponse.json({
        has_subscription: false,
        pending_payment: false,
        info: "Subscription system not yet initialized"
      });
    }

    if (subscription) {
      const daysRemaining = Math.ceil(
        (new Date(subscription.end_date).getTime() - Date.now()) /
          (1000 * 60 * 60 * 24)
      );

      return NextResponse.json({
        has_subscription: true,
        subscription: {
          id: subscription.id,
          user_type: subscription.user_type,
          amount_egp: subscription.amount_egp,
          start_date: subscription.start_date,
          end_date: subscription.end_date,
          days_remaining: daysRemaining,
        },
      });
    }

    // Check for pending payment
    const { data: pending } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .eq("status", "pending_payment")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (pending) {
      return NextResponse.json({
        has_subscription: false,
        pending_payment: true,
        pending: {
          id: pending.id,
          amount_egp: pending.amount_egp,
          submitted_at: pending.payment_submitted_at,
        },
      });
    }

    return NextResponse.json({
      has_subscription: false,
      pending_payment: false,
    });
  } catch (error: any) {
    console.error("Error checking subscription status:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}


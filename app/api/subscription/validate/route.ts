/**
 * API Route: Admin Validate Payment
 * Admin approves/rejects subscription payment
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { subscription_id, admin_user_id, action, admin_notes } = await req.json();

    if (!subscription_id || !admin_user_id || !action) {
      return NextResponse.json(
        { error: "subscription_id, admin_user_id, and action are required" },
        { status: 400 }
      );
    }

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      );
    }

    // Verify admin has permission (only Admins can validate AI subscriptions)
    // CEOs and Team Leaders are clients who purchase subscriptions
    const { data: adminProfile } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("user_id", admin_user_id)
      .single();

    if (!adminProfile || adminProfile.user_type !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized. Only Admins can validate AI subscription payments." },
        { status: 403 }
      );
    }

    // Get subscription details
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscription_id)
      .single();

    if (subError || !subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 }
      );
    }

    if (subscription.status !== "pending_payment") {
      return NextResponse.json(
        { error: "Subscription is not pending validation" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      // Approve subscription - activate AI features
      const start_date = new Date();
      const end_date = new Date(start_date.getTime() + 31 * 24 * 60 * 60 * 1000); // 31 days

      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "active",
          validated_by: admin_user_id,
          validated_at: new Date().toISOString(),
          admin_notes,
          start_date: start_date.toISOString(),
          end_date: end_date.toISOString(),
        })
        .eq("id", subscription_id);

      if (updateError) {
        throw updateError;
      }

      // Update payment history
      await supabase
        .from("subscription_payments")
        .update({
          status: "validated",
          validated_by: admin_user_id,
          validated_at: new Date().toISOString(),
          notes: admin_notes,
        })
        .eq("subscription_id", subscription_id)
        .eq("status", "submitted");

      // Notify user - AI activated
      await supabase.from("notifications").insert({
        user_id: subscription.user_id,
        type: "SYSTEM",
        title: "✅ AI Features Activated!",
        message: `Your payment has been validated. AI Smart Insights are now active for 31 days!`,
        action_url: "/insights",
        payload: {
          subscription_id,
          start_date: start_date.toISOString(),
          end_date: end_date.toISOString(),
          notification_subtype: "subscription_activated",
        },
      });

      // Update notification flag
      await supabase
        .from("subscriptions")
        .update({ activation_notif_sent: true })
        .eq("id", subscription_id);

      return NextResponse.json({
        success: true,
        message: "Subscription approved and activated",
        subscription: {
          id: subscription_id,
          status: "active",
          start_date,
          end_date,
        },
      });
    } else {
      // Reject payment
      const { error: updateError } = await supabase
        .from("subscriptions")
        .update({
          status: "cancelled",
          validated_by: admin_user_id,
          validated_at: new Date().toISOString(),
          admin_notes,
        })
        .eq("id", subscription_id);

      if (updateError) {
        throw updateError;
      }

      // Update payment history
      await supabase
        .from("subscription_payments")
        .update({
          status: "rejected",
          validated_by: admin_user_id,
          validated_at: new Date().toISOString(),
          notes: admin_notes,
        })
        .eq("subscription_id", subscription_id)
        .eq("status", "submitted");

      // Notify user - payment rejected
      await supabase.from("notifications").insert({
        user_id: subscription.user_id,
        type: "SYSTEM",
        title: "❌ Payment Not Validated",
        message: admin_notes || "Your payment could not be validated. Please contact support or try again.",
        action_url: "/subscription",
        payload: {
          subscription_id,
          reason: admin_notes,
          notification_subtype: "subscription_rejected",
        },
      });

      return NextResponse.json({
        success: true,
        message: "Subscription rejected",
      });
    }
  } catch (error: any) {
    console.error("Error validating subscription:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}


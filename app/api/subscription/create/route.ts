/**
 * API Route: Create Subscription Request
 * User submits payment, awaits admin validation
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, user_type, payment_reference, payment_screenshot_url } = await req.json();

    if (!user_id || !user_type) {
      return NextResponse.json(
        { error: "user_id and user_type are required" },
        { status: 400 }
      );
    }

    // Validate user_type
    if (user_type !== "ceo" && user_type !== "team_leader") {
      return NextResponse.json(
        { error: "Invalid user_type" },
        { status: 400 }
      );
    }

    // Get price based on user type
    const amount_egp = user_type === "ceo" ? 100 : 50;

    // Check if user already has an active or pending subscription
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", user_id)
      .in("status", ["active", "pending_payment"])
      .single();

    if (existing) {
      if (existing.status === "active") {
        return NextResponse.json(
          { error: "You already have an active subscription" },
          { status: 400 }
        );
      }
      if (existing.status === "pending_payment") {
        return NextResponse.json(
          { error: "You already have a pending payment request. Please wait for admin validation." },
          { status: 400 }
        );
      }
    }

    // Create subscription request
    const { data: subscription, error: subError } = await supabase
      .from("subscriptions")
      .insert({
        user_id,
        user_type,
        amount_egp,
        status: "pending_payment",
        payment_reference,
        payment_screenshot_url,
        payment_submitted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (subError) {
      console.error("Error creating subscription:", subError);
      return NextResponse.json(
        { error: "Failed to create subscription", details: subError.message },
        { status: 500 }
      );
    }

    // Create payment history record
    await supabase.from("subscription_payments").insert({
      subscription_id: subscription.id,
      user_id,
      amount_egp,
      payment_method: "instapay",
      payment_reference,
      payment_screenshot_url,
      status: "submitted",
    });

    // Create notification for user
    await supabase.from("notifications").insert({
      user_id,
      type: "SYSTEM",
      title: "💳 Payment Submitted",
      message: `Your AI subscription payment of ${amount_egp} EGP has been submitted. Awaiting admin validation.`,
      action_url: "/subscription",
      payload: {
        subscription_id: subscription.id,
        amount: amount_egp,
        notification_subtype: "subscription_payment_submitted",
      },
    });

    // Create notification for all CEOs and Admins
    const { data: admins } = await supabase
      .from("user_profiles")
      .select("user_id")
      .in("user_type", ["ceo", "admin"]);

    if (admins && admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        user_id: admin.user_id,
        type: "SYSTEM",
        title: "🔔 New Payment to Validate",
        message: `A user submitted payment for AI subscription (${amount_egp} EGP). Please validate in admin panel.`,
        action_url: "/admin/subscriptions",
        payload: {
          subscription_id: subscription.id,
          amount: amount_egp,
          notification_subtype: "subscription_pending_validation",
        },
      }));

      await supabase.from("notifications").insert(adminNotifications);
    }

    // Update notification flag
    await supabase
      .from("subscriptions")
      .update({ payment_submitted_notif_sent: true })
      .eq("id", subscription.id);

    return NextResponse.json({
      success: true,
      subscription,
      message: "Payment submitted successfully. Awaiting admin validation.",
    });
  } catch (error: any) {
    console.error("Error in create subscription:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}


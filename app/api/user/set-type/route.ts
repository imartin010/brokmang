/**
 * API Route: Set User Account Type
 * Sets whether user is CEO or Team Leader
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { user_id, user_type } = await req.json();

    if (!user_id || !user_type) {
      return NextResponse.json(
        { error: "user_id and user_type are required" },
        { status: 400 }
      );
    }

    // Validate user_type
    if (user_type !== "ceo" && user_type !== "team_leader") {
      return NextResponse.json(
        { error: "Invalid user_type. Must be 'ceo' or 'team_leader'" },
        { status: 400 }
      );
    }

    // Upsert into user_profiles table
    let defaultName = "User";
    try {
      const { data: authUser } = await supabase.auth.admin.getUserById(user_id);
      if (authUser?.user?.email) {
        defaultName = authUser.user.email.split('@')[0];
      }
    } catch (e) {
      console.error("Could not fetch user email:", e);
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .upsert({
        user_id,
        user_type,
        full_name: defaultName,
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error("Error setting user type:", error);
      return NextResponse.json(
        { error: "Failed to set user type", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user_type: data.user_type,
      message: "User type updated successfully",
    });
  } catch (error: any) {
    console.error("Error in set-type route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch current user type
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

    const { data, error } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("user_id", user_id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user type:", error);
      return NextResponse.json(
        { error: "Failed to fetch user type", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      user_type: data?.user_type || null,
    });
  } catch (error: any) {
    console.error("Error in get user type route:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}


/**
 * Admin API: Change User Type
 * Allows admins to change user types (team_leader <-> ceo)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Await cookies() - required in Next.js 15
    const cookieStore = await cookies();
    
    // Create Supabase client with cookies (same pattern as working routes)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );
    const body = await request.json();

    const { user_id, new_user_type } = body;

    if (!user_id || !new_user_type) {
      return NextResponse.json(
        { error: "user_id and new_user_type are required" },
        { status: 400 }
      );
    }

    if (!["ceo", "team_leader", "admin"].includes(new_user_type)) {
      return NextResponse.json(
        { error: "Invalid user_type. Must be 'ceo', 'team_leader', or 'admin'" },
        { status: 400 }
      );
    }

    // Check if current user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: adminProfile } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("user_id", user.id)
      .maybeSingle();

    if (adminProfile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Only admins can change user types" },
        { status: 403 }
      );
    }

    // Prevent changing admin users
    const { data: targetProfile } = await supabase
      .from("user_profiles")
      .select("user_type")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    if (targetProfile.user_type === "admin") {
      return NextResponse.json(
        { error: "Cannot change admin user types" },
        { status: 403 }
      );
    }

    // Update user type
    const { error } = await supabase
      .from("user_profiles")
      .update({ user_type: new_user_type })
      .eq("user_id", user_id);

    if (error) {
      console.error("Failed to update user type:", error);
      return NextResponse.json(
        { error: "Failed to update user type" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User type changed to ${new_user_type}`,
    });
  } catch (error: any) {
    console.error("Error changing user type:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

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
    
    // Create Supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set(name, value, options);
            } catch (error) {
              // Cookie setting in route handlers is read-only, that's OK
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set(name, '', options);
            } catch (error) {
              // Cookie removal in route handlers is read-only, that's OK
            }
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

    // Check if current user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("[Admin Change User Type API] Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized - Please sign in" }, { status: 401 });
    }

    // Use service role to check admin status (bypasses RLS)
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user is admin using service role (bypasses RLS)
    const { data: adminProfile, error: profileError } = await supabaseService
      .from("user_profiles")
      .select("user_type")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("[Admin Change User Type API] Error checking admin status:", profileError);
      return NextResponse.json(
        { error: "Failed to verify admin access" },
        { status: 500 }
      );
    }

    if (adminProfile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Only admins can change user types" },
        { status: 403 }
      );
    }

    // Prevent changing admin users (use service role)
    const { data: targetProfile } = await supabaseService
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

    // Update user type (use service role to bypass RLS)
    const { error } = await supabaseService
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
    console.error("[Admin Change User Type API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

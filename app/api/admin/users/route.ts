/**
 * Admin API: Get All Users
 * Allows admins to view all user profiles (bypasses RLS using service role)
 */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    // Await cookies() - required in Next.js 15
    const cookieStore = await cookies();
    
    // Pre-read all cookies into a Map to avoid sync access issues
    const cookieMap = new Map<string, string>();
    cookieStore.getAll().forEach((cookie) => {
      cookieMap.set(cookie.name, cookie.value);
    });
    
    // Create Supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieMap.get(name) || undefined;
          },
        },
      }
    );
    
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
        { error: "Only admins can view all users" },
        { status: 403 }
      );
    }

    // Get filter parameter
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("filter") || "all";

    // Create service role client to bypass RLS
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
    
    let query = supabaseService
      .from("user_profiles")
      .select("*");

    if (filterType !== "all") {
      query = query.eq("user_type", filterType);
    }

    const { data: users, error } = await query.order("created_at", {
      ascending: false,
    });

    if (error) {
      console.error("Failed to fetch users:", error);
      return NextResponse.json(
        { error: "Failed to fetch users" },
        { status: 500 }
      );
    }

    // Enrich with agent counts for team leaders
    const enriched = await Promise.all(
      (users || []).map(async (user) => {
        if (user.user_type === "team_leader") {
          const { count } = await supabaseService
            .from("sales_agents")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.user_id);

          return { ...user, agent_count: count || 0 };
        }
        return { ...user, agent_count: 0 };
      })
    );

    return NextResponse.json({ users: enriched });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


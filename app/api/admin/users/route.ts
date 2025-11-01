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
    
    // Debug: Log cookie names being read
    const allCookies = cookieStore.getAll();
    const supabaseCookies = allCookies.filter(c => c.name.includes('sb-') || c.name.includes('supabase'));
    console.log("[Admin Users API] Found Supabase cookies:", supabaseCookies.map(c => c.name));
    
    // Create Supabase client with cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = cookieStore.get(name)?.value;
            if (name.includes('auth-token')) {
              console.log(`[Admin Users API] Reading cookie ${name}: ${value ? 'exists' : 'missing'}`);
            }
            return value;
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
    
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log("[Admin Users API] getUser result:", {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      error: authError?.message,
    });

    if (authError || !user) {
      console.error("[Admin Users API] Auth error:", {
        error: authError,
        message: authError?.message,
        status: authError?.status,
      });
      return NextResponse.json({ 
        error: "Unauthorized - Please sign in",
        details: authError?.message || "No user found"
      }, { status: 401 });
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
      console.error("[Admin Users API] Error checking admin status:", profileError);
      return NextResponse.json(
        { error: "Failed to verify admin access" },
        { status: 500 }
      );
    }

    if (adminProfile?.user_type !== "admin") {
      return NextResponse.json(
        { error: "Only admins can view all users" },
        { status: 403 }
      );
    }

    // Get filter parameter
    const { searchParams } = new URL(request.url);
    const filterType = searchParams.get("filter") || "all";

    // Use existing service role client (already created above)
    
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
    console.error("[Admin Users API] Error fetching users:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}


/**
 * Admin Panel Layout
 * Provides navigation sidebar and admin-only access control
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/zustand/store";
import { supabase } from "@/lib/supabase-browser";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Settings,
  BarChart3,
  LogOut,
  Shield,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { signOutUser } from "@/lib/auth-simple";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, setUser, userAccountType, setUserAccountType } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn("[Admin Layout] Access check timeout, stopping loading");
        setLoading(false);
        setAuthorized(false);
      }, 10000); // 10 second timeout

      try {
        // Get user with timeout
        let currentUser: any = null;
        let authError: any = null;
        
        try {
          const getUserPromise = supabase.auth.getUser();
          const getUserTimeout = new Promise<{ data: { user: null }, error: Error }>((resolve) => 
            setTimeout(() => resolve({ data: { user: null }, error: new Error("getUser timeout") }), 5000)
          );
          
          const result = await Promise.race([getUserPromise, getUserTimeout]);
          currentUser = result.data?.user;
          authError = result.error;
        } catch (error: any) {
          authError = error;
        }
        
        if (authError || !currentUser) {
          clearTimeout(timeoutId);
          console.error("[Admin Layout] No user found:", authError);
          router.push("/auth/signin");
          setLoading(false);
          return;
        }

        setUser(currentUser);

        // Check if user is admin with timeout
        let profile: any = null;
        let profileError: any = null;
        
        try {
          const profilePromise = supabase
            .from("user_profiles")
            .select("user_type")
            .eq("user_id", currentUser.id)
            .maybeSingle();
          
          const profileTimeout = new Promise<{ data: null, error: Error }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: new Error("Profile query timeout") }), 5000)
          );

          const result = await Promise.race([profilePromise, profileTimeout]);
          profile = result.data;
          profileError = result.error;
        } catch (error: any) {
          profileError = error;
        }

        if (profileError) {
          console.error("[Admin Layout] Error fetching profile:", profileError);
          clearTimeout(timeoutId);
          setAuthorized(false);
          setLoading(false);
          return;
        }

        if (profile?.user_type !== "admin") {
          clearTimeout(timeoutId);
          setAuthorized(false);
          setLoading(false);
          return;
        }

        clearTimeout(timeoutId);
        setUserAccountType("admin");
        setAuthorized(true);
        setLoading(false);
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.error("[Admin Layout] Access check failed:", error);
        setAuthorized(false);
        setLoading(false);
        
        // Only redirect if it's not a timeout error
        if (!error.message?.includes("timeout")) {
          router.push("/auth/signin");
        }
      }
    };

    checkAccess();
  }, [router, setUser, setUserAccountType]);

  const handleSignOut = async () => {
    await signOutUser();
    setUser(null);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center">
          <AlertCircle className="h-16 w-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            Only administrators can access this panel.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-card min-h-screen sticky top-0">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Admin Panel</h1>
            </div>
          </div>

          <nav className="p-4 space-y-2">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="mb-4 px-2">
              <p className="text-sm font-medium">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="container mx-auto px-6 py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

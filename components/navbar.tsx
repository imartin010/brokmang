"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { OrgSwitcher } from "./org-switcher";
import { NotificationCenter } from "./notifications/notification-center";
import {
  TrendingUp,
  Calculator,
  History,
  LogOut,
  User,
  Users,
  ClipboardList,
  Settings,
  BarChart3,
  Home,
  LayoutDashboard,
  FileText,
  Lightbulb,
  FileSearch,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase-browser";
import { signOut } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/zustand/store";
import type { UserAccountType } from "@/lib/types";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { userAccountType, setUserAccountType, hasFinancialAccess } = useAuth();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      
      // Fetch user account type
      if (data.user) {
        fetchUserAccountType(data.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Fetch user account type on auth state change
      if (session?.user) {
        fetchUserAccountType(session.user.id);
      } else {
        setUserAccountType(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserAccountType = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("sales_agents")
        .select("user_type")
        .eq("user_id", userId)
        .single();

      if (data?.user_type) {
        setUserAccountType(data.user_type as UserAccountType);
      }
    } catch (error) {
      console.error("Error fetching user account type:", error);
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (result.success) {
      router.push("/");
    }
  };

  // Base links available to all authenticated users
  const baseLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ];

  // Financial tools - CEO only
  const financialLinks = [
    { href: "/analyze", label: "Break-Even Analysis", icon: Calculator, ceoOnly: true },
    { href: "/history", label: "Analysis History", icon: History, ceoOnly: true },
  ];

  // Common tools - available to both
  const commonLinks = [
    { href: "/reports", label: "Reports", icon: FileText },
    { href: "/insights", label: "AI Insights", icon: Lightbulb },
  ];

  // Combine links based on user type
  const links = [
    ...baseLinks,
    ...(hasFinancialAccess() ? financialLinks : []),
    ...commonLinks,
  ];

  const crmLinks = [
    { href: "/crm/sales", label: "Agents", icon: Users },
    { href: "/crm/logs", label: "Logs", icon: ClipboardList },
    { href: "/crm/report", label: "Report", icon: BarChart3 },
    { href: "/crm/settings", label: "Settings", icon: Settings },
  ];
  
  const orgLinks = [
    { href: "/org/settings", label: "Org Settings", icon: Settings },
    { href: "/audit", label: "Audit Logs", icon: FileSearch, ownerAdmin: true },
  ];

  const isCrmPage = pathname?.startsWith("/crm");

  return (
    <nav className="border-b glass sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="gradient-bg p-2 rounded-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="font-bold text-xl hidden sm:inline">
                Brokmang.
              </span>
            </Link>
            <div className="flex gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                return (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "gap-2",
                        pathname === link.href && "bg-accent"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{link.label}</span>
                    </Button>
                  </Link>
                );
              })}
              {/* Agents Menu with Dropdown */}
              {user && (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-2",
                      isCrmPage && "bg-accent"
                    )}
                  >
                    <Users className="h-4 w-4" />
                    <span className="hidden sm:inline">Agents</span>
                  </Button>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full mt-1 w-48 py-2 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {crmLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <div className={cn(
                            "flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer transition-colors",
                            pathname === link.href && "bg-accent/50"
                          )}>
                            <Icon className="h-4 w-4" />
                            <span>{link.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Org Menu with Dropdown */}
              {user && (
                <div className="relative group">
                  <Button
                    variant="ghost"
                    className={cn(
                      "gap-2",
                      (pathname?.startsWith("/org") || pathname?.startsWith("/audit")) && "bg-accent"
                    )}
                  >
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">Org</span>
                  </Button>
                  {/* Dropdown Menu */}
                  <div className="absolute left-0 top-full mt-1 w-48 py-2 bg-background border rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {orgLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <div className={cn(
                            "flex items-center gap-2 px-4 py-2 hover:bg-accent cursor-pointer transition-colors",
                            pathname === link.href && "bg-accent/50"
                          )}>
                            <Icon className="h-4 w-4" />
                            <span>{link.label}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <OrgSwitcher />
            <ThemeToggle />
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md bg-accent">
                  <User className="h-4 w-4" />
                  <span className="text-sm">{user.email}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


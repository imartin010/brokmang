/**
 * Admin Dashboard
 * Overview of system statistics and recent activity
 */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import {
  Users,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Loader2,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

interface DashboardStats {
  totalUsers: number;
  totalAgents: number;
  activeSubscriptions: number;
  pendingSubscriptions: number;
  totalRevenue: number;
  recentSubscriptions: Array<{
    id: string;
    user_id: string;
    status: string;
    amount_egp: number;
    created_at: string;
    user_name?: string;
  }>;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAgents: 0,
    activeSubscriptions: 0,
    pendingSubscriptions: 0,
    totalRevenue: 0,
    recentSubscriptions: [],
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load total users
      const { count: userCount } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      // Load total agents
      const { count: agentCount } = await supabase
        .from("sales_agents")
        .select("*", { count: "exact", head: true });

      // Load subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      const activeSubscriptions = subscriptions?.filter(
        (s) => s.status === "active"
      ).length || 0;

      const pendingSubscriptions = subscriptions?.filter(
        (s) => s.status === "pending_payment"
      ).length || 0;

      const totalRevenue =
        subscriptions
          ?.filter((s) => s.status === "active")
          .reduce((sum, s) => sum + (s.amount_egp || 0), 0) || 0;

      // Load recent subscriptions with user info
      const recentSubs = subscriptions?.slice(0, 5) || [];
      const userIds = [...new Set(recentSubs.map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from("user_profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);

      const enrichedSubs = recentSubs.map((sub) => {
        const profile = profiles?.find((p) => p.user_id === sub.user_id);
        return {
          ...sub,
          user_name: profile?.full_name || "User",
        };
      });

      setStats({
        totalUsers: userCount || 0,
        totalAgents: agentCount || 0,
        activeSubscriptions,
        pendingSubscriptions,
        totalRevenue,
        recentSubscriptions: enrichedSubs,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Sales Agents",
      value: stats.totalAgents,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Active Subscriptions",
      value: stats.activeSubscriptions,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Payments",
      value: stats.pendingSubscriptions,
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Total Revenue",
      value: `${stats.totalRevenue.toLocaleString()} EGP`,
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of system statistics and activity
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Subscriptions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Subscriptions</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No subscriptions yet
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentSubscriptions.map((sub) => {
                const StatusIcon =
                  sub.status === "active"
                    ? CheckCircle
                    : sub.status === "pending_payment"
                    ? Clock
                    : XCircle;

                const statusColor =
                  sub.status === "active"
                    ? "text-green-600"
                    : sub.status === "pending_payment"
                    ? "text-amber-600"
                    : "text-red-600";

                return (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                      <div>
                        <p className="font-semibold">{sub.user_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(sub.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {sub.amount_egp.toLocaleString()} EGP
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {sub.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

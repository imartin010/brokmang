/**
 * Admin Analytics Page
 * System analytics and reports
 */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Loader2,
  Calendar,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalAgents: number;
  activeAgents: number;
}

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    totalAgents: 0,
    activeAgents: 0,
  });
  const [dateRange, setDateRange] = useState<"week" | "month" | "year">("month");

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      // Total users
      const { count: totalUsers } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true });

      // New users this month
      const { count: newUsersThisMonth } = await supabase
        .from("user_profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", startOfMonth.toISOString());

      // Active subscriptions
      const { data: subscriptions } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("status", "active");

      const activeSubscriptions = subscriptions?.length || 0;

      // Total revenue
      const totalRevenue =
        subscriptions?.reduce((sum, s) => sum + (s.amount_egp || 0), 0) || 0;

      // Revenue this month
      const subscriptionsThisMonth = subscriptions?.filter(
        (s) => new Date(s.created_at) >= startOfMonth
      ) || [];

      const revenueThisMonth =
        subscriptionsThisMonth.reduce(
          (sum, s) => sum + (s.amount_egp || 0),
          0
        ) || 0;

      // Total agents
      const { count: totalAgents } = await supabase
        .from("sales_agents")
        .select("*", { count: "exact", head: true });

      // Active agents (agents with logs in the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data: recentLogs } = await supabase
        .from("agent_daily_logs")
        .select("agent_id")
        .gte("log_date", thirtyDaysAgo.toISOString());

      const activeAgentIds = new Set(recentLogs?.map((l) => l.agent_id) || []);
      const activeAgents = activeAgentIds.size;

      setData({
        totalUsers: totalUsers || 0,
        newUsersThisMonth: newUsersThisMonth || 0,
        activeSubscriptions,
        totalRevenue,
        revenueThisMonth,
        totalAgents: totalAgents || 0,
        activeAgents,
      });
    } catch (error) {
      console.error("Failed to load analytics:", error);
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

  const stats = [
    {
      title: "Total Users",
      value: data.totalUsers,
      change: `+${data.newUsersThisMonth} this month`,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Active Subscriptions",
      value: data.activeSubscriptions,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `${data.totalRevenue.toLocaleString()} EGP`,
      change: `${data.revenueThisMonth.toLocaleString()} EGP this month`,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Agents",
      value: data.totalAgents,
      change: `${data.activeAgents} active`,
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Analytics</h1>
          <p className="text-muted-foreground">
            System performance and usage statistics
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={dateRange === "week" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("week")}
          >
            Week
          </Button>
          <Button
            variant={dateRange === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("month")}
          >
            Month
          </Button>
          <Button
            variant={dateRange === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setDateRange("year")}
          >
            Year
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold mb-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-xs text-muted-foreground">
                      {stat.change}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Additional Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              User Growth
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              Chart visualization coming soon
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Revenue Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-center py-12 text-muted-foreground">
              Chart visualization coming soon
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

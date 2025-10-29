"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import { ArrowLeft, UserCircle, Phone, TrendingUp, Target, Users as UsersIcon, DollarSign, Loader2, Calendar, Clock, Star, Award, Crown, Activity } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { SalesAgent, MonthlyScore, DailyLog } from "@/lib/types";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Area, AreaChart } from "recharts";

export default function AgentDetailPage() {
  const params = useParams();
  const agentId = params.agentId as string;

  const [agent, setAgent] = useState<SalesAgent | null>(null);
  const [teamLeader, setTeamLeader] = useState<SalesAgent | null>(null);
  const [monthlyScore, setMonthlyScore] = useState<MonthlyScore | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    loadAgentData();
    // Set current month on client side to avoid hydration mismatch
    const now = new Date();
    setCurrentMonth(now.toLocaleString('default', { month: 'long', year: 'numeric' }));
  }, [agentId]);

  const loadAgentData = async () => {
    try {
      setLoading(true);

      // Load agent
      const { data: agentData, error: agentError } = await supabase
        .from("sales_agents")
        .select("*")
        .eq("id", agentId)
        .single();

      if (agentError) throw agentError;
      setAgent(agentData);

      // Load team leader if agent has one
      if (agentData.team_leader_id) {
        const { data: leader } = await supabase
          .from("sales_agents")
          .select("*")
          .eq("id", agentData.team_leader_id)
          .single();
        setTeamLeader(leader);
      }

      // Load current month score
      const now = new Date();
      const { data: scoreData, error: scoreError } = await supabase
        .from("agent_monthly_scores")
        .select("*")
        .eq("agent_id", agentId)
        .eq("year", now.getFullYear())
        .eq("month", now.getMonth() + 1)
        .single();

      if (!scoreError && scoreData) {
        setMonthlyScore(scoreData);
      }

      // Load daily logs for current month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

      const { data: logsData, error: logsError } = await supabase
        .from("agent_daily_logs")
        .select("*")
        .eq("agent_id", agentId)
        .gte("log_date", firstDay)
        .lte("log_date", lastDay)
        .order("log_date", { ascending: true });

      if (!logsError) {
        setDailyLogs(logsData || []);
      }
    } catch (error) {
      console.error("Error loading agent data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading agent details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!agent) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Agent not found</p>
            <Link href="/crm/sales">
              <Button>Back to Teams</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare daily trend data
  const dailyTrendData = dailyLogs.map(log => ({
    date: new Date(log.log_date).getDate(),
    calls: log.calls_count,
    meetings: log.meetings_count,
    sales: Number(log.sales_amount) / 1000, // In thousands
  }));

  // Prepare KPI radar data
  const radarData = monthlyScore ? [
    { metric: "Attendance", value: monthlyScore.kpis.attendance_month },
    { metric: "Calls", value: monthlyScore.kpis.calls_month },
    { metric: "Behavior", value: monthlyScore.kpis.behavior_month },
    { metric: "Meetings", value: monthlyScore.kpis.meetings_month },
    { metric: "Sales", value: monthlyScore.kpis.sales_score },
  ] : [];

  // Calculate total stats
  const totalCalls = dailyLogs.reduce((sum, log) => sum + log.calls_count, 0);
  const totalMeetings = dailyLogs.reduce((sum, log) => sum + log.meetings_count, 0);
  const totalSales = dailyLogs.reduce((sum, log) => sum + Number(log.sales_amount), 0);
  const totalLeads = dailyLogs.reduce((sum, log) => sum + log.leads_count, 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { label: "Excellent", color: "bg-green-500" };
    if (score >= 80) return { label: "Very Good", color: "bg-blue-500" };
    if (score >= 70) return { label: "Good", color: "bg-cyan-500" };
    if (score >= 60) return { label: "Fair", color: "bg-yellow-500" };
    return { label: "Needs Improvement", color: "bg-red-500" };
  };

  const badge = monthlyScore ? getScoreBadge(Number(monthlyScore.score)) : null;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Header */}
        <div>
          <Link href={teamLeader ? `/crm/teams/${teamLeader.id}` : "/crm/sales"}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {teamLeader ? "Team" : "Teams"}
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <UserCircle className="h-10 w-10" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-bold">{agent.full_name}</h1>
                  {badge && (
                    <span className={`${badge.color} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                      {badge.label}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    {agent.phone || "No phone"}
                  </span>
                  {teamLeader && (
                    <span className="flex items-center gap-2">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Reports to: {teamLeader.full_name}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {monthlyScore && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className={`text-5xl font-bold ${getScoreColor(Number(monthlyScore.score))}`}>
                  {Number(monthlyScore.score).toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-1">
                  <Calendar className="h-3 w-3" />
                  {currentMonth}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Phone className="h-8 w-8 text-green-500 opacity-50" />
              </div>
              <p className="text-2xl font-bold">{totalCalls}</p>
              <p className="text-xs text-muted-foreground">Total Calls</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <UsersIcon className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
              <p className="text-2xl font-bold">{totalMeetings}</p>
              <p className="text-xs text-muted-foreground">Total Meetings</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
              <p className="text-2xl font-bold">{(totalSales / 1000).toFixed(0)}K</p>
              <p className="text-xs text-muted-foreground">Total Sales (EGP)</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Star className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
              <p className="text-2xl font-bold">{totalLeads}</p>
              <p className="text-xs text-muted-foreground">Total Leads</p>
            </CardContent>
          </Card>
        </div>

        {!monthlyScore && dailyLogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Activity className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Performance Data</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Add daily logs for this agent to see detailed performance analytics.
              </p>
              <Link href="/crm/logs">
                <Button>Add Daily Log</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Charts Grid */}
            {monthlyScore && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart - KPIs */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Performance Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* KPI Bars */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5" />
                      KPI Scores
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { label: "Attendance", value: monthlyScore.kpis.attendance_month, color: "from-blue-500 to-blue-600", icon: Target },
                        { label: "Calls", value: monthlyScore.kpis.calls_month, color: "from-green-500 to-green-600", icon: Phone },
                        { label: "Behavior", value: monthlyScore.kpis.behavior_month, color: "from-purple-500 to-purple-600", icon: Star },
                        { label: "Meetings", value: monthlyScore.kpis.meetings_month, color: "from-cyan-500 to-cyan-600", icon: UsersIcon },
                        { label: "Sales", value: monthlyScore.kpis.sales_score, color: "from-orange-500 to-orange-600", icon: DollarSign },
                      ].map(({ label, value, color, icon: Icon }) => (
                        <div key={label} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {label}
                            </span>
                            <span className="text-sm font-bold">{value.toFixed(1)}%</span>
                          </div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r ${color} rounded-full transition-all`}
                              style={{ width: `${Math.min(value, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Daily Activity Trend */}
            {dailyTrendData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Daily Activity Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={dailyTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" label={{ value: 'Day of Month', position: 'insideBottom', offset: -5 }} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="calls" stackId="1" stroke="#10b981" fill="#10b981" name="Calls" />
                      <Area type="monotone" dataKey="meetings" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" name="Meetings" />
                      <Area type="monotone" dataKey="sales" stackId="1" stroke="#f59e0b" fill="#f59e0b" name="Sales (K EGP)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Recent Activity */}
            {dailyLogs.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {dailyLogs.slice().reverse().slice(0, 10).map((log) => (
                      <div key={log.id} className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border">
                        <div>
                          <p className="font-medium">
                            {new Date(log.log_date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {log.check_in && log.check_out 
                              ? `${log.check_in} - ${log.check_out}`
                              : 'No time data'
                            }
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {log.calls_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <UsersIcon className="h-3 w-3" />
                            {log.meetings_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {(Number(log.sales_amount) / 1000).toFixed(1)}K
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Loader2,
  Download,
  Calculator,
  Calendar,
  TrendingUp,
  BarChart3,
  Sparkles,
  Info,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Leaderboard } from "@/components/crm/leaderboard";
import { KpiOverviewCards } from "@/components/crm/kpi-overview-cards";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";
import type { AgentWithScore, MonthlyScore } from "@/lib/types";

export default function ReportPage() {
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [agentsWithScores, setAgentsWithScores] = useState<AgentWithScore[]>(
    []
  );
  const [aggregateKpis, setAggregateKpis] = useState<any>(null);

  useEffect(() => {
    loadScores();
  }, [year, month]);

  const loadScores = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Load agents
      const { data: agents, error: agentsError } = await supabase
        .from("sales_agents")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (agentsError) throw agentsError;

      // Load scores for the selected month
      const { data: scores, error: scoresError } = await supabase
        .from("agent_monthly_scores")
        .select("*")
        .eq("user_id", user.id)
        .eq("year", year)
        .eq("month", month);

      if (scoresError) throw scoresError;

      console.log(`Loaded ${scores?.length || 0} scores for ${month}/${year}`);

      // Merge agents with their scores
      const agentsWithScores: AgentWithScore[] = (agents || []).map(
        (agent) => {
          const score = (scores || []).find((s) => s.agent_id === agent.id);
          return {
            ...agent,
            score: score?.score,
            kpis: score?.kpis,
          };
        }
      );

      setAgentsWithScores(agentsWithScores);

      // Calculate aggregate KPIs (average across all agents)
      if (scores && scores.length > 0) {
        const totalAgents = scores.length;
        const aggregate = {
          attendance_month:
            scores.reduce((sum, s) => sum + s.kpis.attendance_month, 0) /
            totalAgents,
          calls_month:
            scores.reduce((sum, s) => sum + s.kpis.calls_month, 0) /
            totalAgents,
          behavior_month:
            scores.reduce((sum, s) => sum + s.kpis.behavior_month, 0) /
            totalAgents,
          meetings_month:
            scores.reduce((sum, s) => sum + s.kpis.meetings_month, 0) /
            totalAgents,
          sales_score:
            scores.reduce((sum, s) => sum + s.kpis.sales_score, 0) /
            totalAgents,
          leads_info: {
            leads_days_active: scores.reduce(
              (sum, s) => sum + s.kpis.leads_info.leads_days_active,
              0
            ),
            leads_total: scores.reduce(
              (sum, s) => sum + s.kpis.leads_info.leads_total,
              0
            ),
          },
        };
        setAggregateKpis(aggregate);
        console.log("Aggregate KPIs calculated:", aggregate);
      } else {
        setAggregateKpis(null);
        console.log("No scores found for this period");
      }
    } catch (error) {
      console.error("Error loading scores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateScores = async () => {
    setCalculating(true);
    try {
      // Get user ID first
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Not authenticated");
      }

      // Get active agents
      const { data: agents, error: agentsError } = await supabase
        .from("sales_agents")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true);

      if (agentsError) throw agentsError;
      if (!agents || agents.length === 0) {
        alert("No active agents found. Please add agents first.");
        setCalculating(false);
        return;
      }

      // Load KPI settings
      const { data: settingsData } = await supabase
        .from("agent_kpi_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      const settings = settingsData || {
        workday_start: "09:30",
        workday_end: "18:30",
        target_calls_per_day: 120,
        target_meetings_per_day: 2,
        target_sales_per_month: 2000000,
        weight_attendance: 25,
        weight_calls: 25,
        weight_behavior: 20,
        weight_meetings: 15,
        weight_sales: 15,
      };

      // Calculate start and end dates for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      let processed = 0;
      
      // Process each agent
      for (const agent of agents) {
        // Load all logs for this agent in the month
        const { data: logs, error: logsError } = await supabase
          .from("agent_daily_logs")
          .select("*")
          .eq("user_id", user.id)
          .eq("agent_id", agent.id)
          .gte("log_date", startDateStr)
          .lte("log_date", endDateStr)
          .order("log_date", { ascending: true });

        if (logsError) {
          console.error(`Error loading logs for agent ${agent.id}:`, logsError);
          continue;
        }

        if (!logs || logs.length === 0) continue;

        // Calculate scores (simplified version)
        const numDays = logs.length;
        
        // Attendance
        let attendanceSum = 0;
        // Calls
        let callsSum = 0;
        // Behavior
        let behaviorSum = 0;
        // Meetings
        let meetingsSum = 0;
        // Sales
        let salesSum = 0;
        // Leads (context only)
        let leadsTotal = 0;
        let leadsDaysActive = 0;

        logs.forEach((log: any) => {
          // Attendance
          if (!log.check_in && !log.check_out) {
            attendanceSum += 0; // absent
          } else {
            // Simplified: just count presence as 100
            attendanceSum += 100;
          }
          
          // Calls
          const callsRatio = log.calls_count / settings.target_calls_per_day;
          callsSum += Math.min(100, callsRatio * 100);
          
          // Behavior
          const avg = (log.appearance_score + log.ethics_score) / 2;
          behaviorSum += avg * 10;
          
          // Meetings
          const meetingsRatio = log.meetings_count / settings.target_meetings_per_day;
          meetingsSum += Math.min(100, meetingsRatio * 100);
          
          // Sales
          salesSum += log.sales_amount;
          
          // Leads (context only)
          leadsTotal += log.leads_count;
          if (log.leads_count > 0) leadsDaysActive++;
        });

        const attendance_month = attendanceSum / numDays;
        const calls_month = callsSum / numDays;
        const behavior_month = behaviorSum / numDays;
        const meetings_month = meetingsSum / numDays;
        const salesRatio = salesSum / settings.target_sales_per_month;
        const sales_score = Math.min(100, salesRatio * 100);

        // Final score
        const w_att = settings.weight_attendance / 100;
        const w_calls = settings.weight_calls / 100;
        const w_behavior = settings.weight_behavior / 100;
        const w_meetings = settings.weight_meetings / 100;
        const w_sales = settings.weight_sales / 100;

        const finalScore =
          attendance_month * w_att +
          calls_month * w_calls +
          behavior_month * w_behavior +
          meetings_month * w_meetings +
          sales_score * w_sales;

        const kpis = {
          attendance_month: Math.round(attendance_month * 100) / 100,
          calls_month: Math.round(calls_month * 100) / 100,
          behavior_month: Math.round(behavior_month * 100) / 100,
          meetings_month: Math.round(meetings_month * 100) / 100,
          sales_score: Math.round(sales_score * 100) / 100,
          leads_info: {
            leads_days_active: leadsDaysActive,
            leads_total: leadsTotal,
          },
        };

        // Upsert score
        const { error: upsertError } = await supabase
          .from("agent_monthly_scores")
          .upsert(
            {
              user_id: user.id,
              agent_id: agent.id,
              year,
              month,
              score: Math.round(finalScore * 100) / 100,
              kpis,
            },
            {
              onConflict: "user_id,agent_id,year,month",
            }
          );

        if (upsertError) {
          console.error("Error upserting score:", upsertError);
          continue;
        }

        processed++;
      }

      // Reload scores immediately after calculation
      await loadScores();
      
      // Show success message
      alert(`✅ Successfully calculated scores for ${processed} agent(s)!`);
    } catch (error: any) {
      console.error("Error calculating scores:", error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setCalculating(false);
    }
  };

  const handleExportCSV = () => {
    if (agentsWithScores.length === 0) {
      alert("No data to export");
      return;
    }

    // Prepare CSV data
    const headers = [
      "Agent Name",
      "Score",
      "Attendance %",
      "Calls %",
      "Behavior %",
      "Meetings %",
      "Sales %",
      "Leads Total",
      "Leads Active Days",
    ];

    const rows = agentsWithScores
      .filter((a) => a.score !== undefined)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((agent) => [
        agent.full_name,
        agent.score?.toFixed(2) || "N/A",
        agent.kpis?.attendance_month.toFixed(2) || "N/A",
        agent.kpis?.calls_month.toFixed(2) || "N/A",
        agent.kpis?.behavior_month.toFixed(2) || "N/A",
        agent.kpis?.meetings_month.toFixed(2) || "N/A",
        agent.kpis?.sales_score.toFixed(2) || "N/A",
        agent.kpis?.leads_info.leads_total || "0",
        agent.kpis?.leads_info.leads_days_active || "0",
      ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${year}-${month}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Prepare chart data
  const chartData = agentsWithScores
    .filter((a) => a.score !== undefined)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .slice(0, 10) // Top 10
    .map((agent) => ({
      name: agent.full_name.split(" ")[0], // First name
      score: agent.score?.toFixed(1),
      attendance: agent.kpis?.attendance_month.toFixed(1),
      calls: agent.kpis?.calls_month.toFixed(1),
      behavior: agent.kpis?.behavior_month.toFixed(1),
      meetings: agent.kpis?.meetings_month.toFixed(1),
      sales: agent.kpis?.sales_score.toFixed(1),
    }));

  // Radar chart data (aggregate)
  const radarData = aggregateKpis
    ? [
        {
          metric: "Attendance",
          value: aggregateKpis.attendance_month,
        },
        {
          metric: "Calls",
          value: aggregateKpis.calls_month,
        },
        {
          metric: "Behavior",
          value: aggregateKpis.behavior_month,
        },
        {
          metric: "Meetings",
          value: aggregateKpis.meetings_month,
        },
        {
          metric: "Sales",
          value: aggregateKpis.sales_score,
        },
      ]
    : [];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with gradient icon */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Performance Analytics</h1>
              <p className="text-muted-foreground">
                Track team performance and identify top performers
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <Info className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">How it Works</h3>
                <ol className="text-sm text-muted-foreground space-y-1">
                  <li>1. Select the month and year you want to analyze</li>
                  <li>2. Click "Calculate Scores" to process all daily logs</li>
                  <li>3. View the leaderboard, KPI breakdown, and charts</li>
                  <li>4. Export data as CSV for further analysis</li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Period Selector & Actions */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex gap-3">
                  <Select
                    value={year.toString()}
                    onValueChange={(v) => setYear(parseInt(v))}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map((y) => (
                        <SelectItem key={y} value={y.toString()}>
                          {y}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={month.toString()}
                    onValueChange={(v) => setMonth(parseInt(v))}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((m, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCalculateScores}
                  disabled={calculating}
                  className="gradient-bg"
                >
                  {calculating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Calculate Scores
                    </>
                  )}
                </Button>
                <Button onClick={handleExportCSV} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading performance data...</p>
            </CardContent>
          </Card>
        ) : agentsWithScores.length === 0 || !aggregateKpis ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Performance Data</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Click "Calculate Scores" above to process daily logs and generate performance analytics for {months[month - 1]} {year}.
              </p>
              <Button onClick={handleCalculateScores} className="gradient-bg" disabled={calculating}>
                {calculating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Calculating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Calculate Scores Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* KPI Overview Cards */}
            <KpiOverviewCards kpis={aggregateKpis} />

            {/* Charts */}
            {chartData.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2">
                {/* Bar Chart - Top Performers */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Top Performers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="score"
                          fill="hsl(var(--primary))"
                          name="Score"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Radar Chart - Team Average */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Average KPIs</CardTitle>
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
                          stroke="hsl(var(--primary))"
                          fill="hsl(var(--primary))"
                          fillOpacity={0.6}
                        />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Leaderboard */}
            <Leaderboard agents={agentsWithScores} />
          </div>
        )}
      </motion.div>
    </div>
  );
}


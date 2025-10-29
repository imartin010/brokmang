"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Crown, UserCircle, TrendingUp, Phone, Target, Users as UsersIcon, DollarSign, Loader2, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { SalesAgent, MonthlyScore } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";

export default function TeamDetailPage() {
  const params = useParams();
  const router = useRouter();
  const teamLeaderId = params.teamLeaderId as string;

  const [teamLeader, setTeamLeader] = useState<SalesAgent | null>(null);
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [scores, setScores] = useState<MonthlyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>("");

  useEffect(() => {
    loadTeamData();
    // Set current month on client side to avoid hydration mismatch
    const now = new Date();
    setCurrentMonth(now.toLocaleString('default', { month: 'short', year: 'numeric' }));
  }, [teamLeaderId]);

  const loadTeamData = async () => {
    try {
      setLoading(true);

      // Load team leader
      const { data: leader, error: leaderError } = await supabase
        .from("sales_agents")
        .select("*")
        .eq("id", teamLeaderId)
        .single();

      if (leaderError) throw leaderError;
      setTeamLeader(leader);

      // Load agents under this team leader
      const { data: teamAgents, error: agentsError } = await supabase
        .from("sales_agents")
        .select("*")
        .eq("team_leader_id", teamLeaderId)
        .eq("is_active", true)
        .order("full_name");

      if (agentsError) throw agentsError;
      setAgents(teamAgents || []);

      // Load current month scores
      const now = new Date();
      const { data: scoresData, error: scoresError } = await supabase
        .from("agent_monthly_scores")
        .select("*")
        .eq("year", now.getFullYear())
        .eq("month", now.getMonth() + 1);

      if (scoresError) throw scoresError;
      setScores(scoresData || []);
    } catch (error) {
      console.error("Error loading team data:", error);
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
            <p className="text-muted-foreground">Loading team details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!teamLeader) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-7xl">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">Team leader not found</p>
            <Link href="/crm/sales">
              <Button>Back to Teams</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate team averages
  const teamAgentIds = agents.map(a => a.id);
  const teamScores = scores.filter(s => teamAgentIds.includes(s.agent_id));
  
  const avgScore = teamScores.length > 0
    ? teamScores.reduce((sum, s) => sum + Number(s.score), 0) / teamScores.length
    : 0;

  // Prepare radar chart data
  const radarData = teamScores.length > 0 ? [
    {
      metric: "Attendance",
      value: teamScores.reduce((sum, s) => sum + (s.kpis.attendance_month || 0), 0) / teamScores.length,
    },
    {
      metric: "Calls",
      value: teamScores.reduce((sum, s) => sum + (s.kpis.calls_month || 0), 0) / teamScores.length,
    },
    {
      metric: "Behavior",
      value: teamScores.reduce((sum, s) => sum + (s.kpis.behavior_month || 0), 0) / teamScores.length,
    },
    {
      metric: "Meetings",
      value: teamScores.reduce((sum, s) => sum + (s.kpis.meetings_month || 0), 0) / teamScores.length,
    },
    {
      metric: "Sales",
      value: teamScores.reduce((sum, s) => sum + (s.kpis.sales_score || 0), 0) / teamScores.length,
    },
  ] : [];

  // Prepare bar chart data (compare agents)
  const barChartData = agents.map(agent => {
    const agentScore = scores.find(s => s.agent_id === agent.id);
    return {
      name: agent.full_name.split(' ')[0], // First name only
      score: agentScore ? Number(agentScore.score) : 0,
      attendance: agentScore?.kpis.attendance_month || 0,
      calls: agentScore?.kpis.calls_month || 0,
      meetings: agentScore?.kpis.meetings_month || 0,
      sales: agentScore?.kpis.sales_score || 0,
    };
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="mb-8">
          <Link href="/crm/sales">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Teams
            </Button>
          </Link>

          <div className="flex items-center gap-4 mb-2">
            <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">{teamLeader.full_name}'s Team</h1>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Phone className="h-4 w-4" />
                {teamLeader.phone || "No phone"}
              </p>
            </div>
          </div>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-3xl font-bold">{agents.length}</p>
                </div>
                <UsersIcon className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Score</p>
                  <p className={`text-3xl font-bold ${getScoreColor(avgScore)}`}>
                    {avgScore.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Performer</p>
                  <p className="text-lg font-bold">
                    {barChartData.length > 0 
                      ? barChartData.sort((a, b) => b.score - a.score)[0]?.name || "N/A"
                      : "N/A"
                    }
                  </p>
                </div>
                <Target className="h-8 w-8 text-amber-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Period</p>
                  <p className="text-lg font-bold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {currentMonth}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {agents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <UserCircle className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No Team Members</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                This team leader doesn't have any agents assigned yet.
              </p>
              <Link href="/crm/sales">
                <Button>Assign Agents</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Charts */}
            {teamScores.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Radar Chart - Team Average KPIs */}
                <Card>
                  <CardHeader>
                    <CardTitle>Team Average Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis domain={[0, 100]} />
                        <Radar
                          name="Team Avg"
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

                {/* Bar Chart - Agent Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Agent Performance Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="score" fill="#8884d8" name="Overall Score" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Agent Cards */}
            <div>
              <h3 className="text-xl font-semibold mb-4">Team Members</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {agents.map((agent) => {
                  const agentScore = scores.find(s => s.agent_id === agent.id);
                  return (
                    <Link key={agent.id} href={`/crm/agents/${agent.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="cursor-pointer hover:border-primary transition-all">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <UserCircle className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-lg">{agent.full_name}</CardTitle>
                              </div>
                              {agentScore && (
                                <span className={`text-xl font-bold ${getScoreColor(Number(agentScore.score))}`}>
                                  {Number(agentScore.score).toFixed(0)}%
                                </span>
                              )}
                            </div>
                          </CardHeader>
                          <CardContent>
                            {agentScore ? (
                              <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <Target className="h-3 w-3" />
                                    Attendance
                                  </span>
                                  <span className="font-semibold">
                                    {agentScore.kpis.attendance_month.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    Calls
                                  </span>
                                  <span className="font-semibold">
                                    {agentScore.kpis.calls_month.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <UsersIcon className="h-3 w-3" />
                                    Meetings
                                  </span>
                                  <span className="font-semibold">
                                    {agentScore.kpis.meetings_month.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                  <span className="flex items-center gap-1">
                                    <DollarSign className="h-3 w-3" />
                                    Sales
                                  </span>
                                  <span className="font-semibold">
                                    {agentScore.kpis.sales_score.toFixed(0)}%
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground italic py-4 text-center">
                                No performance data
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}


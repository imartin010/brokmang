"use client";

import { motion } from "framer-motion";
import { Crown, UserCircle, TrendingUp, ChevronRight, Target, Phone, Users as UsersIcon, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { SalesAgent, MonthlyScore } from "@/lib/types";

type TeamCardProps = {
  teamLeader: SalesAgent;
  agents: SalesAgent[];
  scores: MonthlyScore[];
};

export function TeamCard({ teamLeader, agents, scores }: TeamCardProps) {
  // Calculate team average KPIs
  const teamAgentIds = agents.map(a => a.id);
  const teamScores = scores.filter(s => teamAgentIds.includes(s.agent_id));
  
  const avgScore = teamScores.length > 0
    ? teamScores.reduce((sum, s) => sum + Number(s.score), 0) / teamScores.length
    : 0;
  
  const avgAttendance = teamScores.length > 0
    ? teamScores.reduce((sum, s) => sum + (s.kpis.attendance_month || 0), 0) / teamScores.length
    : 0;
  
  const avgCalls = teamScores.length > 0
    ? teamScores.reduce((sum, s) => sum + (s.kpis.calls_month || 0), 0) / teamScores.length
    : 0;
  
  const avgMeetings = teamScores.length > 0
    ? teamScores.reduce((sum, s) => sum + (s.kpis.meetings_month || 0), 0) / teamScores.length
    : 0;
  
  const avgSales = teamScores.length > 0
    ? teamScores.reduce((sum, s) => sum + (s.kpis.sales_score || 0), 0) / teamScores.length
    : 0;

  // Get score color
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-2 hover:border-primary/50 transition-all">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-b-2 border-amber-200 dark:border-amber-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500 text-white">
                <Crown className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{teamLeader.full_name}</CardTitle>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <Phone className="h-3 w-3" />
                  {teamLeader.phone || "No phone"}
                </p>
              </div>
            </div>
            <Link href={`/crm/teams/${teamLeader.id}`}>
              <Button variant="ghost" size="sm" className="gap-2">
                View Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Team Members */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold mb-3 text-muted-foreground">
              Team Members ({agents.length})
            </h4>
            {agents.length === 0 ? (
              <p className="text-sm text-muted-foreground italic py-4 text-center">
                No agents assigned yet
              </p>
            ) : (
              <div className="space-y-2">
                {agents.map((agent) => {
                  const agentScore = scores.find(s => s.agent_id === agent.id);
                  return (
                    <Link key={agent.id} href={`/crm/agents/${agent.id}`}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent cursor-pointer transition-all border border-transparent hover:border-primary/30"
                      >
                        <div className="flex items-center gap-3">
                          <UserCircle className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{agent.full_name}</span>
                        </div>
                        {agentScore && (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getScoreColor(Number(agentScore.score))}`}>
                              {Number(agentScore.score).toFixed(1)}%
                            </span>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Team Average KPIs */}
          {teamScores.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-muted-foreground">
                  Team Average Performance
                </h4>
                <div className={`text-2xl font-bold ${getScoreColor(avgScore)}`}>
                  {avgScore.toFixed(1)}%
                </div>
              </div>

              {/* KPI Bars */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Attendance
                    </span>
                    <span className="font-semibold">{avgAttendance.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                      style={{ width: `${Math.min(avgAttendance, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      Calls
                    </span>
                    <span className="font-semibold">{avgCalls.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                      style={{ width: `${Math.min(avgCalls, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <UsersIcon className="h-3 w-3" />
                      Meetings
                    </span>
                    <span className="font-semibold">{avgMeetings.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full"
                      style={{ width: `${Math.min(avgMeetings, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      Sales
                    </span>
                    <span className="font-semibold">{avgSales.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                      style={{ width: `${Math.min(avgSales, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* View Team Details Button */}
              <Link href={`/crm/teams/${teamLeader.id}`}>
                <Button variant="outline" className="w-full gap-2" size="sm">
                  <TrendingUp className="h-4 w-4" />
                  View Detailed Analytics
                </Button>
              </Link>
            </div>
          )}

          {teamScores.length === 0 && agents.length > 0 && (
            <div className="text-center py-6 text-muted-foreground text-sm">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No performance data yet</p>
              <p className="text-xs mt-1">Add daily logs to see KPIs</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}


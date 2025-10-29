"use client";

import { motion } from "framer-motion";
import { Trophy, Medal, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AgentWithScore } from "@/lib/types";

type LeaderboardProps = {
  agents: AgentWithScore[];
};

export function Leaderboard({ agents }: LeaderboardProps) {
  // Sort agents by score descending
  const sortedAgents = [...agents]
    .filter((a) => a.score !== undefined)
    .sort((a, b) => (b.score || 0) - (a.score || 0))
    .map((agent, index) => ({ ...agent, rank: index + 1 }));

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-700" />;
      default:
        return <span className="text-sm text-muted-foreground">#{rank}</span>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-blue-600 dark:text-blue-400";
    if (score >= 40) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (sortedAgents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
          <CardDescription>No performance data available yet</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Add daily logs and calculate scores to see the leaderboard.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Leaderboard</CardTitle>
        <CardDescription>
          Top performers ranked by monthly score
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                index < 3 ? "bg-muted/50" : "bg-card"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(agent.rank!)}
                </div>
                <div>
                  <h4 className="font-semibold">{agent.full_name}</h4>
                  {agent.kpis && (
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span>
                        Att: {agent.kpis.attendance_month.toFixed(0)}%
                      </span>
                      <span>Calls: {agent.kpis.calls_month.toFixed(0)}%</span>
                      <span>
                        Behavior: {agent.kpis.behavior_month.toFixed(0)}%
                      </span>
                      <span>
                        Meetings: {agent.kpis.meetings_month.toFixed(0)}%
                      </span>
                      <span>Sales: {agent.kpis.sales_score.toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div
                  className={`text-2xl font-bold ${getScoreColor(
                    agent.score!
                  )}`}
                >
                  {agent.score!.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">Score</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


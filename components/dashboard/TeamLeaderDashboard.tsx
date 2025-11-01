/**
 * Team Leader Dashboard Component
 * Team management focused view
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Users,
  Calendar,
  BarChart3,
  Target,
  FileText,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  CheckCircle,
  Clock,
  Award,
  Loader2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-browser';

export default function TeamLeaderDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    teamMembers: 0,
    teamScore: 0,
    tasksToday: 0,
    topPerformer: null as { name: string; score: number } | null,
  });
  const [priorities, setPriorities] = useState<Array<{ title: string; time: string; completed: boolean }>>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get active team members count
      const { count: teamCount } = await supabase
        .from('sales_agents')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Get current month scores for team score calculation
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      
      const { data: currentScores } = await supabase
        .from('agent_monthly_scores')
        .select('score, agent_id')
        .eq('year', currentYear)
        .eq('month', currentMonth);

      // Calculate average team score
      const avgScore = currentScores && currentScores.length > 0
        ? Math.round(currentScores.reduce((sum, s) => sum + (s.score || 0), 0) / currentScores.length)
        : 0;

      // Get top performer
      let topPerformer = null;
      if (currentScores && currentScores.length > 0) {
        const sorted = [...currentScores].sort((a, b) => (b.score || 0) - (a.score || 0));
        if (sorted[0]) {
          const { data: agent } = await supabase
            .from('sales_agents')
            .select('full_name')
            .eq('id', sorted[0].agent_id)
            .maybeSingle();
          
          if (agent) {
            topPerformer = {
              name: agent.full_name || 'Unknown',
              score: sorted[0].score || 0,
            };
          }
        }
      }

      setStats({
        teamMembers: teamCount || 0,
        teamScore: avgScore,
        tasksToday: 0, // Will be calculated from actual tasks when implemented
        topPerformer,
      });

      // Clear priorities for now (can be populated from actual tasks)
      setPriorities([]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
          Team Leader Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your team and track performance metrics
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Team Members</p>
                  <p className="text-2xl font-bold">{stats.teamMembers}</p>
                  <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    {stats.teamMembers > 0 ? 'Active' : 'No members yet'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500/10">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Team Score</p>
                  <p className="text-2xl font-bold">{stats.teamScore}%</p>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <Target className="h-3 w-3" />
                    {stats.teamScore > 0 ? 'Average score' : 'No data yet'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <Target className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Tasks Today</p>
                  <p className="text-2xl font-bold">{stats.tasksToday}</p>
                  <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" />
                    {stats.tasksToday > 0 ? 'Active tasks' : 'No tasks'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-500/10">
                  <Calendar className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Top Performer</p>
                  <p className="text-xl font-bold">{stats.topPerformer?.name || '—'}</p>
                  <p className="text-xs text-purple-500 flex items-center gap-1 mt-1">
                    <Award className="h-3 w-3" />
                    {stats.topPerformer ? `${stats.topPerformer.score}% score` : 'No data yet'}
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Award className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Team Management */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage your team members and track their activities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/crm/sales">
                <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <Users className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">My Team</h3>
                        <p className="text-xs text-muted-foreground">
                          View all team members
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/crm/logs">
                <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                        <Calendar className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Daily Logs</h3>
                        <p className="text-xs text-muted-foreground">
                          Record daily activities
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/crm/report">
                <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                        <BarChart3 className="h-5 w-5 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Team Report</h3>
                        <p className="text-xs text-muted-foreground">
                          Performance analytics
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Priorities */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today's Priorities
              </CardTitle>
              <CardDescription>
                Key tasks and activities for today
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorities.length > 0 ? (
                priorities.map((priority, index) => (
                  <div key={index} className="p-4 rounded-lg bg-accent/50">
                    <div className="flex items-center gap-3 mb-2">
                      {priority.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <Clock className="h-5 w-5 text-orange-500" />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium">{priority.title}</h4>
                        <p className="text-xs text-muted-foreground">{priority.time}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 rounded-lg bg-accent/50 text-center text-muted-foreground">
                  <p className="text-sm">No priorities set yet</p>
                  <p className="text-xs mt-1">Your tasks and priorities will appear here</p>
                </div>
              )}

              <Link href="/crm/logs">
                <Button className="w-full gradient-bg">
                  <Calendar className="mr-2 h-4 w-4" />
                  Update Daily Logs
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Reports & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Link href="/reports">
            <Card className="glass hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                    <FileText className="h-8 w-8 text-purple-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">Team Reports</h3>
                    <p className="text-muted-foreground mb-4">
                      View detailed performance reports and metrics for your team
                    </p>
                    <Button className="gradient-bg group-hover:scale-105 transition-transform">
                      View Reports
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Link href="/insights">
            <Card className="glass hover:shadow-lg transition-all cursor-pointer group h-full">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors">
                    <Lightbulb className="h-8 w-8 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">AI Insights</h3>
                    <p className="text-muted-foreground mb-4">
                      Get smart recommendations to improve team performance
                    </p>
                    <Button className="gradient-bg group-hover:scale-105 transition-transform">
                      View Insights
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </div>

      {/* Welcome Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="glass border-2 border-primary/20">
          <CardContent className="p-8">
            <div className="flex items-start gap-6">
              <div className="p-4 rounded-full bg-primary/10">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">
                  Welcome to Your Team Leader Hub
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  As a Team Leader, you have the tools to effectively manage your team, track their performance, 
                  and help them achieve their goals. Use daily logs to monitor activities, review reports to identify 
                  trends, and leverage AI insights to make informed decisions that drive success.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/crm/sales">
                    <Button className="gradient-bg">
                      <Users className="mr-2 h-4 w-4" />
                      View My Team
                    </Button>
                  </Link>
                  <Link href="/crm/logs">
                    <Button variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Update Logs
                    </Button>
                  </Link>
                  <Link href="/crm/settings">
                    <Button variant="outline">
                      <Target className="mr-2 h-4 w-4" />
                      KPI Settings
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


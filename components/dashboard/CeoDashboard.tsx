/**
 * CEO Dashboard Component
 * Comprehensive view with financial tools, team management, and analytics
 */

'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Users,
  PieChart as PieChartIcon,
  Calculator,
  History,
  BarChart3,
  Target,
  FileText,
  Lightbulb,
  Calendar,
  ArrowRight,
  TrendingDown,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CeoDashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
          CEO Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete overview of your brokerage performance and operations
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
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold">EGP 2.4M</p>
                  <p className="text-xs text-green-500 flex items-center gap-1 mt-1">
                    <TrendingUp className="h-3 w-3" />
                    +12% from last month
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500/10">
                  <DollarSign className="h-6 w-6 text-green-500" />
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
                  <p className="text-sm text-muted-foreground mb-1">Active Agents</p>
                  <p className="text-2xl font-bold">24</p>
                  <p className="text-xs text-blue-500 flex items-center gap-1 mt-1">
                    <Users className="h-3 w-3" />
                    3 teams
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
          transition={{ delay: 0.3 }}
        >
          <Card className="glass">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Operating Cost</p>
                  <p className="text-2xl font-bold">EGP 840K</p>
                  <p className="text-xs text-orange-500 flex items-center gap-1 mt-1">
                    <TrendingDown className="h-3 w-3" />
                    35% of revenue
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-500/10">
                  <PieChartIcon className="h-6 w-6 text-orange-500" />
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
                  <p className="text-sm text-muted-foreground mb-1">Avg Performance</p>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-purple-500 flex items-center gap-1 mt-1">
                    <Target className="h-3 w-3" />
                    Excellent
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500/10">
                  <BarChart3 className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Financial Tools Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Financial Tools
              </CardTitle>
              <CardDescription>
                Comprehensive financial analysis and planning
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/analyze">
                <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Calculator className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Break-Even Analysis</h3>
                        <p className="text-xs text-muted-foreground">
                          Calculate costs and profitability
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>

              <Link href="/history">
                <div className="p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors cursor-pointer group">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <History className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Analysis History</h3>
                        <p className="text-xs text-muted-foreground">
                          View saved financial scenarios
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>

              <div className="p-4 rounded-lg border-2 border-dashed border-border">
                <p className="text-sm text-muted-foreground text-center">
                  📊 Financial reports and forecasting coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Team Management Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Team Management
              </CardTitle>
              <CardDescription>
                Manage your sales teams and track performance
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
                        <h3 className="font-semibold">Sales Agents</h3>
                        <p className="text-xs text-muted-foreground">
                          View and manage team members
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
                          Track daily activities and performance
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
                        <h3 className="font-semibold">Performance Report</h3>
                        <p className="text-xs text-muted-foreground">
                          Detailed performance analytics
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
                    <h3 className="text-xl font-semibold mb-2">Reports</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate comprehensive performance reports and export data
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
                      Get intelligent recommendations to improve business performance
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
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-3">
                  Welcome to Your CEO Command Center
                </h2>
                <p className="text-muted-foreground mb-4 leading-relaxed">
                  As a CEO, you have complete visibility and control over your brokerage operations. 
                  Access powerful financial analysis tools, manage your sales teams, track performance metrics, 
                  and make data-driven decisions to grow your business.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/analyze">
                    <Button className="gradient-bg">
                      <Calculator className="mr-2 h-4 w-4" />
                      Start Financial Analysis
                    </Button>
                  </Link>
                  <Link href="/crm/sales">
                    <Button variant="outline">
                      <Users className="mr-2 h-4 w-4" />
                      Manage Teams
                    </Button>
                  </Link>
                  <Link href="/crm/settings">
                    <Button variant="outline">
                      <Target className="mr-2 h-4 w-4" />
                      Configure KPIs
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


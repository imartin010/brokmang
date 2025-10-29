"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  Users,
  PieChart as PieChartIcon,
  RefreshCw,
} from "lucide-react";
import { KPICard } from "@/components/kpi-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { DEFAULT_INPUTS } from "@/lib/schemas";
import { Results, Inputs } from "@/lib/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase-browser";

export default function Dashboard() {
  const [results, setResults] = useState<Results | null>(null);
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    loadLatestScenario();
  }, []);

  const loadLatestScenario = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      setUser(currentUser);

      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Fetch the most recent scenario
      const { data, error } = await supabase
        .from("break_even_records")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log("No saved scenarios yet:", error.message);
        setLoading(false);
        return;
      }

      if (data) {
        console.log("✅ Loaded latest scenario from database");
        setInputs(data.inputs);
        setResults(data.results);
      }
    } catch (error) {
      console.error("Error loading scenario:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
            Analysis Dashboard
          </h1>
          <p className="text-muted-foreground">
            Your comprehensive break-even analysis results
          </p>
        </motion.div>

        <Card className="glass max-w-2xl mx-auto">
          <CardContent className="text-center py-16">
            <div className="mb-6">
              <TrendingUp className="h-20 w-20 mx-auto text-primary mb-4" />
            </div>
            <h2 className="text-2xl font-bold mb-3">
              {user ? "No Saved Scenarios Yet" : "Ready to Analyze Your Brokerage?"}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {user 
                ? "Start by creating your first analysis. Enter your business parameters to calculate cost per seat and break-even point."
                : "Sign in and enter your business parameters to calculate cost per seat, operating expenses, and discover your break-even point with detailed financial breakdowns."
              }
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/analyze">
                <Button className="gradient-bg" size="lg">
                  <PieChartIcon className="mr-2 h-5 w-5" />
                  Start Analysis
                </Button>
              </Link>
            </div>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 rounded-lg bg-accent/50">
                <Users className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Team Structure</h3>
                <p className="text-sm text-muted-foreground">
                  Configure agents, team leaders, and costs
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/50">
                <DollarSign className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Financial Details</h3>
                <p className="text-sm text-muted-foreground">
                  Set commissions, rates, and expenses
                </p>
              </div>
              <div className="p-4 rounded-lg bg-accent/50">
                <PieChartIcon className="h-8 w-8 text-primary mb-2" />
                <h3 className="font-semibold mb-1">Instant Results</h3>
                <p className="text-sm text-muted-foreground">
                  Get break-even analysis with charts
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Data for cost breakdown pie chart
  const costBreakdownData = [
    { name: "Rent", value: inputs.rent },
    { name: "Salary", value: inputs.salary },
    { name: "TL Share", value: inputs.team_leader_share },
    { name: "Marketing", value: inputs.marketing },
    { name: "Others", value: inputs.others },
    { name: "SIM", value: inputs.sim },
  ];

  // Data for income tax sensitivity analysis
  const sensitivityData = Array.from({ length: 6 }, (_, i) => {
    const taxRate = 0.07 + i * 0.01;
    const grossPer1M = 1_000_000 * inputs.gross_rate;
    const commissionsPer1M =
      inputs.agent_comm_per_1m + inputs.tl_comm_per_1m;
    const taxesPer1M =
      grossPer1M *
      (inputs.withholding + inputs.vat + taxRate);
    const netPer1M = grossPer1M - commissionsPer1M - taxesPer1M;
    const breakEvenSales =
      results.total_operating_cost / (netPer1M / 1_000_000);

    return {
      tax: `${(taxRate * 100).toFixed(0)}%`,
      breakEven: breakEvenSales / 1_000_000,
    };
  });

  const COLORS = ["#257CFF", "#F45A2A", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
          Analysis Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time insights from your most recent saved scenario
        </p>
        <div className="flex gap-3 mt-4">
          <Link href="/analyze">
            <Button className="gradient-bg">
              <PieChartIcon className="mr-2 h-4 w-4" />
              New Analysis
            </Button>
          </Link>
          <Button variant="outline" onClick={loadLatestScenario}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          title="Cost Per Seat"
          value={formatCurrency(results.cost_per_seat)}
          subtitle="Monthly operational cost per agent"
          icon={Users}
          gradient="from-blue-500 to-cyan-500"
          delay={0.1}
        />
        <KPICard
          title="Total Operating Cost"
          value={formatCurrency(results.total_operating_cost)}
          subtitle="Total monthly expenses"
          icon={DollarSign}
          gradient="from-purple-500 to-pink-500"
          delay={0.2}
        />
        <KPICard
          title="Net Revenue Per 1M"
          value={formatCurrency(results.net_rev_per_1m)}
          subtitle="Profit per 1M EGP in sales"
          icon={TrendingUp}
          gradient="from-green-500 to-emerald-500"
          delay={0.3}
        />
        <KPICard
          title="Break-Even Sales"
          value={`${formatNumber(results.break_even_sales_million, 2)}M`}
          subtitle={formatCurrency(results.break_even_sales_egp)}
          icon={PieChartIcon}
          gradient="from-orange-500 to-red-500"
          delay={0.4}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Cost Per Seat Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Income Tax Sensitivity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="glass">
            <CardHeader>
              <CardTitle>Income Tax Sensitivity (7-12%)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={sensitivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tax" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) =>
                      `${formatNumber(value, 2)}M EGP`
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="breakEven"
                    stroke="#257CFF"
                    strokeWidth={2}
                    name="Break-Even (Million EGP)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Calculation Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="glass">
          <CardHeader>
            <CardTitle>Calculation Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {results?.steps?.map((step, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg bg-accent/50 border"
                >
                  <p className="text-sm text-muted-foreground mb-1">
                    {step.label}
                  </p>
                  <p className="text-lg font-bold">
                    {formatCurrency(step.value)}
                  </p>
                  {step.note && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.note}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


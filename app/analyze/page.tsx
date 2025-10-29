"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Save, RefreshCw, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DEFAULT_INPUTS, inputsSchema } from "@/lib/schemas";
import { Inputs, Results } from "@/lib/types";
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { KPICard } from "@/components/kpi-card";
import { DollarSign, TrendingUp, Users, PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useRouter } from "next/navigation";

export default function AnalyzePage() {
  const router = useRouter();
  const [inputs, setInputs] = useState<Inputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [user, setUser] = useState<any>(null);
  const [usePerAgentRent, setUsePerAgentRent] = useState(true);
  const [totalOfficeRent, setTotalOfficeRent] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Calculate rent per agent when total rent changes
  useEffect(() => {
    if (!usePerAgentRent && totalOfficeRent > 0) {
      const totalPeople = inputs.agents + inputs.team_leaders;
      if (totalPeople > 0) {
        const rentPerAgent = totalOfficeRent / totalPeople;
        setInputs(prev => ({ ...prev, rent: Math.round(rentPerAgent * 100) / 100 }));
      }
    }
  }, [usePerAgentRent, totalOfficeRent, inputs.agents, inputs.team_leaders]);

  const handleInputChange = (field: keyof Inputs, value: string) => {
    const numValue = parseFloat(value);
    setInputs((prev) => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
    // Clear error for this field
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  };

  // Smart focus handler: select all text, or clear if value is 0
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (value === 0) {
      e.target.select(); // Select the 0 so it gets replaced when typing
    } else {
      e.target.select(); // Select all for easy editing
    }
  };

  const handleCalculate = async () => {
    try {
      setLoading(true);
      setErrors({});

      // Validate inputs
      const validation = inputsSchema.safeParse(inputs);
      if (!validation.success) {
        const fieldErrors: Record<string, string> = {};
        validation.error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
        return;
      }

      // Calculate
      const response = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inputs),
      });

      if (!response.ok) {
        throw new Error("Calculation failed");
      }

      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error calculating:", error);
      alert("Failed to calculate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert("Please sign in to save scenarios");
      router.push("/auth");
      return;
    }

    if (!results) {
      alert("Please calculate first");
      return;
    }

    try {
      setSaving(true);

      const { error } = await supabase.from("break_even_records").insert({
        user_id: user.id,
        inputs,
        results,
      });

      if (error) throw error;

      alert("✅ Scenario saved successfully! Redirecting to dashboard...");
      
      // Redirect to dashboard to see the saved data
      setTimeout(() => {
        router.push("/");
      }, 500);
    } catch (error) {
      console.error("Error saving:", error);
      alert("❌ Failed to save scenario");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setResults(null);
    setErrors({});
  };

  // Data for revenue breakdown pie chart
  const revenueBreakdownData = results
    ? [
        { name: "Net Revenue", value: results.net_rev_per_1m },
        { name: "Commissions", value: results.commissions_per_1m },
        { name: "Taxes", value: results.taxes_per_1m },
      ]
    : [];

  const COLORS = ["#10B981", "#F59E0B", "#EF4444"];

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#257CFF] to-[#F45A2A] bg-clip-text text-transparent">
          Break-Even Analysis Tool
        </h1>
        <p className="text-muted-foreground">
          Customize parameters and calculate your brokerage&apos;s break-even point
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Structure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agents">Number of Agents</Label>
                <Input
                  id="agents"
                  type="number"
                  value={inputs.agents}
                  onChange={(e) => handleInputChange("agents", e.target.value)}
                  onFocus={handleFocus}
                  className={errors.agents ? "border-red-500" : ""}
                />
                {errors.agents && (
                  <p className="text-xs text-red-500 mt-1">{errors.agents}</p>
                )}
              </div>
              <div>
                <Label htmlFor="team_leaders">Number of Team Leaders</Label>
                <Input
                  id="team_leaders"
                  type="number"
                  value={inputs.team_leaders}
                  onChange={(e) =>
                    handleInputChange("team_leaders", e.target.value)
                  }
                  onFocus={handleFocus}
                  className={errors.team_leaders ? "border-red-500" : ""}
                />
                {errors.team_leaders && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.team_leaders}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Per-Agent Monthly Costs (EGP)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rent Section with Smart Calculator */}
              <div className="space-y-3 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20">
                <div className="flex items-center justify-between">
                  <Label htmlFor="rent" className="text-base font-semibold">
                    Rent Per Agent
                  </Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!usePerAgentRent}
                      onChange={(e) => {
                        setUsePerAgentRent(!e.target.checked);
                        if (e.target.checked) {
                          setTotalOfficeRent(0);
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <span className="text-sm text-muted-foreground">
                      Calculate from total office rent
                    </span>
                  </label>
                </div>

                {usePerAgentRent ? (
                  <div>
                    <Input
                      id="rent"
                      type="number"
                      value={inputs.rent}
                      onChange={(e) => handleInputChange("rent", e.target.value)}
                      onFocus={handleFocus}
                      className={errors.rent ? "border-red-500" : ""}
                      placeholder="Enter rent per agent"
                    />
                    {errors.rent && (
                      <p className="text-xs text-red-500 mt-1">{errors.rent}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Monthly rent cost per agent/team leader
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="totalRent" className="text-sm">
                        Total Office Rent (Monthly)
                      </Label>
                      <Input
                        id="totalRent"
                        type="number"
                        value={totalOfficeRent}
                        onChange={(e) => setTotalOfficeRent(parseFloat(e.target.value) || 0)}
                        onFocus={(e) => e.target.select()}
                        placeholder="Enter total office rent"
                        className="mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Total monthly rent for your entire office space
                      </p>
                    </div>

                    {totalOfficeRent > 0 && (inputs.agents + inputs.team_leaders) > 0 && (
                      <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm font-medium text-green-900 dark:text-green-100">
                          ✓ Rent per person: {formatCurrency(inputs.rent)}
                        </p>
                        <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                          {formatCurrency(totalOfficeRent)} ÷ {inputs.agents + inputs.team_leaders} people = {formatCurrency(inputs.rent)}
                        </p>
                      </div>
                    )}

                    {totalOfficeRent > 0 && (inputs.agents + inputs.team_leaders) === 0 && (
                      <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-xs text-yellow-700 dark:text-yellow-300">
                          ⚠️ Please enter number of agents and team leaders first
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Other Cost Fields */}
              {[
                { key: "salary", label: "Salary" },
                { key: "team_leader_share", label: "Team Leader Share" },
                { key: "others", label: "Other Costs" },
                { key: "marketing", label: "Marketing" },
                { key: "sim", label: "SIM Card" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    value={inputs[key as keyof Inputs]}
                    onChange={(e) =>
                      handleInputChange(key as keyof Inputs, e.target.value)
                    }
                    onFocus={handleFocus}
                    className={
                      errors[key as keyof Inputs] ? "border-red-500" : ""
                    }
                  />
                  {errors[key as keyof Inputs] && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors[key as keyof Inputs]}
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Owner & Revenue Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="franchise_owner_salary">
                  Franchise Owner Salary (Monthly EGP)
                </Label>
                <Input
                  id="franchise_owner_salary"
                  type="number"
                  value={inputs.franchise_owner_salary}
                  onChange={(e) =>
                    handleInputChange("franchise_owner_salary", e.target.value)
                  }
                  onFocus={handleFocus}
                  className={
                    errors.franchise_owner_salary ? "border-red-500" : ""
                  }
                />
              </div>
              <div>
                <Label htmlFor="gross_rate">
                  Gross Revenue Rate (% as decimal, e.g., 0.04 = 4%)
                </Label>
                <Input
                  id="gross_rate"
                  type="number"
                  step="0.01"
                  value={inputs.gross_rate}
                  onChange={(e) =>
                    handleInputChange("gross_rate", e.target.value)
                  }
                  onFocus={handleFocus}
                  className={errors.gross_rate ? "border-red-500" : ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Commissions & Taxes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="agent_comm_per_1m">
                  Agent Commission per 1M Sales (EGP)
                </Label>
                <Input
                  id="agent_comm_per_1m"
                  type="number"
                  value={inputs.agent_comm_per_1m}
                  onChange={(e) =>
                    handleInputChange("agent_comm_per_1m", e.target.value)
                  }
                  onFocus={handleFocus}
                />
              </div>
              <div>
                <Label htmlFor="tl_comm_per_1m">
                  Team Leader Commission per 1M Sales (EGP)
                </Label>
                <Input
                  id="tl_comm_per_1m"
                  type="number"
                  value={inputs.tl_comm_per_1m}
                  onChange={(e) =>
                    handleInputChange("tl_comm_per_1m", e.target.value)
                  }
                  onFocus={handleFocus}
                />
              </div>
              <div>
                <Label htmlFor="withholding" className="flex items-center gap-2">
                  Withholding Tax (Fixed: 5%)
                  <span className="text-xs text-muted-foreground font-normal">🔒</span>
                </Label>
                <Input
                  id="withholding"
                  type="number"
                  step="0.01"
                  value={inputs.withholding}
                  disabled
                  className="opacity-60 cursor-not-allowed bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="vat" className="flex items-center gap-2">
                  VAT (Fixed: 14%)
                  <span className="text-xs text-muted-foreground font-normal">🔒</span>
                </Label>
                <Input
                  id="vat"
                  type="number"
                  step="0.01"
                  value={inputs.vat}
                  disabled
                  className="opacity-60 cursor-not-allowed bg-muted"
                />
              </div>
              <div>
                <Label htmlFor="income_tax">
                  Income Tax (0.07–0.12, i.e., 7-12%)
                </Label>
                <Input
                  id="income_tax"
                  type="number"
                  step="0.01"
                  value={inputs.income_tax}
                  onChange={(e) =>
                    handleInputChange("income_tax", e.target.value)
                  }
                  onFocus={handleFocus}
                  className={errors.income_tax ? "border-red-500" : ""}
                />
                {errors.income_tax && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.income_tax}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              onClick={handleCalculate}
              disabled={loading}
              className="flex-1 gradient-bg"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="mr-2 h-4 w-4" />
                  Calculate
                </>
              )}
            </Button>
            <Button onClick={handleReset} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6">
          {results ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <KPICard
                  title="Cost Per Seat"
                  value={formatCurrency(results.cost_per_seat)}
                  subtitle="Monthly per agent"
                  icon={Users}
                  gradient="from-blue-500 to-cyan-500"
                />
                <KPICard
                  title="Total Operating Cost"
                  value={formatCurrency(results.total_operating_cost)}
                  subtitle="Monthly total"
                  icon={DollarSign}
                  gradient="from-purple-500 to-pink-500"
                />
                <KPICard
                  title="Net Revenue Per 1M"
                  value={formatCurrency(results.net_rev_per_1m)}
                  subtitle="After all deductions"
                  icon={TrendingUp}
                  gradient="from-green-500 to-emerald-500"
                />
                <KPICard
                  title="Break-Even Sales"
                  value={`${formatNumber(results.break_even_sales_million, 2)}M`}
                  subtitle={formatCurrency(results.break_even_sales_egp)}
                  icon={PieChartIcon}
                  gradient="from-orange-500 to-red-500"
                />
              </div>

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Revenue Distribution per 1M Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={revenueBreakdownData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(1)}%`
                        }
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {revenueBreakdownData.map((entry, index) => (
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

              <Card className="glass">
                <CardHeader>
                  <CardTitle>Detailed Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {results.steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 rounded-lg bg-accent/50"
                      >
                        <span className="font-medium">{step.label}</span>
                        <span className="font-bold">
                          {formatCurrency(step.value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button
                onClick={handleSave}
                disabled={saving || !user}
                className="w-full gradient-bg"
              >
                {saving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {user ? "Save Scenario" : "Sign In to Save"}
                  </>
                )}
              </Button>
            </>
          ) : (
            <Card className="glass h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-2">
                  Ready to Calculate
                </p>
                <p className="text-muted-foreground">
                  Adjust the parameters and click Calculate to see results
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calculator, Save, RefreshCw, Sparkles, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Inputs, Results } from "@/lib/types";

const DEFAULT_INPUTS: Inputs = {
  agents: 10,
  team_leaders: 2,
  rent: 5000,
  salary: 5000,
  team_leader_share: 0.15,
  others: 3000,
  marketing: 5000,
  sim: 1000,
  franchise_owner_salary: 15000,
  gross_rate: 0.04,
  agent_comm_per_1m: 5000,
  tl_comm_per_1m: 2500,
  withholding: 0.05,
  vat: 0.14,
  income_tax: 0.10,
};
import { formatCurrency, formatNumber, formatPercent } from "@/lib/utils";
import { KPICard } from "@/components/kpi-card";
import { DollarSign, TrendingUp, Users, PieChart as PieChartIcon } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/zustand/store";

// Helper removed - no longer need org_id

export default function AnalyzePage() {
  const router = useRouter();
  const { hasFinancialAccess, userAccountType } = useAuth();
  const [inputs, setInputs] = useState<Inputs>({
    agents: 0,
    team_leaders: 0,
    rent: 0,
    salary: 0,
    team_leader_share: 0,
    others: 0,
    marketing: 0,
    sim: 0,
    franchise_owner_salary: 0,
    gross_rate: 0.04,
    agent_comm_per_1m: 0,
    tl_comm_per_1m: 0,
    withholding: 0.05,
    vat: 0.14,
    income_tax: 0.10,
  });
  const [results, setResults] = useState<Results | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [usePerAgentRent, setUsePerAgentRent] = useState(true);
  const [totalOfficeRent, setTotalOfficeRent] = useState(0);
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      
      // Check user account type for access control
      if (data.user) {
        checkUserAccess(data.user.id);
      } else {
        setCheckingAccess(false);
      }
    });
  }, []);

  // Calculate rent per agent when total rent changes
  useEffect(() => {
    if (!inputs) return;
    if (!usePerAgentRent && totalOfficeRent > 0) {
      const totalPeople = inputs.agents + inputs.team_leaders;
      if (totalPeople > 0) {
        const rentPerAgent = totalOfficeRent / totalPeople;
        setInputs(prev => ({ ...prev, rent: Math.round(rentPerAgent * 100) / 100 }));
      }
    }
  }, [usePerAgentRent, totalOfficeRent, inputs?.agents, inputs?.team_leaders]);

  const checkUserAccess = async (userId: string) => {
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("user_type")
        .eq("user_id", userId)
        .maybeSingle();

      // If user is team leader, show access denied
      if (data?.user_type === "team_leader") {
        setCheckingAccess(false);
      } else {
        setCheckingAccess(false);
      }
    } catch (error) {
      console.error("Error checking user access:", error);
      setCheckingAccess(false);
    }
  };

  // Show access denied if team leader
  if (checkingAccess) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!hasFinancialAccess() && userAccountType === "team_leader") {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <Card>
            <CardContent className="p-8">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
              <p className="text-muted-foreground mb-6">
                Break-Even Analysis is only available to CEO accounts. This financial tool requires full business oversight permissions.
              </p>
              <div className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => router.push("/dashboard")}
                >
                  Go to Dashboard
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/reports")}
                >
                  View Reports Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const handleInputChange = (field: keyof Inputs, value: string) => {
    // Special handling for gross_rate: accept percentage (e.g., "4%" or "4")
    if (field === "gross_rate") {
      // Remove % sign if present and convert to decimal
      const cleanedValue = value.replace(/%/g, "").trim();
      const numValue = parseFloat(cleanedValue);
      // If value is between 1-100, treat as percentage; otherwise treat as decimal
      const decimalValue = isNaN(numValue) 
        ? 0 
        : numValue > 1 
          ? numValue / 100  // If > 1, treat as percentage (4 -> 0.04)
          : numValue;        // If <= 1, treat as decimal (0.04 stays 0.04)
      setInputs((prev) => ({ ...prev, [field]: Math.max(0, Math.min(1, decimalValue)) }));
    } else if (field === "income_tax") {
      // Special handling for income_tax: accept percentage (e.g., "7%" or "7" or "10")
      // Range is 7-12%, which converts to 0.07-0.12 decimal
      const cleanedValue = value.replace(/%/g, "").trim();
      const numValue = parseFloat(cleanedValue);
      // If value is >= 1, treat as percentage (7 -> 0.07); otherwise treat as decimal (0.07 stays 0.07)
      const decimalValue = isNaN(numValue)
        ? 0.07 // Default to minimum
        : numValue >= 1
          ? numValue / 100  // If >= 1, treat as percentage (7 -> 0.07, 10 -> 0.10)
          : numValue;        // If < 1, treat as decimal (0.07 stays 0.07)
      // Constrain to valid range (0.07-0.12)
      setInputs((prev) => ({ ...prev, [field]: Math.max(0.07, Math.min(0.12, decimalValue)) }));
    } else {
      const numValue = parseFloat(value);
      setInputs((prev) => ({ ...prev, [field]: isNaN(numValue) ? 0 : numValue }));
    }
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

      // Basic validation
      if (!inputs || inputs.agents < 0 || inputs.team_leaders < 0) {
        setErrors({ agents: 'Invalid input values' });
        setLoading(false);
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
      setError(null);
    } catch (error: any) {
      console.error("[Analyze] Error calculating:", error);
      setError(error.message || "Failed to calculate. Please try again.");
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError("Please sign in to save scenarios");
      router.push("/auth/signin");
      return;
    }

    if (!results) {
      setError("Please calculate first");
      return;
    }

    try {
      setSaving(true);

      // Validate data before saving
      if (!inputs || !results) {
        throw new Error("Missing inputs or results");
      }

      const { data: insertData, error } = await supabase
        .from("break_even_records")
        .insert({
          user_id: user.id,
          inputs: inputs as any,
          results: results as any,
        })
        .select()
        .single();

      if (error) {
        // Log full error details for debugging
        console.error("Supabase error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          fullError: error
        });
        
        const errorMsg = error.message || error.details || error.hint || `Database error (code: ${error.code || 'unknown'})`;
        throw new Error(errorMsg);
      }

      if (!insertData) {
        throw new Error("No data returned from insert");
      }

      setSuccessMessage("✅ Scenario saved successfully!");
      setError(null);
      
      // Redirect to history page to see the saved data
      setTimeout(() => {
        router.push("/history");
      }, 500);
    } catch (error: any) {
      console.error("[Analyze] Error saving:", error);
      const errorMessage = error?.message || error?.toString() || "Unknown error occurred";
      setError(`❌ Failed to save scenario: ${errorMessage}`);
      setSuccessMessage(null);
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
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
        >
          <p className="font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-sm underline"
          >
            Dismiss
          </button>
        </motion.div>
      )}

      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
        >
          <p className="font-medium">{successMessage}</p>
        </motion.div>
      )}

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
                  value={inputs.agents || ""}
                  onChange={(e) => handleInputChange("agents", e.target.value)}
                  placeholder="e.g., 10"
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
                  value={inputs.team_leaders || ""}
                  onChange={(e) =>
                    handleInputChange("team_leaders", e.target.value)
                  }
                  placeholder="e.g., 2"
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
                      value={inputs.rent || ""}
                      onChange={(e) => handleInputChange("rent", e.target.value)}
                      className={errors.rent ? "border-red-500" : ""}
                      placeholder="e.g., 5000"
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
                        value={totalOfficeRent || ""}
                        onChange={(e) => setTotalOfficeRent(parseFloat(e.target.value) || 0)}
                        placeholder="e.g., 50000"
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
                { key: "salary", label: "Salary", placeholder: "e.g., 5000" },
                { key: "team_leader_share", label: "Team Leader Share", placeholder: "e.g., 0.15" },
                { key: "others", label: "Other Costs", placeholder: "e.g., 3000" },
                { key: "marketing", label: "Marketing", placeholder: "e.g., 5000" },
                { key: "sim", label: "SIM Card", placeholder: "e.g., 1000" },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <Label htmlFor={key}>{label}</Label>
                  <Input
                    id={key}
                    type="number"
                    value={inputs[key as keyof Inputs] || ""}
                    onChange={(e) =>
                      handleInputChange(key as keyof Inputs, e.target.value)
                    }
                    placeholder={placeholder}
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
                  value={inputs.franchise_owner_salary || ""}
                  onChange={(e) =>
                    handleInputChange("franchise_owner_salary", e.target.value)
                  }
                  placeholder="e.g., 15000"
                  className={
                    errors.franchise_owner_salary ? "border-red-500" : ""
                  }
                />
              </div>
              <div>
                <Label htmlFor="gross_rate">
                  Gross Revenue Rate (%)
                </Label>
                <Input
                  id="gross_rate"
                  type="text"
                  placeholder="4 or 4%"
                  value={inputs.gross_rate > 0 ? (inputs.gross_rate * 100).toFixed(2) : ""}
                  onChange={(e) =>
                    handleInputChange("gross_rate", e.target.value)
                  }
                  onFocus={(e) => {
                    // Select all text when focused for easy editing
                    e.target.select();
                    // If showing 0, clear it
                    if (inputs.gross_rate === 0) {
                      e.target.value = "";
                    }
                  }}
                  onBlur={(e) => {
                    // Format as percentage on blur if empty
                    if (!e.target.value.trim()) {
                      e.target.value = "0.00";
                    }
                  }}
                  className={errors.gross_rate ? "border-red-500" : ""}
                />
                {!errors.gross_rate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter as percentage (e.g., 4 or 4%)
                  </p>
                )}
                {errors.gross_rate && (
                  <p className="text-xs text-red-500 mt-1">{errors.gross_rate}</p>
                )}
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
                  value={inputs.agent_comm_per_1m || ""}
                  onChange={(e) =>
                    handleInputChange("agent_comm_per_1m", e.target.value)
                  }
                  placeholder="e.g., 5000"
                />
              </div>
              <div>
                <Label htmlFor="tl_comm_per_1m">
                  Team Leader Commission per 1M Sales (EGP)
                </Label>
                <Input
                  id="tl_comm_per_1m"
                  type="number"
                  value={inputs.tl_comm_per_1m || ""}
                  onChange={(e) =>
                    handleInputChange("tl_comm_per_1m", e.target.value)
                  }
                  placeholder="e.g., 2500"
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
                  Income Tax (%)
                </Label>
                <Input
                  id="income_tax"
                  type="text"
                  placeholder="7-12 or 7%-12%"
                  value={inputs.income_tax > 0 ? (inputs.income_tax * 100).toFixed(2) : ""}
                  onChange={(e) =>
                    handleInputChange("income_tax", e.target.value)
                  }
                  onFocus={(e) => {
                    // Select all text when focused for easy editing
                    e.target.select();
                    // If showing 0, clear it
                    if (inputs.income_tax === 0) {
                      e.target.value = "";
                    }
                  }}
                  onBlur={(e) => {
                    // Format as percentage on blur if empty
                    if (!e.target.value.trim()) {
                      e.target.value = "7.00";
                    }
                  }}
                  className={errors.income_tax ? "border-red-500" : ""}
                />
                {!errors.income_tax && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter as percentage (7-12% range, e.g., 7, 10, or 12%)
                  </p>
                )}
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


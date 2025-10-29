"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, Settings as SettingsIcon, CheckCircle2, Clock, Target, Scale } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { KpiSettings } from "@/lib/types";

export default function KpiSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [settings, setSettings] = useState<KpiSettings>({
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
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("agent_kpi_settings")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate weights sum to 100
    const totalWeight =
      settings.weight_attendance +
      settings.weight_calls +
      settings.weight_behavior +
      settings.weight_meetings +
      settings.weight_sales;

    if (totalWeight !== 100) {
      alert(
        `Weights must sum to exactly 100. Current sum: ${totalWeight}`
      );
      return;
    }

    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("agent_kpi_settings").upsert(
        [
          {
            ...settings,
            user_id: user.id,
          },
        ],
        {
          onConflict: "user_id",
        }
      );

      if (error) throw error;
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const totalWeight =
    settings.weight_attendance +
    settings.weight_calls +
    settings.weight_behavior +
    settings.weight_meetings +
    settings.weight_sales;

  const isWeightValid = totalWeight === 100;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading settings...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with gradient icon */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">KPI Configuration</h1>
              <p className="text-muted-foreground">
                Customize performance targets and scoring weights
              </p>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <Card className="mb-6 border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <SettingsIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Configuration Guidelines</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Set realistic targets based on your market and team capacity</li>
                  <li>• Scoring weights must sum to exactly 100%</li>
                  <li>• Changes apply to all future score calculations</li>
                  <li>• Existing scores won't be recalculated automatically</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/10">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Settings saved successfully!
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Your configuration has been updated and will be used in future calculations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Work Hours */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Work Hours</CardTitle>
              </div>
              <CardDescription>Define standard working hours for attendance tracking</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workday_start">Start Time</Label>
                  <Input
                    type="time"
                    id="workday_start"
                    value={settings.workday_start}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        workday_start: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workday_end">End Time</Label>
                  <Input
                    type="time"
                    id="workday_end"
                    value={settings.workday_end}
                    onChange={(e) =>
                      setSettings({ ...settings, workday_end: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Targets */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <CardTitle>Performance Targets</CardTitle>
              </div>
              <CardDescription>Set daily and monthly goals for your team</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_calls_per_day">
                    Daily Calls Target
                  </Label>
                  <Input
                    type="number"
                    id="target_calls_per_day"
                    min="1"
                    value={settings.target_calls_per_day}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        target_calls_per_day: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of calls expected per agent per day
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_meetings_per_day">
                    Daily Meetings Target
                  </Label>
                  <Input
                    type="number"
                    id="target_meetings_per_day"
                    min="1"
                    value={settings.target_meetings_per_day}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        target_meetings_per_day: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Number of meetings expected per agent per day
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target_sales_per_month">
                    Monthly Sales Target (EGP)
                  </Label>
                  <Input
                    type="number"
                    id="target_sales_per_month"
                    min="0"
                    step="0.01"
                    value={settings.target_sales_per_month}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        target_sales_per_month: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Total sales expected per agent per month
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Weights */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-primary" />
                <CardTitle>Scoring Weights</CardTitle>
              </div>
              <CardDescription>
                Adjust the importance of each metric (must sum to 100%)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_attendance">
                    Attendance Weight (%)
                  </Label>
                  <Input
                    type="number"
                    id="weight_attendance"
                    min="0"
                    max="100"
                    value={settings.weight_attendance}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        weight_attendance: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_calls">Calls Weight (%)</Label>
                  <Input
                    type="number"
                    id="weight_calls"
                    min="0"
                    max="100"
                    value={settings.weight_calls}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        weight_calls: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_behavior">
                    Behavior Weight (%)
                  </Label>
                  <Input
                    type="number"
                    id="weight_behavior"
                    min="0"
                    max="100"
                    value={settings.weight_behavior}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        weight_behavior: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_meetings">
                    Meetings Weight (%)
                  </Label>
                  <Input
                    type="number"
                    id="weight_meetings"
                    min="0"
                    max="100"
                    value={settings.weight_meetings}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        weight_meetings: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight_sales">Sales Weight (%)</Label>
                  <Input
                    type="number"
                    id="weight_sales"
                    min="0"
                    max="100"
                    value={settings.weight_sales}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        weight_sales: parseInt(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>
              </div>

              {/* Weight Sum Display */}
              <div
                className={`p-4 rounded-lg border-2 ${
                  isWeightValid
                    ? "bg-green-50 dark:bg-green-950/20 border-green-500"
                    : "bg-red-50 dark:bg-red-950/20 border-red-500"
                }`}
              >
                <div className="flex items-center gap-2">
                  {isWeightValid ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span
                    className={`font-bold text-lg ${
                      isWeightValid ? "text-green-900 dark:text-green-100" : "text-red-900 dark:text-red-100"
                    }`}
                  >
                    Total Weight: {totalWeight}%
                  </span>
                </div>
                {!isWeightValid && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Weights must sum to exactly 100%. Please adjust the values above.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => loadSettings()}
            >
              Reset Changes
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={saving || !isWeightValid}
              className="gradient-bg"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Save Configuration
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

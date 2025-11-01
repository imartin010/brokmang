"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, ClipboardList, CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { Card, CardContent } from "@/components/ui/card";
import { DailyLogForm } from "@/components/crm/daily-log-form";
import type { SalesAgent, DailyLog } from "@/lib/types";

export default function DailyLogsPage() {
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    loadAgents();
  }, []);

  const loadAgents = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("[Daily Logs] User not authenticated");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("sales_agents")
        .select("*")
        .eq("is_active", true)
        .order("full_name");

      if (error) {
        console.error("[Daily Logs] Error loading agents:", error);
        setAgents([]);
      } else {
        setAgents(data || []);
      }
    } catch (error) {
      console.error("[Daily Logs] Unexpected error:", error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitLog = async (logData: Partial<DailyLog>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Prepare log data
      const log = {
        ...logData,
        user_id: user.id,
        check_in: logData.check_in || null,
        check_out: logData.check_out || null,
      };

      // Upsert (insert or update if exists)
      const { error } = await supabase.from("agent_daily_logs").upsert(
        [log],
        {
          onConflict: "user_id,agent_id,log_date",
        }
      );

      if (error) throw error;

      // Show success animation
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error: any) {
      console.error("[Daily Logs] Error saving log:", error);
      // Don't use alert - errors should be handled in UI
      throw new Error(error.message || "Failed to save log. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 px-8">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (agents.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
                <AlertCircle className="h-12 w-12 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Active Agents</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                You need to add sales agents before you can log their daily performance.
              </p>
              <a href="/crm/sales">
                <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
                  Go to Sales Team
                  <ArrowRight className="h-4 w-4" />
                </button>
              </a>
            </CardContent>
          </Card>
        </motion.div>
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
        {/* Super Simple Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 inline-block p-4 rounded-full bg-gradient-to-br from-green-400 to-teal-500">
            <ClipboardList className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Write Today's Report</h1>
          <p className="text-xl text-muted-foreground mb-6">
            It's easy! Just fill in what happened today
          </p>
        </div>

        {/* AWESOME Success Message */}
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <Card className="border-4 border-green-400 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 shadow-lg">
              <CardContent className="p-6 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mb-3"
                >
                  <CheckCircle2 className="h-20 w-20 mx-auto text-green-600" />
                </motion.div>
                <h3 className="text-2xl font-bold text-green-800 dark:text-green-200 mb-2">
                  Awesome! You Did It!
                </h3>
                <p className="text-lg text-green-700 dark:text-green-300">
                  The log has been saved successfully!
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  Great job! You can add another one or you're all done!
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Form */}
        <DailyLogForm agents={agents} onSubmit={handleSubmitLog} />
      </motion.div>
    </div>
  );
}


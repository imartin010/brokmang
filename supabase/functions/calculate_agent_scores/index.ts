// =====================================================
// Edge Function: Calculate Agent Monthly Scores
// =====================================================
// Timezone: Africa/Cairo
// NOTE: leads_count is CONTEXT ONLY, NOT used in scoring
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Types
type KpiSettings = {
  workday_start: string;
  workday_end: string;
  target_calls_per_day: number;
  target_meetings_per_day: number;
  target_sales_per_month: number;
  weight_attendance: number;
  weight_calls: number;
  weight_behavior: number;
  weight_meetings: number;
  weight_sales: number;
};

type DailyLog = {
  log_date: string;
  check_in: string | null;
  check_out: string | null;
  calls_count: number;
  leads_count: number;
  meetings_count: number;
  sales_amount: number;
  appearance_score: number;
  ethics_score: number;
};

type MonthlyKPIs = {
  attendance_month: number;
  calls_month: number;
  behavior_month: number;
  meetings_month: number;
  sales_score: number;
  leads_info: {
    leads_days_active: number;
    leads_total: number;
  };
};

// Constants
const CAIRO_TZ = "Africa/Cairo";

// Helper: Convert time string (HH:MM) to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper: Check if date is a weekend (Friday or Saturday in Egypt)
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday = 5, Saturday = 6
}

// Calculate daily attendance score (0-100)
function calculateAttendanceDaily(
  log: DailyLog,
  settings: KpiSettings
): number {
  // If no check-in and no check-out => absent
  if (!log.check_in && !log.check_out) {
    return 0;
  }

  const workdayStartMin = timeToMinutes(settings.workday_start);
  const workdayEndMin = timeToMinutes(settings.workday_end);

  let late = 0;
  let early = 0;

  if (log.check_in) {
    const checkInMin = timeToMinutes(log.check_in);
    late = Math.max(0, checkInMin - workdayStartMin);
  }

  if (log.check_out) {
    const checkOutMin = timeToMinutes(log.check_out);
    early = Math.max(0, workdayEndMin - checkOutMin);
  }

  // Every 10 minutes late/early => -1 point
  const penalty = (late + early) / 10;
  return Math.max(0, 100 - penalty);
}

// Calculate daily calls score (0-100)
function calculateCallsDaily(
  log: DailyLog,
  settings: KpiSettings
): number {
  const ratio = log.calls_count / settings.target_calls_per_day;
  return Math.min(100, ratio * 100);
}

// Calculate daily behavior score (0-100)
function calculateBehaviorDaily(log: DailyLog): number {
  // Average of appearance and ethics (0..10 each), then scale to 0..100
  const avg = (log.appearance_score + log.ethics_score) / 2;
  return avg * 10;
}

// Calculate daily meetings score (0-100)
function calculateMeetingsDaily(
  log: DailyLog,
  settings: KpiSettings
): number {
  const ratio = log.meetings_count / settings.target_meetings_per_day;
  return Math.min(100, ratio * 100);
}

// Calculate monthly scores for an agent
function calculateMonthlyKPIs(
  logs: DailyLog[],
  settings: KpiSettings
): { kpis: MonthlyKPIs; finalScore: number } {
  if (logs.length === 0) {
    return {
      kpis: {
        attendance_month: 0,
        calls_month: 0,
        behavior_month: 0,
        meetings_month: 0,
        sales_score: 0,
        leads_info: { leads_days_active: 0, leads_total: 0 },
      },
      finalScore: 0,
    };
  }

  // Daily scores
  let attendanceSum = 0;
  let callsSum = 0;
  let behaviorSum = 0;
  let meetingsSum = 0;
  let salesSum = 0;
  let leadsTotal = 0;
  let leadsDaysActive = 0;

  logs.forEach((log) => {
    attendanceSum += calculateAttendanceDaily(log, settings);
    callsSum += calculateCallsDaily(log, settings);
    behaviorSum += calculateBehaviorDaily(log);
    meetingsSum += calculateMeetingsDaily(log, settings);
    salesSum += log.sales_amount;
    
    // Leads context (NOT scored)
    leadsTotal += log.leads_count;
    if (log.leads_count > 0) {
      leadsDaysActive++;
    }
  });

  const numDays = logs.length;

  // Monthly averages
  const attendance_month = attendanceSum / numDays;
  const calls_month = callsSum / numDays;
  const behavior_month = behaviorSum / numDays;
  const meetings_month = meetingsSum / numDays;

  // Monthly sales score
  const salesRatio = salesSum / settings.target_sales_per_month;
  const sales_score = Math.min(100, salesRatio * 100);

  // Normalize weights to 0..1
  const w_att = settings.weight_attendance / 100;
  const w_calls = settings.weight_calls / 100;
  const w_behavior = settings.weight_behavior / 100;
  const w_meetings = settings.weight_meetings / 100;
  const w_sales = settings.weight_sales / 100;

  // Final score (leads NOT included)
  const finalScore =
    attendance_month * w_att +
    calls_month * w_calls +
    behavior_month * w_behavior +
    meetings_month * w_meetings +
    sales_score * w_sales;

  return {
    kpis: {
      attendance_month: Math.round(attendance_month * 100) / 100,
      calls_month: Math.round(calls_month * 100) / 100,
      behavior_month: Math.round(behavior_month * 100) / 100,
      meetings_month: Math.round(meetings_month * 100) / 100,
      sales_score: Math.round(sales_score * 100) / 100,
      leads_info: {
        leads_days_active: leadsDaysActive,
        leads_total: leadsTotal,
      },
    },
    finalScore: Math.round(finalScore * 100) / 100,
  };
}

// Main handler
serve(async (req: Request) => {
  // CORS headers
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-user-id",
      },
    });
  }

  try {
    // Get user ID from header
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Missing x-user-id header" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { year, month } = await req.json();
    if (!year || !month) {
      return new Response(
        JSON.stringify({ error: "Missing year or month" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate month
    if (month < 1 || month > 12) {
      return new Response(
        JSON.stringify({ error: "Month must be between 1 and 12" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Load KPI settings for user (or use defaults)
    let settings: KpiSettings = {
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
    };

    const { data: settingsData } = await supabase
      .from("agent_kpi_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsData) {
      settings = settingsData;
    }

    // 2. Get all active agents for this user
    const { data: agents, error: agentsError } = await supabase
      .from("sales_agents")
      .select("id")
      .eq("user_id", userId)
      .eq("is_active", true);

    if (agentsError) {
      throw agentsError;
    }

    if (!agents || agents.length === 0) {
      return new Response(
        JSON.stringify({ message: "No active agents found", processed: 0 }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 3. Calculate start and end dates for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const startDateStr = startDate.toISOString().split("T")[0];
    const endDateStr = endDate.toISOString().split("T")[0];

    // 4. Process each agent
    const results = [];
    for (const agent of agents) {
      // Load all logs for this agent in the month
      const { data: logs, error: logsError } = await supabase
        .from("agent_daily_logs")
        .select("*")
        .eq("user_id", userId)
        .eq("agent_id", agent.id)
        .gte("log_date", startDateStr)
        .lte("log_date", endDateStr)
        .order("log_date", { ascending: true });

      if (logsError) {
        console.error(`Error loading logs for agent ${agent.id}:`, logsError);
        continue;
      }

      // Calculate KPIs and final score
      const { kpis, finalScore } = calculateMonthlyKPIs(
        logs || [],
        settings
      );

      // Upsert into agent_monthly_scores
      const { error: upsertError } = await supabase
        .from("agent_monthly_scores")
        .upsert(
          {
            user_id: userId,
            agent_id: agent.id,
            year,
            month,
            score: finalScore,
            kpis,
          },
          {
            onConflict: "user_id,agent_id,year,month",
          }
        );

      if (upsertError) {
        console.error(
          `Error upserting score for agent ${agent.id}:`,
          upsertError
        );
        continue;
      }

      results.push({
        agent_id: agent.id,
        score: finalScore,
        kpis,
      });
    }

    return new Response(
      JSON.stringify({
        message: "Scores calculated successfully",
        processed: results.length,
        results,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
});


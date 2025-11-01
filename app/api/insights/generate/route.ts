/**
 * API Route: Generate AI Insights
 * Uses OpenAI to analyze performance data and provide recommendations
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

// Initialize OpenAI only if API key is available
let openai: OpenAI | null = null;
try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
} catch (error) {
  console.error("Failed to initialize OpenAI client:", error);
}

// Initialize Supabase with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration:", {
    hasUrl: !!supabaseUrl,
    hasServiceKey: !!supabaseServiceKey,
  });
}

const supabase = createClient(
  supabaseUrl || "",
  supabaseServiceKey || ""
);

interface InsightData {
  agents: any[];
  monthlyScores: any[];
  dailyLogs: any[];
  orgSettings: any;
  currentDate: string;
}

export async function POST(req: NextRequest) {
  try {
    const { user_id } = await req.json();

    if (!user_id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Check if Supabase is configured
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Supabase configuration missing");
      return NextResponse.json(
        { error: "Server configuration error: Supabase credentials missing" },
        { status: 500 }
      );
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || !openai) {
      console.error("OpenAI API key not configured");
      // Return fallback insights instead of error
      const insightData = await fetchUserData(user_id);
      const fallbackInsights = getFallbackInsights(insightData);
      return NextResponse.json({
        success: true,
        insights: fallbackInsights,
        generated_at: new Date().toISOString(),
        note: "Using fallback insights (OpenAI API key not configured)",
      });
    }

    // 1. Fetch real data from database
    const insightData = await fetchUserData(user_id);

    // 2. Generate AI insights using OpenAI
    const insights = await generateAIInsights(insightData);

    return NextResponse.json({
      success: true,
      insights,
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error generating insights:", error);
    return NextResponse.json(
      {
        error: "Failed to generate insights",
        details: error.message || String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * Fetch user data for analysis
 */
async function fetchUserData(userId: string): Promise<InsightData> {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  // Get previous month for comparison
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Fetch agents (all active agents for the user)
  // Note: sales_agents table doesn't have user_id, so we fetch all active agents
  // This is intentional as agents are shared across users in the system
  const { data: agents, error: agentsError } = await supabase
    .from("sales_agents")
    .select("id, full_name, role, is_active")
    .eq("is_active", true);

  if (agentsError) {
    console.error("Error fetching agents:", agentsError);
    throw new Error(`Failed to fetch agents: ${agentsError.message}`);
  }

  // Fetch current month scores
  const { data: currentScores, error: currentScoresError } = await supabase
    .from("agent_monthly_scores")
    .select("*")
    .eq("year", currentYear)
    .eq("month", currentMonth);

  if (currentScoresError) {
    console.error("Error fetching current scores:", currentScoresError);
    throw new Error(`Failed to fetch current scores: ${currentScoresError.message}`);
  }

  // Fetch previous month scores for comparison
  const { data: previousScores, error: previousScoresError } = await supabase
    .from("agent_monthly_scores")
    .select("*")
    .eq("year", previousYear)
    .eq("month", previousMonth);

  if (previousScoresError) {
    console.error("Error fetching previous scores:", previousScoresError);
    throw new Error(`Failed to fetch previous scores: ${previousScoresError.message}`);
  }

  // Fetch recent daily logs (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: dailyLogs, error: logsError } = await supabase
    .from("agent_daily_logs")
    .select("*")
    .gte("log_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("log_date", { ascending: false });

  if (logsError) {
    console.error("Error fetching daily logs:", logsError);
    throw new Error(`Failed to fetch daily logs: ${logsError.message}`);
  }

  // No org finance settings - use empty object
  const orgSettings = {};

  return {
    agents: agents || [],
    monthlyScores: [
      ...(currentScores || []).map((s) => ({ ...s, period: "current" })),
      ...(previousScores || []).map((s) => ({ ...s, period: "previous" })),
    ],
    dailyLogs: dailyLogs || [],
    orgSettings: orgSettings || {},
    currentDate: currentDate.toISOString(),
  };
}

/**
 * Generate AI insights using OpenAI
 */
async function generateAIInsights(data: InsightData) {
  // If OpenAI is not available, return fallback insights
  if (!openai) {
    console.log("OpenAI not available, using fallback insights");
    return getFallbackInsights(data);
  }

  // Prepare data summary for AI
  const dataSummary = prepareDataSummary(data);

  const prompt = `You are an AI business analyst for a real estate brokerage company in Egypt. Analyze the following performance data and provide actionable insights.

**Company Data:**
${dataSummary}

**Your Task:**
Analyze this data and provide 3-5 key insights. For each insight, include:
1. A clear, attention-grabbing title (max 50 characters)
2. A brief description (1-2 sentences)
3. Confidence level (0-100) based on data quality and strength of the pattern
4. 2-4 specific reasons/evidence supporting this insight
5. Type of insight (choose one: "performance_drop", "performance_improvement", "break_even_warning", "target_exceeded", "top_performer", "underperformer", "trend_alert", or "recommendation")
6. Suggested action URL (choose from: "/dashboard", "/analyze", "/reports", "/org/settings")

**Guidelines:**
- Focus on actionable insights, not just observations
- Prioritize issues that need immediate attention
- Highlight both problems AND opportunities
- Use specific numbers and agent names when available
- Be concise and business-focused
- If sales data shows concerning trends, mention break-even risk
- Identify both top performers (to recognize) and underperformers (to support)

**Output Format (JSON only, no markdown):**
[
  {
    "type": "performance_drop",
    "title": "Calls Volume Decreased",
    "description": "Average daily calls dropped by 15% compared to last month",
    "confidence": 85,
    "reasons": [
      "Team Beta showed 20% decrease in calls",
      "Ahmed Hassan: 30 calls/day → 18 calls/day",
      "Trend started 2 weeks ago"
    ],
    "action_url": "/dashboard"
  }
]

Respond with ONLY the JSON array, no other text.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a data analyst AI that responds only with valid JSON arrays. Never include markdown formatting or code blocks in your response.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || "[]";

    // Clean up response (remove markdown code blocks if present)
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith("```")) {
      cleanedResponse = cleanedResponse
        .replace(/^```json?\n?/i, "")
        .replace(/\n?```$/i, "");
    }

    // Parse JSON
    const insights = JSON.parse(cleanedResponse);

    // Validate and enhance insights
    return insights.map((insight: any) => ({
      ...insight,
      icon: getIconForType(insight.type),
      color: getColorForType(insight.type),
    }));
  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    
    // Return fallback insights if OpenAI fails
    return getFallbackInsights(data);
  }
}

/**
 * Prepare a concise summary of the data for AI
 */
function prepareDataSummary(data: InsightData): string {
  const { agents, monthlyScores, dailyLogs, orgSettings } = data;

  const currentScores = monthlyScores.filter((s) => s.period === "current");
  const previousScores = monthlyScores.filter((s) => s.period === "previous");

  // Calculate averages
  const avgCurrentScore =
    currentScores.length > 0
      ? currentScores.reduce((sum, s) => sum + (s.score || 0), 0) /
        currentScores.length
      : 0;
  const avgPreviousScore =
    previousScores.length > 0
      ? previousScores.reduce((sum, s) => sum + (s.score || 0), 0) /
        previousScores.length
      : 0;

  // Recent activity summary
  const recentLogs = dailyLogs.slice(0, 7);
  const avgCalls =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, l) => sum + (l.calls_count || 0), 0) /
        recentLogs.length
      : 0;
  const avgMeetings =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, l) => sum + (l.meetings_count || 0), 0) /
        recentLogs.length
      : 0;
  const totalSales = recentLogs.reduce(
    (sum, l) => sum + (l.sales_amount || 0),
    0
  );

  // Top and bottom performers
  const sortedCurrent = [...currentScores].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );
  const topPerformers = sortedCurrent.slice(0, 3);
  const bottomPerformers = sortedCurrent.slice(-3).reverse();

  return `
**Organization Overview:**
- Active Agents: ${agents.length}
- Current Month Avg Score: ${avgCurrentScore.toFixed(1)}%
- Previous Month Avg Score: ${avgPreviousScore.toFixed(1)}%
- Score Change: ${(avgCurrentScore - avgPreviousScore).toFixed(1)}%

**Recent Activity (Last 7 Days):**
- Average Calls/Day: ${avgCalls.toFixed(1)}
- Average Meetings/Day: ${avgMeetings.toFixed(1)}
- Total Sales: EGP ${totalSales.toLocaleString()}

**Top Performers (Current Month):**
${topPerformers
  .map((s, i) => {
    const agent = agents.find((a) => a.id === s.agent_id);
    return `${i + 1}. ${agent?.full_name || "Unknown"}: ${(s.score || 0).toFixed(1)}%`;
  })
  .join("\n")}

**Bottom Performers (Current Month):**
${bottomPerformers
  .map((s, i) => {
    const agent = agents.find((a) => a.id === s.agent_id);
    return `${i + 1}. ${agent?.full_name || "Unknown"}: ${(s.score || 0).toFixed(1)}%`;
  })
  .join("\n")}

**Individual Agent Details:**
${currentScores
  .map((s) => {
    const agent = agents.find((a) => a.id === s.agent_id);
    const previous = previousScores.find((p) => p.agent_id === s.agent_id);
    const kpis = s.kpis || {};
    return `
- ${agent?.full_name || "Unknown"}:
  - Current Score: ${(s.score || 0).toFixed(1)}%
  - Previous Score: ${previous ? (previous.score || 0).toFixed(1) : "N/A"}%
  - Attendance: ${(kpis.attendance_month || 0).toFixed(1)}%
  - Calls: ${(kpis.calls_month || 0).toFixed(1)}%
  - Behavior: ${(kpis.behavior_month || 0).toFixed(1)}%
  - Meetings: ${(kpis.meetings_month || 0).toFixed(1)}%
  - Sales: ${(kpis.sales_score || 0).toFixed(1)}%`;
  })
  .join("\n")}

**Financial Context:**
${orgSettings.target_revenue ? `- Target Monthly Revenue: EGP ${orgSettings.target_revenue.toLocaleString()}` : ""}
${orgSettings.fixed_costs ? `- Fixed Costs: EGP ${orgSettings.fixed_costs.toLocaleString()}` : ""}
`.trim();
}

/**
 * Get icon name for insight type
 */
function getIconForType(type: string): string {
  const iconMap: Record<string, string> = {
    performance_drop: "TrendingDown",
    performance_improvement: "TrendingUp",
    break_even_warning: "AlertTriangle",
    target_exceeded: "Trophy",
    top_performer: "Trophy",
    underperformer: "AlertCircle",
    trend_alert: "Activity",
    recommendation: "Lightbulb",
  };
  return iconMap[type] || "Lightbulb";
}

/**
 * Get color gradient for insight type
 */
function getColorForType(type: string): string {
  const colorMap: Record<string, string> = {
    performance_drop: "from-yellow-500 to-orange-500",
    performance_improvement: "from-green-500 to-emerald-500",
    break_even_warning: "from-red-500 to-pink-500",
    target_exceeded: "from-green-500 to-teal-500",
    top_performer: "from-green-500 to-emerald-500",
    underperformer: "from-orange-500 to-red-500",
    trend_alert: "from-blue-500 to-cyan-500",
    recommendation: "from-purple-500 to-pink-500",
  };
  return colorMap[type] || "from-purple-500 to-pink-500";
}

/**
 * Fallback insights if OpenAI fails
 */
function getFallbackInsights(data: InsightData) {
  const { agents, monthlyScores, dailyLogs } = data;

  const currentScores = monthlyScores.filter((s) => s.period === "current");
  const sortedCurrent = [...currentScores].sort(
    (a, b) => (b.score || 0) - (a.score || 0)
  );

  const insights = [];

  // Top performer insight
  if (sortedCurrent.length > 0 && sortedCurrent[0].score > 80) {
    const topAgent = agents.find((a) => a.id === sortedCurrent[0].agent_id);
    insights.push({
      type: "top_performer",
      title: "Star Performer Identified",
      description: `${topAgent?.full_name || "An agent"} is consistently outperforming targets`,
      confidence: 90,
      reasons: [
        `Score: ${sortedCurrent[0].score.toFixed(1)}%`,
        "Consistent high performance",
        "Exceeding all KPI targets",
      ],
      action_url: "/dashboard",
      icon: "Trophy",
      color: "from-green-500 to-emerald-500",
    });
  }

  // Low performer warning
  if (sortedCurrent.length > 0) {
    const lowPerformers = sortedCurrent.filter((s) => s.score < 60);
    if (lowPerformers.length > 0) {
      insights.push({
        type: "underperformer",
        title: "Performance Support Needed",
        description: `${lowPerformers.length} agent(s) scoring below 60%`,
        confidence: 85,
        reasons: [
          `${lowPerformers.length} agents need support`,
          "Performance intervention recommended",
          "Training or mentoring may help",
        ],
        action_url: "/dashboard",
        icon: "AlertCircle",
        color: "from-orange-500 to-red-500",
      });
    }
  }

  // General recommendation
  insights.push({
    type: "recommendation",
    title: "Regular Performance Reviews",
    description: "Schedule weekly check-ins to maintain performance momentum",
    confidence: 75,
    reasons: [
      "Consistent feedback improves results",
      "Early intervention prevents issues",
      "Recognition boosts morale",
    ],
    action_url: "/reports",
    icon: "Lightbulb",
    color: "from-purple-500 to-pink-500",
  });

  return insights;
}


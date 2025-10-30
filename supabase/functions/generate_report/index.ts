/// <reference lib="deno.ns" />
// =====================================================
// Edge Function: Generate PDF Reports
// =====================================================
// Generates PDF reports for organizations:
//   - Sales Performance Reports
//   - Agent KPI Reports
//   - Financial Summaries
//   - Monthly/Quarterly Reports
// =====================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Types
type ReportType = "sales" | "kpi" | "financial" | "monthly";

interface ReportRequest {
  org_id: string;
  report_type: ReportType;
  year: number;
  month: number;
  title?: string;
}

interface OrgBranding {
  name: string;
  logo_url?: string;
  primary_color?: string;
  secondary_color?: string;
}

// Helper: Generate HTML for PDF (will be converted to PDF)
function generateReportHTML(
  reportData: any,
  branding: OrgBranding,
  reportType: ReportType,
  year: number,
  month: number
): string {
  const monthName = new Date(year, month - 1).toLocaleString("en-US", {
    month: "long",
    year: "numeric",
  });
  
  const primaryColor = branding.primary_color || "#2563eb";
  const secondaryColor = branding.secondary_color || "#1e40af";

  let reportContent = "";

  if (reportType === "sales") {
    reportContent = generateSalesReport(reportData);
  } else if (reportType === "kpi") {
    reportContent = generateKPIReport(reportData);
  } else if (reportType === "financial") {
    reportContent = generateFinancialReport(reportData);
  } else {
    reportContent = generateMonthlyReport(reportData);
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 40px;
      background: white;
      color: #1f2937;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid ${primaryColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header-left {
      flex: 1;
    }
    .header-right {
      text-align: right;
    }
    .logo {
      max-width: 150px;
      max-height: 60px;
      margin-bottom: 10px;
    }
    .org-name {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
    }
    .report-title {
      font-size: 20px;
      color: #4b5563;
      margin-top: 5px;
    }
    .report-period {
      font-size: 14px;
      color: #6b7280;
      margin-top: 5px;
    }
    .report-date {
      font-size: 12px;
      color: #9ca3af;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th {
      background: ${primaryColor};
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: 600;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
    }
    tr:nth-child(even) {
      background: #f9fafb;
    }
    .summary-box {
      background: #f3f4f6;
      border-left: 4px solid ${primaryColor};
      padding: 20px;
      margin: 20px 0;
    }
    .summary-title {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 10px;
      color: ${secondaryColor};
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-top: 15px;
    }
    .summary-item {
      background: white;
      padding: 15px;
      border-radius: 8px;
    }
    .summary-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-value {
      font-size: 24px;
      font-weight: bold;
      color: ${primaryColor};
      margin-top: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      font-size: 12px;
      color: #9ca3af;
    }
    .section {
      margin: 30px 0;
    }
    .section-title {
      font-size: 18px;
      font-weight: bold;
      color: ${secondaryColor};
      margin-bottom: 15px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-left">
      ${branding.logo_url ? `<img src="${branding.logo_url}" class="logo" alt="${branding.name}" />` : ""}
      <div class="org-name">${branding.name}</div>
      <div class="report-title">${getReportTitle(reportType)}</div>
      <div class="report-period">${monthName}</div>
    </div>
    <div class="header-right">
      <div class="report-date">Generated: ${new Date().toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })}</div>
    </div>
  </div>

  ${reportContent}

  <div class="footer">
    <p>This report was generated by Brokmang. | Confidential - For internal use only</p>
  </div>
</body>
</html>
  `;
}

function getReportTitle(reportType: ReportType): string {
  switch (reportType) {
    case "sales":
      return "Sales Performance Report";
    case "kpi":
      return "Agent KPI Report";
    case "financial":
      return "Financial Summary";
    case "monthly":
      return "Monthly Overview Report";
    default:
      return "Report";
  }
}

function generateSalesReport(data: any): string {
  const agents = data.agents || [];
  
  const totalSales = agents.reduce((sum: number, a: any) => sum + (a.total_sales || 0), 0);
  const totalMeetings = agents.reduce((sum: number, a: any) => sum + (a.total_meetings || 0), 0);
  const avgScore = agents.length > 0 
    ? agents.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / agents.length 
    : 0;

  return `
    <div class="summary-box">
      <div class="summary-title">Sales Overview</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Total Sales</div>
          <div class="summary-value">EGP ${totalSales.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Meetings</div>
          <div class="summary-value">${totalMeetings}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Avg Performance</div>
          <div class="summary-value">${avgScore.toFixed(1)}%</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Agent Performance</div>
      <table>
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Total Sales</th>
            <th>Meetings</th>
            <th>Calls</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          ${agents.map((agent: any) => `
            <tr>
              <td>${agent.name || "Unknown"}</td>
              <td>EGP ${(agent.total_sales || 0).toLocaleString()}</td>
              <td>${agent.total_meetings || 0}</td>
              <td>${agent.total_calls || 0}</td>
              <td><strong>${(agent.score || 0).toFixed(1)}%</strong></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function generateKPIReport(data: any): string {
  const agents = data.agents || [];

  return `
    <div class="summary-box">
      <div class="summary-title">KPI Summary</div>
      <p>Monthly performance metrics for ${agents.length} agent(s)</p>
    </div>

    <div class="section">
      <div class="section-title">KPI Breakdown by Agent</div>
      <table>
        <thead>
          <tr>
            <th>Agent Name</th>
            <th>Attendance</th>
            <th>Calls</th>
            <th>Behavior</th>
            <th>Meetings</th>
            <th>Sales Score</th>
            <th>Final Score</th>
          </tr>
        </thead>
        <tbody>
          ${agents.map((agent: any) => {
            const kpis = agent.kpis || {};
            return `
              <tr>
                <td>${agent.name || "Unknown"}</td>
                <td>${(kpis.attendance_month || 0).toFixed(1)}%</td>
                <td>${(kpis.calls_month || 0).toFixed(1)}%</td>
                <td>${(kpis.behavior_month || 0).toFixed(1)}%</td>
                <td>${(kpis.meetings_month || 0).toFixed(1)}%</td>
                <td>${(kpis.sales_score || 0).toFixed(1)}%</td>
                <td><strong>${(agent.score || 0).toFixed(1)}%</strong></td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function generateFinancialReport(data: any): string {
  const summary = data.summary || {};
  const breakdown = data.breakdown || [];

  return `
    <div class="summary-box">
      <div class="summary-title">Financial Summary</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Total Revenue</div>
          <div class="summary-value">EGP ${(summary.total_revenue || 0).toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Expenses</div>
          <div class="summary-value">EGP ${(summary.total_expenses || 0).toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Net Profit</div>
          <div class="summary-value">EGP ${(summary.net_profit || 0).toLocaleString()}</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Revenue Breakdown</div>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${breakdown.map((item: any) => `
            <tr>
              <td>${item.category || "N/A"}</td>
              <td>EGP ${(item.amount || 0).toLocaleString()}</td>
              <td>${(item.percentage || 0).toFixed(1)}%</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function generateMonthlyReport(data: any): string {
  const summary = data.summary || {};
  const agents = data.agents || [];

  return `
    <div class="summary-box">
      <div class="summary-title">Monthly Overview</div>
      <div class="summary-grid">
        <div class="summary-item">
          <div class="summary-label">Active Agents</div>
          <div class="summary-value">${summary.active_agents || 0}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Sales</div>
          <div class="summary-value">EGP ${(summary.total_sales || 0).toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Avg Performance</div>
          <div class="summary-value">${(summary.avg_score || 0).toFixed(1)}%</div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Top Performers</div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Agent Name</th>
            <th>Score</th>
            <th>Sales</th>
          </tr>
        </thead>
        <tbody>
          ${agents.slice(0, 10).map((agent: any, index: number) => `
            <tr>
              <td>${index + 1}</td>
              <td>${agent.name || "Unknown"}</td>
              <td><strong>${(agent.score || 0).toFixed(1)}%</strong></td>
              <td>EGP ${(agent.total_sales || 0).toLocaleString()}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

// Main handler
serve(async (req: Request) => {
  // CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request
    const requestData: ReportRequest = await req.json();
    const { org_id, report_type, year, month, title } = requestData;

    if (!org_id || !report_type || !year || !month) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 1. Get organization branding
    const { data: org } = await supabase
      .from("organizations")
      .select("name, logo_url, primary_color, secondary_color")
      .eq("id", org_id)
      .single();

    const branding: OrgBranding = {
      name: org?.name || "Organization",
      logo_url: org?.logo_url,
      primary_color: org?.primary_color,
      secondary_color: org?.secondary_color,
    };

    // 2. Fetch report data based on type
    let reportData: any = {};

    if (report_type === "sales" || report_type === "kpi" || report_type === "monthly") {
      // Get agent scores and daily logs for the month
      const { data: scores } = await supabase
        .from("agent_monthly_scores")
        .select(`
          agent_id,
          score,
          kpis,
          sales_agents (name)
        `)
        .eq("org_id", org_id)
        .eq("year", year)
        .eq("month", month);

      // Get daily logs summary
      const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const { data: logs } = await supabase
        .from("agent_daily_logs")
        .select("agent_id, calls_count, meetings_count, sales_amount")
        .eq("org_id", org_id)
        .gte("log_date", startDate)
        .lte("log_date", endDate);

      // Aggregate logs by agent
      const agentStats = new Map();
      (logs || []).forEach((log: any) => {
        const existing = agentStats.get(log.agent_id) || { total_calls: 0, total_meetings: 0, total_sales: 0 };
        existing.total_calls += log.calls_count || 0;
        existing.total_meetings += log.meetings_count || 0;
        existing.total_sales += log.sales_amount || 0;
        agentStats.set(log.agent_id, existing);
      });

      // Combine scores with stats
      const agents = (scores || []).map((s: any) => ({
        name: s.sales_agents?.name || "Unknown",
        score: s.score || 0,
        kpis: s.kpis || {},
        ...agentStats.get(s.agent_id) || {},
      })).sort((a: any, b: any) => b.score - a.score);

      reportData = {
        agents,
        summary: {
          active_agents: agents.length,
          total_sales: agents.reduce((sum: number, a: any) => sum + (a.total_sales || 0), 0),
          avg_score: agents.length > 0 
            ? agents.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / agents.length 
            : 0,
        },
      };
    } else if (report_type === "financial") {
      // Placeholder for financial data
      reportData = {
        summary: {
          total_revenue: 5000000,
          total_expenses: 3500000,
          net_profit: 1500000,
        },
        breakdown: [
          { category: "Sales Revenue", amount: 5000000, percentage: 100 },
          { category: "Salaries", amount: 2000000, percentage: 40 },
          { category: "Operations", amount: 1000000, percentage: 20 },
          { category: "Marketing", amount: 500000, percentage: 10 },
        ],
      };
    }

    // 3. Generate HTML
    const html = generateReportHTML(reportData, branding, report_type, year, month);

    // 4. Return HTML (in production, you'd convert this to PDF using a service like Puppeteer/Chrome)
    // For now, we return the HTML which can be converted client-side or via another service
    
    const fileName = `${report_type}-report-${year}-${String(month).padStart(2, "0")}.html`;
    const filePath = `${org_id}/${year}/${month}/${fileName}`;

    // Upload to storage (as HTML for now)
    const encoder = new TextEncoder();
    const htmlBlob = encoder.encode(html);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("reports")
      .upload(filePath, htmlBlob, {
        contentType: "text/html",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    // Create signed URL (valid for 1 hour)
    const { data: signedUrl } = await supabase.storage
      .from("reports")
      .createSignedUrl(filePath, 3600);

    return new Response(
      JSON.stringify({
        success: true,
        file_path: filePath,
        download_url: signedUrl?.signedUrl,
        report_type,
        period: `${year}-${String(month).padStart(2, "0")}`,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
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


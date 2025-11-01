/**
 * Report Generator Utility
 * Helper functions for generating and downloading reports
 */

import { supabase } from "./supabase-browser";

export type ReportType = "sales" | "kpi" | "financial" | "monthly";

export interface GenerateReportParams {
  reportType: ReportType;
  year: number;
  month: number;
  title?: string;
}

export interface GenerateReportResponse {
  success: boolean;
  file_path: string;
  download_url: string;
  report_type: ReportType;
  period: string;
}

/**
 * Generate a report using the Edge Function
 */
export async function generateReport(
  params: GenerateReportParams
): Promise<GenerateReportResponse> {
  try {
    const { data, error } = await supabase.functions.invoke("generate_report", {
      body: {
        report_type: params.reportType,
        year: params.year,
        month: params.month,
        title: params.title,
      },
    });

    if (error) {
      console.error('Edge function error:', error);
      throw new Error(error.message || "Failed to generate report");
    }

    if (!data) {
      throw new Error("No data returned from edge function");
    }

    return data as GenerateReportResponse;
  } catch (err: any) {
    console.error('Report generation error:', err);
    throw new Error(err.message || "Failed to generate report");
  }
}

/**
 * Download a report (opens in new tab)
 */
export function downloadReport(downloadUrl: string) {
  console.log('Opening report URL:', downloadUrl);
  
  if (!downloadUrl) {
    console.error('No download URL provided');
    alert('Error: No download URL generated. Please try again.');
    return;
  }
  
  // For data URLs, write to a new window directly
  if (downloadUrl.startsWith('data:')) {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(atob(downloadUrl.split(',')[1]));
      newWindow.document.close();
    }
  } else {
    window.open(downloadUrl, "_blank");
  }
}

/**
 * Print a report (opens in new window and triggers print dialog)
 */
export function printReport(downloadUrl: string) {
  const printWindow = window.open(downloadUrl, "_blank");
  if (printWindow) {
    printWindow.addEventListener("load", () => {
      printWindow.print();
    });
  }
}

/**
 * Get report display name
 */
export function getReportDisplayName(reportType: ReportType): string {
  switch (reportType) {
    case "sales":
      return "Sales Performance Report";
    case "kpi":
      return "Agent KPI Report";
    case "financial":
      return "Financial Summary";
    case "monthly":
      return "Monthly Overview";
    default:
      return "Report";
  }
}

/**
 * Get report description
 */
export function getReportDescription(reportType: ReportType): string {
  switch (reportType) {
    case "sales":
      return "Detailed sales performance metrics and agent rankings";
    case "kpi":
      return "Comprehensive KPI breakdown for all agents";
    case "financial":
      return "Revenue, expenses, and profit analysis";
    case "monthly":
      return "Complete monthly overview with top performers";
    default:
      return "Generate report";
  }
}

/**
 * Get report icon
 */
export function getReportIcon(reportType: ReportType): string {
  switch (reportType) {
    case "sales":
      return "📊";
    case "kpi":
      return "🎯";
    case "financial":
      return "💰";
    case "monthly":
      return "📅";
    default:
      return "📄";
  }
}

/**
 * Format month for display
 */
export function formatReportPeriod(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

/**
 * Validate report parameters
 */
export function validateReportParams(
  params: GenerateReportParams
): { valid: boolean; error?: string } {
  if (!params.reportType) {
    return { valid: false, error: "Report type is required" };
  }

  if (!params.year || params.year < 2020 || params.year > 2100) {
    return { valid: false, error: "Invalid year" };
  }

  if (!params.month || params.month < 1 || params.month > 12) {
    return { valid: false, error: "Invalid month (must be 1-12)" };
  }

  // Don't allow future months
  const now = new Date();
  const reportDate = new Date(params.year, params.month - 1);
  if (reportDate > now) {
    return { valid: false, error: "Cannot generate reports for future periods" };
  }

  return { valid: true };
}

/**
 * Get available report types for a role
 */
export function getAvailableReports(role: string): ReportType[] {
  const allReports: ReportType[] = ["sales", "kpi", "financial", "monthly"];
  
  // All roles can see all reports for now
  // In the future, you might want to restrict certain reports by role
  if (role === "agent") {
    return ["kpi", "monthly"]; // Agents can only see their own performance
  }
  
  return allReports;
}


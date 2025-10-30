/**
 * Reports Center Page
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign, Users, FileBarChart, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/zustand/store";
import { hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";
import {
  generateReport,
  downloadReport,
  getReportDisplayName,
  getReportDescription,
  getReportIcon,
  formatReportPeriod,
  validateReportParams,
  type ReportType,
} from "@/lib/report-generator";

export default function ReportsPage() {
  const { currentOrgId, userRole } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generatingReport, setGeneratingReport] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<{ [key: string]: string }>({});
  const [error, setError] = useState<string | null>(null);
  
  const reportTemplates: Array<{
    id: ReportType;
    name: string;
    description: string;
    icon: any;
    gradient: string;
  }> = [
    {
      id: 'sales',
      name: 'Sales Performance Report',
      description: 'Agent sales metrics, meetings, calls, and rankings',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'kpi',
      name: 'Agent KPI Report',
      description: 'Detailed KPI breakdown: attendance, calls, behavior, meetings',
      icon: FileBarChart,
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      id: 'financial',
      name: 'Financial Summary',
      description: 'Revenue, expenses, profit analysis, and breakdowns',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      id: 'monthly',
      name: 'Monthly Overview',
      description: 'Complete monthly summary with top performers',
      icon: Users,
      gradient: 'from-orange-500 to-red-500',
    },
  ];
  
  const canGenerate = userRole && hasPermission(userRole, 'reports:generate');
  
  const handleGenerateReport = async (reportType: ReportType) => {
    if (!currentOrgId) {
      setError("Please select an organization first");
      return;
    }

    setError(null);
    setGeneratingReport(reportType);

    try {
      // Parse year and month from selectedMonth (format: YYYY-MM)
      const [year, month] = selectedMonth.split("-").map(Number);

      // Validate parameters
      const validation = validateReportParams({
        orgId: currentOrgId,
        reportType,
        year,
        month,
      });

      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // Generate the report
      const result = await generateReport({
        orgId: currentOrgId,
        reportType,
        year,
        month,
        title: `${getReportDisplayName(reportType)} - ${formatReportPeriod(year, month)}`,
      });

      // Download the report
      downloadReport(result.download_url);

      // Update last generated timestamp
      setLastGenerated((prev) => ({
        ...prev,
        [reportType]: new Date().toISOString(),
      }));
    } catch (err: any) {
      console.error("Error generating report:", err);
      setError(err.message || "Failed to generate report. Please try again.");
    } finally {
      setGeneratingReport(null);
    }
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
            <FileText className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Reports Center</h1>
            <p className="text-muted-foreground">
              Generate and download professional reports
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Period Selector */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Label className="text-sm font-medium">Report Period:</Label>
            </div>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setError(null);
              }}
              className="w-auto"
              max={new Date().toISOString().slice(0, 7)}
            />
            {!currentOrgId && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                ⚠️ Please select an organization to generate reports
              </p>
            )}
          </div>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {reportTemplates.map((template, index) => {
          const Icon = template.icon;
          const isGenerating = generatingReport === template.id;
          const wasRecentlyGenerated = lastGenerated[template.id];
          
          return (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-all">
                <CardHeader>
                  <div className={cn(
                    "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br mb-4",
                    template.gradient
                  )}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {template.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button
                      className="w-full gradient-bg"
                      onClick={() => handleGenerateReport(template.id)}
                      disabled={!canGenerate || !currentOrgId || isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Download className="mr-2 h-4 w-4" />
                          Generate Report
                        </>
                      )}
                    </Button>
                    {wasRecentlyGenerated && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-center text-green-600 dark:text-green-400 flex items-center justify-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Generated {new Date(wasRecentlyGenerated).toLocaleTimeString()}
                      </motion.p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <p className="text-sm text-muted-foreground">
            Your previously generated reports
          </p>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Reports Yet</h3>
            <p className="text-muted-foreground mb-6">
              Generate your first report using the templates above
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Info Banner */}
      <Card className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            ✨ Professional Reports Now Live!
          </h4>
          <p className="text-sm text-green-800 dark:text-green-200">
            Generate beautiful, branded HTML reports with one click. Reports include your organization's logo, colors, and comprehensive data visualizations. 
            {" "}
            <span className="font-medium">Tip:</span> Use your browser's print function (Ctrl/Cmd+P) to save as PDF.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


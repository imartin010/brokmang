/**
 * Reports Center Page
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign, Users, FileBarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/zustand/store";
import { hasPermission } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export default function ReportsPage() {
  const { currentOrgId, userRole } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  
  const reportTemplates = [
    {
      id: 'monthly_performance',
      name: 'Monthly Performance Report',
      description: 'Comprehensive agent performance metrics, KPIs, and rankings',
      icon: TrendingUp,
      gradient: 'from-blue-500 to-cyan-500',
      available: true,
    },
    {
      id: 'financial_summary',
      name: 'Financial Summary Report',
      description: 'Break-even analysis, costs, revenues, and projections',
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-500',
      available: true,
    },
    {
      id: 'team_report',
      name: 'Team Performance Report',
      description: 'Team-level metrics, comparisons, and trends',
      icon: Users,
      gradient: 'from-purple-500 to-pink-500',
      available: true,
    },
  ];
  
  const canGenerate = userRole && hasPermission(userRole, 'reports:generate');
  const canExport = userRole && hasPermission(userRole, 'reports:export');
  
  const handleGenerateReport = (templateId: string) => {
    alert(`PDF generation coming soon!\n\nTemplate: ${templateId}\nMonth: ${selectedMonth}\n\nThis will generate a professional PDF report.`);
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
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-auto"
            />
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Report Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {reportTemplates.map((template, index) => {
          const Icon = template.icon;
          
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
                      disabled={!canGenerate || !template.available}
                    >
                      <FileBarChart className="mr-2 h-4 w-4" />
                      Generate PDF
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                      {template.available ? 'Coming soon: PDF generation' : 'Not available yet'}
                    </p>
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
      <Card className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
            📊 Professional PDF Reports Coming Soon!
          </h4>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            The PDF generation Edge Function will create beautiful, customizable reports with charts, tables, and insights.
            The UI is ready - backend integration coming in the next phase.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}


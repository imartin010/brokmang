"use client";

import { motion } from "framer-motion";
import {
  Clock,
  Phone,
  Users,
  DollarSign,
  TrendingUp,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { MonthlyKPIs } from "@/lib/types";

type KpiOverviewCardsProps = {
  kpis: MonthlyKPIs | null;
};

export function KpiOverviewCards({ kpis }: KpiOverviewCardsProps) {
  if (!kpis) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No KPI data available. Calculate scores first.</p>
      </div>
    );
  }

  const cards = [
    {
      title: "Attendance",
      value: `${kpis.attendance_month.toFixed(1)}%`,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
    },
    {
      title: "Calls",
      value: `${kpis.calls_month.toFixed(1)}%`,
      icon: Phone,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
    },
    {
      title: "Behavior",
      value: `${kpis.behavior_month.toFixed(1)}%`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
    },
    {
      title: "Meetings",
      value: `${kpis.meetings_month.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100 dark:bg-orange-900/20",
    },
    {
      title: "Sales",
      value: `${kpis.sales_score.toFixed(1)}%`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100 dark:bg-emerald-900/20",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${card.bgColor}`}>
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${card.color}`}>
                  {card.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Monthly average
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Leads Context Card */}
      {kpis.leads_info && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Leads Context</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">
                        معلومة سياقية فقط — لا تؤثر على السكور
                        <br />
                        <span className="text-xs italic">
                          Context only - not part of score calculation
                        </span>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription>
                For reporting purposes only (not scored)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {kpis.leads_info.leads_total}
                  </div>
                  <p className="text-xs text-muted-foreground">Total Leads</p>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">
                    {kpis.leads_info.leads_days_active}
                  </div>
                  <p className="text-xs text-muted-foreground">Active Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}


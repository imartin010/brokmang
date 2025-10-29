/**
 * Smart Insights Page
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lightbulb, TrendingDown, AlertTriangle, Trophy, RefreshCw, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/zustand/store";
import { cn } from "@/lib/utils";

export default function InsightsPage() {
  const { currentOrgId } = useAuth();
  const [loading, setLoading] = useState(false);
  
  // Mock insights for UI demonstration
  const mockInsights = [
    {
      type: 'performance_drop',
      title: 'Calls Volume Decreased',
      description: 'Average daily calls dropped by 15% compared to last month',
      confidence: 85,
      reasons: [
        'Team Beta showed 20% decrease in calls',
        'Fatma Ibrahim: 30 calls/day → 18 calls/day',
        'Trend started 2 weeks ago',
      ],
      action_url: '/crm/logs',
      icon: TrendingDown,
      color: 'from-yellow-500 to-orange-500',
    },
    {
      type: 'break_even_warning',
      title: 'Break-Even Risk Detected',
      description: 'Current sales pace suggests potential deficit this month',
      confidence: 72,
      reasons: [
        'Sales at 60% of monthly target',
        '10 days remaining in month',
        'Average daily sales below required pace',
      ],
      action_url: '/analyze',
      icon: AlertTriangle,
      color: 'from-red-500 to-pink-500',
    },
    {
      type: 'top_performer',
      title: 'Star Performer Identified',
      description: 'Youssef Mahmoud consistently outperforming targets',
      confidence: 95,
      reasons: [
        '140 calls/day average (target: 120)',
        '3.2M EGP sales this month',
        'Top KPI score: 94/100',
      ],
      action_url: '/crm/agents',
      icon: Trophy,
      color: 'from-green-500 to-emerald-500',
    },
  ];
  
  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      alert('Insights computation coming soon!\n\nThis will analyze your data and provide AI-powered insights.');
    }, 1500);
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-blue-600 dark:text-blue-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Lightbulb className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Smart Insights</h1>
              <p className="text-muted-foreground">
                AI-powered analytics and recommendations
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Insights
              </>
            )}
          </Button>
        </div>
      </motion.div>
      
      {/* Insights Grid */}
      <div className="space-y-6">
        {mockInsights.map((insight, index) => {
          const Icon = insight.icon;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={cn(
                      "w-14 h-14 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0",
                      insight.color
                    )}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{insight.title}</h3>
                          <p className="text-muted-foreground mt-1">
                            {insight.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className={cn(
                            "text-2xl font-bold",
                            getConfidenceColor(insight.confidence)
                          )}>
                            {insight.confidence}%
                          </p>
                        </div>
                      </div>
                      
                      {/* Reasons */}
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-semibold">Key Factors:</p>
                        <ul className="space-y-1">
                          {insight.reasons.map((reason, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-blue-600">•</span>
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Action */}
                      <div className="mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.href = insight.action_url}
                        >
                          View Details →
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
      
      {/* Info Banner */}
      <Card className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">
                🤖 AI-Powered Insights Coming Soon!
              </h4>
              <p className="text-sm text-purple-800 dark:text-purple-200">
                The insights computation Edge Function will analyze your data using advanced algorithms to:
              </p>
              <ul className="mt-2 text-sm text-purple-800 dark:text-purple-200 space-y-1">
                <li>• Detect performance drops and trends</li>
                <li>• Identify underperforming agents and teams</li>
                <li>• Predict break-even warnings</li>
                <li>• Highlight top performers</li>
                <li>• Provide actionable recommendations</li>
              </ul>
              <p className="mt-3 text-xs text-purple-700 dark:text-purple-300">
                The UI is ready - backend analytics engine coming next!
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


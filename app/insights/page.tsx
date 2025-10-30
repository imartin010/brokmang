/**
 * Smart Insights Page
 * Brokmang. v1.1
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lightbulb,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Trophy,
  RefreshCw,
  Loader2,
  Sparkles,
  AlertCircle,
  Activity,
  CheckCircle,
  XCircle,
  Lock,
  Crown,
  Users as UsersIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/zustand/store";
import { cn } from "@/lib/utils";
import { createBrowserClient } from "@/lib/supabase-browser";
import { SubscriptionPaymentModal } from "@/components/subscription-payment-modal";

interface Insight {
  type: string;
  title: string;
  description: string;
  confidence: number;
  reasons: string[];
  action_url: string;
  icon: string;
  color: string;
}

const iconMap: Record<string, any> = {
  Lightbulb,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Trophy,
  AlertCircle,
  Activity,
};

export default function InsightsPage() {
  const { currentOrgId, user, userAccountType } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  
  // Check subscription status on mount
  useEffect(() => {
    if (user?.id) {
      checkSubscription();
    }
  }, [user]);
  
  const checkSubscription = async () => {
    if (!user?.id) return;
    
    try {
      const response = await fetch(`/api/subscription/status?user_id=${user.id}`);
      const data = await response.json();
      setSubscriptionStatus(data);
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };
  
  // Auto-generate insights on mount if org is selected AND has subscription
  useEffect(() => {
    if (currentOrgId && insights.length === 0 && subscriptionStatus?.has_subscription) {
      handleRefresh();
    }
  }, [currentOrgId, subscriptionStatus]);
  
  const handleRefresh = async () => {
    if (!currentOrgId) {
      setError("Please select an organization first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/insights/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          org_id: currentOrgId,
          user_id: user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate insights");
      }

      const data = await response.json();
      setInsights(data.insights || []);
      setLastGenerated(new Date(data.generated_at));
    } catch (err: any) {
      console.error("Error generating insights:", err);
      setError(err.message || "Failed to generate insights. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 dark:text-green-400';
    if (confidence >= 60) return 'text-blue-600 dark:text-blue-400';
    return 'text-yellow-600 dark:text-yellow-400';
  };
  
  // Show loading while checking subscription
  if (checkingSubscription) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Checking subscription status...</p>
        </div>
      </div>
    );
  }

  // Show paywall if no active subscription
  if (!subscriptionStatus?.has_subscription && !subscriptionStatus?.pending_payment) {
    const amount = userAccountType === "ceo" ? 100 : 50;
    const planName = userAccountType === "ceo" ? "CEO Plan" : "Team Leader Plan";

    return (
      <>
        <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl w-full"
          >
            <Card>
              <CardContent className="p-8">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mx-auto mb-6">
                    <Lock className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold mb-3">AI Features Locked</h2>
                  <p className="text-muted-foreground mb-6">
                    Subscribe to unlock AI-powered Smart Insights with OpenAI GPT-4o-mini
                  </p>

                  {/* Pricing Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 mb-6 border-2 border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-center gap-2 mb-3">
                      {userAccountType === "ceo" ? (
                        <Crown className="h-6 w-6 text-purple-600" />
                      ) : (
                        <UsersIcon className="h-6 w-6 text-blue-600" />
                      )}
                      <h3 className="text-xl font-bold">{planName}</h3>
                    </div>
                    <div className="text-5xl font-bold mb-2">
                      {amount} <span className="text-2xl">EGP</span>
                    </div>
                    <p className="text-sm text-muted-foreground">per month (31 days)</p>
                  </div>

                  {/* Features List */}
                  <div className="text-left mb-6">
                    <h4 className="font-semibold mb-3">✨ What You'll Get:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600 flex-shrink-0 mt-0.5" />
                        <span>Real-time AI analysis of your performance data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>Actionable insights with confidence scores</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Early warnings for performance drops</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <span>Identify top performers automatically</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span>Unlimited insight generations</span>
                      </li>
                    </ul>
                  </div>

                  <Button
                    size="lg"
                    className="w-full gradient-bg text-lg py-6"
                    onClick={() => setShowPaymentModal(true)}
                  >
                    Subscribe Now - {amount} EGP/month
                  </Button>

                  <p className="text-xs text-muted-foreground mt-4">
                    Payment via InstaPay • Admin validation within 24 hours
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Payment Modal */}
        <SubscriptionPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          userType={userAccountType as "ceo" | "team_leader"}
          userId={user?.id || ""}
          orgId={currentOrgId || undefined}
          onSuccess={() => {
            checkSubscription();
          }}
        />
      </>
    );
  }

  // Show pending payment status
  if (subscriptionStatus?.pending_payment) {
    return (
      <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                <Loader2 className="h-8 w-8 text-amber-600 dark:text-amber-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Payment Pending</h2>
              <p className="text-muted-foreground mb-6">
                Your payment is being validated by our admin. This usually takes up to 24 hours.
              </p>
              <p className="text-sm text-muted-foreground">
                You'll receive a notification once your AI features are activated.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => window.location.href = "/dashboard"}
              >
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">AI Smart Insights</h1>
              <p className="text-muted-foreground">
                OpenAI-powered analytics and recommendations
              </p>
              {lastGenerated && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Last updated: {lastGenerated.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading || !currentOrgId}
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

        {!currentOrgId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"
          >
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Please select an organization to generate AI insights
            </p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2"
          >
            <XCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">
                Error Generating Insights
              </p>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* Insights Grid */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Data...</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is examining performance metrics, trends, and patterns to provide you with actionable insights.
            </p>
          </motion.div>
        ) : insights.length > 0 ? (
          <motion.div
            key="insights"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {insights.map((insight, index) => {
              const IconComponent = iconMap[insight.icon] || Lightbulb;
              
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
                          <IconComponent className="h-7 w-7 text-white" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2 flex-wrap gap-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold">{insight.title}</h3>
                              <p className="text-muted-foreground mt-1">
                                {insight.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">AI Confidence</p>
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
                                  <span className="text-purple-600">•</span>
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
                              Take Action →
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : !error && currentOrgId ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <Lightbulb className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Insights Yet</h3>
            <p className="text-muted-foreground mb-6">
              Click "Refresh Insights" to analyze your data
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      
      {/* Info Banner */}
      {insights.length > 0 && (
        <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-200 dark:border-green-800">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                  ✨ AI-Powered Insights Active!
                </h4>
                <p className="text-sm text-green-800 dark:text-green-200">
                  These insights are generated by OpenAI GPT-4o-mini, analyzing your:
                </p>
                <ul className="mt-2 text-sm text-green-800 dark:text-green-200 space-y-1">
                  <li>• Agent performance metrics and KPI scores</li>
                  <li>• Month-over-month trends and changes</li>
                  <li>• Daily activity logs and patterns</li>
                  <li>• Top and bottom performers</li>
                  <li>• Break-even and financial targets</li>
                </ul>
                <p className="mt-3 text-xs text-green-700 dark:text-green-300">
                  Refresh insights regularly to stay informed about your team's performance!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


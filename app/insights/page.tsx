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
import { SubscriptionPaymentModal } from "@/components/subscription-payment-modal";
import { supabase } from "@/lib/supabase-browser";

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
  const { user, userAccountType, setUserAccountType, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loadingUserType, setLoadingUserType] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Load userAccountType if not available
  useEffect(() => {
    const loadUserType = async () => {
      if (!user?.id || userAccountType || loadingUserType) return;
      
      setLoadingUserType(true);
      try {
        const { data } = await supabase
          .from('user_profiles')
          .select('user_type')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (data?.user_type) {
          // Map database value to TypeScript type
          const mappedType = data.user_type === 'ceo' ? 'ceo' : 
                           data.user_type === 'team_leader' ? 'team_leader' :
                           data.user_type === 'admin' ? 'admin' :
                           null;
          if (mappedType) {
            setUserAccountType(mappedType);
          }
        }
      } catch (error) {
        console.error('Error loading user type:', error);
      } finally {
        setLoadingUserType(false);
      }
    };
    
    if (user?.id && !userAccountType) {
      loadUserType();
    }
  }, [user?.id, userAccountType, setUserAccountType, loadingUserType]);
  
  // Get user directly from Supabase if not in store
  useEffect(() => {
    const fetchUser = async () => {
      if (user?.id) {
        setCurrentUserId(user.id);
        return;
      }
      
      // If user not in store, get it directly from Supabase
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        
        clearTimeout(timeoutId);
        
        if (supabaseUser) {
          setCurrentUserId(supabaseUser.id);
        } else {
          console.warn("[Insights] No user found, stopping subscription check");
          setCheckingSubscription(false);
        }
      } catch (error: any) {
        console.error("[Insights] Error fetching user:", error);
        setCheckingSubscription(false);
      }
    };
    
    fetchUser();
  }, [user?.id]);
  
  // Check subscription status on mount and when user loads
  useEffect(() => {
    if (currentUserId) {
      checkSubscription(currentUserId);
    } else if (!authLoading && !currentUserId && !checkingSubscription) {
      // User not loaded and auth is done loading - only set if not already checking
      // This prevents unnecessary state updates
    } else if (!authLoading && !currentUserId) {
      // If auth is done but no user, stop checking after a short delay
      const timeout = setTimeout(() => {
        setCheckingSubscription(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
    // If authLoading is true, keep checkingSubscription true (show loading state)
  }, [currentUserId, authLoading]);
  
  const checkSubscription = async (userId: string) => {
    if (!userId) {
      console.log("[Insights] No user ID provided, skipping subscription check");
      setCheckingSubscription(false);
      return;
    }
    
    console.log("[Insights] Checking subscription for user:", userId);
    
    try {
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
      
      const response = await fetch(`/api/subscription/status?user_id=${userId}`, {
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        console.error("[Insights] Subscription check failed:", response.status);
        // If table doesn't exist or error, assume no subscription
        setSubscriptionStatus({ has_subscription: false, pending_payment: false });
        setCheckingSubscription(false);
        return;
      }
      
      const data = await response.json();
      console.log("[Insights] Subscription status response:", data);
      setSubscriptionStatus(data);
    } catch (error: any) {
      console.error("[Insights] Error checking subscription:", error);
      // On error, assume no subscription (show paywall)
      setSubscriptionStatus({ has_subscription: false, pending_payment: false });
    } finally {
      // Always stop checking to ensure UI updates
      setCheckingSubscription(false);
    }
  };
  
  // Auto-generate insights on mount if has subscription
  useEffect(() => {
    if (currentUserId && insights.length === 0 && subscriptionStatus?.has_subscription) {
      handleRefresh();
    }
  }, [currentUserId, subscriptionStatus]);
  
  const handleRefresh = async () => {
    if (!currentUserId) {
      setError("Please sign in first");
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
          user_id: currentUserId,
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
  
  // Set timeout to prevent infinite loading
  useEffect(() => {
    if (checkingSubscription && !currentUserId) {
      const timeout = setTimeout(() => {
        console.warn("[Insights] Subscription check timeout, stopping loading");
        setCheckingSubscription(false);
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [checkingSubscription, currentUserId]);

  // Show loading while checking subscription (but allow user to proceed if user exists)
  // Only show loading if we don't have a user ID yet
  if (checkingSubscription && !currentUserId) {
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
    // Default to team_leader pricing if userAccountType is not loaded
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
                    onClick={async () => {
                      // Get user from store or session
                      let currentUser = user;
                      if (!currentUser?.id) {
                        // Try to get user from session directly
                        const { data: { user: sessionUser } } = await supabase.auth.getUser();
                        if (!sessionUser) {
                          alert("Please sign in to subscribe.");
                          return;
                        }
                        currentUser = sessionUser;
                      }
                      
                      // Ensure user is set in store for modal
                      if (currentUser && !user) {
                        // User will be fetched by modal if needed
                      }
                      
                      // If userAccountType is not loaded, try to load it
                      let finalUserType = userAccountType;
                      if (!finalUserType && currentUser?.id) {
                        setLoadingUserType(true);
                        try {
                          const { data } = await supabase
                            .from('user_profiles')
                            .select('user_type')
                            .eq('user_id', currentUser.id)
                            .maybeSingle();
                          
                          if (data?.user_type) {
                            const mappedType = data.user_type === 'ceo' ? 'ceo' : 
                                             data.user_type === 'team_leader' ? 'team_leader' : 
                                             null;
                            if (mappedType) {
                              setUserAccountType(mappedType);
                              finalUserType = mappedType;
                            }
                          }
                        } catch (error) {
                          console.error('Error loading user type:', error);
                        } finally {
                          setLoadingUserType(false);
                        }
                        
                        // If still no type, use default (team_leader pricing)
                        if (!finalUserType) {
                          finalUserType = 'team_leader';
                        }
                      }
                      
                      // Open modal - it will fetch user ID if needed
                      setShowPaymentModal(true);
                    }}
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

        {/* Payment Modal - User ID will be fetched by modal if not in props */}
        <SubscriptionPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          userType={(userAccountType || 'team_leader') as "ceo" | "team_leader"}
          userId={user?.id || ""} // Will be fetched by modal if empty
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
            disabled={loading || !currentUserId}
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
        ) : !error && currentUserId ? (
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


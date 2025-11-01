/**
 * Admin Subscriptions Management Page
 * View and validate subscription payments
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  User,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw,
  Eye,
  Search,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/zustand/store";
import { supabase } from "@/lib/supabase-browser";
import { formatDistanceToNow } from "date-fns";

interface Subscription {
  id: string;
  user_id: string;
  status: string;
  amount_egp: number;
  payment_reference: string | null;
  payment_screenshot_url: string | null;
  payment_submitted_at: string;
  admin_notes: string | null;
  created_at: string;
  start_date: string | null;
  end_date: string | null;
  user_email?: string;
  user_name?: string;
}

export default function AdminSubscriptionsPage() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [validating, setValidating] = useState(false);
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "cancelled">("pending");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadSubscriptions();
  }, [filter]);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);

      let query = supabase
        .from("subscriptions")
        .select("*")
        .order("created_at", { ascending: false });

      if (filter === "pending") {
        query = query.eq("status", "pending_payment");
      } else if (filter === "active") {
        query = query.eq("status", "active");
      } else if (filter === "cancelled") {
        query = query.eq("status", "cancelled");
      }

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        const userIds = [...new Set(data.map((s) => s.user_id))];
        const { data: profiles } = await supabase
          .from("user_profiles")
          .select("user_id, full_name")
          .in("user_id", userIds);

        const enriched = data.map((sub) => {
          const profile = profiles?.find((p) => p.user_id === sub.user_id);
          return {
            ...sub,
            user_email: `User ${sub.user_id.slice(0, 8)}`,
            user_name: profile?.full_name || "User",
          };
        });
        setSubscriptions(enriched);
      }
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleValidate = async (action: "approve" | "reject") => {
    if (!selectedSubscription || !user?.id) return;

    setValidating(true);
    try {
      const response = await fetch("/api/subscription/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription_id: selectedSubscription.id,
          admin_user_id: user.id,
          action,
          admin_notes: adminNotes || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Validation failed");
      }

      await loadSubscriptions();
      setSelectedSubscription(null);
      setAdminNotes("");
    } catch (error: any) {
      console.error("[Admin Subscriptions] Error validating payment:", error);
      // Error will be displayed via UI state if needed
      throw error;
    } finally {
      setValidating(false);
    }
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      sub.user_name?.toLowerCase().includes(query) ||
      sub.user_id.toLowerCase().includes(query) ||
      sub.payment_reference?.toLowerCase().includes(query)
    );
  });

  const pendingCount = subscriptions.filter((s) => s.status === "pending_payment").length;
  const activeCount = subscriptions.filter((s) => s.status === "active").length;
  const totalRevenue = subscriptions
    .filter((s) => s.status === "active")
    .reduce((sum, s) => sum + (s.amount_egp || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Subscription Management</h1>
        <p className="text-muted-foreground">
          View and validate subscription payments
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscriptions</p>
                <p className="text-2xl font-bold">{activeCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{totalRevenue.toLocaleString()} EGP</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "all" ? "default" : "outline"}
                onClick={() => setFilter("all")}
              >
                All
              </Button>
              <Button
                variant={filter === "pending" ? "default" : "outline"}
                onClick={() => setFilter("pending")}
                className="relative"
              >
                Pending
                {pendingCount > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {pendingCount}
                  </span>
                )}
              </Button>
              <Button
                variant={filter === "active" ? "default" : "outline"}
                onClick={() => setFilter("active")}
              >
                Active
              </Button>
              <Button
                variant={filter === "cancelled" ? "default" : "outline"}
                onClick={() => setFilter("cancelled")}
              >
                Cancelled
              </Button>
              <Button variant="ghost" size="icon" onClick={loadSubscriptions}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      {filteredSubscriptions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Subscriptions Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : filter === "pending"
                ? "No pending payments to validate."
                : "No subscriptions match this filter."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredSubscriptions.map((subscription) => (
            <motion.div
              key={subscription.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`cursor-pointer hover:shadow-lg transition-all ${
                  subscription.status === "pending_payment"
                    ? "border-amber-500 border-2"
                    : ""
                }`}
                onClick={() => setSelectedSubscription(subscription)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            subscription.status === "pending_payment"
                              ? "bg-amber-500"
                              : subscription.status === "active"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        <h3 className="text-xl font-bold">{subscription.user_name}</h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${
                            subscription.status === "pending_payment"
                              ? "bg-amber-100 text-amber-800"
                              : subscription.status === "active"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {subscription.status.replace("_", " ")}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{subscription.user_email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold text-foreground">
                            {subscription.amount_egp} EGP
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Submitted {formatDistanceToNow(new Date(subscription.payment_submitted_at || subscription.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {subscription.payment_reference && (
                          <div className="text-xs font-mono">
                            Ref: {subscription.payment_reference}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubscription(subscription);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Validation Modal */}
      {selectedSubscription && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-2xl"
          >
            <Card>
              <CardHeader>
                <CardTitle>Review Subscription Payment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>User</Label>
                    <p className="font-semibold">{selectedSubscription.user_name}</p>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.user_email}</p>
                  </div>
                  <div>
                    <Label>Amount</Label>
                    <p className="font-semibold">{selectedSubscription.amount_egp} EGP/month</p>
                  </div>
                  <div>
                    <Label>Payment Reference</Label>
                    <p className="font-mono text-sm">
                      {selectedSubscription.payment_reference || "Not provided"}
                    </p>
                  </div>
                  {selectedSubscription.payment_screenshot_url && (
                    <div>
                      <Label>Payment Screenshot</Label>
                      <div className="mt-2">
                        <img
                          src={selectedSubscription.payment_screenshot_url}
                          alt="Payment screenshot"
                          className="max-w-full h-auto rounded-lg border"
                        />
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="admin_notes">Admin Notes (Optional)</Label>
                    <textarea
                      id="admin_notes"
                      className="w-full min-h-[80px] px-3 py-2 text-sm rounded-md border border-input bg-background"
                      placeholder="Add notes about this validation..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedSubscription(null);
                      setAdminNotes("");
                    }}
                    disabled={validating}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleValidate("reject")}
                    disabled={validating}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => handleValidate("approve")}
                    disabled={validating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {validating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Validating...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
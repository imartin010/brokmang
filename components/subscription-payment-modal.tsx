/**
 * Subscription Payment Modal
 * Shows InstaPay payment link and QR code
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  QrCode,
  ExternalLink,
  Upload,
  Check,
  Loader2,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: "ceo" | "team_leader";
  userId: string;
  orgId?: string;
  onSuccess?: () => void;
}

export function SubscriptionPaymentModal({
  isOpen,
  onClose,
  userType,
  userId,
  orgId,
  onSuccess,
}: SubscriptionPaymentModalProps) {
  const [step, setStep] = useState<"payment" | "confirmation">("payment");
  const [paymentReference, setPaymentReference] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotUrl, setScreenshotUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const amount = userType === "ceo" ? 100 : 50;
  const instaPayLink = "https://ipn.eg/S/imartin/instapay/1zMdPx";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshotFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setScreenshotUrl(url);
      // Clear any previous errors
      setError("");
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshotFile) {
      setError("Please upload a screenshot of your payment");
      return;
    }

    if (!userId) {
      setError("User ID is missing. Please refresh the page and try again.");
      return;
    }

    if (!userType || (userType !== "ceo" && userType !== "team_leader")) {
      setError("User type is invalid. Please refresh the page and try again.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // In production, upload screenshot to Supabase Storage
      let uploadedScreenshotUrl = "";
      if (screenshotFile) {
        // TODO: Upload to Supabase Storage
        // For now, we'll skip file upload and just store the reference
        uploadedScreenshotUrl = ""; // Replace with actual upload URL
      }

      // Create subscription request
      const payload = {
        user_id: userId,
        org_id: orgId,
        user_type: userType,
        payment_reference: paymentReference || "",
        payment_screenshot_url: uploadedScreenshotUrl,
      };

      console.log("Submitting payment with payload:", payload);

      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit payment");
      }

      // Success!
      setStep("confirmation");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 3000);
    } catch (err: any) {
      console.error("Error submitting payment:", err);
      setError(err.message || "Failed to submit payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-3xl my-8"
        >
          <Card className="border-2">
            <CardContent className="p-0 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-primary/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm border-b-2">
                <div className="flex items-center justify-between p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Subscribe to AI Features
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1 font-medium">
                        {userType === "ceo" ? "CEO Plan" : "Team Leader Plan"} -{" "}
                        <span className="font-bold text-primary text-lg">{amount} EGP/month</span>
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onClose}
                    className="hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {step === "payment" ? (
                <>
                  {/* Warning if userType is not set */}
                  {(!userType || (userType !== "ceo" && userType !== "team_leader")) && (
                    <div className="p-6 pb-0">
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
                            Account type not detected. Please refresh the page and try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Payment Step */}
                  <div className="p-6 space-y-8">
                    {/* InstaPay Link */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                          1
                        </span>
                        Pay via InstaPay
                      </h3>
                      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/30 dark:via-purple-950/30 dark:to-pink-950/30 p-6 rounded-xl border-2 border-blue-100 dark:border-blue-900/50 shadow-sm">
                        <p className="text-sm text-center mb-4 text-gray-700 dark:text-gray-300">
                          Click the button below to open InstaPay and send{" "}
                          <span className="font-bold text-2xl text-primary block mt-2">{amount} EGP</span>{" "}
                          to:
                        </p>
                        <div className="bg-white dark:bg-gray-950 p-4 rounded-lg mb-4 font-mono text-center text-xl font-bold shadow-inner border-2 border-dashed border-gray-300 dark:border-gray-700">
                          imartin@instapay
                        </div>
                        <Button
                          className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg"
                          onClick={() => window.open(instaPayLink, "_blank")}
                        >
                          <ExternalLink className="mr-2 h-5 w-5" />
                          Open InstaPay
                        </Button>
                      </div>
                    </div>

                    {/* OR Divider */}
                    <div className="relative py-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t-2 border-dashed"></div>
                      </div>
                      <div className="relative flex justify-center">
                        <span className="px-4 py-1 bg-background text-sm font-medium text-muted-foreground border rounded-full">
                          OR
                        </span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div>
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2 justify-center">
                        <QrCode className="h-6 w-6 text-primary" />
                        Scan QR Code
                      </h3>
                      <div className="flex flex-col items-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-8 rounded-xl border-2 shadow-inner">
                        <div className="bg-white p-4 rounded-xl shadow-lg border-2 border-gray-200 dark:border-gray-700">
                          <Image
                            src="/IMG_30FF121DDFA3-1.jpeg"
                            alt="InstaPay QR Code"
                            width={240}
                            height={240}
                            className="rounded-lg"
                          />
                        </div>
                        <div className="mt-4 text-center space-y-1">
                          <p className="font-mono text-sm font-semibold">imartin@instapay</p>
                          <p className="text-xs text-muted-foreground">
                            Powered by <span className="font-semibold text-primary">InstaPay</span>
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-center text-muted-foreground mt-3 font-medium">
                        Scan with your banking app to pay {amount} EGP
                      </p>
                    </div>

                    {/* Payment Confirmation Form */}
                    <div className="border-t-2 pt-8">
                      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">
                          2
                        </span>
                        Confirm Payment
                      </h3>
                      <div className="space-y-5 bg-muted/30 p-6 rounded-xl border">
                        <div>
                          <Label htmlFor="screenshot" className="text-sm font-semibold flex items-center gap-2">
                            <Upload className="h-4 w-4 text-primary" />
                            Payment Screenshot *
                            <span className="text-red-500">Required</span>
                          </Label>
                          <div className="mt-2">
                            <Input
                              id="screenshot"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="cursor-pointer h-11 border-2 border-primary/30"
                              required
                            />
                          </div>
                          {screenshotUrl && (
                            <div className="mt-3 flex justify-center">
                              <div className="relative">
                                <img
                                  src={screenshotUrl}
                                  alt="Payment screenshot"
                                  className="max-w-full h-48 object-contain rounded-lg border-2 shadow-lg"
                                />
                                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                  <Check className="h-3 w-3" />
                                  Uploaded
                                </div>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1 font-medium">
                            <AlertCircle className="h-3 w-3" />
                            Take a screenshot of your payment confirmation screen
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="reference" className="text-sm font-semibold text-muted-foreground">
                            Payment Reference / Transaction ID (Optional)
                          </Label>
                          <Input
                            id="reference"
                            placeholder="Enter transaction ID if available"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="mt-2 h-11 text-base"
                          />
                          <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Optional - helps with faster verification
                          </p>
                        </div>

                        {error && (
                          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                              {error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="sticky bottom-0 bg-gradient-to-t from-background to-muted/30 border-t-2 p-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Admin will validate within 24 hours
                      </p>
                      <div className="flex gap-3 w-full sm:w-auto">
                        <Button 
                          variant="outline" 
                          onClick={onClose}
                          className="flex-1 sm:flex-none h-11"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleSubmitPayment}
                          disabled={submitting || !screenshotFile}
                          className="flex-1 sm:flex-none h-11 min-w-[150px] bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Submitting...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-5 w-5" />
                              Submit Payment
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Confirmation Step */}
                  <div className="p-12 text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6"
                    >
                      <Check className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">Payment Submitted!</h3>
                    <p className="text-muted-foreground mb-6">
                      Your payment has been submitted successfully. Our admin will
                      validate it within 24 hours.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      You'll receive a notification once your AI features are activated.
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


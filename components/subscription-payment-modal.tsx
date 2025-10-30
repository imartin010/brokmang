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
    }
  };

  const handleSubmitPayment = async () => {
    if (!paymentReference.trim()) {
      setError("Please enter your payment reference/transaction ID");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      // In production, upload screenshot to Supabase Storage if provided
      let uploadedScreenshotUrl = "";
      if (screenshotFile) {
        // TODO: Upload to Supabase Storage
        // For now, we'll skip file upload and just store the reference
        uploadedScreenshotUrl = ""; // Replace with actual upload URL
      }

      // Create subscription request
      const response = await fetch("/api/subscription/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          org_id: orgId,
          user_type: userType,
          payment_reference: paymentReference,
          payment_screenshot_url: uploadedScreenshotUrl,
        }),
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-2xl"
        >
          <Card>
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b">
                <div>
                  <h2 className="text-2xl font-bold">Subscribe to AI Features</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {userType === "ceo" ? "CEO Plan" : "Team Leader Plan"} -{" "}
                    <span className="font-semibold text-primary">{amount} EGP/month</span>
                  </p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {step === "payment" ? (
                <>
                  {/* Payment Step */}
                  <div className="p-6 space-y-6">
                    {/* InstaPay Link */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
                          1
                        </span>
                        Pay via InstaPay
                      </h3>
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
                        <p className="text-sm mb-3">
                          Click the button below to open InstaPay and send{" "}
                          <span className="font-bold text-lg">{amount} EGP</span> to:
                        </p>
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-md mb-3 font-mono text-center text-lg font-semibold">
                          imartin@instapay
                        </div>
                        <Button
                          className="w-full gradient-bg"
                          onClick={() => window.open(instaPayLink, "_blank")}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open InstaPay
                        </Button>
                      </div>
                    </div>

                    {/* OR Divider */}
                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-2 bg-background text-muted-foreground">
                          OR
                        </span>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <QrCode className="h-5 w-5" />
                        Scan QR Code
                      </h3>
                      <div className="flex justify-center bg-white dark:bg-gray-900 p-6 rounded-lg border">
                        <Image
                          src="/IMG_30FF121DDFA3-1.jpeg"
                          alt="InstaPay QR Code"
                          width={200}
                          height={200}
                          className="rounded-lg"
                        />
                      </div>
                      <p className="text-xs text-center text-muted-foreground mt-2">
                        Scan with your banking app to pay {amount} EGP
                      </p>
                    </div>

                    {/* Payment Confirmation Form */}
                    <div className="border-t pt-6">
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center text-sm">
                          2
                        </span>
                        Confirm Payment
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="reference">
                            Payment Reference / Transaction ID *
                          </Label>
                          <Input
                            id="reference"
                            placeholder="Enter transaction ID or reference number"
                            value={paymentReference}
                            onChange={(e) => setPaymentReference(e.target.value)}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            This helps us verify your payment
                          </p>
                        </div>

                        <div>
                          <Label htmlFor="screenshot">
                            Payment Screenshot (Optional)
                          </Label>
                          <div className="mt-1">
                            <Input
                              id="screenshot"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="cursor-pointer"
                            />
                          </div>
                          {screenshotUrl && (
                            <div className="mt-2">
                              <img
                                src={screenshotUrl}
                                alt="Payment screenshot"
                                className="max-w-full h-32 object-contain rounded border"
                              />
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload a screenshot of your payment for faster validation
                          </p>
                        </div>

                        {error && (
                          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-red-800 dark:text-red-200">
                              {error}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between p-6 border-t bg-muted/50">
                    <p className="text-sm text-muted-foreground">
                      Admin will validate your payment within 24 hours
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSubmitPayment}
                        disabled={submitting || !paymentReference.trim()}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Submit Payment
                          </>
                        )}
                      </Button>
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


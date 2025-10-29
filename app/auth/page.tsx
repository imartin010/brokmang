"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, UserPlus, KeyRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signUp, signIn, resetPassword } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error">("error");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isForgotPassword) {
        // Handle password reset
        const result = await resetPassword(email);
        setMessage(result.message);
        setMessageType(result.success ? "success" : "error");
        
        if (result.success) {
          setTimeout(() => {
            setIsForgotPassword(false);
            setEmail("");
          }, 3000);
        }
      } else if (isSignUp) {
        // Handle sign up
        const result = await signUp(email, password);
        setMessage(result.message);
        setMessageType(result.success ? "success" : "error");
        
        if (result.success && result.user) {
          // Check if email confirmation is required
          if (result.message.includes("email")) {
            // Wait for email confirmation
          } else {
            // Auto sign-in successful
            setTimeout(() => router.push("/"), 1500);
          }
        }
      } else {
        // Handle sign in
        const result = await signIn(email, password);
        setMessage(result.message);
        setMessageType(result.success ? "success" : "error");
        
        if (result.success) {
          setTimeout(() => router.push("/"), 1000);
        }
      }
    } catch (error: any) {
      setMessage(error.message || "An unexpected error occurred");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="glass">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              {isForgotPassword
                ? "Reset Password"
                : isSignUp
                ? "Create an Account"
                : "Welcome Back"}
            </CardTitle>
            <CardDescription className="text-center">
              {isForgotPassword
                ? "Enter your email to receive a password reset link"
                : isSignUp
                ? "Sign up to save and manage your scenarios"
                : "Sign in to access your saved scenarios"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {!isForgotPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      required
                      minLength={6}
                    />
                  </div>
                  {!isSignUp && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setMessage("");
                        }}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}
                </div>
              )}

              {message && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    messageType === "success"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-red-500/10 text-red-500"
                  }`}
                >
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full gradient-bg"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {isForgotPassword
                      ? "Sending..."
                      : isSignUp
                      ? "Signing up..."
                      : "Signing in..."}
                  </>
                ) : (
                  <>
                    {isForgotPassword ? (
                      <>
                        <KeyRound className="mr-2 h-4 w-4" />
                        Send Reset Link
                      </>
                    ) : isSignUp ? (
                      <>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Sign Up
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Sign In
                      </>
                    )}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center space-y-2">
              {isForgotPassword ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setMessage("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Back to sign in
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setMessage("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  {isSignUp
                    ? "Already have an account? Sign in"
                    : "Don't have an account? Sign up"}
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}


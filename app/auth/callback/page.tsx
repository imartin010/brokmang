"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-browser";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthCallback() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirming your email...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get the hash from the URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get("access_token");
        const refreshToken = hashParams.get("refresh_token");
        const type = hashParams.get("type");

        if (type === "signup" && accessToken && refreshToken) {
          // Set the session
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            setMessage("Error confirming email. Please try again.");
            setTimeout(() => router.push("/auth"), 3000);
            return;
          }

          // Check if user has selected account type
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: agent } = await supabase
              .from("sales_agents")
              .select("user_type")
              .eq("user_id", user.id)
              .single();

            if (!agent?.user_type) {
              // User hasn't selected type yet, redirect to selection page
              setMessage("Email confirmed! Setting up your account...");
              setTimeout(() => router.push("/select-role"), 2000);
              return;
            }
          }

          setMessage("Email confirmed! Redirecting...");
          setTimeout(() => router.push("/dashboard"), 2000);
        } else {
          setMessage("Invalid confirmation link.");
          setTimeout(() => router.push("/auth"), 3000);
        }
      } catch (error) {
        setMessage("An error occurred. Redirecting...");
        setTimeout(() => router.push("/auth"), 3000);
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8 min-h-screen flex items-center justify-center">
      <Card className="glass max-w-md w-full">
        <CardContent className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg font-medium">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}


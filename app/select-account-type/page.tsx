/**
 * Select Account Type Page
 * Shown after signup/login if user hasn't selected their type yet
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserTypeSelector } from "@/components/user-type-selector";
import { supabase } from "@/lib/supabase-browser";
import type { UserAccountType } from "@/lib/types";

export default function SelectAccountTypePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkExistingType();
  }, []);

  const checkExistingType = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/auth");
        return;
      }

      // Check if user already has a type set
      const { data: agent } = await supabase
        .from("sales_agents")
        .select("user_type")
        .eq("user_id", user.id)
        .single();

      if (agent?.user_type) {
        // User already has a type, redirect to dashboard
        router.push("/dashboard");
      } else {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error checking user type:", error);
      setLoading(false);
    }
  };

  const handleSelectType = async (type: UserAccountType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Save user type via API
      const response = await fetch("/api/user/set-type", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          user_type: type,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to set user type");
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error setting user type:", error);
      alert("Failed to set account type. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return <UserTypeSelector onSelect={handleSelectType} />;
}


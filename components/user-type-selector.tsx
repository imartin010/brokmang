/**
 * User Type Selector Component
 * Shown after signup to determine if user is CEO or Team Leader
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Users, ArrowRight, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { UserAccountType } from "@/lib/types";

interface UserTypeSelectorProps {
  onSelect: (type: UserAccountType) => Promise<void>;
  loading?: boolean;
}

export function UserTypeSelector({ onSelect, loading = false }: UserTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<UserAccountType | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const userTypes = [
    {
      type: "ceo" as UserAccountType,
      title: "CEO / Business Owner",
      description: "Full access to all features including financial tools, break-even analysis, and complete sales management",
      icon: Crown,
      gradient: "from-purple-500 to-pink-600",
      features: [
        "Break-Even Analysis",
        "Financial Reports & Planning",
        "Sales Performance & KPIs",
        "AI Smart Insights",
        "Admin Settings",
        "Team Management",
      ],
    },
    {
      type: "team_leader" as UserAccountType,
      title: "Team Leader / Sales Manager",
      description: "Access to sales performance and KPI tools to manage your team effectively",
      icon: Users,
      gradient: "from-blue-500 to-cyan-600",
      features: [
        "Sales Performance Tracking",
        "KPI Monitoring & Scores",
        "Agent Daily Logs",
        "AI Smart Insights",
        "Team Performance Reports",
        "Agent Management",
      ],
    },
  ];

  const handleSubmit = async () => {
    if (!selectedType) return;

    setSubmitting(true);
    try {
      await onSelect(selectedType);
    } catch (error) {
      console.error("Error setting user type:", error);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-accent/10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold mb-3"
          >
            Welcome to Brokmang. 👋
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Let's personalize your experience. What best describes your role?
          </motion.p>
        </div>

        {/* Type Selection Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {userTypes.map((userType, index) => {
            const Icon = userType.icon;
            const isSelected = selectedType === userType.type;

            return (
              <motion.div
                key={userType.type}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-300 hover:shadow-xl",
                    isSelected
                      ? "ring-4 ring-primary shadow-xl scale-105"
                      : "hover:scale-102"
                  )}
                  onClick={() => setSelectedType(userType.type)}
                >
                  <CardContent className="p-6">
                    {/* Icon & Title */}
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0",
                          userType.gradient
                        )}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-1">
                          {userType.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {userType.description}
                        </p>
                      </div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"
                        >
                          <ArrowRight className="h-4 w-4 text-primary-foreground" />
                        </motion.div>
                      )}
                    </div>

                    {/* Features List */}
                    <div className="space-y-2 pl-20">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        What You'll Get:
                      </p>
                      <ul className="space-y-1.5">
                        {userType.features.map((feature, i) => (
                          <li
                            key={i}
                            className="text-sm flex items-start gap-2"
                          >
                            <span className={cn(
                              "mt-0.5 font-bold",
                              isSelected ? "text-primary" : "text-muted-foreground"
                            )}>
                              ✓
                            </span>
                            <span className={cn(
                              isSelected ? "font-medium" : "text-muted-foreground"
                            )}>
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedType || submitting || loading}
            className="px-8 py-6 text-lg gradient-bg"
          >
            {submitting || loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Setting up your account...
              </>
            ) : (
              <>
                Continue to Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground mt-4">
            Don't worry, you can change this later in your profile settings
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}


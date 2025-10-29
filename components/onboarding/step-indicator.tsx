/**
 * Step Indicator - Progress bar for onboarding wizard
 * Brokmang. v1.1
 */

"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type WizardStep = {
  id: string;
  label: string;
  description: string;
};

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStepId: string;
  completedStepIds: string[];
}

export function StepIndicator({ steps, currentStepId, completedStepIds }: StepIndicatorProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-10" />
        <motion.div
          className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 -z-10"
          initial={{ width: 0 }}
          animate={{
            width: `${(currentIndex / (steps.length - 1)) * 100}%`,
          }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = completedStepIds.includes(step.id);
          const isCurrent = step.id === currentStepId;
          const isUpcoming = index > currentIndex;
          
          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              {/* Circle */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: isCurrent ? 1.1 : 1 }}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-background z-10",
                  isCompleted && "border-green-500 bg-green-50 dark:bg-green-900/20",
                  isCurrent && "border-blue-600 bg-blue-50 dark:bg-blue-900/20",
                  isUpcoming && "border-gray-300 dark:border-gray-600"
                )}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Circle className={cn(
                    "h-5 w-5",
                    isCurrent && "text-blue-600 fill-blue-600",
                    isUpcoming && "text-gray-400"
                  )} />
                )}
              </motion.div>
              
              {/* Label */}
              <div className="mt-2 text-center max-w-[120px]">
                <p className={cn(
                  "text-sm font-medium",
                  isCurrent && "text-blue-600 dark:text-blue-400",
                  isCompleted && "text-green-600 dark:text-green-400",
                  isUpcoming && "text-muted-foreground"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


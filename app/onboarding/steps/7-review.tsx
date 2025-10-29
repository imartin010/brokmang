/**
 * Onboarding Step 7: Review & Confirm
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Loader2, Building2, MapPin, Users, UserCircle, Target, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/zustand/store";

interface ReviewStepProps {
  onPrevious: () => void;
  onSubmit: () => Promise<void>;
}

export function ReviewStep({ onPrevious, onSubmit }: ReviewStepProps) {
  const { data } = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  
  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Onboarding submission failed:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Review & Confirm</CardTitle>
              <p className="text-muted-foreground mt-1">
                Double-check everything before we create your organization
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Organization */}
          <div className="p-4 rounded-lg border bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Organization</h3>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{data.organization?.name}</p>
              </div>
              <div>
                <span className="text-muted-foreground">URL:</span>
                <p className="font-medium">brokmang.com/{data.organization?.slug}</p>
              </div>
            </div>
          </div>
          
          {/* Branches */}
          <div className="p-4 rounded-lg border bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Branches ({data.branches?.length || 0})</h3>
            </div>
            <div className="space-y-2">
              {data.branches?.map((branch, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{branch.name}</span>
                  {branch.address && (
                    <span className="text-muted-foreground"> - {branch.address}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Teams */}
          <div className="p-4 rounded-lg border bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold">Teams ({data.teams?.length || 0})</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.teams?.map((team, i) => (
                <div key={i} className="text-sm font-medium">
                  • {team.name}
                </div>
              ))}
            </div>
          </div>
          
          {/* Agents */}
          <div className="p-4 rounded-lg border bg-accent/50">
            <div className="flex items-center gap-2 mb-3">
              <UserCircle className="h-5 w-5 text-orange-600" />
              <h3 className="font-semibold">Agents ({data.agents?.length || 0})</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {data.agents?.map((agent, i) => (
                <div key={i} className="text-sm">
                  <span className="font-medium">{agent.full_name}</span>
                  <span className="text-muted-foreground text-xs ml-2">
                    ({agent.role === 'team_leader' ? 'Team Leader' : 'Agent'})
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* KPI Settings */}
          {data.kpiSettings && (
            <div className="p-4 rounded-lg border bg-accent/50">
              <div className="flex items-center gap-2 mb-3">
                <Target className="h-5 w-5 text-cyan-600" />
                <h3 className="font-semibold">KPI Targets</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Calls/Day:</span>
                  <span className="font-medium ml-2">{data.kpiSettings.target_calls_per_day}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Meetings/Day:</span>
                  <span className="font-medium ml-2">{data.kpiSettings.target_meetings_per_day}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Sales Target/Month:</span>
                  <span className="font-medium ml-2">{data.kpiSettings.target_sales_per_month?.toLocaleString()} EGP</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Finance Settings */}
          {data.financeSettings && (
            <div className="p-4 rounded-lg border bg-accent/50">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Financial Configuration</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Rent/Seat:</span>
                  <span className="font-medium ml-2">{data.financeSettings.rent_per_seat} EGP</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Salary/Seat:</span>
                  <span className="font-medium ml-2">{data.financeSettings.salary_per_seat} EGP</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Warning */}
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Ready to Launch! 🚀
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Clicking "Create Organization" will set up your complete workspace with all the data you've entered.
              You can always modify settings later.
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={submitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button
              type="button"
              onClick={handleSubmit}
              className="gradient-bg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Organization...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Create Organization
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


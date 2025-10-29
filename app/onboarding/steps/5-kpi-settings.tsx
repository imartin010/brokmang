/**
 * Onboarding Step 5: KPI Settings
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Target, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/zustand/store";

interface KpiSettingsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function KpiSettingsStep({ onNext, onPrevious }: KpiSettingsStepProps) {
  const { data, updateData } = useOnboarding();
  
  const [formData, setFormData] = useState({
    workday_start: data.kpiSettings?.workday_start || "09:30",
    workday_end: data.kpiSettings?.workday_end || "18:30",
    target_calls_per_day: data.kpiSettings?.target_calls_per_day || 120,
    target_meetings_per_day: data.kpiSettings?.target_meetings_per_day || 2,
    target_sales_per_month: data.kpiSettings?.target_sales_per_month || 2000000,
    weight_attendance: data.kpiSettings?.weight_attendance || 25,
    weight_calls: data.kpiSettings?.weight_calls || 25,
    weight_behavior: data.kpiSettings?.weight_behavior || 20,
    weight_meetings: data.kpiSettings?.weight_meetings || 15,
    weight_sales: data.kpiSettings?.weight_sales || 15,
  });
  
  const totalWeight = 
    formData.weight_attendance +
    formData.weight_calls +
    formData.weight_behavior +
    formData.weight_meetings +
    formData.weight_sales;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (totalWeight !== 100) {
      alert("KPI weights must sum to exactly 100%");
      return;
    }
    
    updateData({ kpiSettings: formData });
    onNext();
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Configure KPI Targets</CardTitle>
              <p className="text-muted-foreground mt-1">
                Set performance targets and scoring weights
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Work Hours */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="workday_start">Workday Start</Label>
                <Input
                  id="workday_start"
                  type="time"
                  value={formData.workday_start}
                  onChange={(e) => setFormData({...formData, workday_start: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="workday_end">Workday End</Label>
                <Input
                  id="workday_end"
                  type="time"
                  value={formData.workday_end}
                  onChange={(e) => setFormData({...formData, workday_end: e.target.value})}
                />
              </div>
            </div>
            
            {/* Targets */}
            <div className="space-y-4">
              <h3 className="font-semibold">Daily Targets</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="target_calls">Calls per Day</Label>
                  <Input
                    id="target_calls"
                    type="number"
                    min="1"
                    value={formData.target_calls_per_day}
                    onChange={(e) => setFormData({...formData, target_calls_per_day: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="target_meetings">Meetings per Day</Label>
                  <Input
                    id="target_meetings"
                    type="number"
                    min="1"
                    value={formData.target_meetings_per_day}
                    onChange={(e) => setFormData({...formData, target_meetings_per_day: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="target_sales">Monthly Sales Target (EGP)</Label>
                <Input
                  id="target_sales"
                  type="number"
                  min="1"
                  value={formData.target_sales_per_month}
                  onChange={(e) => setFormData({...formData, target_sales_per_month: parseInt(e.target.value)})}
                />
              </div>
            </div>
            
            {/* Weights */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Scoring Weights (%)</h3>
                <div className={`text-sm font-semibold px-3 py-1 rounded ${
                  totalWeight === 100 
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  Total: {totalWeight}%
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight_attendance">Attendance Weight</Label>
                  <Input
                    id="weight_attendance"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.weight_attendance}
                    onChange={(e) => setFormData({...formData, weight_attendance: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="weight_calls">Calls Weight</Label>
                  <Input
                    id="weight_calls"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.weight_calls}
                    onChange={(e) => setFormData({...formData, weight_calls: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="weight_behavior">Behavior Weight</Label>
                  <Input
                    id="weight_behavior"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.weight_behavior}
                    onChange={(e) => setFormData({...formData, weight_behavior: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="weight_meetings">Meetings Weight</Label>
                  <Input
                    id="weight_meetings"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.weight_meetings}
                    onChange={(e) => setFormData({...formData, weight_meetings: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="weight_sales">Sales Weight</Label>
                  <Input
                    id="weight_sales"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.weight_sales}
                    onChange={(e) => setFormData({...formData, weight_sales: parseInt(e.target.value)})}
                  />
                </div>
              </div>
              
              {totalWeight !== 100 && (
                <p className="text-sm text-red-500">
                  ⚠️ Weights must sum to exactly 100%
                </p>
              )}
            </div>
            
            <div className="flex justify-between gap-3">
              <Button type="button" variant="outline" onClick={onPrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button type="submit" className="gradient-bg" disabled={totalWeight !== 100}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}


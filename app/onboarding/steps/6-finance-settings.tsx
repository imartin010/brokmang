/**
 * Onboarding Step 6: Finance Settings
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/zustand/store";

interface FinanceSettingsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function FinanceSettingsStep({ onNext, onPrevious }: FinanceSettingsStepProps) {
  const { data, updateData } = useOnboarding();
  
  const [formData, setFormData] = useState({
    rent_per_seat: data.financeSettings?.rent_per_seat || 4500,
    salary_per_seat: data.financeSettings?.salary_per_seat || 8000,
    marketing_per_seat: data.financeSettings?.marketing_per_seat || 13000,
    tl_share_per_seat: data.financeSettings?.tl_share_per_seat || 3000,
    others_per_seat: data.financeSettings?.others_per_seat || 1200,
    sim_per_seat: data.financeSettings?.sim_per_seat || 750,
    owner_salary: data.financeSettings?.owner_salary || 200000,
    gross_rate: data.financeSettings?.gross_rate || 0.04,
    agent_comm_per_1m: data.financeSettings?.agent_comm_per_1m || 5000,
    tl_comm_per_1m: data.financeSettings?.tl_comm_per_1m || 2500,
  });
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateData({ financeSettings: formData });
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Financial Configuration</CardTitle>
              <p className="text-muted-foreground mt-1">
                Set up costs and commission rates for break-even analysis
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Per-Seat Costs */}
            <div className="space-y-4">
              <h3 className="font-semibold">Monthly Cost Per Seat (EGP)</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rent">Rent</Label>
                  <Input
                    id="rent"
                    type="number"
                    min="0"
                    value={formData.rent_per_seat}
                    onChange={(e) => setFormData({...formData, rent_per_seat: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="salary">Salary</Label>
                  <Input
                    id="salary"
                    type="number"
                    min="0"
                    value={formData.salary_per_seat}
                    onChange={(e) => setFormData({...formData, salary_per_seat: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="marketing">Marketing</Label>
                  <Input
                    id="marketing"
                    type="number"
                    min="0"
                    value={formData.marketing_per_seat}
                    onChange={(e) => setFormData({...formData, marketing_per_seat: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="tl_share">TL Share</Label>
                  <Input
                    id="tl_share"
                    type="number"
                    min="0"
                    value={formData.tl_share_per_seat}
                    onChange={(e) => setFormData({...formData, tl_share_per_seat: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="others">Others</Label>
                  <Input
                    id="others"
                    type="number"
                    min="0"
                    value={formData.others_per_seat}
                    onChange={(e) => setFormData({...formData, others_per_seat: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="sim">SIM Card</Label>
                  <Input
                    id="sim"
                    type="number"
                    min="0"
                    value={formData.sim_per_seat}
                    onChange={(e) => setFormData({...formData, sim_per_seat: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            
            {/* Owner Salary */}
            <div>
              <Label htmlFor="owner_salary">Franchise Owner Monthly Salary (EGP)</Label>
              <Input
                id="owner_salary"
                type="number"
                min="0"
                value={formData.owner_salary}
                onChange={(e) => setFormData({...formData, owner_salary: parseFloat(e.target.value)})}
              />
            </div>
            
            {/* Revenue Rates */}
            <div className="space-y-4">
              <h3 className="font-semibold">Revenue & Commission Rates</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="gross_rate">Gross Rate (%)</Label>
                  <Input
                    id="gross_rate"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formData.gross_rate * 100}
                    onChange={(e) => setFormData({...formData, gross_rate: parseFloat(e.target.value) / 100})}
                  />
                </div>
                <div>
                  <Label htmlFor="agent_comm">Agent Comm/1M (EGP)</Label>
                  <Input
                    id="agent_comm"
                    type="number"
                    min="0"
                    value={formData.agent_comm_per_1m}
                    onChange={(e) => setFormData({...formData, agent_comm_per_1m: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label htmlFor="tl_comm">TL Comm/1M (EGP)</Label>
                  <Input
                    id="tl_comm"
                    type="number"
                    min="0"
                    value={formData.tl_comm_per_1m}
                    onChange={(e) => setFormData({...formData, tl_comm_per_1m: parseFloat(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            
            {/* Info */}
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="text-muted-foreground">
                💡 These defaults are based on typical real estate brokerages. You can adjust them anytime in Settings.
              </p>
            </div>
            
            <div className="flex justify-between gap-3">
              <Button type="button" variant="outline" onClick={onPrevious}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button type="submit" className="gradient-bg">
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


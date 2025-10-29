/**
 * Onboarding Step 2: Branches Setup
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/lib/zustand/store";

interface BranchesStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function BranchesStep({ onNext, onPrevious }: BranchesStepProps) {
  const { data, updateData } = useOnboarding();
  
  const [branches, setBranches] = useState(
    data.branches && data.branches.length > 0
      ? data.branches
      : [{ id: crypto.randomUUID(), name: "", address: "" }]
  );
  
  const addBranch = () => {
    setBranches([...branches, { id: crypto.randomUUID(), name: "", address: "" }]);
  };
  
  const removeBranch = (id: string) => {
    if (branches.length > 1) {
      setBranches(branches.filter(b => b.id !== id));
    }
  };
  
  const updateBranch = (id: string, field: 'name' | 'address', value: string) => {
    setBranches(branches.map(b =>
      b.id === id ? { ...b, [field]: value } : b
    ));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate at least one branch with name
    const validBranches = branches.filter(b => b.name.trim().length >= 2);
    
    if (validBranches.length === 0) {
      alert("Please add at least one branch with a name");
      return;
    }
    
    updateData({ branches: validBranches });
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
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Add Your Office Branches</CardTitle>
              <p className="text-muted-foreground mt-1">
                Where are your physical office locations?
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Branches List */}
            <div className="space-y-4">
              {branches.map((branch, index) => (
                <motion.div
                  key={branch.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border bg-accent/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor={`branch-name-${branch.id}`}>
                          Branch Name *
                        </Label>
                        <Input
                          id={`branch-name-${branch.id}`}
                          value={branch.name}
                          onChange={(e) => updateBranch(branch.id!, 'name', e.target.value)}
                          placeholder="e.g., Downtown Office"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`branch-address-${branch.id}`}>
                          Address (Optional)
                        </Label>
                        <Input
                          id={`branch-address-${branch.id}`}
                          value={branch.address}
                          onChange={(e) => updateBranch(branch.id!, 'address', e.target.value)}
                          placeholder="123 Main St, Cairo, Egypt"
                        />
                      </div>
                    </div>
                    
                    {branches.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeBranch(branch.id!)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Add Branch Button */}
            <Button
              type="button"
              variant="outline"
              onClick={addBranch}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Branch
            </Button>
            
            {/* Info */}
            <div className="p-3 rounded-lg bg-muted text-sm">
              <p className="text-muted-foreground">
                💡 You can add more branches later from Settings
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onPrevious}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              
              <Button
                type="submit"
                className="gradient-bg"
              >
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


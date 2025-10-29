/**
 * Onboarding Step 3: Teams Setup
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Trash2, ArrowRight, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/lib/zustand/store";

interface TeamsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function TeamsStep({ onNext, onPrevious }: TeamsStepProps) {
  const { data, updateData } = useOnboarding();
  
  const [teams, setTeams] = useState(
    data.teams && data.teams.length > 0
      ? data.teams
      : [{ id: crypto.randomUUID(), name: "", branch_id: data.branches?.[0]?.id || "" }]
  );
  
  const addTeam = () => {
    setTeams([
      ...teams,
      { id: crypto.randomUUID(), name: "", branch_id: data.branches?.[0]?.id || "" }
    ]);
  };
  
  const removeTeam = (id: string) => {
    if (teams.length > 1) {
      setTeams(teams.filter(t => t.id !== id));
    }
  };
  
  const updateTeam = (id: string, field: 'name' | 'branch_id', value: string) => {
    setTeams(teams.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validTeams = teams.filter(t => t.name.trim().length >= 2);
    
    if (validTeams.length === 0) {
      alert("Please add at least one team");
      return;
    }
    
    updateData({ teams: validTeams });
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Create Sales Teams</CardTitle>
              <p className="text-muted-foreground mt-1">
                Organize your agents into teams
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              {teams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg border bg-accent/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <div>
                        <Label htmlFor={`team-name-${team.id}`}>
                          Team Name *
                        </Label>
                        <Input
                          id={`team-name-${team.id}`}
                          value={team.name}
                          onChange={(e) => updateTeam(team.id!, 'name', e.target.value)}
                          placeholder="e.g., Sales Team Alpha"
                        />
                      </div>
                      
                      {data.branches && data.branches.length > 1 && (
                        <div>
                          <Label htmlFor={`team-branch-${team.id}`}>
                            Assign to Branch
                          </Label>
                          <Select
                            value={team.branch_id}
                            onValueChange={(value) => updateTeam(team.id!, 'branch_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select branch" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.branches.map(branch => (
                                <SelectItem key={branch.id} value={branch.id!}>
                                  {branch.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    {teams.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeam(team.id!)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={addTeam}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Team
            </Button>
            
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


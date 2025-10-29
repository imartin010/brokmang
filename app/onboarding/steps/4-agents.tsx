/**
 * Onboarding Step 4: Agents Setup
 * Brokmang. v1.1
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserCircle, Plus, Trash2, ArrowRight, ArrowLeft, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOnboarding } from "@/lib/zustand/store";

interface AgentsStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

export function AgentsStep({ onNext, onPrevious }: AgentsStepProps) {
  const { data, updateData } = useOnboarding();
  
  const [agents, setAgents] = useState(
    data.agents && data.agents.length > 0
      ? data.agents
      : [
          { id: crypto.randomUUID(), full_name: "", phone: "", role: "team_leader" as const, team_id: data.teams?.[0]?.id || "" },
          { id: crypto.randomUUID(), full_name: "", phone: "", role: "agent" as const, team_id: data.teams?.[0]?.id || "" },
        ]
  );
  
  const addAgent = () => {
    setAgents([
      ...agents,
      { id: crypto.randomUUID(), full_name: "", phone: "", role: "agent", team_id: data.teams?.[0]?.id || "" }
    ]);
  };
  
  const removeAgent = (id: string) => {
    if (agents.length > 1) {
      setAgents(agents.filter(a => a.id !== id));
    }
  };
  
  const updateAgent = (id: string, field: string, value: any) => {
    setAgents(agents.map(a =>
      a.id === id ? { ...a, [field]: value } : a
    ));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validAgents = agents.filter(a => a.full_name.trim().length >= 2);
    
    if (validAgents.length === 0) {
      alert("Please add at least one agent");
      return;
    }
    
    // Ensure at least one team leader
    const hasTeamLeader = validAgents.some(a => a.role === "team_leader");
    if (!hasTeamLeader) {
      alert("Please add at least one Team Leader");
      return;
    }
    
    updateData({ agents: validAgents });
    onNext();
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
            <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-600">
              <UserCircle className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl">Add Your Sales Team</CardTitle>
              <p className="text-muted-foreground mt-1">
                Add team leaders and agents
              </p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
              {agents.map((agent, index) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 rounded-lg border bg-accent/50"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`agent-name-${agent.id}`}>
                          Full Name *
                        </Label>
                        <Input
                          id={`agent-name-${agent.id}`}
                          value={agent.full_name}
                          onChange={(e) => updateAgent(agent.id!, 'full_name', e.target.value)}
                          placeholder="John Doe"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`agent-phone-${agent.id}`}>
                          Phone (Optional)
                        </Label>
                        <Input
                          id={`agent-phone-${agent.id}`}
                          value={agent.phone}
                          onChange={(e) => updateAgent(agent.id!, 'phone', e.target.value)}
                          placeholder="+20 123 456 7890"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`agent-role-${agent.id}`}>
                          Role *
                        </Label>
                        <Select
                          value={agent.role}
                          onValueChange={(value) => updateAgent(agent.id!, 'role', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="team_leader">
                              <div className="flex items-center gap-2">
                                <Crown className="h-4 w-4 text-amber-500" />
                                Team Leader
                              </div>
                            </SelectItem>
                            <SelectItem value="agent">
                              <div className="flex items-center gap-2">
                                <UserCircle className="h-4 w-4 text-blue-500" />
                                Agent
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {data.teams && data.teams.length > 0 && (
                        <div>
                          <Label htmlFor={`agent-team-${agent.id}`}>
                            Assign to Team
                          </Label>
                          <Select
                            value={agent.team_id}
                            onValueChange={(value) => updateAgent(agent.id!, 'team_id', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                              {data.teams.map(team => (
                                <SelectItem key={team.id} value={team.id!}>
                                  {team.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    
                    {agents.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeAgent(agent.id!)}
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
              onClick={addAgent}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Agent
            </Button>
            
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Make sure to add at least one <strong>Team Leader</strong>
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


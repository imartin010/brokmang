"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Loader2, Users, Sparkles, Search, Filter, Crown, UserCircle } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { AgentFormDialog } from "@/components/crm/agent-form-dialog";
import { TeamCard } from "@/components/crm/team-card";
import type { SalesAgent, MonthlyScore } from "@/lib/types";

export default function SalesAgentsPage() {
  const [agents, setAgents] = useState<SalesAgent[]>([]);
  const [scores, setScores] = useState<MonthlyScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<SalesAgent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterActive, setFilterActive] = useState<"all" | "active" | "inactive">("all");

  useEffect(() => {
    loadAgents();
    loadScores();
  }, []);

  const loadAgents = async () => {
    try {
      const { data, error } = await supabase
        .from("sales_agents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error("Error loading agents:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadScores = async () => {
    try {
      // Get current month's scores
      const now = new Date();
      const { data, error } = await supabase
        .from("agent_monthly_scores")
        .select("*")
        .eq("year", now.getFullYear())
        .eq("month", now.getMonth() + 1);

      if (error) throw error;
      setScores(data || []);
    } catch (error) {
      console.error("Error loading scores:", error);
    }
  };

  const handleSaveAgent = async (agentData: Partial<SalesAgent>) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      if (selectedAgent) {
        // Update existing agent
        const { error } = await supabase
          .from("sales_agents")
          .update(agentData)
          .eq("id", selectedAgent.id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Create new agent
        const { error } = await supabase
          .from("sales_agents")
          .insert([{ ...agentData, user_id: user.id }]);

        if (error) throw error;
      }

      await loadAgents();
      setSelectedAgent(null);
    } catch (error) {
      console.error("Error saving agent:", error);
      throw error;
    }
  };

  const handleEditAgent = (agent: SalesAgent) => {
    setSelectedAgent(agent);
    setDialogOpen(true);
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("sales_agents")
        .delete()
        .eq("id", agentId)
        .eq("user_id", user.id);

      if (error) throw error;
      await loadAgents();
    } catch (error) {
      console.error("Error deleting agent:", error);
    }
  };

  const handleAddNew = () => {
    setSelectedAgent(null);
    setDialogOpen(true);
  };

  // Filter and search agents
  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.full_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      agent.phone?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filterActive === "all" ||
      (filterActive === "active" && agent.is_active) ||
      (filterActive === "inactive" && !agent.is_active);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.is_active).length,
    inactive: agents.filter(a => !a.is_active).length,
    teamLeaders: agents.filter(a => a.role === 'team_leader').length,
    regularAgents: agents.filter(a => a.role === 'agent').length,
  };

  // Get all team leaders for the form
  const teamLeaders = agents.filter(a => a.role === 'team_leader' && a.is_active);

  // Group agents by team leader
  const teams = teamLeaders.map(leader => ({
    leader,
    agents: agents.filter(a => a.role === 'agent' && a.team_leader_id === leader.id && a.is_active)
  }));

  // Get agents without team leader
  const unassignedAgents = agents.filter(a => a.role === 'agent' && !a.team_leader_id && a.is_active);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header with gradient */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Sales Team</h1>
              <p className="text-muted-foreground">
                Manage your sales agents and track team performance
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {!loading && agents.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Agents</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <Users className="h-8 w-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <p className="text-3xl font-bold text-green-600">{stats.active}</p>
                    </div>
                    <Sparkles className="h-8 w-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-l-4 border-l-gray-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Inactive</p>
                      <p className="text-3xl font-bold text-gray-600">{stats.inactive}</p>
                    </div>
                    <Users className="h-8 w-8 text-gray-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Search and Filter Bar */}
        {!loading && agents.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or phone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterActive === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterActive("all")}
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    All
                  </Button>
                  <Button
                    variant={filterActive === "active" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterActive("active")}
                  >
                    Active
                  </Button>
                  <Button
                    variant={filterActive === "inactive" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterActive("inactive")}
                  >
                    Inactive
                  </Button>
                </div>
                <Button onClick={handleAddNew} size="sm" className="gradient-bg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Agent
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Content */}
        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading your team...</p>
            </CardContent>
          </Card>
        ) : agents.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-muted mb-4">
                <Users className="h-12 w-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Start building your sales team by adding your first agent. Track their
                performance and help them grow!
              </p>
              <Button onClick={handleAddNew} size="lg" className="gradient-bg">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Agent
              </Button>
            </CardContent>
          </Card>
        ) : teamLeaders.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
                <Crown className="h-12 w-12 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Your First Team Leader</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                Start by adding a team leader to organize your agents into teams.
              </p>
              <Button onClick={handleAddNew} size="lg" className="gradient-bg">
                <Crown className="h-5 w-5 mr-2" />
                Add Team Leader
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Teams Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {teams.map((team) => (
                <TeamCard
                  key={team.leader.id}
                  teamLeader={team.leader}
                  agents={team.agents}
                  scores={scores}
                />
              ))}
            </div>

            {/* Unassigned Agents */}
            {unassignedAgents.length > 0 && (
              <Card className="border-2 border-dashed">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800">
                      <UserCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Unassigned Agents</h3>
                      <p className="text-sm text-muted-foreground">
                        {unassignedAgents.length} agent(s) without a team leader
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {unassignedAgents.map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
                      >
                        <span className="font-medium">{agent.full_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAgent(agent)}
                        >
                          Assign
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Agent Form Dialog */}
        <AgentFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedAgent(null);
          }}
          agent={selectedAgent}
          teamLeaders={teamLeaders}
          onSave={handleSaveAgent}
        />
      </motion.div>
    </div>
  );
}


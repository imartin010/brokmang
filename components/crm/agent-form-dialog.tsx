"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserCircle, Users } from "lucide-react";
import type { SalesAgent } from "@/lib/types";

type AgentFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agent?: SalesAgent | null;
  teamLeaders?: SalesAgent[];
  onSave: (data: Partial<SalesAgent>) => Promise<void>;
};

export function AgentFormDialog({
  open,
  onOpenChange,
  agent,
  teamLeaders = [],
  onSave,
}: AgentFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: agent?.full_name || "",
    phone: agent?.phone || "",
    role: agent?.role || "agent" as "agent" | "team_leader",
    team_leader_id: agent?.team_leader_id || null,
    is_active: agent?.is_active ?? true,
  });

  // Reset form when agent changes
  useEffect(() => {
    setFormData({
      full_name: agent?.full_name || "",
      phone: agent?.phone || "",
      role: agent?.role || "agent",
      team_leader_id: agent?.team_leader_id || null,
      is_active: agent?.is_active ?? true,
    });
  }, [agent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving agent:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <DialogHeader>
            <DialogTitle>
              {agent ? "Edit Agent" : "Add New Agent"}
            </DialogTitle>
            <DialogDescription>
              {agent
                ? "Update agent information"
                : "Add a new sales agent to your team"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="+20 xxx xxx xxxx"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <UserCircle className="h-4 w-4" />
                  Role *
                </Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "agent" | "team_leader") => {
                    setFormData({ 
                      ...formData, 
                      role: value,
                      // Clear team leader if changing to team leader role
                      team_leader_id: value === "team_leader" ? null : formData.team_leader_id
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="team_leader">Team Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.role === "agent" && (
                <div className="grid gap-2">
                  <Label htmlFor="team_leader_id" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Team Leader
                  </Label>
                  <Select
                    value={formData.team_leader_id || "none"}
                    onValueChange={(value) =>
                      setFormData({ ...formData, team_leader_id: value === "none" ? null : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a team leader (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No team leader</SelectItem>
                      {teamLeaders
                        .filter((tl) => tl.id !== agent?.id) // Don't show self
                        .map((tl) => (
                          <SelectItem key={tl.id} value={tl.id}>
                            {tl.full_name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {teamLeaders.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No team leaders available. Create a team leader first.
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) =>
                    setFormData({ ...formData, is_active: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : agent ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { motion } from "framer-motion";
import { Edit, Trash2, UserCheck, UserX, UserCircle, Users, Crown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { SalesAgent } from "@/lib/types";

type AgentsTableProps = {
  agents: SalesAgent[];
  onEdit: (agent: SalesAgent) => void;
  onDelete: (agentId: string) => void;
};

// Helper to get team leader name
function getTeamLeaderName(agentId: string | null | undefined, agents: SalesAgent[]): string {
  if (!agentId) return "—";
  const teamLeader = agents.find(a => a.id === agentId);
  return teamLeader?.full_name || "—";
}

export function AgentsTable({ agents, onEdit, onDelete }: AgentsTableProps) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No agents found. Add your first agent to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Team Leader</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agents.map((agent, index) => (
            <motion.tr
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border-b transition-colors hover:bg-muted/50"
            >
              <TableCell className="font-medium">{agent.full_name}</TableCell>
              <TableCell>{agent.phone || "—"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {agent.role === "team_leader" ? (
                    <>
                      <Crown className="h-4 w-4 text-amber-500" />
                      <span className="font-medium text-amber-600 dark:text-amber-400">
                        Team Leader
                      </span>
                    </>
                  ) : (
                    <>
                      <UserCircle className="h-4 w-4 text-blue-500" />
                      <span className="text-blue-600 dark:text-blue-400">
                        Agent
                      </span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {agent.role === "agent" && agent.team_leader_id ? (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{getTeamLeaderName(agent.team_leader_id, agents)}</span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {agent.is_active ? (
                    <>
                      <UserCheck className="h-4 w-4 text-green-500" />
                      <span className="text-green-600 dark:text-green-400">
                        Active
                      </span>
                    </>
                  ) : (
                    <>
                      <UserX className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-500">Inactive</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(agent)}
                    title="Edit agent"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to delete ${agent.full_name}?`
                        )
                      ) {
                        onDelete(agent.id);
                      }
                    }}
                    title="Delete agent"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


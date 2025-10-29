/**
 * Members Management Tab
 * Brokmang. v1.1
 */

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users as UsersIcon, UserPlus, Trash2, Loader2, Crown, Shield, UserCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase-browser";
import { useAuth } from "@/lib/zustand/store";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/rbac";
import type { Membership } from "@/lib/types";
import { cn } from "@/lib/utils";

interface MembersTabProps {
  orgId: string;
}

type MemberWithUser = Membership & {
  user_email?: string;
};

export function MembersTab({ orgId }: MembersTabProps) {
  const { user, userRole } = useAuth();
  const [members, setMembers] = useState<MemberWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadMembers();
  }, [orgId]);
  
  const loadMembers = async () => {
    try {
      setLoading(true);
      
      // Load memberships
      const { data: memberships, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Fetch user emails (need to do this via RPC or separate query)
      // For now, just show user IDs
      setMembers(memberships || []);
      
    } catch (error) {
      console.error('Failed to load members:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleRemoveMember = async (membershipId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      const { error } = await supabase
        .from('memberships')
        .delete()
        .eq('id', membershipId);
      
      if (error) throw error;
      
      // Reload members
      await loadMembers();
      
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member. Please try again.');
    }
  };
  
  const getRoleIcon = (role: string) => {
    if (role === 'OWNER') return Crown;
    if (role === 'ADMIN') return Shield;
    return UserCircle;
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Organization Members</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage who has access to this organization
              </p>
            </div>
            <Button className="gradient-bg">
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : members.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => {
                    const RoleIcon = getRoleIcon(member.role);
                    const isCurrentUser = member.user_id === user?.id;
                    const isOwner = member.role === 'OWNER';
                    
                    return (
                      <TableRow key={member.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br",
                              getRoleBadgeColor(member.role)
                            )}>
                              <RoleIcon className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="font-medium">
                                {member.user_email || member.user_id.substring(0, 8) + '...'}
                              </p>
                              {isCurrentUser && (
                                <span className="text-xs text-muted-foreground">(You)</span>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={cn(
                            "px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r",
                            getRoleBadgeColor(member.role)
                          )}>
                            {getRoleDisplayName(member.role)}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {!isCurrentUser && !isOwner && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <UsersIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No members yet</p>
            </div>
          )}
          
          {/* Info */}
          <div className="mt-6 p-4 rounded-lg bg-muted">
            <h4 className="font-semibold mb-2">Member Roles</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">OWNER:</span>
                <span className="text-muted-foreground ml-2">Full control</span>
              </div>
              <div>
                <span className="font-medium">ADMIN:</span>
                <span className="text-muted-foreground ml-2">Org management</span>
              </div>
              <div>
                <span className="font-medium">TEAM_LEADER:</span>
                <span className="text-muted-foreground ml-2">Team management</span>
              </div>
              <div>
                <span className="font-medium">ACCOUNTANT:</span>
                <span className="text-muted-foreground ml-2">Finance access</span>
              </div>
              <div>
                <span className="font-medium">AGENT:</span>
                <span className="text-muted-foreground ml-2">Self-service</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


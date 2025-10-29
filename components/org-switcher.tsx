/**
 * Organization Switcher - Navbar dropdown
 * Brokmang. v1.1
 */

"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ChevronDown, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { useAuth, useOrg } from "@/lib/zustand/store";
import { supabase } from "@/lib/supabase-browser";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { OrganizationWithMembership } from "@/lib/types";
import { getRoleBadgeColor, getRoleDisplayName } from "@/lib/rbac";

export function OrgSwitcher() {
  const { user, currentOrgId, currentOrgSlug, userRole, setCurrentOrg } = useAuth();
  const { organizations, setOrganizations, setCurrentOrgData } = useOrg();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (user) {
      loadOrganizations();
    }
  }, [user]);
  
  const loadOrganizations = async () => {
    try {
      setLoading(true);
      
      // Get user's organizations with membership info
      const { data, error } = await supabase
        .rpc('get_user_organizations', { user_uuid: user?.id });
      
      if (error) throw error;
      
      const orgs: OrganizationWithMembership[] = data?.map((row: any) => ({
        id: row.org_id,
        name: row.org_name,
        slug: row.org_slug,
        branding: row.org_branding || {},
        settings: {},
        owner_id: '',
        created_at: row.joined_at,
        updated_at: row.joined_at,
        membership: {
          id: '',
          org_id: row.org_id,
          user_id: user?.id || '',
          role: row.user_role,
          created_at: row.joined_at,
          updated_at: row.joined_at,
        },
      })) || [];
      
      setOrganizations(orgs);
      
      // If no current org but has orgs, set the first one
      if (!currentOrgId && orgs.length > 0) {
        const firstOrg = orgs[0];
        setCurrentOrg(firstOrg.id, firstOrg.slug, firstOrg.membership.role);
        setCurrentOrgData(firstOrg);
      } else if (currentOrgId) {
        // Update current org data
        const current = orgs.find(o => o.id === currentOrgId);
        if (current) {
          setCurrentOrgData(current);
        }
      }
      
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSwitch = (org: OrganizationWithMembership) => {
    setCurrentOrg(org.id, org.slug, org.membership.role);
    setCurrentOrgData(org);
    setOpen(false);
    
    // Reload page to refresh org-scoped data
    window.location.reload();
  };
  
  if (!user || loading) {
    return null;
  }
  
  const currentOrg = organizations.find(o => o.id === currentOrgId);
  
  if (organizations.length === 0) {
    return null;
  }
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setOpen(!open)}
      >
        <Building2 className="h-4 w-4" />
        <span className="hidden md:inline max-w-[150px] truncate">
          {currentOrg?.name || "Select Org"}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 transition-transform",
          open && "rotate-180"
        )} />
      </Button>
      
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full right-0 mt-2 w-80 bg-background border rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="p-3 border-b">
                <p className="text-xs text-muted-foreground uppercase font-semibold">
                  Your Organizations
                </p>
              </div>
              
              <div className="max-h-[400px] overflow-y-auto">
                {organizations.map((org) => {
                  const isActive = org.id === currentOrgId;
                  
                  return (
                    <button
                      key={org.id}
                      onClick={() => !isActive && handleSwitch(org)}
                      className={cn(
                        "w-full p-3 flex items-center gap-3 hover:bg-accent transition-colors text-left",
                        isActive && "bg-accent/50"
                      )}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{org.name}</p>
                          {isActive && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          brokmang.com/{org.slug}
                        </p>
                        <div className="mt-1">
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded-full bg-gradient-to-r text-white",
                            getRoleBadgeColor(org.membership.role)
                          )}>
                            {getRoleDisplayName(org.membership.role)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="p-3 border-t">
                <Link href="/onboarding" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Organization
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}


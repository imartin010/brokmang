/**
 * Organization Settings Page
 * Brokmang. v1.1
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon, Building2, Palette, Shield, Users, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth, useOrg } from "@/lib/zustand/store";
import { supabase } from "@/lib/supabase-browser";
import { hasPermission } from "@/lib/rbac";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GeneralTab } from "@/components/org-settings/general-tab";
import { BrandingTab } from "@/components/org-settings/branding-tab";
import { SecurityTab } from "@/components/org-settings/security-tab";
import { MembersTab } from "@/components/org-settings/members-tab";

type Tab = 'general' | 'branding' | 'security' | 'members';

export default function OrgSettingsPage() {
  const { user, currentOrgId, userRole } = useAuth();
  const { currentOrg, setCurrentOrgData } = useOrg();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (currentOrgId) {
      loadOrgData();
    }
  }, [currentOrgId]);
  
  const loadOrgData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', currentOrgId)
        .single();
      
      if (error) throw error;
      
      setCurrentOrgData(data);
    } catch (error) {
      console.error('Failed to load org data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (!user || !currentOrgId) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-16 text-center">
            <p className="text-muted-foreground">Please select an organization first</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="flex items-center justify-center p-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const tabs: { id: Tab; label: string; icon: any; permission?: string }[] = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'branding', label: 'Branding', icon: Palette, permission: 'org:manage_branding' },
    { id: 'security', label: 'Security', icon: Shield, permission: 'org:update' },
    { id: 'members', label: 'Members', icon: Users, permission: 'org:manage_members' },
  ];
  
  // Filter tabs based on permissions
  const availableTabs = tabs.filter(tab => 
    !tab.permission || (userRole && hasPermission(userRole, tab.permission as any))
  );
  
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            <SettingsIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Organization Settings</h1>
            <p className="text-muted-foreground mt-1">
              {currentOrg?.name || 'Manage your organization'}
            </p>
          </div>
        </div>
      </motion.div>
      
      {/* Tabs */}
      <div className="mb-6 border-b">
        <div className="flex gap-2">
          {availableTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                className={cn(
                  "rounded-b-none",
                  activeTab === tab.id && "border-b-2 border-primary"
                )}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>
      
      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'general' && (
          <GeneralTab key="general" org={currentOrg!} onUpdate={setCurrentOrgData} />
        )}
        {activeTab === 'branding' && (
          <BrandingTab key="branding" org={currentOrg!} onUpdate={setCurrentOrgData} />
        )}
        {activeTab === 'security' && (
          <SecurityTab key="security" org={currentOrg!} onUpdate={setCurrentOrgData} />
        )}
        {activeTab === 'members' && (
          <MembersTab key="members" orgId={currentOrgId!} />
        )}
      </AnimatePresence>
    </div>
  );
}


/**
 * Onboarding Wizard - Main Container
 * Brokmang. v1.1
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase-browser";
import { useOnboarding, useAuth, useOrg } from "@/lib/zustand/store";
import { StepIndicator, type WizardStep } from "@/components/onboarding/step-indicator";
import { OrganizationStep } from "./steps/1-organization";
import { BranchesStep } from "./steps/2-branches";
import { TeamsStep } from "./steps/3-teams";
import { AgentsStep } from "./steps/4-agents";
import { KpiSettingsStep } from "./steps/5-kpi-settings";
import { FinanceSettingsStep } from "./steps/6-finance-settings";
import { ReviewStep } from "./steps/7-review";
import { Card, CardContent } from "@/components/ui/card";
import { auditLog } from "@/lib/audit-logger";

const WIZARD_STEPS: WizardStep[] = [
  { id: 'organization', label: 'Organization', description: 'Company info' },
  { id: 'branches', label: 'Branches', description: 'Office locations' },
  { id: 'teams', label: 'Teams', description: 'Sales teams' },
  { id: 'agents', label: 'Agents', description: 'Team members' },
  { id: 'kpi_settings', label: 'KPIs', description: 'Performance targets' },
  { id: 'finance_settings', label: 'Finance', description: 'Costs & rates' },
  { id: 'review', label: 'Review', description: 'Confirm & create' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setCurrentOrg } = useAuth();
  const { setCurrentOrgData } = useOrg();
  const { 
    currentStep, 
    completedSteps, 
    nextStep, 
    previousStep,
    loadDraft, 
    markComplete,
    data 
  } = useOnboarding();
  
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  
  useEffect(() => {
    checkOnboarding();
  }, []);
  
  const checkOnboarding = async () => {
    try {
      // Check if user is authenticated
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!currentUser) {
        router.push('/auth');
        return;
      }
      
      // Check if user has already completed onboarding
      const { data: membership } = await supabase
        .from('memberships')
        .select('org_id, role')
        .eq('user_id', currentUser.id)
        .single();
      
      if (membership) {
        // User already has an org, redirect to dashboard
        router.push('/dashboard');
        return;
      }
      
      // Load any saved draft
      loadDraft();
      setLoading(false);
      
    } catch (error) {
      console.error('Onboarding check failed:', error);
      setLoading(false);
    }
  };
  
  const handleSubmit = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('Not authenticated');
      
      // 1. Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.organization!.name,
          slug: data.organization!.slug,
          owner_id: currentUser.id,
          settings: { twoFA: false, currency: 'EGP', timezone: 'Africa/Cairo' },
        })
        .select()
        .single();
      
      if (orgError) throw orgError;
      
      // 2. Create branches
      if (data.branches && data.branches.length > 0) {
        const { error: branchesError } = await supabase
          .from('branches')
          .insert(
            data.branches.map(b => ({
              org_id: org.id,
              name: b.name,
              address: b.address || null,
              meta: {},
            }))
          );
        
        if (branchesError) throw branchesError;
      }
      
      // Get created branches for team assignment
      const { data: createdBranches } = await supabase
        .from('branches')
        .select('id, name')
        .eq('org_id', org.id);
      
      // 3. Create teams
      if (data.teams && data.teams.length > 0 && createdBranches) {
        const { error: teamsError } = await supabase
          .from('teams')
          .insert(
            data.teams.map(t => {
              // Find matching branch by name
              const branch = createdBranches.find(b => 
                data.branches?.find(db => db.id === t.branch_id)?.name === b.name
              );
              
              return {
                org_id: org.id,
                branch_id: branch?.id || null,
                name: t.name,
              };
            })
          );
        
        if (teamsError) throw teamsError;
      }
      
      // Get created teams for agent assignment
      const { data: createdTeams } = await supabase
        .from('teams')
        .select('id, name')
        .eq('org_id', org.id);
      
      // 4. Create agents
      if (data.agents && data.agents.length > 0 && createdTeams) {
        const { error: agentsError } = await supabase
          .from('sales_agents')
          .insert(
            data.agents.map(a => {
              // Find matching team by name
              const team = createdTeams.find(t =>
                data.teams?.find(dt => dt.id === a.team_id)?.name === t.name
              );
              
              return {
                org_id: org.id,
                user_id: currentUser.id,
                full_name: a.full_name,
                phone: a.phone || null,
                role: a.role || 'agent', // Keep lowercase for database constraint
                team_id: team?.id || null,
                is_active: true,
              };
            })
          );
        
        if (agentsError) throw agentsError;
      }
      
      // 5. Create KPI settings
      if (data.kpiSettings) {
        const { error: kpiError } = await supabase
          .from('agent_kpi_settings')
          .insert({
            user_id: currentUser.id,
            org_id: org.id,
            ...data.kpiSettings,
          });
        
        if (kpiError) throw kpiError;
      }
      
      // 6. Finance settings (auto-created by trigger, just update)
      if (data.financeSettings) {
        const { error: financeError } = await supabase
          .from('org_finance_settings')
          .update({
            ...data.financeSettings,
          })
          .eq('org_id', org.id);
        
        if (financeError) throw financeError;
      }
      
      // 7. Create first break-even snapshot (optional)
      // This will be done later from the analyze page
      
      // 8. Set current org context
      setCurrentOrg(org.id, org.slug, 'OWNER');
      setCurrentOrgData(org as any); // Set full org object
      
      // 9. Log audit entry
      await auditLog({
        org_id: org.id,
        user_id: currentUser.id,
        action: 'ORG_CREATED',
        entity: 'organizations',
        entity_id: org.id,
        metadata: {
          onboarding: true,
          branches_count: data.branches?.length || 0,
          teams_count: data.teams?.length || 0,
          agents_count: data.agents?.length || 0,
        },
      });
      
      // 10. Mark onboarding complete
      markComplete();
      
      // Show success screen
      setShowSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Onboarding submission failed:', error);
      throw error;
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="flex flex-col items-center p-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Preparing your onboarding...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-2xl"
        >
          <Card>
            <CardContent className="p-16">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-block p-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 mb-6"
              >
                <Sparkles className="h-16 w-16 text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-4">
                🎉 Welcome to Brokmang.!
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Your organization has been created successfully!
              </p>
              <p className="text-muted-foreground">
                Redirecting to your dashboard...
              </p>
              
              <div className="mt-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen py-12 px-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-2">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Brokmang.
            </span>
          </h1>
          <p className="text-xl text-muted-foreground">
            Let's set up your organization in just a few steps
          </p>
        </motion.div>
        
        {/* Progress Indicator */}
        <div className="mb-12">
          <StepIndicator
            steps={WIZARD_STEPS}
            currentStepId={currentStep}
            completedStepIds={completedSteps}
          />
        </div>
        
        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'organization' && (
            <OrganizationStep key="org" onNext={nextStep} />
          )}
          {currentStep === 'branches' && (
            <BranchesStep key="branches" onNext={nextStep} onPrevious={previousStep} />
          )}
          {currentStep === 'teams' && (
            <TeamsStep key="teams" onNext={nextStep} onPrevious={previousStep} />
          )}
          {currentStep === 'agents' && (
            <AgentsStep key="agents" onNext={nextStep} onPrevious={previousStep} />
          )}
          {currentStep === 'kpi_settings' && (
            <KpiSettingsStep key="kpi" onNext={nextStep} onPrevious={previousStep} />
          )}
          {currentStep === 'finance_settings' && (
            <FinanceSettingsStep key="finance" onNext={nextStep} onPrevious={previousStep} />
          )}
          {currentStep === 'review' && (
            <ReviewStep key="review" onPrevious={previousStep} onSubmit={handleSubmit} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


-- =====================================================
-- Brokmang. v1.1 Row-Level Security Policies (FIXED)
-- Phase-2: RBAC Implementation
-- =====================================================
-- Run this AFTER schema-v1_1.sql
-- FIXED: All ambiguous org_id references now qualified
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_finance_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.onboarding_state ENABLE ROW LEVEL SECURITY;

-- Already enabled in previous migrations, but ensure:
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_kpi_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_monthly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.break_even_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Check user membership
-- =====================================================

CREATE OR REPLACE FUNCTION public.user_org_ids()
RETURNS SETOF UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT org_id FROM public.memberships WHERE user_id = auth.uid();
$$;

-- =====================================================
-- 1. ORGANIZATIONS POLICIES
-- =====================================================

-- Users can view organizations they're members of
CREATE POLICY "organizations_select_member"
  ON public.organizations FOR SELECT
  USING (
    id IN (SELECT public.user_org_ids())
  );

-- Only owners can update their organizations
CREATE POLICY "organizations_update_owner"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = organizations.id 
        AND m.user_id = auth.uid()
        AND m.role = 'OWNER'
    )
  );

-- Any authenticated user can create an organization (during onboarding)
CREATE POLICY "organizations_insert_authenticated"
  ON public.organizations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Only owners can delete their organizations
CREATE POLICY "organizations_delete_owner"
  ON public.organizations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = organizations.id 
        AND m.user_id = auth.uid()
        AND m.role = 'OWNER'
    )
  );

-- =====================================================
-- 2. MEMBERSHIPS POLICIES
-- =====================================================

-- Users can view memberships in their orgs
CREATE POLICY "memberships_select_org_member"
  ON public.memberships FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Owners and admins can insert memberships (invite users)
CREATE POLICY "memberships_insert_owner_admin"
  ON public.memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = memberships.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- Owners and admins can update memberships (change roles)
CREATE POLICY "memberships_update_owner_admin"
  ON public.memberships FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = memberships.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- Owners and admins can delete memberships (remove users)
CREATE POLICY "memberships_delete_owner_admin"
  ON public.memberships FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = memberships.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 3. BRANCHES POLICIES
-- =====================================================

-- Users can view branches in their orgs
CREATE POLICY "branches_select_org_member"
  ON public.branches FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Owners and admins can manage branches
CREATE POLICY "branches_insert_owner_admin"
  ON public.branches FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = branches.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "branches_update_owner_admin"
  ON public.branches FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = branches.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "branches_delete_owner_admin"
  ON public.branches FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = branches.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 4. TEAMS POLICIES
-- =====================================================

-- Users can view teams in their orgs
CREATE POLICY "teams_select_org_member"
  ON public.teams FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Owners, admins, and team leaders can create teams
CREATE POLICY "teams_insert_manager"
  ON public.teams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = teams.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'TEAM_LEADER')
    )
  );

-- Owners, admins can update any team; team leaders can update their own team
CREATE POLICY "teams_update_manager_own"
  ON public.teams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = teams.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      INNER JOIN public.memberships m ON m.user_id = auth.uid()
      WHERE sa.id = teams.team_leader_id
        AND sa.user_ref = auth.uid()
        AND sa.org_id = teams.org_id
    )
  );

CREATE POLICY "teams_delete_owner_admin"
  ON public.teams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = teams.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 5. SALES_AGENTS POLICIES (Updated for multi-tenant)
-- =====================================================

-- Drop old policies if they exist
DROP POLICY IF EXISTS "agents_select_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_delete_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_select_all_related" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_all_related" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_all_related" ON public.sales_agents;

-- Users can view agents in their orgs
CREATE POLICY "agents_select_org_member"
  ON public.sales_agents FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Owners, admins, team leaders can create agents
CREATE POLICY "agents_insert_manager"
  ON public.sales_agents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = sales_agents.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'TEAM_LEADER')
    )
  );

-- Owners, admins can update any agent; team leaders can update their team's agents
CREATE POLICY "agents_update_manager_team"
  ON public.sales_agents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = sales_agents.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      INNER JOIN public.teams t ON t.id = sales_agents.team_id
      WHERE sa.user_ref = auth.uid()
        AND sa.id = t.team_leader_id
        AND t.org_id = sales_agents.org_id
    )
  );

CREATE POLICY "agents_delete_owner_admin"
  ON public.sales_agents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = sales_agents.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 6. AGENT_KPI_SETTINGS POLICIES
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "kpi_select_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_upsert_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_update_own" ON public.agent_kpi_settings;

-- Users can view KPI settings in their orgs
CREATE POLICY "kpi_settings_select_org_member"
  ON public.agent_kpi_settings FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Owners, admins, accountants can manage KPI settings
CREATE POLICY "kpi_settings_insert_manager"
  ON public.agent_kpi_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = agent_kpi_settings.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'ACCOUNTANT')
    )
  );

CREATE POLICY "kpi_settings_update_manager"
  ON public.agent_kpi_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = agent_kpi_settings.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'ACCOUNTANT')
    )
  );

-- =====================================================
-- 7. AGENT_DAILY_LOGS POLICIES
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "logs_select_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_insert_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_update_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_delete_own" ON public.agent_daily_logs;

-- Users can view logs in their orgs
CREATE POLICY "daily_logs_select_org_member"
  ON public.agent_daily_logs FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Agents can insert/update their own logs; managers can insert/update any
CREATE POLICY "daily_logs_insert_agent_manager"
  ON public.agent_daily_logs FOR INSERT
  WITH CHECK (
    -- Managers can insert any
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = agent_daily_logs.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'TEAM_LEADER')
    )
    OR
    -- Agents can insert their own
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
        AND sa.user_ref = auth.uid()
        AND sa.org_id = agent_daily_logs.org_id
    )
  );

CREATE POLICY "daily_logs_update_agent_manager"
  ON public.agent_daily_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = agent_daily_logs.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'TEAM_LEADER')
    )
    OR
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
        AND sa.user_ref = auth.uid()
        AND sa.org_id = agent_daily_logs.org_id
    )
  );

-- Only managers can delete logs
CREATE POLICY "daily_logs_delete_manager"
  ON public.agent_daily_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = agent_daily_logs.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'TEAM_LEADER')
    )
  );

-- =====================================================
-- 8. AGENT_MONTHLY_SCORES POLICIES
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "monthly_select_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_upsert_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_update_own" ON public.agent_monthly_scores;

-- All org members can view scores
CREATE POLICY "monthly_scores_select_org_member"
  ON public.agent_monthly_scores FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Only system (service role) can insert/update scores
CREATE POLICY "monthly_scores_insert_service_role"
  ON public.agent_monthly_scores FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "monthly_scores_update_service_role"
  ON public.agent_monthly_scores FOR UPDATE
  USING (auth.role() = 'service_role');

-- =====================================================
-- 9. BREAK_EVEN_RECORDS POLICIES
-- =====================================================

-- Drop old policies
DROP POLICY IF EXISTS "break_even_records_select_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_records_insert_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_records_delete_own" ON public.break_even_records;

-- All org members can view break-even records
CREATE POLICY "break_even_select_org_member"
  ON public.break_even_records FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Owners, admins, accountants can create break-even records
CREATE POLICY "break_even_insert_manager"
  ON public.break_even_records FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = break_even_records.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'ACCOUNTANT')
    )
  );

-- Users can delete their own records
CREATE POLICY "break_even_delete_own"
  ON public.break_even_records FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- 10. ORG_FINANCE_SETTINGS POLICIES
-- =====================================================

-- All org members can view finance settings
CREATE POLICY "finance_settings_select_org_member"
  ON public.org_finance_settings FOR SELECT
  USING (
    org_id IN (SELECT public.user_org_ids())
  );

-- Owners, admins, accountants can manage finance settings
CREATE POLICY "finance_settings_insert_manager"
  ON public.org_finance_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = org_finance_settings.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'ACCOUNTANT')
    )
  );

CREATE POLICY "finance_settings_update_manager"
  ON public.org_finance_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = org_finance_settings.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN', 'ACCOUNTANT')
    )
  );

-- =====================================================
-- 11. NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications or org-wide ones
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    (user_id IS NULL AND org_id IN (SELECT public.user_org_ids()))
  );

-- System can insert notifications (service role)
CREATE POLICY "notifications_insert_service_role"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Users can update their own notifications (mark as read)
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "notifications_delete_own"
  ON public.notifications FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- 12. SYSTEM_LOGS POLICIES
-- =====================================================

-- Owners and admins can view audit logs
CREATE POLICY "system_logs_select_owner_admin"
  ON public.system_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = system_logs.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- System can insert audit logs (service role or authenticated users via API)
CREATE POLICY "system_logs_insert_authenticated"
  ON public.system_logs FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- No updates or deletes allowed (append-only)

-- =====================================================
-- 13. API_TOKENS POLICIES
-- =====================================================

-- Owners and admins can view tokens
CREATE POLICY "api_tokens_select_owner_admin"
  ON public.api_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = api_tokens.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- Owners and admins can manage tokens
CREATE POLICY "api_tokens_insert_owner_admin"
  ON public.api_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = api_tokens.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "api_tokens_update_owner_admin"
  ON public.api_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = api_tokens.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

CREATE POLICY "api_tokens_delete_owner_admin"
  ON public.api_tokens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m
      WHERE m.org_id = api_tokens.org_id
        AND m.user_id = auth.uid()
        AND m.role IN ('OWNER', 'ADMIN')
    )
  );

-- =====================================================
-- 14. ONBOARDING_STATE POLICIES
-- =====================================================

-- Users can view/manage their own onboarding state
CREATE POLICY "onboarding_state_select_own"
  ON public.onboarding_state FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "onboarding_state_insert_own"
  ON public.onboarding_state FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "onboarding_state_update_own"
  ON public.onboarding_state FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "onboarding_state_delete_own"
  ON public.onboarding_state FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Service role has full access (already configured by Supabase)

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this to verify the policies are working:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';

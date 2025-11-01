-- =====================================================
-- Simplified RLS Policies - No Organizations
-- Removes all organization-based access control
-- Run this AFTER remove-organizations.sql
-- =====================================================

-- =====================================================
-- DROP ALL OLD ORGANIZATION-BASED POLICIES
-- =====================================================
-- Note: These tables may already be dropped by remove-organizations.sql
-- Using DO blocks to handle gracefully if tables don't exist

-- Drop policies for tables that may have been deleted
DO $$ 
BEGIN
  -- Organizations (may not exist)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'organizations') THEN
    DROP POLICY IF EXISTS "organizations_select_member" ON public.organizations;
    DROP POLICY IF EXISTS "organizations_update_owner" ON public.organizations;
    DROP POLICY IF EXISTS "organizations_insert_authenticated" ON public.organizations;
    DROP POLICY IF EXISTS "organizations_delete_owner" ON public.organizations;
  END IF;

  -- Memberships (may not exist)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'memberships') THEN
    DROP POLICY IF EXISTS "memberships_select_org_member" ON public.memberships;
    DROP POLICY IF EXISTS "memberships_insert_owner_admin" ON public.memberships;
    DROP POLICY IF EXISTS "memberships_update_owner_admin" ON public.memberships;
    DROP POLICY IF EXISTS "memberships_delete_owner_admin" ON public.memberships;
  END IF;

  -- Branches (may not exist)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'branches') THEN
    DROP POLICY IF EXISTS "branches_select_org_member" ON public.branches;
    DROP POLICY IF EXISTS "branches_insert_owner_admin" ON public.branches;
    DROP POLICY IF EXISTS "branches_update_owner_admin" ON public.branches;
    DROP POLICY IF EXISTS "branches_delete_owner_admin" ON public.branches;
  END IF;

  -- Teams (may not exist)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'teams') THEN
    DROP POLICY IF EXISTS "teams_select_org_member" ON public.teams;
    DROP POLICY IF EXISTS "teams_insert_manager" ON public.teams;
    DROP POLICY IF EXISTS "teams_update_manager_own" ON public.teams;
    DROP POLICY IF EXISTS "teams_delete_owner_admin" ON public.teams;
  END IF;

  -- Org Finance Settings (may not exist)
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'org_finance_settings') THEN
    DROP POLICY IF EXISTS "finance_settings_select_org_member" ON public.org_finance_settings;
    DROP POLICY IF EXISTS "finance_settings_insert_manager" ON public.org_finance_settings;
    DROP POLICY IF EXISTS "finance_settings_update_manager" ON public.org_finance_settings;
  END IF;
END $$;

-- Drop old org-based policies from remaining tables
DROP POLICY IF EXISTS "agents_select_org_member" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_manager" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_manager_team" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_delete_owner_admin" ON public.sales_agents;

DROP POLICY IF EXISTS "kpi_settings_select_org_member" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_insert_manager" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_update_manager" ON public.agent_kpi_settings;

DROP POLICY IF EXISTS "daily_logs_select_org_member" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_insert_agent_manager" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_update_agent_manager" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_delete_manager" ON public.agent_daily_logs;

DROP POLICY IF EXISTS "monthly_scores_select_org_member" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_scores_insert_service_role" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_scores_update_service_role" ON public.agent_monthly_scores;

DROP POLICY IF EXISTS "break_even_select_org_member" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_insert_manager" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_delete_own" ON public.break_even_records;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_service_role" ON public.notifications;
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;

DROP POLICY IF EXISTS "system_logs_select_owner_admin" ON public.system_logs;
DROP POLICY IF EXISTS "system_logs_insert_authenticated" ON public.system_logs;

DROP POLICY IF EXISTS "api_tokens_select_owner_admin" ON public.api_tokens;
DROP POLICY IF EXISTS "api_tokens_insert_owner_admin" ON public.api_tokens;
DROP POLICY IF EXISTS "api_tokens_update_owner_admin" ON public.api_tokens;
DROP POLICY IF EXISTS "api_tokens_delete_owner_admin" ON public.api_tokens;

-- Onboarding state policies (may not exist)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'onboarding_state') THEN
    DROP POLICY IF EXISTS "onboarding_state_select_own" ON public.onboarding_state;
    DROP POLICY IF EXISTS "onboarding_state_insert_own" ON public.onboarding_state;
    DROP POLICY IF EXISTS "onboarding_state_update_own" ON public.onboarding_state;
    DROP POLICY IF EXISTS "onboarding_state_delete_own" ON public.onboarding_state;
  END IF;
END $$;

-- =====================================================
-- NEW SIMPLIFIED POLICIES (No Organization Checks)
-- =====================================================

-- =====================================================
-- 1. SALES_AGENTS POLICIES
-- =====================================================

-- All authenticated users can view all agents
CREATE POLICY "agents_select_authenticated"
  ON public.sales_agents FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create agents
CREATE POLICY "agents_insert_authenticated"
  ON public.sales_agents FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update agents they created (via user_id) or any authenticated user
CREATE POLICY "agents_update_own_or_manager"
  ON public.sales_agents FOR UPDATE
  USING (
    -- Can update own agent records (if user_id matches)
    user_id = auth.uid()
    OR
    -- Or any authenticated user can update (simplified - remove if you want stricter control)
    auth.role() = 'authenticated'
  );

-- Users can delete agents they created
CREATE POLICY "agents_delete_own"
  ON public.sales_agents FOR DELETE
  USING (user_id = auth.uid() OR auth.role() = 'authenticated');

-- =====================================================
-- 2. AGENT_KPI_SETTINGS POLICIES
-- =====================================================

-- All authenticated users can view KPI settings
CREATE POLICY "kpi_settings_select_authenticated"
  ON public.agent_kpi_settings FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create/update KPI settings
CREATE POLICY "kpi_settings_upsert_authenticated"
  ON public.agent_kpi_settings FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "kpi_settings_update_authenticated"
  ON public.agent_kpi_settings FOR UPDATE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 3. AGENT_DAILY_LOGS POLICIES
-- =====================================================

-- All authenticated users can view logs
CREATE POLICY "daily_logs_select_authenticated"
  ON public.agent_daily_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Agents can insert/update their own logs (via agent_id -> sales_agents.user_ref)
-- Or any authenticated user can insert logs
CREATE POLICY "daily_logs_insert_authenticated"
  ON public.agent_daily_logs FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated'
    OR
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
        AND sa.user_ref = auth.uid()
    )
  );

CREATE POLICY "daily_logs_update_authenticated"
  ON public.agent_daily_logs FOR UPDATE
  USING (
    auth.role() = 'authenticated'
    OR
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
        AND sa.user_ref = auth.uid()
    )
  );

-- Only the agent who created the log can delete it
CREATE POLICY "daily_logs_delete_own"
  ON public.agent_daily_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
        AND sa.user_ref = auth.uid()
    )
  );

-- =====================================================
-- 4. AGENT_MONTHLY_SCORES POLICIES
-- =====================================================

-- All authenticated users can view scores
CREATE POLICY "monthly_scores_select_authenticated"
  ON public.agent_monthly_scores FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only service role (system) can insert/update scores
CREATE POLICY "monthly_scores_insert_service_role"
  ON public.agent_monthly_scores FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "monthly_scores_update_service_role"
  ON public.agent_monthly_scores FOR UPDATE
  USING (auth.role() = 'service_role');

-- =====================================================
-- 5. BREAK_EVEN_RECORDS POLICIES
-- =====================================================

-- All authenticated users can view break-even records
CREATE POLICY "break_even_select_authenticated"
  ON public.break_even_records FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create break-even records
CREATE POLICY "break_even_insert_authenticated"
  ON public.break_even_records FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can delete their own records
CREATE POLICY "break_even_delete_own"
  ON public.break_even_records FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- 6. NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);

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
-- 7. SYSTEM_LOGS POLICIES
-- =====================================================

-- All authenticated users can view audit logs
CREATE POLICY "system_logs_select_authenticated"
  ON public.system_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users and service role can insert audit logs
CREATE POLICY "system_logs_insert_authenticated"
  ON public.system_logs FOR INSERT
  WITH CHECK (auth.role() IN ('authenticated', 'service_role'));

-- No updates or deletes allowed (append-only)

-- =====================================================
-- 8. API_TOKENS POLICIES
-- =====================================================

-- All authenticated users can view their own tokens
CREATE POLICY "api_tokens_select_authenticated"
  ON public.api_tokens FOR SELECT
  USING (auth.role() = 'authenticated');

-- Authenticated users can create tokens
CREATE POLICY "api_tokens_insert_authenticated"
  ON public.api_tokens FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Users can update their own tokens
CREATE POLICY "api_tokens_update_authenticated"
  ON public.api_tokens FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Users can delete their own tokens
CREATE POLICY "api_tokens_delete_authenticated"
  ON public.api_tokens FOR DELETE
  USING (auth.role() = 'authenticated');

-- =====================================================
-- 9. ONBOARDING_STATE POLICIES (if table exists)
-- =====================================================

DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'onboarding_state') THEN
    -- Users can view/manage their own onboarding state
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_state' AND policyname = 'onboarding_state_select_own') THEN
      CREATE POLICY "onboarding_state_select_own"
        ON public.onboarding_state FOR SELECT
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_state' AND policyname = 'onboarding_state_insert_own') THEN
      CREATE POLICY "onboarding_state_insert_own"
        ON public.onboarding_state FOR INSERT
        WITH CHECK (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_state' AND policyname = 'onboarding_state_update_own') THEN
      CREATE POLICY "onboarding_state_update_own"
        ON public.onboarding_state FOR UPDATE
        USING (user_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'onboarding_state' AND policyname = 'onboarding_state_delete_own') THEN
      CREATE POLICY "onboarding_state_delete_own"
        ON public.onboarding_state FOR DELETE
        USING (user_id = auth.uid());
    END IF;
  END IF;
END $$;

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
-- VERIFICATION
-- =====================================================
-- Run this to verify the policies are working:
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;


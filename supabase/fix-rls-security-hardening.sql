-- =====================================================
-- RLS Security Hardening - Fix Overly Permissive Policies
-- Replaces permissive _authenticated policies with proper access control
-- =====================================================

-- =====================================================
-- 1. SALES_AGENTS - Fix Overly Permissive Policies
-- =====================================================

-- Drop permissive policies
DROP POLICY IF EXISTS "agents_select_authenticated" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_authenticated" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_own_or_manager" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_delete_own" ON public.sales_agents;

-- Drop any old policies that might conflict
DROP POLICY IF EXISTS "agents_select_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.sales_agents;
DROP POLICY IF EXISTS "select own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "insert self row" ON public.sales_agents;
DROP POLICY IF EXISTS "update own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "users_select_own_row" ON public.sales_agents;
DROP POLICY IF EXISTS "users_insert_own_row" ON public.sales_agents;
DROP POLICY IF EXISTS "users_update_own_row" ON public.sales_agents;

-- CREATE SECURE POLICIES
-- Users can select their own agent record
CREATE POLICY "agents_select_own"
  ON public.sales_agents FOR SELECT
  USING (auth.uid() = user_id);

-- CEOs and Team Leaders can view all agents (for team management)
CREATE POLICY "agents_select_manager"
  ON public.sales_agents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Users can insert their own agent record
CREATE POLICY "agents_insert_own"
  ON public.sales_agents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own agent record
CREATE POLICY "agents_update_own"
  ON public.sales_agents FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CEOs and Team Leaders can update agent records (for team management)
CREATE POLICY "agents_update_manager"
  ON public.sales_agents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Users can delete their own agent record
CREATE POLICY "agents_delete_own"
  ON public.sales_agents FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 2. AGENT_KPI_SETTINGS - Fix Overly Permissive Policies
-- =====================================================

-- Drop permissive policies
DROP POLICY IF EXISTS "kpi_settings_select_authenticated" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_upsert_authenticated" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_update_authenticated" ON public.agent_kpi_settings;

-- Drop old policies
DROP POLICY IF EXISTS "kpi_select_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_upsert_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_update_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_delete_own" ON public.agent_kpi_settings;

-- CREATE SECURE POLICIES
-- Users can select their own KPI settings
CREATE POLICY "kpi_settings_select_own"
  ON public.agent_kpi_settings FOR SELECT
  USING (auth.uid() = user_id);

-- CEOs and Team Leaders can view all KPI settings (for team management)
CREATE POLICY "kpi_settings_select_manager"
  ON public.agent_kpi_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Users can insert their own KPI settings
CREATE POLICY "kpi_settings_insert_own"
  ON public.agent_kpi_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own KPI settings
CREATE POLICY "kpi_settings_update_own"
  ON public.agent_kpi_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- CEOs and Team Leaders can update KPI settings (for team management)
CREATE POLICY "kpi_settings_update_manager"
  ON public.agent_kpi_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Users can delete their own KPI settings
CREATE POLICY "kpi_settings_delete_own"
  ON public.agent_kpi_settings FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- 3. AGENT_DAILY_LOGS - Fix Overly Permissive Policies
-- =====================================================

-- Drop permissive policies
DROP POLICY IF EXISTS "daily_logs_select_authenticated" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_insert_authenticated" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_update_authenticated" ON public.agent_daily_logs;

-- Drop old policies
DROP POLICY IF EXISTS "logs_select_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_insert_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_update_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_delete_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "adl_insert" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "adl_update" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_delete_own" ON public.agent_daily_logs;

-- CREATE SECURE POLICIES
-- Users can select their own daily logs (via agent_id -> user_id relationship)
CREATE POLICY "daily_logs_select_own"
  ON public.agent_daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
      AND sa.user_id = auth.uid()
    )
  );

-- CEOs and Team Leaders can view all daily logs (for team management)
CREATE POLICY "daily_logs_select_manager"
  ON public.agent_daily_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Users can insert their own daily logs (via agent_id -> user_id relationship)
CREATE POLICY "daily_logs_insert_own"
  ON public.agent_daily_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
      AND sa.user_id = auth.uid()
    )
  );

-- Users can update their own daily logs
CREATE POLICY "daily_logs_update_own"
  ON public.agent_daily_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
      AND sa.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
      AND sa.user_id = auth.uid()
    )
  );

-- CEOs and Team Leaders can update daily logs (for team management)
CREATE POLICY "daily_logs_update_manager"
  ON public.agent_daily_logs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Users can delete their own daily logs
CREATE POLICY "daily_logs_delete_own"
  ON public.agent_daily_logs FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_daily_logs.agent_id
      AND sa.user_id = auth.uid()
    )
  );

-- =====================================================
-- 4. AGENT_MONTHLY_SCORES - Fix Overly Permissive Policies
-- =====================================================

-- Drop permissive policies
DROP POLICY IF EXISTS "monthly_scores_select_authenticated" ON public.agent_monthly_scores;

-- Drop old policies
DROP POLICY IF EXISTS "monthly_select_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_upsert_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_update_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_delete_own" ON public.agent_monthly_scores;

-- CREATE SECURE POLICIES
-- Users can select their own monthly scores (via agent_id -> user_id relationship)
CREATE POLICY "monthly_scores_select_own"
  ON public.agent_monthly_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.sales_agents sa
      WHERE sa.id = agent_monthly_scores.agent_id
      AND sa.user_id = auth.uid()
    )
  );

-- CEOs and Team Leaders can view all monthly scores (for team management)
CREATE POLICY "monthly_scores_select_manager"
  ON public.agent_monthly_scores FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Keep service role policies for inserts/updates (system-generated scores)
-- These should already exist, but ensure they're correct
DROP POLICY IF EXISTS "monthly_scores_insert_service_role" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_scores_update_service_role" ON public.agent_monthly_scores;

CREATE POLICY "monthly_scores_insert_service_role"
  ON public.agent_monthly_scores FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "monthly_scores_update_service_role"
  ON public.agent_monthly_scores FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 5. BREAK_EVEN_RECORDS - Fix Overly Permissive Policies
-- =====================================================

-- Drop permissive policies
DROP POLICY IF EXISTS "break_even_select_authenticated" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_insert_authenticated" ON public.break_even_records;

-- Drop old policies
DROP POLICY IF EXISTS "break_even_select_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_insert_own" ON public.break_even_records;
DROP POLICY IF EXISTS "read own" ON public.break_even_records;
DROP POLICY IF EXISTS "insert own" ON public.break_even_records;
DROP POLICY IF EXISTS "delete own" ON public.break_even_records;

-- CREATE SECURE POLICIES
-- Users can select their own break-even records
CREATE POLICY "break_even_select_own"
  ON public.break_even_records FOR SELECT
  USING (user_id = auth.uid());

-- CEOs and Team Leaders can view all break-even records (for team management)
CREATE POLICY "break_even_select_manager"
  ON public.break_even_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE user_id = auth.uid()
      AND user_type IN ('ceo', 'team_leader')
    )
  );

-- Users can insert their own break-even records
CREATE POLICY "break_even_insert_own"
  ON public.break_even_records FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can delete their own break-even records
CREATE POLICY "break_even_delete_own"
  ON public.break_even_records FOR DELETE
  USING (user_id = auth.uid());

-- =====================================================
-- 6. API_TOKENS - Fix Overly Permissive Policies (if needed)
-- =====================================================

-- Drop permissive policies
DROP POLICY IF EXISTS "api_tokens_select_authenticated" ON public.api_tokens;
DROP POLICY IF EXISTS "api_tokens_insert_authenticated" ON public.api_tokens;
DROP POLICY IF EXISTS "api_tokens_update_authenticated" ON public.api_tokens;
DROP POLICY IF EXISTS "api_tokens_delete_authenticated" ON public.api_tokens;

-- CREATE SECURE POLICIES (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'api_tokens') THEN
    -- Users can select their own API tokens
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_tokens' AND policyname = 'api_tokens_select_own') THEN
      CREATE POLICY "api_tokens_select_own"
        ON public.api_tokens FOR SELECT
        USING (auth.uid() = user_id);
    END IF;

    -- Users can insert their own API tokens
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_tokens' AND policyname = 'api_tokens_insert_own') THEN
      CREATE POLICY "api_tokens_insert_own"
        ON public.api_tokens FOR INSERT
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Users can update their own API tokens
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_tokens' AND policyname = 'api_tokens_update_own') THEN
      CREATE POLICY "api_tokens_update_own"
        ON public.api_tokens FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Users can delete their own API tokens
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'api_tokens' AND policyname = 'api_tokens_delete_own') THEN
      CREATE POLICY "api_tokens_delete_own"
        ON public.api_tokens FOR DELETE
        USING (auth.uid() = user_id);
    END IF;
  END IF;
END $$;

-- =====================================================
-- 7. SYSTEM_LOGS - Keep but verify (audit logs are usually readable)
-- =====================================================

-- System logs are typically readable by authenticated users for transparency
-- But we'll make it more restrictive if needed
-- Current policy is fine: system_logs_select_authenticated

-- =====================================================
-- Verification - Show all policies
-- =====================================================

SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100)
    ELSE NULL
  END as using_clause
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('sales_agents', 'agent_kpi_settings', 'agent_daily_logs', 
                    'agent_monthly_scores', 'break_even_records', 'api_tokens')
ORDER BY tablename, cmd, policyname;


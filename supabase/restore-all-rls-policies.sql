-- =====================================================
-- RESTORE ALL RLS POLICIES
-- This file restores all Row-Level Security policies
-- for the application
-- =====================================================

-- =====================================================
-- HELPER FUNCTION: is_admin()
-- Must be created BEFORE any policies that use it
-- This function uses SECURITY DEFINER to bypass RLS recursion
-- =====================================================
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_id = auth.uid()
    AND user_type = 'admin'
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- =====================================================
-- 1. SALES_AGENTS POLICIES
-- =====================================================

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "agents_select_authenticated" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_authenticated" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_own_or_manager" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_select_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_manager" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_delete_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_select_manager" ON public.sales_agents;
DROP POLICY IF EXISTS "select own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "insert self row" ON public.sales_agents;
DROP POLICY IF EXISTS "update own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "users_select_own_row" ON public.sales_agents;
DROP POLICY IF EXISTS "users_insert_own_row" ON public.sales_agents;
DROP POLICY IF EXISTS "users_update_own_row" ON public.sales_agents;

-- Ensure RLS is enabled
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

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
-- 2. AGENT_KPI_SETTINGS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "kpi_settings_select_authenticated" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_upsert_authenticated" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_update_authenticated" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_select_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_upsert_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_update_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_delete_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_select_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_select_manager" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_insert_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_update_own" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_update_manager" ON public.agent_kpi_settings;
DROP POLICY IF EXISTS "kpi_settings_delete_own" ON public.agent_kpi_settings;

-- Ensure RLS is enabled
ALTER TABLE public.agent_kpi_settings ENABLE ROW LEVEL SECURITY;

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
-- 3. AGENT_DAILY_LOGS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "daily_logs_select_authenticated" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_insert_authenticated" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_update_authenticated" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_select_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_insert_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_update_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "logs_delete_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "adl_insert" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "adl_update" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_select_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_select_manager" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_insert_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_update_own" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_update_manager" ON public.agent_daily_logs;
DROP POLICY IF EXISTS "daily_logs_delete_own" ON public.agent_daily_logs;

-- Ensure RLS is enabled
ALTER TABLE public.agent_daily_logs ENABLE ROW LEVEL SECURITY;

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
-- 4. AGENT_MONTHLY_SCORES POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "monthly_scores_select_authenticated" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_select_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_upsert_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_update_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_delete_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_scores_select_own" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_scores_select_manager" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_scores_insert_service_role" ON public.agent_monthly_scores;
DROP POLICY IF EXISTS "monthly_scores_update_service_role" ON public.agent_monthly_scores;

-- Ensure RLS is enabled
ALTER TABLE public.agent_monthly_scores ENABLE ROW LEVEL SECURITY;

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

-- Service role can insert scores (system-generated)
CREATE POLICY "monthly_scores_insert_service_role"
  ON public.agent_monthly_scores FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Service role can update scores (system-generated)
CREATE POLICY "monthly_scores_update_service_role"
  ON public.agent_monthly_scores FOR UPDATE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- =====================================================
-- 5. BREAK_EVEN_RECORDS POLICIES
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "break_even_select_authenticated" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_insert_authenticated" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_select_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_select_manager" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_insert_own" ON public.break_even_records;
DROP POLICY IF EXISTS "break_even_delete_own" ON public.break_even_records;
DROP POLICY IF EXISTS "read own" ON public.break_even_records;
DROP POLICY IF EXISTS "insert own" ON public.break_even_records;
DROP POLICY IF EXISTS "delete own" ON public.break_even_records;

-- Ensure RLS is enabled
ALTER TABLE public.break_even_records ENABLE ROW LEVEL SECURITY;

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
-- 6. API_TOKENS POLICIES (if table exists)
-- Note: api_tokens table may have created_by column instead of user_id
-- =====================================================

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'api_tokens') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "api_tokens_select_authenticated" ON public.api_tokens;
    DROP POLICY IF EXISTS "api_tokens_insert_authenticated" ON public.api_tokens;
    DROP POLICY IF EXISTS "api_tokens_update_authenticated" ON public.api_tokens;
    DROP POLICY IF EXISTS "api_tokens_delete_authenticated" ON public.api_tokens;
    DROP POLICY IF EXISTS "api_tokens_select_own" ON public.api_tokens;
    DROP POLICY IF EXISTS "api_tokens_insert_own" ON public.api_tokens;
    DROP POLICY IF EXISTS "api_tokens_update_own" ON public.api_tokens;
    DROP POLICY IF EXISTS "api_tokens_delete_own" ON public.api_tokens;

    -- Ensure RLS is enabled
    ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

    -- Check which column exists and create policies accordingly
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'api_tokens' 
      AND column_name = 'user_id'
    ) THEN
      -- Use user_id column if it exists
      CREATE POLICY "api_tokens_select_own"
        ON public.api_tokens FOR SELECT
        USING (auth.uid() = user_id);

      CREATE POLICY "api_tokens_insert_own"
        ON public.api_tokens FOR INSERT
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "api_tokens_update_own"
        ON public.api_tokens FOR UPDATE
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

      CREATE POLICY "api_tokens_delete_own"
        ON public.api_tokens FOR DELETE
        USING (auth.uid() = user_id);
    ELSIF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'api_tokens' 
      AND column_name = 'created_by'
    ) THEN
      -- Use created_by column if it exists
      CREATE POLICY "api_tokens_select_own"
        ON public.api_tokens FOR SELECT
        USING (auth.uid() = created_by);

      CREATE POLICY "api_tokens_insert_own"
        ON public.api_tokens FOR INSERT
        WITH CHECK (auth.uid() = created_by);

      CREATE POLICY "api_tokens_update_own"
        ON public.api_tokens FOR UPDATE
        USING (auth.uid() = created_by)
        WITH CHECK (auth.uid() = created_by);

      CREATE POLICY "api_tokens_delete_own"
        ON public.api_tokens FOR DELETE
        USING (auth.uid() = created_by);
    END IF;
  END IF;
END $$;

-- =====================================================
-- 7. SUBSCRIPTIONS POLICIES (Admin-only validation)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "subscriptions_update_admin_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_admin_ceo" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_update_admin_only" ON public.subscriptions;
DROP POLICY IF EXISTS "subscriptions_select_own_or_admin" ON public.subscriptions;

-- Ensure RLS is enabled
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can see their own subscriptions
-- Admins can see all subscriptions (for validation)
CREATE POLICY "subscriptions_select_own_or_admin"
  ON public.subscriptions FOR SELECT
  USING (
    user_id = auth.uid() -- Users can see their own
    OR public.is_admin()
  );

-- Only Admins can update subscriptions (for validation)
-- Service role can also update (for system operations)
CREATE POLICY "subscriptions_update_admin_only"
  ON public.subscriptions FOR UPDATE
  USING (
    auth.role() = 'service_role' 
    OR public.is_admin()
  )
  WITH CHECK (
    auth.role() = 'service_role' 
    OR public.is_admin()
  );

-- =====================================================
-- 8. SUBSCRIPTION_PAYMENTS POLICIES (Admin-only validation)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "payments_select_admin_ceo" ON public.subscription_payments;
DROP POLICY IF EXISTS "payments_select_own_or_admin" ON public.subscription_payments;
DROP POLICY IF EXISTS "payments_update_admin_only" ON public.subscription_payments;

-- Ensure RLS is enabled
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Users can see their own payments
-- Admins can see all payments (for validation)
CREATE POLICY "payments_select_own_or_admin"
  ON public.subscription_payments FOR SELECT
  USING (
    user_id = auth.uid() -- Users can see their own
    OR public.is_admin()
  );

-- Only Admins can update payment status (for validation)
CREATE POLICY "payments_update_admin_only"
  ON public.subscription_payments FOR UPDATE
  USING (
    auth.role() = 'service_role' 
    OR public.is_admin()
  )
  WITH CHECK (
    auth.role() = 'service_role' 
    OR public.is_admin()
  );

-- =====================================================
-- 9. USER_PROFILES POLICIES (Admin access)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "admins_select_all_users" ON public.user_profiles;

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can see their own profile
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
CREATE POLICY "users_select_own_profile"
  ON public.user_profiles FOR SELECT
  USING (user_id = auth.uid());

-- Admins can see all user profiles
CREATE POLICY "admins_select_all_users"
  ON public.user_profiles FOR SELECT
  USING (public.is_admin());

-- Users can update their own profile
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;
CREATE POLICY "users_update_own_profile"
  ON public.user_profiles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Admins can update any user profile
DROP POLICY IF EXISTS "admins_update_all_users" ON public.user_profiles;
CREATE POLICY "admins_update_all_users"
  ON public.user_profiles FOR UPDATE
  USING (public.is_admin());

-- =====================================================
-- 10. STORAGE POLICIES (Payment Screenshots)
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins and CEOs can read all payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Admins can read all payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own payment screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own payment screenshots" ON storage.objects;

-- Only Admins can read payment screenshots (for validation)
CREATE POLICY "Admins can read all payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  public.is_admin()
);

-- Users can upload their own payment screenshots
CREATE POLICY "Users can upload their own payment screenshots"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'payment-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can read their own payment screenshots
CREATE POLICY "Users can read their own payment screenshots"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-screenshots' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- VERIFICATION - Show all policies
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
  AND tablename IN (
    'sales_agents', 
    'agent_kpi_settings', 
    'agent_daily_logs', 
    'agent_monthly_scores', 
    'break_even_records', 
    'api_tokens',
    'subscriptions',
    'subscription_payments',
    'user_profiles'
  )
ORDER BY tablename, cmd, policyname;

-- Verify storage policies
SELECT 
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN substring(qual::text, 1, 100)
    ELSE NULL
  END as using_clause
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%payment%'
ORDER BY policyname;


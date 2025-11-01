-- =====================================================
-- Clear ALL Data - Complete Fresh Start
-- Removes ALL data from ALL tables (except auth.users)
-- =====================================================
-- ⚠️ WARNING: This will delete ALL data including:
--   - All user profiles (you'll need to re-select roles)
--   - All subscriptions (you'll need to re-subscribe)
--   - All sales agents
--   - All logs, scores, settings
--   - Everything except auth.users (your login accounts)
-- =====================================================
-- Run this in Supabase SQL Editor
-- =====================================================

BEGIN;

-- Delete agent daily logs
DELETE FROM public.agent_daily_logs;
SELECT 'Deleted agent daily logs' as status;

-- Delete agent monthly scores
DELETE FROM public.agent_monthly_scores;
SELECT 'Deleted agent monthly scores' as status;

-- Delete sales agents
DELETE FROM public.sales_agents;
SELECT 'Deleted sales agents' as status;

-- Delete KPI settings
DELETE FROM public.agent_kpi_settings;
SELECT 'Deleted KPI settings' as status;

-- Delete notifications
DELETE FROM public.notifications;
SELECT 'Deleted notifications' as status;

-- Delete system logs
DELETE FROM public.system_logs;
SELECT 'Deleted system logs' as status;

-- Delete break-even records
DELETE FROM public.break_even_records;
SELECT 'Deleted break-even records' as status;

-- Delete subscription payments
DELETE FROM public.subscription_payments;
SELECT 'Deleted subscription payments' as status;

-- Delete pending subscription validations (if table exists, not a view)
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_name = 'pending_subscription_validations'
      AND table_type = 'BASE TABLE'
  ) THEN
    DELETE FROM public.pending_subscription_validations;
    RAISE NOTICE 'Deleted pending subscription validations';
  ELSE
    RAISE NOTICE 'pending_subscription_validations is a view, skipping';
  END IF;
END $$;

-- Delete subscriptions
DELETE FROM public.subscriptions;
SELECT 'Deleted subscriptions' as status;

-- Delete user profiles
DELETE FROM public.user_profiles;
SELECT 'Deleted user profiles' as status;

-- Delete teams (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'teams') THEN
    DELETE FROM public.teams;
    RAISE NOTICE 'Deleted teams';
  END IF;
END $$;

-- Delete branches (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'branches') THEN
    DELETE FROM public.branches;
    RAISE NOTICE 'Deleted branches';
  END IF;
END $$;

-- Delete organizations (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'organizations') THEN
    DELETE FROM public.organizations;
    RAISE NOTICE 'Deleted organizations';
  END IF;
END $$;

-- Delete API tokens (if table exists)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'api_tokens') THEN
    DELETE FROM public.api_tokens;
    RAISE NOTICE 'Deleted API tokens';
  END IF;
END $$;

COMMIT;

-- =====================================================
-- Verification - Show all counts
-- =====================================================

SELECT 
  'sales_agents' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.sales_agents
UNION ALL
SELECT 
  'agent_daily_logs' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.agent_daily_logs
UNION ALL
SELECT 
  'agent_monthly_scores' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.agent_monthly_scores
UNION ALL
SELECT 
  'agent_kpi_settings' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.agent_kpi_settings
UNION ALL
SELECT 
  'notifications' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.notifications
UNION ALL
SELECT 
  'system_logs' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.system_logs
UNION ALL
SELECT 
  'break_even_records' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.break_even_records
UNION ALL
SELECT 
  'subscription_payments' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.subscription_payments
-- Note: pending_subscription_validations is a view, not counted
UNION ALL
SELECT 
  'subscriptions' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.subscriptions
UNION ALL
SELECT 
  'user_profiles' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.user_profiles;

-- Final message
SELECT '✅ All data cleared! Ready for fresh start.' as status;


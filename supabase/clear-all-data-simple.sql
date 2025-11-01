-- =====================================================
-- Clear All Data - Fresh Start (Simple Version)
-- Removes all demo/test data from the database
-- =====================================================
-- This script deletes all data except user accounts and subscriptions
-- Run this in Supabase SQL Editor
-- =====================================================

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

-- Verification
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
  'user_profiles' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.user_profiles
UNION ALL
SELECT 
  'subscriptions' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.subscriptions;


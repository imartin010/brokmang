-- =====================================================
-- Clear All Data - Fresh Start
-- Removes all demo/test data from the database
-- =====================================================
-- WARNING: This will delete ALL data except:
--   - Users (auth.users)
--   - User profiles (user_profiles)
--   - Subscriptions (subscriptions)
-- =====================================================

BEGIN;

-- =====================================================
-- 1. DELETE AGENT DAILY LOGS
-- =====================================================
DELETE FROM public.agent_daily_logs;
RAISE NOTICE 'Deleted agent daily logs';

-- =====================================================
-- 2. DELETE AGENT MONTHLY SCORES
-- =====================================================
DELETE FROM public.agent_monthly_scores;
RAISE NOTICE 'Deleted agent monthly scores';

-- =====================================================
-- 3. DELETE SALES AGENTS
-- =====================================================
DELETE FROM public.sales_agents;
RAISE NOTICE 'Deleted sales agents';

-- =====================================================
-- 4. DELETE KPI SETTINGS
-- =====================================================
DELETE FROM public.agent_kpi_settings;
RAISE NOTICE 'Deleted KPI settings';

-- =====================================================
-- 5. DELETE NOTIFICATIONS
-- =====================================================
DELETE FROM public.notifications;
RAISE NOTICE 'Deleted notifications';

-- =====================================================
-- 6. DELETE SYSTEM LOGS (audit logs)
-- =====================================================
DELETE FROM public.system_logs;
RAISE NOTICE 'Deleted system logs';

-- =====================================================
-- 7. DELETE TEAMS (if they exist)
-- =====================================================
DELETE FROM public.teams;
RAISE NOTICE 'Deleted teams';

-- =====================================================
-- 8. DELETE BRANCHES (if they exist)
-- =====================================================
DELETE FROM public.branches;
RAISE NOTICE 'Deleted branches';

-- =====================================================
-- 9. DELETE ORGANIZATIONS (if they exist)
-- =====================================================
DELETE FROM public.organizations;
RAISE NOTICE 'Deleted organizations';

-- =====================================================
-- 10. RESET SEQUENCES (if any)
-- =====================================================
-- Reset any auto-increment sequences if needed
DO $$
DECLARE
  seq_record RECORD;
BEGIN
  FOR seq_record IN 
    SELECT sequence_name 
    FROM information_schema.sequences 
    WHERE sequence_schema = 'public'
  LOOP
    EXECUTE 'ALTER SEQUENCE ' || quote_ident(seq_record.sequence_name) || ' RESTART WITH 1';
  END LOOP;
END $$;
RAISE NOTICE 'Reset sequences';

COMMIT;

-- =====================================================
-- VERIFICATION
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
  'user_profiles' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.user_profiles
UNION ALL
SELECT 
  'subscriptions' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.subscriptions;

RAISE NOTICE '';
RAISE NOTICE '✅ All data cleared successfully!';
RAISE NOTICE '   Users, user profiles, and subscriptions are preserved.';
RAISE NOTICE '';
RAISE NOTICE '🎉 Ready for fresh start!';


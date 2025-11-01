-- =====================================================
-- Comprehensive Database Audit
-- Checks all tables, columns, RLS policies, and conflicts
-- =====================================================

-- =====================================================
-- 1. LIST ALL TABLES
-- =====================================================
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 2. CHECK COLUMN STRUCTURES FOR KEY TABLES
-- =====================================================

-- Check sales_agents table structure
SELECT 
  'sales_agents' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default,
  character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales_agents'
ORDER BY ordinal_position;

-- Check user_profiles table structure
SELECT 
  'user_profiles' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check subscriptions table structure
SELECT 
  'subscriptions' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Check agent_daily_logs table structure
SELECT 
  'agent_daily_logs' as table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'agent_daily_logs'
ORDER BY ordinal_position;

-- =====================================================
-- 3. CHECK FOR MISSING COLUMNS (Potential Conflicts)
-- =====================================================

-- Check if sales_agents has 'name' column (should NOT exist, should have 'full_name')
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'sales_agents' 
        AND column_name = 'name'
    ) THEN 'CONFLICT: sales_agents has "name" column (should use "full_name")'
    ELSE 'OK: sales_agents does not have "name" column'
  END as status;

-- Check if sales_agents has 'full_name' column (should exist)
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'sales_agents' 
        AND column_name = 'full_name'
    ) THEN 'OK: sales_agents has "full_name" column'
    ELSE 'CONFLICT: sales_agents missing "full_name" column'
  END as status;

-- Check if tables have org_id columns (might cause issues if removed)
SELECT 
  table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = t.table_name 
        AND column_name = 'org_id'
    ) THEN 'HAS org_id'
    ELSE 'NO org_id'
  END as org_id_status
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'sales_agents', 
    'agent_daily_logs', 
    'agent_monthly_scores',
    'subscriptions',
    'notifications',
    'system_logs',
    'break_even_records'
  )
ORDER BY table_name;

-- =====================================================
-- 4. CHECK RLS POLICIES
-- =====================================================

-- List all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check if RLS is enabled on key tables
SELECT 
  t.table_name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_tables pt
      WHERE pt.schemaname = 'public'
        AND pt.tablename = t.table_name
        AND EXISTS (
          SELECT 1 FROM pg_class c
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public'
            AND c.relname = t.table_name
            AND c.relrowsecurity = true
        )
    ) THEN 'RLS ENABLED'
    ELSE 'RLS DISABLED'
  END as rls_status
FROM information_schema.tables t
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND t.table_name IN (
    'sales_agents',
    'user_profiles',
    'subscriptions',
    'agent_daily_logs',
    'agent_monthly_scores',
    'agent_kpi_settings'
  )
ORDER BY t.table_name;

-- =====================================================
-- 5. CHECK FOREIGN KEY CONSTRAINTS
-- =====================================================

SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- =====================================================
-- 6. CHECK FOR DUPLICATE INDEXES
-- =====================================================

SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- =====================================================
-- 7. CHECK TABLE ROW COUNTS
-- =====================================================

SELECT 
  'sales_agents' as table_name,
  COUNT(*) as row_count
FROM public.sales_agents
UNION ALL
SELECT 
  'user_profiles',
  COUNT(*)
FROM public.user_profiles
UNION ALL
SELECT 
  'subscriptions',
  COUNT(*)
FROM public.subscriptions
UNION ALL
SELECT 
  'agent_daily_logs',
  COUNT(*)
FROM public.agent_daily_logs
UNION ALL
SELECT 
  'agent_monthly_scores',
  COUNT(*)
FROM public.agent_monthly_scores
UNION ALL
SELECT 
  'agent_kpi_settings',
  COUNT(*)
FROM public.agent_kpi_settings
UNION ALL
SELECT 
  'notifications',
  COUNT(*)
FROM public.notifications
UNION ALL
SELECT 
  'system_logs',
  COUNT(*)
FROM public.system_logs;

-- =====================================================
-- 8. CHECK FOR POTENTIAL CONFLICTS
-- =====================================================

-- Check if any tables reference non-existent columns in indexes
SELECT 
  i.indexname,
  i.tablename,
  a.attname as column_name,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.columns c
      WHERE c.table_schema = 'public'
        AND c.table_name = i.tablename
        AND c.column_name = a.attname
    ) THEN 'CONFLICT: Index references missing column'
    ELSE 'OK'
  END as status
FROM pg_indexes i
JOIN pg_class t ON t.relname = i.indexname
JOIN pg_index idx ON idx.indexrelid = t.oid
JOIN pg_attribute a ON a.attrelid = idx.indrelid AND a.attnum = ANY(idx.indkey)
WHERE i.schemaname = 'public'
  AND i.indexname NOT LIKE 'pg_%'
GROUP BY i.indexname, i.tablename, a.attname;


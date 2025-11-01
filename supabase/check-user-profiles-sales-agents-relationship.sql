-- =====================================================
-- Check Relationship Between user_profiles and sales_agents
-- Verifies structure, relationships, and conflicts
-- =====================================================

-- 1. Check user_profiles table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- 2. Check sales_agents table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'sales_agents'
ORDER BY ordinal_position;

-- 3. Check for foreign key relationships
SELECT
  tc.table_name as source_table,
  kcu.column_name as source_column,
  ccu.table_name as target_table,
  ccu.column_name as target_column,
  tc.constraint_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND (tc.table_name = 'user_profiles' OR tc.table_name = 'sales_agents')
ORDER BY tc.table_name, kcu.column_name;

-- 4. Check current data - Users in user_profiles
SELECT 
  'user_profiles' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM public.user_profiles;

-- 5. Check current data - Users in sales_agents
SELECT 
  'sales_agents' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_id) as unique_users
FROM public.sales_agents;

-- 6. Check overlap - Users in BOTH tables
SELECT 
  up.user_id,
  up.user_type,
  up.full_name as profile_name,
  sa.id as agent_id,
  sa.full_name as agent_name,
  sa.is_active
FROM public.user_profiles up
INNER JOIN public.sales_agents sa ON up.user_id = sa.user_id;

-- 7. Check users ONLY in user_profiles (not in sales_agents)
SELECT 
  up.user_id,
  up.user_type,
  up.full_name,
  'Only in user_profiles' as status
FROM public.user_profiles up
LEFT JOIN public.sales_agents sa ON up.user_id = sa.user_id
WHERE sa.id IS NULL;

-- 8. Check users ONLY in sales_agents (not in user_profiles) - POTENTIAL ISSUE
SELECT 
  sa.user_id,
  sa.full_name,
  sa.is_active,
  'Only in sales_agents (missing profile!)' as status
FROM public.sales_agents sa
LEFT JOIN public.user_profiles up ON sa.user_id = up.user_id
WHERE up.id IS NULL;

-- 9. Check for name conflicts (different full_name values)
SELECT 
  up.user_id,
  up.full_name as profile_name,
  sa.full_name as agent_name,
  CASE 
    WHEN up.full_name != sa.full_name THEN 'CONFLICT: Names differ'
    ELSE 'OK: Names match'
  END as name_status
FROM public.user_profiles up
INNER JOIN public.sales_agents sa ON up.user_id = sa.user_id
WHERE up.full_name != sa.full_name;

-- 10. Verify RLS policies for both tables
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_profiles', 'sales_agents')
ORDER BY tablename, policyname;


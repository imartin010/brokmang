-- ============================================
-- EXPERT QUICK FIX - Run This Single Script
-- ============================================
-- This fixes the infinite recursion in RLS policies
-- Run as a single transaction in Supabase SQL Editor
-- ============================================

BEGIN;

-- Step 1: Disable RLS completely
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop ALL existing policies
DO $$ 
DECLARE 
  r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname 
    FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'sales_agents'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sales_agents', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- Step 3: Remove duplicate rows (keep most recent per user_id)
DELETE FROM public.sales_agents
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.sales_agents
  ORDER BY user_id, created_at DESC NULLS LAST
);

-- Step 4: Create unique index on user_id
DROP INDEX IF EXISTS sales_agents_user_id_uidx CASCADE;
CREATE UNIQUE INDEX sales_agents_user_id_uidx ON public.sales_agents (user_id) 
WHERE user_id IS NOT NULL;

-- Step 5: Re-enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Step 6: Create simple, non-recursive policies
CREATE POLICY "users_select_own_row" ON public.sales_agents
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_row" ON public.sales_agents
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_row" ON public.sales_agents
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 7: Verification
DO $$
DECLARE
  policy_count INTEGER;
  duplicate_count INTEGER;
  index_exists BOOLEAN;
BEGIN
  -- Count policies
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE tablename = 'sales_agents';
  
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id 
    FROM sales_agents 
    WHERE user_id IS NOT NULL
    GROUP BY user_id 
    HAVING COUNT(*) > 1
  ) dups;
  
  -- Check index
  SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'sales_agents' 
      AND indexname = 'sales_agents_user_id_uidx'
  ) INTO index_exists;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'VERIFICATION RESULTS:';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'RLS policies: % (expected: 3)', policy_count;
  RAISE NOTICE 'Duplicate user_ids: % (expected: 0)', duplicate_count;
  RAISE NOTICE 'Unique index exists: % (expected: true)', index_exists;
  RAISE NOTICE '===========================================';
  
  IF policy_count != 3 THEN
    RAISE EXCEPTION 'Expected 3 policies, found %', policy_count;
  END IF;
  
  IF duplicate_count > 0 THEN
    RAISE EXCEPTION 'Still have % duplicate user_ids', duplicate_count;
  END IF;
  
  IF NOT index_exists THEN
    RAISE EXCEPTION 'Unique index not created';
  END IF;
  
  RAISE NOTICE '✅ ALL CHECKS PASSED - FIX SUCCESSFUL!';
END $$;

COMMIT;

-- ============================================
-- Post-Fix Test Queries
-- ============================================

-- Test 1: Verify policies (should show 3)
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'sales_agents';

-- Test 2: Verify no duplicates (should show 0 rows)
SELECT user_id, COUNT(*) FROM sales_agents GROUP BY user_id HAVING COUNT(*) > 1;

-- Test 3: Verify index exists (should show 1 row)
SELECT indexname FROM pg_indexes WHERE tablename = 'sales_agents' AND indexname = 'sales_agents_user_id_uidx';

-- Test 4: Test SELECT as authenticated user
SELECT * FROM sales_agents WHERE user_id = auth.uid();

-- ============================================
-- Expected Results After Fix:
-- ============================================
-- ✅ VERIFICATION RESULTS:
-- ✅ RLS policies: 3 (expected: 3)
-- ✅ Duplicate user_ids: 0 (expected: 0)
-- ✅ Unique index exists: true (expected: true)
-- ✅ ALL CHECKS PASSED - FIX SUCCESSFUL!
-- ============================================


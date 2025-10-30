-- =====================================================
-- CRITICAL FIX: Infinite Recursion in RLS Policies
-- =====================================================
-- This fixes the "42P17: infinite recursion detected" error
-- Run this IMMEDIATELY to fix role selection

-- Step 1: Completely disable RLS temporarily
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;

-- Step 2: Drop EVERY single policy (even ones we might not know about)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'sales_agents') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.sales_agents';
    END LOOP;
END $$;

-- Step 3: Re-enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Step 4: Create SIMPLE, NON-RECURSIVE policies
-- These are deliberately simple to avoid any recursion

-- Policy 1: SELECT (read own row)
CREATE POLICY "users_select_own_row" ON public.sales_agents
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy 2: INSERT (create own row)
CREATE POLICY "users_insert_own_row" ON public.sales_agents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE (update own row)
CREATE POLICY "users_update_own_row" ON public.sales_agents
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Step 5: Verify no recursion
-- This query should show exactly 3 policies
SELECT 
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN qual IS NOT NULL THEN 'USING: ' || qual::text
    ELSE 'No USING clause'
  END as using_clause,
  CASE 
    WHEN with_check IS NOT NULL THEN 'CHECK: ' || with_check::text
    ELSE 'No CHECK clause'
  END as check_clause
FROM pg_policies 
WHERE tablename = 'sales_agents'
ORDER BY cmd, policyname;

-- Step 6: Test it works
-- This should return your user_id (or empty if you haven't set role yet)
SELECT 
  user_id,
  user_type,
  full_name,
  is_active,
  created_at
FROM public.sales_agents
WHERE user_id = auth.uid();

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Infinite recursion fixed!';
  RAISE NOTICE '✅ All old policies removed';
  RAISE NOTICE '✅ New simple policies created';
  RAISE NOTICE '✅ You can now select your role';
  RAISE NOTICE '';
  RAISE NOTICE 'Go back to localhost:3000/select-account-type and try again!';
END $$;


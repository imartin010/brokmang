-- ============================================
-- Fix sales_agents RLS Recursion
-- Date: 2025-10-30
-- Purpose: Remove infinite recursion in RLS policies
-- ============================================

BEGIN;

-- 1) Temporarily disable RLS
ALTER TABLE public.sales_agents DISABLE ROW LEVEL SECURITY;

-- 2) Drop ALL policies dynamically
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN (
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sales_agents'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.sales_agents', r.policyname);
    RAISE NOTICE 'Dropped policy: %', r.policyname;
  END LOOP;
END $$;

-- 3) Remove duplicate rows (keep most recent per user_id)
DELETE FROM public.sales_agents
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM public.sales_agents
  ORDER BY user_id, created_at DESC NULLS LAST
);

-- 4) Recreate unique index (partial) on user_id
DROP INDEX IF EXISTS sales_agents_user_id_uidx CASCADE;
CREATE UNIQUE INDEX sales_agents_user_id_uidx ON public.sales_agents (user_id)
WHERE user_id IS NOT NULL;

-- 5) Re-enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- 6) Simple, non-recursive policies (own row only)
CREATE POLICY "users_select_own_row" ON public.sales_agents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_row" ON public.sales_agents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_row" ON public.sales_agents
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7) Verification
DO $$
DECLARE
  policy_count int;
  duplicate_count int;
  index_exists boolean;
BEGIN
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'sales_agents';
  SELECT COUNT(*) INTO duplicate_count FROM (
    SELECT user_id FROM public.sales_agents
    WHERE user_id IS NOT NULL
    GROUP BY user_id HAVING COUNT(*) > 1
  ) d;

  SELECT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'sales_agents' AND indexname = 'sales_agents_user_id_uidx'
  ) INTO index_exists;

  RAISE NOTICE 'RLS policies: % (expected 3)', policy_count;
  RAISE NOTICE 'Duplicate user_ids: % (expected 0)', duplicate_count;
  RAISE NOTICE 'Unique index exists: %', index_exists;

  IF policy_count != 3 THEN RAISE EXCEPTION 'Expected 3 policies, found %', policy_count; END IF;
  IF duplicate_count > 0 THEN RAISE EXCEPTION 'Duplicate user_ids remain: %', duplicate_count; END IF;
  IF NOT index_exists THEN RAISE EXCEPTION 'Unique index not created'; END IF;

  RAISE NOTICE '✅ ALL CHECKS PASSED - FIX SUCCESSFUL!';
END $$;

COMMIT;


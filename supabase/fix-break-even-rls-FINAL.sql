-- Fix RLS Policies for break_even_records
-- This script will work even if policies already exist

BEGIN;

-- Drop ALL existing policies on break_even_records automatically
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'break_even_records') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.break_even_records', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE public.break_even_records ENABLE ROW LEVEL SECURITY;

-- Create simple, working policies
CREATE POLICY "break_even_select_own"
  ON public.break_even_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "break_even_insert_own"
  ON public.break_even_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "break_even_delete_own"
  ON public.break_even_records FOR DELETE
  USING (auth.uid() = user_id);

COMMIT;

-- Verify policies were created (should show 3 policies)
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'break_even_records'
ORDER BY policyname;


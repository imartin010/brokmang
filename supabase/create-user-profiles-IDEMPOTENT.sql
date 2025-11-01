-- ============================================
-- IDEMPOTENT SQL - Safe to run multiple times
-- Creates user_profiles table and policies
-- ============================================

BEGIN;

-- Create table if not exists
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('ceo', 'team_leader')),
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index if not exists
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_uidx ON public.user_profiles (user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if they exist) before creating new ones
DROP POLICY IF EXISTS "users_select_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON public.user_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON public.user_profiles;

-- Create policies
CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Verification
DO $$
DECLARE
  table_exists boolean;
  policy_count int;
  index_exists boolean;
BEGIN
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') INTO table_exists;
  SELECT COUNT(*) INTO policy_count FROM pg_policies WHERE tablename = 'user_profiles';
  SELECT EXISTS (SELECT 1 FROM pg_indexes WHERE tablename = 'user_profiles' AND indexname = 'user_profiles_user_id_uidx') INTO index_exists;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'VERIFICATION RESULTS';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Table exists: % (expected: true)', table_exists;
  RAISE NOTICE 'RLS policies: % (expected: 3)', policy_count;
  RAISE NOTICE 'Unique index: % (expected: true)', index_exists;
  RAISE NOTICE '===========================================';
  
  IF NOT table_exists THEN RAISE EXCEPTION 'Table not created!'; END IF;
  IF policy_count != 3 THEN RAISE EXCEPTION 'Expected 3 policies, found %', policy_count; END IF;
  IF NOT index_exists THEN RAISE EXCEPTION 'Unique index not created!'; END IF;
  
  RAISE NOTICE '✅ SUCCESS! user_profiles table is ready!';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;


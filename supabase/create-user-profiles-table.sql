-- ============================================
-- Create user_profiles table
-- Simple table to store user role and basic info
-- ============================================

BEGIN;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type text NOT NULL CHECK (user_type IN ('ceo', 'team_leader')),
  full_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unique index
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_user_id_uidx ON public.user_profiles (user_id);

-- Create index on user_type for filtering
CREATE INDEX IF NOT EXISTS user_profiles_user_type_idx ON public.user_profiles (user_type);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies (own row only)
CREATE POLICY "users_select_own_profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "users_insert_own_profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users_update_own_profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime (optional)
ALTER TABLE public.user_profiles REPLICA IDENTITY FULL;

-- Add to realtime publication (optional)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'user_profiles'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_profiles;
  END IF;
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Realtime publication already includes user_profiles or error: %', SQLERRM;
END $$;

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
  RAISE NOTICE 'USER_PROFILES TABLE VERIFICATION';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Table exists: % (expected: true)', table_exists;
  RAISE NOTICE 'RLS policies: % (expected: 3)', policy_count;
  RAISE NOTICE 'Unique index exists: % (expected: true)', index_exists;
  
  IF NOT table_exists THEN RAISE EXCEPTION 'Table not created!'; END IF;
  IF policy_count != 3 THEN RAISE EXCEPTION 'Expected 3 policies, found %', policy_count; END IF;
  IF NOT index_exists THEN RAISE EXCEPTION 'Unique index not created!'; END IF;
  
  RAISE NOTICE '✅ ALL CHECKS PASSED - TABLE READY!';
  RAISE NOTICE '===========================================';
END $$;

COMMIT;

-- Show table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;


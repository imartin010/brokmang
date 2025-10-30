-- =====================================================
-- User Type Migration (Fixed - Handles Duplicates)
-- =====================================================

-- Step 1: Check for duplicate user_id entries
DO $$ 
DECLARE
  duplicate_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM public.sales_agents
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;

  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % duplicate user_id entries. Will keep the most recent one.', duplicate_count;
  END IF;
END $$;

-- Step 2: Remove duplicate entries (keep only the most recent one per user_id)
DELETE FROM public.sales_agents
WHERE id IN (
  SELECT id
  FROM (
    SELECT id,
           ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at DESC) as rn
    FROM public.sales_agents
    WHERE user_id IS NOT NULL
  ) ranked
  WHERE rn > 1
);

-- Step 3: Ensure user_type column exists with proper constraints
ALTER TABLE public.sales_agents 
ADD COLUMN IF NOT EXISTS user_type text CHECK (user_type IN ('ceo', 'team_leader', 'CEO', 'TeamLeader'));

-- Step 4: Ensure user_id column exists (should already exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'sales_agents' 
    AND column_name = 'user_id'
  ) THEN
    ALTER TABLE public.sales_agents 
    ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Step 5: Now create unique index (should work after removing duplicates)
DROP INDEX IF EXISTS sales_agents_user_id_uidx;
CREATE UNIQUE INDEX sales_agents_user_id_uidx ON public.sales_agents (user_id);

-- Step 6: Enable realtime
ALTER TABLE public.sales_agents REPLICA IDENTITY FULL;

-- Step 7: Add to realtime publication (idempotent)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'sales_agents'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.sales_agents';
  END IF;
END $$;

-- =====================================================
-- Row Level Security Policies
-- =====================================================

-- Enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
DROP POLICY IF EXISTS "select own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "update own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "insert self row" ON public.sales_agents;

-- Each user can select only their row
CREATE POLICY "select own agent row" ON public.sales_agents
FOR SELECT 
USING (auth.uid() = user_id);

-- Each user can update only their row
CREATE POLICY "update own agent row" ON public.sales_agents
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can insert their own row
CREATE POLICY "insert self row" ON public.sales_agents
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Verification & Summary
-- =====================================================

-- Show summary
DO $$ 
DECLARE
  total_records INTEGER;
  records_with_user_id INTEGER;
  records_with_user_type INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_records FROM public.sales_agents;
  SELECT COUNT(*) INTO records_with_user_id FROM public.sales_agents WHERE user_id IS NOT NULL;
  SELECT COUNT(*) INTO records_with_user_type FROM public.sales_agents WHERE user_type IS NOT NULL;
  
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Migration Complete!';
  RAISE NOTICE '===========================================';
  RAISE NOTICE 'Total sales_agents records: %', total_records;
  RAISE NOTICE 'Records with user_id: %', records_with_user_id;
  RAISE NOTICE 'Records with user_type: %', records_with_user_type;
  RAISE NOTICE '===========================================';
END $$;

-- Verification queries (run these separately after migration):
-- 
-- 1. Check if realtime is enabled:
-- SELECT schemaname, tablename FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime' AND tablename = 'sales_agents';
--
-- 2. Check for any remaining duplicates:
-- SELECT user_id, COUNT(*) as cnt
-- FROM public.sales_agents
-- WHERE user_id IS NOT NULL
-- GROUP BY user_id
-- HAVING COUNT(*) > 1;
--
-- 3. Check user_type values:
-- SELECT user_id, user_type FROM public.sales_agents LIMIT 10;


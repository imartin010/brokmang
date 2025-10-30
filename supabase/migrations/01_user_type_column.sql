-- =====================================================
-- User Type Migration
-- Ensures user_type column exists and is properly configured
-- =====================================================

-- Ensure user_type column exists with proper constraints
-- Note: We keep existing 'ceo' and 'team_leader' values for compatibility
-- The frontend will map these to 'CEO' and 'TeamLeader' types
ALTER TABLE public.sales_agents 
ADD COLUMN IF NOT EXISTS user_type text CHECK (user_type IN ('ceo', 'team_leader', 'CEO', 'TeamLeader'));

-- Ensure user_id column exists (should already exist from previous migrations)
-- This is the link to auth.users
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

-- Create unique index on user_id if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS sales_agents_user_id_uidx 
ON public.sales_agents (user_id);

-- Enable realtime (idempotent)
ALTER TABLE public.sales_agents REPLICA IDENTITY FULL;

-- Add table to realtime publication (idempotent - will fail silently if already added)
DO $$ 
BEGIN
  -- Check if table is already in publication
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

-- Enable RLS (idempotent)
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist (to avoid conflicts)
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
-- Verification Queries
-- =====================================================
-- Run these to verify the migration:
--
-- 1. Check if realtime is enabled:
-- SELECT schemaname, tablename FROM pg_publication_tables 
-- WHERE pubname = 'supabase_realtime' AND tablename = 'sales_agents';
--
-- 2. Check user_type values:
-- SELECT user_id, user_type FROM public.sales_agents LIMIT 10;
--
-- 3. Check RLS policies:
-- SELECT policyname, cmd, qual FROM pg_policies 
-- WHERE tablename = 'sales_agents';
-- =====================================================


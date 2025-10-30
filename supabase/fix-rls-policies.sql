-- =====================================================
-- Quick Fix: RLS Policies for sales_agents
-- Run this if you're getting "Error setting user type"
-- =====================================================

-- Enable RLS
ALTER TABLE public.sales_agents ENABLE ROW LEVEL SECURITY;

-- Drop ALL old policies
DROP POLICY IF EXISTS "select own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "update own agent row" ON public.sales_agents;
DROP POLICY IF EXISTS "insert self row" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_select_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_delete_own" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_select_org_member" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_insert_manager" ON public.sales_agents;
DROP POLICY IF EXISTS "agents_update_manager" ON public.sales_agents;

-- Create new simple policies
-- 1. Users can SELECT their own row
CREATE POLICY "select own agent row" ON public.sales_agents
FOR SELECT 
USING (auth.uid() = user_id);

-- 2. Users can INSERT their own row
CREATE POLICY "insert self row" ON public.sales_agents
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 3. Users can UPDATE their own row
CREATE POLICY "update own agent row" ON public.sales_agents
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'sales_agents'
ORDER BY policyname;

-- Test: Try to select your own data (should work)
SELECT user_id, user_type, full_name 
FROM public.sales_agents 
WHERE user_id = auth.uid();


-- Migration: Add role and team leader to sales_agents
-- Run this in your Supabase SQL Editor

-- Step 1: Add role column
ALTER TABLE public.sales_agents 
ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'agent' 
CHECK (role IN ('agent', 'team_leader'));

-- Step 2: Add team_leader_id column (references another agent who is a team leader)
ALTER TABLE public.sales_agents 
ADD COLUMN IF NOT EXISTS team_leader_id uuid REFERENCES public.sales_agents(id) ON DELETE SET NULL;

-- Step 3: Create index for team_leader_id
CREATE INDEX IF NOT EXISTS idx_sales_agents_team_leader_id ON public.sales_agents(team_leader_id);

-- Step 4: Add constraint to ensure agents (not team leaders) have a team leader
-- Note: This constraint is optional - you can remove it if you want to allow agents without team leaders initially
-- ALTER TABLE public.sales_agents 
-- ADD CONSTRAINT check_agent_has_team_leader 
-- CHECK (role = 'team_leader' OR team_leader_id IS NOT NULL);

-- Step 5: Drop the old team_id column if you're not using it
-- ALTER TABLE public.sales_agents DROP COLUMN IF EXISTS team_id;

-- Note: If you want to migrate existing data:
-- UPDATE public.sales_agents SET role = 'agent' WHERE role IS NULL;


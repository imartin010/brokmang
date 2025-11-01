-- =====================================================
-- Add UNIQUE constraint, triggers for sales_agents
-- Ensures data integrity between user_profiles and sales_agents
-- =====================================================

-- 1. Add UNIQUE constraint on sales_agents.user_id
-- (Ensure one sales_agent record per user)
-- =====================================================

-- First, check if there are any duplicate user_ids and handle them
DO $$
DECLARE
  duplicate_count INTEGER;
BEGIN
  -- Count duplicates
  SELECT COUNT(*) INTO duplicate_count
  FROM (
    SELECT user_id, COUNT(*) as cnt
    FROM public.sales_agents
    GROUP BY user_id
    HAVING COUNT(*) > 1
  ) duplicates;
  
  IF duplicate_count > 0 THEN
    RAISE NOTICE 'Found % duplicate user_ids. Keeping the most recent record per user_id.', duplicate_count;
    
    -- Delete duplicates, keeping the most recent (by created_at)
    DELETE FROM public.sales_agents
    WHERE id NOT IN (
      SELECT DISTINCT ON (user_id) id
      FROM public.sales_agents
      ORDER BY user_id, created_at DESC
    );
  END IF;
END $$;

-- Drop existing index if it exists (we'll create a UNIQUE constraint instead)
DROP INDEX IF EXISTS idx_sales_agents_user_id;
DROP INDEX IF EXISTS sales_agents_user_id_uidx;

-- Add UNIQUE constraint (creates unique index automatically)
ALTER TABLE public.sales_agents
ADD CONSTRAINT sales_agents_user_id_unique UNIQUE (user_id);

-- Create regular index for performance (UNIQUE constraint already creates index, but keep for clarity)
CREATE INDEX IF NOT EXISTS idx_sales_agents_user_id ON public.sales_agents(user_id);

-- =====================================================
-- 2. Trigger to ensure user_profiles exist when sales_agents are created
-- =====================================================

CREATE OR REPLACE FUNCTION ensure_user_profile_exists()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user_profile exists for this user_id
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = NEW.user_id
  ) THEN
    -- Create a basic user_profile if it doesn't exist
    INSERT INTO public.user_profiles (user_id, full_name, user_type)
    VALUES (NEW.user_id, NEW.full_name, 'team_leader') -- Default to team_leader, can be updated later
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Created user_profile for user_id % with default type team_leader', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_ensure_user_profile_exists ON public.sales_agents;

-- Create trigger on INSERT
CREATE TRIGGER trigger_ensure_user_profile_exists
  BEFORE INSERT ON public.sales_agents
  FOR EACH ROW
  EXECUTE FUNCTION ensure_user_profile_exists();

-- =====================================================
-- 3. Optional: Sync full_name updates between tables
-- =====================================================

-- Function to sync full_name from sales_agents to user_profiles
CREATE OR REPLACE FUNCTION sync_full_name_to_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user_profiles.full_name when sales_agents.full_name changes
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    UPDATE public.user_profiles
    SET full_name = NEW.full_name,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    RAISE NOTICE 'Synced full_name to user_profile for user_id %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_sync_full_name_to_profile ON public.sales_agents;

-- Create trigger on UPDATE
CREATE TRIGGER trigger_sync_full_name_to_profile
  AFTER UPDATE ON public.sales_agents
  FOR EACH ROW
  WHEN (NEW.full_name IS DISTINCT FROM OLD.full_name)
  EXECUTE FUNCTION sync_full_name_to_profile();

-- Function to sync full_name from user_profiles to sales_agents
CREATE OR REPLACE FUNCTION sync_full_name_to_agent()
RETURNS TRIGGER AS $$
BEGIN
  -- Update sales_agents.full_name when user_profiles.full_name changes
  IF NEW.full_name IS DISTINCT FROM OLD.full_name THEN
    UPDATE public.sales_agents
    SET full_name = NEW.full_name
    WHERE user_id = NEW.user_id;
    
    RAISE NOTICE 'Synced full_name to sales_agent for user_id %', NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists (for idempotency)
DROP TRIGGER IF EXISTS trigger_sync_full_name_to_agent ON public.user_profiles;

-- Create trigger on UPDATE
CREATE TRIGGER trigger_sync_full_name_to_agent
  AFTER UPDATE ON public.user_profiles
  FOR EACH ROW
  WHEN (NEW.full_name IS DISTINCT FROM OLD.full_name)
  EXECUTE FUNCTION sync_full_name_to_agent();

-- =====================================================
-- Verification
-- =====================================================

-- Verify UNIQUE constraint exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'sales_agents_user_id_unique'
  ) THEN
    RAISE NOTICE '✅ UNIQUE constraint on sales_agents.user_id created successfully';
  ELSE
    RAISE WARNING '❌ UNIQUE constraint not found';
  END IF;
END $$;

-- Verify triggers exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_ensure_user_profile_exists'
  ) THEN
    RAISE NOTICE '✅ Trigger ensure_user_profile_exists created successfully';
  ELSE
    RAISE WARNING '❌ Trigger ensure_user_profile_exists not found';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_sync_full_name_to_profile'
  ) THEN
    RAISE NOTICE '✅ Trigger sync_full_name_to_profile created successfully';
  ELSE
    RAISE WARNING '❌ Trigger sync_full_name_to_profile not found';
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_sync_full_name_to_agent'
  ) THEN
    RAISE NOTICE '✅ Trigger sync_full_name_to_agent created successfully';
  ELSE
    RAISE WARNING '❌ Trigger sync_full_name_to_agent not found';
  END IF;
END $$;


-- =====================================================
-- Add User Type to Profiles
-- =====================================================
-- Extends user profiles to include account type:
--   - "ceo" - Full access (financial + sales/KPI)
--   - "team_leader" - Limited access (sales/KPI only)
-- =====================================================

-- Create enum for user types (if not exists)
DO $$ BEGIN
  CREATE TYPE user_account_type AS ENUM ('ceo', 'team_leader');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add user_type column to sales_agents table (main user table)
ALTER TABLE sales_agents
ADD COLUMN IF NOT EXISTS user_type user_account_type DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN sales_agents.user_type IS 'Account type: ceo (full access) or team_leader (sales/KPI only)';

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_sales_agents_user_type ON sales_agents(user_type);

-- =====================================================
-- Helper Function: Get User Type
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_type(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_user_type TEXT;
BEGIN
  SELECT user_type::TEXT INTO v_user_type
  FROM sales_agents
  WHERE user_id = p_user_id
  LIMIT 1;
  
  RETURN v_user_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- Update existing users to NULL (will be prompted to set)
-- =====================================================

-- All existing users will have NULL user_type
-- They will be prompted to select their type on next login

-- =====================================================
-- Notes
-- =====================================================
-- 
-- CEO Access:
--   ✅ Financial Tools (Break-even Analysis)
--   ✅ Sales Performance & KPIs
--   ✅ Reports (all types)
--   ✅ Smart Insights
--   ✅ Organization Settings
--
-- Team Leader Access:
--   ❌ Financial Tools (Break-even Analysis) - HIDDEN
--   ✅ Sales Performance & KPIs
--   ✅ Reports (sales/KPI only)
--   ✅ Smart Insights
--   ✅ Limited Org Settings
--
-- =====================================================


-- =====================================================
-- Remove Organizations - Complete Removal Migration
-- This removes all organization-related tables and columns
-- =====================================================

-- Step 1: Drop all organization-related tables and their dependencies
DROP TABLE IF EXISTS public.memberships CASCADE;
DROP TABLE IF EXISTS public.branches CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.org_finance_settings CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;
DROP TABLE IF EXISTS public.onboarding_state CASCADE;

-- Step 2: Drop organization-related functions
DROP FUNCTION IF EXISTS public.get_user_organizations(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.user_has_org_permission(UUID, UUID, TEXT) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role_in_org(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS public.user_org_ids() CASCADE;

-- Step 3: Remove org_id columns from sales_agents
ALTER TABLE public.sales_agents 
  DROP COLUMN IF EXISTS org_id CASCADE,
  DROP COLUMN IF EXISTS branch_id CASCADE,
  DROP COLUMN IF EXISTS team_id CASCADE;

-- Drop indexes related to org_id
DROP INDEX IF EXISTS idx_sales_agents_org;
DROP INDEX IF EXISTS idx_sales_agents_branch;
DROP INDEX IF EXISTS idx_sales_agents_team;

-- Step 4: Remove org_id from agent_kpi_settings
ALTER TABLE public.agent_kpi_settings
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_agent_kpi_settings_org;

-- Step 5: Remove org_id from agent_daily_logs
ALTER TABLE public.agent_daily_logs
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_agent_daily_logs_org;

-- Step 6: Remove org_id from agent_monthly_scores
ALTER TABLE public.agent_monthly_scores
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_agent_monthly_scores_org;

-- Step 7: Remove org_id from break_even_records
ALTER TABLE public.break_even_records
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_break_even_records_org;

-- Step 8: Remove org_id from notifications
ALTER TABLE public.notifications
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_notifications_org;

-- Step 9: Remove org_id from system_logs
ALTER TABLE public.system_logs
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_system_logs_org;

-- Step 10: Remove org_id from api_tokens
ALTER TABLE public.api_tokens
  DROP COLUMN IF EXISTS org_id CASCADE;

DROP INDEX IF EXISTS idx_api_tokens_org;

-- Step 11: Drop all RLS policies that reference organizations
-- (These will be recreated in a simplified form if needed)

-- Note: All RLS policies that check org_id will need to be updated
-- This script removes the organization structure, but you may need to 
-- recreate RLS policies based on user_id only

COMMENT ON TABLE public.sales_agents IS 'Sales agents - no longer multi-tenant';
COMMENT ON TABLE public.agent_kpi_settings IS 'Agent KPI settings - no longer multi-tenant';
COMMENT ON TABLE public.agent_daily_logs IS 'Agent daily logs - no longer multi-tenant';
COMMENT ON TABLE public.agent_monthly_scores IS 'Agent monthly scores - no longer multi-tenant';
COMMENT ON TABLE public.break_even_records IS 'Break-even records - no longer multi-tenant';


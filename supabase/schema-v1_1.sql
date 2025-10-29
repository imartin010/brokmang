-- =====================================================
-- Brokmang. v1.1 Database Schema Migration
-- Phase-2: Multi-Tenant Architecture with RBAC
-- =====================================================
-- Run this after existing schema.sql and crm-schema.sql
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. ORGANIZATIONS
-- Core multi-tenant entity
-- =====================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL CHECK (char_length(name) >= 2 AND char_length(name) <= 100),
  slug TEXT UNIQUE NOT NULL CHECK (slug ~ '^[a-z0-9-]+$' AND char_length(slug) >= 2),
  branding JSONB DEFAULT '{}', -- {logoUrl, primaryColor, secondaryColor}
  settings JSONB DEFAULT '{"twoFA": false, "currency": "EGP"}',
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_organizations_owner ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

COMMENT ON TABLE public.organizations IS 'Multi-tenant organizations - each represents a brokerage company';
COMMENT ON COLUMN public.organizations.branding IS 'Custom branding: {logoUrl: string, primaryColor: string, secondaryColor: string}';
COMMENT ON COLUMN public.organizations.settings IS 'Org settings: {twoFA: boolean, currency: string, timezone: string}';

-- =====================================================
-- 2. MEMBERSHIPS
-- User-to-Organization mapping with roles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('OWNER', 'ADMIN', 'TEAM_LEADER', 'ACCOUNTANT', 'AGENT')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(org_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_memberships_org ON public.memberships(org_id);
CREATE INDEX IF NOT EXISTS idx_memberships_user ON public.memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_memberships_org_role ON public.memberships(org_id, role);

COMMENT ON TABLE public.memberships IS 'User memberships with role-based access control';
COMMENT ON COLUMN public.memberships.role IS 'OWNER: full control | ADMIN: org management | TEAM_LEADER: team management | ACCOUNTANT: finance read | AGENT: self read/write';

-- =====================================================
-- 3. BRANCHES
-- Physical office locations per organization
-- =====================================================
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  address TEXT,
  meta JSONB DEFAULT '{}', -- {phone, email, capacity, etc}
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branches_org ON public.branches(org_id);
CREATE INDEX IF NOT EXISTS idx_branches_active ON public.branches(org_id, is_active);

COMMENT ON TABLE public.branches IS 'Physical office branches per organization';

-- =====================================================
-- 4. TEAMS
-- Sales teams within branches
-- =====================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  team_leader_id UUID, -- FK set after sales_agents updated
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teams_org ON public.teams(org_id);
CREATE INDEX IF NOT EXISTS idx_teams_branch ON public.teams(branch_id);
CREATE INDEX IF NOT EXISTS idx_teams_leader ON public.teams(team_leader_id);

COMMENT ON TABLE public.teams IS 'Sales teams organized by branch';

-- =====================================================
-- 5. UPDATE SALES_AGENTS
-- Add multi-tenant columns
-- =====================================================
-- Add org_id, branch_id, team_id, user_ref
ALTER TABLE public.sales_agents 
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS user_ref UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Update team_leader_id to reference teams table instead (if not already)
ALTER TABLE public.sales_agents 
  DROP COLUMN IF EXISTS team_leader_id;

ALTER TABLE public.sales_agents
  ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_sales_agents_org ON public.sales_agents(org_id);
CREATE INDEX IF NOT EXISTS idx_sales_agents_branch ON public.sales_agents(branch_id);
CREATE INDEX IF NOT EXISTS idx_sales_agents_team ON public.sales_agents(team_id);
CREATE INDEX IF NOT EXISTS idx_sales_agents_user_ref ON public.sales_agents(user_ref);

COMMENT ON COLUMN public.sales_agents.org_id IS 'Parent organization';
COMMENT ON COLUMN public.sales_agents.branch_id IS 'Assigned branch';
COMMENT ON COLUMN public.sales_agents.team_id IS 'Assigned team';
COMMENT ON COLUMN public.sales_agents.user_ref IS 'Optional link to auth.users for agent login';

-- Add FK from teams.team_leader_id to sales_agents
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_teams_leader'
  ) THEN
    ALTER TABLE public.teams
      ADD CONSTRAINT fk_teams_leader 
      FOREIGN KEY (team_leader_id) 
      REFERENCES public.sales_agents(id) 
      ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- 6. UPDATE AGENT_KPI_SETTINGS
-- Add org_id for multi-tenant isolation
-- =====================================================
ALTER TABLE public.agent_kpi_settings
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_agent_kpi_settings_org ON public.agent_kpi_settings(org_id);

-- =====================================================
-- 7. UPDATE AGENT_DAILY_LOGS
-- Add org_id for multi-tenant isolation
-- =====================================================
ALTER TABLE public.agent_daily_logs
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_agent_daily_logs_org ON public.agent_daily_logs(org_id);
CREATE INDEX IF NOT EXISTS idx_agent_daily_logs_org_date ON public.agent_daily_logs(org_id, log_date);

-- =====================================================
-- 8. UPDATE AGENT_MONTHLY_SCORES
-- Add org_id for multi-tenant isolation
-- =====================================================
ALTER TABLE public.agent_monthly_scores
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_agent_monthly_scores_org ON public.agent_monthly_scores(org_id);

-- =====================================================
-- 9. UPDATE BREAK_EVEN_RECORDS
-- Add org_id for multi-tenant isolation
-- =====================================================
ALTER TABLE public.break_even_records
  ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_break_even_records_org ON public.break_even_records(org_id);

-- =====================================================
-- 10. ORG_FINANCE_SETTINGS
-- Organization-level financial configuration
-- =====================================================
CREATE TABLE IF NOT EXISTS public.org_finance_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL UNIQUE REFERENCES public.organizations(id) ON DELETE CASCADE,
  
  -- Per-seat costs (monthly)
  rent_per_seat NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (rent_per_seat >= 0),
  salary_per_seat NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (salary_per_seat >= 0),
  marketing_per_seat NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (marketing_per_seat >= 0),
  tl_share_per_seat NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (tl_share_per_seat >= 0),
  others_per_seat NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (others_per_seat >= 0),
  sim_per_seat NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (sim_per_seat >= 0),
  
  -- Owner/franchise
  owner_salary NUMERIC(12,2) NOT NULL DEFAULT 0 CHECK (owner_salary >= 0),
  
  -- Revenue rates
  gross_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0400 CHECK (gross_rate >= 0 AND gross_rate <= 1),
  
  -- Commission rates (per 1M EGP sales)
  agent_comm_per_1m NUMERIC(12,2) NOT NULL DEFAULT 5000 CHECK (agent_comm_per_1m >= 0),
  tl_comm_per_1m NUMERIC(12,2) NOT NULL DEFAULT 2500 CHECK (tl_comm_per_1m >= 0),
  
  -- Tax configuration
  taxes JSONB NOT NULL DEFAULT '{"withholding": 0.05, "vat": 0.14, "income_min": 0.07, "income_max": 0.12, "income_current": 0.10}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_finance_settings_org ON public.org_finance_settings(org_id);

COMMENT ON TABLE public.org_finance_settings IS 'Organization-level financial configuration for break-even analysis';
COMMENT ON COLUMN public.org_finance_settings.taxes IS 'Tax rates: {withholding, vat, income_min, income_max, income_current}';

-- =====================================================
-- 11. NOTIFICATIONS
-- In-app notification system
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- null = org-wide
  type TEXT NOT NULL CHECK (type IN ('MISSED_LOG', 'KPI_ALERT', 'TAX_REMINDER', 'SYSTEM', 'BREAK_EVEN_WARNING')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  payload JSONB DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  action_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_org_user ON public.notifications(org_id, user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(org_id, user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);

COMMENT ON TABLE public.notifications IS 'In-app notification system for alerts and reminders';
COMMENT ON COLUMN public.notifications.user_id IS 'Target user (null for org-wide notifications)';
COMMENT ON COLUMN public.notifications.payload IS 'Additional data: {agentId, metric, threshold, etc}';

-- =====================================================
-- 12. SYSTEM_LOGS
-- Immutable audit trail
-- =====================================================
CREATE TABLE IF NOT EXISTS public.system_logs (
  id BIGSERIAL PRIMARY KEY,
  org_id UUID NOT NULL,
  user_id UUID,
  action TEXT NOT NULL, -- e.g., 'AGENT_CREATED', 'KPI_UPDATED', 'SCENARIO_DELETED'
  entity TEXT, -- table/entity name
  entity_id TEXT,
  diff JSONB, -- {before, after}
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_logs_org_created ON public.system_logs(org_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user ON public.system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_entity ON public.system_logs(entity, entity_id);

COMMENT ON TABLE public.system_logs IS 'Immutable audit trail for all mutations (append-only)';
COMMENT ON COLUMN public.system_logs.diff IS 'Change diff: {before: {...}, after: {...}}';

-- =====================================================
-- 13. API_TOKENS
-- Organization API tokens for public API access
-- =====================================================
CREATE TABLE IF NOT EXISTS public.api_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  token_hash TEXT NOT NULL UNIQUE, -- store bcrypt hash
  scopes TEXT[] NOT NULL DEFAULT ARRAY['reports:read', 'performance:read', 'breakeven:read'],
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_api_tokens_org ON public.api_tokens(org_id);
CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON public.api_tokens(token_hash) WHERE is_active = TRUE;

COMMENT ON TABLE public.api_tokens IS 'API tokens for programmatic access to public API';
COMMENT ON COLUMN public.api_tokens.token_hash IS 'Bcrypt hash of the token (plain token shown only once at creation)';
COMMENT ON COLUMN public.api_tokens.scopes IS 'Allowed scopes: reports:read, performance:read, breakeven:read, agents:write, etc';

-- =====================================================
-- 14. ONBOARDING_STATE
-- Track onboarding progress
-- =====================================================
CREATE TABLE IF NOT EXISTS public.onboarding_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  current_step TEXT NOT NULL DEFAULT 'organization',
  completed_steps TEXT[] DEFAULT ARRAY[]::TEXT[],
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB DEFAULT '{}', -- draft data
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_state_user ON public.onboarding_state(user_id);

COMMENT ON TABLE public.onboarding_state IS 'Track first-time user onboarding progress';

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get user's organizations
CREATE OR REPLACE FUNCTION public.get_user_organizations(user_uuid UUID)
RETURNS TABLE (
  org_id UUID,
  org_name TEXT,
  org_slug TEXT,
  org_branding JSONB,
  user_role TEXT,
  joined_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.name,
    o.slug,
    o.branding,
    m.role,
    m.created_at
  FROM public.organizations o
  INNER JOIN public.memberships m ON m.org_id = o.id
  WHERE m.user_id = user_uuid
  ORDER BY m.created_at DESC;
END;
$$;

-- Function to check user permission in org
CREATE OR REPLACE FUNCTION public.user_has_org_permission(
  user_uuid UUID,
  org_uuid UUID,
  required_role TEXT DEFAULT NULL
)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT m.role INTO user_role
  FROM public.memberships m
  WHERE m.user_id = user_uuid AND m.org_id = org_uuid;
  
  IF user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  IF required_role IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Role hierarchy: OWNER > ADMIN > TEAM_LEADER > ACCOUNTANT > AGENT
  IF required_role = 'OWNER' THEN
    RETURN user_role = 'OWNER';
  ELSIF required_role = 'ADMIN' THEN
    RETURN user_role IN ('OWNER', 'ADMIN');
  ELSIF required_role = 'TEAM_LEADER' THEN
    RETURN user_role IN ('OWNER', 'ADMIN', 'TEAM_LEADER');
  ELSIF required_role = 'ACCOUNTANT' THEN
    RETURN user_role IN ('OWNER', 'ADMIN', 'ACCOUNTANT');
  ELSE
    RETURN user_role IN ('OWNER', 'ADMIN', 'TEAM_LEADER', 'ACCOUNTANT', 'AGENT');
  END IF;
END;
$$;

-- Function to get user role in org
CREATE OR REPLACE FUNCTION public.get_user_role_in_org(
  user_uuid UUID,
  org_uuid UUID
)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT m.role INTO user_role
  FROM public.memberships m
  WHERE m.user_id = user_uuid AND m.org_id = org_uuid;
  
  RETURN user_role;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_memberships_updated_at ON public.memberships;
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_branches_updated_at ON public.branches;
CREATE TRIGGER update_branches_updated_at BEFORE UPDATE ON public.branches
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON public.teams;
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_org_finance_settings_updated_at ON public.org_finance_settings;
CREATE TRIGGER update_org_finance_settings_updated_at BEFORE UPDATE ON public.org_finance_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_onboarding_state_updated_at ON public.onboarding_state;
CREATE TRIGGER update_onboarding_state_updated_at BEFORE UPDATE ON public.onboarding_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create owner membership on org creation
CREATE OR REPLACE FUNCTION public.create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.memberships (org_id, user_id, role)
  VALUES (NEW.id, NEW.owner_id, 'OWNER');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_organization_insert ON public.organizations;
CREATE TRIGGER after_organization_insert AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_owner_membership();

-- Auto-create finance settings on org creation
CREATE OR REPLACE FUNCTION public.create_org_finance_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.org_finance_settings (org_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_organization_insert_finance ON public.organizations;
CREATE TRIGGER after_organization_insert_finance AFTER INSERT ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.create_org_finance_settings();

-- =====================================================
-- MIGRATION NOTES
-- =====================================================
-- After running this migration:
-- 1. Run rls-v1_1.sql to enable RLS policies
-- 2. Update existing data to populate org_id columns
-- 3. Deploy new Edge Functions (generate_pdf_report, compute_insights)
-- 4. Update frontend to use new multi-tenant structure
-- =====================================================


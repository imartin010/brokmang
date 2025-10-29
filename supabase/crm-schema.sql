-- =====================================================
-- Sales Performance Module (CRM) - Database Schema
-- =====================================================
-- Timezone: Africa/Cairo
-- NOTE: leads_count is CONTEXT ONLY, NOT used in scoring
-- =====================================================

-- 1) Sales Agents Table
create table if not exists public.sales_agents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  team_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- RLS Policies for sales_agents
alter table public.sales_agents enable row level security;

create policy "agents_select_own" 
  on public.sales_agents for select 
  using (auth.uid() = user_id);

create policy "agents_insert_own" 
  on public.sales_agents for insert 
  with check (auth.uid() = user_id);

create policy "agents_update_own" 
  on public.sales_agents for update 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "agents_delete_own" 
  on public.sales_agents for delete 
  using (auth.uid() = user_id);

-- Index for performance
create index if not exists idx_sales_agents_user_id on public.sales_agents(user_id);
create index if not exists idx_sales_agents_active on public.sales_agents(is_active);

-- =====================================================

-- 2) KPI Settings Table (per user)
-- NOTE: No leads weight/target - leads excluded from scoring
create table if not exists public.agent_kpi_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Work hours
  workday_start time not null default '09:30',
  workday_end time not null default '18:30',
  
  -- Daily/Monthly targets
  target_calls_per_day int not null default 120,
  target_meetings_per_day int not null default 2,
  target_sales_per_month numeric not null default 2000000, -- EGP
  
  -- Weights (must sum to 100) - leads removed from scoring
  weight_attendance int not null default 25,
  weight_calls int not null default 25,
  weight_behavior int not null default 20, -- appearance + ethics
  weight_meetings int not null default 15,
  weight_sales int not null default 15,
  
  created_at timestamptz not null default now(),
  
  -- Ensure only one settings row per user
  unique(user_id),
  
  -- Constraint: weights must sum to 100
  constraint weights_sum_100 check (
    weight_attendance + weight_calls + weight_behavior + 
    weight_meetings + weight_sales = 100
  )
);

-- RLS Policies for agent_kpi_settings
alter table public.agent_kpi_settings enable row level security;

create policy "kpi_select_own" 
  on public.agent_kpi_settings for select 
  using (auth.uid() = user_id);

create policy "kpi_upsert_own" 
  on public.agent_kpi_settings for insert 
  with check (auth.uid() = user_id);

create policy "kpi_update_own" 
  on public.agent_kpi_settings for update 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "kpi_delete_own" 
  on public.agent_kpi_settings for delete 
  using (auth.uid() = user_id);

-- Index for performance
create index if not exists idx_agent_kpi_settings_user_id on public.agent_kpi_settings(user_id);

-- =====================================================

-- 3) Daily Logs Table
-- NOTE: leads_count is CONTEXT ONLY, NOT used in scoring
create table if not exists public.agent_daily_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.sales_agents(id) on delete cascade,
  log_date date not null,
  
  -- Attendance (null check_in & check_out = absent)
  check_in time,
  check_out time,
  
  -- Daily metrics
  calls_count int not null default 0,
  leads_count int not null default 0,        -- CONTEXT ONLY (NOT scored)
  meetings_count int not null default 0,
  sales_amount numeric not null default 0,   -- EGP (daily)
  
  -- Behavior scores (0..10 each)
  appearance_score int not null default 5,   -- 0..10
  ethics_score int not null default 5,       -- 0..10
  
  notes text,
  created_at timestamptz not null default now(),
  
  -- One log per agent per day
  unique(user_id, agent_id, log_date),
  
  -- Constraints
  constraint appearance_score_range check (appearance_score >= 0 and appearance_score <= 10),
  constraint ethics_score_range check (ethics_score >= 0 and ethics_score <= 10),
  constraint calls_count_positive check (calls_count >= 0),
  constraint leads_count_positive check (leads_count >= 0),
  constraint meetings_count_positive check (meetings_count >= 0),
  constraint sales_amount_positive check (sales_amount >= 0)
);

-- RLS Policies for agent_daily_logs
alter table public.agent_daily_logs enable row level security;

create policy "logs_select_own" 
  on public.agent_daily_logs for select 
  using (auth.uid() = user_id);

create policy "logs_insert_own" 
  on public.agent_daily_logs for insert 
  with check (auth.uid() = user_id);

create policy "logs_update_own" 
  on public.agent_daily_logs for update 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "logs_delete_own" 
  on public.agent_daily_logs for delete 
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_agent_daily_logs_user_id on public.agent_daily_logs(user_id);
create index if not exists idx_agent_daily_logs_agent_id on public.agent_daily_logs(agent_id);
create index if not exists idx_agent_daily_logs_date on public.agent_daily_logs(log_date);
create index if not exists idx_agent_daily_logs_agent_date on public.agent_daily_logs(agent_id, log_date);

-- =====================================================

-- 4) Monthly Scores Table (materialized results)
create table if not exists public.agent_monthly_scores (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  agent_id uuid not null references public.sales_agents(id) on delete cascade,
  year int not null,
  month int not null,
  score numeric not null,        -- 0..100 (final score)
  kpis jsonb not null,           -- breakdown with leads_info
  created_at timestamptz not null default now(),
  
  -- One score per agent per month
  unique(user_id, agent_id, year, month),
  
  -- Constraints
  constraint year_valid check (year >= 2020 and year <= 2100),
  constraint month_valid check (month >= 1 and month <= 12),
  constraint score_range check (score >= 0 and score <= 100)
);

-- RLS Policies for agent_monthly_scores
alter table public.agent_monthly_scores enable row level security;

create policy "monthly_select_own" 
  on public.agent_monthly_scores for select 
  using (auth.uid() = user_id);

create policy "monthly_upsert_own" 
  on public.agent_monthly_scores for insert 
  with check (auth.uid() = user_id);

create policy "monthly_update_own" 
  on public.agent_monthly_scores for update 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "monthly_delete_own" 
  on public.agent_monthly_scores for delete 
  using (auth.uid() = user_id);

-- Indexes for performance
create index if not exists idx_agent_monthly_scores_user_id on public.agent_monthly_scores(user_id);
create index if not exists idx_agent_monthly_scores_agent_id on public.agent_monthly_scores(agent_id);
create index if not exists idx_agent_monthly_scores_year_month on public.agent_monthly_scores(year, month);
create index if not exists idx_agent_monthly_scores_score on public.agent_monthly_scores(score desc);

-- =====================================================
-- Helper Functions
-- =====================================================

-- Function to get or create default KPI settings for a user
create or replace function get_user_kpi_settings(p_user_id uuid)
returns table (
  workday_start time,
  workday_end time,
  target_calls_per_day int,
  target_meetings_per_day int,
  target_sales_per_month numeric,
  weight_attendance int,
  weight_calls int,
  weight_behavior int,
  weight_meetings int,
  weight_sales int
) 
language plpgsql
security definer
as $$
begin
  -- Try to get existing settings
  return query
  select 
    s.workday_start,
    s.workday_end,
    s.target_calls_per_day,
    s.target_meetings_per_day,
    s.target_sales_per_month,
    s.weight_attendance,
    s.weight_calls,
    s.weight_behavior,
    s.weight_meetings,
    s.weight_sales
  from public.agent_kpi_settings s
  where s.user_id = p_user_id
  limit 1;
  
  -- If not found, return defaults
  if not found then
    return query
    select 
      '09:30'::time,
      '18:30'::time,
      120,
      2,
      2000000::numeric,
      25,
      25,
      20,
      15,
      15;
  end if;
end;
$$;

-- =====================================================
-- Data Validation
-- =====================================================

-- Ensure leads_count is always >= 0 (though it's not scored)
comment on column public.agent_daily_logs.leads_count is 
  'Context only - NOT used in scoring. For visibility/reporting purposes.';

-- Document the scoring weights
comment on column public.agent_kpi_settings.weight_attendance is 
  'Weight for attendance score (must sum to 100 with other weights)';
comment on column public.agent_kpi_settings.weight_calls is 
  'Weight for calls score (must sum to 100 with other weights)';
comment on column public.agent_kpi_settings.weight_behavior is 
  'Weight for behavior score: (appearance + ethics)/2 (must sum to 100 with other weights)';
comment on column public.agent_kpi_settings.weight_meetings is 
  'Weight for meetings score (must sum to 100 with other weights)';
comment on column public.agent_kpi_settings.weight_sales is 
  'Weight for sales score (must sum to 100 with other weights)';

-- =====================================================
-- End of CRM Schema
-- =====================================================


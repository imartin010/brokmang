export type Inputs = {
  agents: number;
  team_leaders: number;
  rent: number;
  salary: number;
  team_leader_share: number;
  others: number;
  marketing: number;
  sim: number;
  franchise_owner_salary: number;
  gross_rate: number; // 0.04
  agent_comm_per_1m: number; // 5000
  tl_comm_per_1m: number; // 2500
  withholding: number; // 0.05
  vat: number; // 0.14
  income_tax: number; // default 0.10 (7–12% allowed)
};

export type Results = {
  cost_per_seat: number;
  total_operating_cost: number;
  gross_per_1m: number;
  commissions_per_1m: number;
  taxes_per_1m: number;
  net_rev_per_1m: number;
  break_even_sales_egp: number;
  break_even_sales_million: number;
  steps: { label: string; value: number; note?: string }[];
};

export type BreakEvenRecord = {
  id: string;
  user_id: string;
  org_id?: string | null; // v1.1: multi-tenant
  inputs: Inputs;
  results: Results;
  created_at: string;
};

// =====================================================
// CRM / Sales Performance Types
// =====================================================

export type UserAccountType = 'ceo' | 'team_leader';

export type SalesAgent = {
  id: string;
  user_id: string;
  org_id?: string | null;     // v1.1: multi-tenant
  branch_id?: string | null;  // v1.1: branch assignment
  team_id?: string | null;    // v1.1: team assignment (replaces team_leader_id)
  user_ref?: string | null;   // v1.1: link to auth.users
  full_name: string;
  phone?: string | null;
  role: 'agent' | 'team_leader'; // 'AGENT' | 'TEAM_LEADER' in DB
  user_type?: UserAccountType | null; // v1.1: account type (ceo or team_leader)
  is_active: boolean;
  created_at: string;
  
  // v1.0 backward compatibility (deprecated - use team_id instead)
  // @deprecated Use team_id to reference teams table
  team_leader_id?: string | null;
};

export type KpiSettings = {
  id?: string;
  user_id?: string;
  workday_start: string;  // HH:MM format
  workday_end: string;    // HH:MM format
  target_calls_per_day: number;
  target_meetings_per_day: number;
  target_sales_per_month: number;  // EGP
  weight_attendance: number;  // Must sum to 100
  weight_calls: number;
  weight_behavior: number;    // appearance + ethics
  weight_meetings: number;
  weight_sales: number;
  created_at?: string;
};

export type DailyLog = {
  id?: string;
  user_id?: string;
  agent_id: string;
  log_date: string;  // YYYY-MM-DD
  check_in?: string | null;  // HH:MM
  check_out?: string | null; // HH:MM
  calls_count: number;
  leads_count: number;        // CONTEXT ONLY - not scored
  meetings_count: number;
  sales_amount: number;       // EGP
  appearance_score: number;   // 0..10
  ethics_score: number;       // 0..10
  notes?: string | null;
  created_at?: string;
};

export type MonthlyKPIs = {
  attendance_month: number;   // 0..100
  calls_month: number;        // 0..100
  behavior_month: number;     // 0..100
  meetings_month: number;     // 0..100
  sales_score: number;        // 0..100
  leads_info: {
    leads_days_active: number;  // Count of days with leads > 0
    leads_total: number;        // Sum of leads (NOT scored)
  };
};

export type MonthlyScore = {
  id: string;
  user_id: string;
  agent_id: string;
  year: number;
  month: number;
  score: number;      // 0..100 final score
  kpis: MonthlyKPIs;
  created_at: string;
};

export type AgentWithScore = SalesAgent & {
  score?: number;
  kpis?: MonthlyKPIs;
  rank?: number;
};

// =====================================================
// v1.1 Multi-Tenant & RBAC Types
// =====================================================

export type UserRole = 'OWNER' | 'ADMIN' | 'TEAM_LEADER' | 'ACCOUNTANT' | 'AGENT';

export type Organization = {
  id: string;
  name: string;
  slug: string;
  branding: {
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  };
  settings: {
    twoFA?: boolean;
    currency?: string;
    timezone?: string;
  };
  owner_id: string;
  created_at: string;
  updated_at: string;
};

export type Membership = {
  id: string;
  org_id: string;
  user_id: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
};

export type Branch = {
  id: string;
  org_id: string;
  name: string;
  address?: string | null;
  meta: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Team = {
  id: string;
  org_id: string;
  branch_id?: string | null;
  name: string;
  team_leader_id?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type OrgFinanceSettings = {
  id: string;
  org_id: string;
  rent_per_seat: number;
  salary_per_seat: number;
  marketing_per_seat: number;
  tl_share_per_seat: number;
  others_per_seat: number;
  sim_per_seat: number;
  owner_salary: number;
  gross_rate: number;
  agent_comm_per_1m: number;
  tl_comm_per_1m: number;
  taxes: {
    withholding: number;
    vat: number;
    income_min: number;
    income_max: number;
    income_current: number;
  };
  created_at: string;
  updated_at: string;
};

export type NotificationType = 
  | 'MISSED_LOG' 
  | 'KPI_ALERT' 
  | 'TAX_REMINDER' 
  | 'SYSTEM' 
  | 'BREAK_EVEN_WARNING';

export type Notification = {
  id: string;
  org_id: string;
  user_id?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  payload: Record<string, any>;
  is_read: boolean;
  action_url?: string | null;
  created_at: string;
};

export type SystemLog = {
  id: number;
  org_id: string;
  user_id?: string | null;
  action: string;
  entity?: string | null;
  entity_id?: string | null;
  diff?: {
    before?: any;
    after?: any;
  } | null;
  metadata?: Record<string, any>;
  ip_address?: string | null;
  user_agent?: string | null;
  created_at: string;
};

export type ApiToken = {
  id: string;
  org_id: string;
  name: string;
  token_hash: string;
  scopes: string[];
  last_used_at?: string | null;
  expires_at?: string | null;
  is_active: boolean;
  created_by?: string | null;
  created_at: string;
};

export type OnboardingState = {
  id: string;
  user_id: string;
  org_id?: string | null;
  current_step: string;
  completed_steps: string[];
  is_completed: boolean;
  data: Record<string, any>;
  created_at: string;
  updated_at: string;
};

// Onboarding wizard step data
export type OnboardingData = {
  organization?: {
    name: string;
    slug: string;
  };
  branches?: Array<{
    id?: string;
    name: string;
    address?: string;
  }>;
  teams?: Array<{
    id?: string;
    name: string;
    branch_id?: string;
  }>;
  agents?: Array<{
    id?: string;
    full_name: string;
    phone?: string;
    role: 'agent' | 'team_leader';
    team_id?: string;
  }>;
  kpiSettings?: Partial<KpiSettings>;
  financeSettings?: Partial<OrgFinanceSettings>;
};

// Extended types with relations
export type OrganizationWithMembership = Organization & {
  membership: Membership;
  member_count?: number;
};

export type TeamWithLeader = Team & {
  team_leader?: SalesAgent | null;
  agent_count?: number;
};

export type BranchWithTeams = Branch & {
  teams?: Team[];
  agent_count?: number;
};

// Report types
export type ReportTemplate = 'monthly_performance' | 'financial_summary' | 'team_report';

export type ReportRequest = {
  org_id: string;
  template: ReportTemplate;
  month: string; // YYYY-MM
  filters?: {
    branch_id?: string;
    team_id?: string;
    agent_ids?: string[];
  };
};

export type ReportMetadata = {
  id: string;
  org_id: string;
  template: ReportTemplate;
  month: string;
  file_url: string;
  generated_by: string;
  created_at: string;
};

// Insights types
export type InsightType = 
  | 'performance_drop' 
  | 'break_even_warning' 
  | 'top_performer' 
  | 'underperformer';

export type Insight = {
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-100
  reasons: string[];
  action_url?: string;
  data: Record<string, any>;
};

// API response types
export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
};


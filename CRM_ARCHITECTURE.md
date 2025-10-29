# Sales Performance Module - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js 15)                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐           │
│  │  /crm/sales   │  │  /crm/logs    │  │ /crm/settings │           │
│  │               │  │               │  │               │           │
│  │ Agent Mgmt    │  │ Daily Logging │  │ KPI Config    │           │
│  └───────┬───────┘  └───────┬───────┘  └───────┬───────┘           │
│          │                  │                  │                    │
│          └──────────────────┴──────────────────┘                    │
│                             │                                        │
│                   ┌─────────▼─────────┐                             │
│                   │   /crm/report     │                             │
│                   │                   │                             │
│                   │ Performance       │                             │
│                   │ Analytics         │                             │
│                   └─────────┬─────────┘                             │
│                             │                                        │
└─────────────────────────────┼─────────────────────────────────────┘
                              │
                              │ API Call
                              │
                    ┌─────────▼─────────┐
                    │  /api/crm/        │
                    │  calculate-scores │
                    │                   │
                    │  Next.js Route    │
                    └─────────┬─────────┘
                              │
                              │ HTTP POST
                              │
         ┌────────────────────▼────────────────────┐
         │      SUPABASE BACKEND                    │
         ├──────────────────────────────────────────┤
         │                                          │
         │  ┌────────────────────────────────────┐ │
         │  │   Edge Function                    │ │
         │  │   calculate_agent_scores           │ │
         │  │                                    │ │
         │  │   • Load KPI settings             │ │
         │  │   • Query daily logs              │ │
         │  │   • Calculate scores              │ │
         │  │   • Store results                 │ │
         │  └────────────┬───────────────────────┘ │
         │               │                          │
         │               │ Service Role             │
         │               │                          │
         │  ┌────────────▼───────────────────────┐ │
         │  │   PostgreSQL Database              │ │
         │  │                                    │ │
         │  │   ┌──────────────────────────────┐ │ │
         │  │   │  sales_agents                │ │ │
         │  │   │  - id, user_id, full_name... │ │ │
         │  │   └──────────────────────────────┘ │ │
         │  │                                    │ │
         │  │   ┌──────────────────────────────┐ │ │
         │  │   │  agent_kpi_settings          │ │ │
         │  │   │  - weights, targets...       │ │ │
         │  │   └──────────────────────────────┘ │ │
         │  │                                    │ │
         │  │   ┌──────────────────────────────┐ │ │
         │  │   │  agent_daily_logs            │ │ │
         │  │   │  - attendance, calls, leads..│ │ │
         │  │   └──────────────────────────────┘ │ │
         │  │                                    │ │
         │  │   ┌──────────────────────────────┐ │ │
         │  │   │  agent_monthly_scores        │ │ │
         │  │   │  - score, kpis (JSON)        │ │ │
         │  │   └──────────────────────────────┘ │ │
         │  │                                    │ │
         │  │   [All tables have RLS enabled]   │ │
         │  └────────────────────────────────────┘ │
         │                                          │
         └──────────────────────────────────────────┘
```

## Data Flow

### 1. Agent Management Flow
```
User → /crm/sales → Supabase Client → sales_agents table
                                        ↓
                                     [RLS Filter: user_id]
                                        ↓
                                     Display in UI
```

### 2. Daily Logging Flow
```
User → /crm/logs → Fill Form → Supabase Client
                                      ↓
                            agent_daily_logs table
                                      ↓
                         UPSERT (prevent duplicates)
                                      ↓
                         [RLS Filter: user_id]
                                      ↓
                            Success Message
```

### 3. Score Calculation Flow
```
User → /crm/report → Click "Calculate Scores"
                              ↓
                    /api/crm/calculate-scores
                              ↓
                    Verify Auth (Supabase)
                              ↓
                Edge Function (calculate_agent_scores)
                              ↓
        ┌───────────────────┬─┴─────────────────────┐
        ↓                   ↓                        ↓
Load Settings      Load Daily Logs          Get Active Agents
        ↓                   ↓                        ↓
        └───────────────────┴──────────────────────┘
                              ↓
                    Calculate KPIs:
                    • Attendance (avg)
                    • Calls (avg)
                    • Behavior (avg)
                    • Meetings (avg)
                    • Sales (sum)
                    • Leads (context, not scored)
                              ↓
                    Final Score = Σ(KPI × Weight)
                              ↓
                    UPSERT → agent_monthly_scores
                              ↓
                    Return results to frontend
                              ↓
                    Display leaderboard & charts
```

## Component Hierarchy

### Frontend Components
```
app/crm/
├── sales/page.tsx
│   ├── AgentFormDialog
│   └── AgentsTable
│
├── logs/page.tsx
│   └── DailyLogForm
│       ├── Select (agent)
│       ├── Input (date, times)
│       └── Tooltip (leads info)
│
├── settings/page.tsx
│   ├── Card (work hours)
│   ├── Card (targets)
│   └── Card (weights)
│       └── AlertCircle (validation)
│
└── report/page.tsx
    ├── KpiOverviewCards
    │   ├── Card (attendance)
    │   ├── Card (calls)
    │   ├── Card (behavior)
    │   ├── Card (meetings)
    │   ├── Card (sales)
    │   └── Card (leads context)
    ├── Leaderboard
    │   └── AgentWithScore[]
    └── Charts
        ├── BarChart (Recharts)
        └── RadarChart (Recharts)
```

## Database Schema Relationships

```
auth.users (Supabase Auth)
    │
    │ (1:N)
    ├─────────────────────────────────────┐
    │                                     │
    ↓                                     ↓
sales_agents                    agent_kpi_settings
    │                                     │
    │ (1:N)                               │ (1:1)
    ├─────────────┬───────────────────────┘
    │             │
    ↓             ↓
agent_daily_logs  agent_monthly_scores
    │                     │
    │ (N:1)              │ (N:1)
    └─────────────────────┘
```

### Relationship Details

```
users (1) ──< (N) sales_agents
  - One user has many agents

users (1) ──< (1) agent_kpi_settings
  - One user has one settings record

sales_agents (1) ──< (N) agent_daily_logs
  - One agent has many daily logs

sales_agents (1) ──< (N) agent_monthly_scores
  - One agent has many monthly scores (one per month)

users (1) ──< (N) agent_daily_logs
  - One user has many logs

users (1) ──< (N) agent_monthly_scores
  - One user has many scores
```

## Security Layers

```
┌─────────────────────────────────────────────┐
│         FRONTEND REQUEST                     │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│         SUPABASE AUTH                        │
│    • Verify JWT token                        │
│    • Extract user_id                         │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│         ROW LEVEL SECURITY (RLS)             │
│    • Filter: auth.uid() = user_id           │
│    • Applies to SELECT, INSERT, UPDATE       │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│         DATABASE CONSTRAINTS                 │
│    • Check constraints (scores 0-100, etc)  │
│    • Unique constraints (no duplicates)     │
│    • Foreign key constraints                │
└─────────────────────────────────────────────┘
```

## Edge Function Architecture

```
Edge Function: calculate_agent_scores
    │
    ├─ Input:
    │   • year: number
    │   • month: number
    │   • x-user-id: string (from header)
    │
    ├─ Process:
    │   ├─ Load user's KPI settings (or defaults)
    │   ├─ Get all active agents for user
    │   ├─ For each agent:
    │   │   ├─ Load all logs for the month
    │   │   ├─ Calculate daily scores:
    │   │   │   ├─ Attendance (check-in/out vs workday)
    │   │   │   ├─ Calls (count vs target)
    │   │   │   ├─ Behavior (appearance + ethics)
    │   │   │   ├─ Meetings (count vs target)
    │   │   │   └─ [Leads: tracked but NOT scored]
    │   │   ├─ Calculate monthly averages
    │   │   ├─ Calculate monthly sales score
    │   │   ├─ Apply weights
    │   │   └─ Final score = Σ(component × weight)
    │   └─ UPSERT results to agent_monthly_scores
    │
    └─ Output:
        • message: string
        • processed: number
        • results: Array<{ agent_id, score, kpis }>
```

## Scoring Algorithm Flowchart

```
START
  ↓
Load KPI Settings
  ↓
For each agent:
  ↓
  Load daily logs for month
  ↓
  ┌─────────────────────────────────────┐
  │  Calculate Daily Scores             │
  ├─────────────────────────────────────┤
  │                                     │
  │  Attendance:                        │
  │  ├─ No check-in/out? → 0           │
  │  └─ Else: 100 - (late+early)/10    │
  │                                     │
  │  Calls:                             │
  │  └─ min(100, calls/target × 100)   │
  │                                     │
  │  Behavior:                          │
  │  └─ (appearance + ethics)/2 × 10   │
  │                                     │
  │  Meetings:                          │
  │  └─ min(100, meetings/target × 100)│
  │                                     │
  └─────────────────────────────────────┘
  ↓
  Calculate Monthly Averages
  ├─ attendance_month = avg(attendance_daily)
  ├─ calls_month = avg(calls_daily)
  ├─ behavior_month = avg(behavior_daily)
  └─ meetings_month = avg(meetings_daily)
  ↓
  Calculate Monthly Sales
  └─ sales_score = min(100, sum(sales)/target × 100)
  ↓
  Track Leads (context only)
  ├─ leads_total = sum(leads_count)
  └─ leads_days_active = count(days with leads > 0)
  ↓
  Apply Weights
  └─ final_score = 
      attendance_month × w_att +
      calls_month × w_calls +
      behavior_month × w_behavior +
      meetings_month × w_meetings +
      sales_score × w_sales
  ↓
  Store in agent_monthly_scores
  ↓
END
```

## UI State Management

```
React State Flow:

/crm/sales
  ├─ agents: SalesAgent[]
  ├─ loading: boolean
  ├─ dialogOpen: boolean
  └─ selectedAgent: SalesAgent | null

/crm/logs
  ├─ agents: SalesAgent[]
  ├─ loading: boolean
  └─ formData: Partial<DailyLog>

/crm/settings
  ├─ loading: boolean
  ├─ saving: boolean
  ├─ settings: KpiSettings
  └─ totalWeight: number (computed)

/crm/report
  ├─ loading: boolean
  ├─ calculating: boolean
  ├─ year: number
  ├─ month: number
  ├─ agentsWithScores: AgentWithScore[]
  └─ aggregateKpis: MonthlyKPIs | null
```

## API Integration Points

```
Frontend ←→ Supabase Direct (RLS)
  • Create agent
  • Update agent
  • Delete agent
  • Create/update log (upsert)
  • Read KPI settings
  • Update KPI settings

Frontend ←→ Next.js API ←→ Edge Function
  • Calculate monthly scores
    (requires service role, bypasses RLS)
```

## Timezone Handling

```
User Input (Browser)
    ↓
  Convert to ISO 8601
    ↓
Store in PostgreSQL (UTC internally)
    ↓
Edge Function processes with Africa/Cairo TZ
    ↓
Display in UI (local browser TZ)
```

**Note**: All time comparisons happen server-side in Edge Function using Africa/Cairo timezone.

## Performance Considerations

### Database Indexes
```
sales_agents:
  - PRIMARY KEY (id)
  - INDEX (user_id)
  - INDEX (is_active)

agent_daily_logs:
  - PRIMARY KEY (id)
  - INDEX (user_id)
  - INDEX (agent_id)
  - INDEX (log_date)
  - COMPOSITE INDEX (agent_id, log_date)

agent_monthly_scores:
  - PRIMARY KEY (id)
  - INDEX (user_id)
  - INDEX (agent_id)
  - INDEX (year, month)
  - INDEX (score DESC) for leaderboard
```

### Query Optimization
- RLS policies use indexed columns (user_id)
- Composite index on (agent_id, log_date) for log queries
- Unique constraints prevent duplicate calculations
- Batch processing in Edge Function

### Caching Strategy
- No caching on scores (recalculated on demand)
- Agent list cached in React state
- Settings cached in React state
- Charts re-render on data change only

---

## Deployment Architecture

```
Production Environment:

┌────────────────────────────────────────────┐
│         VERCEL / NEXT.JS                    │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Static Pages                         │ │
│  │  (pre-rendered at build)             │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Server Components                    │ │
│  │  (rendered on request)               │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  API Routes                           │ │
│  │  /api/crm/calculate-scores           │ │
│  └──────────────────────────────────────┘ │
└────────────────┬───────────────────────────┘
                 │
                 │ HTTPS
                 │
┌────────────────▼───────────────────────────┐
│         SUPABASE                            │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  PostgreSQL Database                  │ │
│  │  (Managed, Auto-backup)              │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Edge Functions (Deno Deploy)        │ │
│  │  calculate_agent_scores              │ │
│  └──────────────────────────────────────┘ │
│                                            │
│  ┌──────────────────────────────────────┐ │
│  │  Auth Service                         │ │
│  │  (JWT, Session Management)           │ │
│  └──────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

**This architecture ensures**:
- ✅ Scalability (serverless)
- ✅ Security (RLS + Auth)
- ✅ Performance (indexes + optimizations)
- ✅ Maintainability (modular design)
- ✅ Multi-tenancy (user isolation)


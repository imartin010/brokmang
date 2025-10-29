# Sales Performance Module (CRM) - Documentation

## Overview

The Sales Performance Module is a comprehensive CRM system integrated into the Brokerage Management application. It enables users to manage sales agents, track daily performance metrics, and calculate monthly performance scores based on configurable KPIs.

**Important Note**: Leads count is tracked for context only and does NOT affect scoring calculations.

## Key Features

- ✅ **Agent Management**: Add, edit, and manage sales team members
- ✅ **Daily Logging**: Record attendance, calls, meetings, sales, and behavior metrics
- ✅ **KPI Configuration**: Customize targets and scoring weights
- ✅ **Monthly Scoring**: Automated calculation of performance scores (0-100)
- ✅ **Performance Reports**: Leaderboards, charts, and analytics
- ✅ **Data Export**: CSV export for external analysis
- ✅ **Multi-user Support**: Row-level security ensures data isolation
- ✅ **Dark/Light Mode**: Full theme support
- ✅ **Responsive Design**: Works on desktop and mobile devices

---

## Architecture

### Technology Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Backend**: Supabase (PostgreSQL + RLS + Edge Functions)
- **Timezone**: Africa/Cairo (Egyptian timezone)

### Database Schema

#### 1. `sales_agents` Table

Stores sales team members.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- full_name (text)
- phone (text, nullable)
- team_id (uuid, nullable)
- is_active (boolean, default true)
- created_at (timestamptz)
```

#### 2. `agent_kpi_settings` Table

Stores KPI configuration per user.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users, unique)
- workday_start (time, default '09:30')
- workday_end (time, default '18:30')
- target_calls_per_day (int, default 120)
- target_meetings_per_day (int, default 2)
- target_sales_per_month (numeric, default 2000000)
- weight_attendance (int, default 25)
- weight_calls (int, default 25)
- weight_behavior (int, default 20)
- weight_meetings (int, default 15)
- weight_sales (int, default 15)
- created_at (timestamptz)
```

**Constraint**: All weights must sum to exactly 100.

#### 3. `agent_daily_logs` Table

Stores daily performance logs.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- agent_id (uuid, foreign key to sales_agents)
- log_date (date)
- check_in (time, nullable)
- check_out (time, nullable)
- calls_count (int, default 0)
- leads_count (int, default 0) -- CONTEXT ONLY
- meetings_count (int, default 0)
- sales_amount (numeric, default 0)
- appearance_score (int, 0-10, default 5)
- ethics_score (int, 0-10, default 5)
- notes (text, nullable)
- created_at (timestamptz)
```

**Constraint**: Unique per (user_id, agent_id, log_date).

#### 4. `agent_monthly_scores` Table

Stores calculated monthly performance scores.

```sql
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- agent_id (uuid, foreign key to sales_agents)
- year (int)
- month (int, 1-12)
- score (numeric, 0-100)
- kpis (jsonb) -- contains breakdown
- created_at (timestamptz)
```

**Constraint**: Unique per (user_id, agent_id, year, month).

---

## Scoring Logic

### Important: Leads Are NOT Scored

**Leads count is recorded for reporting purposes only and does NOT contribute to the final score.**

### Five Scoring Components (Sum to 100)

#### 1. Attendance (Daily → Monthly Average)

```
late_minutes = max(0, check_in - workday_start)
early_minutes = max(0, workday_end - check_out)
attendance_daily = max(0, 100 - ((late + early) / 10))
attendance_month = avg(attendance_daily)
```

- If no check-in and no check-out: `attendance_daily = 0` (absent)
- Every 10 minutes late/early = -1 point

#### 2. Calls (Daily → Monthly Average)

```
calls_ratio = calls_count / target_calls_per_day
calls_daily = min(100, calls_ratio * 100)
calls_month = avg(calls_daily)
```

#### 3. Behavior (Daily → Monthly Average)

```
behavior_daily = ((appearance_score + ethics_score) / 2) * 10
behavior_month = avg(behavior_daily)
```

- Both appearance and ethics are scored 0-10
- Averaged and scaled to 0-100

#### 4. Meetings (Daily → Monthly Average)

```
meetings_ratio = meetings_count / target_meetings_per_day
meetings_daily = min(100, meetings_ratio * 100)
meetings_month = avg(meetings_daily)
```

#### 5. Sales (Monthly Total vs Target)

```
sales_sum_month = sum(sales_amount in month)
sales_ratio = sales_sum_month / target_sales_per_month
sales_score = min(100, sales_ratio * 100)
```

### Final Score Calculation

```
final_score = 
  (attendance_month * weight_attendance / 100) +
  (calls_month * weight_calls / 100) +
  (behavior_month * weight_behavior / 100) +
  (meetings_month * weight_meetings / 100) +
  (sales_score * weight_sales / 100)
```

**Note**: Leads are excluded from this calculation. They are stored in `kpis.leads_info` for context only.

---

## API Endpoints

### 1. Calculate Scores

**Endpoint**: `POST /api/crm/calculate-scores`

**Request Body**:
```json
{
  "year": 2025,
  "month": 10
}
```

**Response**:
```json
{
  "message": "Scores calculated successfully",
  "processed": 5,
  "results": [
    {
      "agent_id": "uuid",
      "score": 85.5,
      "kpis": {
        "attendance_month": 90,
        "calls_month": 85,
        "behavior_month": 95,
        "meetings_month": 80,
        "sales_score": 75,
        "leads_info": {
          "leads_days_active": 15,
          "leads_total": 120
        }
      }
    }
  ]
}
```

This endpoint calls the Supabase Edge Function `calculate_agent_scores`.

---

## User Interface Pages

### 1. `/crm/sales` - Agent Management

**Features**:
- View all agents in a sortable table
- Add new agents
- Edit existing agents
- Deactivate/delete agents
- See agent status (active/inactive)

**Fields**:
- Full Name (required)
- Phone (optional)
- Active status (checkbox)

### 2. `/crm/logs` - Daily Logs

**Features**:
- Select agent from dropdown
- Choose date
- Record attendance (check-in/out times)
- Log daily metrics (calls, leads, meetings, sales)
- Score behavior (appearance & ethics, 0-10 each)
- Add notes
- Upsert functionality (update if log exists for agent+date)

**Important**: Leads field has a tooltip: "معلومة سياقية فقط — لا تؤثر على السكور" (Context only - not scored)

### 3. `/crm/settings` - KPI Settings

**Features**:
- Configure work hours (start/end times)
- Set daily/monthly targets
- Adjust scoring weights
- Real-time weight sum validation (must = 100)
- Save settings per user

**Targets**:
- Calls per day
- Meetings per day
- Sales per month (EGP)

**Weights** (must sum to 100):
- Attendance
- Calls
- Behavior
- Meetings
- Sales

### 4. `/crm/report` - Performance Report

**Features**:
- Month/year selector
- Calculate scores button
- KPI overview cards (team averages)
- Leads context card (clearly labeled as "not scored")
- Performance leaderboard with rankings
- Bar chart: Top performers
- Radar chart: Team average KPIs
- Export to CSV

**Charts**:
- Bar chart shows top 10 agents by score
- Radar chart shows 5 KPI dimensions

---

## Setup Instructions

### 1. Database Setup

Run the SQL schema:

```bash
psql -U postgres -d your_database < supabase/crm-schema.sql
```

Or via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `supabase/crm-schema.sql`
3. Execute

### 2. Deploy Edge Function

```bash
supabase functions deploy calculate_agent_scores
```

Set environment variables in Supabase Dashboard:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your service role key (not anon key!)

### 3. Install Dependencies

If you added new packages (already included in existing project):

```bash
npm install
```

Required packages:
- `@radix-ui/react-dialog`
- `@radix-ui/react-select`
- `@radix-ui/react-tooltip`
- `recharts`
- `framer-motion`
- `lucide-react`

### 4. Environment Variables

Ensure `.env.local` contains:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. Run Development Server

```bash
npm run dev
```

Navigate to:
- `/crm/sales` - Manage agents
- `/crm/logs` - Add daily logs
- `/crm/settings` - Configure KPIs
- `/crm/report` - View performance reports

---

## Usage Workflow

### 1. Initial Setup

1. Go to `/crm/settings`
2. Configure work hours (default: 09:30 - 18:30)
3. Set targets for calls, meetings, and sales
4. Adjust scoring weights (ensure they sum to 100)
5. Save settings

### 2. Add Agents

1. Go to `/crm/sales`
2. Click "Add Agent"
3. Enter full name and phone (optional)
4. Save

### 3. Daily Logging

1. Go to `/crm/logs`
2. Select agent and date
3. Record check-in/out times
4. Log calls, leads (context only), meetings, and sales
5. Score appearance and ethics (0-10 each)
6. Add notes if needed
7. Save log

**Repeat for each agent daily**.

### 4. Calculate Monthly Scores

1. Go to `/crm/report`
2. Select year and month
3. Click "Calculate Scores"
4. Wait for confirmation
5. View leaderboard and charts

### 5. Export Data

1. On `/crm/report` page
2. Click "Export CSV"
3. CSV file downloads with all agent scores and KPIs

---

## Row-Level Security (RLS)

All tables have RLS policies ensuring:
- Users can only see/modify their own data
- Policies filter by `auth.uid() = user_id`
- Edge Function uses service role to bypass RLS (internal calculation)

**Security**: Multi-tenant safe. No user can access another user's agents or logs.

---

## Edge Cases & Validation

### Weights Validation
- Frontend validates that weights sum to exactly 100
- Database constraint prevents saving invalid weights
- If sum ≠ 100, red alert shown

### Absent Days
- If no check-in and no check-out: attendance = 0 for that day
- Still included in monthly average

### No Logs for Month
- If agent has no logs: score = 0, kpis all = 0
- Agent still appears in report with 0 score

### Leads Context
- Leads count is summed and stored in `kpis.leads_info`
- `leads_days_active` = count of days with leads > 0
- Clearly labeled in UI as "not scored"

### Weekends
- Currently all days are counted
- Future: Add option to exclude Fridays/Saturdays from averages

---

## Troubleshooting

### Issue: Scores not calculating

**Solution**:
1. Check if agents are marked as active
2. Ensure daily logs exist for the month
3. Verify KPI settings are saved
4. Check browser console for errors
5. Verify Edge Function is deployed

### Issue: Weights won't save

**Solution**:
- Ensure weights sum to exactly 100
- Check for typos or negative values
- Try resetting to defaults (25/25/20/15/15)

### Issue: Leads not showing in report

**Solution**:
- Leads are shown in separate "Leads Context" card
- Check that logs have `leads_count > 0`
- Verify month/year selection

### Issue: Charts not rendering

**Solution**:
1. Ensure at least one agent has scores
2. Calculate scores first
3. Check browser console for Recharts errors
4. Verify all KPIs are numeric values

---

## File Structure

```
/app
  /crm
    /sales/page.tsx          # Agent management
    /logs/page.tsx           # Daily logging
    /settings/page.tsx       # KPI configuration
    /report/page.tsx         # Performance reports
  /api
    /crm
      /calculate-scores/route.ts  # API route

/components
  /crm
    agent-form-dialog.tsx    # Agent form
    agents-table.tsx         # Agent table
    daily-log-form.tsx       # Log form
    leaderboard.tsx          # Leaderboard component
    kpi-overview-cards.tsx   # KPI cards
  /ui
    button.tsx, card.tsx, etc.  # shadcn components
  navbar.tsx                 # Updated with CRM links

/lib
  types.ts                   # TypeScript types (extended)

/supabase
  crm-schema.sql             # Database schema
  /functions
    /calculate_agent_scores
      index.ts               # Edge function
```

---

## Future Enhancements

### Possible Additions

1. **Team Management**: Group agents into teams
2. **Weekend Configuration**: Exclude specific days from averages
3. **Historical Trends**: Multi-month charts
4. **Goal Tracking**: Set and track quarterly/yearly goals
5. **Notifications**: Alerts for low performance
6. **PDF Export**: Generate PDF reports
7. **Agent Dashboard**: Personal performance view for agents
8. **Comments**: Manager feedback on logs
9. **Bulk Import**: CSV import for logs
10. **Advanced Analytics**: Predictive scoring, trends

---

## TypeScript Types Reference

```typescript
export type SalesAgent = {
  id: string;
  user_id: string;
  full_name: string;
  phone?: string | null;
  team_id?: string | null;
  is_active: boolean;
  created_at: string;
};

export type KpiSettings = {
  id?: string;
  user_id?: string;
  workday_start: string;
  workday_end: string;
  target_calls_per_day: number;
  target_meetings_per_day: number;
  target_sales_per_month: number;
  weight_attendance: number;
  weight_calls: number;
  weight_behavior: number;
  weight_meetings: number;
  weight_sales: number;
  created_at?: string;
};

export type DailyLog = {
  id?: string;
  user_id?: string;
  agent_id: string;
  log_date: string;
  check_in?: string | null;
  check_out?: string | null;
  calls_count: number;
  leads_count: number;        // CONTEXT ONLY
  meetings_count: number;
  sales_amount: number;
  appearance_score: number;   // 0-10
  ethics_score: number;       // 0-10
  notes?: string | null;
  created_at?: string;
};

export type MonthlyKPIs = {
  attendance_month: number;
  calls_month: number;
  behavior_month: number;
  meetings_month: number;
  sales_score: number;
  leads_info: {
    leads_days_active: number;
    leads_total: number;
  };
};

export type MonthlyScore = {
  id: string;
  user_id: string;
  agent_id: string;
  year: number;
  month: number;
  score: number;
  kpis: MonthlyKPIs;
  created_at: string;
};

export type AgentWithScore = SalesAgent & {
  score?: number;
  kpis?: MonthlyKPIs;
  rank?: number;
};
```

---

## Support & Maintenance

### Backup Strategy

- Supabase automatically backs up database
- Enable Point-in-Time Recovery for production
- Export CSV regularly for local backups

### Monitoring

- Check Edge Function logs in Supabase Dashboard
- Monitor API errors in Next.js logs
- Track user activity via Supabase Auth logs

### Updates

To update the scoring logic:
1. Modify Edge Function (`supabase/functions/calculate_agent_scores/index.ts`)
2. Redeploy: `supabase functions deploy calculate_agent_scores`
3. No frontend changes needed (scores automatically reflect new logic)

---

## License & Credits

This CRM module is part of the Brokerage Management application.

**Built with**:
- Next.js 15
- Supabase
- shadcn/ui
- Recharts
- Framer Motion

**Timezone**: Africa/Cairo (Egyptian Standard Time)

---

## Quick Reference Card

| Page | Purpose | Key Actions |
|------|---------|-------------|
| `/crm/sales` | Manage agents | Add, Edit, Delete |
| `/crm/logs` | Daily logging | Record metrics |
| `/crm/settings` | Configure KPIs | Set targets & weights |
| `/crm/report` | View reports | Calculate, Export |

**Scoring Formula**:
```
Score = Attendance×W₁ + Calls×W₂ + Behavior×W₃ + Meetings×W₄ + Sales×W₅
(where W₁+W₂+W₃+W₄+W₅ = 100)
```

**Remember**: Leads are NOT scored, only tracked for context!

---

## Contact & Support

For issues or questions:
1. Check this documentation
2. Review troubleshooting section
3. Check Supabase logs
4. Review browser console errors

**End of Documentation**


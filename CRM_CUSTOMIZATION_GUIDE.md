# CRM Module - Customization Guide

This guide helps you customize the Sales Performance Module to fit your specific needs.

---

## 🎨 Common Customizations

### 1. Change Default KPI Weights

**File**: `lib/types.ts` or `app/crm/settings/page.tsx`

**Current Defaults**:
```typescript
{
  weight_attendance: 25,
  weight_calls: 25,
  weight_behavior: 20,
  weight_meetings: 15,
  weight_sales: 15,
}
```

**To Change**:
1. Edit `app/crm/settings/page.tsx`
2. Update the `useState` initial values
3. Ensure new values sum to 100

**Example** - Prioritize Sales:
```typescript
weight_attendance: 15,
weight_calls: 20,
weight_behavior: 15,
weight_meetings: 10,
weight_sales: 40,  // Increased from 15
```

---

### 2. Adjust Daily Targets

**File**: `app/crm/settings/page.tsx`

**Current Defaults**:
```typescript
target_calls_per_day: 120,
target_meetings_per_day: 2,
target_sales_per_month: 2000000,
```

**To Change**:
Simply update in Settings page UI, or change defaults in code.

---

### 3. Change Work Hours

**File**: `app/crm/settings/page.tsx`

**Current Defaults**:
```typescript
workday_start: "09:30",
workday_end: "18:30",
```

**To Change**:
Update in Settings page UI.

---

### 4. Add New KPI Component

Want to add a 6th scoring component? Follow these steps:

#### Step 1: Update Database Schema

**File**: `supabase/crm-schema.sql`

Add new fields:
```sql
-- In agent_daily_logs table
ALTER TABLE agent_daily_logs 
ADD COLUMN new_metric_count int not null default 0;

-- In agent_kpi_settings table
ALTER TABLE agent_kpi_settings
ADD COLUMN target_new_metric_per_day int not null default 10,
ADD COLUMN weight_new_metric int not null default 0;
```

Update constraint:
```sql
-- Modify weights_sum_100 constraint
ALTER TABLE agent_kpi_settings
DROP CONSTRAINT weights_sum_100;

ALTER TABLE agent_kpi_settings
ADD CONSTRAINT weights_sum_100 CHECK (
  weight_attendance + weight_calls + weight_behavior + 
  weight_meetings + weight_sales + weight_new_metric = 100
);
```

#### Step 2: Update TypeScript Types

**File**: `lib/types.ts`

```typescript
export type KpiSettings = {
  // ... existing fields
  target_new_metric_per_day: number;
  weight_new_metric: number;
};

export type DailyLog = {
  // ... existing fields
  new_metric_count: number;
};

export type MonthlyKPIs = {
  // ... existing fields
  new_metric_month: number;
};
```

#### Step 3: Update Edge Function

**File**: `supabase/functions/calculate_agent_scores/index.ts`

Add calculation logic:
```typescript
function calculateNewMetricDaily(
  log: DailyLog,
  settings: KpiSettings
): number {
  const ratio = log.new_metric_count / settings.target_new_metric_per_day;
  return Math.min(100, ratio * 100);
}

// In calculateMonthlyKPIs function
let newMetricSum = 0;
logs.forEach((log) => {
  // ... existing calculations
  newMetricSum += calculateNewMetricDaily(log, settings);
});
const new_metric_month = newMetricSum / numDays;

// In final score calculation
const w_new_metric = settings.weight_new_metric / 100;
const finalScore =
  attendance_month * w_att +
  calls_month * w_calls +
  behavior_month * w_behavior +
  meetings_month * w_meetings +
  sales_score * w_sales +
  new_metric_month * w_new_metric;  // Add this
```

#### Step 4: Update Frontend Forms

**File**: `components/crm/daily-log-form.tsx`

Add input field:
```tsx
<div className="space-y-2">
  <Label htmlFor="new_metric_count">New Metric</Label>
  <Input
    type="number"
    id="new_metric_count"
    min="0"
    value={formData.new_metric_count}
    onChange={(e) =>
      setFormData({
        ...formData,
        new_metric_count: parseInt(e.target.value) || 0,
      })
    }
  />
</div>
```

**File**: `app/crm/settings/page.tsx`

Add target and weight fields similarly.

#### Step 5: Update Reports

**File**: `components/crm/kpi-overview-cards.tsx`

Add new card:
```tsx
{
  title: "New Metric",
  value: `${kpis.new_metric_month.toFixed(1)}%`,
  icon: YourIcon,
  color: "text-teal-600",
  bgColor: "bg-teal-100 dark:bg-teal-900/20",
}
```

---

### 5. Exclude Weekends from Calculations

**File**: `supabase/functions/calculate_agent_scores/index.ts`

Add weekend filtering:

```typescript
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 5 || day === 6; // Friday & Saturday in Egypt
}

// In calculateMonthlyKPIs function
const filteredLogs = logs.filter((log) => {
  const logDate = new Date(log.log_date);
  return !isWeekend(logDate);
});

// Use filteredLogs instead of logs for calculations
```

**Note**: You might also want to add a setting to configure weekend days per user.

---

### 6. Change Timezone

**Current**: Africa/Cairo

**To Change**: Update Edge Function

**File**: `supabase/functions/calculate_agent_scores/index.ts`

```typescript
// Change this constant
const CAIRO_TZ = "Africa/Cairo";
// To your timezone, e.g.:
const MY_TZ = "America/New_York";
```

Then use it in date calculations.

---

### 7. Add Team/Group Management

#### Step 1: Create Teams Table

```sql
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies similar to sales_agents
```

#### Step 2: Update sales_agents table

```sql
-- team_id field already exists, just need to add foreign key
ALTER TABLE sales_agents
ADD CONSTRAINT fk_team
FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL;
```

#### Step 3: Add Team Selection in UI

Add a teams management page and update agent form to include team dropdown.

---

### 8. Add Agent Performance History Chart

**File**: `app/crm/report/page.tsx`

Fetch multi-month data:
```typescript
const { data: historicalScores } = await supabase
  .from("agent_monthly_scores")
  .select("*")
  .eq("user_id", user.id)
  .eq("agent_id", selectedAgentId)
  .order("year", { ascending: true })
  .order("month", { ascending: true })
  .limit(12); // Last 12 months
```

Add LineChart:
```tsx
<LineChart data={historicalScores}>
  <XAxis dataKey="month" />
  <YAxis domain={[0, 100]} />
  <Line type="monotone" dataKey="score" stroke="#8884d8" />
</LineChart>
```

---

### 9. Add PDF Export

Install dependency:
```bash
npm install jspdf jspdf-autotable
```

**File**: `app/crm/report/page.tsx`

```typescript
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const handleExportPDF = () => {
  const doc = new jsPDF();
  
  doc.text("Sales Performance Report", 14, 15);
  doc.text(`Month: ${month}/${year}`, 14, 25);
  
  const tableData = agentsWithScores.map((agent) => [
    agent.full_name,
    agent.score?.toFixed(2) || "N/A",
    agent.kpis?.attendance_month.toFixed(2) || "N/A",
    agent.kpis?.calls_month.toFixed(2) || "N/A",
    // ... more columns
  ]);
  
  doc.autoTable({
    head: [["Name", "Score", "Attendance", "Calls", ...]],
    body: tableData,
    startY: 30,
  });
  
  doc.save(`sales-report-${year}-${month}.pdf`);
};
```

---

### 10. Add Email Notifications

Use Supabase Edge Functions to send emails:

**File**: `supabase/functions/send_report_email/index.ts`

```typescript
import { createClient } from "@supabase/supabase-js";

serve(async (req) => {
  // Fetch scores
  // Format email
  // Send via SendGrid/Mailgun/etc
  
  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${Deno.env.get("SENDGRID_API_KEY")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // email config
    }),
  });
  
  return new Response(JSON.stringify({ success: true }));
});
```

---

### 11. Customize Appearance Scores

Want different behavior metrics instead of Appearance + Ethics?

**Example**: Change to "Punctuality + Communication"

#### Step 1: Update Database

```sql
ALTER TABLE agent_daily_logs
RENAME COLUMN appearance_score TO punctuality_score;

ALTER TABLE agent_daily_logs
RENAME COLUMN ethics_score TO communication_score;
```

#### Step 2: Update Types

**File**: `lib/types.ts`

```typescript
export type DailyLog = {
  // ...
  punctuality_score: number;  // 0..10
  communication_score: number;  // 0..10
};
```

#### Step 3: Update Forms

**File**: `components/crm/daily-log-form.tsx`

Update labels and field names.

#### Step 4: Update Edge Function

The calculation logic stays the same (average of two scores × 10).

---

### 12. Add Bulk Import for Logs

**File**: `app/crm/logs/page.tsx`

Add CSV import functionality:

```typescript
const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = async (event) => {
    const csv = event.target?.result as string;
    const lines = csv.split("\n");
    const logs = lines.slice(1).map((line) => {
      const [agent_id, log_date, check_in, ...] = line.split(",");
      return { agent_id, log_date, check_in, ... };
    });
    
    // Batch insert
    const { error } = await supabase
      .from("agent_daily_logs")
      .insert(logs);
    
    if (error) console.error(error);
    else alert("Imported successfully!");
  };
  
  reader.readAsText(file);
};
```

---

### 13. Change Scoring Scale

Want 0-10 instead of 0-100?

#### Edge Function Changes

**File**: `supabase/functions/calculate_agent_scores/index.ts`

```typescript
// Change all scoring functions to return 0-10
function calculateAttendanceDaily(...): number {
  const score = max(0, 100 - ((late + early) / 10));
  return score / 10;  // Scale to 0-10
}

// Update final score calculation
const finalScore = (
  attendance_month * w_att +
  calls_month * w_calls +
  // ...
) / 10;  // Scale final score to 0-10
```

#### Database Changes

```sql
ALTER TABLE agent_monthly_scores
DROP CONSTRAINT score_range;

ALTER TABLE agent_monthly_scores
ADD CONSTRAINT score_range CHECK (score >= 0 AND score <= 10);
```

---

### 14. Add Agent Comments/Feedback

#### Step 1: Create Comments Table

```sql
CREATE TABLE IF NOT EXISTS public.agent_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id uuid NOT NULL REFERENCES sales_agents(id) ON DELETE CASCADE,
  comment_date date NOT NULL,
  comment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS policies
```

#### Step 2: Add Comment Form

Create a new component to add/view comments per agent.

---

### 15. Add Real-time Updates

Use Supabase Realtime to see changes instantly:

**File**: `app/crm/sales/page.tsx`

```typescript
useEffect(() => {
  const channel = supabase
    .channel("sales_agents_changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "sales_agents",
        filter: `user_id=eq.${user.id}`,
      },
      (payload) => {
        console.log("Change detected:", payload);
        loadAgents(); // Refresh list
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## 🚨 Important Notes

### Before Customizing

1. **Backup**: Always backup your database before schema changes
2. **Test Locally**: Test changes in development first
3. **Version Control**: Commit working code before major changes
4. **Documentation**: Update docs after customizations

### Database Migrations

For production, use Supabase migrations:

```bash
supabase migration new add_new_feature
# Edit the generated SQL file
supabase db push
```

### Edge Function Updates

After changing Edge Function:

```bash
supabase functions deploy calculate_agent_scores
```

### Type Safety

Always update TypeScript types when changing database schema to maintain type safety.

---

## 📞 Getting Help with Customizations

1. Check Supabase docs: https://supabase.com/docs
2. Check Next.js docs: https://nextjs.org/docs
3. Check Recharts docs: https://recharts.org
4. Review existing code in this module

---

## 🎯 Example Customization: Change to Weekly Scoring

Full example of changing monthly to weekly scoring:

### 1. Database Changes

```sql
-- Rename table
ALTER TABLE agent_monthly_scores 
RENAME TO agent_weekly_scores;

-- Update columns
ALTER TABLE agent_weekly_scores
DROP COLUMN year,
DROP COLUMN month;

ALTER TABLE agent_weekly_scores
ADD COLUMN week_start date NOT NULL,
ADD COLUMN week_end date NOT NULL;

-- Update unique constraint
ALTER TABLE agent_weekly_scores
DROP CONSTRAINT agent_monthly_scores_user_id_agent_id_year_month_key;

ALTER TABLE agent_weekly_scores
ADD CONSTRAINT agent_weekly_scores_unique
UNIQUE (user_id, agent_id, week_start);
```

### 2. Edge Function Changes

Update to query by week instead of month:

```typescript
// Calculate week start/end dates
const weekStart = new Date(year, 0, (week - 1) * 7 + 1);
const weekEnd = new Date(weekStart);
weekEnd.setDate(weekEnd.getDate() + 6);

// Query logs for week
const { data: logs } = await supabase
  .from("agent_daily_logs")
  .select("*")
  .eq("agent_id", agent.id)
  .gte("log_date", weekStart.toISOString().split("T")[0])
  .lte("log_date", weekEnd.toISOString().split("T")[0]);
```

### 3. Frontend Changes

Update all references from "month" to "week" in UI components.

---

**Happy Customizing!** 🎨

Remember: The CRM module is built to be flexible. Most customizations involve similar patterns of:
1. Update database schema
2. Update types
3. Update Edge Function
4. Update UI

Refer to existing code for patterns and examples.


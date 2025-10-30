# 🔔 Notification Triggers Setup Guide

## Overview

This sets up **automatic notifications** for key events in your Brokmang platform. Once enabled, notifications will automatically appear in the NotificationCenter when things happen.

---

## 🚀 Quick Setup (1 minute)

1. **Open Supabase Dashboard**: https://supabase.com/dashboard/project/eamywkblubazqmepaxmm
2. **Go to SQL Editor** → New Query
3. **Copy** entire `supabase/notification-triggers.sql` file
4. **Paste** and **Run** (Cmd+Enter)

You should see: `Success. No rows returned` ✅

---

## 🔔 Automatic Notifications

Once active, notifications are created automatically for:

### 1. **New Agent Onboarded** 🎉
- **Who gets notified**: Org Owners & Admins
- **When**: A new agent is added to the organization
- **Message**: "🎉 New Agent Onboarded - [Agent Name] has been added to [Org Name]"

### 2. **Monthly Scores Calculated** 📊
- **Who gets notified**: The agent themselves
- **When**: Monthly KPI scores are calculated
- **Message**: "📊 Monthly Score Available - Your performance score for [Month] is [Score]%"

### 3. **Low Performance Alert** ⚠️
- **Who gets notified**: Owners, Admins, Team Leaders
- **When**: Agent score falls below 60%
- **Message**: "⚠️ Low Performance Alert - [Agent] scored [Score]% in [Month]"

### 4. **New Team Member Added** 👥
- **Who gets notified**: 
  - The new member (welcome message)
  - Org Owners & Admins
- **When**: Someone joins the organization
- **Message**: "👋 Welcome to [Org]!" or "👥 New Team Member - [Email] joined as [Role]"

### 5. **KPI Settings Changed** ⚙️
- **Who gets notified**: The user who owns the settings
- **When**: KPI targets are updated
- **Message**: "⚙️ KPI Settings Updated - Your KPI targets have been updated: [Changes]"

### 6. **Break-Even Analysis Saved** 📄
- **Who gets notified**: Org Owners, Admins, Accountants
- **When**: A break-even record is saved
- **Message**: "📄 New Break-Even Analysis - [User] saved '[Title]'"

### 7. **Team Created** 🎯
- **Who gets notified**: Org Owners & Admins
- **When**: A new team is created
- **Message**: "🎯 New Team Created - Team '[Name]' created in [Branch] led by [Leader]"

---

## 🧪 Test It Out

### Test 1: Add a new agent
```typescript
// In your app or via SQL Editor
INSERT INTO sales_agents (org_id, user_id, name, role, is_active)
VALUES (
  '[your-org-id]',
  '[your-user-id]',
  'Test Agent',
  'agent',
  true
);
```
**Expected**: Notification appears in NotificationCenter for admins/owners

### Test 2: Trigger a low-performance alert
```sql
-- Create a low score for an agent
INSERT INTO agent_monthly_scores (org_id, user_id, agent_id, year, month, score, kpis)
VALUES (
  '[your-org-id]',
  '[agent-user-id]',
  '[agent-id]',
  2024,
  11,
  45.5, -- Below 60%
  '{}'::jsonb
);
```
**Expected**: 
- Agent gets: "📊 Monthly Score Available"
- Leaders get: "⚠️ Low Performance Alert"

---

## 🔧 Technical Details

### Helper Function
`create_notification()` - Central function for creating notifications with proper metadata

### Trigger Functions
- `notify_agent_onboarded()` - Fires on INSERT to `sales_agents`
- `notify_monthly_scores()` - Fires on INSERT/UPDATE to `agent_monthly_scores`
- `notify_member_added()` - Fires on INSERT to `memberships`
- `notify_kpi_settings_changed()` - Fires on UPDATE to `agent_kpi_settings`
- `notify_breakeven_saved()` - Fires on INSERT to `break_even_records`
- `notify_team_created()` - Fires on INSERT to `teams`

### Security
All functions use `SECURITY DEFINER` to bypass RLS when creating notifications (required for cross-user notifications).

---

## 📝 Customization

Want to add more triggers? Follow this pattern:

```sql
CREATE OR REPLACE FUNCTION notify_your_event() RETURNS TRIGGER AS $$
BEGIN
  PERFORM create_notification(
    NEW.org_id,           -- Organization ID
    target_user_id,       -- Who to notify
    'event_type',         -- Type: 'info', 'warning', 'success', 'error', or custom
    '🎯 Notification Title',
    'Your message here',
    '/action-url',        -- Optional: where to go when clicked
    '{}'::jsonb           -- Optional: metadata
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS your_trigger_name ON your_table;
CREATE TRIGGER your_trigger_name
  AFTER INSERT ON your_table
  FOR EACH ROW
  EXECUTE FUNCTION notify_your_event();
```

---

## ✅ Verification

After running the script, verify triggers are active:

```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_notify%'
ORDER BY event_object_table, trigger_name;
```

You should see 7 triggers listed!

---

## 🎉 All Done!

Notifications will now automatically appear for your users in real-time. The NotificationCenter component in your navbar will display them with badges and mark-as-read functionality.


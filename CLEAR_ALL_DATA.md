# Clear All Data - Fresh Start Guide

This guide helps you remove all dummy/test data from your database to start fresh.

## 🗑️ What Will Be Deleted

The cleanup script will delete **ALL** data from these tables:
- ✅ Sales Agents (`sales_agents`)
- ✅ Agent Daily Logs (`agent_daily_logs`)
- ✅ Agent Monthly Scores (`agent_monthly_scores`)
- ✅ KPI Settings (`agent_kpi_settings`)
- ✅ Notifications (`notifications`)
- ✅ System Logs (`system_logs`)
- ✅ Teams (`teams`) - if table exists
- ✅ Branches (`branches`) - if table exists
- ✅ Organizations (`organizations`) - if table exists

## 🔒 What Will Be Preserved

The following will **NOT** be deleted:
- ✅ Users (`auth.users`)
- ✅ User Profiles (`user_profiles`)
- ✅ Subscriptions (`subscriptions`)

## 📝 How to Run the Cleanup

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/clear-all-data-simple.sql`
4. Paste into the SQL Editor
5. Click **Run** or press `Cmd/Ctrl + Enter`
6. Verify the results - all counts should be `0` except `user_profiles` and `subscriptions`

### Option 2: Using Command Line

```bash
# If you have Supabase CLI installed
supabase db reset --linked
# OR
psql $DATABASE_URL -f supabase/clear-all-data-simple.sql
```

## ✅ Verification

After running the cleanup, verify that data is cleared:

```sql
-- Check counts (should all be 0 except user_profiles and subscriptions)
SELECT 
  'sales_agents' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.sales_agents
UNION ALL
SELECT 
  'agent_daily_logs' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.agent_daily_logs
UNION ALL
SELECT 
  'agent_monthly_scores' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.agent_monthly_scores
UNION ALL
SELECT 
  'user_profiles' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.user_profiles
UNION ALL
SELECT 
  'subscriptions' as table_name,
  COUNT(*)::TEXT as remaining_count
FROM public.subscriptions;
```

Expected results:
- `sales_agents`: 0
- `agent_daily_logs`: 0
- `agent_monthly_scores`: 0
- `user_profiles`: 1 (your profile)
- `subscriptions`: 1 (your subscription)

## 🎯 After Cleanup

Once data is cleared, you can:
1. Add your first sales agent via `/crm/sales`
2. Create your first daily log via `/crm/logs`
3. Start tracking real performance data

## ⚠️ Important Notes

- This action is **IRREVERSIBLE** - make sure you want to delete all data
- Your user account and subscription will remain intact
- All dashboard components now load real data from the database (no more dummy data)
- The UI will show "No data yet" or "0" when there's no data

## 🚀 Next Steps

After clearing data:
1. Visit `/dashboard` - you'll see empty/zero stats
2. Visit `/crm/sales` - you'll see "Create Your First Team Leader" message
3. Start adding real data:
   - Add sales agents
   - Create daily logs
   - Track performance

The application is now ready for fresh testing! 🎉


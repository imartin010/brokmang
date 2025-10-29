# CRM Module - Quick Start Guide

Get your Sales Performance Module up and running in 5 minutes!

## Prerequisites

- Next.js app with Supabase already configured
- Node.js 18+ installed
- Supabase CLI installed (for Edge Function deployment)

## Step 1: Install Dependencies

Check if these packages are installed (they should be in existing project):

```bash
npm install @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tooltip recharts framer-motion lucide-react
```

## Step 2: Set Up Database

### Option A: Via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/crm-schema.sql`
4. Paste and execute

### Option B: Via Supabase CLI

```bash
supabase db push --file supabase/crm-schema.sql
```

## Step 3: Deploy Edge Function

```bash
cd supabase
supabase functions deploy calculate_agent_scores
```

Set environment variables in Supabase Dashboard → Functions → Environment Variables:
- `SUPABASE_URL`: Your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key (from Settings → API)

## Step 4: Verify Setup

1. Start your dev server:
```bash
npm run dev
```

2. Sign in to your app

3. Navigate to `/crm/sales` - you should see the agents page

## Step 5: First Time Setup

### A. Configure KPI Settings

1. Go to `/crm/settings`
2. Set your work hours (default: 09:30 - 18:30)
3. Configure targets:
   - Calls per day: 120
   - Meetings per day: 2
   - Sales per month: 2,000,000 EGP
4. Adjust weights (must sum to 100):
   - Attendance: 25%
   - Calls: 25%
   - Behavior: 20%
   - Meetings: 15%
   - Sales: 15%
5. Click "Save Settings"

### B. Add Your First Agent

1. Go to `/crm/sales`
2. Click "Add Agent"
3. Enter:
   - Full Name: "Ahmed Hassan"
   - Phone: "+20 123 456 7890"
   - ✅ Active Agent
4. Click "Create"

### C. Log Daily Performance

1. Go to `/crm/logs`
2. Select agent: "Ahmed Hassan"
3. Choose today's date
4. Fill in:
   - Check In: 09:30
   - Check Out: 18:00
   - Calls Made: 100
   - Leads: 15 (context only, not scored)
   - Meetings: 2
   - Sales: 150,000 EGP
   - Appearance Score: 8
   - Ethics Score: 9
5. Click "Save Log"

### D. Calculate Monthly Scores

1. Go to `/crm/report`
2. Select current year and month
3. Click "Calculate Scores"
4. View the leaderboard and charts!

## Verification Checklist

- [ ] Database tables created (4 tables)
- [ ] Edge Function deployed
- [ ] Can access `/crm/sales`
- [ ] Can add an agent
- [ ] Can log daily performance
- [ ] Can calculate scores
- [ ] Leaderboard displays correctly
- [ ] Export CSV works

## Common Issues

### "Failed to calculate scores"

**Fix**: Check Edge Function logs in Supabase Dashboard. Ensure environment variables are set.

### Weights won't save

**Fix**: Ensure all weights sum to exactly 100. Try: 25 + 25 + 20 + 15 + 15 = 100

### No agents showing

**Fix**: Make sure you're signed in and agents have your `user_id` (RLS policies require this).

### Charts not showing

**Fix**: Calculate scores first. Charts only appear when score data exists.

## Next Steps

1. **Add more agents**: Build your sales team
2. **Daily logging**: Make it a habit to log daily
3. **Weekly reviews**: Check reports every Friday
4. **Adjust weights**: Fine-tune based on your priorities
5. **Export data**: Download CSV for deeper analysis

## Default Values Reference

| Setting | Default Value |
|---------|--------------|
| Work Start | 09:30 |
| Work End | 18:30 |
| Calls Target/Day | 120 |
| Meetings Target/Day | 2 |
| Sales Target/Month | 2,000,000 EGP |
| Attendance Weight | 25% |
| Calls Weight | 25% |
| Behavior Weight | 20% |
| Meetings Weight | 15% |
| Sales Weight | 15% |

## Important Reminder

**Leads count is for context only and does NOT affect scoring!**

Look for the ℹ️ icon next to "Leads" for a tooltip reminder.

---

**You're all set! Start tracking your sales team's performance today.** 🚀

For detailed documentation, see `CRM_MODULE_DOCUMENTATION.md`.

